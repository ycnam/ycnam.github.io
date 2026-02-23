# Learnings - portfolio-migration

## [2026-02-22T00:00:00Z] Init

(Learnings and patterns to be recorded here)

## [2026-02-22T00:00:00Z] Task 1 scraper implementation

- nyc3 theme parsing works reliably by scoping extraction to `#menu .container ul` and `#content .container`, then deriving category/order from `li.section-title` boundaries.
- Slug derivation for Indexhibit URLs must handle `index.php?/prefix/slug/` and pagination tails (`.../slug/2/`) while still allowing numeric slugs like `777`.
- Description fidelity is preserved by concatenating raw `<p>` blocks into `descriptionHtml`; this keeps `<br>` and inline HTML without flattening bilingual content.
- Gallery extraction should read `#content #img-container a.thickbox[href]` and store full-image basenames from `href`, avoiding thumbnail `th-*` sources.
- Inline image captions can be recovered from surrounding paragraph text and trailing text nodes after standalone `<img>` tags.

## [2026-02-22T22:59:00Z] Task 3 - Works content collection schema

- Successfully added `works` collection to `src/content.config.ts` with glob loader pattern `*/index.md` from `./src/data/works`
- Schema fields implemented exactly as specified:
  - `title: z.string()` (required)
  - `category: z.enum(['Motion picture', 'Information design', 'Graphic design', 'D+programing'])` (required)
  - `order: z.number()` (required)
  - `year: z.string().optional()`
  - `credits: z.string().optional()`
  - `vimeoIds: z.array(z.string()).default([])`
  - `hasP5Sketch: z.boolean().default(false)`
  - `galleryImages: z.array(z.string()).default([])`
- Existing `blog` collection schema remains untouched; both collections exported in `collections` object
- Build verification: `npm run build` passed successfully (449 pages built in 4.12s)
- Warning from glob loader about missing `/src/data/works/` directory is expected (directory will be created when works content is added)
- No TypeScript errors or type violations; file maintains consistent style with single quotes and existing formatting

## Task 2: Image Organization - COMPLETED ✅

### Summary
- **Script**: `scripts/organize-images.ts`
- **Projects processed**: 7 (those with images in works-data.json)
- **Images copied**: 85 total
- **Missing files**: 0
- **Excluded files**: 0 (no th-*, sys-*, or *_background.png files copied)

### Projects with Images
1. **imfxkorea** - 44 images (33_* gallery + 4 inline: poster, exhib_01-03)
2. **the-marvelous-fart** - 10 images (19_* gallery)
3. **vital-sign-mediapole-art-proj** - 6 images (13_* gallery)
4. **oecd-trade-statistic** - 11 images (12_* gallery)
5. **seoul-waste-status** - 5 images (15_* gallery)
6. **typography-studies** - 5 images (22_* gallery)
7. **balloon-blow** - 7 images (29_* gallery)

### Projects with NO Images
- 19 projects have empty inlineImages and galleryImages arrays
- These projects rely on vimeoIds for content display

### Filtering Validation
- ✅ No `th-*` prefixed files copied
- ✅ No `sys-*` prefixed files copied
- ✅ No `*_background.png` files copied
- ✅ All original images from gimgs/ successfully copied

### Directory Structure Created
```
src/data/works/
├── balloon-blow/
├── imfxkorea/
├── oecd-trade-statistic/
├── seoul-waste-status/
├── the-marvelous-fart/
├── typography-studies/
└── vital-sign-mediapole-art-proj/
```

### Notes
- Numeric slug `777` has no images in works-data.json (vimeo-only project)
- All image filenames preserved without renaming
- Script is idempotent and can be re-run safely

## [2026-02-22T23:17:00Z] Task 4 - Generate works markdown files (v2 fixed)

### Year extraction
- Two-regex approach: (1) `YYYY.` before `<br>` or `</p>` with `(?!\d)` negative lookahead to avoid matching date strings like `2010.01.09`; (2) `YYYY-YYYY` range before `</p>` (may omit period)
- Takes the LAST match (creation year appears at end of description, after credits)
- 24/26 entries have year extracted; `imf-x-korea--process` and `siso-2008` have none (year not in paragraph-end position)
- `vital-sign-mediapole-art-proj` correctly gets "2009-2010" range

