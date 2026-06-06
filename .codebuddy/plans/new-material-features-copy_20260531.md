# name

New Material banner feature copy update

# overview

Update the right-side feature list on the Products -> material page homepage/banner area from the existing six short phrases to the new five-item Chinese copy requested by the user.

# todos

- [x] Locate the material page feature list key and consumers.
- [x] Confirm Directus/i18n policy impact.
- [x] Add a Directus update script for `newMaterial.features`.
- [x] Update local fallback i18n JSON.
- [x] Apply Directus update and increment `site_i18n_settings.content_version`.
- [x] Validate build and targeted i18n data output.
- [x] Expand banner feature card/list width so the new copy does not wrap inside each item.
- [x] Update product card content plan for material page.
- [x] Reorder five product cards to 地膜、纤维、包装、注塑材料、3D打印材料.
- [x] Sync local fallback i18n product card data.
- [x] Apply Directus product card update and increment `site_i18n_settings.content_version`.
- [x] Validate product card update.
- [x] Prevent application area chip text from wrapping inside each rounded chip.
- [x] Revert incorrect shared tab layout/style changes while keeping application chip nowrap.
- [x] Revert the experimental stable tab layer and return to the original single per-card tab system.
- [x] Add NewMaterial-only short tab display labels while preserving full product copy in i18n/Directus.
- [x] Refactor Material desktop product cards to a controlled two-card transition model.
- [x] Preserve the original card-owned curved tab style so tabs move with cards.
- [x] Validate build after replacing the uncontrolled five-card stack.
- [x] Add a Directus update script for Material application case copy.
- [x] Sync Material application case copy in local fallback i18n JSON.
- [x] Add a Directus update script for Material mulching case card body copy.
- [x] Sync Material mulching case card body copy in local fallback i18n JSON.
- [x] Map mulching case cards 2 and 3 to the existing `tips` style on desktop and mobile.
- [x] Copy the supplied danshen mulch JPG into frontend assets.
- [x] Convert the supplied certification HEIC into a browser-compatible JPG asset.
- [x] Replace Material mulching case card 2 and 3 images on desktop and mobile while keeping card 1 unchanged.
- [x] Validate new image dimensions, ensure no HEIC frontend references remain, and run production build.

# User Requirements

Replace:

- 全新化学结构
- 可生物降解
- 可回收
- 高性能
- 高适配性
- 成本可控

With:

- 自研生物基核心单体
- 生物基含量与降解性能可调
- DIN CERTCO可降解认证
- 性能优异
- 可开发多种应用场景高性能材料

# Product Overview

The desktop `src/pages/NewMaterial/index.vue` and mobile `src/pages/NewMaterialMobile/index.vue` pages both render `getText('newMaterial.features')`.

# Implementation Approach

Because this is website copy, the project policy requires Directus `site_i18n_entries` to be the primary source and requires bumping `site_i18n_settings.content_version`. The implementation adds a small script that updates the five desired keys, disables stale feature index entries, and increments the content version only when Directus changes are applied.

Local JSON is updated as fallback/offline content only.

# Implementation Notes

No English translation was provided. Per i18n policy, the script updates `value_zh` and leaves `value_en` empty rather than inventing translations.

# Architecture Design

- Runtime source: Directus `site_i18n_entries`
- Runtime cache invalidation: Directus `site_i18n_settings.content_version`
- Fallback source: `src/i18n/zh-CN.json`, `src/i18n/en-US.json`

# Directory Structure

- `scripts/update-new-material-features.mjs`
- `scripts/update-new-material-product-cards.mjs`
- `src/i18n/zh-CN.json`
- `src/i18n/en-US.json`
- `src/pages/NewMaterial/index.vue`
- `src/pages/NewMaterialMobile/index.vue`
- `src/components/AaModuleContent/index.vue`
- `src/components/AaModuleContentMobile/index.vue`

# Key Code Structures

