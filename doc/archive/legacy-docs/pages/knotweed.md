# 节豆日粮解决方案

**路由**：`/knotWeed`

| 端 | 页面文件 |
|----|----------|
| PC | `src/pages/KnotWeed/index.vue` |
| 移动端 | `src/pages/KnotWeedMobile/index.vue` |

## 页面结构

### 1. 标题/背景区

| 端 | 实现方式 |
|----|----------|
| PC | `grid1.png + mint.png` 叠加，展示关键数字（"1亿吨/52%"） |
| 移动端 | `BannerTitle` 承载同样文案 |

### 2. 节豆日粮口号 Banner

背景：`src/assets/KnotWeed/banner1.jpeg`

| 端 | 实现方式 |
|----|----------|
| PC | `v-intersect` + animate.css 动画 |
| 移动端 | 静态展示 |

### 3. 传播/优势点

| 端 | 实现方式 |
|----|----------|
| PC | 背景图（复用 `AminoAcid/module3_bg.jpeg`）+ 右侧优势列表 |
| 移动端 | `Propagate` 组件 + 3 条优势 `span` |

### 4. 数据展示 + "匹配顾问"

**数据**：`knotData`（静态数组：2类/100%/1.5亿/2000万）

**交互**：点击"匹配顾问" → `emitter.emit('open-popover')`

## 常见改动点

| 需求 | 修改位置 |
|------|----------|
| 数据展示内容 | `knotData` 数组 |
| 匹配顾问弹窗 | `Contact` / `ContactMobile` 组件 |
