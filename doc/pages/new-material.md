# 生物降解新材料

**路由**：`/material`

| 端 | 页面文件 |
|----|----------|
| PC | `src/pages/NewMaterial/index.vue` |
| 移动端 | `src/pages/NewMaterialMobile/index.vue` |

## 页面结构

### 1. Banner

`BannerTitle`（标题图：`src/assets/images/material-title.png`）

### 2. 材料特点

| 端 | 实现方式 |
|----|----------|
| PC | 右侧要点列表（背景图 `material-banner.png`） |
| 移动端 | banner 图 + `bannerList` 标签云 |

### 3. PiX 产品线（模块滚动区）

| 端 | 组件 |
|----|------|
| PC | `MouseScroll` + 页面内 `modules` 配置 |
| 移动端 | `MouseScrollM` + `AaModuleContentMobile` |

**数据**：`modules[]` - PiX 001~005 的应用场景、优势、图片列表

图片路径示例：`assets/NewMaterial/P001-1.png`（通过 `getImageUrl()` 解析）

### 4. 应用案例

横向可拖拽卡片列表（唯品会 / 中国农科院）

| 端 | 实现方式 |
|----|----------|
| PC | 鼠标拖拽滚动（`startDrag/onDrag/endDrag`） |
| 移动端 | 同样结构，布局适配移动端 |

### 5. FAQ

使用 Element Plus `el-collapse`/`el-collapse-item`

**数据**：`questionList`（HTML 字符串，含 `CO<sub>2</sub>` 等）

**依赖**：`@element-plus/icons-vue`（`Plus/Minus`）

## 常见改动点

| 需求 | 修改位置 |
|------|----------|
| 新增/调整 PiX 产品 | `modules` 数组 |
| 新增 FAQ | `questionList` 数组 |
| 案例卡片 | `caseList` / `caseListSecond` |
