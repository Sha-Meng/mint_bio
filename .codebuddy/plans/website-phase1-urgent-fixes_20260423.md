# website-phase1-urgent-fixes_20260423

## Name
mint_bio 官网一期紧急整改（2026-04 五一前）

## Overview
五一节前完成 mint_bio 官网第一阶段紧急显性问题整改。面向 PC + Mobile 双端，按 7 个功能模块分批推进（每模块完成后暂停同步改动清单等用户确认）。

## Status
- **状态**：building（2026-04-23 进入实施）
- **截止**：2026-04-30（五一）
- **模式**：精细化 step 控制（每模块暂停 review）

## Todos（与 plan.json 同步）

- [x] 模块 1：spec-init + explore-targets（本文件 + 行号级落点表）
- [~] 模块 2：news-batch-1（id=38-41 4 篇抓取 + review）
  - [x] id=38 试点：修 5 类问题 + 沉淀 `news-weixin-importer` skill v1
  - [x] id=39/40/41：用 skill + 改进版 `fetch.mjs` 批量跑
  - [x] skill v2：新增 banner 过滤 + `quote` 块（公众号橙色左竖线引用段）
  - [ ] 用户端验收：列表卡片缩略图 / 详情页 quote 竖线渲染 / 段内高亮
- [ ] 模块 3：news-batch-2（id=42-45 4 篇抓取 + review）
- [ ] 模块 4：news-batch-3（id=46-48 3 篇 + 追加 news_list.json）
- [ ] 模块 5：PiX 全量重命名
- [ ] 模块 6：荣誉 AI 生图 + corpList 追加 + 创始人头衔
- [ ] 模块 7：综合收尾（品牌手册注释 + 产能文案删除 + 英文开关 + README）
- [ ] 模块 8：yarn serve 全量验收

## id=38 试点沉淀（2026-04-23）

### 踩坑 → 规则

| # | 问题 | 根因 | 已固化的规则 |
|---|------|------|--------------|
| 1 | 棉田航拍图在标题下重复出现 | 顶级 `pic` + `headPic` 双渲染 | news_<id>.json 不写顶级 `pic`/`coverPic` |
| 2 | 头图放在第 1 段前而非第 1-2 段之间 | 头图被硬塞进 `headPic` | `headPic` 只放装饰带；首图作为 contents[] 第一个 pic，按原 DOM 位置 |
| 3 | 3 段橙色文字丢高亮 | 原脚本不认 `color: rgb(...)` | `extractSegments` + `parseColor` + `rgbToEmphasisClass`，支持部分高亮 |
| 4 | 署名行"*来源..."被标橙色 | 颜色规则过激 + 无署名白名单 | `SIGNATURE_PATTERNS` 强制降级为 desc |
| 5 | 2.6 KB emoji 装饰图当 cover | 无尺寸过滤 | < 8 KB 自动过滤，首张"保留"图作为 listThumb |

### 沉淀物

- Skill：`.codebuddy/skills/news-weixin-importer/SKILL.md`（完整 workflow + 白名单规则）
- 抓取脚本：`scripts/fetch-news/fetch.mjs`（已集成上述 5 条规则）
- 映射表：`scripts/fetch-news/mapping.json`（11 篇 URL + 分类 + 日期）

## id=39/40/41 批次补强（2026-04-23）

### 新问题 → 新规则

| # | 问题 | 根因 | 已固化的规则 |
|---|------|------|--------------|
| 6 | 3 篇 `pic_1` 33.8KB"MiNT 进行时"橙底装饰带被当真实头图 / END 条 13KB 也被保留 | 仅按字节数 <8KB 过滤，这些装饰条 >8KB 但比例极扁 | 新增比例过滤：`data-w >= 600 && data-ratio < 0.45` 判定横幅装饰 → 过滤下载引用并跳过 listThumb |
| 7 | 段落前橙色左竖线（引用段）渲染成普通 desc，丢失视觉层次 | 脚本不识别 `<section>` 的 `border-left` + 彩色边框 | 新增 `isQuoteSection`，识别 `border-left: Npx solid <color>` 与 `border-width: 0 0 0 Npx` + `border-left-color: rgb(...)`；新增 `{ quote: [...] }` 块类型；`MiNTNewsDetailSection.vue` 新增 `.section-quote` 样式（PC 3px/24px，Mobile 2px/12px） |

