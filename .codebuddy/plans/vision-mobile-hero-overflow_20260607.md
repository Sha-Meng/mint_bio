# Vision 移动端顶部文字溢出修复

## overview

修复 `/vision` 页面移动端顶部区域文字错乱和超框问题，使顶部标题和地球图片内说明文字都稳定落在移动端视口与图片卡片内部。本次为布局修复，不改 Directus 文案、不改 i18n 内容、不影响桌面端。

## todos

- [x] 确认移动端路由和顶部组件来源。
- [x] 分析文字超框原因。
- [x] 更新移动端布局样式。
- [x] 执行构建验证。
- [x] 执行本地静态预览 smoke check。

## User Requirements

- Vision 页面移动端顶部文字不能错乱或超出屏幕。
- 顶部预期效果参考用户提供的第二张截图。
- 首屏标题应为两行居中展示。
- 地球图片内的说明文字应完整显示在图片内部。

## Product Overview

Vision 页面移动端首屏由通用 `BannerTitle` 和 `src/pages/VisionMobile/index.vue` 内的地球图片模块组成。页面文案来自现有 `getText('vision.*')` key，本次不改变内容来源。

## Implementation Approach

问题原因：

- `VisionMobile` 顶部复用通用 `BannerTitle`，但 `BannerTitle` 的 slot 容器在移动端仍保留桌面宽度 `735px`，会把页面首屏横向撑宽。
- `VisionMobile` 的 `.text-section` 使用横向 flex，两个标题片段会排在同一行，移动端容易超出预期视觉区域。
- 地球图片模块使用固定 `370px` 宽度，图片内 SVG 叠字的字号和容器宽度没有充分适配窄屏，导致说明文字超出图片卡片。
- 本项目启用了 `postcss-pxtorem`，移动端根字号会随宽度缩放；图片内 SVG 文字如果继续使用 CSS `px/rem` 字号，容易在移动端宽度判定边界附近放大，和截图中的大字超框现象一致。

解决方式：

- 在 `src/components/BannerTitle/index.vue` 的移动端媒体查询中，为 `.banner-title-text` 增加 viewport 约束，避免 slot 内容继承桌面宽度。
- 在 `src/pages/VisionMobile/index.vue` 中将 `.text-section` 改为纵向居中排列，保留现有两个 `span`，形成固定两行。
- 将地球图片容器改为 `width: calc(100vw - 40px)` 与 `max-width: 370px`，并收紧图片内 SVG 文本宽度和字号。
- 将图片内 SVG 文字字号移到 `font-size` SVG 属性中，使用 viewBox 单位控制，避免被全局 `px -> rem` 转换影响。

## Architecture Design

- 通用移动端 slot 宽度约束放在 `BannerTitle` 内，解决根因并兼容其他移动端 slot 标题。
- Vision 专属的标题排版和图片叠字约束放在 `VisionMobile` 内，避免影响其他页面的视觉表达。

## Directory Structure

- `src/components/BannerTitle/index.vue`
- `src/pages/VisionMobile/index.vue`
- `.codebuddy/plans/vision-mobile-hero-overflow_20260607.md`

## Validation / Acceptance

- `npm.cmd run build` 已通过。构建只输出项目既有的资源体积、Browserslist 过期和 `::v-deep` 警告。
- 使用 `dist` 静态服务访问 `/#/vision` 返回 HTTP 200。
- 构建后 CSS 确认 `BannerTitle` 移动端 slot 宽度覆盖生效。
- 截图级浏览器自动化验证受当前环境限制未完成：`Start-Process` 因 Path/PATH 环境变量冲突无法启动 dev server，内置 Playwright 缺少 `playwright-core`。
- 后续人工或浏览器工具复验时，移动端 viewport 应满足：
  - 顶部标题分两行居中显示。
  - 顶部和图片内文字不超出移动端视口。
  - 地球图片内说明文字完整落在图片内部。
  - 下方横向滚动卡片不受影响。
  - 桌面端 `/vision` 不受本次移动端样式影响。
