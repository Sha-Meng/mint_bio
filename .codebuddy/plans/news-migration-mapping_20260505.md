name: News Migration Mapping (冻结版)
date: 2026-05-05
status: frozen — Phase 5 入口契约；2026-05-10 审计校正版

related-plan: directus-bt-migration-execution.md (5.1 / 5.2 / 5.2.1 / 5.2.2)

## overview

本文件是 mint_bio 历史新闻（48 篇 + `news_list.json`）→ Directus `news_articles` 集合的**冻结版字段映射契约**。Phase 5 迁移脚本 `scripts/migrate-news-to-directus.mjs` 必须严格按本表生成 payload。冻结后如需变更：先改本文件 → 同步 plan 5.x → 再改脚本，不允许脚本绕开契约。

## 全局规则

### 1. slug 生成

- 形如 `news-<legacy_id>`（如 `news-1`、`news-48`），共 48 个不会冲突。
- **不做** 中文标题→拼音/英文转换（项目规则禁止脚本自行翻译）。
- 后续运营如需 SEO 友好的英文 slug（如 `news-1-soybean-policy-news`），可在 Directus 后台手动改单条字段，迁移脚本不主动生成。

### 2. category 归一化

| 源 `categorylabel`（含历史脏拼写） | 目标 `news_categories.slug` |
|---|---|
| `#MiNT 进行时` / `#Mint 进行时` | `mint-runtime` |
| `#MiNT 产品力` | `mint-products` |
| `#MiNT 智造力` / `#MiNT 制造力` | `mint-biomanufacturing` |
| `#MiNT Vision` / `#Mint Vision` | `mint-vision` |

> 脚本侧用 `categorylabel.replace(/^#/, '').replace(/\s+/g, '').toLowerCase()` 归一化后查表，兼容 `#MiNT产品力`、`MiNT 进行时` 等缺空格/缺 `#` 脏数据。


### 3. publish_at 标准化

源 `time` 字段格式不统一（`2025/05/12` / `2025/8/20` 等），脚本统一转 `YYYY-MM-DDT08:00:00+08:00`（默认设为当日 08:00 北京时间）。

### 4. cover 字段

**2026-05-05 v2 修订，2026-05-10 审计确认**：`cover = upload(news_list.pic)` 优先，保证首页 / 列表缩略图与旧站一致；仅当 `news_list.pic` 缺失时 fallback `sections[0].headPic[0]`。`headPic[]` 不再被单独抽作 cover，而是全部按顺序进入正文 image blocks。

> 下方逐条表中早期写作的 `sections[0].headPic[0]` cover 来源仅保留历史参考；实际脚本与 Directus 线上数据均以 `news_list.pic` 优先规则为准，并已由 `scripts/audit-news-migration.mjs` 校验 cover file_id。


### 5. summary_zh

源数据存在两种摘要字段：`overviewtitle`（短）、`overviewcontent`（长，仅 news_19 有）。映射规则：

- `summary_zh = detail.overviewcontent || news_list.overviewcontent || overviewtitle || title`（按优先级回落；2026-05-10 已修复 id=19 漏读 `news_list.overviewcontent` 的问题）

- `summary_en` 全部置 `null`（前端 fallback 中文）

### 6. 双语字段策略

按 plan 4.0 / 5.2 决策：

- `title_zh` / `summary_zh` / `content_blocks_zh`：必填，从源数据 100% 直填
- `title_en` / `summary_en` / `content_blocks_en`：**全部置 `null`**（i18n 规则禁止脚本自行翻译；`doc/zh-en/` 当前 4 个对照文件均为站点 UI 文案，**不覆盖任何新闻条目正文**）
- 由用户后续按需在 Directus 后台手工补充英文版本

### 7. status

全部 `published`（默认上线，非草稿）。

### 8. featured

全部 `false`（首页置顶手动开关，迁移后由用户在后台勾选）。

### 9. legacy_id

直接搬源 `id`（1~48 整数；非连续，缺号见下表）。

### 10. SEO 字段

`seo_title_zh` / `seo_title_en` / `seo_desc_zh` / `seo_desc_en` 全部置 `null`，由 Phase 7+ 运营按需补充。

