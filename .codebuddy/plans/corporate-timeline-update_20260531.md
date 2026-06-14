# Corporate 大事记更新

## overview

更新企业概述 `/corporate` 页“大事记”时间轴中文内容，按用户确认的图片版本重排、删除旧条目并新增 2025.02、2025.09、2025.12、2026.04。PC 与移动端共用 `corporate.timeline`，不改组件结构和样式。

## todos

- [x] 确认时间轴数据来源和项目 i18n 规则
- [x] 设计 Directus-first 更新方案
- [x] 同步本地中文 fallback
- [x] 更新 Directus `site_i18n_entries`
- [x] 递增 `site_i18n_settings.content_version`
- [x] 完成 dry-run / JSON / build 验证

## User Requirements

用户要求将企业概述 corporate 页大事记更新为图片标注版本；只更新中文，英文不自译、不更新。

## Product Overview

企业概述页用于展示公司介绍、发展历程、创始团队、研发生产和荣誉信息。大事记属于官网固定可见文案，需优先维护 Directus `site_i18n_entries`，并同步本地 fallback 兜底。

## Core Features

目标时间轴保持 12 条，顺序如下：

1. `2021`：元素驱动成立于杭州
2. `2023.05`：与牧原集团达成战略合作，推动生物制造氨基酸产业化应用
3. `2023.08`：与商汤科技达成战略合作，推进AI+合成生物融合创新
4. `2024.01`：与牧原集团合资成立牧元安粮
5. `2024.04`：首次获评杭州市准独角兽企业
6. `2024.06`：与建德市签约年产15万吨元素新材料项目，打造生物降解材料全产业链标杆。
7. `2024.12`：完成A轮融资
8. `2025.02`：获评浙江省专精特新中小企业
9. `2025.06`：牧元安粮工厂正式试产、元素智造工厂结顶
10. `2025.09`：元素智造项目入选浙江省“415X”强链补链项目
11. `2025.12`：获评国家高新技术企业、浙江省科技新小龙企业
12. `2026.04`：入选浙江省未来独角兽企业

## Implementation Approach

- Directus：更新 `corporate.timeline.N.year` / `corporate.timeline.N.desc` 共 24 个中文值，保留英文值不变。
- 缓存：仅当 Directus 有 create/update 时递增 `site_i18n_settings.content_version`。
- Fallback：同步更新 `src/i18n/zh-CN.json` 的 `corporate.timeline` 数组；不修改 `src/i18n/en-US.json`。
- 脚本：新增 `scripts/update-corporate-timeline.mjs` 支持 dry-run 与 `--apply`。

## Validation / Acceptance

- Directus dry-run 显示 `desired_entries: 24`，变更 key 仅限 `corporate.timeline.*`。
- Directus apply 已更新 21 个已有 key，无新增 key，并将 `content_version` 从 27 递增到 28。
- Directus apply 后再次 dry-run 显示 `creates: 0`、`updates: 0`。
- `src/i18n/zh-CN.json` 通过 JSON parse。
- `scripts/update-corporate-timeline.mjs` 通过 `node --check`。
- `npm run build` 编译通过。

## 2026-06-08 Patch

- Goal: supplement the `2025.12` corporate timeline item with `浙江省企业研究院`.
- Scope: update Directus key `corporate.timeline.10.desc`, keep English untouched, and sync local fallback plus `scripts/update-corporate-timeline.mjs`.
- Desired Chinese copy: `获评浙江省企业研究院、国家高新技术企业、浙江省科技新小龙企业`.
- Validation: run Directus dry-run/apply/readback, JSON parse, script syntax check, and build.
- Acceptance: Directus apply updated only `corporate.timeline.10.desc`; `content_version` is now `44`; follow-up dry-run reports `creates: 0`, `updates: 0`; `npm.cmd run build` passed with existing warnings.
