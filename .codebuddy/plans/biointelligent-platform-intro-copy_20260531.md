# 生物智造页 MiNT X Platform 介绍段新增

## name
biointelligent-platform-intro-copy

## overview
在生物智造页顶部 Banner 与“科研 0~1 到 产业 1~∞”第二节之间新增 MiNT X Platform 两段介绍文案。PC 与移动端均展示，保持黑底白字，并用页面既有渐变白线分割上下章节。

## todos
- [x] 明确展示范围：PC 与移动端都新增。
- [x] 明确英文策略：英文值留空/回退中文，不自行翻译。
- [x] 新增 Directus `site_i18n_entries` 文案并递增 `site_i18n_settings.content_version`。
- [x] 同步本地 i18n fallback。
- [x] 更新 PC 与移动端页面结构和样式。
- [x] 运行 i18n audit 与 build 验证。

## User Requirements
- 新增文案位于生物智造页顶部图片和第二节之间。
- 样式保持黑底、页面常用白色字体。
- 与上下两节之间使用同样的渐变白线分割。
- 不自行补英文翻译。

## Implementation Approach
- 新增文案 key：
  - `bioIntelligent.platformIntro.paragraph1`
  - `bioIntelligent.platformIntro.paragraph2`
- 页面通过 `getText()` 读取文案，不在模板直接硬编码可见文案。
- PC 页在 Banner 后插入“分割线 -> 文案区 -> 分割线 -> 第二节”。
- 移动页采用相同信息结构，使用更小字号和内边距适配窄屏。

## Architecture Design
- 固定文案来源遵循 Directus-first：Directus 为主，本地 JSON 为兜底。
- 组件结构保持在现有 BioIntelligent 页面内，不新增共享组件，避免扩大改动范围。
- 分割线复用现有 `.border-gradient` 样式。

## Directory Structure
- `src/pages/BioIntelligent/index.vue`
- `src/pages/BioIntelligentMobile/index.vue`
- `src/i18n/zh-CN.json`
- `src/i18n/en-US.json`
- `.codebuddy/plans/biointelligent-platform-intro-copy_20260531.md`

## Validation / Acceptance
- PC 与移动端 `/bioIntelligent` 顶部 Banner 下方出现两段文案。
- 文案上下均有渐变白线。
- 文案白色、黑底，宽度和行高在桌面与移动端无溢出。
- `npm run i18n:audit` 通过或仅保留既有无关审计项。
- `npm run build` 通过。

## Implementation Notes
- Directus 已新建 `bioIntelligent.platformIntro.paragraph1` 与 `bioIntelligent.platformIntro.paragraph2`。
- `site_i18n_settings.content_version` 已递增到 `14`。
- 英文值按确认策略保持为空，由运行时回退中文。
- 2026-05-31 复查发现 Directus 中文因 PowerShell 写入编码损坏，需改用 Node 从 UTF-8 本地 JSON 读取后写回；文案区背景调整为页面常用 `#11161b`。
- 2026-05-31 复查发现 `line2` 与 `.border-gradient` 叠加会形成双线观感，新增区域改用单像素 `platform-intro-divider` 渐变线。

## Validation Result
- `npm.cmd run i18n:audit` 已执行成功；仍报告既有缺失英文与硬编码提示，本次新增文案未作为模板硬编码出现。
- `npm.cmd run build` 已执行成功；仅出现既有资源体积、Browserslist 过期和 `::v-deep` 弃用警告。
- 本次会话未完成浏览器截图验证：Browser 插件依赖的 Node REPL 工具未暴露，本地后台 dev/static server 启动也未能保持进程。构建产物已生成，可用本地服务或部署环境打开 `/bioIntelligent` 目视检查。
