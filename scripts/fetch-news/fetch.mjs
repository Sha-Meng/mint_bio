#!/usr/bin/env node
/**
 * 微信公众号文章抓取脚本（mint_bio 官网新闻批量导入专用）
 *
 * 用法：
 *   node scripts/fetch-news/fetch.mjs --ids=38
 *   node scripts/fetch-news/fetch.mjs --ids=38,39,40,41
 *   node scripts/fetch-news/fetch.mjs --all
 *   node scripts/fetch-news/fetch.mjs --ids=38 --dry-run
 *
 * 产出：
 *   - 图片：src/assets/News/202604/news<id>_pic_<seq>.<ext>
 *   - JSON：public/data/news_<id>.json
 *   - 报告：scripts/fetch-news/report.json（增量）
 *
 * schema 对齐现有 37 篇规范：
 *   - NOT 写顶级 pic/coverPic（列表缩略图由 news_list.json 单独维护）
 *   - headPic = 根据 categorycolor 自动选装饰带：
 *       橙色 #FF7200 → [new_head_1.jpg, new_head_2.jpg]
 *       蓝色 #144BE1 → [new_head_blue_1.jpg, new_head_blue_2.jpg]
 *   - footerPic = [new_footer_1.jpg, new_footer_2.jpg]
 *   - 正文首图作为 contents[] 的第一个 pic 块（按原文 DOM 顺序穿插）
 *
 * 富文本策略：
 *   - class 白名单：orange-text / blue-text / green-text / blue-green-text / strong-text
 *   - 保留段内"部分高亮"：一段中只有某片段彩色时，只给该片段包 span，其余保留黑色原文
 *   - 署名/END 白名单强制降级为 desc（*来源 / 来源： / END / 往期推荐 开头）
 *   - 全段灰色（三通道接近）也降级为 desc
 *
 * 图片过滤：
 *   - 文件 <8 KB 视为装饰 emoji/图标，跳过下载
 *   - data-ratio<0.45 且 data-w>=600 视为横幅装饰条（如"MiNT 进行时"橙底头图带），过滤
 *   - dataURL / 空 src / data-src 缺失，跳过
 *
 * 引用块（竖线段）：
 *   - 公众号常用 <section style="border-width:0 0 0 3px; border-left-color: rgb(250,75,0);"> 作为引用样式
 *   - 识别为 quote 块：{ quote: [ {desc|strongText|pic}... ] }
 *   - 渲染侧 MiNTNewsDetailSection.vue 已新增 .quote-block 样式（橙色左竖线）
 */

import { parse } from 'node-html-parser';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const MAPPING_PATH = path.join(__dirname, 'mapping.json');
const REPORT_PATH = path.join(__dirname, 'report.json');
const IMAGE_DIR = path.join(REPO_ROOT, 'src/assets/News/202604');
const JSON_DIR = path.join(REPO_ROOT, 'public/data');
const IMAGE_REL_PREFIX = 'assets/News/202604';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const WX_REFERER = 'https://mp.weixin.qq.com/';

const MIN_IMAGE_BYTES = 8 * 1024; // <8KB 视为装饰，不保留
const BANNER_MIN_WIDTH = 600; // 判定横幅的最小 data-w
const BANNER_MAX_RATIO = 0.45; // 判定横幅的最大 data-ratio（h/w）

const args = process.argv.slice(2);
const flagIds = args.find((a) => a.startsWith('--ids='))?.replace('--ids=', '');
const isAll = args.includes('--all');
const isDryRun = args.includes('--dry-run');

