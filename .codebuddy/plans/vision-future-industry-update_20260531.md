name: vision-future-industry-update

overview:
Update the Enterprise Vision `/vision` policy module to reposition the section around future industries. The change covers desktop and mobile, follows the Directus-first copy policy, and keeps local i18n JSON as fallback only.

todos:
- [x] Confirm current `/vision` desktop/mobile components and i18n keys.
- [x] Create this OpenSpec plan.
- [x] Add Directus dry-run/apply script for the target `vision.*` keys.
- [x] Update desktop policy module rendering and styles.
- [x] Update mobile policy module rendering and styles.
- [x] Sync local Chinese and English fallback JSON without inventing English translations.
- [x] Run Directus dry-run / apply / dry-run.
- [x] Run build validation.

User Requirements:
- Change “响应 号召” to “面向未来产业”; “面向” is orange, “未来产业” is white, with no visual space between the two phrases.
- Remove the quote icon from the policy description.
- Replace the policy description with: `生物制造已被纳入国家”十五五“未来产业重点方向，正成为绿色制造与未来产业发展的重要基础能力。`
- Replace the four policy cards with the provided titles, keyword rows, and descriptions.

Product Overview:
The Enterprise Vision page communicates MiNT BiO's sustainability and biomanufacturing positioning. This policy module should now emphasize biomanufacturing as a future-industry capability rather than a generic policy-response statement.

Core Features:
- Desktop and mobile section title renders from `vision.respond` + `vision.call`, with the first part orange and the second part white.
- Policy cards render `title`, `tags`, and `content`.
- Runtime copy source remains Directus `site_i18n_entries`; local JSON is only fallback/offline content.

Tech Stack Selection:
- Vue 3 compatibility mode SFCs.
- Directus `site_i18n_entries` and `site_i18n_settings.content_version`.
- Node.js ESM update script using the existing migration environment pattern.

Implementation Approach:
- Add `scripts/update-vision-future-industry.mjs`, defaulting to dry-run and applying only with `--apply`.
- Target flattened i18n keys: `vision.respond`, `vision.call`, `vision.nationalPolicy`, and `vision.policies.N.title/tags/content`.
- Preserve existing English entries; only create blank `value_en` for new keys such as `tags`.
- Update `src/pages/Vision/index.vue` and `src/pages/VisionMobile/index.vue` to remove the semicolon icon and display the new tags row.
- Update `src/i18n/zh-CN.json` and `src/i18n/en-US.json` fallback values to the Chinese copy.

Architecture Design:
- `src/api/siteI18n.js` already reconstructs nested arrays/objects from flattened numeric key paths, so `vision.policies.0.tags` will merge into each policy object without API changes.
- `src/utils/language.js` remains unchanged.

Directory Structure:
- `.codebuddy/plans/vision-future-industry-update_20260531.md`
- `scripts/update-vision-future-industry.mjs`
- `src/pages/Vision/index.vue`
- `src/pages/VisionMobile/index.vue`
- `src/i18n/zh-CN.json`
- `src/i18n/en-US.json`

Validation / Acceptance:
- Directus dry-run showed only target `vision.*` changes: 4 creates for `vision.policies.*.tags` and 11 updates for existing `vision.*` keys.
- Directus apply incremented `site_i18n_settings.content_version` from `34` to `35`.
- Post-apply Directus dry-run reported `creates: 0`, `updates: 0`.
- `npm.cmd run build` succeeded. PowerShell blocked `npm.ps1`, so validation used `npm.cmd`; build completed with existing performance/Browserslist/`::v-deep` warnings.
- Desktop and mobile `/vision` show the new title, no quote icon, new description, and all four updated cards with keyword rows.
