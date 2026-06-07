---
name: home-product-hover-flicker_20260607
overview: 修复首页 PC 端“在研产品”列表 hover 切换时频繁闪现第一行图片的问题，重点调整产品行 hover/leave 状态切换逻辑并验证图片过渡行为。
todos:
  - id: confirm-hover-scope
    content: 使用 [subagent:code-explorer] 复核首页 hover 根因与影响范围
    status: completed
  - id: write-openspec-plan
    content: 创建 OpenSpec 计划记录修复方案与验收标准
    status: completed
    dependencies:
      - confirm-hover-scope
  - id: refactor-active-state
    content: 将产品选中态改为 activeProductIndex 单一状态
    status: completed
    dependencies:
      - write-openspec-plan
  - id: adjust-hover-events
    content: 改用 mouseenter 并移除行级离开默认重置
    status: completed
    dependencies:
      - refactor-active-state
  - id: verify-language-initial-state
    content: 复查语言切换与初始第一项展示
    status: completed
    dependencies:
      - adjust-hover-events
  - id: validate-hover-behavior
    content: 使用 [skill:playwright-cli] 验证快速 hover 不再闪第一图
    status: completed
    dependencies:
      - verify-language-initial-state
---

## User Requirements

修复首页 Home 的“在研产品”列表 hover 交互异常：鼠标在不同产品行之间频繁移动时，不应反复闪过第一行“无豆粕日粮解决方案”的图片。

## Product Overview

首页在研产品列表在 PC 端通过 hover 展示对应产品图片。当前离开任意产品行时会自动回到第一行选中态，并叠加图片淡入淡出效果，导致快速切换 hover 时第一张图不断短暂出现。

## Core Features

- 保留页面初始加载时第一项默认选中和展示。
- 鼠标进入某一产品行时，仅切换到该行对应图片和高亮状态。
- 鼠标从一行移动到另一行或短暂离开单行边界时，不再自动回到第一项。
- 图片切换仍保持现有视觉过渡，但不穿插第一张图。
- 移动端产品列表不依赖 hover，本次不改动移动端交互。

## Tech Stack Selection

- 复用现有项目技术栈：Vue 单文件组件、`<script setup>` Composition API、Less 样式。
- 不引入新依赖，不修改 Directus/i18n 文案数据。
- 验证以本地页面交互和现有构建/检查脚本为准，必要时使用浏览器自动化验证 hover 行为。

## Implementation Approach

采用“单一选中索引”替代当前每次 hover 遍历修改所有产品项 `isShow` 的方式。首页产品列表初始化仍默认索引 0，鼠标进入行时只更新 `activeProductIndex`；删除行级 `mouseleave` 中强制回到第 0 项的逻辑，从根因上避免第一张图被中途激活。

关键决策：

- 将 `@mousemove` 调整为 `@mouseenter`，减少同一行内重复触发和不必要渲染。
- 不修改全局 `.fade` 过渡，避免影响其它页面或组件。
- 不改动产品数据来源和翻译链路，因为问题只在交互状态层。
- 鼠标离开列表后保持最后选中项，避免出现“离开即回第一项”的插帧问题。

性能与可靠性：

- 当前 hover 每次会对 `productList` 执行 O(n) 遍历；改为索引状态后交互状态更新为 O(1)。
- 列表规模较小，但减少 `mousemove` 高频事件和数组对象突变可降低渲染噪音。
- 语言切换重建列表时需保证选中索引有效；如果列表为空或索引越界，回退到 0。

## Implementation Notes

- 主要修改 `src/pages/Home/index.vue`，保持模板结构和现有样式类不变。
- `src/style/variable.less` 的 `.fade` 为全局淡入淡出效果，仅作为影响因素，不建议修改。
- 不做无关重构，不调整新闻、移动端 Swiper、Directus i18n 逻辑。
- 验证时重点观察快速跨行移动：目标图片之间切换，不出现第一项图片插帧。

## Architecture Design

当前数据流保持不变：

产品文案与图片映射 → `productListData` → `productList` → 模板渲染

交互状态调整为：

用户进入产品行 → `setActiveProduct(index)` → `activeProductIndex` 更新 → 当前行文字高亮和图片显示

该方案让“产品数据”和“当前选中态”分离，避免把 hover 状态散落到每个产品对象上。

## Directory Structure

```text
d:/UGit/mint_bio/
├── .codebuddy/
│   └── plans/
│       └── home-product-hover-flicker_20260607.md
│           # [NEW] OpenSpec 计划文件。记录问题背景、根因、实现方案、验收标准和验证结论。
├── src/
│   └── pages/
│       └── Home/
│           └── index.vue
│               # [MODIFY] PC 首页组件。将产品 hover 选中态改为 activeProductIndex；
│               # 将 @mousemove 改为 @mouseenter；移除行级 mouseleave 默认回第一项逻辑。
└── src/
    └── style/
        └── variable.less
            # [REFERENCE] 全局 fade 过渡定义。仅确认影响范围，默认不修改，避免扩大影响面。
```

## Key Code Structures

需要在 `src/pages/Home/index.vue` 中形成以下状态结构：

- `activeProductIndex`：当前选中的产品行索引，默认 0。
- `isProductActive(index)`：判断某行是否为当前选中态。
- `setActiveProduct(index)`：进入产品行时更新当前索引，索引相同则不重复处理。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 复核首页产品列表 hover 相关文件、事件绑定和过渡样式影响范围。
- Expected outcome: 明确根因集中在 PC 首页 `src/pages/Home/index.vue`，避免误改移动端或全局样式。

### Skill

- **playwright-cli**
- Purpose: 在浏览器中模拟快速 hover 切换，验证第一项图片不再插帧闪现。
- Expected outcome: 形成可复现的交互验证结论，确认初始展示、跨行 hover、离开列表行为正常。