function log(tag, ...msg) {
  console.log(`[${tag}]`, ...msg);
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// -------- 文本 / 颜色工具 --------
function cleanText(s) {
  return (s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

/** 将 CSS 颜色（hex / rgb / rgba / named）解析为 [r,g,b]，无法识别返回 null */
function parseColor(css) {
  if (!css) return null;
  const c = css.trim().toLowerCase();
  // rgb(a)(r, g, b[, a])
  const mRgb = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (mRgb) return [+mRgb[1], +mRgb[2], +mRgb[3]];
  // #rgb / #rrggbb
  const mHex3 = c.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
  if (mHex3) return [parseInt(mHex3[1] + mHex3[1], 16), parseInt(mHex3[2] + mHex3[2], 16), parseInt(mHex3[3] + mHex3[3], 16)];
  const mHex6 = c.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/);
  if (mHex6) return [parseInt(mHex6[1], 16), parseInt(mHex6[2], 16), parseInt(mHex6[3], 16)];
  // named (基础)
  const named = { red: [255, 0, 0], blue: [0, 0, 255], green: [0, 128, 0], orange: [255, 165, 0], black: [0, 0, 0], white: [255, 255, 255] };
  if (named[c]) return named[c];
  return null;
}

/** 判断 RGB 是否接近黑色（默认正文色） */
function isBlackish([r, g, b]) {
  return r < 60 && g < 60 && b < 60;
}

/** 判断是否灰阶（r/g/b 接近），用于识别署名灰字 */
function isGrayish([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min <= 20 && max < 220 && max > 60; // 非全白、非全黑的灰
}

/** 把 RGB 映射到 class 白名单，返回 class 名 或 null（无法映射时归为 orange 作为项目主色） */
function rgbToEmphasisClass([r, g, b]) {
  // 橙/红系：r 高，g 中低，b 低
  if (r >= 180 && b < 100 && g < 200 && r > g) return 'orange-text';
  // 蓝系：b 高，r 中低
  if (b >= 150 && r < 150) return 'blue-text';
  // 绿系：g 高，r/b 中低
  if (g >= 140 && r < 200 && b < 200 && g > r && g > b) return 'green-text';
  // 青绿（blue-green）：g/b 都偏高
  if (g >= 120 && b >= 120 && r < 150) return 'blue-green-text';
  // 其他非黑非灰 → 当作橙色（项目主色）
  return 'orange-text';
}

// -------- 署名 / 结尾行白名单 --------
const SIGNATURE_PATTERNS = [
  /^\*?\s*来源[:：]/, // *来源：
  /^撰稿/,
  /^编辑/,
  /^审[核阅]/,
  /^排版/,
  /^摄影/,
  /^图\s*[\/／]\s*文/,
  /^(文|图)[:：]/,
  /^END$/i,
  /^—\s*END\s*—/i,
  /^往期(推荐|回顾)/,
  /^more\s+news/i,
];

function isSignatureLike(text) {
  if (!text) return false;
  const t = text.trim();
  if (t.length === 0) return false;
  return SIGNATURE_PATTERNS.some((re) => re.test(t));
}

// -------- HTML → 富文本（部分高亮保真） --------
/**
 * 从段落节点抽出"文本 + 高亮片段"的序列，按原文顺序。
 * 返回 { segments: [{text, cls|null}], plainText }
 * 如果整段都没有 cls，则视为普通 desc。
 */
function extractSegments(node) {
  const segments = []; // {text, cls}
  const push = (text, cls) => {
    if (!text) return;
    const last = segments[segments.length - 1];
    // 合并相邻同 cls
    if (last && last.cls === cls) {
      last.text += text;
    } else {
      segments.push({ text, cls });
    }
  };

  function visit(n, inheritCls) {
    if (!n) return;
    if (n.nodeType === 3) {
      push(n.rawText || n.text || '', inheritCls || null);
      return;
    }
    if (n.nodeType !== 1) return;

    let cls = inheritCls || null;

    // 1. <strong>/<b> → strong-text（如果没有其他 cls 叠加）
    const tag = (n.tagName || '').toLowerCase();
    if (tag === 'strong' || tag === 'b') {
      cls = cls || 'strong-text';
    }

    // 2. class 里有预定义白名单
    const classAttr = (n.getAttribute?.('class') || '').toLowerCase();
    if (/orange-text/.test(classAttr)) cls = 'orange-text';
    else if (/blue-green-text/.test(classAttr)) cls = 'blue-green-text';
    else if (/blue-text/.test(classAttr)) cls = 'blue-text';
    else if (/green-text/.test(classAttr)) cls = 'green-text';
    else if (/strong-text/.test(classAttr) && !cls) cls = 'strong-text';

    // 3. inline style: color
    const style = n.getAttribute?.('style') || '';
    const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    if (colorMatch) {
      const rgb = parseColor(colorMatch[1]);
      if (rgb) {
        if (!isBlackish(rgb) && !isGrayish(rgb)) {
          cls = rgbToEmphasisClass(rgb);
        }
        // 灰色 / 黑色不标记（inheritCls 也不污染）
      }
    }

    // 4. font-weight: bold / 600+
    const weightMatch = style.match(/font-weight\s*:\s*(bold|[6-9]00)/i);
    if (weightMatch && !cls) cls = 'strong-text';

    if (n.childNodes && n.childNodes.length > 0) {
      for (const c of n.childNodes) visit(c, cls);
    } else {
      push(cleanText(n.text || ''), cls);
    }
  }

  for (const c of node.childNodes || []) visit(c, null);

  // 合并并去除段间多余空白
  const plainText = cleanText(segments.map((s) => s.text).join(''));
  return { segments, plainText };
}

/**
 * 基于 segments 生成：
 *   - 如果整段灰色或署名行 → { kind: 'desc', text: plainText }
 *   - 如果没有任何彩色 cls → { kind: 'desc', text: plainText }
 *   - 否则 → { kind: 'strong', html: "<span class='orange-text'>...</span>其它<span class='blue-text'>...</span>..." }
 */
function segmentsToBlock(segments, plainText) {
  if (isSignatureLike(plainText)) {
    return { kind: 'desc', text: plainText };
  }
  const hasCls = segments.some((s) => s.cls);
  if (!hasCls) {
    return { kind: 'desc', text: plainText };
  }
  const html = segments
    .map((s) => {
      const t = s.text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
      if (!t.trim()) return t;
      return s.cls ? `<span class='${s.cls}'>${t.trim()}</span>` : t.trim();
    })
    .join('');
  // 再做一轮 trim + 单空格化
  const htmlNorm = html.replace(/\s+/g, ' ').trim();
  return { kind: 'strong', html: htmlNorm };
}

// -------- DOM → 块数组（按原文顺序） --------
const LEAF_TEXT_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'blockquote', 'li']);

/**
 * 判断 section 是否是"引用块"：有明显的左边框（border-left）
 * 公众号常见写法：
 *   style="border-style: solid; border-width: 0px 0px 0px 3px; border-left-color: rgb(250,75,0);"
 * 或直接：
 *   style="border-left: 3px solid rgb(250,75,0);"
 */
function isQuoteSection(el) {
  if (!el || el.nodeType !== 1) return false;
  const tag = (el.tagName || '').toLowerCase();
  if (tag !== 'section' && tag !== 'blockquote') return false;
  const style = (el.getAttribute('style') || '').toLowerCase();
  if (!style) return false;

  // 形式 A：border-left: Npx solid color
  const bl = style.match(/border-left\s*:\s*(\d+)px\s+\w+\s+([^;]+)/);
  if (bl && parseInt(bl[1], 10) >= 2) {
    const rgb = parseColor(bl[2]);
    if (rgb && !isBlackish(rgb)) return true;
  }

  // 形式 B：border-width: 0 0 0 Npx + border-left-color
  const bw = style.match(/border-width\s*:\s*([^;]+)/);
  const blc = style.match(/border-left-color\s*:\s*([^;]+)/);
  if (bw && blc) {
    const parts = bw[1].trim().split(/\s+/).map((p) => parseInt(p, 10) || 0);
    // 4 值: top right bottom left / 2 值: vert horiz / 1 值: all
    let leftW = 0;
    if (parts.length === 4) leftW = parts[3];
    else if (parts.length === 2) leftW = parts[1];
    else if (parts.length === 1) leftW = parts[0];
    if (leftW >= 2) {
      const rgb = parseColor(blc[1]);
      if (rgb && !isBlackish(rgb)) return true;
    }
  }
  return false;
}

function extractBlocks(rootEl) {
  const blocks = []; // { __kind: 'img'|'text'|'strong'|'quote', ... }

  function pushImg(imgEl, sink) {
    const src = imgEl.getAttribute('data-src') || imgEl.getAttribute('src');
    if (!src || src.startsWith('data:')) return;
    const alt = imgEl.getAttribute('alt') || '';
    const dataW = parseInt(imgEl.getAttribute('data-w') || '0', 10) || 0;
    const dataRatio = parseFloat(imgEl.getAttribute('data-ratio') || '0') || 0;
    // isBanner 不再在这里判定——因为此时不知道在文章中的位置。
    // 改为在下载阶段按"全局序号"判断：只有前 N 张 ratio<0.45 的才是 HEAD 装饰带。
    // 正文 BODY 中间的 ratio<0.45 图片（如小标题分隔条）应保留。
    let ext = 'jpg';
    const m = src.match(/wx_fmt=(\w+)/i) || src.match(/_(jpg|jpeg|png|gif|webp)(?:\?|$|\/)/i);
    if (m) ext = m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase();
    sink.push({ __kind: 'img', src, alt, ext, dataW, dataRatio, isBanner: false });
  }

  function walk(node, sink) {
    if (!node) return;
    if (node.nodeType !== 1) return;
    const tag = (node.tagName || '').toLowerCase();

    if (tag === 'img') {
      pushImg(node, sink);
      return;
    }

    // 引用块识别：整段递归到一个子数组，包成 quote
    if (isQuoteSection(node)) {
      const inner = [];
      if (node.childNodes && node.childNodes.length > 0) {
        for (const c of node.childNodes) walk(c, inner);
      }
      const dedupedInner = dedupBlocks(inner);
      if (dedupedInner.length > 0) {
        sink.push({ __kind: 'quote', children: dedupedInner });
      }
      return;
    }

    const text = cleanText(node.text || '');
    const imgs = node.querySelectorAll('img');

    // 纯图容器
    if (imgs.length > 0 && text === '') {
      for (const im of imgs) pushImg(im, sink);
      return;
    }

    // 叶子文本节点（用 segments 抽取部分高亮）
    const isLeafText = LEAF_TEXT_TAGS.has(tag) && imgs.length === 0 && text.length > 0;
    if (isLeafText) {
      const { segments, plainText } = extractSegments(node);
      if (!plainText) return;
      const blk = segmentsToBlock(segments, plainText);
      if (blk.kind === 'strong') sink.push({ __kind: 'strong', html: blk.html, text: plainText });
      else sink.push({ __kind: 'text', text: blk.text });
      return;
    }

    // 容器：递归；若无子节点但自身文字，按叶子处理
    if (node.childNodes && node.childNodes.length > 0) {
      for (const c of node.childNodes) walk(c, sink);
    } else if (text.length > 0 && imgs.length === 0) {
      const { segments, plainText } = extractSegments(node);
      if (!plainText) return;
      const blk = segmentsToBlock(segments, plainText);
      if (blk.kind === 'strong') sink.push({ __kind: 'strong', html: blk.html, text: plainText });
      else sink.push({ __kind: 'text', text: blk.text });
    }
  }

  function dedupBlocks(list) {
    const out = [];
    for (const b of list) {
      const last = out[out.length - 1];
      if (last && last.__kind === b.__kind) {
        if ((b.__kind === 'text' || b.__kind === 'strong') && last.text === b.text) continue;
        if (b.__kind === 'img' && last.src === b.src) continue;
      }
      out.push(b);
    }
    return out;
  }

  for (const c of rootEl.childNodes) walk(c, blocks);
  return dedupBlocks(blocks);
}

// -------- 下载图片 --------
async function downloadImage(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: WX_REFERER } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  return buf.length;
}

