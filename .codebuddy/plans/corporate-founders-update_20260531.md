# 企业概况创始人信息更新

## overview

更新企业概况页两位创始人的中文介绍版式与文案归位：左侧为普通换行简介，右侧为无序列表。中文文案以 Directus 为主源，本地 `src/i18n/zh-CN.json` 仅作为 fallback 同步。

## todos

- [x] 确认创始人页面与 i18n key 来源
- [x] 设计更新范围与兼容影响
- [x] 更新 PC 与 Mobile 创始人介绍结构
- [x] 更新本地中文 fallback
- [x] 更新 Directus 更新脚本
- [x] 执行 Directus dry-run / apply / dry-run
- [x] 验证 JSON、脚本和构建

## User Requirements

1. 将张科春、刘旻昊介绍按用户确认文案替换，不擅自改写。
2. 两位创始人的下方介绍区均为左侧普通换行简介、右侧蓝点无序列表。
3. 张科春最后一句必须为：`回国前任明尼苏达大学终身教授；2019年加入西湖大学，创建生物制造与新材料实验室，任工学院教授。`
4. 本次仅更新中文，不自行补充英文译文。

## Product Overview

企业概况页展示公司介绍、创始团队、科研能力、荣誉和发展历程。创始人介绍属于网站固定可见文案，按项目规则需要优先更新 Directus `site_i18n_entries`，并同步递增 `site_i18n_settings.content_version` 触发运行时缓存刷新。

## Implementation Approach

- PC 与 Mobile 中张科春介绍区改为 `.bottom-left` 简介 + `.bottom-right` 列表，与刘旻昊当前结构一致。
- 更新 `corporate.founders.zhang.bio` 为张科春 3 行简介。
- 新增/更新 `corporate.founders.zhang.achievements.0` 至 `.2` 作为张科春右侧 3 条列表。
- 更新 `corporate.founders.liu.bio1`、`corporate.founders.liu.bio2` 为刘旻昊左侧 4 行简介。
- 更新 `corporate.achievements.0` 至 `.3` 作为刘旻昊右侧 4 条列表。

## Compatibility Impact

不新增路由、组件 API 或接口字段。英文内容保持现状；如需英文站同步，需要后续提供正式英文译文或 `doc/zh-en/` 对照来源。

## Validation / Acceptance

- `scripts/update-corporate-founders.mjs` 通过 `node --check`。
- `src/i18n/zh-CN.json` 可被 JSON parse。
- Directus dry-run 显示 `desired_entries: 10`、`creates: 3`、`updates: 3`；apply 已将 `content_version` 从 39 递增到 40。
- Directus 复查 dry-run 显示 `creates: 0`、`updates: 0`。
- `npm.cmd run build` 成功，存在项目既有的资源体积、Browserslist 和 `::v-deep` 警告。
- 构建产物包含目标文案和 `corporate.founders.zhang.achievements` 路径。
- 当前环境未能启动本地服务完成截图级目视验收；需在浏览器打开 `/corporate` 做最终 PC/Mobile 目视确认。
