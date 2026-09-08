# AVS Project Entry Design

## Goal

Replace the existing Gao Video Sampler project card with AVS Sampler and connect
the card to the AVS storefront during local development only. The public
production site must present the project without any clickable link.

## Card Content

- Title: `AVS Sampler`
- Status: `In development`
- Description: `A performance sampler for mixing, chopping, and sequencing audiovisual clips live.`
- Artwork: retain the existing working-interface screenshot.
- Chinese copy: `AVS 采样器` and `用于现场混合、切分与编排音视频片段的表演采样器。`

## Environment Behavior

The card is created by JavaScript so its semantics can depend on Vite's build
environment without duplicating markup.

- Development: render the card as an external link to `http://localhost:3000`.
- Production: render the same card as a non-interactive `div`; do not include an
  anchor, URL, external-link marker, click handler, or link cursor.
- Opening the development card uses a new browser tab so the portfolio state is
  retained.

## Accessibility

In development, the card receives an English accessible label describing that
it opens the AVS development site. In production, it has no link role and keeps
only the image alternative text and visible project copy.

## Verification

- Unit-check both development and production card behavior through a small pure
  helper or source-level contract test.
- Confirm the development build opens `http://localhost:3000`.
- Confirm the production build contains no AVS destination URL or clickable AVS
  card.
- Run the complete test suite and production build.