### 新增改动

- `scripts/fetch-news/fetch.mjs`：`BANNER_MIN_WIDTH=600` / `BANNER_MAX_RATIO=0.45` + `isQuoteSection()` + `blocksToContents()` 递归支持 quote
- `src/components/MiNTNews/MiNTNewsDetailSection.vue`：新增 `v-if="content.quote"` 分支 + `.section-quote` PC/Mobile 样式
- `public/data/news_list.json`：id=39/40/41 的 `pic` 由 `news*_pic_1.jpg` 装饰带更新为真实首图（pic_3/pic_3/pic_2）
- `public/data/news_{38,39,40,41}.json`：全量重跑产出（id=39/40/41 包含 1 个 quote 块）

### 回归数据

```
id=38 img=5(kept=4, banner=0) desc=9 strong=3 quote=0 thumb=news38_pic_2.jpg
id=39 img=10(kept=7, banner=3) desc=5 strong=2 quote=1 thumb=news39_pic_3.png
id=40 img=10(kept=7, banner=3) desc=4 strong=1 quote=1 thumb=news40_pic_3.jpg
id=41 img=8(kept=6, banner=2) desc=2 strong=2 quote=1 thumb=news41_pic_2.jpg
```



## User Requirements

### 原始需求
来自 `doc/update/updatedetail.pdf`，五一前完成 7 项整改。详见 plan.md `relative_history`。

### 本轮交付范围（经用户确认）

| # | 项目 | 本轮是否做 | 备注 |
|---|------|-----------|------|
| 1 | 新闻动态同步 11 篇 | ✅ 完整还原 | 用户纠正：不是外链跳转；用 playwright 抓公众号图+文 |
| 2 | 全站文案口径统一 5 落点 | ⏸ **暂缓** | 用户决定：待对照表再做，本轮连 Footer 两条也不落 |
| 3 | PiX001~005 重命名 | ✅ 全量替换 | 新闻 JSON 里的 PiX 保留原文 |
| 4 | 企业荣誉新增 4 项 | ✅ AI 生图 | 落在 CorporateVision `corpList` 小图墙 |
| 5 | 品牌手册按钮删除 | ✅ **注释化** | Vue `<!-- -->` 包裹，不删 DOM |
| 5 | 产能 6 万吨文案删除 | ✅ | 只删"到 2025 年底产能 6 万吨" |
| 6 | 创始人头衔更新 | ✅ | 只改主 title，校内 position 全保留 |
| 7 | 英文入口临时下线 | ✅ **功能开关** | `FEATURE_EN_ENABLED=false`，README 出恢复指引 |

### 11 篇新闻分类（用户已确认）

| id | 标题关键字 | 分类 | color | 公众号链接 |
|----|------------|------|-------|------------|
| 38 | 阿克苏棉花 | #MiNT 进行时 | #FF7200 | https://mp.weixin.qq.com/s/O-7IyUylW6VGP3vyAg1M2w |
| 39 | PiX 浙江重点新材料示范 | #MiNT 进行时 | #FF7200 | https://mp.weixin.qq.com/s/ar621hM2IJ5yeaIdiM6DNA |
| 40 | 元素智造 415X | #MiNT 进行时 | #FF7200 | https://mp.weixin.qq.com/s/6fekk1A1JqqC-Bi_W0uWPw |
| 41 | 科技新小龙&企业研究院 | #MiNT 进行时 | #FF7200 | https://mp.weixin.qq.com/s/9Fw61o3YgMHVMAIxKoAdgQ |
| 42 | 生物降解笔材 | #MiNT 产品力 | #144BE1 | https://mp.weixin.qq.com/s/y3TYakrF2klPXLtm0NWHWQ |
| 43 | 3D 打印蜜雪冰城奖杯 | #MiNT 进行时 | #FF7200 | https://mp.weixin.qq.com/s/7BIyQrUHMOH42yJhzciBLg |
| 44 | 2026 年度招聘 | #MiNT 进行时 | #FF7200 | https://mp.weixin.qq.com/s/PJDmBvlbYxcK8yxDV8MN1Q |
| 45 | 媒体聚焦-刘旻昊访谈 | #MiNT 进行时 | #FF7200 | https://mp.weixin.qq.com/s/vN-s3xITG7PsOCyyZpQQww |
| 46 | PiX DIN CERTCO 认证 | #MiNT 产品力 | #144BE1 | https://mp.weixin.qq.com/s/ITALjmQpMyzmpNzdQwmLow |
| 47 | 合成生物领域大会 | #MiNT 进行时 | #FF7200 | https://mp.weixin.qq.com/s/5k8JLDdzK-2cue1v1Geiyw |
| 48 | PiX 中药地膜 | #MiNT 产品力 | #144BE1 | https://mp.weixin.qq.com/s/BjYxYC4itGLEewMvcDCdZw |

