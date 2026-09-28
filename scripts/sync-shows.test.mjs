import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm, realpath, symlink, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const header = '| 日期 | 城市 / 地点 | 活动 / 场地 | 形式 | 证据 |\n| --- | --- | --- | --- | --- |';
const archive = (extra = '') => `## 逐场档案\n${header}\n| 2020-01-02 | City | First | Live | [source][C1] · 活动公告 |\n## 未能定位到单日的线索\n## 未来行程（Upcoming）\n${header}\n${extra}\n## 来源索引\n[C1]: https://example.com/venue\n`;
const updated = archive('| 2026-10-03 | 上海 | New venue | Web DJ | 本人确认未来行程 |');
const firstShow = { id: 'show-2020-01-02-0', date: '2020-01-02', endDate: null, dateUncertain: false, year: 2020, location: 'City', event: 'First', performance: 'Live', status: 'listing', sources: [{label: 'C1', url: 'https://example.com/venue'}] };
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', timeout: 15_000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] }).trim();

async function fixture(t, { markdown = updated, smoke = "import test from 'node:test'; test('fixture smoke', () => {});", build = '' } = {}) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'shows-sync-test-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  const remote = join(root, 'remote.git');
  const userRepo = join(root, 'user-work');
  const source = join(root, 'archive.md');
  const stateDir = join(root, 'state');
  await mkdir(remote); await mkdir(userRepo);
  git(remote, 'init', '--bare', '--initial-branch=main');
  git(userRepo, 'init', '--initial-branch=main');
  git(userRepo, 'config', 'user.name', 'Fixture');
  git(userRepo, 'config', 'user.email', 'fixture@example.com');
  await mkdir(join(userRepo, 'src/content'), { recursive: true });
  await mkdir(join(userRepo, 'scripts'));
  await writeFile(join(userRepo, 'src/content/shows.json'), `${JSON.stringify([firstShow], null, 2)}\n`);
  await writeFile(join(userRepo, 'scripts/smoke.test.mjs'), smoke);
  await writeFile(join(userRepo, 'build.mjs'), build);
  await writeFile(join(userRepo, 'package.json'), JSON.stringify({ name: 'sync-fixture', private: true, type: 'module', scripts: { build: 'node build.mjs' } }));
  await writeFile(join(userRepo, 'README.md'), 'Fixture\n');
  git(userRepo, 'add', '.'); git(userRepo, 'commit', '-m', 'Fixture');
  git(userRepo, 'remote', 'add', 'origin', remote); git(userRepo, 'push', 'origin', 'main');
  await writeFile(source, markdown);
  const old = new Date(Date.now() - 60_000); await utimes(source, old, old);
  const initialHead = git(remote, 'rev-parse', 'main');
  const run = async (options = {}) => {
    const { runSync } = await import('./sync-shows.mjs');
    return runSync({ source, stateDir, repository: remote, settleSeconds: 0, ...options });
  };
  const status = async () => JSON.parse(await readFile(join(stateDir, 'status.json'), 'utf8'));
  return { root, remote, userRepo, source, stateDir, initialHead, run, status, head: () => git(remote, 'rev-parse', 'main') };
}

test('publishes exactly shows.json from a dedicated checkout and leaves dirty user files intact', async t => {
  const f = await fixture(t, { build: "import { writeFileSync } from 'node:fs'; writeFileSync('generated.tmp', 'build output');" });
  await writeFile(join(f.userRepo, 'README.md'), 'User work\n');
  await writeFile(join(f.userRepo, 'notes.txt'), 'Private user note\n');
  const dirty = git(f.userRepo, 'status', '--porcelain');
  const result = await f.run();
  assert.equal(result.outcome, 'published');
  assert.notEqual(f.head(), f.initialHead);
  assert.equal(git(f.remote, 'diff-tree', '--no-commit-id', '--name-only', '-r', 'main'), 'src/content/shows.json');
  assert.equal(git(f.remote, 'show', 'main:README.md'), 'Fixture');
  const rows = JSON.parse(git(f.remote, 'show', 'main:src/content/shows.json'));
  assert.equal(rows.length, 2); assert.equal(rows[0].event, 'New venue');
  assert.equal(rows[1].id, firstShow.id);
  assert.equal(git(f.userRepo, 'status', '--porcelain'), dirty);
  assert.equal(git(f.userRepo, 'rev-parse', 'HEAD'), f.initialHead);
  const status = await f.status();
  assert.match(status.syncedSourceHash, /^[a-f0-9]{64}$/);
  assert.equal(status.authenticationVerified, true);
  assert.equal(git(join(f.stateDir, 'checkout'), 'config', '--local', 'user.name'), 'kokafang');
});

