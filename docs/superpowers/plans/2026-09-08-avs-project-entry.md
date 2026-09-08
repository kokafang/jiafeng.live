# AVS Project Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the Gao Video Sampler portfolio card to AVS Sampler, make it open the local AVS storefront during development, and keep it non-interactive in production.

**Architecture:** Keep the production-safe project content as static HTML. A focused JavaScript module checks Vite's compile-time `import.meta.env.DEV` flag and upgrades only the AVS card to an external link in development; Rollup removes that branch and its localhost URL from production output.

**Tech Stack:** Vite 7, vanilla JavaScript, HTML, CSS, Node test runner.

## Global Constraints

- Development destination: `http://localhost:3000`.
- Production must contain no clickable AVS card and no AVS destination URL.
- Retain the existing AVS working-interface screenshot.
- English title: `AVS Sampler`; Chinese title: `AVS 采样器`.

---

### Task 1: Environment-Aware AVS Card

**Files:**
- Create: `src/scripts/avs-project-link.js`
- Modify: `index.html`
- Modify: `src/scripts/concept-artist-portal.js`
- Modify: `src/content/site-translations.js`
- Modify: `src/styles/concept-artist-portal.css`
- Test: `scripts/avs-project-link.test.mjs`

**Interfaces:**
- Consumes: the AVS card element selected by `[data-avs-project]` and Vite's compile-time `import.meta.env.DEV` flag.
- Produces: `mountAvsProjectLink({ card, isDevelopment, href }): HTMLAnchorElement | null`.

- [ ] **Step 1: Write the failing contract test**

Assert that the module exports `mountAvsProjectLink`, returns no link in production, and references `http://localhost:3000` only inside a development-gated call from the main script. Assert that the production HTML has AVS copy but no anchor around `[data-avs-project]`.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test scripts/avs-project-link.test.mjs`

Expected: FAIL because the AVS module and renamed card do not exist.

- [ ] **Step 3: Implement the card and development-only upgrade**

Update the static card to:

```html
<div class="fill-block sampler-project" data-avs-project>
  <!-- existing interface image -->
  <span>In development</span>
  <strong>AVS Sampler</strong>
  <p class="project-description">A performance sampler for mixing, chopping, and sequencing audiovisual clips live.</p>
</div>
```

Implement `mountAvsProjectLink` by creating an `<a class="project-link-card avs-project-link">`, assigning `target="_blank"`, `rel="noopener noreferrer"`, an accessible label, moving the card's children into it, and appending it only when `isDevelopment` is true. Call it behind `if (import.meta.env.DEV)` so production tree-shaking removes the localhost URL.

- [ ] **Step 4: Add bilingual copy and matching interaction styles**

Map the AVS title, description, image alternative text, and development-link accessible label in `site-translations.js`. Reuse the existing project-link visual treatment without changing production card cursor or semantics.

- [ ] **Step 5: Run focused and full verification**

Run:

```bash
node --test scripts/avs-project-link.test.mjs
node --test scripts/*.test.mjs
npm run build
rg -n "localhost:3000" dist
```

Expected: all tests pass, build succeeds, and `rg` returns no matches in `dist`.

- [ ] **Step 6: Run both local sites and inspect the interaction**

Run the portfolio at `http://127.0.0.1:5173/#products` and the AVS storefront at `http://localhost:3000`. Confirm that clicking AVS opens the storefront in development and that the portfolio retains its current page.

- [ ] **Step 7: Commit and publish**

Stage the complete intended portfolio work, commit it, and push `main` to `origin`. Confirm the remote branch contains the commit so the linked Vercel project can deploy it.
