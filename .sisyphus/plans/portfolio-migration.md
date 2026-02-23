# YCN Works: Indexhibit Portfolio Migration to Astro

## TL;DR

> **Quick Summary**: Migrate 26 design portfolio projects from a legacy Indexhibit CMS (PHP/MySQL) into the existing Astro 5.x blog, creating a new "/works" section with Indexhibit-style minimal design and p5.js ports of 3 Processing sketches.
> 
> **Deliverables**:
> - Content scraper that extracts text + image mappings from 26 live Indexhibit pages
> - ~211 original images migrated into Astro project
> - New "works" content collection with category-based frontmatter schema
> - WorksLayout with left sidebar category navigation (Indexhibit.org/about style)
> - /works index page + 26 individual project pages
> - 3 Processing sketches ported to p5.js, embedded in browser
> - Cross-navigation between blog (YCN) and works (YCN Works)
> - Successful `npm run build` and GitHub Pages deployment
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 (scrape) → Task 4 (content collection) → Task 7 (project pages) → Task 9 (p5.js) → Final Verification

---

## Context

### Original Request
User wants to migrate their design portfolio from an Indexhibit-based site (limitist.cafe24.com/portfolio/) — a PHP CMS that is no longer supported — into their existing Astro 5.x blog at ycnam.github.io. The new section should live at /works with the name "YCN Works", styled after the clean minimal aesthetic of indexhibit.org/about.

### Interview Summary
**Key Discussions**:
- **Same project vs. separate**: Decided to integrate into existing Astro project (small content volume, shared design system, simpler deployment)
- **Path**: `/works` (not `/portfolio`), site name "YCN Works"
- **Design reference**: https://www.indexhibit.org/about/ — left sidebar nav, right content area, white background, minimal typography
- **About Me page**: Excluded from migration
- **Content source**: Live scraping from cafe24 (no SQL dump in backup)
- **Images**: Use originals only (~211), skip `sys-*` and `th-*` duplicates
- **Video**: Keep Vimeo embeds as-is
- **Processing projects**: Port 3 sketches to p5.js for browser execution
- **Background images**: Not used (clean white background)

**Research Findings**:
- Backup at `migration_from_indexhibit/portfolio/` contains: images (634 files, 3 variants each), Processing source (.pde/.jar/.java), CMS engine. NO text content.
- Each project page has: h1 title, description paragraphs (some bilingual KR/EN), inline images with captions, thumbnail gallery, some Vimeo iframes
- Image naming: `{id}_{name}.ext` (originals), `th-{id}_*` (thumbs), `sys-{id}_*` (system copies)
- Live site uses nyc3 Indexhibit theme with selectors: `#menu` (sidebar), `#content` (main area) — NOT the generic Indexhibit selectors from docs
- Processing projects: Balloon Blow (uses physics.jar — risk for p5.js porting), I Hear You, Number of Birds
- Current Astro project: content collection with glob loader, BaseLayout with sidebar, Tailwind v4, Pretendard font, no test infrastructure

### Metis Review
**Identified Gaps** (addressed):
- **Scraper must target actual nyc3 theme selectors** (`#menu`, `#content .container`), not generic Indexhibit docs — incorporated into scraper task with exact selectors
- **p5.js porting risk**: Balloon Blow depends on `physics.jar` (toxiclibs physics engine) which has no direct p5.js equivalent — added fallback strategy (screenshots + video recording if port fails)
- **Scrape-first, build-second**: Scraping output must be validated before any Astro build work — structured as Wave 1 prerequisite
- **Cross-navigation design**: How blog and works connect needs explicit definition — added to layout task
- **Image optimization**: Large original images may bloat GitHub Pages — added image processing step
- **p5.js isolation**: Blog has no-JS philosophy; p5.js scripts should only load on relevant project pages — addressed in implementation

---

## Work Objectives

### Core Objective
Migrate all 26 portfolio projects from Indexhibit to a new "/works" section in the Astro site, preserving all text content, images, and video embeds, with a clean Indexhibit-inspired design and interactive p5.js versions of 3 Processing sketches.

### Concrete Deliverables
- `scripts/scrape-indexhibit.ts` — One-time scraper script
- `src/data/works/{slug}/index.md` — 26 Markdown files with frontmatter
- `src/data/works/{slug}/*.jpg|png` — ~211 original images organized by project
- `src/content.config.ts` — Updated with works collection schema
- `src/layouts/WorksLayout.astro` — New layout with category sidebar
- `src/components/WorksSidebar.astro` — Category-based navigation component
- `src/pages/works/index.astro` — Works index page
- `src/pages/works/[...slug].astro` — Individual project pages
- `src/data/works/{slug}/sketch.js` — 3 p5.js sketch files
- Updated `BaseLayout.astro` or `Sidebar.astro` with cross-navigation link

### Definition of Done
- [x] `npm run build` completes without errors
- [x] All 26 project pages render at `/works/{slug}/`
- [x] Works index page lists all projects grouped by category
- [x] All ~211 images load correctly on their respective project pages
- [x] Vimeo embeds render and play on relevant project pages
- [x] 3 p5.js sketches run interactively in the browser
- [x] Blog sidebar links to /works; Works sidebar links to blog
- [x] GitHub Pages deployment succeeds

### Must Have
- All 26 project titles and description text preserved exactly
- All original images (not thumbnails/system copies) included
- Category grouping: Motion picture, Information design, Graphic design, D+programing
- Clean white background, no Indexhibit background patterns
- Left sidebar category navigation matching Indexhibit.org/about style
- Vimeo iframe embeds preserved for video projects
- Mobile responsive (single column on small screens)
- `word-break: keep-all` for Korean text (matching blog)

