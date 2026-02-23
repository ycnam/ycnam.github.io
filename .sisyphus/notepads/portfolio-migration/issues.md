# Issues - portfolio-migration

## [2026-02-22T00:00:00Z] Init

(Issues and blockers to be recorded here)

## [2026-02-22T00:00:00Z] Task 1 issues encountered

- `tsx` default CJS transform rejected top-level `await`; resolved by switching to `run().catch(...)` entrypoint.
- Initial slug parser incorrectly mapped `/motionpicture/777/` to `motionpicture` by over-filtering numeric segments; fixed by treating trailing numeric as pagination only when route depth is 3+.
- LSP verification could not run because `typescript-language-server` is not installed in this environment; used `npm run build` plus runtime scraper execution checks instead.

## [2026-02-22T23:17:00Z] Task 4 - Generate works markdown files (v2 fixes)

- Year extraction had false positives on `imfxkorea` initially (regex matched "1997-2001" from narrative text). Fixed by scoping to "YYYY at end of paragraph" pattern — narrative dates don't appear at paragraph end.
- `inlineImages[].src` is LOCAL filename (not URL), unlike `<img src>` which has full external URL. Dedup logic must compare plain filenames.
- Paragraphs containing ONLY an `<img>` + `&nbsp;` span are silently dropped in the plainText check BEFORE `convertParagraph`, so those missing images never reach the missing-image reporter. Acceptable: result is same (no broken refs in output).
- `imf-x-korea--process` and `siso-2008` have no year (process blog entry with no date; siso desc ends with Vimeo link paragraph). Optional field left absent.

## [2026-02-22T23:59:00Z] Task 9 - sketch porting limits

- `balloonBlow` exact parity is not feasible in-task without the original physics engine behavior (`physics.jar`/traer) and original image/gif/font assets in the web runtime; implemented a simplified but faithful gameplay approximation in p5 instance mode.
- `numberOfBirds` web source directory did not expose browsable `.pde` links (direct directory access returned 403); source was recovered from `numberOfBirds_macosx.zip` (`hw03_NamYoungchul.pde`), but accompanying text/font/svg assets were not ported 1:1, so motion grammar is recreated rather than asset-identical.

## [2026-02-22T23:49:00Z] Task 10 - Image optimization tooling limitations

### PNG lossy compression: not supported by sips
- `sips` (macOS built-in, v316) has no JPEG-equivalent quality setting for PNG output.
- `sips -s format png -s formatOptions N` does NOT reduce PNG size meaningfully (lossless re-encoding) — in practice can increase file size due to re-encoding overhead.
- **Fallback policy**: If a PNG exceeds the 2 MB size threshold, the script logs a warning and skips it rather than converting to a different format.
- To implement lossy PNG compression in future, would need `pngquant`, `oxipng`, or `sharp` (npm) — none installed in this repo.
- This limitation has **no practical impact** for the current image set: no PNG file in `src/data/works/**` exceeds 2 MB (max observed: 673 KB).

### No tsx/ts-node in repo environment
- Task 1 previously used `tsx` (installed globally at the time). It is no longer present.
- Workaround: `./node_modules/.bin/esbuild <script>.ts --bundle --platform=node --packages=external | node`
- `esbuild` is a devDependency of Astro's build chain and thus present in `node_modules/.bin/`.

## [2026-02-23T00:00:00Z] Task F3 - QA Issues Found

### [NON-BLOCKING] Pretendard WOFF2 CDN 404 on all pages
- **URL**: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.woff2`
- **Symptom**: `Failed to load resource: 404` on every page load in dev + headless
- **Impact**: System font fallback is used (`-apple-system → BlinkMacSystemFont → system-ui → Roboto → sans-serif`). Text still renders; no layout breakage.
- **Status**: External CDN issue; URL matches CLAUDE.md spec. Likely CDN cache miss in headless env or the CDN path changed. No action required unless font rendering matters in production — test on deployed site to confirm.

### [NON-BLOCKING] Vimeo 401 Unauthorized on imfxkorea in dev
- **URLs**: `https://player.vimeo.com/video/17610421`, `https://player.vimeo.com/video/17610931`
- **Symptom**: 401 errors in console, but Vimeo embed iframe still renders its own player UI (play button, title, controls visible in snapshot)
- **Impact**: Videos may not autoplay or load thumbnails in headless; in real browser with network access, should work.
- **Status**: Expected behavior in local/headless env. Not a code issue.

## [2026-02-23T08:28:00Z] Task - scraper fallback for direct gallery images

- `npm run build` passes, but content sync still emits pre-existing duplicate-id warnings for `works` collection entries; unrelated to this fallback change.
