# website-phase1.5-copy-alignment_20260424

## Name
mint_bio 官网文案口径统一（Phase 1.5）

## Status
- **状态**：✅ **ARCHIVED**（2026-04-24 23:24 归档；3 处替换 + lint + grep 验证全部通过）
- **前置**：website-phase1-urgent-fixes_20260423（已 ARCHIVED）
- **优先级**：P1
- **范围边界**：本轮只改 zh-CN，不动 en-US；不动新闻 JSON；不动图片切图文字
- **后续**：如后续需调整本批管线口径或补英文翻译，请另起新 spec 引用本文件

## Overview

Phase 1 紧急整改完成后，唯一遗留项"全站文案口径统一 5 落点"在 2026-04-24 23:10 收到用户方的设计方针：

> **管线定位统一为**：**绿色生物合成氨基酸**、**全生命周期低碳未来材料**

结合用户提供的 5 张示意图，已精确定位 5 个落点对应的代码位置。经架构分析发现：**落点 ②③④（顶部导航 / 产品 banner / Footer 产品栏）共享同一组 `nav.*` key**，改 2 个 nav key 即可三处同步命中，因此实际物理改动只有 2 个字段 + 1 条企业概况描述句，共 **3 个字段**。

## User Requirements

### 设计方针（2026-04-24 23:10 用户给出）

- 管线名 1：**绿色生物合成氨基酸**
- 管线名 2：**全生命周期低碳未来材料**

### 5 个落点范围（2026-04-24 23:12 用户示意图确认）

| # | 落点位置 | 示意图 |
|---|---------|-------|
| ① | 首页 - 核心能力 - 卓越产品力（模块 3/5） | 图 3 |
| ② | 首页 - Banner - 产品板块（Vision/VisionModule5 两张大图） | 图 2/4 |
| ③ | 首页 - 生物智造 - 产品解决方案（顶部导航下拉） | 图 1 |
| ④ | 首页 - 底部导航栏（Footer 产品栏） | 图 5 |
| ⑤ | 关于我们 - 企业概况 | 图 4 |

### 用户逐条拍板（2026-04-24 23:19）

| 问题 | 用户决定 |
|------|---------|
| Q1: `nav.knotWeed` 是否改 | **不改，保留"节豆日粮解决方案"** |
| Q2: 落点 ① 主标题是否改 | **不改，保留"系列高性能新型生态环保材料PiX"/"生物合成氨基酸"** |
| Q3: 落点 ① 描述句是否改 | **保留（生物基、可降解、可回收 / 高效生物合成20+种氨基酸）** |
| Q4: `corporate.intro2` 核心句 | **改为"围绕绿色生物合成氨基酸和全生命周期低碳未来材料两大产品方向"** |
| Q5: `corporate.intro1` / `intro3` | **保留原样** |
| Q6: en-US 是否同步 | **不改，只改 zh-CN** |

## Product Overview

**最终物理改动**：仅 **3 个 i18n 字段** 在 `src/i18n/zh-CN.json` 中：

1. `nav.material`：`生物降解新材料` → `全生命周期低碳未来材料`
2. `nav.aminoAcid`：`生物合成氨基酸` → `绿色生物合成氨基酸`
3. `corporate.intro2`：内嵌句 `围绕氨基酸和生物可降解新材料两大产品方向` → `围绕绿色生物合成氨基酸和全生命周期低碳未来材料两大产品方向`

**辐射效果（改 2 个 nav key 自动联动的页面）**：

- PC Header 产品下拉菜单（`Header/index.vue` L66/69 + 配置数组 L154/159）
- Mobile Header 产品下拉菜单（`MobileHeader/index.vue` L27/28）
- PC Vision/VisionModule5 两张产品 banner（L24/31）
- Mobile VisionMobile/VisionModule5 两张产品 banner（L20/26）
- PC Footer 产品栏（`Footer/index.vue` L32/33）
- Mobile Footer 产品栏（`FooterMobile/index.vue` L23/24）