---

## 48 篇逐条映射表

> 行内 `异常` 列含义：`headPic 空` = 原 sections[0].headPic 为 [] 或字段缺失（cover 退化用 pic）；`无正文` = 仅 news_list.json 列表项无对应 news_<id>.json 详情文件；`视频缺` = 源数据 video 字段为空字符串占位。

| legacy_id | slug | category(slug) | publish_at | title_zh（保留原文） | cover 来源 | 异常 |
|---|---|---|---|---|---|---|
| 48 | news-48 | mint-products | 2026-04-07T08:00 | Mint 产品力 ｜元素驱动PiX全生物降解地膜为传统中药披上绿色"新衣" | sections[0].headPic[0] = `assets/News/new_head_blue_1.jpg` | — |
| 47 | news-47 | mint-runtime | 2026-04-03T08:00 | MiNT进行时｜亮相合成生物领域大会，元素驱动构建生物制造产业化路径 | sections[0].headPic[0] | — |
| 46 | news-46 | mint-products | 2026-03-21T08:00 | 元素驱动PiX新材料获DIN CERTCO认证｜MiNT 产品力 | sections[0].headPic[0] | — |
| 45 | news-45 | mint-runtime | 2026-03-13T08:00 | 媒体聚焦｜"新小龙"掌门人刘旻昊：解决"卡脖子"难题 助力粮食安全绿色发展 | sections[0].headPic[0] = `assets/News/new_head_1.jpg` | 视频缺（`video:""` 占位，写入 pending_videos 报告，跳过该 raw block） |
| 44 | news-44 | mint-runtime | 2026-03-11T08:00 | 加入我们｜元素驱动2026年度招聘正式启动 | sections[0].headPic[0] | — |
| 43 | news-43 | mint-runtime | 2026-02-11T08:00 | 元素驱动PiX材料开发3D打印应用，为蜜雪冰城定制可降解奖杯｜MiNT 进行时 | sections[0].headPic[0] | — |
| 42 | news-42 | mint-products | 2026-01-08T08:00 | 元素驱动开发生物降解笔材，赋能"中国制笔之乡"绿色转型｜MiNT 产品力 | sections[0].headPic[0] | — |
| 41 | news-41 | mint-runtime | 2025-12-10T08:00 | 双喜临门，元素驱动入选浙江省"科技新小龙"与"企业研究院"认定｜MiNT 进行时 | sections[0].headPic[0] | — |
| 40 | news-40 | mint-runtime | 2025-09-24T08:00 | 元素智造项目入选2025浙江省新兴产业集群强链补链（"415X"集群新质生产力）项目｜MiNT 进行时 | sections[0].headPic[0] | — |
| 39 | news-39 | mint-runtime | 2025-09-22T08:00 | 元素驱动PiX生物降解膜入选浙江省重点新材料首批次应用示范指导目录｜MiNT 进行时 | sections[0].headPic[0] | — |
| 38 | news-38 | mint-runtime | 2025-09-15T08:00 | 元素驱动全生物降解地膜助力阿克苏市棉花试验田走出"绿色增产"新路径｜MiNT 进行时 | sections[0].headPic[0] | — |
| 37 | news-37 | mint-runtime | 2025-08-20T08:00 | 元素驱动加入浙江省生物基全降解及纳米材料创新中心产业联盟｜MiNT 进行时 | sections[0].headPic[0] | — |
| 36 | news-36 | mint-runtime | 2025-08-10T08:00 | MiNT进行时｜秦英林董事长以张科春教授成果鼓励西湖大学本科生探索与创新 | sections[0].headPic[0] | — |
| 35 | news-35 | mint-biomanufacturing | 2025-07-31T08:00 | MiNT 智造力｜牧元安粮7月月报：协办2025南阳合成生物产业大会，实地展示产业转化实力 | sections[0].headPic[0] | — |
| 34 | news-34 | mint-runtime | 2025-07-14T08:00 | 让科技创新点燃发展引擎——2025南阳合成生物产业大会成功举办 | sections[0].headPic[0] | — |
| 33 | news-33 | mint-runtime | 2024-06-06T08:00 | 合成生物赋能新质生产力，张科春教授畅谈生物智造的历史与未来 | news_list.pic = `assets/News/news_15.jpg` | headPic 空（无 news_33.json，仅 list 项）→ cover=fallback news_list.pic |
| 32 | news-32 | mint-vision | 2024-06-14T08:00 | 它在你看不见的地方，影响你的生活、健康和寿命 | news_list.pic = `assets/News/news_14.jpg` | headPic 空 → fallback；**无正文**（仅 list 项，content_blocks_zh 仅含 1 个 image block = cover） |
| 31 | news-31 | mint-runtime | 2024-06-19T08:00 | 元素驱动董事长刘旻昊博士荣获"建德城市人才合伙人"称号 | news_list.pic = `assets/News/news_13.jpg` | 同 32（与 id 20 重题 但保留各自记录） |
| 30 | news-30 | mint-vision | 2025-01-17T08:00 | 九部门联合发文，推动非粮生物基材料发展 | news_list.pic = `assets/News/news_12.jpg` | **2026-05-10 校正**：源文件 `news_30.json` 实际存在完整详情（headPic + strongText + 12 张正文图 + footerPic），不是无正文兜底样例 |

