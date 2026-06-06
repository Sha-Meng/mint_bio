name: news-45-cover-image-update
date: 2026-06-05
status: completed

## overview

Update the `news-45` article cover image referenced by the user-provided Directus asset URL. The article body content must remain unchanged. An earlier pass incorrectly updated the first body image block; this plan now records the correction: restore that body image and update `cover` only.

## todos

- [x] Confirm the news module reads articles from Directus `news_articles`.
- [x] Inspect `news-45` current `cover` and first content image block.
- [x] Resolve the full Directus file id from the provided shortened asset URL.
- [x] Patch `news-45.cover` to the requested image.
- [x] Restore `content_blocks_zh` first body image to its original file id.
- [x] Validate the Directus/public API output after the patch.

## User Requirements

- Target article: `news-45`.
- Change requested: set the article cover to the provided Directus asset URL.
- Correction: do not change news body content.
- Constraint: Do not change unrelated news records or unrelated copy.

## Product Overview

The website news module is Directus-backed. `src/api/news.js` reads `news_articles` and maps:

- `cover` to list/home thumbnails.
- `content_blocks_zh` image blocks to detail-page images.

## Implementation Approach

1. Read `news-45` from Directus with `cover` and `content_blocks_zh`.
2. Search Directus files for the full asset id matching the shortened URL prefix/suffix.
3. Patch `cover` to the resolved replacement file id.
4. Restore the first body image block to the original file id captured before the incorrect update.
5. Re-read the record and public API to verify `cover` and first body image are correct.

## Implementation Notes

- This is a content update, not a source-code change.
- `site_i18n_settings.content_version` is not expected to change because this is not fixed UI copy in `site_i18n_entries`.
- If the shortened asset URL cannot be uniquely resolved, stop and ask for the full URL/file id.
- Added `scripts/update-news-45-cover-image.mjs` as a dry-run/apply helper for this one-record Directus update.
- Resolved replacement file id: `064330f9-fd54-4eaa-93d8-c452ae394122`.
- Final intended change: `news-45.cover` is `064330f9-fd54-4eaa-93d8-c452ae394122`.
- Corrected body content: first body image block restored to `9709174c-9f8e-4f62-a5b0-3f10480ada38`.

## Validation / Acceptance

- [x] Directus record `news-45` exists and remains published.
- [x] Authenticated Directus readback shows `cover` points to `064330f9-fd54-4eaa-93d8-c452ae394122`.
- [x] Authenticated Directus readback shows the first body image block points to `9709174c-9f8e-4f62-a5b0-3f10480ada38`.
- [x] Public `/directus-api` readback shows `cover` points to `064330f9-fd54-4eaa-93d8-c452ae394122`.
- [x] Public `/directus-api` readback shows the first body image block points to `9709174c-9f8e-4f62-a5b0-3f10480ada38`.
- [x] Public cover transformed asset URL returns `200` with `image/webp`.
- [x] No unrelated `news_articles` records were modified by the helper script.