## Core Features

1. 3 个 i18n 字段替换，严格按用户拍板文案
2. 全仓 grep 兜底，确认无第二处"生物降解新材料"/"围绕氨基酸和生物可降解新材料"残留
3. 本地 `yarn serve` PC+Mobile 双端走查（人工）
4. 同步 Phase 1 spec 的 Follow-ups 状态

## Implementation Approach

### Step 1：`nav.material` 改文案（主 zh-CN.json L5）
```diff
- "material": "生物降解新材料",
+ "material": "全生命周期低碳未来材料",
```

### Step 2：`nav.aminoAcid` 改文案（主 zh-CN.json L6）
```diff
- "aminoAcid": "生物合成氨基酸",
+ "aminoAcid": "绿色生物合成氨基酸",
```

### Step 3：`corporate.intro2` 改文案（主 zh-CN.json L414）
```diff
- "intro2": "公司配备世界领先的研发团队及行业顶级的产业化团队，自主打造了合成生物全链条专利技术体系MiNT X Platform，围绕氨基酸和生物可降解新材料两大产品方向，实现降本增效、绿色生产的生物\"智造\"。",
+ "intro2": "公司配备世界领先的研发团队及行业顶级的产业化团队，自主打造了合成生物全链条专利技术体系MiNT X Platform，围绕绿色生物合成氨基酸和全生命周期低碳未来材料两大产品方向，实现降本增效、绿色生产的生物\"智造\"。",
```

### Step 4：验证
- `src/` 下 `生物降解新材料` 残留：应为 0（原仅此一处）
- `src/` 下 `围绕氨基酸和生物可降解新材料` 残留：应为 0
- `生物合成氨基酸` 残留：**允许残留**（因 `home.sections.products.aminoAcids` L31 保留原文、新闻 JSON 原文不动；纯匹配"生物合成氨基酸"不等于"绿色生物合成氨基酸"前缀，`nav.aminoAcid` 是"绿色生物合成氨基酸"已含这 6 字子串，属正常）

## Implementation Notes

### 架构分析关键点

- **`src/i18n/modules/`**：存在 `navigation/zh-CN.json` / `pages/zh-CN.json` 等模块化副本，但 `src/utils/language.js` L2-3 **仅加载主文件 `zh-CN.json` + `en-US.json`**，modular 版本是**历史遗留未启用副本**。
- 本轮**不动** `src/i18n/modules/**`，避免在真实生效的主文件与未启用副本间制造更多分叉。后续若清理技术债可统一删除 modular 副本或改接入主入口。
- **en-US.json**：用户明确本轮不改。`doc/zh-en/` 对照文件后续若补齐英文版，改 `FEATURE_EN_ENABLED=true` 前需由用户补译。

### 不在范围（用户明确保留）

- 落点 ① 的 `home.sections.products.materials` = `系列高性能新型生态环保材料PiX`（保留）
- 落点 ① 的 `home.sections.products.aminoAcids` = `生物合成氨基酸`（保留）
- 落点 ① 的两个 Desc（`生物基、可降解、可回收` / `高效生物合成20+种氨基酸`）（保留）
- `nav.knotWeed` = `节豆日粮解决方案`（保留）
- `corporate.intro1` / `corporate.intro3`（保留）
- 新闻 JSON 原文（保留）
- `public/index.html` 的 `meta description / keywords`（未在用户范围内，不动）
- 各产品详情页内部文案（如 `NewMaterial/AminoAcid` 页内部）不在 5 落点内

## Architecture Design

无架构变更。仅 i18n 主 JSON 值替换，不涉及 key 新增/删除/重命名，不涉及组件、路由、样式。

## Directory Structure

```
src/
└── i18n/
    └── zh-CN.json        # 唯一改动文件（3 行）
```

## Key Code Structures

### 改动前后对照（zh-CN.json）