test('an equivalent source verifies push access and repeated runs create no commits', async t => {
  const f = await fixture(t, { markdown: archive() });
  assert.equal((await f.run()).outcome, 'up-to-date');
  const first = await f.status();
  assert.equal(first.authenticationVerified, true);
  assert.match(first.syncedSourceHash, /^[a-f0-9]{64}$/);
  assert.equal((await f.run()).outcome, 'up-to-date');
  assert.equal(f.head(), f.initialHead);
  assert.equal((await f.status()).syncedSourceHash, first.syncedSourceHash);
});

test('dry runs validate and build but never commit, push, or mark the source synced', async t => {
  const f = await fixture(t);
  assert.equal((await f.run({ dryRun: true })).outcome, 'dry-run');
  assert.equal(f.head(), f.initialHead);
  assert.equal(git(join(f.stateDir, 'checkout'), 'rev-parse', 'HEAD'), f.initialHead);
  assert.equal((await f.status()).syncedSourceHash, undefined);
  assert.equal((await f.status()).authenticationVerified, undefined);
});

for (const [name, config] of [
  ['test failure', { smoke: "import test from 'node:test'; test('failure', () => { throw new Error('private test detail'); });" }],
  ['build failure', { build: "throw new Error('private build detail');" }],
  ['malformed archive', { markdown: 'SECRET incomplete source row' }],
]) {
  test(`${name} never advances the remote or exposes private details in status`, async t => {
    const f = await fixture(t, config);
    const result = await f.run();
    assert.equal(result.outcome, 'error');
    assert.equal(f.head(), f.initialHead);
    assert.equal((await f.status()).syncedSourceHash, undefined);
    assert.doesNotMatch(JSON.stringify(result), /SECRET|private .* detail/);
  });
}

test('a source that has not settled waits without publishing', async t => {
  const f = await fixture(t);
  await writeFile(f.source, updated);
  assert.equal((await f.run({ settleSeconds: 30 })).outcome, 'waiting');
  assert.equal(f.head(), f.initialHead);
  assert.equal((await f.status()).syncedSourceHash, undefined);
});

test('source edits during the build invalidate the snapshot before publishing', async t => {
  const f = await fixture(t);
  await writeFile(join(f.userRepo, 'build.mjs'), `import { appendFileSync } from 'node:fs'; appendFileSync(${JSON.stringify(f.source)}, '\\nPrivate note changed');`);
  git(f.userRepo, 'add', 'build.mjs'); git(f.userRepo, 'commit', '-m', 'Edit source during build'); git(f.userRepo, 'push', 'origin', 'main');
  const before = f.head();
  assert.equal((await f.run()).outcome, 'waiting');
  assert.equal(f.head(), before);
  assert.equal((await f.status()).syncedSourceHash, undefined);
});

test('a competing remote push is never overwritten and the next run regenerates on its new main', async t => {
  const f = await fixture(t);
  const once = join(f.root, 'competed');
  await writeFile(join(f.userRepo, 'build.mjs'), `import { existsSync, writeFileSync } from 'node:fs'; import { execFileSync } from 'node:child_process'; if (!existsSync(${JSON.stringify(once)})) { execFileSync('git', ['-C', ${JSON.stringify(f.userRepo)}, 'push', 'origin', 'main']); writeFileSync(${JSON.stringify(once)}, 'done'); }`);
  git(f.userRepo, 'add', 'build.mjs'); git(f.userRepo, 'commit', '-m', 'Race fixture'); git(f.userRepo, 'push', 'origin', 'main');
  await writeFile(join(f.userRepo, 'README.md'), 'Competing commit\n');
  git(f.userRepo, 'add', 'README.md'); git(f.userRepo, 'commit', '-m', 'Concurrent user commit');
  const competing = git(f.userRepo, 'rev-parse', 'HEAD');
  assert.equal((await f.run()).outcome, 'error');
  assert.equal(f.head(), competing);
  assert.equal((await f.status()).syncedSourceHash, undefined);
  assert.equal((await f.run()).outcome, 'published');
  assert.equal(git(f.remote, 'rev-parse', 'main^'), competing);
  assert.equal(git(f.remote, 'show', 'main:README.md'), 'Competing commit');
  assert.equal(git(f.remote, 'diff-tree', '--no-commit-id', '--name-only', '-r', 'main'), 'src/content/shows.json');
});

