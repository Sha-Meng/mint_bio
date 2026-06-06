# name
home-product-matrix-directus-update_20260527

# overview
Update the homepage product matrix to the user-provided 8-item order and copy, with Directus as the content source and local project assets as image fallbacks.

# todos
- [x] Confirm existing homepage product data and image mapping.
- [x] Verify Directus token/read access for `site_i18n_entries` and `site_i18n_settings`.
- [x] Copy product image fallbacks into project assets.
- [x] Update PC and mobile homepage image mapping.
- [x] Upsert Directus product matrix entries and bump `content_version`.
- [x] Validate Directus readback and production build.

# User Requirements
- Product order: 无豆粕日粮解决方案、组氨酸、异亮氨酸、地膜、纤维、包装、注塑材料、3D 打印材料.
- Copy must strictly follow the user-provided screenshot/pasted text.
- Correct the typo `一次性餐具？` to `一次性餐具`.
- Do not invent English translations.
- Prefer `item.image` when Directus provides it; otherwise use project-local fallback images.

# Product Overview
- The homepage product section reads `getText('products.list')`, which is populated from Directus runtime i18n entries when available.
- Local JSON remains fallback only; daily product matrix content must be maintained through Directus.

# Implementation Approach
- Add local fallback assets for histidine and isoleucine from `D:\UGit\官网提供图片\1-2产品图`.
- Update `src/pages/Home/index.vue` and `src/pages/HomeMobile/index.vue` image fallback arrays to match the 8-item order.
- Add an operational Directus upsert script for the exact product matrix keys.
- Apply the script with existing `scripts/.env.migration`, then verify readback.

# Validation / Acceptance
- [x] Directus `products.list` resolves to 8 products in the requested order.
- [x] Extra stale `advantages` keys from the old 6-item matrix are disabled.
- [x] `site_i18n_settings.content_version` incremented; readback after write returned `13`.
- [x] `npm.cmd run build` completed with existing warnings for asset size, stale Browserslist data, and deprecated `::v-deep` syntax.
- [x] Static HTTP smoke check returned `dist/index.html` with status 200 via a temporary Node server.
- [ ] Interactive browser screenshot verification was not completed because the Browser plugin's required Node REPL tool was unavailable in this session and local dev-server launch was blocked by the shell environment.

# Implementation Notes
- Added `scripts/update-home-product-matrix.mjs` for dry-run/apply/readback-friendly Directus product matrix upserts.
- Copied `product-histidine.png` and `product-isoleucine.png` into `src/assets/images/` as local fallbacks.
- Updated desktop and mobile homepage product image mappings to prefer `item.image` and fall back to the 8-item project asset order.
