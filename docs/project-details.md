# Project Introduction Dialog

The Projects page uses one native modal dialog for on-site introductions. It does not change the URL, gallery page, or section selection. Closing restores the opener's focus and the underlying scroll position.

## Add Another Project

1. Add a record to `src/content/project-details.js`: title, Chinese title, category, status, summary, image, facts, paragraphs, and an optional note. Optional `gallery` records use the same `src`, `alt`, `caption` fields as `image`. Optional `source` contains `href`, `label`, and `credit`.
2. Add a native button inside that project's `.fill-block`, using `class="project-detail-trigger"`, `data-project-detail="the-record-id"`, and a descriptive `aria-label`.
3. Do not place the overlay button inside an external link or over another interactive control. Keep external-link and embedded-video cards unchanged unless their interaction is deliberately being replaced.

The shared renderer in `src/scripts/project-dialog.js` inserts text via `textContent`, manages focus with `showModal()`, and supports Close, Escape, and backdrop clicks. The site pauses desktop snapping while the dialog is open. The reading region scrolls independently.

Desktop size is 82vw (up to 1200px) by 78dvh. Mobile retains a visible margin around the window. Artwork is shown without the Projects ASCII overlay.

## Ting Difang Sources

Updated 2026-09-08 from the public [Ting Difang Xiaohongshu profile](https://www.xiaohongshu.com/user/profile/5f53295a0000000001002a36), supplied by the artist. The profile identifies a place-led sound creative team and a riverside space in Changsha's Guitang River Park, with exhibitions and hands-on activities. Public post titles cover wind chimes, Hunan expressions, river sounds and cicadas. This replaces the earlier prototype-only introduction, which was based on local installation/game development notes and did not represent the whole project.

Post detail pages required login. Only the publicly rendered profile, post titles and cover images were used; no claims are made about unseen post text, specific authorship, exhibition history or the completion of the separately documented interactive prototype. Opening hours, recruitment and internal planning details are intentionally omitted.

Three public post covers were downloaded in their original displayed WebP format (640 x 853 px, approximately 202 KB combined). They retain their original typography and attribution marks, and are shown uncropped in the popup gallery:

| Local asset | Public post title | Observed CDN asset identifier |
| --- | --- | --- |
| `ting-difang-treehouse.webp` | 来啦！听地方的河边小树屋 | `1040g008323jtb9u0n4005nqj55d08ahmlet1ql8` |
| `ting-difang-wind-chimes.webp` | 去有风铃的地方～ | `1040g008323qdvu6bmu005nqj55d08ahm32801l8` |
| `ting-difang-sound-play.webp` | 我在圭塘河玩声音 | `1040g2sg323mln1dhmu705nqj55d08ahmild6kco` |

The popup includes an attribution and a canonical profile link, opening in a separate tab. Temporary CDN URLs and profile security query parameters are not embedded in the site. The Projects grid thumbnail now uses the artist-supplied logo photograph, `ting-difang-logo-photo.jpg`. CSS frames a 660 x 495 region starting at (0, 535) in the original 960 x 1440 image, keeping the card at 4:3 without permanently cropping the photo. This thumbnail change does not affect the popup gallery.

## Da Wo Xian Ren Sources

The Projects thumbnail uses the blue-lit choreography photograph (`da-wo-xian-ren-dance.webp`), framed at 4:3 with a 70% vertical focal point. The popup gallery retains all three original photographs.

Added 2026-09-08. The artist supplied the [production's Xiaohongshu profile](https://www.xiaohongshu.com/user/profile/5ae14c8d4eacab2764efc947) and confirmed that he made the music for the entire performance. The public profile identifies the work as immersive dance theatre and credits music producer Jiafeng, choreographer/directors Yuan Wanbin and Liu Yuchengjie, and stage designer/writer/director Mu Fan. Transliteration is provided alongside the credited Chinese names.

The brief description of ballet, an underwater setting, the fishing meme and Zhuangzi draws on the publicly indexed [production background article](https://www.sohu.com/a/999319412_121123703). This is a secondary source, linked separately in the popup. Attendance claims, premiere dates and running time are omitted.

Individual Xiaohongshu notes required login, so only the visible profile and public post covers were used:

| Local asset | Public post title | Observed CDN asset identifier |
| --- | --- | --- |
| `da-wo-xian-ren-dance.webp` | 为了这个动作写的这台戏！ | `1040g2sg31sc28et95a004a4r8068ria75c4cduo` |
| `da-wo-xian-ren-stage.webp` | 命运呐！ | `1040g2sg31rra5kv4i2e04a4r8068ria7u0mbd78` |
| `da-wo-xian-ren-premiere.webp` | 一丝厂版首演圆满！ | `1040g3k8323t6ugb5gm704a4r8068ria7ts556c0` |

Files remain the original displayed WebP covers (640 px wide, about 97 KB combined), with visible attribution marks retained. The landscape image is contained rather than cropped in the gallery.

The artist-supplied music URL is an album page, not a playlist endpoint: `https://music.163.com/album?id=359619394`. Only the unnecessary `userid` sharing parameter was removed. The browsing environment blocks access to this destination, so album metadata, track listing and playback could not be verified. The website provides an ordinary new-tab link, not an embedded or auto-playing player; copy does not assert a track count, release date or verified album title.

## September 2026 Presentation Updates

At the artist's request, Ting Difang's card title and introduction now foreground dialect, local speech and Hunan expressions. "Dialect & Sound" is a descriptive subtitle, not a claim that the project's official name has changed. The source gallery and project identity are unchanged.

Bach Typewriter retains its original pixel-art sprite, positioned over a generated Windows 95/98-inspired collage of music-score windows (`bach-windows-score-background.jpg`). The sprite occupies 78% of the frame height, enlarged 30% from the previous 60%, without stretching. This is decorative thumbnail art, not a real product screenshot or a verified Bach score. The earlier checkerboard and generic desktop directions are not used.

## Optional Soundtrack Link

Add `listen: { title, credit, label, href }` to a project record to show the shared soundtrack panel beneath the introduction summary. It uses an accessible native link, opens in a new tab, and does not dismiss the modal. Additional source links can be recorded in `source.references` as `{ label, href }` records.