test('a check staging unrelated content aborts the entire publish', async t => {
  const f = await fixture(t, { build: "import { execFileSync } from 'node:child_process'; import { writeFileSync } from 'node:fs'; writeFileSync('README.md', 'Unrelated mutation'); execFileSync('git', ['add', 'README.md']);" });
  assert.equal((await f.run()).outcome, 'error');
  assert.equal(f.head(), f.initialHead);
});

test('overlapping runs wait and an abandoned process lock is recovered', async t => {
  const f = await fixture(t);
  await f.run({ dryRun: true });
  const lock = join(f.stateDir, 'lock');
  await mkdir(lock); await writeFile(join(lock, 'owner.json'), JSON.stringify({ pid: process.pid, token: 'live' }));
  assert.equal((await f.run()).outcome, 'waiting');
  assert.equal(f.head(), f.initialHead);
  await writeFile(join(lock, 'owner.json'), JSON.stringify({ pid: 2147483647, token: 'stale' }));
  assert.equal((await f.run()).outcome, 'published');
});

test('unsafe, unowned and symlinked directories never become runner checkouts', async t => {
  const f = await fixture(t);
  await mkdir(f.stateDir); await writeFile(join(f.stateDir, 'precious.txt'), 'Keep me');
  assert.equal((await f.run()).outcome, 'error');
  assert.equal(await readFile(join(f.stateDir, 'precious.txt'), 'utf8'), 'Keep me');
  assert.equal((await f.run({ stateDir: f.userRepo })).outcome, 'error');
  assert.equal(git(f.userRepo, 'rev-parse', 'HEAD'), f.initialHead);
  const linkedState = join(f.root, 'linked-state'); await symlink(f.userRepo, linkedState);
  assert.equal((await f.run({ stateDir: linkedState })).outcome, 'error');
  const linkedSource = join(f.root, 'linked-archive'); await symlink(f.source, linkedSource);
  assert.equal((await f.run({ source: linkedSource, stateDir: join(f.root, 'fresh-state') })).outcome, 'error');
  assert.equal(f.head(), f.initialHead);
});

test('hung checks have bounded execution and do not publish', async t => {
  const f = await fixture(t, { build: 'setInterval(() => {}, 1000);' });
  const started = Date.now();
  const result = await f.run({ commandTimeoutMs: 1000 });
  assert.equal(result.outcome, 'error');
  assert.ok(Date.now() - started < 10_000);
  assert.equal(f.head(), f.initialHead);
});

test('a build-created commit cannot smuggle an unrelated change into the push', async t => {
  const f = await fixture(t, { build: "import { execFileSync } from 'node:child_process'; import { writeFileSync } from 'node:fs'; writeFileSync('README.md', 'Unrelated commit'); execFileSync('git', ['add', 'README.md']); execFileSync('git', ['commit', '-m', 'Unexpected build commit']);" });
  const result = await f.run();
  assert.equal(result.outcome, 'error');
  assert.equal(result.reason, 'checkout-head-changed');
  assert.equal(f.head(), f.initialHead);
});

