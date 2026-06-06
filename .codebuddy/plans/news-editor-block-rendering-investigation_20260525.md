# name
news-editor-block-rendering-investigation

# overview
Investigate and fix why the Directus article `editor-test-new` does not show editor-added headings, lists, and divider blocks on the public news detail page.

# todos
- [x] Read project OpenSpec and i18n rules.
- [x] Locate the news detail data mapping and rendering components.
- [x] Confirm which EditorJS block types are supported by the mapper.
- [x] Explain root cause and acceptance status to the user.
- [x] Add front-end mapping for EditorJS `header`, `nestedlist` / `list`, and `delimiter`.
- [x] Add news detail rendering and responsive styles for headings, lists, and dividers.
- [x] Validate the build and, if possible, browser rendering.

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

# Validation / Acceptance
Acceptance target for the fix:

- `editor-test-new` displays editor-added headings, list items, and divider: accepted by mapper/render implementation and build; browser plugin verification was unavailable because the required Node execution tool was not exposed in this session.
- Existing paragraph, color shortcode, image, quote, and raw HTML rendering remains compatible: accepted by preserving existing render paths.
- Production build completes successfully: accepted via `node node_modules\@vue\cli-service\bin\vue-cli-service.js build`.
