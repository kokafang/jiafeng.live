# Site Language

The site starts in English on each page load. The hero menu and persistent
navigation expose a Chinese toggle (`中`), which becomes `ENG` in Chinese.
Project dialogs also expose the toggle without requiring visitors to close them.

`src/content/site-translations.js` holds the editorial Chinese copy and mappings
for navigation, releases, projects, press, shows, merch, and accessible labels.
Add corresponding translations there when introducing new English copy.
Names without an established Chinese equivalent remain in their original form.

`src/scripts/site-language.js` updates text nodes and accessible attributes in
place, remembering the original English. It does not replace cards or iframes,
change URLs, reset filters, or reload the page. Newly rendered pagination,
gallery captions, and project dialogs inherit the selected language. Layout and
navigation highlights remeasure after the `site:languagechange` event.

Spotify and YouTube control their own embedded interfaces. Text inside artwork
and remote players is not translated. Embed URLs are intentionally unchanged so
language switching does not interrupt playback.

Run `node --test scripts/site-language.test.mjs` to check translation coverage.
