# 企业荣誉 SVG 组件化

## name
honor-card-svg-componentization

## overview
将「企业荣誉 / COMPANY HONORS」展示区域中原本使用的 8 张 PNG（`corp1.png` ~ `corp8.png`）替换为统一的 SVG 组件 `HonorCard`，让全部 12 个荣誉条目都以一致的 SVG 方式渲染。桌面端 (`CorporateVision`) 与移动端 (`CorporateVisionMobile`) 同步改造。

## todos
- [x] 抽象 `HonorCard.vue` SVG 组件（line1/line2 统一 20px 字号、唯一 id 避免 filter/gradient 冲突）
- [x] 替换桌面端 `src/pages/CorporateVision/index.vue` 的图片+内联 SVG 模板 → `HonorCard`
- [x] 替换移动端 `src/pages/CorporateVisionMobile/index.vue` 的图片+内联 SVG 模板 → `HonorCard`
- [x] 全量替换 `corpList` 数据：8 张图片项改为 `line1/line2` 文字项
- [x] 接入 i18n：在 `zh-CN.json`/`en-US.json` 的 `corporate.honors` 数组中新增 12 条占位条目（英文暂同中文），两页 `corpList` 改为 `computed(getText('corporate.honors'))`
- [x] 桌面端 hover 缩放状态迁移到 `transformMap`（避免 computed 被 hover 副作用污染）
- [x] 确认 lint 通过

## User Requirements
- 把荣誉区域已有的 SVG 形式小图抽象成组件
- 所有 12 个荣誉条目统一用 SVG 组件渲染，不再使用 PNG
- 保持原有视觉风格（超椭圆描边 + COMPANY HONORS 标签 + 荣誉名称两行文字）

## Product Overview
企业愿景（CorporateVision）页面的「企业荣誉」区块，原本由：
- 8 张 `corp1.png ~ corp8.png` PNG 卡片图
- 4 个内联 SVG 卡片（key 9~12）

混合而成，在不同分辨率和亮度模式下存在风格不一致、图片无法动态翻译、维护成本高的问题。现改为统一由 `HonorCard` 组件渲染，所有文字可直接在数据里维护。

## Core Features
- `HonorCard` 单文件组件：
  - 接收 `line1`、`line2`、`uidKey` 三个 props
  - line1/line2 **统一使用 20px 字号**，不做自适应缩放
  - 内部生成唯一 id 后缀，避免多个卡片共用 filter/gradient 时的 DOM id 冲突
  - 预留 `width / height` props，默认 `100%` 填满父容器
- 桌面端与移动端共用同一个组件，保持一致视觉
- i18n：12 条文案存入 `corporate.honors`（数组），两页 `corpList` 从其映射而来

## Tech Stack Selection
- Vue 3 Options API（与当前两个页面保持一致，无需改造为 Composition API）
- 纯 SVG + CSS，无额外依赖
- 字号自适应通过计算属性实现，无需运行时测量

## Implementation Approach
1. 新建 `src/components/HonorCard/index.vue`，将原先桌面端 `project-w` 区块里的 SVG 原样封装，`filter` / `linearGradient` 的 id 后缀改成 `uid`（基于 `uidKey` 或自增计数器）
2. 桌面端：
   - 模板中用 `<HonorCard :line1 :line2 :uid-key="item.key" />` 替换掉原先的 `<img v-if .../> <svg v-else>...</svg>` 分支
   - `corpList` 中 key=1~8 的 `imgSrc` 字段改为 `line1 / line2`
   - 移除未再使用的 `getImageUrl` 引用
3. 移动端：
   - 同样替换模板和 `corpList` 数据
   - `import HonorCard` 并注册
4. 保留 key=9~12 原有 4 项，总共仍为 12 项

## Implementation Notes
- **荣誉名称映射**（由用户于 2026-04-24 给出）：
  | key | line1 | line2 |
  |---|---|---|
  | 8 | 杭州市高新技术 | 企业研发中心 |
  | 1 | 浙江省 | 专精特新中小企业 |
  | 2 | 浙江省 | 科技型中小企业 |
  | 3 | 浙江省 | 创新型中小企业 |
  | 4 | 杭州市西湖区 | 高校经济新锐企业 |
  | 5 | 西湖区 | 英才A类项目 |
  | 6 | 西湖区 | 高校经济标杆项目 |
  | 7 | 杭州市 | 准独角兽榜单企业 |
  | 9 | 浙江省 | 企业研究院 |
  | 10 | 浙江省 | "科技新小龙" |
  | 11 | 杭州市 | 新雏鹰企业 |
  | 12 | 杭州市 | 准独角兽榜单 |
