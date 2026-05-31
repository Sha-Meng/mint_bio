name: corporate-rd-section-update

overview:
更新企业概述页研发板块，按业务批注调整研发链路表达、卡片指标文案与右侧阶段标题顺序。固定文案遵循 Directus-first，官网运行时从 `site_i18n_entries` 读取，本地 JSON 仅作为 fallback。

todos:
- [x] 梳理企业概述页研发板块当前组件、i18n key 与 Directus 更新方式
- [x] 设计 Directus-first 更新方案与本地 fallback 同步方案
- [x] 新增 Directus dry-run/apply 脚本
- [x] 更新桌面端研发板块布局与文案读取
- [x] 更新移动端研发板块布局与文案读取
- [x] 同步本地中文 fallback，不自行新增英文翻译
- [x] 运行 Directus dry-run
- [x] 执行 Directus apply 并复查 dry-run
- [x] 运行构建验证

User Requirements:
- 将研发板块中间说明更新为“打通从实验室研发到规模化生产的关键链路”。
- 将研发中心描述更新为“承接前沿研发、实验验证及小试开发”。
- 将“科研团队”更新为“科研力量”。
- 将团队描述更新为“持续汇聚分子生物、发酵工程、人工智能、生物材料等领域研发力量”。
- 将“30+名校硕博”更新为“跨学科研发团队”。
- 右侧阶段标题改为“后端 / 量产 / 落地”，其中“量产”橙色、“落地”白色。

Product Overview:
企业概述页研发板块用于传达公司从前沿研发、实验验证、小试开发到规模化生产的研发与产业化衔接能力。此次更新强调“实验室研发到规模化生产”的关键链路，以及跨学科研发团队能力。

Core Features:
- 研发链路标题区：桌面端与移动端均显示“前端 / 科研 / 攻坚”和“后端 / 量产 / 落地”。
- 指标卡片：第一张显示“3000m²+”，第二张显示“跨学科研发团队”。
- 卡片描述：使用 Directus/i18n 文案，便于后续运营更新。

Tech Stack Selection:
- Vue 3 compatibility mode single-file components。
- Directus `site_i18n_entries` + `site_i18n_settings.content_version`。
- Node.js ESM 脚本复用现有 Directus 更新脚本模式。

Implementation Approach:
- 新增 `scripts/update-corporate-rd-section.mjs`，默认 dry-run，传入 `--apply` 时写入 Directus。
- 脚本仅更新中文 `value_zh` 与 label/enabled；`value_en` 对新建 key 留空，既有英文不主动覆盖。
- 组件中新增 `roadDescLines` computed，只渲染本次目标说明，避免旧的多行文案继续显示。
- 将卡片中间从图片资源改为 `.metric` 文本文案，读取 `corporate.rdCenterMetric` 与 `corporate.rdTeamMetric`。
- 同步 `src/i18n/zh-CN.json` 与 `src/i18n/en-US.json` fallback；英文文件中对应 key 按项目现状保留中文 fallback，不自行翻译。

Implementation Notes:
- 不更换右侧实验室图片资源。
- 不删除 `number-1.png` / `number-2.png` 资源，只是不再由企业概述研发卡片引用，避免影响其他潜在使用。
- `corporate.roadDesc2`、`roadDesc3`、`roadDesc4` 仍可保留在数据源中，但该板块不再渲染它们。

Architecture Design:
- Directus 作为主数据源，前端运行时通过 `src/api/siteI18n.js` 拉取 enabled entries 并合并到本地 fallback。
- `src/utils/language.js` 的 `getText` 保持不变，组件只调整 key 使用方式和渲染结构。

Directory Structure:
- `.codebuddy/plans/corporate-rd-section-update_20260531.md`
- `scripts/update-corporate-rd-section.mjs`
- `src/pages/CorporateVision/index.vue`
- `src/pages/CorporateVisionMobile/index.vue`
- `src/i18n/zh-CN.json`
- `src/i18n/en-US.json`

Key Code Structures:
- `rdEntries`: Directus 脚本中的目标 key 列表。
- `roadDescLines`: 研发板块说明行 computed。
- `cardList`: 研发板块卡片数据，`textMiddle` 从图片路径改为 i18n 文本。

Validation / Acceptance:
- Directus dry-run 能显示目标 key 的 create/update 数量。
- Directus apply 后再次 dry-run 无待更新项。
- `site_i18n_settings.content_version` 仅在实际有变更时递增一次。
- `npm run build` 成功。
- 桌面与移动端研发板块显示：
  - “后端 / 量产 / 落地”
  - “量产”为橙色，“落地”为白色
  - “打通从实验室研发到规模化生产的关键链路”
  - “3000m²+”
  - “跨学科研发团队”