// -------- 主流程：单篇 --------
async function processArticle(article) {
  const { id, url, categorylabel, categorycolor, time: defaultTime } = article;
  log(`id=${id}`, `FETCH ${url}`);

  const html = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
  if (!html.includes('js_content')) throw new Error('HTML 不含 js_content，可能被风控');

  const root = parse(html, { comment: false });

  const titleEl = root.querySelector('#activity-name');
  const title = cleanText(titleEl?.text || '');
  if (!title) throw new Error('未取到标题 #activity-name');

  let time = defaultTime;
  const publishMatch = html.match(/var\s+ct\s*=\s*"(\d+)"/);
  if (publishMatch) {
    const d = new Date(parseInt(publishMatch[1]) * 1000);
    time = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }

  const content = root.querySelector('#js_content');
  if (!content) throw new Error('未取到 #js_content');

  const rawBlocksAll = extractBlocks(content);

  // 截断公众号模板 footer 区域（"Contact Us" + "LATEST UPDATES"）
  //
  // 精准策略（不再靠"连续 N 张图"粗暴截断，避免误伤正文连续图片）：
  //
  // 1. 该公众号固定模板 footer 的入口是一张 "Contact Us" 信息图，
  //    其特征：data-w=1080, data-ratio ≈ 0.622（±0.015）。
  //    从末尾往前扫描，找到这张图后，从它（含）往后全部截断。
  //
  // 2. 如果没找到 Contact Us 特征图，检查文章末尾是否有
  //    连续 ≥4 张无文字间隔的图片——这种情况标记 _meta.reviewFlag
  //    让人工 review，但不自动截断（可能是正文连续图片）。
  //
  // 3. 对于没有 footer 模板的文章（如 id=38 转载文），不做任何截断。
  //
  const CONTACT_US_RATIO = 0.622; // Contact Us 图的 data-ratio
  const CONTACT_US_RATIO_TOL = 0.015; // 容差
  const CONTACT_US_MIN_W = 1000; // 最小 data-w

  let footerTrimCount = 0;
  let reviewFlag = '';

  function trimFooter(blocks) {
    // 从后往前找 Contact Us 图
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i];
      if (b.__kind !== 'img') continue;
      const r = b.dataRatio || 0;
      const w = b.dataW || 0;
      if (w >= CONTACT_US_MIN_W && Math.abs(r - CONTACT_US_RATIO) <= CONTACT_US_RATIO_TOL) {
        // 找到了 Contact Us 图：从这里（含）往后全部截断
        footerTrimCount = blocks.length - i;
        log(`id=${id}`, `  ✂ found "Contact Us" img at block[${i}] (r=${r.toFixed(4)}, w=${w}) — trimming ${footerTrimCount} trailing blocks`);
        return blocks.slice(0, i);
      }
    }

    // 没找到 Contact Us 图：检查末尾是否有可疑的连续图片
    let trailingImgCount = 0;
    for (let i = blocks.length - 1; i >= 0; i--) {
      if (blocks[i].__kind === 'img') trailingImgCount++;
      else break;
    }
    if (trailingImgCount >= 4) {
      reviewFlag = `trailing_${trailingImgCount}_pics_no_contact_us`;
      log(`id=${id}`, `  ⚠ ${trailingImgCount} trailing pics but no "Contact Us" detected — flagged for manual review (NOT auto-trimmed)`);
    }
    return blocks;
  }
  const rawBlocks = trimFooter(rawBlocksAll);

  // 递归展开所有图片 block（含 quote 内的）
  function collectImgs(list, out = []) {
    for (const b of list) {
      if (b.__kind === 'img') out.push(b);
      else if (b.__kind === 'quote') collectImgs(b.children, out);
    }
    return out;
  }
  const imgBlocks = collectImgs(rawBlocks);
  log(
    `id=${id}`,
    `raw blocks: total=${rawBlocks.length}, img=${imgBlocks.length}, quote=${rawBlocks.filter((b) => b.__kind === 'quote').length}, text=${rawBlocks.filter((b) => b.__kind === 'text').length}, strong=${rawBlocks.filter((b) => b.__kind === 'strong').length}`
  );

  // 下载 & 尺寸过滤
  await mkdir(IMAGE_DIR, { recursive: true });

  if (imgBlocks.length === 0) throw new Error('正文无图片');

  // 统一命名 news<id>_pic_<seq>.<ext>，下载后按尺寸 + HEAD banner 过滤
  //
  // HEAD banner 判定：文章开头连续的 ratio<0.45 宽幅图才是"MiNT 进行时"装饰带。
  // 正文 BODY 中间的 ratio<0.45 图（如小标题分隔条）应保留。
  // 具体规则：从第 1 张图开始，连续满足 ratio<0.45 && w>=600 的标记为 HEAD banner；
  // 一旦遇到不满足的图就停止标记（后面的 ratio<0.45 图视为正文小标题）。
  const downloads = [];
  let headBannerEnded = false;
  for (let i = 0; i < imgBlocks.length; i++) {
    const img = imgBlocks[i];
    const ext = img.ext || 'jpg';
    const filename = `news${id}_pic_${i + 1}.${ext}`;
    const isWide = img.dataW >= BANNER_MIN_WIDTH && img.dataRatio > 0 && img.dataRatio < BANNER_MAX_RATIO;
    // 只在 HEAD 连续段标记 banner
    let isHeadBanner = false;
    if (!headBannerEnded && isWide) {
      isHeadBanner = true;
    } else {
      headBannerEnded = true;
    }
    downloads.push({
      src: img.src,
      localPath: path.join(IMAGE_DIR, filename),
      relPath: `${IMAGE_REL_PREFIX}/${filename}`,
      filename,
      size: 0,
      kept: false,
      isBanner: isHeadBanner,
      dataW: img.dataW || 0,
      dataRatio: img.dataRatio || 0,
    });
  }

  let dlOk = 0;
  let dlFail = 0;
  let filteredSmall = 0;
  let filteredBanner = 0;
  const srcToRel = new Map();
  if (!isDryRun) {
    for (const d of downloads) {
      try {
        const size = await downloadImage(d.src, d.localPath);
        d.size = size;
        const smallDecor = size < MIN_IMAGE_BYTES || /\.gif$/i.test(d.filename);
        if (smallDecor) {
          log(`id=${id}`, `  ↷ ${d.filename} (${(size / 1024).toFixed(1)} KB) — 过滤（装饰/gif）`);
          filteredSmall++;
        } else if (d.isBanner) {
          log(
            `id=${id}`,
            `  ↷ ${d.filename} (${(size / 1024).toFixed(1)} KB, w=${d.dataW} r=${d.dataRatio.toFixed(2)}) — 过滤（横幅装饰条）`
          );
          filteredBanner++;
        } else {
          srcToRel.set(d.src, d.relPath);
          d.kept = true;
          log(`id=${id}`, `  ✔ ${d.filename} (${(size / 1024).toFixed(1)} KB)`);
          dlOk++;
        }
        await sleep(200);
      } catch (e) {
        log(`id=${id}`, `  ✘ ${d.filename} - ${e.message}`);
        dlFail++;
      }
    }
  } else {
    for (const d of downloads) {
      if (!d.isBanner) srcToRel.set(d.src, d.relPath);
    }
  }

  // contents：按原文顺序穿插（支持 quote 嵌套）
  function blocksToContents(list) {
    const out = [];
    for (const b of list) {
      if (b.__kind === 'img') {
        const rel = srcToRel.get(b.src);
        if (rel) out.push({ pic: rel });
      } else if (b.__kind === 'text') {
        out.push({ desc: b.text });
      } else if (b.__kind === 'strong') {
        out.push({ strongText: b.html });
      } else if (b.__kind === 'quote') {
        const inner = blocksToContents(b.children);
        if (inner.length > 0) out.push({ quote: inner });
      }
    }
    return out;
  }
  const contents = blocksToContents(rawBlocks);

  // overviewtitle：去掉"｜MiNT 进行时"等后缀
  const overview = title.replace(/[｜|]\s*MiNT.*$/i, '').replace(/[｜|].*$/, '').trim();

  const newsJson = {
    id,
    title,
    categorylabel,
    categorycolor,
    time,
    overviewtitle: overview,
    sections: [
      {
        headPic: categorycolor === '#144BE1'
          ? ['assets/News/new_head_blue_1.jpg', 'assets/News/new_head_blue_2.jpg']
          : ['assets/News/new_head_1.jpg', 'assets/News/new_head_2.jpg'],
        contents,
        footerPic: ['assets/News/new_footer_1.jpg', 'assets/News/new_footer_2.jpg'],
      },
    ],
    _meta: {
      sourceUrl: url,
      fetchedAt: new Date().toISOString(),
      imageCount: imgBlocks.length,
      keptImages: Array.from(srcToRel.values()).length,
      filteredSmall,
      filteredBanner,
      footerTrimmed: footerTrimCount,
      ...(reviewFlag ? { reviewFlag } : {}),
      descCount: contents.filter((c) => c.desc).length,
      strongCount: contents.filter((c) => c.strongText).length,
      picCount: contents.filter((c) => c.pic).length,
      quoteCount: contents.filter((c) => c.quote).length,
    },
  };

  if (!isDryRun) {
    await mkdir(JSON_DIR, { recursive: true });
    const jsonPath = path.join(JSON_DIR, `news_${id}.json`);
    await writeFile(jsonPath, JSON.stringify(newsJson, null, 2), 'utf8');
    log(`id=${id}`, `✔ wrote ${path.relative(REPO_ROOT, jsonPath)}`);
  }

  // 挑选列表缩略图：contents[] 中第一个 pic 块（递归 quote 内部）
  // 这样保证 listThumb 和用户在详情页看到的"第一张正文图"一致
  function findFirstPic(items) {
    for (const c of items) {
      if (c.pic) return c.pic;
      if (c.quote) {
        const inner = findFirstPic(c.quote);
        if (inner) return inner;
      }
    }
    return null;
  }
  const listThumb = findFirstPic(contents);

  return {
    id,
    title,
    time,
    url,
    ok: true,
    listThumb,
    stats: newsJson._meta,
    downloads: { ok: dlOk, fail: dlFail, filteredSmall, filteredBanner, total: downloads.length },
  };
}

