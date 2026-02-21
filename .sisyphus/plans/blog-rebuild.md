# Astro Blog Rebuild — ycnam.github.io

## TL;DR

> **Quick Summary**: Rebuild personal blog from scratch using Astro SSG + Tailwind CSS v4 + Typography plugin, migrating 288 Tumblr posts with co-located images, deployed to GitHub Pages. Layout inspired by Daring Fireball — narrow single-content column with a sidebar.
> 
> **Deliverables**:
> - Fresh Astro project replacing old Gatsby artifacts
> - 288 migrated posts with co-located images in content collections
> - Daring Fireball-inspired responsive layout (sidebar 160px + content 425px, ~720px max)
> - Monthly archive sidebar navigation + About section
> - Dark mode (system preference) + RSS feed
> - GitHub Actions CI/CD for automatic deployment to ycnam.github.io
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 5 → Task 8 → Task 10 → Task 11 → F1-F4

---

## Context

### Original Request
Rebuild personal blog (ycnam.github.io) from scratch. Delete all existing Gatsby artifacts. Use Astro SSG with Tailwind CSS and Typography plugin. Migrate 288 Tumblr posts. Deploy to GitHub Pages.

### Interview Summary
**Key Discussions**:
- [Layout]: Daring Fireball-inspired. Sidebar 160px + Content 425px, max-width ~720px. Responsive.
- [Sidebar]: Monthly archive navigation + About section only. No categories, tags, related sites.
- [Post display]: No type badges. Date only.
- [Dark mode]: Yes, following system preference.
- [RSS feed]: Yes, via @astrojs/rss.
- [No comments]: No commenting system.
- [System fonts]: Helvetica Neue / Dotum / Georgia. No web fonts.
- [Migration edge cases]: Strip broken external images, keep generic titles, insert line breaks between concatenated images.

**Research Findings**:
- [Astro v5 breaking change]: Content config moved to `src/content.config.ts`, requires `glob` loader from `astro/loaders`. NOT v4 auto-discovery.
- [Tailwind v4]: Use `@tailwindcss/vite` plugin directly, NOT deprecated `@astrojs/tailwind`.
- [Typography v4]: `@plugin "@tailwindcss/typography"` in CSS file.
- [Migration data]: 288 posts with consistent frontmatter (date, draft, tags, title). 130 images in 88 directories. 20 posts have `tags: ""` (not array). 12 posts share image directories via `-2` suffix. 10 external image URLs are dead.
- [GitHub Pages]: `withastro/action@v5` for build+deploy. Must set Pages source to "GitHub Actions" in repo settings.

### Metis Review
**Identified Gaps** (all addressed):
- [Astro v5 API]: Must use `src/content.config.ts` + `glob` loader, not v4 patterns
- [Tags schema]: 20 posts have `tags: ""` — normalize in migration script
- [Shared image dirs]: 12 `-2` suffix posts reference parent image dirs — parse from markdown content
- [Concatenated images]: 4 posts with inline images — insert line breaks
- [Broken external images]: 10 dead URLs in 6 posts — strip
- [Escaped markdown]: `\>`, `\-`, `\*` are intentional — preserve
- [Bare URLs]: 39 posts with unlinked URLs — leave as-is
- [Git branch]: Master has Gatsby artifacts — wipe and start fresh
- [Slug derivation]: Use filename, not title (Korean titles → garbled slugs)

---

## Work Objectives

### Core Objective
Replace abandoned Gatsby blog with a clean Astro-based static blog. Migrate all 288 Tumblr posts with their images. Deploy automatically to GitHub Pages.

### Concrete Deliverables
- Astro project at repo root with Tailwind CSS v4 + Typography plugin
- 288 blog posts in content collections with co-located images
- Main page with 5-post pagination
- Individual post pages
- Monthly archive sidebar navigation
- About section in sidebar
- Dark mode (system preference)
- RSS feed at `/rss.xml`
- GitHub Actions workflow for automatic deployment
- Responsive layout (mobile-friendly)

### Definition of Done
- [ ] `npm run build` succeeds with exit code 0
- [ ] `dist/` contains 288+ post pages
- [ ] All 130 local images render correctly in posts
- [ ] Pagination works (58 pages at 5 posts each)
- [ ] Monthly archive pages exist for all months with posts
- [ ] Dark mode toggles via system preference
- [ ] RSS feed valid at `/rss.xml`
- [ ] GitHub Actions deploys successfully to ycnam.github.io

### Must Have
- All 288 posts migrated with correct dates, tags, and titles
- Co-located images per post directory
- Responsive layout matching DF-style narrow design
- Monthly archive sidebar navigation
- Pagination (5 posts per page)
- Dark mode support
- RSS feed
- Clean build with zero errors

### Must NOT Have (Guardrails)
- NO comments system (no Disqus, Giscus, or similar)
- NO search functionality
- NO tag cloud or category navigation
- NO top navigation bar
- NO web fonts (system fonts only)
- NO image optimization/responsive image pipeline (serve originals)
- NO auto-linking bare URLs with remark plugins
- NO modification of escaped markdown characters (`\>`, `\-`, `\*`)
- NO slug generation from Korean titles (use filenames)
- NO `@astrojs/tailwind` integration (deprecated — use `@tailwindcss/vite`)
- NO Astro v4 content collection patterns (use v5 `glob` loader)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (fresh project)
- **Automated tests**: None (static site — build success + Playwright QA)
- **Framework**: N/A

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Build verification**: `npm run build` → exit code 0
- **Content verification**: Bash commands to count files, check structure
- **Visual verification**: Playwright for layout, dark mode, pagination, responsive
- **RSS verification**: curl + parse XML

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — sequential within, but quick):
├── Task 1: Clean repo + scaffold Astro project [quick]
├── Task 2: Configure Tailwind CSS v4 + Typography + dark mode [quick]
└── Task 3: Define content collection schema + sample post [quick]

Wave 2 (Core modules — MAX PARALLEL after Wave 1):
├── Task 4: Build migration script [deep]
├── Task 5: Build base layout + sidebar component [visual-engineering]
├── Task 6: Build post list component + individual post page [visual-engineering]
└── Task 7: Build monthly archive data utility [quick]

