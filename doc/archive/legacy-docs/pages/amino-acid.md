# 生物合成氨基酸

**路由**：`/aminoAcid`

| 端 | 页面文件 |
|----|----------|
| PC | `src/pages/AminoAcid/index.vue` |
| 移动端 | `src/pages/AminoAcidMobile/index.vue` |

## 页面结构

### 1. Banner

`BannerTitle`（标题图：`src/assets/AminoAcid/banner_title.png`）

### 2. 氨基酸能力说明

| 端 | 实现方式 |
|----|----------|
| PC | 背景图 `banner1.png` + 右侧要点列表 |
| 移动端 | 上/下结构，底部标签块展示要点 |

### 3. 产品/分子模块（可滚动/切换）

| 端 | 组件 |
|----|------|
| PC | `MouseScroll` + `AaModuleContent` |
| 移动端 | `MouseScrollM` + `AaModuleContentMobile` |

**数据**：`module2Data`（页面内数组配置：标题、应用、优势、图片路径等）

图片路径示例：`assets/AminoAcid/module2_ele1.png`（通过 `getImageUrl()` 解析）

**交互**：`AaModuleContent` 内"匹配顾问"按钮 → `emitter.emit('open-popover')`

### 4. 应用案例/引流

| 端 | 实现方式 |
|----|----------|
| PC | 展示"牧原集团 & 元素驱动"，跳转 `/knotWeed` |
| 移动端 | 使用 `Propagate` 组件作为视觉引导 |

## 常见改动点

| 需求 | 修改位置 |
|------|----------|
| 新增/调整产品模块卡片 | `module2Data` 数组 |
| 调整"匹配顾问"行为 | `Contact` 组件对 `open-popover` 的监听 |
