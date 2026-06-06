# name

Amino acid FAQ section

# overview

Add a new FAQ section to the Amino Acid product page on desktop and mobile, using Directus-backed i18n copy and local JSON fallback.

# todos

- [x] Locate Amino Acid page structure and i18n keys.
- [x] Confirm Directus/i18n policy impact.
- [x] Add desktop and mobile FAQ UI sections.
- [x] Add local fallback i18n copy.
- [x] Add and run Directus update script.
- [x] Validate i18n output and production build.

# User Requirements

Add an FAQ section to the aminoAcid page with four items:

1. `元素驱动氨基酸产品的核心优势是什么？`
   `基于生物制造路线与自主发酵工艺，元素驱动持续优化发酵效率、产品纯度及规模化生产能力，在成本控制与稳定供应方面形成综合优势。`
2. `氨基酸产品可以应用于哪些领域？`
   `目前产品可覆盖食品、医药、化妆品、饲料添加剂及化学制剂等多个方向，并可根据不同应用需求提供对应规格产品。`
3. `生物制造氨基酸与传统化学合成路线有什么区别？`
   `生物制造路线以微生物发酵为核心，可直接获得目标L构型氨基酸，减少传统化学路线中构型拆分和后处理环节，在产品纯度、工艺效率和可持续性方面具备优势，更适配食品、医药、化妆品、动物营养等多元应用场景。`
4. `元素驱动氨基酸产品是否支持规模化稳定供应？`
   `公司持续推进工程化与产业化能力建设，形成从研发到规模化生产的能力体系，可满足不同场景下的产品供应需求。`

# Product Overview

The Amino Acid product page has separate desktop and mobile SFCs:

- `src/pages/AminoAcid/index.vue`
- `src/pages/AminoAcidMobile/index.vue`

The page currently has no FAQ section or `aminoAcid.faqList` keys.

# Implementation Approach

Add an Element Plus collapse-based FAQ section after the existing application-case module on both desktop and mobile. The structure follows the existing NewMaterial FAQ interaction pattern but uses Amino Acid-specific i18n keys.

Because this is website copy, Directus `site_i18n_entries` is the primary source and `site_i18n_settings.content_version` must be incremented after applying copy updates. Local `src/i18n/*.json` is synchronized only as fallback/offline content.

# Implementation Notes

No English translations were provided and no approved source was available for these new FAQ items. Per i18n policy, `value_en` will remain empty and English mode will fall back to Chinese.

# Architecture Design

- Runtime source: Directus `site_i18n_entries`
- Runtime cache invalidation: Directus `site_i18n_settings.content_version`
- Fallback source: `src/i18n/zh-CN.json`, `src/i18n/en-US.json`
- UI: Element Plus `el-collapse` / `el-collapse-item`

# Directory Structure

- `src/pages/AminoAcid/index.vue`
- `src/pages/AminoAcidMobile/index.vue`
- `src/i18n/zh-CN.json`
- `src/i18n/en-US.json`
- `scripts/update-amino-acid-faq.mjs`
- `.codebuddy/plans/amino-acid-faq-section_20260531.md`

# Key Code Structures

- `aminoAcid.faq`
- `aminoAcid.faq2`
- `aminoAcid.faq3`
- `aminoAcid.faqList.0.question` / `.answer`
- `aminoAcid.faqList.1.question` / `.answer`
- `aminoAcid.faqList.2.question` / `.answer`
- `aminoAcid.faqList.3.question` / `.answer`

# Validation / Acceptance

Acceptance criteria:

- [x] Desktop Amino Acid page includes a FAQ collapse section wired to `aminoAcid.faqList`.
- [x] Mobile Amino Acid page includes a FAQ collapse section wired to `aminoAcid.faqList`.
- [x] Directus dry-run showed only intended aminoAcid FAQ changes before apply: 11 creates, 0 updates, 0 disables.
- [x] Directus apply completed and incremented `site_i18n_settings.content_version` from `26` to `27`.
- [x] Directus post-apply dry-run reported `creates: 0`, `updates: 0`, `disables: 0`.
- [x] Local fallback JSON contains the four requested FAQ entries.
- [x] `npm.cmd run i18n:flatten` completed successfully.
- [x] `npm.cmd run build` completed successfully with existing warnings for asset size, stale Browserslist data, and deprecated `::v-deep` usage.

Notes:

- Attempted in-app browser validation, but the Browser plugin's Node execution tool was not exposed in this session. A Vue dev server was also attempted, but it did not reach a listening state before verification; production build validation passed.
