# Desktop Scroll Smoothness

## Goal

Make desktop wheel and trackpad page transitions feel immediate and smooth while preserving the existing one-gesture-per-section navigation model.

## Scope

- Desktop wheel and trackpad navigation only.
- Preserve section order, navigation links, keyboard navigation, mobile touch behavior, and scrolling inside description panels.
- Do not introduce a third-party scrolling dependency.

## Design

- Use JavaScript as the only source of smooth page motion and disable CSS smooth scrolling for programmatic transitions.
- Resolve the destination section once at the beginning of a transition instead of measuring every section on every animation frame.
- Update navigation state at transition boundaries instead of during every frame.
- Keep a short post-transition wheel cooldown so trackpad inertia cannot trigger a second page change.
- Continue allowing wheel events inside a scrollable description panel until that panel reaches its edge; only then may the gesture turn the page.
- Use a single approximately 220 ms eased transition so the page responds immediately but settles without a hard snap.

## Verification

- A short upward or downward desktop gesture moves exactly one section.
- A long trackpad gesture does not skip sections because of inertial events.
- Navigation clicks and arrow keys still move to the expected section.
- Description panels scroll internally and hand off to section navigation only at their boundaries.
- Mobile touch behavior remains unchanged.
