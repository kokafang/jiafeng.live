# Shows Autosync Implementation Plan

> **For agentic workers:** Use executing-plans for the coordinator and bounded parallel tasks for independent modules.

**Goal:** Automatically publish valid public Shows changes from the local vault every five minutes.

**Architecture:** A launchd job runs a dependency-free Node coordinator in local Application Support. A validated source snapshot feeds an owned Git checkout, tests/build, single-file commit and non-forced push to the existing Vercel-linked main branch.

**Tech Stack:** Node.js 24, Git, npm, Python 3 plist installer, macOS launchd.

**Spec:** `docs/superpowers/specs/2026-09-28-shows-autosync-design.md`

## Global constraints
- Source is the existing local performance archive; only public `src/content/shows.json` is pushed automatically.
- Schedule is 300 seconds, source quiet time is 30 seconds, maximum unattended row-count decrease is 10%.
- Never change the user's working checkout or force-push.
- No new dependencies, credentials or recurring model calls.

## Review focus
- Partial table writes and missing source definitions must fail closed.
- Historical insertions must not churn all existing IDs; legitimate source corrections and cancellations remain possible.
- Failed pushes and competing remote commits must recover without publishing unrelated files.
- Launchd must work with Unicode paths and user credential access while the NAS is unavailable.
- Existing mutable snapshot tests must not block ordinary additions/status changes.

## Tasks
- [x] Add `scripts/shows-sync-source.mjs` and real guardrail tests; export `prepareShowsSync(markdown, previousShows)` returning `{shows, serialized, changed}`. Move named historical assertions to an immutable public fixture; keep live-data structural checks.
- [x] Add `scripts/sync-shows.mjs` with CLI `--source`, `--state-dir`, `--repository`, optional `--settle-seconds` and `--dry-run`; use argument-array commands, owned checkout, overlap lock, stable snapshot, tests/build and only-data push. Exercise against temporary Git remotes.
- [x] Add an installer and operation guide; copy the runtime modules locally, register `com.jiafengbot.shows-sync`, and retain logs/status outside the source checkout.
- [x] Run all repository tests and build, get independent review, commit/push the reviewed implementation and verify Vercel production.
- [x] Install and enable the job, verify a real scheduled no-change run and noninteractive push authentication, then document how to pause/resume.

## Verification record

119 tests passed, including 19 runner integration cases using temporary Git remotes. The production build passed. Independent review accepted the documented fail-closed maintenance case for an interruption during stale-lock recovery. The actual LaunchAgent's first run reported `up-to-date`, `authenticationVerified: true`, exit code 0 and a 300-second interval on 2026-09-28. The real source still exports 170 public shows without a data change.