Wave 3 (Integration — after Wave 2):
├── Task 8: Run migration script + verify 288 posts [unspecified-high]
├── Task 9: Build pagination on main page [quick]
├── Task 10: Wire sidebar with real archive data [visual-engineering]
└── Task 11: Add RSS feed + GitHub Actions workflow [quick]

Wave 4 (Polish — after Wave 3):
└── Task 12: Responsive design + dark mode polish [visual-engineering]

Wave FINAL (Verification — after ALL tasks, 4 parallel):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review [unspecified-high]
├── Task F3: Full visual QA via Playwright [unspecified-high]
└── Task F4: Scope fidelity check [deep]

Critical Path: T1 → T2 → T3 → T5 → T8 → T10 → T11 → F1-F4
Parallel Speedup: ~50% faster than sequential
Max Concurrent: 4 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | — | T2, T3, T4, T5, T6, T7 |
| T2 | T1 | T5, T6, T12 |
| T3 | T1 | T4, T6, T8 |
| T4 | T1, T3 | T8 |
| T5 | T1, T2 | T10, T12 |
| T6 | T1, T2, T3 | T9, T12 |
| T7 | T1 | T10 |
| T8 | T3, T4 | T9, T10, T11, T12 |
| T9 | T6, T8 | T12 |
| T10 | T5, T7, T8 | T12 |
| T11 | T8 | F1-F4 |
| T12 | T5, T6, T9, T10 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks — T1 `quick`, T2 `quick`, T3 `quick`
- **Wave 2**: 4 tasks — T4 `deep`, T5 `visual-engineering`, T6 `visual-engineering`, T7 `quick`
- **Wave 3**: 4 tasks — T8 `unspecified-high`, T9 `quick`, T10 `visual-engineering`, T11 `quick`
- **Wave 4**: 1 task — T12 `visual-engineering`
- **FINAL**: 4 tasks — F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

> Implementation + QA = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.

