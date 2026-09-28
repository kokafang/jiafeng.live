#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, parse, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { prepareShowsSync } from './shows-sync-source.mjs';

const PUBLIC_FILE = 'src/content/shows.json';
const OWNER_FILE = '.shows-sync-owned.json';
const SAFE_PATH = '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin';
const digest = value => createHash('sha256').update(value).digest('hex');
class SyncFailure extends Error { constructor(reason) { super(reason); this.reason = reason; } }
const fail = reason => { throw new SyncFailure(reason); };
const within = (parent, child) => child === parent || child.startsWith(`${parent}${sep}`);

async function exists(path) {
  try { return await lstat(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

// Reject symlinks all the way down, including a redirected parent directory.
async function noSymlinks(path, allowMissing = false) {
  const absolute = resolve(path);
  let current = parse(absolute).root;
  for (const part of absolute.slice(current.length).split(sep).filter(Boolean)) {
    current = join(current, part);
    const stat = await exists(current);
    if (!stat) { if (allowMissing) return; fail('missing-path'); }
    if (stat.isSymbolicLink()) fail('unsafe-path');
  }
}

async function atomicJson(path, value) {
  await noSymlinks(path, true);
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    await rename(temporary, path);
  } finally { await rm(temporary, { force: true }); }
}

async function readJson(path, fallback) {
  await noSymlinks(path, true);
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}

async function prepareState(stateDir, source, repository) {
  if (!isAbsolute(stateDir) || !isAbsolute(source) || !repository || repository.startsWith('-')) fail('invalid-arguments');
  stateDir = resolve(stateDir); source = resolve(source);
  if ([parse(stateDir).root, homedir(), process.cwd()].some(path => resolve(path) === stateDir)
      || within(stateDir, source) || stateDir.split(sep).filter(Boolean).length < 2) fail('unsafe-state-directory');
  await noSymlinks(stateDir, true);
  await mkdir(stateDir, { recursive: true, mode: 0o700 });
  const stat = await lstat(stateDir);
  if (!stat.isDirectory() || (stat.mode & 0o022) || (process.getuid && stat.uid !== process.getuid())) fail('unsafe-state-directory');
  const checkout = join(stateDir, 'checkout');
  const expected = { version: 1, repository, checkout };
  const marker = join(stateDir, OWNER_FILE);
  await noSymlinks(marker, true);
  if (!await exists(marker)) {
    if ((await readdir(stateDir)).length) fail('unowned-state-directory');
    try { await writeFile(marker, `${JSON.stringify(expected)}\n`, { flag: 'wx', mode: 0o600 }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  const actual = await readJson(marker);
  if (actual?.version !== expected.version || actual?.repository !== repository || actual?.checkout !== checkout) fail('ownership-mismatch');
  return { stateDir, checkout, source, marker };
}

async function acquireLock(stateDir) {
  const path = join(stateDir, 'lock');
  const token = randomUUID();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await mkdir(path, { mode: 0o700 });
      await writeFile(join(path, 'owner.json'), JSON.stringify({ pid: process.pid, token, createdAt: new Date().toISOString() }), { flag: 'wx', mode: 0o600 });
      return async () => {
        const owner = await readJson(join(path, 'owner.json'), null);
        if (owner?.token === token) await rm(path, { recursive: true });
      };
    } catch (error) { if (error.code !== 'EEXIST') throw error; }
    await noSymlinks(path);
    let owner;
    try { owner = await readJson(join(path, 'owner.json'), null); } catch { fail('unsafe-lock'); }
    if (Number.isInteger(owner?.pid) && owner.pid > 0) {
      try { process.kill(owner.pid, 0); return null; }
      catch (error) { if (error.code !== 'ESRCH') return null; }
    } else if (Date.now() - (await lstat(path)).mtimeMs < 30_000) {
      return null; // A new process may still be writing its ownership record.
    }
    // Only one contender may reap this directory. Reread ownership after claiming
    // the guard in case another contender already replaced the abandoned lock.
    const guard = join(path, 'recovering');
    try { await writeFile(guard, JSON.stringify({ pid: process.pid, token }), { flag: 'wx', mode: 0o600 }); }
    catch (error) {
      if (error.code === 'ENOENT') continue;
      if (error.code !== 'EEXIST') throw error;
      let reclaimer;
      try { reclaimer = await readJson(guard, null); }
      catch { if (Date.now() - (await lstat(guard)).mtimeMs < 30_000) return null; fail('lock-recovery-required'); }
      if (Number.isInteger(reclaimer?.pid) && reclaimer.pid > 0) {
        try { process.kill(reclaimer.pid, 0); return null; }
        catch (error) { if (error.code !== 'ESRCH') return null; }
      }
      // Reclaiming a crashed reclaimer would reintroduce the successor-lock race.
      // Leave this exceptionally interrupted reclamation for explicit maintenance.
      fail('lock-recovery-required');
    }
    const latest = await readJson(join(path, 'owner.json'), null);
    if (latest?.token !== owner?.token) {
      await rm(guard, { force: true });
      return null;
    }
    const abandoned = `${path}.stale-${randomUUID()}`;
    await rename(path, abandoned);
    await rm(abandoned, { recursive: true });
  }
  return null;
}

async function snapshot(source, settleSeconds) {
  await noSymlinks(source);
  const handle = await open(source, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    if (!before.isFile() || before.size > 8 * 1024 * 1024) fail('invalid-source-file');
    if (Date.now() - before.mtimeMs < settleSeconds * 1000) return null;
    const markdown = await handle.readFile('utf8');
    const after = await handle.stat();
    const current = await lstat(source);
    if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs
        || current.ino !== after.ino || current.dev !== after.dev || current.isSymbolicLink()) return null;
    return { markdown, hash: digest(markdown) };
  } finally { await handle.close(); }
}

function command(executable, args, { cwd, timeout, phase }) {
  return new Promise((resolvePromise, reject) => {
    const env = { ...process.env, PATH: `${dirname(process.execPath)}:${SAFE_PATH}`, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never', CI: '1' };
    // Each checked-out suite is a separate test run, including when this runner is tested.
    delete env.NODE_TEST_CONTEXT;
    // A caller's Git environment must not redirect commands into their working tree.
    for (const name of Object.keys(env)) if (/^GIT_(DIR|WORK_TREE|INDEX_FILE|COMMON_DIR|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|CONFIG|NAMESPACE|CEILING_DIRECTORIES)/.test(name)) delete env[name];
    const child = spawn(executable, args, { cwd, env, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'ignore'] });
    let stdout = ''; let timedOut = false; let overflow = false; let killTimer;
    const kill = signal => { try { process.platform === 'win32' ? child.kill(signal) : process.kill(-child.pid, signal); } catch {} };
    const timer = setTimeout(() => { timedOut = true; kill('SIGTERM'); killTimer = setTimeout(() => kill('SIGKILL'), 250); }, timeout);
    child.stdout.on('data', chunk => {
      if (stdout.length + chunk.length > 2 * 1024 * 1024) { overflow = true; kill('SIGKILL'); }
      else stdout += chunk;
    });
    child.on('error', () => { clearTimeout(timer); clearTimeout(killTimer); reject(new SyncFailure(`${phase}-failed`)); });
    child.on('close', code => {
      clearTimeout(timer);
      if (!timedOut) clearTimeout(killTimer);
      if (timedOut || overflow || code !== 0) reject(new SyncFailure(`${phase}-${timedOut ? 'timeout' : 'failed'}`));
      else resolvePromise(stdout.trim());
    });
  });
}

async function ownedCheckout(paths, repository, git) {
  const { stateDir, checkout, source } = paths;
  await prepareState(stateDir, source, repository);
  await noSymlinks(checkout, true);
  const metadata = join(checkout, '.git');
  if (await exists(checkout)) {
    await noSymlinks(metadata, true);
    const stat = await exists(metadata);
    if (stat && !stat.isDirectory()) fail('unsafe-checkout');
    if (!stat) {
      // A clone interrupted before .git was created is still inside our marked state.
      await rm(checkout, { recursive: true });
    }
  }
  if (!await exists(checkout)) await git(['clone', '--no-hardlinks', '--no-checkout', '--', repository, checkout], stateDir, 'clone');
  const top = await git(['rev-parse', '--show-toplevel']);
  if (await realpath(top) !== await realpath(checkout)) fail('unsafe-checkout');
  if (await git(['remote', 'get-url', 'origin']) !== repository) fail('repository-mismatch');
  await git(['config', '--local', 'user.name', 'kokafang']);
  await git(['config', '--local', 'user.email', 'kokafang@gmail.com']);
  await git(['config', '--local', 'commit.gpgsign', 'false']);
  await git(['config', '--local', 'core.hooksPath', '/dev/null']);
  await git(['config', '--local', 'push.followTags', 'false']);
  await git(['fetch', '--prune', 'origin', '+refs/heads/main:refs/remotes/origin/main'], checkout, 'fetch');
  await prepareState(stateDir, source, repository);
  await noSymlinks(metadata);
  await git(['reset', '--hard', 'refs/remotes/origin/main']);
  await git(['clean', '-ffd']);
}

/** One bounded synchronization attempt. Errors are deliberately sanitized: the source is private. */
export async function runSync({ source, stateDir, repository, settleSeconds = 30, dryRun = false, commandTimeoutMs } = {}) {
  let paths; let release; let previous = {};
  const finish = async (outcome, reason, additions = {}) => {
    const result = { version: 1, outcome, reason, updatedAt: new Date().toISOString(),
      ...(previous.syncedSourceHash ? { syncedSourceHash: previous.syncedSourceHash } : {}),
      ...(previous.lastSyncedAt ? { lastSyncedAt: previous.lastSyncedAt } : {}),
      ...(previous.authenticationVerified ? { authenticationVerified: true } : {}), ...additions };
    if (paths) await atomicJson(join(paths.stateDir, 'status.json'), result);
    return result;
  };
  try {
    if (typeof source !== 'string' || typeof stateDir !== 'string' || typeof repository !== 'string'
        || !Number.isFinite(settleSeconds) || settleSeconds < 0 || settleSeconds > 86400
        || (commandTimeoutMs !== undefined && (!Number.isFinite(commandTimeoutMs) || commandTimeoutMs <= 0))) fail('invalid-arguments');
    paths = await prepareState(stateDir, source, repository);
    previous = await readJson(join(paths.stateDir, 'status.json'), {});
    release = await acquireLock(paths.stateDir);
    if (!release) return await finish('waiting', 'another-run-active');
    const stable = await snapshot(paths.source, settleSeconds);
    if (!stable) return await finish('waiting', 'source-not-settled');
    const git = (args, cwd = paths.checkout, phase = 'git') => command('git', args, { cwd, phase, timeout: commandTimeoutMs ?? 120_000 });
    await ownedCheckout(paths, repository, git);
    const baseHead = await git(['rev-parse', 'HEAD']);
    const target = join(paths.checkout, PUBLIC_FILE);
    await noSymlinks(target);
    let prepared;
    try { prepared = prepareShowsSync(stable.markdown, JSON.parse(await readFile(target, 'utf8'))); }
    catch { fail('source-validation-failed'); }
    const stillCurrent = async () => {
      const current = await snapshot(paths.source, settleSeconds);
      return current?.hash === stable.hash;
    };
    const synced = () => ({ syncedSourceHash: stable.hash, lastSyncedAt: new Date().toISOString(), authenticationVerified: true });
    const verifyRemote = async () => {
      await git(['fetch', 'origin', '+refs/heads/main:refs/remotes/origin/main'], paths.checkout, 'remote-verification');
      try {
        const remoteShows = JSON.parse(await git(['show', `refs/remotes/origin/main:${PUBLIC_FILE}`]));
        return !prepareShowsSync(stable.markdown, remoteShows).changed;
      } catch { fail('remote-verification-failed'); }
    };
    if (!prepared.changed) {
      if (!await stillCurrent()) return await finish('waiting', 'source-changed');
      if (dryRun) return await finish('dry-run', 'no-public-change');
      if (!previous.authenticationVerified) await git(['push', '--dry-run', 'origin', 'HEAD:main'], paths.checkout, 'authentication');
      if (!await verifyRemote()) return await finish('waiting', 'remote-changed');
      if (!await stillCurrent()) return await finish('waiting', 'source-changed');
      return await finish('up-to-date', 'remote-equivalent', synced());
    }
    await writeFile(target, prepared.serialized);
    const packagePath = join(paths.checkout, 'package.json');
    await noSymlinks(packagePath);
    const pkg = JSON.parse(await readFile(packagePath, 'utf8'));
    const lockPath = join(paths.checkout, 'package-lock.json');
    await noSymlinks(lockPath, true);
    if (await exists(lockPath)) {
      const lockHash = digest(await readFile(lockPath));
      const installed = await readJson(join(paths.stateDir, 'dependencies.json'), {});
      const needsDependencies = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.optionalDependencies }).length > 0;
      if (installed.lockHash !== lockHash || (needsDependencies && !await exists(join(paths.checkout, 'node_modules')))) {
        await command('npm', ['ci', '--no-audit', '--no-fund'], { cwd: paths.checkout, timeout: commandTimeoutMs ?? 180_000, phase: 'install' });
        await atomicJson(join(paths.stateDir, 'dependencies.json'), { lockHash });
      }
    } else if (Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.optionalDependencies }).length) fail('dependency-lock-missing');
    const scripts = join(paths.checkout, 'scripts');
    await noSymlinks(scripts);
    const tests = (await readdir(scripts, { withFileTypes: true })).filter(entry => entry.isFile() && entry.name.endsWith('.test.mjs')).map(entry => `scripts/${entry.name}`).sort();
    if (!tests.length) fail('tests-missing');
    await command(process.execPath, ['--test', '--test-timeout=60000', ...tests], { cwd: paths.checkout, timeout: commandTimeoutMs ?? 120_000, phase: 'tests' });
    await command('npm', ['run', 'build'], { cwd: paths.checkout, timeout: commandTimeoutMs ?? 180_000, phase: 'build' });
    await noSymlinks(target);
    if (await readFile(target, 'utf8') !== prepared.serialized) fail('generated-data-changed');
    if (await git(['rev-parse', 'HEAD']) !== baseHead) fail('checkout-head-changed');
    if (!await stillCurrent()) return await finish('waiting', 'source-changed');
    if (dryRun) return await finish('dry-run', 'checks-passed');
    await git(['add', '--', PUBLIC_FILE]);
    const staged = (await git(['diff', '--cached', '--name-only', '-z'])).split('\0').filter(Boolean);
    if (staged.length !== 1 || staged[0] !== PUBLIC_FILE) fail('unexpected-staged-files');
    await git(['commit', '-m', 'chore: sync public shows archive'], paths.checkout, 'commit');
    if (!await stillCurrent()) return await finish('waiting', 'source-changed');
    await git(['push', 'origin', 'HEAD:main'], paths.checkout, 'push');
    if (!await verifyRemote()) fail('remote-verification-failed');
    return await finish('published', 'public-shows-updated', synced());
  } catch (error) {
    try { return await finish('error', error instanceof SyncFailure ? error.reason : 'sync-failed'); }
    catch { return { version: 1, outcome: 'error', reason: 'status-write-failed', updatedAt: new Date().toISOString() }; }
  } finally {
    if (release) await release().catch(() => {});
  }
}

function parseArguments(args) {
  const options = {};
  const names = { '--source': 'source', '--state-dir': 'stateDir', '--repository': 'repository', '--settle-seconds': 'settleSeconds' };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--dry-run') { if (options.dryRun) fail('invalid-arguments'); options.dryRun = true; continue; }
    if (!names[arg] || options[names[arg]] !== undefined || !args[index + 1] || args[index + 1].startsWith('--')) fail('invalid-arguments');
    options[names[arg]] = arg === '--settle-seconds' ? Number(args[++index]) : args[++index];
  }
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  let result;
  try { result = await runSync(parseArguments(process.argv.slice(2))); }
  catch { result = { outcome: 'error', reason: 'invalid-arguments' }; }
  console.log(`Shows sync: ${result.outcome} (${result.reason})`);
  if (result.outcome === 'error') process.exitCode = 1;
}
