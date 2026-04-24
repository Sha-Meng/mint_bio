---
name: news-weixin-importer
description: >
  This skill imports WeChat Official Account (微信公众号) articles into the
  mint_bio website news section. Use it whenever the user provides one or more
  mp.weixin.qq.com article URLs that need to be rendered on the official site
  news list and detail pages (equivalent to the existing news_1.json ~
  news_37.json). This skill covers HTML fetching, image downloading with
  referer, paragraph segmentation, partial-color rich-text preservation,
  signature-line downgrade, image-size filtering, news_list.json append, and
  follow-up manual-review checklist for the editor.
---

# news-weixin-importer Skill for mint_bio

## Purpose

Given one or more WeChat Official Account article URLs, produce website-ready
news entries that match the existing 37 production articles' schema and visual
behavior. The skill must respect the real DOM order of images and text in the
source article, and preserve the original colored/bold emphasis using the
project's pre-defined CSS classes.

## When to Use

Trigger this skill whenever the user:

- provides one or more `https://mp.weixin.qq.com/s/...` URLs and asks to sync
  them to the official website news section
- asks to "update news dynamics / 更新新闻动态 / 同步公众号"
- asks to create an article detail page from a 公众号 link

Do NOT trigger this skill for:

- editing existing news entries (that's direct JSON editing)
- non-WeChat sources (other CMS, Medium, etc.)

## Project News Architecture

### Data Layer

- `public/data/news_list.json` — list page data, schema:
  ```json
  {
    "id": 38,
    "title": "...",
    "time": "YYYY/MM/DD",
    "pic": "assets/News/202604/news38_pic_2.jpg",
    "categorylabel": "#MiNT 进行时",
    "categorycolor": "#FF7200",
    "overviewtitle": "..."
  }
  ```
- `public/data/news_<id>.json` — detail page data, schema:
  ```json
  {
    "id": 38,
    "title": "...",
    "categorylabel": "#MiNT 进行时",
    "categorycolor": "#FF7200",
    "time": "YYYY/MM/DD",
    "overviewtitle": "...",
    "sections": [
      {
        "headPic": ["assets/News/new_head_1.jpg", "assets/News/new_head_2.jpg"],
        "contents": [
          { "desc": "..." },
          { "pic": "assets/News/202604/news38_pic_2.jpg" },
          { "strongText": "<span class='orange-text'>...</span>其它文字" }
        ],
        "footerPic": ["assets/News/new_footer_1.jpg", "assets/News/new_footer_2.jpg"]
      }
    ]
  }
  ```
- Images: `src/assets/News/<yyyymm>/news<id>_pic_<seq>.<ext>`
  - Naming MUST be `news<id>_pic_<seq>.<ext>`, seq starts from 1
  - Batch directory uses `yyyymm` of the earliest article in the batch

### Render Contract (MUST respect)

- `MiNTNewsDetailCom.vue` renders **top-level `info.pic` as a 637px title-area
  hero**, then `MiNTNewsDetailSection.vue` renders `sections[].headPic[]`.
  **If you set both, the image is rendered twice.**
  → **RULE**: in news_<id>.json, do NOT set top-level `pic` or `coverPic`.
  The list thumbnail belongs to `news_list.json` only.
- `headPic` is a TITLE-AREA DECORATIVE BAND, not the article hero image.
  Use the shared assets based on `categorycolor`:
  - 橙色 `#FF7200` → `new_head_1.jpg` + `new_head_2.jpg`
  - 蓝色 `#144BE1` → `new_head_blue_1.jpg` + `new_head_blue_2.jpg`
  (matches existing articles; `fetch.mjs` auto-selects by `categorycolor`).
- `footerPic` is also decorative; use `new_footer_1.jpg` + `new_footer_2.jpg`.
- The article's actual hero image (WeChat first real image) goes into
  `contents[]` as a `pic` block at its original DOM position among the text
  paragraphs — NOT in `headPic`.

### Supported CSS Classes (whitelist)

In `MiNTNewsDetailSection.vue` only these classes are styled for strongText
HTML. Do NOT invent new classes.

| Class              | Color / Effect       | Approx RGB                |
| ------------------ | -------------------- | ------------------------- |
| `.orange-text`     | `#e75a29` orange     | r≥180, b<100 (红/橙系)    |
| `.blue-text`       | `#2d5bf6` blue       | b≥150, r<150 (蓝系)       |
| `.green-text`      | `#74d887` green      | g≥140, g>r&b (绿系)       |
| `.blue-green-text` | `#6bbea9` cyan-green | g≥120 & b≥120, r<150      |
| `.strong-text`     | `font-weight: bold`  | `<strong>/<b>` or 600+    |

### Supported Content Block Types

`contents[]` is a flat list of block objects. Supported kinds (MUST match
render contract in `MiNTNewsDetailSection.vue`):

| Block                                | Renders as                                       |
| ------------------------------------ | ------------------------------------------------ |
| `{ "desc": "..." }`                  | Plain paragraph                                  |
| `{ "strongText": "...<span>...</span>..." }` | Rich-text paragraph with color/bold spans |
| `{ "pic": "assets/News/..." }`       | Full-width image (padded)                        |
| `{ "nopaddingpic": "..." }`          | Full-width image (no padding)                    |
| `{ "video": "...", "poster": "..." }`| Inline video player                              |
| `{ "richHtml": "<div>...</div>" }`   | **Custom HTML block** — rendered via `v-html`, all styling inline. Use for any layout the other block types can't express (e.g. numbered circle + colored title, flex/grid layouts, decorative CSS排版). One-size-fits-all escape hatch. |
| `{ "quote": [ ...sub-blocks... ] }`  | **Indented block with orange left vertical bar** (public-account "引用段" style). Sub-blocks reuse `desc` / `strongText` / `pic`. |

The `quote` block renders as a `.section-quote` container with
`border-left: 3px solid #e75a29; padding-left: 24px` on PC (12px on mobile).
It is used when the source 公众号 section has a colored `border-left` style
wrapping multiple paragraphs.

## Workflow

### Step 1: Accept Input

User provides:
- a list of URLs (one per article), plus
- an id for each (normally the next available integer after the current max in
  `news_list.json`), plus
- the intended `categorylabel` and `categorycolor` (defaults: `#MiNT 进行时` /
  `#FF7200`; other: `#MiNT 产品力` / `#144BE1`, `#MiNT 智造力` / `#7455F6`,
  `#MiNT Vision` / …).

If the user provides URLs without id/category, auto-assign ids starting from
`max(existing ids) + 1` and ask the user for categories. Do not guess
categories from content.

### Step 2: Populate `scripts/fetch-news/mapping.json`

Shape:
```json
{
  "imageBatchDir": "src/assets/News/202604",
  "imageRelPrefix": "assets/News/202604",
  "articles": [
    {
      "id": 38,
      "url": "https://mp.weixin.qq.com/s/...",
      "categorylabel": "#MiNT 进行时",
      "categorycolor": "#FF7200",
      "time": "2026/04/22"  // optional; script will override with real publish_time if found
    }
  ]
}
```

### Step 3: Run the Fetch Script

```
# per-id
node scripts/fetch-news/fetch.mjs --ids=38,39,40,41

# or whole batch
node scripts/fetch-news/fetch.mjs --all

# or dry-run (no download, no write)
node scripts/fetch-news/fetch.mjs --ids=38 --dry-run
```

The script (`scripts/fetch-news/fetch.mjs`):

1. Fetches the article HTML with a desktop UA (no Playwright required — WeChat
   serves the full content in the initial HTML with `data-src` lazyload).
2. Parses with `node-html-parser` (dev-only dependency).
3. Extracts title from `#activity-name`, publish date from `var ct = "..."`.
4. Walks `#js_content` in DOM order, producing block sequence of:
   - `img` (via `data-src` / `src`, skip `data:` URIs)
   - `text` (leaf `p/h1-5/blockquote/li` with no `img`)
   - `strong` (same as text but contains color / bold spans; see Step 4)
5. Downloads all images with `Referer: https://mp.weixin.qq.com/` and saves as
   `src/assets/News/202604/news<id>_pic_<seq>.<ext>`.
6. **Filters images by size + aspect ratio**:
   - files under 8 KB are treated as decorative icons/emojis and excluded
   - images with `data-w >= 600` AND `data-ratio < 0.45` (i.e. aspect ratio
     wider than ~2.2:1) are treated as banner/decorative strips (e.g. the
     common "MiNT 进行时" orange header band ~33 KB, or "END" footer strip
     ~13 KB) and excluded from rendered JSON
   - filtered files are still downloaded to disk for manual inspection, but
     `srcToRel` drops them so they do not appear in `contents` and are not
     chosen as `listThumb`
7. **Identifies quote (bordered) sections**: when a `<section>` has a
   non-zero `border-left` width with a non-black `border-left-color`
   (checks both `border-left: Npx solid color` shorthand and
   `border-width: 0 0 0 Npx` + `border-left-color: rgb(...)` longhand),
   the section and all its children are wrapped in a single `quote` block
   in `contents[]`. Inner desc / strongText / pic are preserved in their
   original DOM order inside `quote.children`.
7b. **Truncates 公众号 template footer** ("Contact Us" + "LATEST UPDATES"):
   - The 元素驱动 公众号 appends a fixed template footer to every article:
     a "Contact Us" info image (二维码+邮箱+地址), a QR code image,
     a "LATEST UPDATES" title banner, and 3+ past-article thumbnails.
   - Detection: scan blocks from the end; look for an `img` block with
     `data-w >= 1000` and `data-ratio ≈ 0.622 (±0.015)` — this is the
     "Contact Us" image. Everything from that image onward is trimmed.
   - If no "Contact Us" image is found but ≥4 trailing consecutive img
     blocks exist, **do NOT auto-trim** — instead flag `_meta.reviewFlag`
     for manual inspection. This avoids false positives on articles with
     legitimate consecutive photos in the body.
   - Articles without the template footer (e.g. reposts like id=38) are
     left untouched — `footerTrimmed: 0` in `_meta`.
8. Writes `public/data/news_<id>.json` with `headPic/footerPic` using the
   shared decorative assets and `contents[]` preserving real DOM order
   (images and text interleaved exactly as in the 公众号).
9. Appends to `scripts/fetch-news/report.json` with stats + `listThumb` (the
   first kept non-banner image, to be used as `news_list.json`'s `pic`).
10. Does NOT write top-level `pic` / `coverPic` in `news_<id>.json` (critical
    render-contract rule).

### Step 4: Rich-Text Emphasis Rules

These rules live inside `fetch.mjs` (`extractSegments` + `segmentsToBlock`),
but apply the same heuristics when manually authoring strongText.

**A. Partial highlight is preserved.** If a paragraph mixes plain black and
colored runs, emit HTML like:
```
<span class='orange-text'>仅有色部分</span>其余黑色部分
```
NOT the whole paragraph in orange.

**B. Color → class mapping**
Parse CSS `color: rgb(...)` / `color: #xxxxxx` / named colors. Map via
`rgbToEmphasisClass([r,g,b])`:
- `r≥180 && b<100` → `.orange-text`
- `b≥150 && r<150` → `.blue-text`
- `g≥140 && g>r && g>b` → `.green-text`
- `g≥120 && b≥120 && r<150` → `.blue-green-text`
- anything else non-black non-gray → `.orange-text` (project primary)

**C. Black & gray are NOT emphasis**
- `isBlackish`: r<60 & g<60 & b<60 → do not mark
- `isGrayish`: max(r,g,b) - min(r,g,b) ≤ 20 and 60<max<220 → do not mark
  (gray is typically 公众号 source-attribution style)

**D. `<strong>` / `<b>` / `font-weight ≥ 600`** → `.strong-text`

**E. Signature / End lines → force desc**
These patterns strip any emphasis even if colored:
- `^\*?\s*来源[:：]` — e.g. `*来源：阿克苏市融媒体中心`
- `^撰稿`, `^编辑`, `^审[核阅]`, `^排版`, `^摄影`, `^图[/／]文`,
  `^(文|图)[:：]`
- `^END$`, `^—\s*END\s*—`
- `^往期(推荐|回顾)`, `^more news`

**F. Whole-gray paragraphs** → force desc.

### Step 5: Manual Review (REQUIRED, per-article)

After the script runs, read each `news_<id>.json` and verify:

1. **Image order**: each `pic` block sits at the exact position where the
   image appears in the original 公众号 article (between the same two
   paragraphs). Open a couple of the downloaded `news<id>_pic_<seq>.jpg`
   files to visually confirm content matches expectations (not decorative
   garbage).
2. **First-image position**: the article's hero image should be the first
   `pic` in `contents[]`, typically between desc[0] and desc[1] (not before
   desc[0]). If the original article starts with a decorative icon that was
   auto-filtered (< 8 KB), the first kept image is the actual hero —
   correct behavior.
3. **strongText quality**: open each `strongText` block and verify:
   - the colored portion really matches the original 公众号 emphasis
   - the span class matches the original color family
   - the remaining black text is preserved outside the span
   - no signature line (`*来源：...`) was accidentally marked orange
4. **overviewtitle**: should be the **content portion** of the title, NOT the
   category label. If title format is `分类｜内容` (e.g. `Mint 产品力｜XXX`)
   → use `XXX`. If title format is `内容｜分类` (e.g. `XXX｜MiNT 进行时`)
   → also use `XXX`. Never use the category name (e.g. "Mint 产品力" or
   "MiNT进行时") as overviewtitle — that's meaningless in the preview card.
5. **time**: prefer `publish_time` from the article (YYYY/MM/DD), not today's
   date.

Any discrepancy → hand-fix the JSON directly; re-run the script on that id
will OVERWRITE the file, so prefer targeted edits.

### Step 6: Append to `news_list.json`

For each article, prepend to `public/data/news_list.json` (list is in
reverse-chronological order).

**CRITICAL: MUST use a Node script (not manual editing) to insert entries.**
The file contains Chinese curly quotes (`""`), `｜` (fullwidth pipe), and
other Unicode that `replace_in_file` / IDE tools silently corrupt (e.g.
converting `\u201c` / `\u201d` to ASCII `"` → breaks JSON parsing at
runtime). Use `scripts/fetch-news/_insert_list.mjs` pattern:

1. Read each `news_<id>.json` via `JSON.parse` (title/overviewtitle are
   already correctly escaped by `JSON.stringify`).
2. Get `pic` from `findFirstPic(contents)` — the first `pic` block in
   `contents[]` (recursing into `quote` sub-blocks). This guarantees
   the list thumbnail matches what the user sees as the first image in
   the detail page body. Do NOT use the download sequence number
   (banner-filtered images may shift the numbering).
3. Build the entry object and serialize with `JSON.stringify(entry, null, '\t')`.
4. Splice into the raw file buffer after `[`.

Example entry (generated by script, NOT hand-written):
```json
{
	"id": 38,
	"title": "元素驱动全生物降解地膜助力阿克苏市棉花试验田走出\u201c绿色增产\u201d新路径｜MiNT 进行时",
	"time": "2025/09/15",
	"pic": "assets/News/202604/news38_pic_2.jpg",
	"categorylabel": "#MiNT 进行时",
	"categorycolor": "#FF7200",
	"overviewtitle": "元素驱动全生物降解地膜助力阿克苏市棉花试验田走出\u201c绿色增产\u201d新路径"
}
```

Keep the existing 37 entries unchanged. Sort new entries by publish date
(newest first) among themselves before prepending.

### Step 7: Validation

1. Run `yarn serve` (or the user's existing dev server) and visit the news
   list + each new detail page:
   - List: 11 new cards appear at the top, correct category color & thumbnail
   - Detail: title → decorative band → first paragraph → hero image → second
     paragraph → … → (no duplicate hero image under the title)
   - Colored spans render in correct color family
2. Cross-check with the mobile version (`MiNTNewsMobile*.vue`) — both PC and
   Mobile read the same JSON.
3. Commit only after each article passes manual review.

## Lessons Learned (from id=38 pilot, 2026-04-23)

Five issues identified during the first article import, now codified in
`fetch.mjs` and the rules above:

| # | Issue                                               | Root Cause                                  | Fix                                                                         |
| - | --------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| 1 | Hero image rendered twice under title               | Both top-level `pic` and `headPic` set      | Drop top-level `pic`/`coverPic`; `headPic` uses decorative band only        |
| 2 | Hero image placed above paragraph 1, not between 1&2 | Hero shoved into `headPic` ignoring DOM order | Place hero as the first `pic` block in `contents[]`, at its real DOM position |
| 3 | 3 colored paragraphs lost emphasis                  | Detector missed inline `color: rgb(...)`    | `extractSegments` + `parseColor` + `rgbToEmphasisClass` with partial spans  |
| 4 | Signature line "*来源：..." painted orange          | Rule too aggressive, no signature whitelist | `SIGNATURE_PATTERNS` force-downgrade to desc                                |
| 5 | 2.6 KB decorative emoji chosen as hero              | No size filter                              | Files < 8 KB filtered out; first KEPT image becomes listThumb               |

## Lessons Learned (from id=39/40/41 batch, 2026-04-23)

Two additional issues found after running the batch, now codified:

| # | Issue                                               | Root Cause                                  | Fix                                                                         |
| - | --------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| 6 | 33 KB "MiNT 进行时" orange banner + 13 KB "END" strip chosen as hero/list thumb | 8 KB size filter too permissive; these banner strips are larger than 8 KB but visually decorative | Added aspect-ratio filter: `data-w >= 600 && data-ratio < 0.45` → treat as banner decoration |
| 7 | First paragraph with orange left vertical bar lost the bar (rendered as plain desc) | `border-left` + colored-bar 引用段 style not recognized | Added `isQuoteSection` detector; new `quote` block type in `contents[]`; new `.section-quote` CSS in `MiNTNewsDetailSection.vue` with `border-left: 3px solid #e75a29; padding-left: 24px` (PC) / `2px / 12px` (mobile) |
| 8 | 公众号 footer "Contact Us" + "LATEST UPDATES" area scraped as article content (extra images at end of detail page) | Initial fix used "≥3 trailing consecutive pics → auto-trim" which is too aggressive and could false-positive on articles with legitimate consecutive photos | Replaced with precise detection: scan for "Contact Us" image by `data-ratio ≈ 0.622 ± 0.015, data-w ≥ 1000`; trim from that image onward. If no Contact Us found but ≥4 trailing pics, flag `_meta.reviewFlag` for manual review WITHOUT auto-trimming |
| 9 | Hand-editing `news_list.json` via `replace_in_file` silently corrupted Chinese curly quotes (`""`→`""`) causing runtime `TypeError: Cannot create property 'transform' on string` crash | IDE/tool replaced `U+201C`/`U+201D` with ASCII `U+0022`, breaking JSON structure. Also, `listThumb` pic field pointed to banner images that had been deleted | **MUST use a Node script** to insert entries into `news_list.json` (read title/overviewtitle from `news_<id>.json` via `JSON.parse`, serialize via `JSON.stringify`). `pic` field must be `findFirstPic(contents)` — the first pic block in rendered contents, not the first downloaded file |

## Lessons Learned (from id=42-48 batch, 2026-04-23)

| # | Issue | Root Cause | Fix |
| - | ----- | ---------- | --- |
| 10 | 蓝色"MiNT 产品力"文章（id=42/46/48）顶部装饰带显示为橙色 | `headPic` 硬编码为 `new_head_1/2.jpg`（橙色），不区分分类 | 从已下载的蓝色 banner 图复制为 `new_head_blue_1/2.jpg`；`fetch.mjs` 根据 `categorycolor` 自动选择：`#144BE1`→蓝色，默认→橙色 |
| 11 | id=48 编号小标题（01/02/03 蓝色圆点+蓝色标题）无法用 `strongText`/`desc` 还原——原文是 `display:flex` + 圆形背景 + letter-spacing 的复杂 CSS 布局 | `strongText` 只支持 5 种预设 class，无法表达任意 CSS 排版 | 新增 **`richHtml` 通用块**：组件加 `<div v-if="content.richHtml" class="rich-html" v-html="content.richHtml"></div>`（5 行改动），JSON 中直接传入 `<div style='display:flex;...'>` 内联样式 HTML。一次扩展，永久适用任何花式排版 |
| 12 | id=48 编号标题下出现草地装饰图（`pic_10.png`），原文中没有 | 脚本把 CSS 排版中的装饰分隔条也作为 `pic` 保留了 | 手动删除不需要的装饰图块；`richHtml` 不会引入额外图片 |
| 13 | id=44 招聘篇排版极其花哨（卡片式岗位列表、编号装饰、两列福利 grid 等），逐块还原工作量巨大 | 复杂 CSS 排版文章用 block 数组还原性价比极低 | **截图方案**：用 playwright-cli 打开公众号原文，滚动触发 lazyload，`el.screenshot({path:...})` 截取 `#js_content` 为长图 PNG，JSON 中用单个 `nopaddingpic` 块引用。完美还原原始排版，零额外开发 |
| 14 | id=48/47 主页列表右侧 `overviewtitle` 只显示分类名（"Mint 产品力"/"MiNT进行时"）而非内容标题 | 脚本生成的 `overviewtitle` 取了 title 中 `｜` 后面的分类部分 | **规则**：`overviewtitle` = title 中 `｜` 前面的内容主体部分（去掉 `Mint 产品力｜` / `MiNT进行时｜` 等分类前缀/后缀）。如果标题格式是 `分类｜内容`，取内容；如果是 `内容｜分类`，也取内容 |
| 15 | id=44 列表缩略图空白 | `news_list.json` 的 `pic` 指向被过滤的小装饰图 `news44_pic_4.png`（14KB） | 手动选择文章中有代表性的大图作为缩略图（如办公楼照片 `news44_pic_15.jpg`） |
| 16 | 编辑 `news_list.json` 后页面报错 `TypeError: Cannot create property 'transform' on string` | 编辑时 title/overviewtitle 中的中文引号 `""` 被工具自动替换为 ASCII `""`，导致 JSON 解析失败，`filteredNews` 数组中混入字符串元素 | 参见 Lesson #9——**绝对不要**用文本替换工具编辑 `news_list.json`。如已损坏，用 Node 脚本修复：逐行扫描 JSON 值中的裸 `0x22`，替换为 `\u201c` |

## Advanced Techniques

### richHtml 块使用指南

`richHtml` 是万能逃生舱——任何公众号花式排版都可以直接把那段 HTML（带内联样式）塞进去：

```json
{
  "richHtml": "<div style='display:flex;align-items:center;justify-content:center;gap:12px'><span style='display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:#3F8FEF;color:#fff;font-size:20px;font-weight:bold;flex-shrink:0'>01</span><b style='color:#3F8FEF;font-size:21px;letter-spacing:2px'>标题文字</b></div>"
}
```

使用原则：
- **先尝试现有块类型**（desc/strongText/pic/quote），只有表达不了时才用 richHtml
- **所有样式必须内联**（`style="..."`），不要依赖外部 class
- **不要嵌入 `<script>` 或事件处理器**——这是 `v-html` 渲染，有 XSS 风险
- PC 端 `.rich-html` 有 `margin-top: 50px`，Mobile 端 `20px`

### 浏览器截图整页导出方案

对于排版极其复杂的文章（招聘信息、活动海报等），可以直接截图：

```bash
# 1. 打开公众号文章
playwright-cli open <url> --browser=chrome

# 2. 滚动触发 lazyload
playwright-cli run-code "async page => { for(let i=0;i<30;i++){await page.evaluate(()=>window.scrollBy(0,500));await page.waitForTimeout(200)} await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(1000); }"

# 3. 截取正文区域为长图
playwright-cli run-code "async page => { const el = page.locator('#js_content'); await el.screenshot({path: 'src/assets/News/202604/news<id>_full.png'}); }"

# 4. 关闭浏览器
playwright-cli close
```

然后 JSON 中只需一个 `nopaddingpic` 块：
```json
{
  "sections": [{
    "headPic": [...],
    "contents": [{ "nopaddingpic": "assets/News/202604/news<id>_full.png" }],
    "footerPic": [...]
  }]
}
```

注意事项：
- 截图后需要手动在 `news_list.json` 中选择一张有代表性的图片作为缩略图
- 截图文件通常 1-2MB，可以接受
- 此方案牺牲了 SEO（文字变成图片），仅用于排版极端复杂且非核心 SEO 内容的文章

- Script: `scripts/fetch-news/fetch.mjs`
- Mapping: `scripts/fetch-news/mapping.json`
- Report (incremental): `scripts/fetch-news/report.json`
- Images: `src/assets/News/<yyyymm>/news<id>_pic_<seq>.<ext>`
- List: `public/data/news_list.json`
- Detail: `public/data/news_<id>.json`
- Render components (read-only reference):
  - `src/pages/MiNTNews/MiNTNewsDetail.vue`
  - `src/components/MiNTNews/MiNTNewsDetailCom.vue` (renders `info.pic` — DO NOT POPULATE)
  - `src/components/MiNTNews/MiNTNewsDetailSection.vue` (renders `headPic` + `contents[]` + `footerPic`)
  - `src/components/MiNTNews/NewsCardPreview.vue` (renders list `info.pic`)

## Dependencies

- `node-html-parser` — dev dependency, already installed (`package.json`
  devDependencies). Install with `yarn add -D node-html-parser --ignore-engines`
  if missing. No Playwright / jsdom required.
- Node 18+ (native `fetch`).

## CRITICAL Execution Rules

1. **NEVER** set top-level `pic` / `coverPic` in `news_<id>.json`.
2. **NEVER** put the article hero image in `headPic` — use the shared
   decorative band assets only.
3. **ALWAYS** preserve original DOM order for image/text interleaving.
4. **ALWAYS** manual-review each article before appending to
   `news_list.json`.
5. **NEVER** invent CSS classes outside the whitelist; unknown colors map to
   `.orange-text`.
6. **NEVER** auto-guess categories; require explicit category input from the
   user.
7. News images go to `src/assets/News/<yyyymm>/` (new batch may need new
   directory); referenced path in JSON is `assets/News/<yyyymm>/...` without
   leading slash (consumed by `getImageUrl()` util).
8. **Banner/decorative strips** (data-w ≥ 600, data-ratio < 0.45) MUST be
   filtered out of `contents[]` and MUST NOT be chosen as `listThumb`.
9. **Quote blocks** produced by the `isQuoteSection` detector must keep
   their children (`desc` / `strongText` / `pic`) in the original DOM order
   inside `quote.children`. Do not flatten a `quote` into sibling desc
   blocks — that loses the orange left vertical bar on render.
10. **NEVER hand-edit `news_list.json`** via `replace_in_file` or similar
    text-replacement tools. The file contains Chinese curly quotes and
    fullwidth Unicode that tools silently corrupt into ASCII equivalents,
    breaking JSON at runtime. Always use a Node script that reads
    `news_<id>.json` → `JSON.parse` → builds entry → `JSON.stringify` →
    splices into the raw file buffer.