- [x] 1. Clean Repository + Scaffold Astro Project

  **What to do**:
  - Remove ALL Gatsby build artifacts from repo root: `*.js`, `*.js.map`, `*.css`, `chunk-map.json`, `webpack.stats.json`, `page-data/`, `static/`, `hello-world/`, `my-second-post/`, `index.html`, `*.LICENSE.txt`
  - Keep: `migration_from_tumblr/`, `.git/`, `.sisyphus/`
  - Initialize Astro project: `npm create astro@latest . -- --template minimal --no-git --no-install`
  - If Astro scaffolding conflicts with existing files, use a temp directory and move files
  - Install dependencies: `npm install`
  - Create `.gitignore` with: `node_modules/`, `dist/`, `.astro/`, `.DS_Store`
  - Verify: `npm run dev` starts without errors
  - Set `site: 'https://ycnam.github.io'` in `astro.config.mjs`

  **Must NOT do**:
  - Do NOT delete `migration_from_tumblr/`
  - Do NOT delete `.sisyphus/`
  - Do NOT install `@astrojs/tailwind` (deprecated)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
    - No special skills needed — basic file operations and npm commands

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential start)
  - **Blocks**: T2, T3, T4, T5, T6, T7
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - Current repo root files (read directory listing to identify what to delete)

  **External References**:
  - Astro docs: `https://docs.astro.build/en/install-and-setup/` — minimal template setup
  - Context7 `/withastro/docs` — "Astro project structure minimal setup"

  **Acceptance Criteria**:
  - [ ] No `.js`, `.js.map`, `.css` files remain in repo root (except Astro-generated)
  - [ ] No `page-data/`, `static/`, `hello-world/`, `my-second-post/` directories remain
  - [ ] `package.json` exists with Astro dependency
  - [ ] `astro.config.mjs` exists with `site: 'https://ycnam.github.io'`
  - [ ] `.gitignore` exists with `node_modules/`, `dist/`, `.astro/`
  - [ ] `npm run dev` starts successfully

  **QA Scenarios**:
  ```
  Scenario: Astro dev server starts cleanly
    Tool: Bash
    Preconditions: npm install completed
    Steps:
      1. Run `npm run dev &` and wait 5 seconds
      2. Run `curl -s http://localhost:4321 | head -5`
      3. Kill the dev server
    Expected Result: HTTP response received with HTML content
    Failure Indicators: Connection refused, build errors in terminal
    Evidence: .sisyphus/evidence/task-1-dev-server.txt

  Scenario: Gatsby artifacts fully removed
    Tool: Bash
    Preconditions: Cleanup completed
    Steps:
      1. Run `ls *.js *.map *.css chunk-map.json webpack.stats.json 2>/dev/null | wc -l`
      2. Run `ls -d page-data static hello-world my-second-post 2>/dev/null | wc -l`
    Expected Result: Both commands output 0
    Evidence: .sisyphus/evidence/task-1-cleanup-verify.txt
  ```

  **Commit**: YES
  - Message: `chore: clean repo and scaffold Astro project`
  - Files: All deleted Gatsby files + new Astro scaffold
  - Pre-commit: `npm run build`

- [ ] 2. Configure Tailwind CSS v4 + Typography Plugin + Dark Mode

  **What to do**:
  - Install: `npm install -D tailwindcss @tailwindcss/vite @tailwindcss/typography`
  - Configure `astro.config.mjs` to add `@tailwindcss/vite` to `vite.plugins`:
    ```javascript
    import { defineConfig } from 'astro/config';
    import tailwindcss from '@tailwindcss/vite';
    export default defineConfig({
      site: 'https://ycnam.github.io',
      vite: { plugins: [tailwindcss()] }
    });
    ```
  - Create `src/styles/global.css`:
    ```css
    @import "tailwindcss";
    @plugin "@tailwindcss/typography";
    ```
  - Configure dark mode: Add Tailwind's dark mode support (media strategy — follows system preference)
  - Define custom color tokens matching the Tumblr design:
    - Background: white / dark:gray-900
    - Text: gray-900 / dark:gray-100
    - Accent: #dd3333 (hover/links)
    - Muted: #555 (secondary text)
    - Borders: #ccc / dark equivalent
    - Sidebar bg: #eee / dark equivalent
  - Configure font families (system fonts):
    - Sans: "Helvetica Neue", Helvetica, "Dotum", Arial, sans-serif
    - Serif: Georgia, "Times New Roman", serif
    - Mono: Monaco, Consolas, monospace

  **Must NOT do**:
  - Do NOT use `@astrojs/tailwind` integration
  - Do NOT use Tailwind v3 config format (`tailwind.config.js` with `plugins: [require(...)]`)
  - Do NOT install web fonts

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Understanding Tailwind v4 CSS-first configuration

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T1)
  - **Parallel Group**: Wave 1 (after T1)
  - **Blocks**: T5, T6, T12
  - **Blocked By**: T1

  **References**:
  **External References**:
  - Context7 `/tailwindlabs/tailwindcss-typography` — "Install and configure Typography plugin for Tailwind v4"
  - Context7 `/withastro/docs` — "Add Tailwind CSS v4 to Astro project with vite plugin"
  - Tailwind v4 docs: `@plugin` syntax for plugins in CSS
  - Daring Fireball design: `https://daringfireball.net/` — color scheme and typography reference

  **Acceptance Criteria**:
  - [ ] `@tailwindcss/vite` in `astro.config.mjs` vite plugins
  - [ ] `@plugin "@tailwindcss/typography"` in `src/styles/global.css`
  - [ ] `npm run build` succeeds with Tailwind classes in output CSS
  - [ ] Dark mode CSS variables present in built output

  **QA Scenarios**:
  ```
  Scenario: Tailwind classes compile correctly
    Tool: Bash
    Preconditions: npm run build completed
    Steps:
      1. Run `npm run build`
      2. Run `grep -l "prose" dist/_astro/*.css`
      3. Run `grep -l "dark:" dist/_astro/*.css`
    Expected Result: At least one CSS file found for each grep
    Evidence: .sisyphus/evidence/task-2-tailwind-build.txt

  Scenario: Dark mode CSS exists
    Tool: Bash
    Steps:
      1. Run `grep "dark" dist/_astro/*.css | wc -l`
    Expected Result: Output > 0
    Evidence: .sisyphus/evidence/task-2-dark-mode.txt
  ```

  **Commit**: YES (group with T3)
  - Message: `feat: configure Tailwind v4, Typography, and content schema`
  - Files: `astro.config.mjs`, `src/styles/global.css`

- [ ] 3. Define Content Collection Schema + Sample Post

  **What to do**:
  - Create `src/content.config.ts` (Astro v5 location — NOT `src/content/config.ts`):
    ```typescript
    import { defineCollection } from 'astro:content';
    import { glob } from 'astro/loaders';
    import { z } from 'astro/zod';

    const blog = defineCollection({
      loader: glob({ pattern: '*/index.md', base: './src/data/blog' }),
      schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        draft: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
      }),
    });

    export const collections = { blog };
    ```
  - Create `src/data/blog/` directory
  - Create one sample post to verify: `src/data/blog/2024-01-01-test-post/index.md` with frontmatter matching the schema
  - Verify the collection loads: create a minimal `src/pages/index.astro` that queries the collection
  - Test with `npm run build` — verify post is accessible

  **Must NOT do**:
  - Do NOT use `src/content/config.ts` (v4 location)
  - Do NOT use auto-discovery (v4 pattern) — must use explicit `glob` loader
  - Do NOT import `z` from `zod` package — use `astro/zod`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1, parallel with T2)
  - **Parallel Group**: Wave 1 (after T1)
  - **Blocks**: T4, T6, T8
  - **Blocked By**: T1

  **References**:
  **External References**:
  - Context7 `/withastro/docs` — "Astro v5 content collections with glob loader and content.config.ts"
  - Context7 `/llmstxt/astro_build_llms_txt` — "Astro content layer API glob loader setup"
  - Metis findings: Must use `src/content.config.ts`, `glob` from `astro/loaders`, `z` from `astro/zod`

  **WHY Each Reference Matters**:
  - Astro v5 changed the content collection API significantly from v4. Using v4 patterns will fail silently or throw confusing errors. The `glob` loader + `content.config.ts` location are mandatory for v5.

  **Acceptance Criteria**:
  - [ ] `src/content.config.ts` exists with `glob` loader pointing to `./src/data/blog`
  - [ ] `src/data/blog/2024-01-01-test-post/index.md` exists with valid frontmatter
  - [ ] `npm run build` succeeds and generates a page for the sample post

  **QA Scenarios**:
  ```
  Scenario: Content collection loads sample post
    Tool: Bash
    Steps:
      1. Run `npm run build`
      2. Run `find dist -name "*.html" | grep -v "_astro" | wc -l`
    Expected Result: At least 2 HTML files (index + test post)
    Evidence: .sisyphus/evidence/task-3-collection-build.txt

  Scenario: Schema validates frontmatter correctly
    Tool: Bash
    Steps:
      1. Create a malformed test post with missing title field
      2. Run `npm run build 2>&1`
      3. Check for Zod validation error
      4. Remove malformed post
    Expected Result: Build fails with clear schema validation error
    Evidence: .sisyphus/evidence/task-3-schema-validation.txt
  ```

  **Commit**: YES (group with T2)
  - Message: `feat: configure Tailwind v4, Typography, and content schema`

- [ ] 4. Build Migration Script for Tumblr Posts

  **What to do**:
  - Create `scripts/migrate.mjs` — a standalone Node.js script (no external deps, use built-in `fs`, `path`)
  - Script reads all `.md` files from `migration_from_tumblr/posts/`
  - For each post:
    1. Parse YAML frontmatter
    2. Create directory `src/data/blog/{filename-without-ext}/`
    3. Copy `.md` file as `index.md` in that directory
    4. **Normalize tags**: If `tags: ""` (bare string), convert to `tags: []`
    5. **Update image paths**: Replace `./tumblr_img/{slug}/{hash}.{ext}` → `./{hash}.{ext}`
    6. **Copy co-located images**: Parse markdown content for `![image](./tumblr_img/...` references, resolve actual files from `migration_from_tumblr/posts/tumblr_img/`, copy to post directory. Handle shared image dirs (the `-2` suffix posts reference parent directories).
    7. **Strip broken external images**: Remove `![image](http://...)` tags where URL starts with `http`
    8. **Split concatenated images**: Insert `\n\n` between consecutive `![image](...)`
  - Copy `migration_from_tumblr/assets/avatar.png` → `src/assets/avatar.png`
  - Print summary at end: total posts processed, images copied, errors
  - Script must be idempotent (can be run multiple times — wipes `src/data/blog/` first)

  **Must NOT do**:
  - Do NOT modify escaped markdown characters (`\>`, `\-`, `\*`) — these are intentional
  - Do NOT auto-link bare URLs
  - Do NOT rename image files (hash filenames are unique and fine)
  - Do NOT modify post content beyond: tag normalization, image path updates, external image removal, concatenated image splitting
  - Do NOT source images from `migration_from_tumblr/assets/tumblr_img/` — use `migration_from_tumblr/posts/tumblr_img/` only

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
    - Deep category for complex logic: YAML parsing, path resolution, edge case handling for 288 files with known data inconsistencies

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1, parallel with T5/T6/T7)
  - **Parallel Group**: Wave 2 (with T5, T6, T7)
  - **Blocks**: T8
  - **Blocked By**: T1, T3

  **References**:
  **Pattern References**:
  - `migration_from_tumblr/posts/2014-08-30--.md` — Sample text post with tags and blockquotes
  - `migration_from_tumblr/posts/2011-12-08-facebook-app-for-ios.md` — Sample image post: `![image](./tumblr_img/2011-12-08-facebook-app-for-ios/{hash}.jpg)`
  - `migration_from_tumblr/posts/2013-11-12-quote-post.md` — Sample quote post with generic title
  - `migration_from_tumblr/posts/tumblr_img/` — Source directory for images (88 subdirectories, 130 files)

  **API/Type References**:
  - `src/content.config.ts` — Schema defines: `title` (string), `date` (coerce.date), `draft` (boolean), `tags` (array of strings)

  **WHY Each Reference Matters**:
  - Sample posts show the exact frontmatter format and image reference syntax the script must parse
  - The content schema defines what the migration output must conform to (especially `tags` as array)
  - The `tumblr_img` directory structure shows how asset folders map to posts

  **Acceptance Criteria**:
  - [ ] `scripts/migrate.mjs` exists and is executable with `node scripts/migrate.mjs`
  - [ ] Script runs without errors when executed
  - [ ] Script creates 288 directories under `src/data/blog/`
  - [ ] Each directory contains `index.md` with valid frontmatter
  - [ ] All `tags: ""` normalized to `tags: []`
  - [ ] Image paths updated from `./tumblr_img/...` to `./...`
  - [ ] Images copied to co-located directories
  - [ ] Broken external image references removed
  - [ ] `src/assets/avatar.png` exists

  **QA Scenarios**:
  ```
  Scenario: Migration script runs successfully on all 288 posts
    Tool: Bash
    Preconditions: migration_from_tumblr/ exists with posts/ and assets/
    Steps:
      1. Run `node scripts/migrate.mjs`
      2. Run `find src/data/blog -name "index.md" | wc -l`
      3. Run `find src/data/blog \( -name "*.png" -o -name "*.jpg" \) | wc -l`
    Expected Result: 288 index.md files, >= 130 image files
    Failure Indicators: Script error output, count mismatch
    Evidence: .sisyphus/evidence/task-4-migration-run.txt

  Scenario: Tags normalization verified
    Tool: Bash
    Steps:
      1. Run `grep 'tags: ""' src/data/blog/*/index.md | wc -l`
      2. Run `grep 'tags: \[\]' src/data/blog/*/index.md | wc -l`
    Expected Result: 0 bare empty string tags, 20+ empty array tags
    Evidence: .sisyphus/evidence/task-4-tags-normalize.txt

  Scenario: Image paths updated correctly
    Tool: Bash
    Steps:
      1. Run `grep -r './tumblr_img/' src/data/blog/ | wc -l`
      2. Run `grep -r '!\[image\](\./' src/data/blog/ | head -3`
    Expected Result: 0 old-style paths, new paths start with `./` (no tumblr_img)
    Evidence: .sisyphus/evidence/task-4-image-paths.txt

  Scenario: External images stripped
    Tool: Bash
    Steps:
      1. Run `grep -r '!\[image\](http' src/data/blog/ | wc -l`
    Expected Result: 0 external image references
    Evidence: .sisyphus/evidence/task-4-external-images.txt
  ```

  **Commit**: YES
  - Message: `feat: add migration script for Tumblr posts`
  - Files: `scripts/migrate.mjs`

- [ ] 5. Build Base Layout + Sidebar Component

  **What to do**:
  - Create `src/layouts/BaseLayout.astro`:
    - HTML skeleton with `<html lang="ko">`, `<head>` with meta tags, `<body>`
    - Import and apply `src/styles/global.css`
    - 2-column layout: sidebar (160px) + main content (425px)
    - Max-width container ~720px, centered
    - Blog title "Limitist:Log" at top (Georgia serif, large)
    - Dark mode: `class` or `media` strategy on `<html>`
    - `<slot />` for page content
  - Create `src/components/Sidebar.astro`:
    - **About section**: Avatar image (from `src/assets/avatar.png`) + description "UX, Design, IT, 조직에 대한 잡설들"
    - **Monthly archive**: Placeholder structure (real data wired in T10). List of year > month links.
    - Widget styling: section headers (uppercase, small, muted), content areas
  - Create `src/components/Footer.astro`:
    - Simple footer with copyright: "© {year} Limitist:Log"
  - Layout proportions (Daring Fireball inspired):
    - Sidebar: `w-40` (160px), left side
    - Content: `max-w-[425px]` or similar
    - Gap between columns
    - On mobile (<640px): single column, sidebar moves below content

  **Must NOT do**:
  - Do NOT add top navigation bar
  - Do NOT add search
  - Do NOT use web fonts

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Layout engineering, Tailwind CSS, responsive design, DF-style aesthetic

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1+T2)
  - **Parallel Group**: Wave 2 (with T4, T6, T7)
  - **Blocks**: T10, T12
  - **Blocked By**: T1, T2

  **References**:
  **External References**:
  - Daring Fireball: `https://daringfireball.net/` — Layout reference (narrow sidebar left, content right)
  - Context7 `/withastro/docs` — "Astro layouts with slot and BaseLayout pattern"
  - Context7 `/tailwindlabs/tailwindcss-typography` — "prose class configuration for blog articles"

  **WHY Each Reference Matters**:
  - Daring Fireball is the explicit design reference — sidebar on left, narrow content, minimal chrome
  - BaseLayout pattern is the Astro convention for shared page structure

  **Acceptance Criteria**:
  - [ ] `src/layouts/BaseLayout.astro` exists with 2-column layout
  - [ ] `src/components/Sidebar.astro` exists with About + archive placeholder
  - [ ] `src/components/Footer.astro` exists
  - [ ] Layout renders at ~720px max-width with sidebar 160px + content area
  - [ ] `<html lang="ko">` set for Korean content

  **QA Scenarios**:
  ```
  Scenario: Layout renders correctly with 2-column design
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running at localhost:4321
    Steps:
      1. Navigate to http://localhost:4321
      2. Take screenshot at viewport 1024x768
      3. Assert: Sidebar visible on left side (element with about/archive content)
      4. Assert: Main content area visible on right side
      5. Assert: Total layout width <= 720px (centered on page)
    Expected Result: 2-column layout visible, sidebar + content proportions correct
    Evidence: .sisyphus/evidence/task-5-layout-desktop.png

  Scenario: Layout collapses to single column on mobile
    Tool: Playwright (playwright skill)
    Steps:
      1. Set viewport to 375x812 (iPhone)
      2. Navigate to http://localhost:4321
      3. Take screenshot
      4. Assert: Content is full-width, sidebar is below or hidden
    Expected Result: Single column layout, no horizontal overflow
    Evidence: .sisyphus/evidence/task-5-layout-mobile.png
  ```

  **Commit**: YES (group with T6+T7)
  - Message: `feat: build layout, post components, and archive utility`