分批：批 1 `id=38-41`、批 2 `id=42-45`、批 3 `id=46-48`。

## 行号级落点表（探索结果）

### A. PiX001~005 散落点（6 处严格匹配）

| 文件 | 行号 | 当前内容 | 新内容 |
|------|------|----------|--------|
| `src/i18n/zh-CN.json` | 358 | `"step1": "使用 PiX 001 打造..."` | `PiX 001` → `PiX 膜袋材料` |
| `src/i18n/zh-CN.json` | 363 | `"title": "PiX 004 全程护航新疆棉成长"` | `PiX 004` → `PiX 地膜材料` |
| `src/i18n/en-US.json` | 358 | 同 zh-CN（未英译） | 同 zh-CN |
| `src/i18n/en-US.json` | 363 | 同 zh-CN（未英译） | 同 zh-CN |
| `src/pages/NewMaterial/index.vue` | 151 | `const titles = ["PiX 001", ...]` | 5 个字符串全量替换 |
| `src/pages/NewMaterialMobile/index.vue` | 163 | `const titles = ["PiX 001", ...]` | 同上 |

**映射规则（严格）**：
```
PiX 001 / PiX001 → PiX 膜袋材料
PiX 002 / PiX002 → PiX3D 打印材料   ← 注意无空格
PiX 003 / PiX003 → PiX 注塑材料
PiX 004 / PiX004 → PiX 地膜材料
PiX 005 / PiX005 → PiX 纤维材料
```

**附注（不在改名范围）**：`PiX新材料`、`PiX材料`、`系列高性能新型生态环保材料PiX` 等裸 PiX 文案本轮不动。

### B. 英文切换按钮定位

| 文件 | DOM 行号 | 触发函数行号 | import 行号 | 新改法 |
|------|---------|-------------|------------|--------|
| `src/components/Header/index.vue` | 90-97 | 133-134 | 127 | 90 行 `<div class="popover-content-language">` 追加 `v-if="FEATURE_EN_ENABLED"` |
| `src/components/MobileHeader/index.vue` | 48-55 | 83-84 | 72 | 48 行 `<div class="popover-mobile-content-language">` 追加 `v-if="FEATURE_EN_ENABLED"` |

两文件都已从 `@/utils/language` 解构 import，只需追加 `FEATURE_EN_ENABLED`。

### C. CorporateVision 两端 corpList & 创始人 title

#### PC：`src/pages/CorporateVision/index.vue`
- **corpList 数组**：行 234-275（8 项，key=8,1,2,3,4,5,6,7）→ 末尾追加 key=9,10,11,12
- **张 title**：行 53 `<p>{{ getText('corporate.founders.zhang.title') }}</p>`
- **刘 title**：行 77 `<p>{{ getText('corporate.founders.liu.title') }}</p>`
- **刘 titleMobile**：PC 版未使用
- **样式 `.margin-bottom`**：行 493-495，当前无 `white-space`（刘 title 换行需要追加）

#### Mobile：`src/pages/CorporateVisionMobile/index.vue`
- **corpList 数组**：行 209-250（8 项，用 `require()`）
- **张 title（折叠卡）**：行 40 `<div>{{ getText('corporate.founders.zhang.title') }}</div>` 父容器 `story-img-box-item`（宽 180px 高 210px）
- **刘 titleMobile（折叠卡）**：行 46
- **张 title（展开详情）**：行 61（在 `.margin-bottom` 容器里）
- **刘 titleMobile（展开详情）**：行 87（在 `.margin-bottom` 容器里）
- **样式 `.story-img-box-item`**：行 425-459
- **样式 `.margin-bottom`**：行 464-466