### Must NOT Have (Guardrails)
- No Indexhibit background images or patterns — clean white only
- No About Me page migration
- No `sys-*` or `th-*` duplicate images — originals only
- No thumbnail/lightbox JavaScript libraries — images display inline, full-width
- No modifications to existing blog functionality — blog must work exactly as before
- No hardcoded colors — use CSS variables from `global.css`
- No `font-family` overrides in components — inherit from global styles
- No `as any`, `@ts-ignore`, or `@ts-expect-error` in TypeScript
- Scraper must NOT be built from generic Indexhibit docs — must use actual nyc3 theme selectors (`#menu`, `#content`)
- p5.js scripts must NOT load globally — only on pages that need them

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: NO (content migration, visual verification only)
- **Framework**: None

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Scraper output**: Bash — validate JSON/Markdown structure, count items, check image references
- **Astro build**: Bash — `npm run build`, check exit code
- **Page rendering**: Playwright — navigate to /works pages, verify content, images, layout
- **p5.js sketches**: Playwright — verify canvas renders, basic interaction
- **Cross-navigation**: Playwright — click between blog and works sections

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — scraping + scaffolding):
├── Task 1: Scrape all 26 Indexhibit pages → structured data [deep]
├── Task 2: Copy + organize original images from backup [quick]
└── Task 3: Works content collection schema + config [quick]

Wave 2 (Core build — after Wave 1):
├── Task 4: Generate 26 Markdown files from scraped data [unspecified-high]
├── Task 5: WorksLayout + WorksSidebar components [visual-engineering]
├── Task 6: Works index page (/works) [visual-engineering]
└── Task 7: Individual project pages (/works/[slug]) [visual-engineering]

Wave 3 (Enhancement — after Wave 2):
├── Task 8: Cross-navigation between blog and works [quick]
├── Task 9: Port 3 Processing sketches to p5.js [deep]
└── Task 10: Image optimization + build verification [unspecified-high]

Wave 4 (Final verification — after Wave 3):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review [unspecified-high]
├── Task F3: Full site QA with Playwright [unspecified-high]
└── Task F4: Scope fidelity check [deep]