- [ ] 6. Build Post List Component + Individual Post Page

  **What to do**:
  - Create `src/components/PostCard.astro`:
    - Shows post title, date (formatted), and excerpt/content preview
    - Date format: "YYYY년 M월 D일" or "Month DD, YYYY" (match original Tumblr style)
    - Title links to individual post page
    - No type badge (removed per user decision)
    - Styled with Tailwind: clean typography, spacing
  - Create `src/pages/posts/[...slug].astro`:
    - Dynamic route for individual posts
    - Uses `getStaticPaths()` with `getCollection('blog')`
    - Renders post content with `render()` and `<Content />`
    - Wraps content in `<article class="prose dark:prose-invert">` for Typography plugin
    - Shows: title, date, full content, tags
    - Uses BaseLayout
  - Create a minimal `src/pages/index.astro`:
    - Lists all posts sorted by date (newest first)
    - Uses PostCard component
    - Shows 5 posts (pagination added in T9)

  **Must NOT do**:
  - Do NOT add post type badges
  - Do NOT add comments section
  - Do NOT add share buttons

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Post card design, Typography prose styling, responsive content

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1+T2+T3)
  - **Parallel Group**: Wave 2 (with T4, T5, T7)
  - **Blocks**: T9, T12
  - **Blocked By**: T1, T2, T3

  **References**:
  **External References**:
  - Context7 `/withastro/docs` — "Astro dynamic routes getStaticPaths for blog posts with content collections"
  - Context7 `/tailwindlabs/tailwindcss-typography` — "prose class with element modifiers for blog post styling"
  - Daring Fireball: `https://daringfireball.net/` — Post display: date header, clean text, minimal metadata

  **Acceptance Criteria**:
  - [ ] `src/components/PostCard.astro` exists
  - [ ] `src/pages/posts/[...slug].astro` exists and generates pages for all posts
  - [ ] `src/pages/index.astro` lists posts sorted by date
  - [ ] Individual post page wraps content in `prose dark:prose-invert` classes
  - [ ] Dates displayed in readable format

  **QA Scenarios**:
  ```
  Scenario: Individual post page renders with typography
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, at least 1 post exists
    Steps:
      1. Navigate to http://localhost:4321
      2. Click first post title link
      3. Assert: Post title visible (h1 or h2)
      4. Assert: Post date visible
      5. Assert: Post content is within `article.prose` element
      6. Take screenshot
    Expected Result: Post renders with proper typography styling
    Evidence: .sisyphus/evidence/task-6-post-page.png

  Scenario: Post list shows posts in reverse chronological order
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to http://localhost:4321
      2. Get text content of all date elements
      3. Assert: Dates are in descending order
    Expected Result: Newest post appears first
    Evidence: .sisyphus/evidence/task-6-post-order.txt
  ```

  **Commit**: YES (group with T5+T7)
  - Message: `feat: build layout, post components, and archive utility`