**换行处理策略**：
- 刘旻昊 title 新值 `联合创始人\n董事长&CEO` 含 `\n`
- 在 PC `.margin-bottom` 追加 `white-space: pre-line;`
- Mobile 两处（story-img-box-item 和 .margin-bottom）都追加

### D. Header/MobileHeader FEATURE_EN_ENABLED 引入点

| 文件 | 行号 | 当前 import | 追加符号 |
|------|------|-------------|----------|
| `src/components/Header/index.vue` | 127 | `import { currentLanguage, switchLanguage, isChinese, getText } from "@/utils/language";` | `FEATURE_EN_ENABLED` |
| `src/components/MobileHeader/index.vue` | 72 | `import { currentLanguage, switchLanguage, getText } from '@/utils/language';` | `FEATURE_EN_ENABLED` |

### E. 其他文件

| 文件 | 行号 | 用途 |
|------|------|------|
| `src/i18n/zh-CN.json` | 417-423 | 张 title 字段 `corporate.founders.zhang.title` |
| `src/i18n/zh-CN.json` | 424-436 | 刘 title / titleMobile 字段 |
| `src/i18n/zh-CN.json` | 498 | `home.bioIntelligent.massProduction.desc` 产能 6 万吨 |
| `src/i18n/en-US.json` | 同上 | 同步 |
| `src/components/MiNTNews/MiNTNewsTop.vue` | 19-27 | 品牌手册按钮 DOM |
| `src/utils/language.js` | 1-129 | 追加 FEATURE_EN_ENABLED 开关 |
| `README.md` | EOF | 追加"英文版入口恢复指引" |

## Technical Decisions

### 新闻抓取脚本
- 位置 `scripts/fetch-news/`（不进 `src/`，不影响构建）
- playwright + node:fs；按 `--ids=38,39,40,41` 分批运行
- 带 referer=`https://mp.weixin.qq.com/` 下载图片到 `src/assets/News/202604/`
- 命名规则：cover `news<id>_head_1.jpg`，正文图 `news<id>_pic_<seq>.jpg`
- 富文本 class 白名单：`orange-text` / `blue-text` / `green-text` / `blue-green-text` / `strong-text`
- 保守策略：默认 `desc`，只有明显强调句才 `strongText`

### 英文功能开关 A 方案
```js
// src/utils/language.js
export const FEATURE_EN_ENABLED = false

function normalizeLanguage(lang) {
  if (!FEATURE_EN_ENABLED && lang === 'en') return null
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : null
}

function resolveInitialLanguage() {
  if (!FEATURE_EN_ENABLED) {
    try {
      if (localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE)
      }
    } catch (e) {}
    return DEFAULT_LANGUAGE
  }
  return getLanguageFromUrl() || getStoredLanguage() || DEFAULT_LANGUAGE
}

// syncLanguageToUrl 在 !FEATURE_EN_ENABLED 时强制 delete lang query
```

恢复：改 `FEATURE_EN_ENABLED = true` 一行 + 部署，无其他副作用。

## Validation / Acceptance（八条验收）

- [ ] 11 篇新闻在 PC 与 Mobile 列表可见，按日期倒序排列，分类筛选命中
- [ ] 11 篇新闻详情页完整还原（图文 + 富文本）
- [ ] 全站 PiX 新名全部命中，新闻 JSON 原文保留
- [ ] 荣誉墙 PC+Mobile 共 12 张图
- [ ] 张科春主 title = `创始人&科学顾问委员会主席`
- [ ] 刘旻昊主 title / titleMobile 换行显示 `联合创始人 / 董事长&CEO`
- [ ] 发展动态页无"下载品牌手册"按钮；生物智造卡片无"6 万吨"
- [ ] `?lang=en` 访问回到中文，Header / MobileHeader 无语言切换按钮
- [ ] README 有"英文版入口恢复指引"小节

## Known Limitations / Follow-ups

- **口径统一 5 落点**：待用户提供精确对照表后另起 Phase 1.5 落地
- **新闻富文本强调**：AI 抓取拆段为保守策略，可能漏掉部分公众号原文强调，上线后由运营人工校对
- **荣誉图**：AI 生成接受风格瑕疵，后续由设计替换真图
- **英文版完整恢复**：下线仅为临时，后续英文版完善后改开关即可

## Change Log

- 2026-04-23 20:45 初始化 spec，完成落点探索（模块 1）
