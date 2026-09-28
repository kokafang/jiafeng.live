# Shows archive

Production release: commit `1d91b02` deployed successfully to https://jiafeng.live/#shows on 2026-09-07. The current website code, archive and public assets were pushed; local Obsidian notes, internal documentation and design drafts were excluded.

The Shows panel uses `src/content/shows.json`, generated from the researched Obsidian archive. The 2026-09-28 export includes 170 dated entries, sorted newest first: 163 historical-source records and seven records from the archive's Upcoming section. The three additions are Berlin SaltyAcid on October 10 (19:00), Haikou Mingri Park / 明日公园 on October 23–25 (workshop + performance), and Shanghai Wigwam on November 18 (Web DJ Big Band). IMX and AIPPI are labelled Panel speaker, not musical sets; date intervals are retained. Nine historical records are artist-confirmed, which is distinct from independent public-source verification. Cancelled shows, residencies, undated leads and the unidentified tentative Cedar plan are excluded. Uncertain dates and legacy citations remain labelled "To verify". Each available source opens in a separate tab. Artist-supplied records without public sources do not receive invented source links.

Artist correction on 2026-09-07: the August 2024 tour played 9 Club (酒球会), Hangzhou on August 23, and YYT Yuyintang (YYT 育音堂), Shanghai on August 25. Both the source archive and site data now include these venue names; the original announcement links are retained. WebM's city is not supplied and remains Not recorded. The source archive's Upcoming section is explicitly maintained in Obsidian. The website's Past/Upcoming display is calculated from the visitor's local date, through an event's inclusive end date; this does not change the source evidence or establish that a performance happened. Only public fields are exported; settlement terms, contacts and internal notes stay in the local vault.

Search and height-aware pagination keep this archive within the existing desktop viewport and mobile tab layout. The top-right search accepts years, cities, venues and performance formats, in English or Chinese; space-separated terms narrow the results together. Pages show up to six records (normally five or six on desktop), with fewer on short screens rather than clipping. No new wheel interception or nested scroll region was added. Same-day performances at distinct venues remain separate. Source descriptions and internal research notes are not displayed as public copy.

Public headings combine Live set, DJ set, Hybrid set, or Web DJ with "at" and the venue or festival, with small Chinese labels beneath. Tour and event themes are not displayed. Location contains only the city; New York boroughs are grouped under New York. Venue names and cities are rendered in English via `src/content/shows-display.js`; translations are editorial labels, not claims of official English naming. An unspecified performance format defaults to the broad Live set category with an explicit Format to verify label. Unknown venues are labelled unconfirmed rather than invented. The redundant archive headings and footer paragraph are removed. The original research data is unchanged.

Merch includes the Emotional Dance Music DIY Dance Kit with an Out of stock label and a non-purchase link to its Bandcamp product page. Product image source: https://f4.bcbits.com/img/0020821492_10.jpg . Product source: https://jiafeng.bandcamp.com/merch/pre-order-emotional-dance-music-diy-dance-kit-usb-dance-pad-included . Downloaded on 2026-09-07; no live inventory synchronization is implemented.

## Updating Shows

The source of truth is the vault note `🙋 me/自我介绍/高嘉丰演出 Archive（统一核对版）.md`. A local macOS background job can now check this note every five minutes and automatically export, validate and push public changes; see [automatic synchronization](shows-autosync.md) for installation, operation and safeguards. The website itself remains static. The following manual export, validation and Git-push workflow remains available:

```sh
node scripts/import-shows.mjs "$HOME/Documents/jiafeng-vault/🙋 me/自我介绍/高嘉丰演出 Archive（统一核对版）.md" src/content/shows.json
node --test scripts/*.test.mjs
npm run build
git diff -- src/content/shows.json src/content/shows-display.js src/content/site-translations.js
```

Run these from the website directory. If the vault lives elsewhere, pass that note's actual path as the first argument. Review the changed rows; add display/translation mappings when introducing a new city or performance format where editorial labels are needed. Historical behavior assertions use an immutable fixture, so ordinary archive maintenance does not require changing those tests. Commit only the reviewed public data, mappings, and tests, then push `main` to `origin` (`kokafang/jiafeng.live`). The linked Vercel project builds and deploys that branch to `https://jiafeng.live`. Confirm the deployment is Ready and inspect the new entries online before reporting synchronization complete. The original vault note, private daily notes, and contacts do not need to be uploaded.

Migration recovery on 2026-09-28 restored the original Git history, remote, `.gitignore`, Vercel project link, and npm executable links. The previously deployed September 12 source changes were recovered as a separate commit after comparing their build output byte-for-byte with production. No working source was overwritten by the older remote checkout.

Color logo candidates D/E/F are generated edits of the existing Pixel/Tide/Serif artwork. They are stored in `public/images/logo-colors/` and previewed in `logo-concepts.html`. The original three designs remain untouched. The user selected D (blue background, bright yellow/lime J) on 2026-09-07. Its 32px favicon and 180px Apple touch icon are installed in both portal entry pages. Favicon preview buttons still affect only the preview tab. No deployment is performed as part of this change.