- [ ] 7. Build Monthly Archive Data Utility

  **What to do**:
  - Create `src/lib/archives.ts`:
    - Function `getArchiveData()` that:
      1. Gets all posts from the blog collection
      2. Groups them by year and month
      3. Returns structured data: `{ year: number, months: { month: number, count: number, url: string }[] }[]`
      4. Sorted: years descending, months descending
    - Function `getPostsByMonth(year: number, month: number)` for archive pages
  - Create `src/pages/[year]/[month]/index.astro`:
    - Dynamic route for monthly archive pages
    - Uses `getStaticPaths()` to generate pages for all year/month combinations
    - Lists all posts for that month with PostCard component
    - Title: "YYYY년 MM월 아카이브" or similar

  **Must NOT do**:
  - Do NOT add year-only archive pages (only month-level)
  - Do NOT add tag-based archive pages

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1)
  - **Parallel Group**: Wave 2 (with T4, T5, T6)
  - **Blocks**: T10
  - **Blocked By**: T1

  **References**:
  **External References**:
  - Context7 `/withastro/docs` — "Astro dynamic routes getStaticPaths for archive pages"
  - Alex Vernacchia blog reference: Month and year pages pattern for Astro content collections

  **Acceptance Criteria**:
  - [ ] `src/lib/archives.ts` exists with `getArchiveData()` function
  - [ ] `src/pages/[year]/[month]/index.astro` exists
  - [ ] Archive pages generated for each month that has posts
  - [ ] Posts on archive page are correct for that month

  **QA Scenarios**:
  ```
  Scenario: Archive page renders for a specific month
    Tool: Bash
    Preconditions: Build completed with migrated posts
    Steps:
      1. Run `npm run build`
      2. Run `ls dist/2012/07/index.html`
      3. Run `grep -c "post" dist/2012/07/index.html` (rough count of post entries)
    Expected Result: index.html exists, contains post entries for July 2012
    Evidence: .sisyphus/evidence/task-7-archive-page.txt

  Scenario: All months with posts have archive pages
    Tool: Bash
    Steps:
      1. Extract unique year-month from all post dates
      2. Check corresponding dist/ pages exist
    Expected Result: 1:1 mapping between months-with-posts and archive pages
    Evidence: .sisyphus/evidence/task-7-archive-coverage.txt
  ```

  **Commit**: YES (group with T5+T6)
  - Message: `feat: build layout, post components, and archive utility`

