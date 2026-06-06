# name

Product new material FAQ copy update

# overview

Update the Products -> New Materials FAQ list for PiX materials. The second FAQ remains unchanged; FAQ 1, 3, and 4 are rewritten, and two new FAQ items are added.

# todos

- [x] Locate the FAQ runtime key and page consumers.
- [x] Confirm Directus/i18n policy impact.
- [x] Add a Directus update script for `newMaterial.faqList`.
- [x] Sync local fallback i18n JSON.
- [x] Apply Directus update and increment `site_i18n_settings.content_version`.
- [x] Validate Directus post-apply state and local build/i18n output.

# User Requirements

Update product page FAQ content to:

1. `PiX 材料的原料来源是什么？`
   `PiX是元素驱动自主研发的全生命周期低碳未来材料，基于自研生物基核心单体，可结合非粮生物质等开发生物基、可降解及可回收等不同方向材料。`
   `材料生物基含量可根据不同应用方向进行调控，最高可达100%。`
2. Keep `PiX 新材料的生产过程绿色、无毒、环保吗？` unchanged.
3. `PiX 材料如何实现降解？`
   `PiX材料主要采用堆肥降解路线。`
   `在微生物、高温高湿及自然老化等条件下，材料可逐步实现降解，并可根据不同应用需求对降解周期进行调控。`
4. `PiX 材料的成本优势体现在哪些方面？`
   `PiX材料采用自主合成工艺，通过降低原料消耗、优化能耗结构及减少副产生成，实现更高的生产效率与成本控制能力。`
   `同时，材料体系兼容性强，可结合竹粉、木浆等不同环保材料进行复配开发，满足不同场景下的性能与成本需求。`
5. `PiX 材料与传统石油基材料有哪些区别？`
   `PiX材料的核心单体基于生物制造路线开发，在原料来源、生产方式及材料生命周期等方面，与传统石油基材料存在差异。`
   `材料可根据应用需求实现生物基、可降解及性能调控等不同方向组合，兼顾功能表现与可持续需求。`
6. `PiX 材料可以应用在哪些领域？`
   `PiX材料可面向农业、纺织、包装、消费品、工业制造等多个领域进行应用开发。`
   `未来，随着技术进一步迭代，可进一步拓展至未来制造相关场景。`

# Product Overview

Desktop `src/pages/NewMaterial/index.vue` and mobile `src/pages/NewMaterialMobile/index.vue` both render `getText('newMaterial.faqList')`.

# Implementation Approach

Because this is website copy, project policy requires updating Directus `site_i18n_entries` first and bumping `site_i18n_settings.content_version` so runtime cache refreshes.

The implementation will add a small script that creates/updates the desired `newMaterial.faqList` entries, disables stale FAQ entries beyond the desired six items, and increments the content version only when changes are applied.

Local `src/i18n/zh-CN.json` and `src/i18n/en-US.json` will be synchronized only as fallback/offline data.

# Implementation Notes

No English translation was provided in the request, and no current task-specific approved English source was found. Per i18n policy, Directus `value_en` will remain empty for the changed/new FAQ fields so English mode falls back to Chinese rather than using an invented translation.

# Architecture Design

- Runtime source: Directus `site_i18n_entries`
- Runtime cache invalidation: Directus `site_i18n_settings.content_version`
- Fallback source: `src/i18n/zh-CN.json`, `src/i18n/en-US.json`

# Directory Structure

- `scripts/update-new-material-faq.mjs`
- `src/i18n/zh-CN.json`
- `src/i18n/en-US.json`
- `.codebuddy/plans/product-new-material-faq-copy_20260531.md`

# Key Code Structures

- `newMaterial.faqList.0.question` / `.answer`
- `newMaterial.faqList.1.question` / `.answer`
- `newMaterial.faqList.2.question` / `.answer`
- `newMaterial.faqList.3.question` / `.answer`
- `newMaterial.faqList.4.question` / `.answer`
- `newMaterial.faqList.5.question` / `.answer`

# Validation / Acceptance

Acceptance criteria:

- [x] Directus dry-run showed only intended FAQ changes before apply: 4 creates, 6 updates, 0 disables. The unchanged second FAQ was excluded from updates after the script was tightened to ignore label-only differences.
- [x] Directus apply completed and incremented `site_i18n_settings.content_version` from `25` to `26`.
- [x] Directus post-apply dry-run reported `creates: 0`, `updates: 0`, `disables: 0`.
- [x] Local fallback JSON contains the six requested FAQ entries.
- [x] `npm.cmd run i18n:flatten` completed successfully.
- [x] `npm.cmd run build` completed successfully with existing warnings for asset size, stale Browserslist data, and deprecated `::v-deep` usage.
