# Projects Refinement Implementation Plan

**Goal:** Softer transitions and a Music-style project navigation above a viewport-fitted feature.
**Architecture:** Preserve rotation timing and content data. Update gallery rendering and its CSS only; use existing translation and dialog integration.
**Tech Stack:** Vanilla JS, CSS, Vite, Node tests, browser verification.
**Spec:** ../specs/2026-09-28-project-refinement-design.md

## Constraints
- Switch interval remains 5000 ms.
- Transition is approximately 900 ms; reduced motion is immediate.
- Navigation precedes the feature and remains visible with it on common desktop screens.
- Existing six projects, years, width, pause reasons, dialogs, and translations remain functional.

## Tasks
- [x] Update gallery rendering: top controls, compact mobile picker, cancellable fade-out/in. Verify rapid selection and reduced motion.
- [x] Style the browse bar like Music and fit the desktop feature to the available height. Keep readable responsive fallbacks.
- [x] Verify browser geometry in four viewports and both languages, navigation, timing, and dialogs; run regression tests and production build.
- [ ] Review, merge, publish, and verify production assets and visible behavior.

## Verification
- 144 Node tests pass; production build succeeds.
- All six projects fit at 1366×768, 1024×768 (English/Chinese), and 1024×600; longest project also checked at 901×600. 1440×900 preserves common gutters.
- At 390×844 all six English projects fit their navigation and detail entry; Chinese picker/longest title also verified with no horizontal overflow.
- Browser timing confirms 350/550 ms fade phases with the original 5-second cadence.
- Independent review found no confirmed issues; suggested short-screen geometry checks above passed.