- `newMaterial.features.0` through `newMaterial.features.4`: enabled with new Chinese values.
- `newMaterial.features.5` and any higher stale indices: disabled in Directus.
- Desktop material banner feature panel is widened and feature text is kept on one line.
- Mobile material banner feature tags use full available list width and keep each tag on one line.
- `newMaterial.moduleCards` and `newMaterial.categories` now use the requested product matrix table.
- Desktop/mobile material card image groups are reordered to match the new product order.
- The former special hiding rule for card index 1 is removed so 3D printing shows application and advantage text.
- Application area rounded chips use `white-space: nowrap` on desktop and mobile.
- Shared card tab geometry and `MouseScroll` interaction remain on the original implementation.
- Removed the experimental `stableTabs` implementation so only the original per-card tab system remains.
- NewMaterial derives short tab labels in the page mapping layer; full product names remain unchanged in runtime i18n data.
- Desktop Material product cards will use a page-scoped controlled transition component instead of shared `MouseScroll`.
- The new component must render only the current card and, during wheel transition, the target card; each rendered card still includes its own curved tab so the tab moves with the card.
- The implementation must not use a fixed independent tab navigation layer, because the current design treats the curved tab as part of the card.
- `newMaterial.expressCase` is updated to `[ 生物可降解快递袋 ]`.
- `newMaterial.xinjiangCaas` is updated to `中国农业科学院、南阳科学院`; `newMaterial.caasAndMint` remains `& 元素驱动` so desktop/mobile keep the same two-line heading structure.
- `newMaterial.mulchingCase` is updated to `[ 生物基降解地膜 ]`.
- `newMaterial.cases.mulching.desc` is updated to the new 新疆棉田覆膜实验 paragraph.
- `newMaterial.cases.mulching.advantage1Desc` adds the 南阳科学院 / 丹参种植基地 PiX 地膜 paragraph under card 2.
- `newMaterial.cases.mulching.advantage2Desc` adds the DIN CERTCO and 浙江省重点新材料目录 paragraph under card 3.
- Desktop and mobile mulching cards 2 and 3 now set `tips`, reusing the same visual treatment as card 1.
- `src/assets/images/case-danshen-mulch.jpg` is copied from the supplied danshen mulch JPG.
- `src/assets/images/case-certification.jpg` is converted from the supplied certification HEIC so webpack and browsers do not need HEIC support.
- Desktop and mobile `caseListSecond` keep card 1 on `case-1.jpeg`, use `case-danshen-mulch.jpg` for card 2, and use `case-certification.jpg` for card 3.

# Validation / Acceptance

## Material Product Card Scroll Alignment Fix - 2026-06-02

### User Requirements

- Restore the material page product card list interaction to the old behavior: tabs are part of each card and move together with the card during vertical wheel sliding.
- Do not use a fixed/independent tab navigation layer.
- Do not replace the old continuous card stack with a different current/target-only transition interaction.
- Shorten the upper tab text when product names are too long by removing `生物可降解` / `生物基可降解`, producing labels such as `PiX纤维`, `PiX地膜`, and `PiX3D打印材料`.
- Solve the tab/card alignment bug within the old interaction model.

### Retrospective

- The latest implementation introduced `src/pages/NewMaterial/components/MaterialProductCards.vue`, which renders only the active card plus a transition target. This changed the interaction model even though it preserved card-owned tabs.
- The old implementation in `src/components/MouseScroll/index.vue` renders the full card stack and computes each card's `translateY` from one shared `scrollDistance`; because each tab lives inside `AaModuleContent`, the tab naturally follows the card.
- The intended fix is therefore not a new interaction layer, but a narrower restoration: use `MouseScroll` again for desktop Material cards, keep the current five-card product content/order, and keep short display-only tab labels.

### Implementation Approach

