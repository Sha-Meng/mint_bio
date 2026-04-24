---
name: fix-language-shareable-url
overview: 定位英文分享链接失效的根因，并规划基于现有 Vue3 hash 路由的修复方案。
todos:
  - id: analyze-root-cause
    content: 确认语言仅存本地且未进入分享链接
    status: completed
  - id: design-url-strategy
    content: 确定采用 hash 前 query 的最小改动方案
    status: completed
    dependencies:
      - analyze-root-cause
  - id: update-language-core
    content: 改造 src/utils/language.js 实现初始化与 URL 同步
    status: completed
    dependencies:
      - design-url-strategy
  - id: bootstrap-language
    content: 在 src/main.js 挂载前接入语言初始化
    status: completed
    dependencies:
      - update-language-core
  - id: verify-share-behavior
    content: 验证旧链接、英文分享、PC 与移动端一致性
    status: completed
    dependencies:
      - bootstrap-language
---

## User Requirements

- 分析当前站点“切到英文后分享链接，别人打开仍是中文”的真实原因，判断是否属于配置问题。
- 说明当前网址里的 `#` 与问题的关系，并对比 `eng.phabuilder.com` 这类独立英文入口为什么能分享后仍保持英文。

## Product Overview

- 当前站点切换语言后，页面会立即显示对应文案，但语言状态只在当前浏览器内生效，未随链接一起传递。
- 期望修复后，英文页面分享出去仍能打开英文；中文保持默认体验，PC 与移动端表现一致。

## Core Features

- 让链接本身可表达语言状态，接收方无需依赖本地缓存即可打开对应语言。
- 明确语言优先级：分享链接中的语言优先，其次才是本地记忆与默认语言。
- 保持旧链接可访问，减少现有页面跳转与展示逻辑改动。
- 视觉效果上，英文状态下地址栏应出现可识别的英文标记；分享后对方直接看到英文内容，切回中文时链接恢复默认或中文态。

## Tech Stack Selection

- 当前工程已确认使用：Vue 3、Vue Router 4、Element Plus。
- 路由模式为 `createWebHashHistory()`。
- 语言能力由 `src/utils/language.js` 自定义实现，当前依赖 `localStorage` 与响应式 `ref`。

## Implementation Approach

### 已确认根因

- `src/utils/language.js` 通过 `localStorage.getItem('language') || 'zh'` 初始化语言。
- `switchLanguage()` 只更新内存态与 `localStorage`，没有把语言写入 URL。
- `src/main.js` 启动时也没有从 URL 恢复语言。
- 因此根因不是“用了 `#` 就一定不能分享英文”，而是“语言状态没有编码进可分享链接”。

### 方案对比

#### 方案一：保留现有 hash 路由，在 `#` 前使用 query 承载语言（推荐）

- 形态示例：`https://domain.com/?lang=en#/vision`
- 启动优先级：URL 参数 `lang` ＞ `localStorage` ＞ 默认 `zh`
- 切换语言时同步更新：
- `currentLanguage`
- `localStorage`
- 浏览器地址栏 query（保留当前 hash 路由）
- 推荐原因：

1. 当前全站大量 `router-link` / `router.push` 未传 `query`；
2. 若把语言放在 `#/path?lang=en` 内，需要额外全站保留 query；
3. 把 `lang` 放在 `#` 前，hash 跳转不会丢失该参数，改动最小、回归面最小。

- 兼容策略：
- 英文时写入 `lang=en`
- 中文时可移除 `lang`，保持旧中文链接干净且兼容

#### 方案二：仍在路由层携带语言

- 形态示例：`/#/vision?lang=en`
- 需要在路由守卫里自动补全 `lang`，或逐个改造所有跳转入口保留 query。
- 适合同域纯前端方案，但比方案一改动面更大，不适合当前仓库的最小修复。

#### 方案三：独立英文入口 `/en` 或 `eng.xxx.com`

- 最符合用户对外分享、SEO、投放场景预期。
- 但需要站点部署、域名、重写规则或多入口构建配合，不属于当前仓库内最小修复。
- 可作为中长期演进方向，不建议作为本次首选修复。

## Implementation Notes

- 只接受 `zh` / `en`，非法值忽略并回退。
- URL 中有语言时必须覆盖本地缓存，确保分享链接结果确定。
- 使用 `history.replaceState` 同步地址，避免整页刷新与额外渲染。
- 保留现有 `getText()`、`currentLanguage`、页面监听模式，避免大范围改模板。
- PC 与移动端都通过同一语言工具模块生效，避免重复改造。

## Architecture Design

- 启动链路：浏览器 URL → 语言解析 → `currentLanguage` 初始化 → 页面按现有 `getText()` 渲染
- 切换链路：Header/MobileHeader 点击切换 → `switchLanguage()` → 同步内存、本地缓存、URL → 全站响应式刷新
- 分享链路：复制当前地址 → 目标用户打开 → URL 直接决定初始语言

## Directory Structure

### 推荐最小改动

- `d:/UGit/mint_bio/src/utils/language.js`  [MODIFY] 语言核心模块。新增 URL 解析、优先级处理、地址同步与参数清理；继续统一输出 `currentLanguage`、`getText`、`switchLanguage`。
- `d:/UGit/mint_bio/src/main.js`  [MODIFY] 应用启动入口。在挂载前执行语言初始化，避免首屏先中文后英文的闪动。

### 复用现有入口，无需优先改动

- `d:/UGit/mint_bio/src/components/Header/index.vue`  复用现有 `switchLanguage('zh'/'en')` 调用即可。
- `d:/UGit/mint_bio/src/components/MobileHeader/index.vue`  复用现有 `switchLanguage('zh'/'en')` 调用即可。

## Key Code Structures

- 建议在 `language.js` 内补充以下职责，而不改动现有页面取词方式：
- 语言规范化：校验并归一 `zh` / `en`
- 初始语言解析：读取 URL 与本地缓存
- URL 同步：在切换语言后更新 `?lang=en`
- 默认策略：中文默认可不落参，英文必须可分享