# name
Home DNA Section Copy And Layout Optimization

# overview
Optimize the homepage DNA advantage section so the five-character Chinese titles render as two lines using a 2+3 split, and update the requested supporting copy.

# todos
- [x] Confirm where the homepage DNA section reads title and description content.
- [x] Identify the layout cause for three-line wrapping.
- [x] Update the relevant i18n copy and style.
- [x] Validate JSON/build behavior and summarize acceptance.

# User Requirements
- The section shown in the provided screenshot should display titles as two lines: two Chinese characters on the first line and three Chinese characters on the second line.
- Update the small copy under "前沿科技力" to: `前沿合成生物技术推动生物制造发展`
- Update the small copy under "卓越产品力-绿色生物合成氨基酸" to: `高效生物合成多种氨基酸`

# Implementation Approach
- Keep the existing Vue component structure and i18n keys.
- Use explicit `\n` in the Chinese title values as the source of the 2+3 line break.
- Increase the desktop title width so the three-character line does not wrap into a third line.
- Update both the bundled Chinese resource and the modular Chinese pages resource to keep local content files consistent.

# Architecture Design
- Homepage desktop section: `src/pages/Home/index.vue`
- Homepage mobile section: `src/pages/HomeMobile/index.vue`
- Bundled Chinese resource: `src/i18n/zh-CN.json`
- Modular Chinese page resource: `src/i18n/modules/pages/zh-CN.json`

# Validation / Acceptance
- JSON remains parseable.
- Vue build or lint should complete, or any environment-specific blocker should be recorded.
- Acceptance: homepage DNA section titles have a 2+3 line break and the two requested copy changes are present in local Chinese resources.

# Implementation Notes
- Updated bundled and modular Chinese page resources so `前沿科技力`, `平台强赋能`, `卓越产品力`, and `绿色可持续` use explicit 2+3 line breaks.
- Updated the requested copy under the technology and amino acid product items.
- Increased the desktop DNA section title width from `96px` to `112px` so the three-character second line does not wrap into a third line.
- Validation completed on 2026-05-27:
  - JSON parse check passed for `src/i18n/zh-CN.json` and `src/i18n/modules/pages/zh-CN.json`.
  - `npm.cmd run build` completed successfully with pre-existing asset-size, browserslist, and `::v-deep` warnings.
  - `npm run build` directly is blocked by the local PowerShell execution policy, so `npm.cmd` was used.
- Directus sync completed on 2026-05-27:
  - Updated the corresponding `site_i18n_entries` keys for desktop and mobile homepage DNA titles/copy.
  - Incremented `site_i18n_settings.content_version` so the frontend runtime cache refreshes.