- [ ] 8. Run Migration Script + Verify 288 Posts

  **What to do**:
  - Execute `node scripts/migrate.mjs`
  - Verify output: 288 directories created in `src/data/blog/`
  - Verify images: >= 130 image files co-located with posts
  - Verify tags normalization: no `tags: ""` remaining
  - Verify image paths: no `./tumblr_img/` references remaining
  - Verify external images stripped: no `![image](http` references
  - Run `npm run build` to verify ALL 288 posts build successfully with Astro
  - Fix any build errors (likely schema mismatches or path issues)
  - Remove the sample test post from T3 (`src/data/blog/2024-01-01-test-post/`)

  **Must NOT do**:
  - Do NOT manually edit individual posts (fix at script level if possible)
  - Do NOT modify post content beyond what the migration script handles

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
    - Needs to handle potentially complex build errors across 288 posts

  **Parallelization**:
  - **Can Run In Parallel**: NO (must run after migration script is built and schema defined)
  - **Parallel Group**: Wave 3 (sequential start)
  - **Blocks**: T9, T10, T11, T12
  - **Blocked By**: T3, T4

  **References**:
  **Pattern References**:
  - `scripts/migrate.mjs` — The migration script built in T4
  - `src/content.config.ts` — Schema definition from T3

  **Acceptance Criteria**:
  - [ ] 288 directories exist in `src/data/blog/`
  - [ ] `npm run build` succeeds with 0 errors
  - [ ] `dist/` contains HTML pages for all 288 posts
  - [ ] No `tags: ""` in any migrated post
  - [ ] No `./tumblr_img/` paths in any migrated post
  - [ ] No `![image](http` in any migrated post
  - [ ] Test post removed

  **QA Scenarios**:
  ```
  Scenario: All 288 posts build successfully
    Tool: Bash
    Steps:
      1. Run `node scripts/migrate.mjs 2>&1 | tail -5`
      2. Run `find src/data/blog -name "index.md" | wc -l`
      3. Run `npm run build 2>&1 | tail -10`
      4. Run `find dist/posts -name "index.html" | wc -l`
    Expected Result: 288 markdown files, build succeeds, 288 HTML pages generated
    Failure Indicators: Build errors, missing pages
    Evidence: .sisyphus/evidence/task-8-full-build.txt

  Scenario: Random sample posts render correctly
    Tool: Bash
    Steps:
      1. Check 3 random posts exist: `cat dist/posts/2014-08-30--/index.html | head -5`
      2. Check a post with images: `cat dist/posts/2011-12-08-facebook-app-for-ios/index.html | grep "img" | wc -l`
      3. Check a quote post: `cat dist/posts/2013-11-12-quote-post/index.html | head -5`
    Expected Result: All 3 posts render as HTML with content
    Evidence: .sisyphus/evidence/task-8-sample-posts.txt
  ```

  **Commit**: YES
  - Message: `feat: migrate 288 Tumblr posts with images`
  - Files: `src/data/blog/**` (288 directories with .md + images)

- [ ] 9. Build Pagination on Main Page

  **What to do**:
  - Refactor `src/pages/index.astro` to use pagination:
    - Rename/restructure to `src/pages/[...page].astro` (rest params for clean page-1 URL)
    - Use `getStaticPaths({ paginate })` with `pageSize: 5`
    - Sort posts by date descending
    - Render `page.data` with PostCard component
  - Create `src/components/Pagination.astro`:
    - Previous / Next navigation links
    - Style: Clean, minimal (similar to original Tumblr style — Georgia serif links)
    - Show: "← 이전" / "다음 →" or "← Previous" / "Next →"
    - Use `page.url.prev` and `page.url.next`

  **Must NOT do**:
  - Do NOT add page number indicators (just prev/next)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T6+T8)
  - **Parallel Group**: Wave 3 (with T10, T11)
  - **Blocks**: T12
  - **Blocked By**: T6, T8

  **References**:
  **External References**:
  - Context7 `/withastro/docs` — "Astro pagination with paginate function in getStaticPaths rest params"

  **Acceptance Criteria**:
  - [ ] Main page shows exactly 5 posts
  - [ ] "Next" link appears on page 1
  - [ ] "Previous" link appears on page 2+
  - [ ] Total pages = ceil(288/5) = 58 pages generated
  - [ ] Page 1 URL is `/` (clean, no `/1/`)

  **QA Scenarios**:
  ```
  Scenario: Pagination generates correct number of pages
    Tool: Bash
    Steps:
      1. Run `npm run build`
      2. Count pagination pages: `find dist -maxdepth 1 -name "[0-9]*" -type d | wc -l`
      3. Check page 1 is root: `head -5 dist/index.html`
      4. Check page 2 exists: `head -5 dist/2/index.html`
    Expected Result: 57 numbered directories (pages 2-58) + root index = 58 total pages
    Evidence: .sisyphus/evidence/task-9-pagination.txt

  Scenario: Page 1 shows exactly 5 posts with Next link
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to http://localhost:4321
      2. Count post card elements
      3. Assert: Exactly 5 post cards visible
      4. Assert: "Next" or "다음" link visible
      5. Assert: "Previous" or "이전" link NOT visible
    Expected Result: 5 posts, Next link present, no Previous link
    Evidence: .sisyphus/evidence/task-9-page1.png
  ```

  **Commit**: YES (group with T10+T11)
  - Message: `feat: add pagination, archive sidebar, RSS, CI/CD`