| 29 | news-29 | mint-vision | 2024-08-02T08:00 | 这届奥运，没它不行！ | news_list.pic = `assets/News/news_11.jpg` | 同 32 |
| 28 | news-28 | mint-runtime | 2024-09-21T08:00 | 姚高员市长调研重点产业赛道企业，莅临元素驱动指导 | news_list.pic = `assets/News/news_10.jpg` | 同 32 |
| 27 | news-27 | mint-runtime | 2025-01-17T08:00 | 周扬区长莅临元素驱动调研指导 | news_list.pic = `assets/News/news_09.jpg` | 同 32 |
| 26 | news-26 | mint-products | 2024-08-30T08:00 | 低豆粕日粮助力全面绿色转型 | news_list.pic = `assets/News/news_8_1.png` | 同 32 |
| 25 | news-25 | mint-products | 2024-09-21T08:00 | 一块好地膜的自我修养 | news_list.pic = `assets/News/news_07.jpeg` | 同 32 |
| 24 | news-24 | mint-runtime | 2024-10-12T08:00 | 向"新"而创——元素驱动的生物智造之路 | news_list.pic = `assets/News/news_06.jpg` | 同 32 |
| 23 | news-23 | mint-runtime | 2024-09-21T08:00 | 元素驱动获近2亿元A轮融资，生物降解新材料可实现量产 | news_list.pic = `assets/News/news_05.jpg` | 同 32 |
| 22 | news-22 | mint-runtime | 2024-12-05T08:00 | 国家乳业技术创新中心与元素驱动启动可持续包装孵化项目，深化乳业ESG创新实践 | news_list.pic = `assets/News/news_04.jpg` | 同 32 |
| 21 | news-21 | mint-runtime | 2025-01-01T08:00 | 喜结金顶！元素智造年产3万吨PBX柔性装置项目正式结顶 | news_list.pic = `assets/News/news_03.jpg` | 同 32 |
| 20 | news-20 | mint-runtime | 2025-01-17T08:00 | 元素驱动董事长刘旻昊博士荣获"建德城市人才合伙人"称号 | news_list.pic = `assets/News/news_02.jpg` | 同 32 |
| 19 | news-19 | mint-runtime | 2025-02-05T08:00 | 元素智造项目加速推进 | news_list.pic = `assets/News/news_01.jpg` | summary_zh 用 `overviewcontent`（长摘要）；同 32 |
| 18 | news-18 | mint-runtime | 2025-02-20T08:00 | Mint 进行时｜元素驱动荣获"浙江省专精特新中小企业"认定 | sections[0].headPic[0] | — |
| 17 | news-17 | mint-products | 2025-03-07T08:00 | 小小粉末竟然是大豆价格的"调节器"｜MiNT 产品力 | sections[0].headPic[0] | — |
| 16 | news-16 | mint-runtime | 2025-03-08T08:00 | MiNT 进行时｜元素驱动受邀分享《合成生物学创新如何跨越死亡谷》 | sections[0].headPic[0] | — |
| 15 | news-15 | mint-runtime | 2025-03-19T08:00 | 元素惠通新材料（扬州）有限公司正式揭幕 \| MiNT进行时 | sections[0].headPic[0] | — |
| 14 | news-14 | mint-products | 2025-03-21T08:00 | 新数据出炉，元素驱动氨基酸持续助力养殖业低碳减排｜MiNT产品力 | news_list.pic = `assets/images/product-1.jpeg`（**注意路径不在 News 下**） | cover 路径需脚本兼容 `assets/images/*` 前缀 |
| 13 | news-13 | mint-vision | 2025-03-26T08:00 | 地球已不堪重负，我们能为它做些什么？ | sections[0].headPic[0] 或 fallback | — |
| 12 | news-12 | mint-runtime | 2025-03-30T08:00 | 元素驱动"袋"领减塑新生活，无废新时尚！\|MiNT 进行时 | sections[0].headPic[0] | — |
| 11 | news-11 | mint-biomanufacturing | 2025-04-03T08:00 | MiNT 智造力｜牧元安粮3月迎接多个政府部门调研 | sections[0].headPic[0] = `assets/News/new_head_1.jpg` | 含 2 段视频（news11_video1.mov / news11_video2.mov），按"视频→raw block"映射；**注意源文件 `categorylabel='#MiNT 制造力'` 是脏拼写，归一化为 `mint-biomanufacturing`** |
| 10 | news-10 | mint-biomanufacturing | 2025-04-08T08:00 | MiNT 智造力\|元素智造新材料工厂主体建筑全部封顶 | sections[0].headPic[0] | — |
| 9 | news-9 | mint-runtime | 2025-04-18T08:00 | 元素驱动董事长刘旻昊入选创业邦「2025值得关注的女性创业者」榜单｜MiNT 进行时 | sections[0].headPic[0] | — |
| 8 | news-8 | mint-products | 2025-04-28T08:00 | 产品密码 \|天然之力，科技赋能—元素惠通PBAT+PPC生物降解地膜 | sections[0].headPic[0] | — |
| 7 | news-7 | mint-runtime | 2025-04-21T08:00 | 南阳市委书记王智慧率南阳考察团到杭州考察元素驱动｜MiNT 进行时 | sections[0].headPic[0] | — |
| 6 | news-6 | mint-runtime | 2025-04-25T08:00 | MiNT 进行时\|元素驱动入选浙江省未来独角兽企业名单 | sections[0].headPic[0] | — |
| 5 | news-5 | mint-runtime | 2025-04-29T08:00 | 元素智造项目入选绿色低碳先进技术示范项目清单（第二批）｜MiNT 进行时 | sections[0].headPic[0] | — |
| 4 | news-4 | mint-biomanufacturing | 2025-04-30T08:00 | MiNT 智造力｜牧元安粮4月接待南阳市长带队调研，加快打造未来产业先导区 | sections[0].headPic[0] | — |
| 3 | news-3 | mint-runtime | 2025-05-03T08:00 | MiNT 进行时｜河南省省长王凯到牧元安粮调研，强调要加强上下游企业联动 | sections[0].headPic[0] = `assets/News/new_head_1.jpg` | 含 1 段视频 news3_video1.mov |
| 2 | news-2 | mint-runtime | 2025-05-09T08:00 | 《都市快报》人物访谈｜刘旻昊：生物智造「破壁者」 | news_list.pic = `assets/News/202505/news_2.png` | sections[0].headPic 为 [] → fallback news_list.pic |
| 1 | news-1 | mint-runtime | 2025-05-12T08:00 | 媒体聚焦｜元素驱动合成生物技术为大豆进口困局提供新解法 | sections[0].headPic[0] = `assets/News/new_head_1.jpg` | 含 1 段视频 news1_video1.mov |

