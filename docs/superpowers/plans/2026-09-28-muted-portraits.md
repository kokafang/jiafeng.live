# Muted Portraits restoration

**Goal:** Restore Jiafeng's 2015 cassette publishing project to the relevant Obsidian career records and the website's Projects section.

**Design:** Reuse the existing project card, native detail dialog and English/Chinese translation system. Present Muted Portraits（无声肖像）as a cassette label and sound-art publishing project founded in New York in 2015. Explain the anonymous listening-and-conversation process and the first releases involving Mai Mai, Li Zenghui and Shih-Yang Lee. Use the recovered original photograph of Li Zenghui's MP001《植物少年》cassette. Keep public references in the project and provenance in `docs/project-details.md`.

**Implementation:** The coordinator edits the website's HTML and content records in place; a bounded parallel task updates and backs up only relevant Vault notes. Existing unrelated working-tree changes remain outside the commit. The user's request authorizes this content addition and publication through the established Git/Vercel workflow.

1. Back up relevant Vault notes, create a sourced project master note and connect it to career/project indexes and appropriate general biographies; retain specialized biographies' intended scope.
2. Add `/images/muted-portraits-mp001.jpg`, a card before the in-development projects, a `muted-portraits` detail record and complete Chinese translations. No new runtime dependency or dialog implementation is needed.
3. Record source and image provenance. Run the existing repository tests and production build; inspect the desktop/mobile card and modal, both languages, image loading, Escape/focus restoration and the now-active two-page gallery.
4. Independently review the final content change, commit only public website files, push `main`, and verify the Vercel deployment and public project.

**Review focus:** Distinguish this label from a solo album; do not invent a closing year or a Bandcamp purchase link. Preserve the original image and its visible lettering. Confirm the ninth card remains reachable through pagination, with no clipped controls. Verify all new labels and source links in Chinese and English. Vault edits must detect concurrent changes and retain local backups.

## Verification

All 119 repository tests passed. After refining the Chinese title, all 16 project/language tests passed again. The production build succeeded using a local temporary output directory: the NAS-mounted `dist/assets` contained open-file `.smbdelete` remnants that prevented Vite from emptying it. No build configuration change was needed.

The built site was inspected at 1440 × 1000 and 390 × 844. The new image loads, English and Chinese dialog content and source links render, Escape restores focus to the card, and the two-page gallery exposes all nine projects (including AVS on page two) without horizontal overflow. Independent content/integration review found no material defect. The Vault task backed up six existing notes and added one project note and the original image.