- **key=7 与 key=12 保留不合并**（2026-04-24 用户明确指示）。
- **字号策略**：所有 line1/line2 统一 20px。viewBox 281×231 内，x=40 起点，最长 8 字中文约 160px 宽度，仍在 281 内，不会溢出。
- **i18n 占位策略**：`zh-CN.json` / `en-US.json` 的 `corporate.honors` 数组已按同一顺序写入 12 条。英文版当前暂用中文原文占位，等用户提供英文翻译后替换对应条目即可，**组件代码无需再改动**。
- **展示顺序 vs. key**：顺序由 setup 中 `HONOR_KEYS = [8,1,2,3,4,5,6,7,9,10,11,12]` 固定，与 i18n 数组索引一一对应；key 同时作为 HonorCard 内部 SVG filter/gradient 唯一 id 和桌面端 hover transform map 的索引。
- **桌面端 hover 缩放**：原先直接修改 `corpList[i].transform`，改成 computed 后会被重建；因此把 hover 状态迁移到 `data().transformMap`，通过 `transformMap[item.key]` 读取、`cardHover/cardLeave` 中写入整对象（触发响应式）。
- `corp1.png ~ corp8.png` 图片文件暂不从仓库删除，保留在 `src/assets/CorporateVision/` 供需要时回退。

## Architecture Design
- 展示层：`CorporateVision.vue` / `CorporateVisionMobile.vue` 只负责布局（gap、宽高、响应式），每个 cell 宽高决定 SVG 放大比例
- 原子组件：`HonorCard.vue` 负责 SVG 渲染与文字自适应，保持零副作用、纯 props 驱动

## Directory Structure
```
src/
├── components/
│   └── HonorCard/
│       └── index.vue         # 新增：SVG 荣誉卡片组件
└── pages/
    ├── CorporateVision/
    │   └── index.vue         # 修改：项目荣誉区域使用 HonorCard
    └── CorporateVisionMobile/
        └── index.vue         # 修改：项目荣誉区域使用 HonorCard
```

## Key Code Structures
### HonorCard.vue 关键片段
```vue
<svg viewBox="0 0 281 231" preserveAspectRatio="xMidYMid meet" ...>
  <!-- 外/内超椭圆描边（渐变 stroke） -->
  <!-- COMPANY HONORS 路径文字 + innerShadow filter -->
  <!-- 荣誉名称 text/tspan：字号由计算属性 line1FontSize / line2FontSize 驱动 -->
</svg>
```
- id 生成：`uid = uidKey ?? 'hc{autoIncrement}'`
- 字号：`calcFontSize(text)` —— 按字符数返回 20/18/16/14/13

### 两页面 corpList 统一成
```js
{ key, line1, line2, transform: 'scale(1)' }
```

## Validation / Acceptance
- [x] `src/components/HonorCard/index.vue`、`CorporateVision/index.vue`、`CorporateVisionMobile/index.vue` 全部 `read_lints` 0 errors
- [ ] 人工验证：桌面端 `/corporate-vision` 路径的 12 个 SVG 卡片
  - 视觉风格一致（超椭圆 + COMPANY HONORS）
  - 文字不溢出
  - hover 放大动画仍生效
- [ ] 人工验证：移动端同页面 12 个 SVG 卡片布局正常
- [ ] 若遇到个别条目字号显得过小或过大，回到 `HonorCard.vue` 的 `calcFontSize` 微调阈值

## Risks / Follow-ups
- **i18n 英文待补**：`en-US.json` 的 `corporate.honors` 目前是中文占位，等用户提供英文翻译（来源应是 `doc/zh-en/` 对照表），对应条目逐项替换即可，无需动组件/页面代码。
- **历史图片资源**：`corp1.png ~ corp8.png` 目前未删除，后续若确认稳定可以从 `src/assets/CorporateVision/` 清理以瘦身仓库。
- **字号溢出兜底**：当前最长 `line2` 为 8 字中文（20px ≈ 160px），在 281 viewBox 中不会溢出；若未来新增更长文案，可在 `HonorCard.vue` 改 viewBox 或让 line2 自动缩小。
