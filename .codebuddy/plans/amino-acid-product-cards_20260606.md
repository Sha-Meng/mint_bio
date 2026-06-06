# amino-acid-product-cards-20260606

## Overview

Update the `/aminoAcid` product card section to show three requested products with exact Chinese copy, requested image assets, and consistent desktop/mobile card ordering.

## User Requirements

- Replace the product cards with:
  - 无豆粕日粮解决方案
  - 生物合成组氨酸
  - 生物合成异亮氨酸
- Preserve the supplied performance advantages, application fields, order, and image sources.
- Avoid reintroducing the previous card tab alignment issue.

## Implementation Approach

- Treat `aminoAcid.productList` as the shared data source for desktop and mobile card copy.
- Add image URLs to the product data so page mapping stays index-safe and shared.
- Generate desktop/mobile card modules from the same array order instead of hard-coded two-item index swaps.
- Use the existing `MouseScroll` / `MouseScrollM` stacked-card model and leave its tab-follow behavior intact.
- Update Directus first through `site_i18n_entries`, bump `site_i18n_settings.content_version` on apply, then sync local fallback JSON.

## Todos

- [x] Locate current card data and desktop/mobile render paths.
- [x] Add Directus/local sync script for `aminoAcid.productList`.
- [x] Update desktop and mobile product-card mapping.
- [x] Run Directus dry-run, apply, and post-apply dry-run.
- [x] Sync local fallback JSON.
- [x] Validate build and inspect card/tab behavior as feasible.

## Affected Modules

- `scripts/update-amino-acid-product-cards.mjs`
- `src/pages/AminoAcid/index.vue`
- `src/pages/AminoAcidMobile/index.vue`
- `src/i18n/zh-CN.json`
- `src/i18n/en-US.json`

## Compatibility Impact

- Adds a third card to the existing scroll stack; `MouseScroll` computes max scroll from `modules.length`, so no structural rewrite is required.
- Existing tab positioning uses `index * 19.7%`; three cards remain within the current tab strip width.
- English fallback will not be newly translated because the user supplied only Chinese and project policy forbids invented translations.

## Validation / Acceptance

- Directus dry-run after apply reported `creates: 0`, `updates: 0`, `disables: 0`; `content_version` advanced from 42 to 43 during apply.
- Local fallback contains the three product card entries in the requested order, including the Directus asset URL and the two local `product-*.png` paths.
- `npm.cmd run i18n:flatten` succeeded; the existing English missing/unconfirmed count remains reported by the tool.
- `npm.cmd run build` succeeded with existing asset-size, Browserslist, and `::v-deep` warnings.
- Source inspection confirms desktop/mobile now map the same ordered `aminoAcid.productList` data and continue using the existing `MouseScroll` / `MouseScrollM` card-owned tab model.
- Local dev-server visual inspection was attempted, but PowerShell `Start-Process` failed on duplicate `Path` / `PATH` environment keys before the server could bind.
