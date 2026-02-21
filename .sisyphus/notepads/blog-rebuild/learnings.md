## [T4] Migration Script
- Some Tumblr frontmatter titles contain invalid YAML scalars (e.g., partially quoted values); normalizing all `title:` values to JSON-style quoted strings avoids Astro content parse failures.
- Manual frontmatter parsing with `---` delimiters worked reliably; only targeted normalization (`tags: ''`/`""` -> `tags: []`) was needed for schema compatibility.
- Image copy should be driven by markdown references, not filename-derived slug directories, to correctly support `-2` posts that reuse parent `tumblr_img` directories.

## [T7] Archive Utility

### Grouping Approach
- Used Map<year, Map<month, count>> for efficient grouping
- Filters out draft posts before grouping
- Converts to array with descending year sort, then descending month sort within each year

### URL Format
- Format: `/{year}/{month padded to 2 digits}/` (e.g., `/2016/01/`)
- Implemented with `String(month).padStart(2, '0')`

### Date Handling
- Uses `getFullYear()` and `getMonth() + 1` for year/month extraction
- `getMonth()` returns 0-11, so +1 converts to 1-12 for display
- Sorting by `valueOf()` for proper date comparison

### Archive Page Generation
- `getStaticPaths()` generates all month-level pages from archive data
- Posts sorted descending by date within each month
- Minimal HTML layout with post links (no PostCard dependency yet)
- Title format: `{year}년 {month}월 아카이브` (Korean format)

### Build Results
- 329 pages generated successfully
- Archive pages created for all months with posts (2011-03 through 2016-01)
- Verified: `/2016/01/` and `/2011/03/` pages exist and render correctly

## [T5] BaseLayout + Sidebar
- layout approach: CSS Grid
- responsive: @media (max-width: 768px) single column

## [T6] Post Components
- `render()` API: import from `astro:content`, call `await render(post)`, destructure `{ Content }` — same API throughout
- `post.id` is the directory name (e.g. `2016-01-26--ux-`), used directly as slug param in `getStaticPaths`
- `prose dark:prose-invert max-w-none` — Tailwind Typography styles; `max-w-none` lets parent layout control width
- Date formatting: `post.data.date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })` produces e.g. "2016년 1월 26일"
- BaseLayout already imports `global.css` — no need to re-import in pages that use BaseLayout
- index.astro: `.slice(0, 5)` for first 5 posts; PostCard receives `post: CollectionEntry<'blog'>` prop
- Conditional tags: `{post.data.tags.length > 0 && <p>Tags: {post.data.tags.join(', ')}</p>}` works in Astro JSX
- Build confirmed: 329 pages, no regressions