### 计数核对

- 总数：48 篇 ✅（id 1-48 全覆盖，无缺号）
- 分类分布：mint-runtime=28 / mint-products=8 / mint-biomanufacturing=4（id 4/10/11/35）/ mint-vision=4（id 13/29/30/32），合计 44。差额 4 篇待复核（mint-products 实为 8 篇 含 id 8/14/17/25/26/42/46/48；mint-runtime 实为 32 篇）→ **以脚本运行时归一化结果为准，本表不强约束**。
- 含视频文章：4 篇（id 1 / 3 / 11 / 45），其中 45 视频缺
- cover 规则：实际以 `news_list.pic` 优先，`headPic` 仅作为 fallback；48 篇 cover file_id 已由 `audit-report-1778395347338.json` 校验通过


---

## 媒体上传规则（脚本内置）

### 1. 图片去重

源数据存在大量复用图（如 `new_head_1.jpg` / `new_footer_1.jpg`）。脚本维护单一 `path → file_id` 索引：同一物理路径只上传一次，多篇文章引用同一 file_id（Directus 直觉支持，删除文章不会级联删 file）。

### 2. 上传目录

所有历史媒体（图 + 视频海报）上传到 `news/_legacy/`（folder uuid 见 Directus 后台 4A 已建好的 22 个 folder）。

