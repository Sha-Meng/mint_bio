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

## Mobile Product Card Layout Fix - 2026-06-07

### Goal
- Fix the mobile homepage product Swiper cards shown in the user screenshots.
- Restore the compact bracket-style application/material text treatment.
- Make long application-area text wrap inside the card instead of overflowing.
- Align performance-advantage bullets into a stable multi-row layout.

### Scope
- Only the mobile homepage product card area is in scope.
- Desktop homepage product matrix, Directus copy, `products.list` data, and image mappings are unchanged.

### Implementation Approach
- Keep the shared `Swiper` component unchanged so other mobile sections keep their current behavior.
- Override inherited `white-space: nowrap` only within the mobile homepage product-card content.
- Use compact text sizing and spacing for application areas and material names.
- Format mobile material names as bracket labels in the display layer, preserving existing `[]` or `【】` values and adding `[ ... ]` only when the source value lacks brackets.
- Replace the previous `space-between` advantage layout with a wrapping grid that keeps bullets and labels aligned.

### Validation / Acceptance
- [x] `npm.cmd run build` completes.
- [x] CSS implementation allows long application text such as the 3D printing application fields to wrap within the card.
- [x] CSS/display implementation keeps material names such as `PiX生物可降解3D打印材料`, `生物合成组氨酸`, and `无豆粕日粮解决方案` in the compact bracket-style treatment.
- [x] CSS implementation aligns advantage bullets with a stable two-column grid and full-width final odd item.
- [ ] Interactive browser verification was attempted but blocked because the in-app Browser security policy rejected `http://127.0.0.1:8091/`.