- Replace desktop Material's temporary `MaterialProductCards` usage with the existing shared `MouseScroll` component.
- Leave `MouseScroll` behavior unchanged unless verification shows the alignment bug is inside its math.
- Keep `AaModuleContent`'s tab as the single source of the visible curved tab.
- Derive short tab labels in `NewMaterial.modules` and `NewMaterialMobile.modules` by stripping `生物可降解` / `生物基可降解` from the full product title; full product names in Directus/i18n remain unchanged.

### Affected Files

- `src/pages/NewMaterial/index.vue`
- `src/pages/NewMaterialMobile/index.vue`
- `.codebuddy/plans/new-material-features-copy_20260531.md`
- `src/pages/NewMaterial/components/MaterialProductCards.vue` may remain unused unless cleanup is explicitly requested; removal is optional because it is an untracked artifact from the previous attempt.

### Todos

- [x] Confirm old interaction source and previous deviation source.
- [x] Restore desktop Material to `MouseScroll`.
- [x] Replace hard-coded tab labels with display-only short-title derivation.
- [ ] Validate build.
- [ ] Browser-check desktop Material card list alignment and tab movement.

Acceptance criteria:

- [x] Material banner feature list resolves to the five requested items.
- [x] Directus content version incremented from `18` to `19` after applying changes.
- [x] Post-apply Directus dry-run reports `creates: 0`, `updates: 0`, `disables: 0`.
- [x] Local fallback JSON contains the same five requested items.
- [x] `npm.cmd run i18n:flatten` completed successfully.
- [x] `npm.cmd run build` completed successfully with existing performance/deprecation warnings.
- [x] `npm.cmd run build` completed after layout width adjustment.
- [x] Product cards resolve to the requested five-row product matrix.
- [x] Directus product card dry-run reports no pending changes after apply.
- [x] `npm.cmd run i18n:flatten` completed after product card update.
- [x] `npm.cmd run build` completed after product card update.
- [x] `npm.cmd run build -- --no-clean` completed after chip no-wrap style update.
- [x] `npm.cmd run build -- --no-clean` completed after reverting incorrect shared tab changes.
- [x] `npm.cmd run build -- --no-clean` completed after returning to the single tab system.
- [x] `npm.cmd run build -- --no-clean` completed after NewMaterial tab label mapping.
- [x] Directus application case dry-run showed only `newMaterial.expressCase`, `newMaterial.xinjiangCaas`, and `newMaterial.mulchingCase` needed updates.
- [x] Directus application case apply completed and incremented `site_i18n_settings.content_version` from `22` to `23`.
- [x] Directus application case post-apply dry-run reported `creates: 0`, `updates: 0`, `disables: 0`.
- [x] `npm.cmd run i18n:flatten` completed after application case copy update.
- [x] `npm.cmd run build` completed after application case copy update with existing warnings.
- [x] Directus mulching case dry-run showed only intended `desc`, `advantage1Desc`, and `advantage2Desc` changes before apply.
- [x] Directus mulching case apply completed and incremented `site_i18n_settings.content_version` from `23` to `24`.
- [x] Directus mulching case post-apply dry-run reported `creates: 0`, `updates: 0`, `disables: 0`.
- [x] `npm.cmd run i18n:flatten` completed after mulching case copy update.
- [x] `npm.cmd run build` completed after mulching case copy update with existing warnings.
- [x] `npm.cmd run build -- --no-clean` completed after Material desktop card transition refactor with existing warnings.
- [x] New `case-danshen-mulch.jpg` and `case-certification.jpg` files exist and their dimensions are readable.
- [x] Frontend source does not directly reference `.HEIC` assets.
- [x] `npm.cmd run build` completed after Material mulching case image replacement with existing warnings.
- [x] Desktop Chrome headless render confirmed the mulching case image order: `case-1.jpeg`, `case-danshen-mulch.jpg`, `case-certification.jpg`.
- [x] Mobile Chrome headless render confirmed the same mulching case image order.
