name: news-recruitment-wechat-publish
date: 2026-06-29
status: completed

## overview

Publish the user-provided WeChat recruitment article as the latest pinned MiNT Bio news article in Directus. Use the supplied `JOIN US / MiNT BiO | 2026 recruitment` image as the official website cover, and use `2026-06-29` as the publish date.

## todos

- [x] Confirm the website news module reads from Directus `news_articles`.
- [x] Confirm the list/latest sort uses `featured` before `publish_at`.
- [x] Extract title, summary, source URL, and body container from the supplied WeChat HTML source.
- [x] Add a dry-run/apply Directus publishing helper.
- [x] Dry-run the Directus payload.
- [x] Upload the cover and create/update the recruitment article.
- [x] Verify authenticated and public Directus readback.
- [x] Run final build validation.

## User Requirements

- Source article: `https://mp.weixin.qq.com/s/OpZijLhQSTQk8g4MgqY8iQ`.
- Create a latest news item from the supplied HTML source.
- Use the uploaded recruitment image as the cover.
- Pin the article.
- Use today's date: `2026-06-29`.
- Use Chinese content only; do not invent English translations.

## Product Overview

The website news module is Directus-backed. `src/api/news.js` maps:

- `cover` to list/home thumbnails.
- `featured` and `publish_at` to latest-news ordering via `sort=-featured,-publish_at`.
- `content_blocks_zh` to the news-detail renderer.

## Implementation Approach

- Add `scripts/publish-recruitment-news-20260629.mjs` as an idempotent `--dry-run` / `--apply` helper.
- Parse the supplied WeChat HTML from the attachment, extracting:
  - `title_zh`: the extracted WeChat `og:title` value
  - `summary_zh`: the WeChat `description` meta value
  - article body from `#js_content` / `.rich_media_content`
  - source URL from `og:url`
- Store the WeChat body as a sanitized EditorJS `raw` block so nested WeChat typography and images remain intact.
- Add a final raw block linking to the original WeChat article.
- Upload or reuse the Directus file titled `join-us-2026-recruitment-cover-800x500` for the adapted website cover.
- Create or patch the article with slug `join-us-2026-recruitment` to avoid duplicate records on rerun.

## Implementation Notes

- The article is a Directus content update, not a `site_i18n_entries` fixed-copy update, so `site_i18n_settings.content_version` is not expected to change.
- Category defaults to `mint-runtime` / the MiNT runtime category.
- `content_blocks_en` remains `null`.
- The WeChat article body is not translated or rewritten.
- Existing unrelated Join Us link changes in the working tree are left untouched.
- Initial upload of the full-size `7050x3000` image created Directus file `ebcec23f-5a49-4854-9044-75b4133e414f`, but public asset transforms rejected it with `Illegal asset transformation`.
- A website-card-safe `800x500` adapted cover was generated at `.codebuddy/plans/join-us-2026-recruitment-cover-800x500.jpg`, uploaded as Directus file `15419ed7-49bb-496d-b7fd-a9a86896a352`, and set as the final article cover.
- Directus article id: `b5840a63-5e8b-493b-96f1-97d0c638fd18`.

## Validation / Acceptance

- Dry-run shows the intended title, summary, body statistics, category, slug, date, featured status, and cover upload action.
- Authenticated Directus readback shows:
  - `slug=join-us-2026-recruitment`
  - `status=published`
  - `featured=true`
  - `publish_at=2026-06-29T08:00:00+08:00`
  - `category.slug=mint-runtime`
  - `cover.id` points to the uploaded recruitment cover
  - `content_blocks_zh.blocks.length > 0`
- Public `/directus-api/items/news_articles` readback returns the new article.
- Public cover transform URL returns a successful image response.
- `npm.cmd run build` succeeds.
Final result:

- [x] Dry-run confirmed existing slug handling and intended payload.
- [x] Authenticated readback confirmed the final article cover and content blocks.
- [x] Public `/directus-api/items/news_articles` readback returned the published article.
- [x] Public cover transform returned `200 image/webp`.
- [x] `npm.cmd run build` passed.
## Follow-up: Single Long-Image Body

- User requested replacing the entire news body with one long image: `C:\Users\shame\Downloads\IMG_6808.JPG`.
- Original image dimensions were `3520x56821`, about 200M pixels, so a full-content 1200px-wide optimized version was generated at `.codebuddy/plans/join-us-2026-recruitment-body-1200w.jpg`.
- Uploaded Directus body image file id: `3c6a5d58-e15f-47c9-986d-eb5f971b828a` (`1200x19371`, `image/jpeg`, 2308420 bytes).
- Patched `news_articles.slug=join-us-2026-recruitment` so `content_blocks_zh.blocks` contains exactly one `image` block using that file.
- Restored article status to `published` during the patch.
- Public verification passed: the article returns as `published`, `content_blocks_zh.blocks = ["image"]`, and the body image asset returns `206 image/jpeg`.