test('npm ci runs for a changed lock digest, caches a successful install, and reruns after the lock changes', async t => {
  const f = await fixture(t);
  const installs = join(f.root, 'installs');
  const pkg = JSON.parse(await readFile(join(f.userRepo, 'package.json'), 'utf8'));
  pkg.scripts.postinstall = 'node install.mjs';
  await writeFile(join(f.userRepo, 'package.json'), JSON.stringify(pkg));
  await writeFile(join(f.userRepo, 'install.mjs'), `import { appendFileSync } from 'node:fs'; appendFileSync(${JSON.stringify(installs)}, 'installed\\n');`);
  const lock = { name: 'sync-fixture', lockfileVersion: 3, requires: true, packages: { '': { name: 'sync-fixture', hasInstallScript: true } } };
  await writeFile(join(f.userRepo, 'package-lock.json'), JSON.stringify(lock));
  git(f.userRepo, 'add', '.'); git(f.userRepo, 'commit', '-m', 'Install fixture'); git(f.userRepo, 'push', 'origin', 'main');
  assert.equal((await f.run({ dryRun: true })).outcome, 'dry-run');
  assert.equal((await f.run({ dryRun: true })).outcome, 'dry-run');
  assert.equal(await readFile(installs, 'utf8'), 'installed\n');
  lock.version = '2.0.0';
  await writeFile(join(f.userRepo, 'package-lock.json'), JSON.stringify(lock));
  git(f.userRepo, 'add', 'package-lock.json'); git(f.userRepo, 'commit', '-m', 'New lock digest'); git(f.userRepo, 'push', 'origin', 'main');
  assert.equal((await f.run({ dryRun: true })).outcome, 'dry-run');
  assert.equal(await readFile(installs, 'utf8'), 'installed\ninstalled\n');
});

test('a no-change first real run requires a successful noninteractive push dry run', async t => {
  const f = await fixture(t, { markdown: archive() });
  assert.equal((await f.run({ dryRun: true })).outcome, 'dry-run');
  git(join(f.stateDir, 'checkout'), 'remote', 'set-url', '--push', 'origin', join(f.root, 'missing-remote.git'));
  const result = await f.run();
  assert.equal(result.outcome, 'error');
  assert.equal(result.reason, 'authentication-failed');
  assert.equal(result.authenticationVerified, undefined);
  assert.equal(result.syncedSourceHash, undefined);
  assert.equal(f.head(), f.initialHead);
});

test('two simultaneous stale-lock recoveries cannot publish the same snapshot twice', async t => {
  const f = await fixture(t);
  await f.run({ dryRun: true });
  const lock = join(f.stateDir, 'lock');
  await mkdir(lock); await writeFile(join(lock, 'owner.json'), JSON.stringify({ pid: 2147483647, token: 'stale' }));
  const results = await Promise.all([f.run(), f.run()]);
  assert.equal(results.filter(result => result.outcome === 'published').length, 1);
  assert.equal(results.filter(result => result.outcome === 'waiting').length, 1);
  assert.equal(git(f.remote, 'rev-list', '--count', `${f.initialHead}..main`), '1');
});

test('CLI uses absolute paths, isolates caller Git variables, and prints only a sanitized outcome', async t => {
  const f = await fixture(t);
  const output = execFileSync(process.execPath, [fileURLToPath(new URL('./sync-shows.mjs', import.meta.url)), '--source', f.source, '--state-dir', f.stateDir, '--repository', f.remote, '--settle-seconds', '0', '--dry-run'], {
    encoding: 'utf8', timeout: 15_000, env: { ...process.env, GIT_DIR: join(f.userRepo, '.git'), GIT_WORK_TREE: f.userRepo },
  });
  assert.match(output, /Shows sync: dry-run \(checks-passed\)/);
  assert.equal(f.head(), f.initialHead);
  assert.equal(git(f.userRepo, 'status', '--porcelain'), '');
});

test('a crash during lock reclamation fails closed for manual recovery', async t => {
  const f = await fixture(t);
  await f.run({ dryRun: true });
  const lock = join(f.stateDir, 'lock');
  await mkdir(lock);
  await writeFile(join(lock, 'owner.json'), JSON.stringify({ pid: 2147483647, token: 'stale' }));
  await writeFile(join(lock, 'recovering'), JSON.stringify({ pid: 2147483646, token: 'abandoned-recovery' }));
  const result = await f.run();
  assert.equal(result.outcome, 'error');
  assert.equal(result.reason, 'lock-recovery-required');
  assert.equal(f.head(), f.initialHead);
});