Critical Path: Task 1 → Task 4 → Task 7 → Task 10 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 4 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | 4 |
| 2 | — | 4, 10 |
| 3 | — | 4, 5, 6, 7 |
| 4 | 1, 2, 3 | 6, 7, 10 |
| 5 | 3 | 6, 7 |
| 6 | 4, 5 | 8 |
| 7 | 4, 5 | 8, 9, 10 |
| 8 | 6, 7 | F1-F4 |
| 9 | 7 | F1-F4 |
| 10 | 4, 7 | F1-F4 |
| F1-F4 | 8, 9, 10 | — |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks — T1 → `deep`, T2 → `quick`, T3 → `quick`
- **Wave 2**: 4 tasks — T4 → `unspecified-high`, T5 → `visual-engineering`, T6 → `visual-engineering`, T7 → `visual-engineering`
- **Wave 3**: 3 tasks — T8 → `quick`, T9 → `deep`, T10 → `unspecified-high`
- **Wave FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Scrape all 26 Indexhibit project pages into structured data

  **What to do**:
  - Write a Node.js script (`scripts/scrape-indexhibit.ts`) that fetches all 26 project pages from `limitist.cafe24.com/portfolio/`
  - Use the actual nyc3 theme HTML structure (NOT generic Indexhibit docs):
    - Sidebar navigation: `#menu .container ul` → extract categories and project list with URLs
    - Project title: `#content .container h1` (may have multiple h1 for bilingual titles)
    - Description text: `#content .container p` tags (preserve HTML for `<br>`, `<a>`, `<em>`)
    - Inline images: `#content .container img` (with captions from surrounding text)
    - Gallery thumbnails: `#content #img-container a.thickbox` (extract full-size `href`, not `th-*` thumbnail `src`)
    - Vimeo embeds: `#content iframe[src*="vimeo"]` (extract video IDs)
  - Parse the navigation sidebar ONCE from the index page to build the complete project list with categories:
    - `li.section-title` → category name
    - Subsequent `li a` → project name + URL (until next `section-title`)
  - For each project URL, fetch and parse the content page
  - Output a JSON file (`scripts/output/works-data.json`) with structure:
    ```json
    [{
      "slug": "imfxkorea",
      "title": "IMF x KOREA",
      "category": "Motion picture",
      "descriptionHtml": "<p>한국에서 IMF라는...</p><p>In South Korea...</p>",
      "inlineImages": [{"src": "IMFxKOREA_poster.jpg", "caption": "POSTER"}, ...],
      "galleryImages": ["33_0opening00140.jpg", "33_complete96054000110.jpg", ...],
      "vimeoIds": ["17610931", "17610421"],
      "order": 1
    }]
    ```
  - Derive slug from URL path (e.g., `/motionpicture/imfxkorea/` → `imfxkorea`)
  - Include order within category based on sidebar listing order
  - Handle the edge case where some projects appear under different URL prefixes (e.g., `motionpicture/` vs `filmanimation/` both under "Motion picture" category)
  - Add 1-second delay between fetches to be polite to cafe24 server
  - Log progress and any parsing errors

  **Must NOT do**:
  - Do NOT use generic Indexhibit selectors (`#index`, `#exhibit`, `#textspace`) — these don't match the nyc3 theme
  - Do NOT scrape the About Me page
  - Do NOT download images (they're already in the backup)
  - Do NOT modify any existing project files

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: HTML parsing requires careful selector analysis, handling edge cases in bilingual content, and different page layouts
  - **Skills**: [`dev-browser`]
    - `dev-browser`: Useful for verifying scraped content against live pages
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed — we're scraping server-side HTML, not interacting with JS-rendered content

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 4
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - None directly — this is a one-time migration script

  **API/Type References** (contracts to implement against):
  - Live site index: `https://limitist.cafe24.com/portfolio/` — sidebar navigation structure
  - Example project page: `https://limitist.cafe24.com/portfolio/index.php?/motionpicture/imfxkorea/` — content structure with bilingual text, inline images, gallery, Vimeo embeds
  - Example project page (info design): `https://limitist.cafe24.com/portfolio/index.php?/infodesign/oecd-trade-statistic/2/` — different layout, no Vimeo

  **External References**:
  - cheerio npm package for server-side HTML parsing: `https://cheerio.js.org/`

  **WHY Each Reference Matters**:
  - The live site pages are the authoritative source for selectors and content structure — the scraper must match these exactly
  - Different project types have different content patterns (video projects have iframes, graphic design has only galleries)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — scraper extracts all 26 projects
    Tool: Bash
    Preconditions: Node.js installed, network access to limitist.cafe24.com
    Steps:
      1. Run: npx tsx scripts/scrape-indexhibit.ts
      2. Verify exit code is 0
      3. Read scripts/output/works-data.json
      4. Count array length — assert: 26 items
      5. Verify each item has: slug, title, category, descriptionHtml (non-empty)
      6. Count unique categories — assert: 4 ("Motion picture", "Information design", "Graphic design", "D+programing")
      7. Find item with slug "imfxkorea" — assert: has 2 vimeoIds, has galleryImages array with 37 items
    Expected Result: JSON file with 26 complete project entries, all fields populated
    Failure Indicators: Exit code non-zero, fewer than 26 items, empty descriptionHtml fields
    Evidence: .sisyphus/evidence/task-1-scrape-output.json

  Scenario: Edge case — bilingual content preserved
    Tool: Bash
    Preconditions: Scraper has run successfully
    Steps:
      1. Read works-data.json, find "imfxkorea" entry
      2. Check descriptionHtml contains Korean text ("한국에서 IMF라는")
      3. Check descriptionHtml contains English text ("In South Korea, the word")
      4. Verify HTML tags preserved (<br>, <a>)
    Expected Result: Both languages present in descriptionHtml with HTML formatting intact
    Failure Indicators: Only one language present, or HTML stripped
    Evidence: .sisyphus/evidence/task-1-bilingual-check.txt
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `chore(works): scrape indexhibit content and organize images`
  - Files: `scripts/scrape-indexhibit.ts`, `scripts/output/works-data.json`
  - Pre-commit: `npx tsx scripts/scrape-indexhibit.ts`

- [x] 2. Copy and organize original images from backup

  **What to do**:
  - Write a script (`scripts/organize-images.ts`) that:
    1. Reads `migration_from_indexhibit/portfolio/files/gimgs/` directory
    2. Filters to ONLY original images (exclude `th-*` thumbnails and `sys-*` system copies)
    3. Groups images by their numeric prefix ID (e.g., `33_*.jpg` → project ID 33)
    4. After Task 1 completes, use `works-data.json` to map image IDs to project slugs
    5. Copies each original image to `src/data/works/{slug}/` directory
  - Also copy any images directly referenced in content that are NOT in `gimgs/` (e.g., `IMFxKOREA_poster.jpg`, `exhib_01.jpg` in `files/` root or `files/gimgs/` without numeric prefix)
  - Do NOT copy background images (`*_background.png` in `files/`)
  - Log: total images found, originals filtered, copied per project

  **Must NOT do**:
  - Do NOT copy `th-*` thumbnails or `sys-*` system copies
  - Do NOT copy `*_background.png` files
  - Do NOT modify original image files (no resizing/optimization yet — that's Task 10)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File system operations with straightforward logic — filtering and copying
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None needed for file operations

  **Parallelization**:
  - **Can Run In Parallel**: YES (initial scan/filter can start immediately, final copy needs Task 1 for slug mapping)
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 4, Task 10
  - **Blocked By**: Task 1 (for slug mapping)

  **References**:

  **Pattern References**:
  - `migration_from_indexhibit/portfolio/files/gimgs/` — 634 files with three naming patterns: `{id}_{name}`, `th-{id}_{name}`, `sys-{id}_{name}`
  - `migration_from_indexhibit/portfolio/files/` — background images and a few loose files (IMFxKOREA_poster.jpg, exhib_*.jpg)

  **WHY Each Reference Matters**:
  - The numeric ID prefix is the key to mapping images to projects — the scraper's JSON output will provide the ID-to-slug mapping

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — original images organized by project
    Tool: Bash
    Preconditions: Task 1 completed (works-data.json exists), backup directory accessible
    Steps:
      1. Run: npx tsx scripts/organize-images.ts
      2. List src/data/works/ — assert: 26 directories exist
      3. Count total image files: find src/data/works -name "*.jpg" -o -name "*.png" | wc -l
      4. Assert: no files matching pattern "th-*" exist in src/data/works/
      5. Assert: no files matching pattern "sys-*" exist in src/data/works/
      6. Assert: no files matching "*_background.png" exist in src/data/works/
      7. Check src/data/works/imfxkorea/ — assert: contains IMFxKOREA_poster.jpg, exhib_01.jpg, and 33_*.jpg files
    Expected Result: ~211 original images distributed across 26 project directories
    Failure Indicators: Thumbnail or system copies present, missing directories, zero images in a project folder
    Evidence: .sisyphus/evidence/task-2-image-inventory.txt

  Scenario: Edge case — loose images (non-gimgs) correctly handled
    Tool: Bash
    Preconditions: Script has run
    Steps:
      1. Check for IMFxKOREA_poster.jpg in src/data/works/imfxkorea/
      2. Check for exhib_01.jpg, exhib_02.jpg, exhib_03.jpg in src/data/works/imfxkorea/
    Expected Result: All inline-referenced images present in correct project directories
    Failure Indicators: Files missing or placed in wrong directory
    Evidence: .sisyphus/evidence/task-2-loose-images.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `chore(works): scrape indexhibit content and organize images`
  - Files: `scripts/organize-images.ts`, `src/data/works/*/` images

- [x] 3. Create works content collection schema and config

  **What to do**:
  - Update `src/content.config.ts` to add a new `works` collection alongside existing `blog` collection
  - Define frontmatter schema for works:
    ```typescript
    works: defineCollection({
      loader: glob({ pattern: '*/index.md', base: './src/data/works' }),
      schema: z.object({
        title: z.string(),
        category: z.enum(['Motion picture', 'Information design', 'Graphic design', 'D+programing']),
        order: z.number(),  // display order within category
        year: z.string().optional(),  // e.g., "2010"
        credits: z.string().optional(),  // raw credits text
        vimeoIds: z.array(z.string()).default([]),
        hasP5Sketch: z.boolean().default(false),
        galleryImages: z.array(z.string()).default([]),  // filenames of gallery images
      }),
    })
    ```
  - Use the same `glob` loader pattern as the blog collection
  - Create `src/data/works/` directory structure placeholder

  **Must NOT do**:
  - Do NOT modify the existing `blog` collection definition
  - Do NOT add fields that aren't needed (keep schema minimal)
  - Do NOT use `as any` or type workarounds

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small config file update following existing blog collection pattern
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None needed for config work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4, 5, 6, 7
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/content.config.ts` — Existing blog collection definition using `defineCollection` + `glob` loader + `z.object` schema. Follow this exact pattern for the works collection.

  **API/Type References**:
  - `src/content.config.ts:blog` schema — Shows how `z.coerce.date()`, `z.boolean().default()`, `z.array(z.string()).default([])` are used

  **External References**:
  - Astro Content Collections: `https://docs.astro.build/en/guides/content-collections/`

  **WHY Each Reference Matters**:
  - The existing blog collection is the template — works collection must follow the same loader and schema patterns for consistency

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — content config compiles
    Tool: Bash
    Preconditions: None
    Steps:
      1. Read src/content.config.ts — verify both `blog` and `works` collections defined
      2. Run: npx astro check (or npm run build) — assert: no TypeScript errors in content.config.ts
      3. Verify works schema has: title (string), category (enum), order (number), vimeoIds (string[]), hasP5Sketch (boolean), galleryImages (string[])
    Expected Result: content.config.ts compiles with both collections, no type errors
    Failure Indicators: TypeScript errors, missing fields, blog collection accidentally modified
    Evidence: .sisyphus/evidence/task-3-config-check.txt

  Scenario: Edge case — blog collection unchanged
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: git diff src/content.config.ts
      2. Verify only ADDITIONS (new works collection), no modifications to existing blog lines
    Expected Result: Blog collection definition byte-identical to before
    Failure Indicators: Any modification to blog collection lines
    Evidence: .sisyphus/evidence/task-3-blog-unchanged.txt
  ```

  **Commit**: YES (groups with Task 4)
  - Message: `feat(works): add works content collection with 26 projects`
  - Files: `src/content.config.ts`

- [x] 4. Generate 26 Markdown files from scraped data

  **What to do**:
  - Write a script (`scripts/generate-works-md.ts`) that reads `scripts/output/works-data.json` and generates one `index.md` per project in `src/data/works/{slug}/`
  - For each project, generate frontmatter matching the works schema:
    ```yaml
    ---
    title: "IMF x KOREA"
    category: "Motion picture"
    order: 1
    year: "2010"
    vimeoIds: ["17610931", "17610421"]
    hasP5Sketch: false
    galleryImages: ["33_0opening00140.jpg", "33_complete96054000110.jpg", ...]
    ---
    ```
  - Convert `descriptionHtml` to Markdown body:
    - `<br>` → newlines
    - `<a href="...">text</a>` → `[text](...)`
    - `<p>` → paragraph breaks
    - Preserve inline `<img>` references — convert to `![caption](./filename.jpg)` using local file references
    - Preserve Vimeo iframes as raw HTML in Markdown (Astro renders HTML in MD)
  - Extract `year` from description text where present (e.g., "2010." at end of credits)
  - For the 3 Processing projects (Balloon Blow, I Hear You, Number of Birds), set `hasP5Sketch: true`
  - Verify: every image referenced in the Markdown exists in the project's directory (cross-check with Task 2 output)

  **Must NOT do**:
  - Do NOT modify the scraped data — preserve original text exactly
  - Do NOT add commentary, extra formatting, or AI-generated descriptions
  - Do NOT strip bilingual content — keep both Korean and English text
  - Do NOT create index.md files for projects that weren't scraped

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Template generation with data transformation, HTML-to-Markdown conversion, cross-referencing with image files
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None needed for scripting

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (but must start first in wave, others depend on it)
  - **Blocks**: Tasks 6, 7, 10
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - `src/data/blog/*/index.md` — Any existing blog post shows the Markdown + frontmatter format expected by Astro content collections

  **API/Type References**:
  - `scripts/output/works-data.json` — Output from Task 1, the input for this script
  - `src/content.config.ts:works` schema (from Task 3) — Frontmatter must match this schema exactly

  **WHY Each Reference Matters**:
  - Blog posts show the exact frontmatter format Astro expects
  - The works schema defines what fields are required/optional — mismatch causes build errors

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — 26 Markdown files generated
    Tool: Bash
    Preconditions: Tasks 1-3 completed
    Steps:
      1. Run: npx tsx scripts/generate-works-md.ts
      2. Count: ls src/data/works/*/index.md | wc -l — assert: 26
      3. Read src/data/works/imfxkorea/index.md:
         - Verify frontmatter has title: "IMF x KOREA"
         - Verify frontmatter has category: "Motion picture"
         - Verify frontmatter has vimeoIds with 2 entries
         - Verify body contains Korean text
         - Verify body contains Vimeo iframe HTML
      4. Read src/data/works/oecd-trade-statistic/index.md:
         - Verify frontmatter has category: "Information design"
         - Verify galleryImages array has 11 entries
    Expected Result: 26 complete Markdown files with valid frontmatter and content
    Failure Indicators: Fewer than 26 files, frontmatter schema violations, empty body content
    Evidence: .sisyphus/evidence/task-4-markdown-sample.md

  Scenario: Edge case — image references resolve to local files
    Tool: Bash
    Preconditions: Script has run
    Steps:
      1. For each index.md, extract all image references (![...](...))
      2. Verify each referenced image file exists in the same directory
      3. Report any broken references
    Expected Result: Zero broken image references
    Failure Indicators: Any image path in Markdown that doesn't match an existing file
    Evidence: .sisyphus/evidence/task-4-image-refs-check.txt
  ```

  **Commit**: YES (groups with Task 3)
  - Message: `feat(works): add works content collection with 26 projects`
  - Files: `scripts/generate-works-md.ts`, `src/data/works/*/index.md`

- [x] 5. Build WorksLayout and WorksSidebar components

  **What to do**:
  - Create `src/layouts/WorksLayout.astro`:
    - Follow the Indexhibit.org/about design: left sidebar + right content area
    - White background, minimal typography, no decorative elements
    - Grid layout: sidebar (fixed width ~200px) | content (fluid)
    - Mobile: single column, sidebar collapses above content
    - Import and use `global.css` (same fonts, CSS variables as blog)
    - Include `<head>` with proper meta tags, matching BaseLayout's approach
    - Accept props: `title` (for `<title>` tag)
    - Include `<slot />` for page content
  - Create `src/components/WorksSidebar.astro`:
    - Site title: "YCN Works" linking to `/works/`
    - Category navigation: list all 4 categories with their projects underneath
    - Active state: highlight current project in sidebar
    - Accept props: `currentSlug` (optional, to highlight active item)
    - Fetch works collection data to build the navigation dynamically
    - Category order: Motion picture, Information design, Graphic design, D+programing
    - Within each category, order by the `order` frontmatter field
    - Style to match Indexhibit.org/about: simple text links, category titles as section headers, minimal spacing
  - Design language matching reference:
    - Font: inherit Pretendard from global.css
    - Colors: use `var(--color-accent)` for links, `var(--color-text)` for body text
    - Sidebar: subtle border or background separation (reference uses none — just whitespace)
    - Link to blog at bottom of sidebar: "Blog" or "YCN Blog" → `/`

  **Must NOT do**:
  - Do NOT override `font-family` — inherit from global.css
  - Do NOT hardcode colors — use CSS variables
  - Do NOT add JavaScript for sidebar toggle (keep it simple, CSS-only responsive)
  - Do NOT modify BaseLayout.astro or any existing components

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout and component design requiring visual design sensibility, responsive implementation, matching a design reference
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Design reference interpretation, responsive layout patterns
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed during build, only for verification

  **Parallelization**:
  - **Can Run In Parallel**: YES (once Task 3 provides the schema)
  - **Parallel Group**: Wave 2 (with Tasks 4, 6, 7)
  - **Blocks**: Tasks 6, 7
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `src/layouts/BaseLayout.astro` — Existing blog layout with sidebar + content grid. Follow the same `<head>` structure, meta tags, global.css import, but with a DIFFERENT sidebar component and potentially different grid proportions.
  - `src/components/Sidebar.astro` — Blog sidebar with avatar, intro text, archive navigation. WorksSidebar will have a similar structure but category-based navigation instead of date-based archive.
  - `src/styles/global.css` — CSS variables (`:root`), font declarations, word-break settings. WorksLayout MUST import this and use these variables.

  **External References**:
  - Design reference: `https://www.indexhibit.org/about/` — The target aesthetic: left nav with simple text links, right content area, white background, blue accent color (but use site's existing `--color-accent` instead)

  **WHY Each Reference Matters**:
  - BaseLayout shows the Astro layout pattern (head, slots, imports) to follow — don't reinvent
  - Sidebar.astro shows how to fetch collection data and build navigation — same pattern, different data
  - global.css is THE source for all design tokens — must use its variables, not introduce new ones
  - The Indexhibit.org/about page is the visual target — clean, minimal, sidebar nav with content area

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — WorksLayout renders with sidebar
    Tool: Playwright (playwright skill)
    Preconditions: Tasks 3-4 completed (content exists), dev server running
    Steps:
      1. Navigate to http://localhost:4321/works/
      2. Verify sidebar element exists with "YCN Works" title
      3. Verify 4 category headings visible: "Motion picture", "Information design", "Graphic design", "D+programing"
      4. Count project links in sidebar — assert: 26 links
      5. Verify content area has page content (not empty)
      6. Screenshot desktop viewport (1280x800)
    Expected Result: Two-column layout with sidebar navigation and content area, all categories and projects listed
    Failure Indicators: Missing sidebar, zero project links, broken layout, empty content
    Evidence: .sisyphus/evidence/task-5-desktop-layout.png

  Scenario: Mobile responsive — single column
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Set viewport to 375x812 (iPhone size)
      2. Navigate to http://localhost:4321/works/
      3. Verify layout is single column (sidebar above content, not side-by-side)
      4. Verify all 26 project links still accessible
      5. Screenshot mobile viewport
    Expected Result: Single-column layout, sidebar stacked above content, all navigation intact
    Failure Indicators: Horizontal scroll, overlapping elements, missing navigation
    Evidence: .sisyphus/evidence/task-5-mobile-layout.png
  ```

  **Commit**: YES (groups with Tasks 6, 7)
  - Message: `feat(works): add works layout, sidebar, and pages`
  - Files: `src/layouts/WorksLayout.astro`, `src/components/WorksSidebar.astro`

- [x] 6. Build Works index page (/works)

  **What to do**:
  - Create `src/pages/works/index.astro`:
    - Use WorksLayout
    - Fetch all works from the content collection
    - Group by category, ordered: Motion picture → Information design → Graphic design → D+programing
    - Within each category, sort by `order` field
    - Display as a clean list (matching Indexhibit.org/about simplicity):
      - Category heading (section title)
      - Project titles as links to `/works/{slug}/`
      - Optionally: year next to title
    - No thumbnails or image grid on index — keep it text-based like the Indexhibit reference
  - The index page IS the works landing page — it should show the full project catalog

  **Must NOT do**:
  - Do NOT add image thumbnails to the index (keep it Indexhibit-minimal: text list)
  - Do NOT add search, filtering, or pagination (26 items fits on one page)
  - Do NOT hardcode project lists — fetch dynamically from collection

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Page layout following design reference, data fetching from content collection
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Clean list layout design
  - **Skills Evaluated but Omitted**:
    - None additional needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7) — but needs Task 4 content and Task 5 layout
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - `src/pages/[...page].astro` — Blog index page. Shows how to fetch collection data, sort, and render in a list layout. Works index follows the same fetch pattern but groups by category instead of paginating by date.
  - `src/lib/archives.ts:getArchiveData()` — Groups blog posts by year/month. Similar grouping logic needed for works but by category.

  **External References**:
  - Design reference: `https://www.indexhibit.org/about/` — The sidebar IS effectively the index. The works index page content area can be a simple welcome or mirror the sidebar's project list with more detail.

  **WHY Each Reference Matters**:
  - Blog index page shows the Astro data-fetching and rendering pattern
  - archives.ts shows how to group content — apply same technique for categories

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — index lists all 26 projects grouped by category
    Tool: Playwright (playwright skill)
    Preconditions: Tasks 3-5 completed, dev server running
    Steps:
      1. Navigate to http://localhost:4321/works/
      2. Verify 4 category headings present
      3. Count total project links — assert: 26
      4. Verify first category is "Motion picture" with 12 items
      5. Click first project link — assert: navigates to /works/{slug}/
      6. Screenshot the full page
    Expected Result: Clean text-based index with all projects grouped by category
    Failure Indicators: Missing categories, wrong count, broken links
    Evidence: .sisyphus/evidence/task-6-works-index.png

  Scenario: Error case — 404 for non-existent work
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:4321/works/nonexistent-project/
      2. Assert: page returns 404 or shows error page
    Expected Result: Appropriate 404 response
    Failure Indicators: 500 error, blank page
    Evidence: .sisyphus/evidence/task-6-404-check.png
  ```

  **Commit**: YES (groups with Tasks 5, 7)
  - Message: `feat(works): add works layout, sidebar, and pages`
  - Files: `src/pages/works/index.astro`

- [x] 7. Build individual project pages (/works/[slug])

  **What to do**:
  - Create `src/pages/works/[...slug].astro`:
    - Use `getStaticPaths()` to generate paths for all 26 works
    - Use WorksLayout with `currentSlug` prop for sidebar active state
    - Render project content:
      1. Project title (h1)
      2. Markdown body (description text) via `<Content />` component
      3. Vimeo embeds: for each `vimeoId` in frontmatter, render responsive iframe
      4. Image gallery: for each `galleryImage` in frontmatter, render full-width image
      5. p5.js canvas placeholder: if `hasP5Sketch` is true, include a `<div id="p5-canvas">` and script tag loading the sketch
    - Vimeo iframe implementation:
      ```html
      <div class="video-container" style="aspect-ratio: 16/9;">
        <iframe src="https://player.vimeo.com/video/{id}?byline=0&portrait=0"
                width="100%" height="100%" frameborder="0"
                allow="autoplay; fullscreen" allowfullscreen></iframe>
      </div>
      ```
    - Gallery images: render inline, full-width, with lazy loading
    - p5.js loading: only include `<script src="https://cdn.jsdelivr.net/npm/p5@1/lib/p5.min.js">` on pages where `hasP5Sketch` is true
    - Responsive: images and videos should scale with content width

  **Must NOT do**:
  - Do NOT add lightbox/modal for images — display inline, simple
  - Do NOT load p5.js globally — only on pages that need it
  - Do NOT add navigation between projects (prev/next) — sidebar handles navigation
  - Do NOT modify image aspect ratios — render at natural size

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Dynamic page generation with multiple content types (text, images, video, canvas), responsive design
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Content rendering layout, responsive media handling
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed during build

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6)
  - **Blocks**: Tasks 8, 9, 10
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - `src/pages/posts/[...slug].astro` — Blog post page. Shows `getStaticPaths()`, `render()`, `<Content />` pattern. Works project page follows the same pattern with additional media handling.

  **API/Type References**:
  - Works content collection schema (Task 3) — Frontmatter fields available: title, category, vimeoIds, hasP5Sketch, galleryImages

  **External References**:
  - Astro dynamic routes: `https://docs.astro.build/en/guides/routing/#dynamic-routes`
  - p5.js CDN: `https://cdn.jsdelivr.net/npm/p5@1/lib/p5.min.js`

  **WHY Each Reference Matters**:
  - Blog post page is the direct template — same getStaticPaths + render pattern, just with additional media elements
  - The schema defines what data is available in frontmatter for conditional rendering (vimeo, p5.js, gallery)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — project with Vimeo + gallery renders
    Tool: Playwright (playwright skill)
    Preconditions: Tasks 3-5 completed, dev server running
    Steps:
      1. Navigate to http://localhost:4321/works/imfxkorea/
      2. Verify h1 contains "IMF x KOREA"
      3. Verify description text present (contains "한국에서 IMF라는")
      4. Count iframe[src*="vimeo"] — assert: 2 iframes
      5. Count gallery images — assert: > 30 images visible
      6. Verify sidebar highlights "IMF x KOREA" as active
      7. Screenshot full page
    Expected Result: Complete project page with text, 2 Vimeo embeds, 37 gallery images, active sidebar
    Failure Indicators: Missing video embeds, broken images, no active sidebar state
    Evidence: .sisyphus/evidence/task-7-project-vimeo.png

  Scenario: Happy path — project with only gallery (no video)
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:4321/works/oecd-trade-statistic/
      2. Verify title present
      3. Verify NO iframe elements on page
      4. Count gallery images — assert: 11
      5. Screenshot
    Expected Result: Project page with text and gallery only, no video embeds
    Failure Indicators: Unexpected iframe, wrong image count
    Evidence: .sisyphus/evidence/task-7-project-gallery.png

  Scenario: Edge case — all 26 project pages build
    Tool: Bash
    Preconditions: All content in place
    Steps:
      1. Run: npm run build
      2. Check dist/works/ — count directories: assert 26 + index
      3. Verify each directory has an index.html
    Expected Result: 27 directories in dist/works/ (index + 26 projects), all with index.html
    Failure Indicators: Build error, missing directories
    Evidence: .sisyphus/evidence/task-7-build-check.txt
  ```

  **Commit**: YES (groups with Tasks 5, 6)
  - Message: `feat(works): add works layout, sidebar, and pages`
  - Files: `src/pages/works/[...slug].astro`

- [x] 8. Add cross-navigation between blog and works

  **What to do**:
  - Update `src/components/Sidebar.astro` (blog sidebar):
    - Add a link to "/works/" labeled "Works" or "YCN Works" at an appropriate position (near the top, after the intro text or before the archive)
  - Update `src/components/WorksSidebar.astro`:
    - Ensure the link to blog ("Blog" or "YCN Blog" → `/`) is present at the bottom of the sidebar
  - The cross-navigation should be subtle and consistent with each section's design language
  - Both links should use `<a>` tags (not client-side routing — this is a static site)

  **Must NOT do**:
  - Do NOT add a top-level navigation bar — keep the sidebar-based navigation pattern
  - Do NOT change the blog layout structure
  - Do NOT add JavaScript for navigation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Minor additions to two existing components — a few lines each
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Overkill for adding two links

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 6, 7

  **References**:

  **Pattern References**:
  - `src/components/Sidebar.astro` — Current blog sidebar structure. Add the works link following the existing visual hierarchy.
  - `src/components/WorksSidebar.astro` (from Task 5) — Works sidebar where blog link should be placed.

  **WHY Each Reference Matters**:
  - Both sidebars need to be read to understand where cross-links fit naturally in the existing hierarchy

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — blog links to works
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, both sections built
    Steps:
      1. Navigate to http://localhost:4321/ (blog)
      2. Find link with href="/works/" in sidebar
      3. Click the link
      4. Assert: URL is now /works/
      5. Assert: Works sidebar visible with "YCN Works" title
    Expected Result: Seamless navigation from blog to works
    Failure Indicators: Link missing, 404 on click, wrong destination
    Evidence: .sisyphus/evidence/task-8-blog-to-works.png

  Scenario: Happy path — works links to blog
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:4321/works/
      2. Find link with href="/" in sidebar
      3. Click the link
      4. Assert: URL is now / (blog homepage)
      5. Assert: Blog sidebar visible
    Expected Result: Seamless navigation from works to blog
    Failure Indicators: Link missing, 404, wrong destination
    Evidence: .sisyphus/evidence/task-8-works-to-blog.png
  ```

  **Commit**: YES
  - Message: `feat(nav): add cross-navigation between blog and works`
  - Files: `src/components/Sidebar.astro`, `src/components/WorksSidebar.astro`

- [x] 9. Port 3 Processing sketches to p5.js

  **What to do**:
  - Port 3 Processing sketches from `.pde` (Java) to p5.js (JavaScript):
    1. **Balloon Blow** (`migration_from_indexhibit/portfolio/src/balloonBlow/`)
       - Main sketch: `Balloon_Blow_saii.pde`
       - Dependencies: `Block.pde`, `fanDisplay.pde`, `Obstruction.pde`, `ObstructionMove.pde`, `statusDisplay.pde`, `physics.jar`
       - **HIGH RISK**: Uses `physics.jar` (toxiclibs physics engine). If direct porting is too complex, fallback: record a screen capture video of the sketch running, embed as video instead.
       - p5.js physics alternative: use `matter.js` or simplified custom physics
    2. **I Hear Your Voice** (`migration_from_indexhibit/portfolio/src/iHearYou/`)
       - Read the .pde files to understand the sketch
       - Port to p5.js instance mode (avoid global namespace pollution)
    3. **Number of Birds** (`migration_from_indexhibit/portfolio/src/numberOfBirds/`)
       - Read the .pde files to understand the sketch
       - Port to p5.js instance mode
  - Processing → p5.js API mapping:
    - `size(w, h)` → `createCanvas(w, h)`
    - `pushMatrix()/popMatrix()` → `push()/pop()`
    - `PVector` → `p5.Vector`
    - `color(r,g,b)` → `color(r,g,b)` (same)
    - `int(x)` → `int(x)` or `Math.floor(x)`
    - Java class syntax → JavaScript class syntax
  - Use p5.js **instance mode** to avoid global scope conflicts:
    ```javascript
    const sketch = (p) => {
      p.setup = () => { p.createCanvas(800, 600); };
      p.draw = () => { /* ... */ };
    };
    new p5(sketch, document.getElementById('p5-canvas'));
    ```
  - Save each sketch as `src/data/works/{slug}/sketch.js`
  - Update the respective project's `index.md` frontmatter: `hasP5Sketch: true`
  - **Fallback strategy**: If Balloon Blow's physics dependency makes porting infeasible within reasonable effort, create a video recording of the original sketch running and embed that instead. Document the attempt and limitation.

  **Must NOT do**:
  - Do NOT load p5.js on non-sketch pages
  - Do NOT use p5.js global mode — must use instance mode
  - Do NOT spend more than ~2 hours per sketch on porting — use fallback if stuck
  - Do NOT modify the original Processing source files

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Code porting between languages (Java → JavaScript), physics engine adaptation, creative problem-solving for complex sketches
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not relevant — this is computational/algorithmic porting
    - `playwright`: Not needed during implementation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 10)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 7 (needs project pages to embed sketches)

  **References**:

  **Pattern References**:
  - `migration_from_indexhibit/portfolio/src/balloonBlow/Balloon_Blow_saii.pde` — Main Processing sketch for Balloon Blow. Read to understand the sketch behavior, then port.
  - `migration_from_indexhibit/portfolio/src/balloonBlow/Block.pde`, `Obstruction.pde`, etc. — Supporting classes. Must all be ported and combined into single sketch.js.
  - `migration_from_indexhibit/portfolio/src/iHearYou/` — I Hear Your Voice source files
  - `migration_from_indexhibit/portfolio/src/numberOfBirds/` — Number of Birds source files

  **External References**:
  - p5.js reference: `https://p5js.org/reference/`
  - p5.js instance mode: `https://p5js.org/reference/p5/p5/`
  - Processing → p5.js porting guide: `https://github.com/processing/p5.js/wiki/Processing-transition`
  - matter.js (physics alternative for Balloon Blow): `https://brm.io/matter-js/`

  **WHY Each Reference Matters**:
  - The .pde source files are the ONLY source of truth for what the sketches do — must be read thoroughly
  - p5.js instance mode docs are critical for avoiding global scope pollution
  - matter.js may be needed as a physics.jar replacement for Balloon Blow

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — p5.js sketch renders and animates
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, sketch.js files created
    Steps:
      1. Navigate to http://localhost:4321/works/balloon-blow/ (or fallback slug)
      2. Wait for canvas element to appear (selector: canvas, timeout: 10s)
      3. Verify canvas has non-zero dimensions (width > 0, height > 0)
      4. Take screenshot at t=0
      5. Wait 2 seconds
      6. Take screenshot at t=2s
      7. Compare screenshots — assert: pixels have changed (animation is running)
    Expected Result: Canvas element renders, animation runs (screenshots differ)
    Failure Indicators: No canvas, zero dimensions, identical screenshots (no animation)
    Evidence: .sisyphus/evidence/task-9-p5-balloon-t0.png, .sisyphus/evidence/task-9-p5-balloon-t2.png

  Scenario: Happy path — all 3 sketches load
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to each of the 3 p5.js project pages
      2. For each: verify canvas element exists
      3. For each: verify no JavaScript errors in console
    Expected Result: All 3 sketches load without errors
    Failure Indicators: Missing canvas, console errors
    Evidence: .sisyphus/evidence/task-9-all-sketches.txt

  Scenario: Fallback — Balloon Blow video if physics port fails
    Tool: Bash + Playwright
    Preconditions: If Balloon Blow p5.js port was infeasible
    Steps:
      1. Navigate to balloon-blow project page
      2. Verify either: canvas exists (port succeeded) OR video/iframe embed exists (fallback used)
      3. If fallback: verify video plays
    Expected Result: Either interactive sketch or video fallback — not a blank space
    Failure Indicators: Neither canvas nor video present
    Evidence: .sisyphus/evidence/task-9-balloon-fallback.png
  ```

  **Commit**: YES
  - Message: `feat(works): port 3 processing sketches to p5.js`
  - Files: `src/data/works/*/sketch.js` (3 files)

- [x] 10. Image optimization and full build verification

  **What to do**:
  - Review all ~211 images for size and format optimization:
    - Images > 2MB: compress with quality 85% (keep reasonable quality for portfolio)
    - Images > 4000px wide: resize to max 2000px width (sufficient for web display)
    - Use sharp or similar tool for batch processing
    - Keep originals' aspect ratios
  - Run `npm run build` and verify:
    - Zero build errors
    - All 26 works pages generated in dist/
    - All images present in build output
    - Blog pages still generate correctly (regression check)
  - Check total build size — flag if dist/ exceeds 500MB (GitHub Pages limit is 1GB)
  - Generate a build summary report

  **Must NOT do**:
  - Do NOT over-compress images (this is a design portfolio — image quality matters)
  - Do NOT change image filenames (would break Markdown references)
  - Do NOT modify blog content or images

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Image processing pipeline, build verification, regression checking
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: Build verification is Bash-based, Playwright for F3

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 7

  **References**:

  **Pattern References**:
  - `src/data/blog/*/` — Blog post images show the existing image handling pattern. Works images should be comparable in size/format.

  **External References**:
  - sharp npm package: `https://sharp.pixelplumbing.com/`
  - GitHub Pages limits: `https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#usage-limits`

  **WHY Each Reference Matters**:
  - Blog images set the baseline for acceptable image sizes
  - GitHub Pages has a 1GB repo size soft limit — must stay well under

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Happy path — build succeeds with all content
    Tool: Bash
    Preconditions: All tasks 1-9 completed
    Steps:
      1. Run: npm run build — assert: exit code 0
      2. Count dist/works/*/index.html — assert: 27 (index + 26 projects)
      3. Count dist/posts/*/index.html — assert: matches existing blog post count (regression)
      4. Check total dist/ size: du -sh dist/ — assert: under 500MB
    Expected Result: Clean build, all pages present, reasonable size
    Failure Indicators: Build error, missing pages, oversized output
    Evidence: .sisyphus/evidence/task-10-build-report.txt

  Scenario: Edge case — no oversized images
    Tool: Bash
    Preconditions: Images have been processed
    Steps:
      1. Find all images in src/data/works/ larger than 2MB: find src/data/works -size +2M
      2. Assert: zero results (all compressed)
    Expected Result: No images exceed 2MB
    Failure Indicators: Any file > 2MB found
    Evidence: .sisyphus/evidence/task-10-image-sizes.txt
  ```

  **Commit**: YES
  - Message: `chore(works): optimize images and verify build`
  - Files: optimized image files

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build`. Review all new/changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify CSS uses `var(--color-*)` not hardcoded values. Verify no `font-family` overrides in components.
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | CSS Vars [PASS/FAIL] | VERDICT`

- [x] F3. **Full Site QA with Playwright** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Navigate to every /works page (index + 26 projects). Verify: images load, text renders, Vimeo embeds present, p5.js canvases render, sidebar navigation works, cross-nav between blog/works works. Test mobile viewport. Test edge cases: empty state, 404. Save screenshots to `.sisyphus/evidence/final-qa/`.
  Output: `Pages [N/N pass] | Images [N/N load] | Videos [N/N embed] | p5.js [N/N render] | Nav [PASS/FAIL] | Mobile [PASS/FAIL] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Verify existing blog pages still render unchanged. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Blog Unchanged [PASS/FAIL] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| After | Message | Key Files |
