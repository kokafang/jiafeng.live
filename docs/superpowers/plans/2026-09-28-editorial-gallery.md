# Editorial Gallery Implementation Plan

> **For agentic workers:** Execute independent content, Press, and rotation tasks in parallel; root integrates layout and performs end-to-end verification.

**Goal:** Implement the approved artist website study with six dated projects and five-second rotation.

**Architecture:** Reuse project dialogs and the DOM language translator. Render Projects from a small content module and drive its index with an isolated timer controller. Preserve existing section anchors and support naturally taller sections in desktop navigation.

**Tech Stack:** Vite, vanilla JavaScript, CSS, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-28-editorial-gallery-design.md`

## Global Constraints

- Six projects; rotation interval exactly 5,000 ms.
- Web-DJ 2018–present, Ting Difang 2026, Da Wo Xian Ren 2025 are artist-confirmed dates.
- TRI-O 2014 must be labeled as an award year.
- No autoplaying media, automatic page scrolling, deleted source records, or unrelated changes.
- Existing `.obsidian` deletions in the main checkout remain untouched.

## Review Focus

- A background tab or an offscreen section must not advance or catch up suddenly on return.
- Manual selection must receive a full five seconds; independently paused conditions must not cancel one another.
- Opening a dialog must preserve its selected project and keyboard focus even across elapsed timers.
- Press must scroll naturally on desktop without snapping past unread reports.
- Six project titles, years, images, controls and translations must fit narrow phones and short desktop windows.

## Tasks

- [x] Content: export `projectGallery` with `{id,title,titleZh,year,yearNote,category,summary,image}` records; add Web-DJ and TRI-O dialogs; append relevant year facts and translation dictionaries; synchronize narrow Obsidian facts.
- [x] Timer: test then implement `createProjectRotation({count,onChange,interval=5000})` returning `select`, `setActive`, `setPaused`, `getState`, `destroy`. Use independent pause reasons and a single timeout, not a catch-up interval.
- [x] Gallery: replace old grid with a featured image, year/title/category/summary/detail button, six index buttons, and pause control. Render once before mounting existing dialogs, retain the same detail button, and pause through dialog callbacks. Observe the stage for visibility; do not scroll on timed transitions.
- [x] Tools: use full-width rows with existing thumbnails, descriptions, platform and real action links. Preserve `data-avs-project` and development-only local linking behavior.
- [x] Press: implement `getPressArchive()` and feature/directory presentation; preserve `getPressPage` compatibility; add verified editorial reports and separate appearances. Export translation additions for integration.
- [x] Navigation: add long-section reading ranges to desktop scroll behavior and meaningful behavior coverage. Remove old Projects width fitting and stop resetting editorial scroll positions on mutations.
- [x] Integrate bilingual content; run `npm test` and `npm run build`; inspect browser at desktop and phone widths, test timer/reset/pause/dialog paths and Press navigation; obtain an independent review.
- [ ] Integrate the verified branch and publish using the established site workflow; verify the resulting deployment and return its URL.

## Execution record

- Baseline: 119 tests passed on branch `feat/gallery-20260928` at `96aeb12`.
- Independent agents own Press files, project content, and timer/controller tests; root owns shared markup, gallery/styles, language integration and desktop navigation.

- Final verification: 140/140 tests pass, production build succeeds, and `git diff --check` is clean.
- Browser verified at 1440×1000, 1024×768, 390×844 and 844×390: common gutters, no horizontal overflow, English/Chinese content, five-second advance, manual pause, hidden-tab pause, dialog pause, Web-DJ video cleanup after close, natural Press scrolling, and Space opening the Press disclosure.
- Independent review found two keyboard issues. Both reproduced and fixed: pointer-to-keyboard modality now pauses the slideshow without needing a focus change; native summary elements keep their Space activation at section boundaries.
- Short landscape phones exposed an overly strict intersection ratio; visibility is now measured relative to the available reading viewport. The landscape browser check confirms automatic advance.
- Artist-confirmed dates were synchronized into nine relevant Obsidian project/profile notes with separate guarded backups; show-event dates were not changed.
