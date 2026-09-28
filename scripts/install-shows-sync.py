#!/usr/bin/env python3
"""Install the user's local Shows sync job without uploading the source archive."""

import argparse
import json
import os
from pathlib import Path
import plistlib
import shutil
import subprocess
import sys
import tempfile

LABEL = 'com.jiafengbot.shows-sync'
OWNER = 'jiafeng-shows-sync'
MODULES = ('sync-shows.mjs', 'shows-sync-source.mjs', 'import-shows.mjs')


def atomic_write(path, data, mode=0o600):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
        temporary = Path(handle.name)
        try:
            handle.write(data)
            handle.flush()
            os.fchmod(handle.fileno(), mode)
        except BaseException:
            temporary.unlink(missing_ok=True)
            raise
    os.replace(temporary, path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--home', type=Path, default=Path.home(), help='Alternate home for --no-load verification only')
    parser.add_argument('--source', type=Path)
    parser.add_argument('--repository', default='https://github.com/kokafang/jiafeng.live.git')
    parser.add_argument('--node', default=shutil.which('node'))
    parser.add_argument('--interval', type=int, default=300)
    parser.add_argument('--settle-seconds', type=int, default=30)
    parser.add_argument('--no-load', action='store_true', help='Prepare local files without registering or running the job')
    args = parser.parse_args()
    home = args.home.expanduser().resolve()
    if args.no_load and home == Path.home().resolve():
        parser.error('--no-load requires an alternate --home for isolated preparation')
    if not args.no_load and (sys.platform != 'darwin' or home != Path.home().resolve()):
        parser.error('Live installation requires macOS and the current user home')
    if args.interval < 60 or args.settle_seconds < 0:
        parser.error('interval must be at least 60 seconds; settle-seconds cannot be negative')
    source = (args.source or home / 'Documents/jiafeng-vault/🙋 me/自我介绍/高嘉丰演出 Archive（统一核对版）.md').expanduser().resolve()
    if not source.is_file():
        parser.error(f'Source archive does not exist: {source}')
    if not args.node or not Path(args.node).is_absolute() or not os.access(args.node, os.X_OK):
        parser.error('--node must identify an executable using an absolute path')
    runtime = home / 'Library/Application Support' / OWNER
    marker = runtime / 'installation.json'
    plist_path = home / 'Library/LaunchAgents' / f'{LABEL}.plist'
    owned = False
    if runtime.is_symlink() or marker.is_symlink():
        parser.error('Refusing an unowned or symlinked runtime directory')
    if runtime.exists():
        try:
            owned = json.loads(marker.read_text()).get('owner') == OWNER
        except (OSError, ValueError, AttributeError):
            owned = False
        if not owned:
            parser.error(f'Refusing to overwrite an unowned runtime directory: {runtime}')
    if plist_path.exists() or plist_path.is_symlink():
        try:
            previous = plistlib.loads(plist_path.read_bytes())
            previous_owned = owned and not plist_path.is_symlink() and previous.get('Label') == LABEL and \
                previous.get('ProgramArguments', [None, None])[1] == str(runtime / 'sync-shows.mjs') and \
                previous.get('WorkingDirectory') == str(runtime)
        except (OSError, ValueError, IndexError, AttributeError, plistlib.InvalidFileException):
            previous_owned = False
        if not previous_owned:
            parser.error(f'Refusing to overwrite an unowned LaunchAgent: {plist_path}')
    modules = {name: (Path(__file__).resolve().parent / name).read_bytes() for name in MODULES}
    service = f'gui/{os.getuid()}/{LABEL}'
    if not args.no_load:
        registered = subprocess.run(['/bin/launchctl', 'print', service], capture_output=True, text=True)
        if registered.returncode == 0:
            if not owned or str(runtime / 'sync-shows.mjs') not in registered.stdout:
                parser.error(f'Refusing to stop an unowned LaunchAgent: {service}')
            subprocess.run(['/bin/launchctl', 'bootout', service], check=True)
    runtime.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(runtime, 0o700)
    for name, content in modules.items():
        atomic_write(runtime / name, content)
    atomic_write(marker, (json.dumps({'owner': OWNER, 'version': 1}, indent=2) + '\n').encode())
    logs = home / 'Library/Logs'
    logs.mkdir(parents=True, exist_ok=True)
    configuration = {
        'Label': LABEL,
        'ProgramArguments': [args.node, str(runtime / 'sync-shows.mjs'),
                             '--source', str(source), '--state-dir', str(runtime / 'state'),
                             '--repository', args.repository, '--settle-seconds', str(args.settle_seconds)],
        'WorkingDirectory': str(runtime),
        'EnvironmentVariables': {'PATH': '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
                                 'GIT_TERMINAL_PROMPT': '0'},
        'RunAtLoad': True,
        'StartInterval': args.interval,
        'ProcessType': 'Background',
        'StandardOutPath': str(logs / 'jiafeng-shows-sync.log'),
        'StandardErrorPath': str(logs / 'jiafeng-shows-sync-error.log'),
    }
    atomic_write(plist_path, plistlib.dumps(configuration))
    if not args.no_load:
        subprocess.run(['/bin/launchctl', 'enable', service], check=True)
        subprocess.run(['/bin/launchctl', 'bootstrap', f'gui/{os.getuid()}', str(plist_path)], check=True)
    print(json.dumps({'installed': True, 'loaded': not args.no_load, 'intervalSeconds': args.interval,
                      'runtime': str(runtime), 'source': str(source), 'plist': str(plist_path)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