|-------|---------|-----------|
| Task 1-2 | `chore(works): scrape indexhibit content and organize images` | `scripts/`, `src/data/works/` images |
| Task 3-4 | `feat(works): add works content collection with 26 projects` | `content.config.ts`, `src/data/works/*/index.md` |
| Task 5-7 | `feat(works): add works layout, sidebar, and pages` | `src/layouts/`, `src/components/`, `src/pages/works/` |
| Task 8 | `feat(nav): add cross-navigation between blog and works` | `src/components/Sidebar.astro`, `src/components/WorksSidebar.astro` |
| Task 9 | `feat(works): port 3 processing sketches to p5.js` | `src/data/works/*/sketch.js`, project pages |
| Task 10 | `chore(works): optimize images and verify build` | image files, build output |

---

## Success Criteria

### Verification Commands
```bash
npm run build          # Expected: exit 0, no errors
ls src/data/works/     # Expected: 26 directories
ls src/data/works/*/index.md | wc -l  # Expected: 26
```

### Final Checklist
- [x] All 26 projects migrated with complete text + images
- [x] /works index page renders with category grouping
- [x] All project pages accessible at /works/{slug}/
- [x] Vimeo embeds render on video projects
- [x] 3 p5.js sketches interactive in browser
- [x] Cross-navigation between blog and works
- [x] Mobile responsive
- [x] Blog functionality unchanged
- [x] `npm run build` succeeds
- [x] GitHub Pages deploys successfully