- [ ] 10. Wire Sidebar with Real Archive Data

  **What to do**:
  - Update `src/components/Sidebar.astro` to use `getArchiveData()` from `src/lib/archives.ts`
  - Render actual monthly archive links grouped by year:
    ```
    2016
      1월 (1)
    2014
      8월 (1)
    2013
      11월 (3)
      9월 (2)
      ...
    ```
  - Each link navigates to `/{year}/{month}/`
  - About section: Display avatar image + description
  - Ensure sidebar data loads on all pages (BaseLayout passes it down)
  - Style: Minimal widget headers, clean list formatting, muted colors

  **Must NOT do**:
  - Do NOT add category or tag widgets
  - Do NOT add external links widget

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T5+T7+T8)
  - **Parallel Group**: Wave 3 (with T9, T11)
  - **Blocks**: T12
  - **Blocked By**: T5, T7, T8

  **References**:
  **Pattern References**:
  - `src/lib/archives.ts` — Archive data utility from T7
  - `src/components/Sidebar.astro` — Sidebar component from T5

  **Acceptance Criteria**:
  - [ ] Sidebar shows clickable monthly archive links for all months with posts
  - [ ] Archive links grouped by year, sorted descending
  - [ ] Each link shows month name and post count
  - [ ] About section shows avatar and description
  - [ ] Clicking an archive link navigates to the correct archive page

  **QA Scenarios**:
  ```
  Scenario: Sidebar displays archive navigation with real data
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to http://localhost:4321
      2. Assert: Sidebar contains year headers (2016, 2014, 2013, 2012, 2011)
      3. Assert: Each year contains month links with counts
      4. Click on a month link (e.g., "2012 > 7월")
      5. Assert: Navigated to /2012/07/ with posts from July 2012
    Expected Result: Archive navigation is fully functional
    Evidence: .sisyphus/evidence/task-10-sidebar-archive.png

  Scenario: About section renders in sidebar
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to http://localhost:4321
      2. Assert: Avatar image is visible in sidebar
      3. Assert: Description text visible
    Expected Result: About widget with avatar + description
    Evidence: .sisyphus/evidence/task-10-sidebar-about.png
  ```

  **Commit**: YES (group with T9+T11)
  - Message: `feat: add pagination, archive sidebar, RSS, CI/CD`

- [ ] 11. Add RSS Feed + GitHub Actions Workflow

  **What to do**:
  - **RSS Feed**:
    - Install `@astrojs/rss`: `npm install @astrojs/rss`
    - Create `src/pages/rss.xml.ts`:
      ```typescript
      import rss from '@astrojs/rss';
      import { getCollection } from 'astro:content';

      export async function GET(context) {
        const posts = await getCollection('blog');
        return rss({
          title: 'Limitist:Log',
          description: 'UX, Design, IT, 조직에 대한 잡설들',
          site: context.site,
          items: posts
            .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
            .slice(0, 20)
            .map(post => ({
              title: post.data.title,
              pubDate: post.data.date,
              link: `/posts/${post.id}/`,
            })),
        });
      }
      ```
  - **GitHub Actions Workflow**:
    - Create `.github/workflows/deploy.yml`:
      ```yaml
      name: Deploy to GitHub Pages
      on:
        push:
          branches: [main]
        workflow_dispatch:
      permissions:
        contents: read
        pages: write
        id-token: write
      jobs:
        build:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v5
            - uses: withastro/action@v5
        deploy:
          needs: build
          runs-on: ubuntu-latest
          environment:
            name: github-pages
            url: ${{ steps.deployment.outputs.page_url }}
          steps:
            - id: deployment
              uses: actions/deploy-pages@v4
      ```
    - Note: The default branch is `master`. Either rename to `main` or update workflow trigger to `master`. Recommend using `master` to match existing repo.

  **Must NOT do**:
  - Do NOT add sitemap (not requested)
  - Do NOT force push or rewrite history

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T8)
  - **Parallel Group**: Wave 3 (with T9, T10)
  - **Blocks**: F1-F4
  - **Blocked By**: T8

  **References**:
  **External References**:
  - Context7 `/withastro/docs` — "Astro RSS feed with @astrojs/rss package"
  - Context7 `/withastro/docs` — "Deploy Astro to GitHub Pages with GitHub Actions"

  **Acceptance Criteria**:
  - [ ] `src/pages/rss.xml.ts` exists
  - [ ] `npm run build` generates `dist/rss.xml` with valid XML
  - [ ] RSS contains recent post entries with correct titles and dates
  - [ ] `.github/workflows/deploy.yml` exists with correct trigger branch
  - [ ] Workflow uses `withastro/action@v5` and `actions/deploy-pages@v4`

  **QA Scenarios**:
  ```
  Scenario: RSS feed is valid XML with posts
    Tool: Bash
    Steps:
      1. Run `npm run build`
      2. Run `head -5 dist/rss.xml`
      3. Run `grep "<item>" dist/rss.xml | wc -l`
    Expected Result: Valid XML header, 20 items (latest posts)
    Evidence: .sisyphus/evidence/task-11-rss.txt

  Scenario: GitHub Actions workflow is valid YAML
    Tool: Bash
    Steps:
      1. Run `cat .github/workflows/deploy.yml`
      2. Verify contains: `withastro/action@v5`, `actions/deploy-pages@v4`
      3. Verify trigger branch matches repo default (master or main)
    Expected Result: Valid workflow file with correct actions
    Evidence: .sisyphus/evidence/task-11-github-actions.txt
  ```

  **Commit**: YES (group with T9+T10)
  - Message: `feat: add pagination, archive sidebar, RSS, CI/CD`

