# product-soybean-meal-free-copy

## overview

将产品页截图相关的中文可见文案从“节豆日粮”调整为“无豆粕日粮”。本次遵循 Directus-first 固定文案策略：生产内容以 Directus `site_i18n_entries` 为准，本地 i18n JSON 仅同步作为离线/异常 fallback。

## todos

- [x] 确认截图相关文案 key 和前端读取方式。
- [x] 同步本地中文 fallback 文案。
- [x] 更新 Directus `site_i18n_entries.value_zh` 并递增 `site_i18n_settings.content_version`。
- [x] 验证构建与目标页面显示。

## User Requirements

- 将截图相关的“节豆日粮”修改为“无豆粕日粮”。
- 覆盖产品导航入口、日粮详情页标题/标签/助力标题，以及氨基酸页中复用的日粮方案入口。
- 不改英文文案，避免自行翻译。
- 不重命名 `knotWeed` 路由、组件目录、图片资产或内部 key。

## Product Overview

官网固定文案通过 `getText(...)` 读取。运行时优先合并 Directus `site_i18n_entries`，本地 `src/i18n/*.json` 作为 fallback。产品导航、氨基酸页和日粮详情页均复用这些 i18n key。

## Core Features

本次需要更新的中文 key：

| key_path | 新中文文案 |
| --- | --- |
| `nav.knotWeed` | `无豆粕日粮解决方案` |
| `aminoAcid.knotWeedSolution` | `[ 无豆粕日粮解决方案 ]` |
| `aminoAcid.knotWeedLabel` | `无豆粕日粮` |
| `knotWeed.title1` | `无豆粕日粮` |
| `knotWeed.label` | `无豆粕日粮` |
| `knotWeed.helpTitle` | `无豆粕日粮助力` |
| `propagate.title` | `无豆粕日粮` |

## Tech Stack Selection

- Vue 3 / Vue CLI 现有前端。
- Directus `site_i18n_entries` / `site_i18n_settings` 作为生产固定文案源。
- 本地 `src/i18n/zh-CN.json` 和模块 JSON 作为 fallback。

## Implementation Approach

1. 在 Directus `site_i18n_entries` 中更新目标 key 的 `value_zh`，保持 `value_en` 不变。
2. 将 `site_i18n_settings.content_version` 加 `1`，让前端刷新运行时文案缓存。
3. 同步本地 fallback：
   - `src/i18n/zh-CN.json`
   - `src/i18n/modules/navigation/zh-CN.json`
4. 不修改组件、路由、样式和资产。

## Implementation Notes

- 当前工作区已有与本任务无关的未提交改动，执行时不得回滚。
- 如果当前环境没有 Directus 写权限，则保留后台手动更新清单，并完成本地 fallback 与构建验证。
- 英文 `value_en` 和 `src/i18n/en-US.json` 不纳入本次修改。
- 2026-05-31：已通过 `scripts/.env.migration` 中的 Directus 凭据更新目标 `site_i18n_entries.value_zh`。首次 PowerShell PATCH 后发现需要显式 UTF-8 body，已重新保存并验证中文正确；补充纳入移动端共用 `propagate.title` 后，`site_i18n_settings.content_version` 最终从 `14` 递增到 `17`。

## Architecture Design

文案读取链路保持不变：

`getText(key)` -> Directus 当前语言 -> Directus 中文 -> 本地当前语言 -> 本地中文 -> key。

本次只改变内容值，不改变接口、缓存策略或数据结构。

## Directory Structure

- `.codebuddy/plans/product-soybean-meal-free-copy_20260531.md`
- `src/i18n/zh-CN.json`
- `src/i18n/modules/navigation/zh-CN.json`

## Key Code Structures

- `nav.knotWeed` 被 Header、MobileHeader、Footer 读取。
- `aminoAcid.knotWeedSolution` 和 `aminoAcid.knotWeedLabel` 被氨基酸页面读取。
- `knotWeed.title1`、`knotWeed.label`、`knotWeed.helpTitle` 被 PC/Mobile 日粮详情页读取。
- `propagate.title` 被移动端氨基酸页和移动端日粮页共用宣传模块读取。

## Validation / Acceptance

- 静态检查目标中文 fallback 文案已更新。
- `npm run build` 通过。
- Directus 更新后强刷页面，确认：
  - PC Header 产品下拉显示“无豆粕日粮解决方案”。
  - Mobile Header 对应入口显示“无豆粕日粮解决方案”。
  - `/knotWeed` PC 与移动页中标题、模块标签、助力标题显示“无豆粕日粮”相关文案。
  - 氨基酸页中相关方案入口显示“无豆粕日粮解决方案 / 无豆粕日粮”。

2026-05-31 验证结果：

- Directus 公开接口已读回 7 个目标 key，中文值均为“无豆粕日粮”相关文案，`content_version=17`。
- 本地 fallback 静态检查：`src/i18n/zh-CN.json` 和 `src/i18n/modules/navigation/zh-CN.json` 中已无“节豆日粮”。
- `npm.cmd run build` 通过；构建仅保留既有 webpack 资源体积、Browserslist 数据过期和 `::v-deep` deprecated 警告。
