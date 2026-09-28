import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const installer = fileURLToPath(new URL('./install-shows-sync.py', import.meta.url));
const parsePlist = path => JSON.parse(spawnSync('python3', ['-c',
  'import json,plistlib,sys; print(json.dumps(plistlib.load(open(sys.argv[1],"rb"))))', path], { encoding: 'utf8' }).stdout);

test('installer preserves spaced Unicode paths and prepares an isolated five-minute job without loading it', () => {
  const home = realpathSync(mkdtempSync(join(tmpdir(), 'shows home 空间 ')));
  try {
    const source = join(home, '演出 档案.md');
    writeFileSync(source, 'private fixture content');
    const result = spawnSync('python3', [installer, '--home', home, '--source', source, '--node', process.execPath, '--no-load'], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const runtime = join(home, 'Library/Application Support/jiafeng-shows-sync');
    const plist = parsePlist(join(home, 'Library/LaunchAgents/com.jiafengbot.shows-sync.plist'));
    assert.equal(plist.StartInterval, 300);
    assert.equal(plist.RunAtLoad, true);
    assert.equal(plist.WorkingDirectory, runtime);
    assert.deepEqual(plist.ProgramArguments, [process.execPath, join(runtime, 'sync-shows.mjs'),
      '--source', source, '--state-dir', join(runtime, 'state'),
      '--repository', 'https://github.com/kokafang/jiafeng.live.git', '--settle-seconds', '30']);
    assert.equal(plist.EnvironmentVariables.GIT_TERMINAL_PROMPT, '0');
    assert.ok(plist.EnvironmentVariables.PATH.includes('/opt/homebrew/bin'));
    for (const name of ['sync-shows.mjs', 'shows-sync-source.mjs', 'import-shows.mjs']) {
      assert.equal(readFileSync(join(runtime, name), 'utf8'), readFileSync(new URL(`./${name}`, import.meta.url), 'utf8'));
    }
    assert.equal(existsSync(join(runtime, 'state/checkout')), false, 'installation must not clone or publish');
    assert.equal(readFileSync(source, 'utf8'), 'private fixture content');
    assert.doesNotMatch(result.stdout, /private fixture content/);
  } finally { rmSync(home, { recursive: true, force: true }); }
});

test('installer refuses an unowned runtime directory without overwriting its contents', () => {
  const home = realpathSync(mkdtempSync(join(tmpdir(), 'shows-installer-existing-')));
  try {
    const source = join(home, 'source.md');
    writeFileSync(source, 'source');
    const runtime = join(home, 'Library/Application Support/jiafeng-shows-sync');
    mkdirSync(runtime, { recursive: true });
    writeFileSync(join(runtime, 'sync-shows.mjs'), 'keep me');
    const result = spawnSync('python3', [installer, '--home', home, '--source', source, '--node', process.execPath, '--no-load'], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unowned/i);
    assert.equal(readFileSync(join(runtime, 'sync-shows.mjs'), 'utf8'), 'keep me');
  } finally { rmSync(home, { recursive: true, force: true }); }
});

test('installer refuses a same-label plist without its owned runtime', () => {
  const home = realpathSync(mkdtempSync(join(tmpdir(), 'shows-installer-collision-')));
  try {
    const source = join(home, 'source.md');
    writeFileSync(source, 'source');
    const plist = join(home, 'Library/LaunchAgents/com.jiafengbot.shows-sync.plist');
    mkdirSync(join(home, 'Library/LaunchAgents'), { recursive: true });
    writeFileSync(plist, 'existing unrelated configuration');
    const result = spawnSync('python3', [installer, '--home', home, '--source', source, '--node', process.execPath, '--no-load'], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unowned.*LaunchAgent/i);
    assert.equal(readFileSync(plist, 'utf8'), 'existing unrelated configuration');
  } finally { rmSync(home, { recursive: true, force: true }); }
});

test('preparation mode refuses the current home before writing runtime files', () => {
  const home = realpathSync(mkdtempSync(join(tmpdir(), 'shows-installer-prepare-')));
  try {
    const source = join(home, 'source.md');
    writeFileSync(source, 'source');
    // Supply a controlled current-home boundary; the installer still performs all real filesystem operations.
    const script = `import runpy, sys
from pathlib import Path
from unittest.mock import patch
installer, home, source = sys.argv[1:]
sys.argv = [installer, '--source', source, '--no-load']
with patch.object(Path, 'home', return_value=Path(home)):
    runpy.run_path(installer, run_name='__main__')`;
    const result = spawnSync('python3', ['-c', script, installer, home, source], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /alternate.*home/i);
    assert.equal(existsSync(join(home, 'Library/Application Support/jiafeng-shows-sync')), false);
  } finally { rmSync(home, { recursive: true, force: true }); }
});