- [ ] 12. Responsive Design + Dark Mode Polish

  **What to do**:
  - **Responsive breakpoints**:
    - Desktop (>=768px): 2-column layout — sidebar 160px left, content 425px right
    - Mobile (<768px): Single column — content full width, sidebar below content
    - Ensure no horizontal overflow at any viewport
    - Test at: 375px (iPhone SE), 768px (iPad), 1024px (desktop)
  - **Dark mode polish**:
    - Verify all components have dark mode variants
    - `prose dark:prose-invert` on article content
    - Sidebar: dark backgrounds for widget areas
    - Borders: appropriate dark mode border colors
    - Accent color (#dd3333): verify contrast in both modes
    - Footer: dark mode styling
    - Post meta (dates): dark mode text colors
  - **Typography polish**:
    - Verify Korean text renders well in prose context
    - Check line-height and spacing for Korean content
    - Blockquote styling: left border + italic (matching original)
    - Code blocks: proper background in both light/dark
    - Image spacing within prose content
  - **Final visual audit**:
    - Compare layout against Daring Fireball reference
    - Ensure "Limitist:Log" title styling is prominent (Georgia serif)
    - Verify post card spacing and typography on list pages
    - Check pagination links styling

  **Must NOT do**:
  - Do NOT add animations or transitions
  - Do NOT change layout proportions (160px sidebar + 425px content)
  - Do NOT add features not in the plan

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Visual polish, responsive design, dark mode
    - `playwright`: Screenshots at multiple viewports for verification

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs all previous tasks complete)
  - **Parallel Group**: Wave 4 (solo)
  - **Blocks**: F1-F4
  - **Blocked By**: T5, T6, T9, T10

  **References**:
  **External References**:
  - Daring Fireball: `https://daringfireball.net/` — Visual reference for overall feel
  - Context7 `/tailwindlabs/tailwindcss-typography` — "dark:prose-invert and responsive prose sizing"

  **Acceptance Criteria**:
  - [ ] No horizontal overflow at 375px viewport
  - [ ] 2-column layout at 768px+ viewport
  - [ ] Single column at <768px viewport
  - [ ] Dark mode: all text readable, all backgrounds appropriate
  - [ ] Dark mode: prose content uses `dark:prose-invert`
  - [ ] Korean text renders well in prose (proper line-height, spacing)

  **QA Scenarios**:
  ```
  Scenario: Responsive layout at 3 breakpoints
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to http://localhost:4321
      2. Screenshot at 375x812 (iPhone SE)
      3. Screenshot at 768x1024 (iPad)
      4. Screenshot at 1280x800 (Desktop)
      5. Assert: 375px = single column, no overflow
      6. Assert: 768px+ = 2-column with sidebar
    Expected Result: Layout adapts correctly at all breakpoints
    Evidence: .sisyphus/evidence/task-12-responsive-375.png, task-12-responsive-768.png, task-12-responsive-1280.png

  Scenario: Dark mode renders correctly
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to http://localhost:4321 with dark color scheme preference
      2. Screenshot homepage in dark mode
      3. Navigate to a post page
      4. Screenshot post in dark mode
      5. Assert: Background is dark, text is light
      6. Assert: Prose content has inverted colors
    Expected Result: All elements properly styled in dark mode
    Evidence: .sisyphus/evidence/task-12-dark-home.png, task-12-dark-post.png

  Scenario: Korean content typography check
    Tool: Playwright (playwright skill)
    Steps:
      1. Navigate to a long Korean post (e.g., /posts/2014-08-30--/)
      2. Assert: Text is readable, proper line-height
      3. Assert: Blockquotes styled with left border
      4. Screenshot
    Expected Result: Korean text renders beautifully in prose
    Evidence: .sisyphus/evidence/task-12-korean-typography.png
  ```

  **Commit**: YES
  - Message: `feat: responsive design and dark mode polish`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build`. Review all source files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify Astro v5 patterns used (not v4).
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Full Visual QA via Playwright** — `unspecified-high` (+ `playwright` skill)
  Start dev server. Navigate every page type: home (paginated), post detail, archive page. Verify: layout matches DF-style proportions, sidebar present, dark mode works, responsive at 375px/768px/1024px. Check all images on first 10 posts render. Screenshot evidence for each.
  Output: `Pages [N/N pass] | Responsive [N/N] | Dark Mode [PASS/FAIL] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual files. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Wave | Commit | Message | Files |
|------|--------|---------|-------|
| 1 | T1 | `chore: clean repo and scaffold Astro project` | All Gatsby artifacts removed, Astro scaffold |
| 1 | T2+T3 | `feat: configure Tailwind v4, Typography, content schema` | astro.config, CSS, content.config |
| 2 | T4 | `feat: add migration script for Tumblr posts` | scripts/migrate.mjs |
| 2 | T5+T6+T7 | `feat: build layout, post components, and archive utility` | src/layouts, src/components, src/lib |
| 3 | T8 | `feat: migrate 288 Tumblr posts with images` | src/data/blog/** (288 directories) |
| 3 | T9+T10+T11 | `feat: add pagination, archive sidebar, RSS, CI/CD` | src/pages, .github/workflows |
| 4 | T12 | `feat: responsive design and dark mode polish` | Layout/component CSS updates |

---

## Success Criteria

### Verification Commands
```bash
npm run build                           # Expected: exit code 0
find src/data/blog -name "index.md" | wc -l  # Expected: 288
find src/data/blog \( -name "*.png" -o -name "*.jpg" \) | wc -l  # Expected: >= 130
ls dist/2/index.html                    # Expected: exists (pagination page 2)
ls dist/2011/03/index.html              # Expected: exists (earliest archive month)
cat dist/rss.xml | head -3              # Expected: <?xml ... <rss
grep "dark:" dist/_astro/*.css | head -1 # Expected: dark: variants present
```

### Final Checklist
- [ ] All 288 posts accessible via URL
- [ ] Pagination works through all 58 pages
- [ ] Monthly archive pages for every month with posts
- [ ] Sidebar shows archive links + About section
- [ ] Dark mode follows system preference
- [ ] RSS feed is valid XML with post entries
- [ ] GitHub Actions deploys successfully
- [ ] No Gatsby artifacts remain
- [ ] Responsive layout works at 375px, 768px, 1024px
- [ ] All "Must NOT Have" items verified absent