### Vimeo iframes
- Generated as raw `<iframe>` HTML blocks appended AFTER the text body: `https://player.vimeo.com/video/{id}` format
- Placed between blank lines so Markdown parsers treat them as block-level HTML
- Entries with vimeoIds: 14/26 entries

### inlineImages deduplication
- After HTML body is built, collect already-referenced filenames via regex on `./filename` refs
- Append only `inlineImages` entries whose filename is NOT already referenced
- `imfxkorea`: `IMFxKOREA_poster.jpg` added from inlineImages (was not in descriptionHtml body)
- `exhib_01-03.jpg` already covered by `<img>` tags in descriptionHtml → not duplicated

### hasP5Sketch always explicit
- Changed from conditional `if (P5_SLUGS.has)` to always output `hasP5Sketch: true/false`
- All 26 files now have explicit boolean in frontmatter

### Build verification
- `npm run build`: 449 pages, no schema errors, 3.53s

## [2026-02-22T23:36:00Z] Task 8 - Cross-navigation between blog and works

### Implementation
- Added "WORKS" section to `src/components/Sidebar.astro` (blog sidebar)
- Link text: "YCN Works →" pointing to `/works/`
- Styling: `.works-link` class with consistent font-size (0.85rem), hover color using `--color-accent`
- Verified: `WorksSidebar.astro` already has blog link at bottom (`← Blog` pointing to `/`)

### Visual Hierarchy
- Follows existing sidebar pattern: uppercase heading, link with hover state
- Uses CSS variables only (`--color-text`, `--color-accent`)
- Consistent with ArchiveNav styling (no hardcoded colors)

### Build Status
- `npm run build`: 449 pages, 0 errors, 3.53s
- All routes generated successfully
- No TypeScript errors or warnings

## [2026-02-22T23:59:00Z] Task 9 - p5 sketch ports (balloon-blow, i-hear-you, number-of-birds)

- Works detail page expects each local sketch file as a plain script loaded after CDN p5; instance-mode still works safely by wrapping `new p5((p) => { ... }, mountEl)` in an IIFE and guarding `#p5-canvas` + `window.p5`.
- Balloon Blow Processing source relied on `traer.physics` + multiple collision helper classes; practical browser port path is a faithful simplified custom physics loop (spawned balloon particles, fan force band, static/moving obstacles, spring vs burst rules, combo scoring).
- I Hear You source depended on Minim audio and bitmap assets; trigonometric text-wave behavior ports well without extra dependencies by keeping sine/cos/tan driven glyph placement and using mouse press as high-intensity mode.
- Number of Birds source from downloadable zip (`hw03_NamYoungchul.pde`) is timeline/text driven; browser recreation works best as an atmospheric sequence (digits + layered text + bird-shape pulses + persistent trail) rather than exact file-asset playback.
- All three sketches were implemented with local `sketch.js` files under each slug and keep animation continuous over time.

## [2026-02-22T23:49:00Z] Task 10 - Image optimization and build verification

### Image inventory (src/data/works/**)
- **Total images**: 85 (57 JPG + 28 PNG)
- **Largest by size**: `imfxkorea/IMFxKOREA_poster.jpg` at 1,360 KB (~1.33 MB)
- **Widest by pixel width**: `vital-sign-mediapole-art-proj/13_vitalsign06.jpg` at 1264 px

### Optimization result
- **Files modified**: 0 / 85 — all images are already within both thresholds
- **Total bytes saved**: 0 bytes
- Threshold: size > 2 MB → none exceeded (max ~1.33 MB)
- Threshold: width > 4000 px → none exceeded (max 1264 px)