// -------- 主入口 --------
async function main() {
  const mapping = JSON.parse(await readFile(MAPPING_PATH, 'utf8'));
  const allArticles = mapping.articles;

  let targets;
  if (isAll) targets = allArticles;
  else if (flagIds) {
    const ids = flagIds.split(',').map((s) => parseInt(s.trim()));
    targets = allArticles.filter((a) => ids.includes(a.id));
  } else {
    log('ERR', 'usage: node fetch.mjs --ids=38,39 | --all');
    process.exit(1);
  }

  log('MAIN', `processing ${targets.length} article(s)${isDryRun ? ' (DRY RUN)' : ''}`);

  const results = [];
  for (const article of targets) {
    try {
      const r = await processArticle(article);
      results.push(r);
    } catch (e) {
      log(`id=${article.id}`, `FAILED - ${e.message}`);
      results.push({ id: article.id, url: article.url, ok: false, error: e.message });
    }
    await sleep(1500);
  }

  if (!isDryRun) {
    let existing = [];
    if (existsSync(REPORT_PATH)) {
      try {
        existing = JSON.parse(await readFile(REPORT_PATH, 'utf8'));
      } catch {}
    }
    const merged = [...existing.filter((e) => !results.find((r) => r.id === e.id)), ...results];
    await writeFile(REPORT_PATH, JSON.stringify(merged, null, 2), 'utf8');
    log('MAIN', `wrote report ${path.relative(REPO_ROOT, REPORT_PATH)}`);
  }

  log('MAIN', '--- SUMMARY ---');
  for (const r of results) {
    if (r.ok) {
      log(
        'MAIN',
        `  ✔ id=${r.id} img=${r.stats.imageCount}(kept=${r.stats.keptImages}, banner=${r.stats.filteredBanner}) footer=${r.stats.footerTrimmed}${r.stats.reviewFlag ? ' ⚠' + r.stats.reviewFlag : ''} desc=${r.stats.descCount} strong=${r.stats.strongCount} quote=${r.stats.quoteCount} thumb=${r.listThumb}`
      );
    } else {
      log('MAIN', `  ✘ id=${r.id} FAILED: ${r.error}`);
    }
  }

  log('MAIN', '\nNOTE: 列表缩略图（news_list.json 的 pic 字段）请手工把每篇的 listThumb 追加到 public/data/news_list.json 头部。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
