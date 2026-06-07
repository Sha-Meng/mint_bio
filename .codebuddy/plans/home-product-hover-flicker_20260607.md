# home-product-hover-flicker_20260607

## name
home-product-hover-flicker_20260607

## overview
修复首页 PC 端“在研产品”列表 hover 切换时反复闪过第一行“无豆粕日粮解决方案”图片的问题。

## todos
- [x] 复核首页 hover 根因与影响范围
- [x] 创建 OpenSpec 计划记录修复方案与验收标准
- [x] 将产品选中态改为 `activeProductIndex` 单一状态
- [x] 改用 `mouseenter` 并移除行级离开默认重置
- [x] 复查语言切换与初始第一项展示
- [x] 验证快速 hover 不再闪第一图

## User Requirements
用户反馈首页 Home 的“在研产品”列表在 hover 态切换时会一直闪过第一行“无豆粕日粮解决方案”的图片。疑似原因是离开任何选中行范围时会自动切换到第一行选中态，并叠加图片淡出/淡入效果，导致快速移动鼠标时不断出现 `hover -> 离开（默认变成第一行） -> hover 下一行` 的插帧。

## Product Overview
PC 首页在研产品列表通过 hover 展示对应产品图片。修复后应保留初始第一项默认展示，但鼠标在不同产品行之间移动时不应强制回到第一项。

## Core Features
- 页面初始加载时第一项默认选中和展示。
- 鼠标进入某一产品行时切换到该行图片和高亮。
- 鼠标从一行移动到另一行或短暂离开单行边界时，不自动回到第一项。
- 现有图片淡入淡出效果保持不变。
- 移动端产品列表不改动。

## Tech Stack Selection
- Vue SFC + `<script setup>` Composition API。
- Less 样式保持现状。
- 不引入新依赖，不修改 Directus/i18n 文案数据。

## Implementation Approach
将产品 hover 交互从每个产品对象上的 `isShow` 突变，调整为单一 `activeProductIndex` 状态。模板通过 `isProductActive(index)` 判断行高亮和图片显示；进入产品行时调用 `setActiveProduct(index)`。删除行级 `mouseleave` 强制回到第 0 项的逻辑，并将 `mousemove` 改为 `mouseenter`，减少重复触发。

## Implementation Notes
- 修改文件：`src/pages/Home/index.vue`。
- 不修改 `src/style/variable.less` 的全局 `.fade` 过渡，避免影响其它页面。
- 不修改产品数据、Directus i18n、移动端 Swiper 和新闻区域。

## Architecture Design
数据流保持：`products.list` / 图片映射 → `productListData` → `productList` → 模板渲染。

交互流调整为：用户进入产品行 → `setActiveProduct(index)` → `activeProductIndex` 更新 → 当前行文字高亮和图片显示。

## Directory Structure
```text
src/pages/Home/index.vue          # 修改 PC 首页产品 hover 状态逻辑
src/style/variable.less           # 仅确认 fade 影响范围，不修改
```

## Key Code Structures
- `activeProductIndex`：当前选中的产品行索引，默认 `0`。
- `isProductActive(index)`：判断产品行是否为当前选中态。
- `setActiveProduct(index)`：进入产品行时更新当前索引，相同索引不重复处理。

## Validation / Acceptance
已验证：
- IDE lints：`src/pages/Home/index.vue` 无新增诊断。
- 目标文件 lint：仅剩项目既有 `vue/multi-word-component-names`（`index.vue` 文件名/组件名规则），本次未新增 hover 相关错误。
- 全量 `npm run build` 通过，产物正常生成；仅有既有 Browserslist 过期、`::v-deep` 弃用和包体积提示。
- 浏览器自动化验证：初始加载显示第一项；快速跨产品行 hover 后采样未包含第一项图片；鼠标离开列表后保持最后选中项，不回退第一项。

备注：全量 `npm run lint -- --no-fix` 仍存在仓库既有 130 个 lint 错误，分布在多个无关文件中，本次未处理。

