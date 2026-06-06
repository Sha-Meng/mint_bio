# 企业概况企业简介文案更新

## overview

将企业概况页“企业简介”三段中文文案更新为用户指定版本。该页面 PC 与移动端共用 `corporate.intro1`、`corporate.intro2`、`corporate.intro3` 三个 i18n key。

## todos

- [x] 确认文案来源与项目规则
- [x] 设计更新范围
- [x] 更新 Directus `site_i18n_entries`
- [x] 同步本地中文 fallback
- [x] 验证构建或静态检查结果

## User Requirements

用户要求将企业概况中的企业简介三段中文内容替换为新版本。

## Product Overview

企业概况页用于展示公司介绍、创始团队、荣誉和发展历程。简介文案属于网站固定可见文案。

## Implementation Approach

固定文案按项目规则优先更新 Directus：

- 更新 `site_i18n_entries` 中 `corporate.intro1`、`corporate.intro2`、`corporate.intro3` 的 `value_zh`。
- 同步递增 `site_i18n_settings.content_version`，触发前端运行时缓存刷新。
- 同步更新 `src/i18n/zh-CN.json` 作为离线 fallback。
- 英文文案未由用户提供，且未查询到对应对照翻译，因此不自行翻译或修改 `value_en` / `src/i18n/en-US.json`。

## Affected Files

- `scripts/update-corporate-intro.mjs`
- `src/i18n/zh-CN.json`

## Compatibility Impact

不改变组件、路由、数据结构或样式。PC 与移动端读取同一批 key，更新后两端同时生效。

## Validation / Acceptance

- Directus dry-run 首次显示目标三个 key 需要更新，不新增、不停用其它 key。
- Directus apply 已成功更新 `corporate.intro1`、`corporate.intro2`、`corporate.intro3`，并将 `content_version` 从 21 递增到 22。
- Directus apply 后再次 dry-run 显示 `updates: 0`。
- `src/i18n/zh-CN.json` 通过 JSON parse 检查。
- `scripts/update-corporate-intro.mjs` 通过 `node --check`。
- `npm.cmd run build` 构建成功；保留既有 bundle/asset 体积与 Browserslist 过期提示。
