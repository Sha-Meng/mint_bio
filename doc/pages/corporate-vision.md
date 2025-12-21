# 企业介绍

**路由**：`/corporate`

| 端 | 页面文件 |
|----|----------|
| PC | `src/pages/CorporateVision/index.vue` |
| 移动端 | `src/pages/CorporateVisionMobile/index.vue` |

## 页面结构

### 1. Banner

| 端 | 组件 |
|----|------|
| PC | `BannerTitleAnimation` |
| 移动端 | `BannerTitleAnimationMobile` |

### 2. Introduction（公司介绍）

纯静态文案分段展示。

### 3. Timeline（公司历程时间线）

**数据**：`timeList`（页面内静态数组）

| 端 | 实现方式 |
|----|----------|
| PC | 横向滚动容器 `.timeline-list`，有 prev/next 控制按钮 |
| 移动端 | 横向滚动，无按钮 |

### 4. Story（团队介绍）

| 端 | 实现方式 |
|----|----------|
| PC | 两列展示（图 + 简介 + 要点） |
| 移动端 | 两张人物卡片，点击"+"弹出详情覆盖层 |

### 5. Scientific（科研到产业）

| 端 | 实现方式 |
|----|----------|
| PC | 左侧 `cardList` hover 切换右侧大图 + `IntersectionObserver` 图片淡入 |
| 移动端 | 顶部 Tab 切换（`activeIndex`） |

### 6. Partners（合作伙伴 Logo 墙）

| 端 | 实现方式 |
|----|----------|
| PC | `corpList` 图片路径通过 `getImageUrl()` 解析 |
| 移动端 | 直接 `require()` 引入 logo 图 |

### 7. Banner（合作伙伴横幅）

| 端 | 图片 |
|----|------|
| PC | `banners.png` |
| 移动端 | `banners-mobile.png` |

## 常见改动点

| 需求 | 修改位置 |
|------|----------|
| 时间线内容 | `timeList` 数组 |
| 团队介绍 | Story 区块代码 |
| 合作伙伴 logo | `corpList` 或直接修改图片引用 |
