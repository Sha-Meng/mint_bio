# name
news-editor-block-rendering-investigation

# overview
Investigate and fix why the Directus article `editor-test-new` does not show editor-added headings, lists, and divider blocks on the public news detail page.

2026-06-09 follow-up: Investigate why news article `mews-49` stores editor-added bold markup but the public news detail page does not visibly render the bold segment.

2026-06-09 alignment follow-up: Support the Directus Block Editor `alignment` tune now enabled on `content_blocks_zh`, using `mews-49` as the verification article.

# todos
- [x] Read project OpenSpec and i18n rules.
- [x] Locate the news detail data mapping and rendering components.
- [x] Confirm which EditorJS block types are supported by the mapper.
- [x] Explain root cause and acceptance status to the user.
- [x] Add front-end mapping for EditorJS `header`, `nestedlist` / `list`, and `delimiter`.
- [x] Add news detail rendering and responsive styles for headings, lists, and dividers.
- [x] Validate the build and, if possible, browser rendering.
- [x] Confirm article `mews-49` stores `<b>聚焦企业质量管理流程</b>` in `content_blocks_zh`.
- [x] Add explicit bold styling for inline `b` / `strong` tags rendered through news detail `v-html`.
- [x] Validate the build or targeted component syntax.
- [x] Confirm `mews-49` stores block alignment as `tunes.alignment.alignment`.
- [x] Map EditorJS alignment tunes into news detail content objects.
- [x] Render aligned paragraph and heading blocks on the public news detail page.
- [x] Validate production build.

# User Requirements
The user wants to understand why the article body elements added in the editor, specifically headings, lists, and dividers, do not appear on the actual page shown in the screenshot.

# Product Overview
The site renders news articles from Directus `news_articles` records. Article body content comes from `content_blocks_zh` / `content_blocks_en` and is transformed into legacy detail-section content objects before Vue components render it.

# Implementation Approach
Fix the front-end compatibility gap without changing Directus data. The relevant implementation path is:

- `src/api/news.js`: fetches Directus articles and maps EditorJS blocks into `sections[].contents`.
- `src/components/MiNTNews/MiNTNewsDetailCom.vue`: lays out the article detail wrapper.
- `src/components/MiNTNews/MiNTNewsDetailSection.vue`: renders supported content object shapes.

Add new content object shapes:

- `heading`: normalized level plus inline-rendered text/html.
- `listHtml`: sanitized ordered/unordered nested list markup.
- `divider`: visual horizontal rule marker.

# Implementation Notes
Directus public API confirmed that `editor-test-new` stores `header`, `nestedlist`, `image`, `delimiter`, and `paragraph` blocks. The front-end mapper originally only supported `image`, `paragraph`, `quote`, and `raw`; unsupported block types fall through to `default: return null`, then `filter(Boolean)` removes them.

Implemented:

- `src/api/news.js` now maps `header` to `heading`, `list` / `nestedlist` to sanitized list HTML, and `delimiter` to `divider`.
- `src/components/MiNTNews/MiNTNewsDetailSection.vue` now renders those shapes with desktop and mobile styles.
- Inline color shortcodes remain supported inside headings and list items.

2026-06-09 follow-up approach:

- Do not modify Directus article content because the saved data already contains the expected `<b>` markup.
- Keep the fix local to `src/components/MiNTNews/MiNTNewsDetailSection.vue`, where paragraph HTML is rendered through `.new-strongText`.
- Add explicit descendant rules for `b` and `strong` inside rendered news HTML so editor bold survives global/reset/font styling and is visually obvious on desktop and mobile.

2026-06-09 alignment approach:

- Treat Directus alignment as a block-level tune, not an inline rich-text mark.
- Normalize only supported alignment values: `left`, `center`, `right`, and `justify`.
- Attach normalized alignment to mapped paragraph, heading, list, and quote content where applicable.
- Apply alignment in `MiNTNewsDetailSection.vue` with inline `text-align` styles so existing desktop/mobile typography remains unchanged.

# Validation / Acceptance
Acceptance target for the fix:

- `editor-test-new` displays editor-added headings, list items, and divider: accepted by mapper/render implementation and build; browser plugin verification was unavailable because the required Node execution tool was not exposed in this session.
- Existing paragraph, color shortcode, image, quote, and raw HTML rendering remains compatible: accepted by preserving existing render paths.
- Production build completes successfully: accepted via `node node_modules\@vue\cli-service\bin\vue-cli-service.js build`.

2026-06-09 follow-up acceptance target:

- Article `mews-49` keeps the existing saved block text `<b>聚焦企业质量管理流程</b>、产品与服务质量控制、客户需求响应和持续改进机制，有助于公司进一步提升质量管理水平和稳定交付能力。`.
- The bold segment renders with explicit heavier font weight in the public news detail component.
- No Directus data fields are patched for this style-only fix.
- Production build completes via `npm.cmd run build`; only existing asset-size, stale Browserslist, and deprecated `::v-deep` warnings are reported.

2026-06-09 alignment acceptance target:

- `mews-49` block index 4, `[color=blue]ISO9001质量管理体系认证[/color]`, stores `tunes.alignment.alignment: "center"`.
- Public news detail renders that block centered after front-end mapping.
- Existing unaligned and explicitly left-aligned blocks keep the current left text flow.
- Production build completes via `npm.cmd run build`; only existing asset-size, stale Browserslist, and deprecated `::v-deep` warnings are reported.