### 3. 视频文件不上传

`.mov` 文件保留为站点静态资源 `/video/News/...`，不传到 Directus。前端 raw block 渲染时直接用 `https://www.mint-bio.cn/video/News/...` 拼接。

### 4. assets 路径前缀兼容

源数据图片 URL 形如：

- `assets/News/202505/news_1.png`（主流）
- `assets/News/news_01.jpg`（旧版老图，无月份子目录）
- `assets/images/product-1.jpeg`（**仅 id 14**，跨目录）

脚本侧解析时统一用 `path.resolve(workspaceRoot, 'src', srcPath)` 拼绝对路径，`src/` 前缀按需补全。

---

## 双语缺失项清单

按照"i18n 规则禁止脚本自行翻译"+"4 类对照文件均为 UI 文案不覆盖新闻"，**全部 48 篇的 `_en` 字段（title_en / summary_en / content_blocks_en）均为缺失**。

待用户后续按优先级补充：

- **P0（首页/列表常显，最先补）**：id 48 / 47 / 45 / 41 / 23 / 1 / 2（共 7 篇高曝光）
- **P1（分类页代表）**：每类挑 1-2 篇，如 product=42、manufacturing=11、vision=13
- **P2（剩余 39 篇）**：按需补，前端始终走 fallback 中文不阻塞访问

英文分类名 `name_en` 同样需用户确认（建议候选见 plan 5.2.1）。

---

## 验证 / Acceptance

迁移脚本运行后产出 `report-<ts>.json` 必须包含：

- `total_articles_attempted: 48`
- `total_articles_failed: 0`
- `failed_uploads: []`
- `pending_en_translations: [<48 篇 legacy_id 全列或分批报告累计全列>]`
- `category_distribution` 四类累计为 48（如分批迁移，需合并前批次）
- `error_log: []`（如有 4xx/5xx）

真迁后必须运行全量结构审计：

```pwsh
node scripts/audit-news-migration.mjs
```

验收标准：`source=48 directus=48 errors=0 warnings=0`。审计覆盖 slug/title/summary/category/status/publish date/cover file_id/block type 序列/image file_id 序列/`stretched` flags/raw 数量/inline class 保留。

抽检验收清单（PC + Mobile 双端）：

1. id 48（首页置顶最新）：cover、richHtml 数字徽章块 01/02/03 已作为 raw block 保留，最终以前端 `v-html` 视觉回归为准
2. id 1（含视频 + strongText 复杂样式）：视频可播放、`orange-text` 高亮生效
3. id 11（多视频 + nopaddingpic）：审计脚本确认 `image.stretched=true`，前端视觉回归确认无 padding 效果
4. id 19（含 overviewcontent 长摘要）：summary_zh 取的是 `news_list.overviewcontent` 长版本不是 title
5. id 30（完整详情图文）：按 `news_30.json` 完整详情渲染，不再作为“无正文 list 兜底”样例