```jsonc
// L2-15 nav 节
{
  "nav": {
    "bioIntelligent": "生物智造",
    "products": "产品",
-   "material": "生物降解新材料",
+   "material": "全生命周期低碳未来材料",
-   "aminoAcid": "生物合成氨基酸",
+   "aminoAcid": "绿色生物合成氨基酸",
    "knotWeed": "节豆日粮解决方案",
    ...
  }
}

// L412-415 corporate 节
{
  "corporate": {
    "intro1": "...（保留）...",
-   "intro2": "...围绕氨基酸和生物可降解新材料两大产品方向...",
+   "intro2": "...围绕绿色生物合成氨基酸和全生命周期低碳未来材料两大产品方向...",
    "intro3": "...（保留）..."
  }
}
```

## Validation / Acceptance

- [x] `src/i18n/zh-CN.json` L5 = `"material": "全生命周期低碳未来材料",` ✅
- [x] `src/i18n/zh-CN.json` L6 = `"aminoAcid": "绿色生物合成氨基酸",` ✅
- [x] `src/i18n/zh-CN.json` L414 intro2 含 `"围绕绿色生物合成氨基酸和全生命周期低碳未来材料两大产品方向"` ✅
- [x] `grep "生物降解新材料" src/` 无命中 ✅
- [x] `grep "围绕氨基酸和生物可降解新材料" src/` 无命中 ✅
- [x] `nav.knotWeed`(L7) / `intro1`(L413) / `intro3`(L415) 原文完整保留 ✅
- [x] `home.sections.products.*` 四项（materials/materialsDesc/aminoAcids/aminoAcidsDesc）原文保留 ✅
- [x] en-US.json / modules/* / 新闻 JSON 未被动过 ✅
- [x] JSON lint 无错误 ✅
- [ ] 本地 `yarn serve` 走查 PC+Mobile（用户手工验收，建议走查项见下）：
  - [ ] 顶部导航"产品"下拉：`全生命周期低碳未来材料` / `绿色生物合成氨基酸` / `节豆日粮解决方案`
  - [ ] 生物智造页（Vision）两张产品 banner 标题：`全生命周期低碳未来材料` / `绿色生物合成氨基酸`
  - [ ] Footer 产品栏 3 项与顶部导航一致
  - [ ] 关于我们 - 企业概况第 2 段含"围绕绿色生物合成氨基酸和全生命周期低碳未来材料两大产品方向"
  - [ ] 首页卓越产品力模块保持原貌（`系列高性能新型生态环保材料PiX` / `生物合成氨基酸`）

## Known Limitations / Follow-ups

- **英文版同步**：本轮按用户要求只改 zh-CN。未来英文版恢复前，需用户在 `doc/zh-en/` 补齐以下 3 项英文翻译：
  - `nav.material` → 全生命周期低碳未来材料
  - `nav.aminoAcid` → 绿色生物合成氨基酸
  - `corporate.intro2` 新版
- **技术债**：`src/i18n/modules/` 存在未启用的模块化副本，当前真相源仅为主文件。建议后续任一阶段清理（直接删或改造接入）。
- **图片切图**：若未来设计方要求把 `卓越\n产品力` 等切图也换成新口径，需 AI 出图或设计介入，超出本 spec 范围。

## Change Log

- 2026-04-24 23:00 初始化 Phase 1.5 占位 spec（blocked 等对照表）
- 2026-04-24 23:10 用户提供设计方针"绿色生物合成氨基酸 / 全生命周期低碳未来材料"
- 2026-04-24 23:12 用户给出 5 张示意图，5 个落点精确锁定
- 2026-04-24 23:19 用户逐条拍板 6 个细则问题
- 2026-04-24 23:20 spec 推进到 building，开始实施
- 2026-04-24 23:22 3 处替换完成（zh-CN.json L5 / L6 / L414），JSON lint + grep 双验证通过，spec 状态 → completed，等用户本地 yarn serve 目视走查
- 2026-04-24 23:24 用户确认全部完成，spec 归档，状态 → ARCHIVED
