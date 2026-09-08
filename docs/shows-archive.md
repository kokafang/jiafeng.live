# Shows archive

Production release: commit `1d91b02` deployed successfully to https://jiafeng.live/#shows on 2026-09-07. The current website code, archive and public assets were pushed; local Obsidian notes, internal documentation and design drafts were excluded.

The Shows panel uses `src/content/shows.json`, generated from the researched Obsidian archive and the artist's additions on 2026-09-07. It includes 167 dated entries, sorted newest first: 163 historical records and four Upcoming appearances. IMX and AIPPI are labelled Panel speaker, not musical sets; IMX retains its supplied date interval. Nine historical records are artist-confirmed, which is distinct from independent public-source verification. Cancelled shows, residencies, undated leads and the unidentified tentative Cedar plan are excluded. Uncertain dates and legacy citations remain labelled "To verify". Each available source opens in a separate tab. Artist-supplied records without public sources do not receive invented source links.

Artist correction on 2026-09-07: the August 2024 tour played 9 Club (酒球会), Hangzhou on August 23, and YYT Yuyintang (YYT 育音堂), Shanghai on August 25. Both the source archive and site data now include these venue names; the original announcement links are retained. WebM's city is not supplied and remains Not recorded. The Upcoming section is explicitly maintained in Obsidian, not automatically marked as completed when dates pass. Only public fields are exported; settlement terms, contacts and internal notes stay in the local vault.

Search and height-aware pagination keep this archive within the existing desktop viewport and mobile tab layout. The top-right search accepts years, cities, venues and performance formats, in English or Chinese; space-separated terms narrow the results together. Pages show up to six records (normally five or six on desktop), with fewer on short screens rather than clipping. No new wheel interception or nested scroll region was added. Same-day performances at distinct venues remain separate. Source descriptions and internal research notes are not displayed as public copy.

Public headings combine Live set, DJ set, Hybrid set, or Web DJ with "at" and the venue or festival, with small Chinese labels beneath. Tour and event themes are not displayed. Location contains only the city; New York boroughs are grouped under New York. Venue names and cities are rendered in English via `src/content/shows-display.js`; translations are editorial labels, not claims of official English naming. An unspecified performance format defaults to the broad Live set category with an explicit Format to verify label. Unknown venues are labelled unconfirmed rather than invented. The redundant archive headings and footer paragraph are removed. The original research data is unchanged.

Merch includes the Emotional Dance Music DIY Dance Kit with an Out of stock label and a non-purchase link to its Bandcamp product page. Product image source: https://f4.bcbits.com/img/0020821492_10.jpg . Product source: https://jiafeng.bandcamp.com/merch/pre-order-emotional-dance-music-diy-dance-kit-usb-dance-pad-included . Downloaded on 2026-09-07; no live inventory synchronization is implemented.

To regenerate after editing the research document:

```sh
node scripts/import-shows.mjs "/Users/jiafenggao/Documents/Obsidian/jiafeng-vault-air/🙋 me/自我介绍/高嘉丰演出 Archive（统一核对版）.md" src/content/shows.json
node --test scripts/import-shows.test.mjs
```

Color logo candidates D/E/F are generated edits of the existing Pixel/Tide/Serif artwork. They are stored in `public/images/logo-colors/` and previewed in `logo-concepts.html`. The original three designs remain untouched. The user selected D (blue background, bright yellow/lime J) on 2026-09-07. Its 32px favicon and 180px Apple touch icon are installed in both portal entry pages. Favicon preview buttons still affect only the preview tab. No deployment is performed as part of this change.
