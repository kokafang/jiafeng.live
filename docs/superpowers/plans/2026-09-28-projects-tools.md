# Projects and Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Separate representative creative projects from usable tools and unify thumbnail treatment.

**Architecture:** Reorganize the existing HTML sections and reuse the current dialog/content layer. Extend shared card CSS to #tools while keeping Projects mist isolated; retain #products deep links. Tools is a compact directory with a lower development group.

**Tech Stack:** Vite, vanilla JavaScript and CSS, Node test runner.

**Spec:** docs/superpowers/specs/2026-09-28-projects-tools-design.md

## Global Constraints
- Preserve all nine existing entries and all external destinations.
- Keep #products compatible and add #tools to desktop/mobile navigation.
- English/Chinese copy must remain consistent.
- No invented shipping/download status; LMDJ and AVS remain In development.
- Source images remain unmodified; use CSS framing.
- Existing unrelated .obsidian deletions are excluded.

## Review Focus
- Tools detail buttons remain confined to their cards and return keyboard focus correctly.
- Short desktop windows and narrow mobile screens expose every title/control.
- Existing #products links and the new #tools link activate the correct navigation item.
- Chinese switching updates added headings, descriptions and actionable labels.
- New thumbnail rules do not distort the Bach sprite or hide software interface content.

### Task 1: Classify the content and navigation
**Files:** index.html, src/content/site-translations.js, src/scripts/desktop-fit.js.
- [x] Move the five art-project cards to #products, ordered Muted Portraits, Ting Difang, EDM DIY Kit, Da Wo Xian Ren, TRI-O.
- [x] Add #tools containing Bach Typewriter, FakeBook, then the In development heading and LMDJ / AVS.
- [x] Add Tools links and translated copy. Keep all dialog triggers and public links.
- [x] Adapt project grid fitting for three columns and visible cards. Verify navigation through the existing browser flow.

### Task 2: Thumbnail and layout consistency
**Files:** src/styles/concept-artist-portal.css, src/styles/mobile-portal.css, src/styles/projects-gallery.css, src/styles/project-dialog.css.
- [x] Share base card/thumbnail rules across the two sections. Remove nth-child background exceptions.
- [x] Set Projects to three desktop columns and Tools to compact horizontal cards; retain 4:3 media and subject-specific framing.
- [x] Use dark uniform frames; preserve photographs, interface images, sprite cropping and mobile usability.
- [x] Run npm test and npm run build; inspect rendered desktop/mobile images and fix any clipping.

### Task 3: Review, publication and documentation
**Files:** docs/project-details.md and these planning documents.
- [x] Document content classification and thumbnail conventions.
- [x] Obtain independent code review, inspect desktop and mobile screenshots, and check both languages and card interactions.
- [x] Prepare the scoped change for publication through the existing Git/Vercel workflow; preserve unrelated work.

Publication gate: commit only task files, integrate into main, push, and confirm the matching production deployment before reporting completion.

## Verification approach
This is a reversible content/layout change. Existing tests plus actual browser interaction and geometry checks provide meaningful coverage; do not add implementation-mirroring tests for card ordering or CSS text. Add a targeted regression only if a substantive functional defect is found.

## Verification record
- Existing full Node suite: 119 / 119 passed. Production Vite build passed.
- Browser layout probes: both sections in English and Chinese at 1440×1000, 1280×800, 1024×600, 901×701, 390×844 and 320×720. All thumbnails remain 4:3; no horizontal or card content overflow, and no desktop navigation overlap.
- Screenshots inspected for desktop Projects and mobile Chinese Tools.
- Independent read-only review found no material defects. Subsequent browser checks corrected compact navigation spacing, short-screen title fit and fractional-pixel mist edges.
- Short desktop windows (height ≤820px) omit card summaries, preserving readable artwork, categories and titles; the full copy remains in dialogs.

Bach and FakeBook dialogs opened, closed with Escape and returned focus to the correct card in separate browser checks; close-button behavior also passed. A long automation session became unresponsive during repeated dialog checks and was restarted; no dialog implementation changes were made without a confirmed cause.
