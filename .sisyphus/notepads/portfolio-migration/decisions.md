# Decisions - portfolio-migration

## [2026-02-22T00:00:00Z] Init

(Architectural choices and rationales to be recorded here)

## [2026-02-23T08:28:00Z] Task - scraper fallback for direct gallery images

- Implemented fallback only inside `parseGalleryImages` in `scripts/scrape-indexhibit.ts`; no other scraper or site logic changed.
- Fallback is gated by `links.length === 0` so thickbox-based pages remain untouched and still prefer anchor `href` full-image paths.
