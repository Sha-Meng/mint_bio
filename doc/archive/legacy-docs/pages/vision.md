# 愿景与责任

**路由**：`/vision`

| 端 | 页面文件 |
|----|----------|
| PC | `src/pages/Vision/index.vue` |
| 移动端 | `src/pages/VisionMobile/index.vue` |

## 页面结构

### 1. Banner

| 端 | 组件 |
|----|------|
| PC | `BannerTitle` + 私有图片 (`pages/Vision/images/*`) |
| 移动端 | `BannerTitle` + 文案插槽 |

### 2. 主视觉图

`banner1.png`

### 3. 行业问题/影响卡片

**数据**：`impactData`（页面内静态数组）

横向滚动展示卡片（标题 + 图 + 文字要点）

### 4. 生物智造势在必行（数据展示）

| 端 | 实现方式 |
|----|----------|
| PC | 左侧列表 hover 更新右侧大数字 (`updateHoverData`) |
| 移动端 | `MouseScrollM` + `CrisisCard` 滚动展示 |

**数据**：`declineData`

### 5. 政策/号召卡片

**数据**：`cardData`（4 张卡片）

| 端 | 实现方式 |
|----|----------|
| PC | 卡片 hover 放大 (`hover-scale-transition`) |
| 移动端 | `border-white` 样式容器 |

### 6. 产品/定制解决方案引导

| 端 | 组件 |
|----|------|
| PC | `pages/Vision/VisionModule5.vue` |
| 移动端 | `pages/VisionMobile/VisionModule5.vue` |

**交互**：
- "匹配顾问"按钮 → `emitter.emit('open-popover')`
- "了解更多"跳转 → `/material`、`/aminoAcid`、`/knotWeed`

## 常见改动点

| 需求 | 修改位置 |
|------|----------|
| 影响卡片内容 | `impactData` |
| 下降率列表 | `declineData` |
| 政策卡片 | `cardData` |