### Script: scripts/optimize-works-images.ts
- Runtime: compiled on-the-fly via `./node_modules/.bin/esbuild ... | node` (no tsx/ts-node)
- Tool: macOS `sips` (built-in, no npm deps needed)
- JPEG compression: `sips -s format jpeg -s formatOptions <quality> <file> --out <file>` (requires explicit `-s format` even for existing JPEG input)
- PNG: lossless only — sips cannot produce lossy PNG; threshold check only applies to JPEGs
- Resize: `sips --resampleWidth <target>` preserves aspect ratio automatically

### Build verification
- `npm run build` → **476 pages built in 3.52s**, exit 0
- All 232 Astro-optimized images loaded from cache (unchanged source images)

## [2026-02-23T00:00:00Z] Task F3 - Full Site QA with Playwright

### QA Results: ALL CHECKS PASS ✅

#### 1. /works/ — PASS
- 4 category headings rendered in sidebar and main content:
  - "Motion picture" (12 items), "Information design" (3 items), "Graphic design" (8 items), "D+programing" (3 items)
- All project links present with correct `/works/{slug}/` URLs
- "← Blog" link in sidebar → `/`

#### 2. /works/imfxkorea/ — PASS
- Title "IMF x KOREA" (h1) ✅
- Category "Motion picture" · year "2010" ✅
- 4 Vimeo iframes rendered (2 at top, 2 inline in prose) ✅
- 37 gallery images (aria alt "IMF x KOREA — image 1"…37) ✅
- 3 inline exhibition photos ✅
- Sidebar active class: `nav a.active` → `/works/imfxkorea/` ✅

#### 3. /works/oecd-trade-statistic/ — PASS
- Title "OECD 국가간 무역정보 시각화" (h1) ✅
- Category "Information design" · year "2009" ✅
- `iframes: 0`, `vimeoEmbeds: 0` (DOM-verified, no Vimeo iframe) ✅
- 11 gallery images ✅
- Sidebar active: `nav a.active` → `/works/oecd-trade-statistic/` ✅

#### 4. Cross-navigation — PASS (both directions)
- `/` → `/works/`: Clicked "YCN Works →" in blog sidebar → navigated to `http://localhost:4321/works/` ✅
- `/works/` → `/`: Clicked "← Blog" in works sidebar → navigated to `http://localhost:4321/` ✅

#### 5. p5 Sketch Canvas — PASS (all 3 slugs)
- `/works/balloon-blow/`: `#p5-canvas` exists, canvas 1456×886 px, `window.p5` loaded ✅
- `/works/i-hear-you/`: `#p5-canvas` exists, canvas 1456×546 px, `window.p5` loaded ✅
- `/works/demonstration-of-number-ofbirds/`: `#p5-canvas` exists, canvas 1456×818 px, `window.p5` loaded ✅

#### 6. Console Errors Summary (representative pages)
- **Pretendard WOFF2 CDN 404**: `cdn.jsdelivr.net/.../pretendardvariable-dynamic-subset.woff2` — returns 404 on all pages. External CDN issue; fallback system fonts apply. Not a code bug.
- **Vimeo 401 Unauthorized** (on imfxkorea): Vimeo embeds blocked in dev/headless env — expected, player UI still rendered by Vimeo's embed script.
- **Cloudflare Turnstile warning** (on imfxkorea): Side-effect of Vimeo embed loading cloudflare scripts — not a site code issue.
- No JavaScript errors from site code on any page tested.

### Key Implementation Patterns Verified
- p5 canvas is invisible to accessibility tree (no ARIA role on `<canvas>`) but DOM-present and sized correctly
- Works sidebar `project-link active` class correctly applied to current page's link via server-side URL comparison
- Vimeo-only works (no `galleryImages`) render iframes without empty gallery div

## [2026-02-23T08:28:00Z] Task - scraper fallback for direct gallery images

- `parseGalleryImages` should keep `a.thickbox[href]` extraction as first priority to preserve full-size image behavior on pages that provide thickbox links.
- Reliable fallback for Indexhibit variants is `#img-container img[src]` basename extraction when thickbox anchors are absent (e.g. `cocktail-book`).
- Re-running the full migration pipeline (`scrape -> organize -> generate`) is required after scraper changes; downstream files are derived artifacts.
