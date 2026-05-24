# 首页

**路由**：`/` 或 `/home`

| 端 | 页面文件 |
|----|----------|
| PC | `src/pages/Home/index.vue` |
| 移动端 | `src/pages/HomeMobile/index.vue` |

## 页面结构

### 1. 顶部 Banner

| 端 | 组件 |
|----|------|
| PC | `BannerTitleAnimation` (`src/components/BannerTitleAnimation`) |
| 移动端 | `BannerTitleAnimationMobile` (`src/components/BannerTitleAnimationMobile`) |

### 2. MiNT BiO DNA / 核心能力区块

| 端 | 实现方式 |
|----|----------|
| PC | 鼠标悬浮触发 `advantageShow`，展示 5 个入口卡片 |
| 移动端 | 使用 `Swiper` 承载卡片内容 |

跳转路由：`/corporate`、`/bioIntelligent`、`/material`、`/aminoAcid`、`/vision`

### 3. 产品列表

| 端 | 实现方式 |
|----|----------|
| PC | 列表 hover 展示图片（`productMove(index)` + `transition name="fade"`） |
| 移动端 | 使用 `Swiper` 展示图文卡片 |

### 4. 合作伙伴横幅

| 端 | 实现方式 |
|----|----------|
| PC | `v-intersect` 进入视口后显示 `banners.png` |
| 移动端 | 直接展示 `banners-mobile.png` |

### 5. 新闻预览区

**数据来源**：`axios.get('/data/news_list.json')`，取前 6 条

**图片渲染**：`getImageUrl(item.pic)`

**跳转**：
- 卡片 → `/mintNews/detail/{id}`
- "更多动态"按钮 → `/mintNews`

## 常见改动点

| 需求 | 修改位置 |
|------|----------|
| 新闻展示数量 | `slice(0, 6)` |
| 5 个能力入口 | PC: `advantageArr` / 移动端: `caseList` |

## 相关文档

- 新闻扩展：[../modules/news/how-to-add.md](../modules/news/how-to-add.md)
