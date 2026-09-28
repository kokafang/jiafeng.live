# Automatic Shows updates

The local background job checks the public performance archive every five minutes. After the note has been unchanged for at least 30 seconds, it exports public fields, validates the result, runs tests and a production build, then pushes only `src/content/shows.json` to the existing GitHub `main` branch. Vercel publishes the commit through the existing Git integration.

This Mac must be logged in, awake and online. The existing Obsidian headless sync must first receive edits made on another device. A sleeping/offline machine catches up on a later check. No paid scheduler or recurring model call is involved.

## Installation

From the website source directory:

```sh
npm run install:shows-sync
```

The default note is `$HOME/Documents/jiafeng-vault/🙋 me/自我介绍/高嘉丰演出 Archive（统一核对版）.md`. For a different location:

```sh
python3 scripts/install-shows-sync.py --source "/absolute/path/to/archive.md"
```

The installer copies the small runtime locally and registers `com.jiafengbot.shows-sync` in the current user's LaunchAgents. It does not rely on the NAS-mounted development directory being available. Re-run the installer after updating the runtime scripts. `--no-load --home /temporary/test-home` prepares an isolated verification copy without registering or starting the task; preparation mode refuses the real home.

## What is published

- Only the public dated archive and Upcoming table are exported; private notes, contacts, settlement details and the source Markdown are not uploaded.
- The task uses its own marked checkout under `~/Library/Application Support/jiafeng-shows-sync/state`, so unfinished website edits are not staged or published.
- Identical public content causes no commit or deployment. Changes to private evidence text only publish if they change a public status or source reference.
- Existing row IDs are retained where the date, location and event match. Historical insertions do not renumber the entire archive.
- New city/venue names may retain their source spelling until an editorial translation is added; automatic synchronization does not invent translations or performance facts.

## Validation and retry

Incomplete sections, malformed rows, unresolved source links, invalid dates/ranges, duplicate events, empty output or a decrease of more than 10% of rows stop publication. An intentional large cleanup should be reviewed and exported manually using the ordinary workflow in `shows-archive.md`.

The source is checked again before publication. Tests, build failures, a competing Git push or network failures leave the previously published website available. The task never force-pushes and retries on a later check. A successful Git push triggers Vercel; Vercel's deployment status remains the final authority on whether a new version is live.

An ordinary interrupted run's lock is recovered automatically. If another interruption occurs during that recovery itself, the task reports `lock-recovery-required` and stops publishing until maintenance; this prevents two processes from taking the same checkout. Pause the job using the commands below, use `pgrep -fl sync-shows.mjs` to confirm no runner remains (also stop any manually started runner), then move only the task's lock aside:

```sh
mv "$HOME/Library/Application Support/jiafeng-shows-sync/state/lock" \
   "$HOME/Library/Application Support/jiafeng-shows-sync/state/lock.manual-recovery-$(date +%Y%m%d-%H%M%S)"
```

Resume with `npm run install:shows-sync`. Keep the moved lock for diagnosis; the next run creates a fresh lock.

## Status and logs

```sh
cat "$HOME/Library/Application Support/jiafeng-shows-sync/state/status.json"
tail -n 30 "$HOME/Library/Logs/jiafeng-shows-sync.log"
tail -n 30 "$HOME/Library/Logs/jiafeng-shows-sync-error.log"
launchctl print "gui/$(id -u)/com.jiafengbot.shows-sync"
```

The status reports whether the last check found no public change, published a commit, waited for an edit to settle, or failed. Logs do not contain the archive's private content. Existing Git credentials are used through the user's normal credential helper; no token is embedded in the job plist.

To request an immediate check:

```sh
launchctl kickstart "gui/$(id -u)/com.jiafengbot.shows-sync"
```

To pause across logins:

```sh
launchctl disable "gui/$(id -u)/com.jiafengbot.shows-sync"
launchctl bootout "gui/$(id -u)/com.jiafengbot.shows-sync"
```

To resume, run `npm run install:shows-sync` again. This preserves the task's state and enables the job. The private source note and public website are unaffected by pausing it.
