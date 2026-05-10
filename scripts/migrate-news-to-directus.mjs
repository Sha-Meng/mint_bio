#!/usr/bin/env node
/**
 * mint_bio 历史新闻 → Directus 批量迁移脚本（Phase 5 入口契约 v4 实现）
 *
 * 契约文档：
 *   - .codebuddy/plans/directus-bt-migration-execution.md（5.1 / 5.2 / 5.2.1 / 5.2.2 / 6.0）
 *   - .codebuddy/plans/news-migration-mapping_20260505.md（48 篇逐条映射 + 媒体上传规则）
 *
 * 用法：
 *   node scripts/migrate-news-to-directus.mjs --dry-run                # 全量试运行，不发写请求
 *   node scripts/migrate-news-to-directus.mjs --dry-run --limit=3      # 只解析前 3 篇
 *   node scripts/migrate-news-to-directus.mjs --ids=1,11,45            # 只迁特定几篇
 *   node scripts/migrate-news-to-directus.mjs                          # 全量正式执行
 *
 * 环境变量（从 scripts/.env.migration 或 shell 注入）：
 *   DIRECTUS_URL=https://cms.mint-bio.cn
 *   DIRECTUS_TOKEN=<Static Access Token, 后台 User Directory → Admin → Token>
 *
 * 产出：
 *   - scripts/.migration-cache/file-index.json     上传文件索引 {srcPath: file_id}
 *   - scripts/.migration-cache/article-index.json  文章索引 {legacy_id: article_uuid}
 *   - scripts/.migration-cache/report-<ts>.json    本次运行迁移报告
 *
 * 幂等性：
 *   - file-index 命中即跳过上传
 *   - article-index 命中即跳过创建（不更新已存在文章，保护运营手工编辑）
 *
 * Node 要求：18+（内置 fetch / FormData / Blob）
 */

import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- 路径与常量 ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(REPO_ROOT, 'public/data');
const SRC_ASSETS_ROOT = path.join(REPO_ROOT, 'src');
const CACHE_DIR = path.join(__dirname, '.migration-cache');
const FILE_INDEX_PATH = path.join(CACHE_DIR, 'file-index.json');
const ARTICLE_INDEX_PATH = path.join(CACHE_DIR, 'article-index.json');
const ENV_PATH = path.join(__dirname, '.env.migration');

// 媒体上传目标 folder（4A 已建好）
const TARGET_FOLDER_PATH = ['news', '_legacy']; // 父→子

// 分类 alias（决策 A v4，含历史脏拼写归一化）
// key 已做"去 # 前缀 + 移除所有空白 + 转小写"预处理，能容忍：
//   "#MiNT 进行时" / "#Mint 进行时" / "MiNT 进行时"（缺 #） / "#MiNT进行时"（无空格） 等所有变体
const CATEGORY_ALIAS = {
  'mint进行时': 'mint-runtime',
  'mint产品力': 'mint-products',
  'mint智造力': 'mint-biomanufacturing',
  'mint制造力': 'mint-biomanufacturing', // 历史脏拼写
  'mintvision': 'mint-vision',
};

// strongText / quote 内联 HTML 白名单 class（前端 MiNTNewsDetailSection.vue 全局样式支持）
// 此处只作记录，不在脚本里 strip，原样保留入 EditorJS paragraph.text
// 白名单：orange-text / blue-text / green-text / blue-green-text / strong-text / new-strongText

// CDN 路径前缀（视频文件保留为站点静态资源，不上传 Directus）
const STATIC_VIDEO_PREFIX = 'https://www.mint-bio.cn'; // 前端 raw block 渲染时用

// ---------- CLI 参数 ----------
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const flagLimit = Number(args.find((a) => a.startsWith('--limit='))?.replace('--limit=', '')) || null;
const flagIds = args.find((a) => a.startsWith('--ids='))?.replace('--ids=', '');
const onlyIds = flagIds ? flagIds.split(',').map((s) => Number(s.trim())).filter(Boolean) : null;

function log(tag, ...msg) {
  console.log(`[${tag}]`, ...msg);
}
function warn(tag, ...msg) {
  console.warn(`[${tag}]`, ...msg);
}
function err(tag, ...msg) {
  console.error(`[${tag}]`, ...msg);
}

// ---------- .env.migration 加载 ----------
async function loadEnv() {
  if (process.env.DIRECTUS_URL && process.env.DIRECTUS_TOKEN) {
    return { url: process.env.DIRECTUS_URL, token: process.env.DIRECTUS_TOKEN };
  }
  if (!existsSync(ENV_PATH)) {
    throw new Error(
      `缺少 ${path.relative(REPO_ROOT, ENV_PATH)} 且未设置 DIRECTUS_URL/DIRECTUS_TOKEN 环境变量。\n` +
        `请在 scripts/.env.migration 写入：\nDIRECTUS_URL=https://cms.mint-bio.cn\nDIRECTUS_TOKEN=<Static Token>\n`,
    );
  }
  const raw = await readFile(ENV_PATH, 'utf-8');
  const env = {};
  raw.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  });
  if (!env.DIRECTUS_URL || !env.DIRECTUS_TOKEN) {
    throw new Error(`${ENV_PATH} 缺少 DIRECTUS_URL 或 DIRECTUS_TOKEN`);
  }
  return { url: env.DIRECTUS_URL.replace(/\/$/, ''), token: env.DIRECTUS_TOKEN };
}

// ---------- Directus REST 客户端 ----------
class DirectusClient {
  constructor({ url, token, dryRun }) {
    this.url = url;
    this.token = token;
    this.dryRun = dryRun;
  }
  async _fetch(method, endpoint, { body, headers = {}, isMultipart = false } = {}) {
    const url = `${this.url}${endpoint}`;
    const opts = {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
    };
    if (body !== undefined) opts.body = isMultipart ? body : JSON.stringify(body);
    const resp = await fetch(url, opts);
    const text = await resp.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // 非 JSON 响应
    }
    if (!resp.ok) {
      const message = json?.errors?.[0]?.message || text || resp.statusText;
      const error = new Error(`${method} ${endpoint} → ${resp.status} ${message}`);
      error.status = resp.status;
      error.body = json;
      throw error;
    }
    return json;
  }
  get(endpoint) {
    return this._fetch('GET', endpoint);
  }
  post(endpoint, body) {
    if (this.dryRun) {
      log('DRY-RUN', `POST ${endpoint}`, body && JSON.stringify(body).slice(0, 200));
      return Promise.resolve({ data: { id: `__dry-run-${Math.random().toString(36).slice(2, 10)}__` } });
    }
    return this._fetch('POST', endpoint, { body });
  }
  postMultipart(endpoint, formData) {
    if (this.dryRun) {
      log('DRY-RUN', `POST(multipart) ${endpoint}`);
      return Promise.resolve({ data: { id: `__dry-run-file-${Math.random().toString(36).slice(2, 10)}__` } });
    }
    return this._fetch('POST', endpoint, { body: formData, isMultipart: true });
  }
}

// ---------- 缓存读写 ----------
async function loadJsonCache(p, fallback) {
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(await readFile(p, 'utf-8'));
  } catch (e) {
    warn('cache', `${p} 损坏，重置：${e.message}`);
    return fallback;
  }
}
async function saveJsonCache(p, obj) {
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify(obj, null, 2), 'utf-8');
}

// ---------- 工具 ----------
function nanoid(len = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = '';
  for (let i = 0; i < len; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}
/** 源数据 time → ISO 8601 北京时间（YYYY-MM-DDT08:00:00+08:00） */
function timeToIso(rawTime) {
  if (!rawTime) return null;
  const m = String(rawTime).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T08:00:00+08:00`;
}
/** 归一化 categorylabel → slug。支持容忍 # 前缀缺失 / 中文间空格变化 / 大小写差异 */
function categoryLabelToSlug(label) {
  if (!label) return null;
  // 预处理：去 # 前缀 + 移除所有空白（含全角空格 / 制表符）+ 转小写
  const key = String(label).replace(/^#/, '').replace(/\s+/g, '').toLowerCase();
  return CATEGORY_ALIAS[key] || null;
}
/** 把源 desc/strongText 字符串中的 &nbsp; 等保留，去除两端空白 */
function cleanInlineHtml(s) {
  return (s == null ? '' : String(s)).replace(/^\s+|\s+$/g, '');
}
/**
 * 把源 assets 路径解析为绝对文件系统路径。
 * 兼容三种前缀：
 *   - assets/News/202505/news_1.png  → src/assets/News/202505/news_1.png
 *   - assets/News/news_01.jpg        → src/assets/News/news_01.jpg
 *   - assets/images/product-1.jpeg   → src/assets/images/product-1.jpeg（仅 id 14）
 */
function resolveAssetPath(srcPath) {
  if (!srcPath) return null;
  // 去掉前导斜杠
  let rel = srcPath.replace(/^\/+/, '');
  // 兼容仅 'assets/...' 形式
  if (rel.startsWith('assets/')) {
    return path.join(SRC_ASSETS_ROOT, rel);
  }
  // 兼容 'src/assets/...' 形式
  if (rel.startsWith('src/assets/')) {
    return path.join(REPO_ROOT, rel);
  }
  return null;
}
/** 推断文件 mime（最小化，只覆盖本项目用到的扩展名） */
function guessMime(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const map = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    svg: 'image/svg+xml',
    mov: 'video/quicktime',
    mp4: 'video/mp4',
  };
  return map[ext] || 'application/octet-stream';
}

// ---------- Directus folder uuid 查找 ----------
/**
 * 按路径数组（如 ['news', '_legacy']）查找 folder uuid。
 * 先查根 'news'（parent=null），再查其下 '_legacy'（parent=news.uuid）。
 */
async function findFolderUuid(client, pathSegments) {
  let parentId = null;
  for (const seg of pathSegments) {
    const filter = parentId
      ? `filter[name][_eq]=${encodeURIComponent(seg)}&filter[parent][_eq]=${parentId}`
      : `filter[name][_eq]=${encodeURIComponent(seg)}&filter[parent][_null]=true`;
    const resp = await client.get(`/folders?${filter}&fields=id,name,parent&limit=1`);
    const found = resp?.data?.[0];
    if (!found) {
      throw new Error(`未找到 folder：${pathSegments.join('/')}（卡在第 "${seg}" 层）`);
    }
    parentId = found.id;
  }
  return parentId;
}

// ---------- 分类 slug → uuid 映射 ----------
async function buildCategoryMap(client) {
  const resp = await client.get('/items/news_categories?fields=id,slug&limit=-1');
  const map = {};
  for (const it of resp?.data || []) map[it.slug] = it.id;
  const required = ['mint-runtime', 'mint-products', 'mint-biomanufacturing', 'mint-vision'];
  const missing = required.filter((s) => !map[s]);
  if (missing.length) {
    throw new Error(`Directus 后台缺少分类：${missing.join(', ')}（请按 plan 5.2.1 v4 建好）`);
  }
  return map;
}

// ---------- 媒体上传 ----------
class MediaUploader {
  constructor(client, folderUuid, fileIndex) {
    this.client = client;
    this.folderUuid = folderUuid;
    this.fileIndex = fileIndex;
    this.stats = { uploaded: 0, cacheHit: 0, failed: 0, skipped: 0 };
    this.failedPaths = []; // 失败的 srcPath 列表，用于报告
  }
  /** 上传单个文件，返回 file_id；失败返回 null（已记入 stats.failed） */
  async upload(srcPath) {
    if (!srcPath) {
      this.stats.skipped++;
      return null;
    }
    if (this.fileIndex[srcPath]) {
      this.stats.cacheHit++;
      return this.fileIndex[srcPath];
    }
    const absPath = resolveAssetPath(srcPath);
    if (!absPath || !existsSync(absPath)) {
      err('upload', `文件不存在：${srcPath} → ${absPath}`);
      this.stats.failed++;
      this.failedPaths.push({ srcPath, reason: 'file_not_found', absPath });
      return null;
    }
    try {
      const buffer = await readFile(absPath);
      const filename = path.basename(absPath);
      const mime = guessMime(absPath);
      const form = new FormData();
      form.append('folder', this.folderUuid);
      form.append('file', new Blob([buffer], { type: mime }), filename);
      const resp = await this.client.postMultipart('/files', form);
      const fileId = resp?.data?.id;
      if (!fileId) throw new Error('响应无 id');
      this.fileIndex[srcPath] = fileId;
      this.stats.uploaded++;
      log('upload', `[${this.stats.uploaded}] ${srcPath} → ${fileId}`);
      return fileId;
    } catch (e) {
      err('upload', `上传失败 ${srcPath}：${e.message}`);
      this.stats.failed++;
      this.failedPaths.push({ srcPath, reason: e.message });
      return null;
    }
  }
}

// ---------- EditorJS block 构造器 ----------
function makeImageBlock(fileId, { stretched = false, caption = '', meta = {} } = {}) {
  return {
    id: nanoid(10),
    type: 'image',
    data: {
      file: {
        url: `/assets/${fileId}`,
        fileId,
        ...(meta.name ? { name: meta.name } : {}),
        ...(meta.size ? { size: meta.size } : {}),
        ...(meta.width ? { width: meta.width } : {}),
        ...(meta.height ? { height: meta.height } : {}),
        ...(meta.extension ? { extension: meta.extension } : {}),
      },
      caption,
      withBorder: false,
      withBackground: false,
      stretched,
    },
  };
}
function makeParagraphBlock(text) {
  return { id: nanoid(10), type: 'paragraph', data: { text: cleanInlineHtml(text) } };
}
function makeQuoteBlock(text, captionText = '') {
  return {
    id: nanoid(10),
    type: 'quote',
    data: {
      text: cleanInlineHtml(text),
      caption: cleanInlineHtml(captionText),
      alignment: 'left',
    },
  };
}
function makeRawBlock(html) {
  return { id: nanoid(10), type: 'raw', data: { html: cleanInlineHtml(html) } };
}
function makeDelimiterBlock() {
  return { id: nanoid(10), type: 'delimiter', data: {} };
}

// ---------- 正文转换：news_<id>.json sections → blocks[] ----------
/**
 * @param raw            news_<id>.json 解析后的对象
 * @param uploader       MediaUploader 实例
 * @param report         本次运行的报告对象（收集 pending_videos 等）
 * @param legacyId       源 id
 * @param coverPriorityPath  cover 首选路径（listItem.pic，工程现有列表页缩略图字段，
 *                           保证与 Phase 7 前端列表页缩略图一致）
 * @returns {Promise<{blocks: object[], coverFileId: string|null}>}
 */
async function buildBlocks(raw, uploader, report, legacyId, coverPriorityPath) {
  const blocks = [];
  let coverFileId = null;

  const sections = raw.sections || [];
  let headPicAll = [];
  let footerPicAll = [];
  let contentItems = [];

  if (sections.length === 0) {
    // 无正文（仅 list 项）
    if (coverPriorityPath) {
      coverFileId = await uploader.upload(coverPriorityPath);
      if (coverFileId) blocks.push(makeImageBlock(coverFileId, { stretched: false }));
    }
    if (blocks.length === 0) {
      report.pending_no_content.push(legacyId);
      // 强行塞一个空 paragraph 占位，避免 content_blocks_zh 必填校验失败
      blocks.push(makeParagraphBlock(' '));
    }
    return { blocks, coverFileId };
  }

  for (const sec of sections) {
    if (Array.isArray(sec.headPic)) headPicAll.push(...sec.headPic.filter(Boolean));
    if (Array.isArray(sec.footerPic)) footerPicAll.push(...sec.footerPic.filter(Boolean));
    if (Array.isArray(sec.contents)) contentItems.push(...sec.contents);
  }

  // cover 选取（v2 决策）：listItem.pic（工程列表页缩略图字段）优先 → fallback headPic[0]
  // 理由：headPic[0] 大多是公共橙/蓝色装饰横幅 new_head_*.jpg，多篇共用同一张图作 cover 体验差；
  //       listItem.pic 是 news_list.json 给每篇独立配的主图，与现有 MiNTNewsList/MiNTNewsTop 渲染一致。
  const coverSrcPath = coverPriorityPath || headPicAll[0] || null;
  if (coverSrcPath) {
    coverFileId = await uploader.upload(coverSrcPath);
  }
  // headPic 全部进正文（不再单独抽 [0] 做 cover）
  for (let i = 0; i < headPicAll.length; i++) {
    const fid = await uploader.upload(headPicAll[i]);
    if (fid) blocks.push(makeImageBlock(fid, { stretched: false }));
  }

  // contents[] 顺序映射
  for (const item of contentItems) {
    // 1. pic / nopaddingpic
    if (item.pic) {
      const fid = await uploader.upload(item.pic);
      if (fid) blocks.push(makeImageBlock(fid, { stretched: false }));
      continue;
    }
    if (item.nopaddingpic) {
      const fid = await uploader.upload(item.nopaddingpic);
      if (fid) blocks.push(makeImageBlock(fid, { stretched: true }));
      continue;
    }
    // 2. video + poster → raw block 内嵌 <video>
    //    fetch.mjs 抓取产物中所有 content 项都填满了空 video/poster/strongText 占位字段，
    //    必须区分三种情况：
    //    (a) 真有视频（video 非空字符串）→ 生成 raw block
    //    (b) 显式占位（video="" 且带 _note 标注，如 news_45）→ 写入 pending_videos，跳过该 block
    //    (c) fetch.mjs 全字段填空的产物（video="" 无 _note）→ 完全忽略 video/poster，继续走 pic/desc 分支
    if (item.video && String(item.video).trim()) {
      // (a) 真有视频
      let posterFileId = null;
      if (item.poster) posterFileId = await uploader.upload(item.poster);
      const posterUrl = posterFileId ? `/assets/${posterFileId}` : '';
      const videoUrl = item.video.startsWith('http') ? item.video : `${STATIC_VIDEO_PREFIX}${item.video}`;
      const html = `<video controls width="100%"${posterUrl ? ` poster="${posterUrl}"` : ''}><source src="${videoUrl}" type="video/mp4">您的浏览器不支持 video 标签。</video>`;
      blocks.push(makeRawBlock(html));
      continue;
    }
    if (item.video === '' && item._note) {
      // (b) 显式视频占位
      report.pending_videos.push({ legacy_id: legacyId, poster: item.poster || null, note: item._note });
      continue;
    }
    // (c) 其他情况下不 continue，落到下面的 pic/desc/strongText 分支
    // 3. quote[] 数组
    if (Array.isArray(item.quote) && item.quote.length) {
      blocks.push(makeDelimiterBlock());
      for (let i = 0; i < item.quote.length; i++) {
        const q = item.quote[i];
        if (q.pic) {
          const fid = await uploader.upload(q.pic);
          if (fid) blocks.push(makeImageBlock(fid, { stretched: false }));
        } else if (q.strongText) {
          if (i === 0) blocks.push(makeQuoteBlock(q.strongText));
          else blocks.push(makeParagraphBlock(q.strongText));
        } else if (q.desc) {
          if (i === 0) blocks.push(makeQuoteBlock(q.desc));
          else blocks.push(makeParagraphBlock(q.desc));
        }
      }
      blocks.push(makeDelimiterBlock());
      continue;
    }
    // 4. richHtml → raw
    if (item.richHtml) {
      blocks.push(makeRawBlock(item.richHtml));
      continue;
    }
    // 5. strongText（可含 <span class>）→ paragraph 保留 HTML
    if (item.strongText) {
      blocks.push(makeParagraphBlock(item.strongText));
      continue;
    }
    // 6. desc → paragraph
    if (item.desc) {
      blocks.push(makeParagraphBlock(item.desc));
      continue;
    }
    // 其他字段（height/id 等）忽略
  }

  // footerPic → 末尾 image blocks
  for (const fp of footerPicAll) {
    const fid = await uploader.upload(fp);
    if (fid) blocks.push(makeImageBlock(fid, { stretched: false }));
  }

  if (blocks.length === 0) {
    blocks.push(makeParagraphBlock(' ')); // 兜底
    report.pending_no_content.push(legacyId);
  }
  return { blocks, coverFileId };
}

// ---------- EditorJS 顶层结构 ----------
function wrapEditorJs(blocks) {
  return {
    time: Date.now(),
    version: '2.31.2',
    blocks,
  };
}

// ---------- 加载源数据 ----------
async function loadNewsList() {
  const raw = await readFile(path.join(PUBLIC_DATA_DIR, 'news_list.json'), 'utf-8');
  return JSON.parse(raw);
}
async function loadNewsDetail(id) {
  const p = path.join(PUBLIC_DATA_DIR, `news_${id}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, 'utf-8'));
}

// ---------- 主流程 ----------
async function main() {
  log('start', `dryRun=${isDryRun} limit=${flagLimit ?? 'none'} onlyIds=${onlyIds ? onlyIds.join(',') : 'all'}`);

  // 1. 加载环境
  const { url, token } = await loadEnv();
  log('env', `DIRECTUS_URL=${url}`);
  const client = new DirectusClient({ url, token, dryRun: isDryRun });

  // 2. 健康检查 + 取 folder uuid + 分类映射
  await client.get('/server/health'); // 失败抛错
  log('check', 'Directus 健康检查通过');

  const folderUuid = await findFolderUuid(client, TARGET_FOLDER_PATH);
  log('folder', `news/_legacy = ${folderUuid}`);

  const categoryMap = await buildCategoryMap(client);
  log('category', `分类 4 条 OK：${Object.keys(categoryMap).join(', ')}`);

  // 3. 加载缓存
  await mkdir(CACHE_DIR, { recursive: true });
  const fileIndex = await loadJsonCache(FILE_INDEX_PATH, {});
  const articleIndex = await loadJsonCache(ARTICLE_INDEX_PATH, {});
  log('cache', `已缓存：${Object.keys(fileIndex).length} 文件 / ${Object.keys(articleIndex).length} 文章`);

  // 4. 加载源数据
  const newsList = await loadNewsList();
  // 按 legacy_id 升序（或按 publish_at 倒序）；选升序便于 dry-run 报告对照
  newsList.sort((a, b) => a.id - b.id);
  let queue = newsList;
  if (onlyIds) queue = queue.filter((n) => onlyIds.includes(n.id));
  if (flagLimit) queue = queue.slice(0, flagLimit);
  log('source', `待处理 ${queue.length} 篇（总 ${newsList.length} 篇）`);

  // 5. 媒体上传器
  const uploader = new MediaUploader(client, folderUuid, fileIndex);

  // 6. 报告对象
  const report = {
    started_at: new Date().toISOString(),
    dry_run: isDryRun,
    total_articles_attempted: queue.length,
    total_articles_created: 0,
    total_articles_skipped_existing: 0,
    total_articles_failed: 0,
    pending_videos: [],
    pending_no_content: [],
    pending_en_translations: [],
    category_distribution: { 'mint-runtime': 0, 'mint-products': 0, 'mint-biomanufacturing': 0, 'mint-vision': 0 },
    error_log: [],
  };

  // 7. 主循环
  for (const listItem of queue) {
    const legacyId = listItem.id;
    if (articleIndex[legacyId]) {
      log('skip', `legacy_id=${legacyId} 已存在 article_uuid=${articleIndex[legacyId]}，跳过`);
      report.total_articles_skipped_existing++;
      continue;
    }

    try {
      const detail = await loadNewsDetail(legacyId);
      const merged = detail || listItem; // 无 news_<id>.json 用 list 项兜底

      // 分类归一化（list 项的 categorylabel 是权威值，detail 里的可能被 fetch.mjs 误填，
      // 例如 id=17 detail.categorylabel="#MiNT 制造力" 但 list.categorylabel="#MiNT 产品力"，正确的是后者）
      const labelForCategory = listItem.categorylabel || merged.categorylabel;
      const slug = categoryLabelToSlug(labelForCategory);
      if (!slug || !categoryMap[slug]) {
        throw new Error(`分类归一化失败：categorylabel="${labelForCategory}"`);
      }
      report.category_distribution[slug]++;

      // 必填字段
      const title_zh = merged.title || listItem.title;
      if (!title_zh) throw new Error('title_zh 缺失');

      const summary_zh =
        (detail && detail.overviewcontent) ||
        listItem.overviewcontent || // news_19 长摘要来自 news_list.json
        null;

      const publish_at = timeToIso(merged.time || listItem.time);

      if (!publish_at) throw new Error(`publish_at 解析失败：time="${merged.time || listItem.time}"`);

      // 正文 + cover（cover 优先用 listItem.pic = 工程列表页缩略图字段）
      const coverPriorityPath = listItem.pic || null;
      const { blocks, coverFileId } = await buildBlocks(
        detail || { sections: [] },
        uploader,
        report,
        legacyId,
        coverPriorityPath,
      );

      if (!coverFileId) {
        throw new Error('cover 上传失败（listItem.pic 与 headPic[0] 均失败）');
      }

      // 组装 payload
      const payload = {
        legacy_id: legacyId,
        slug: `news-${legacyId}`,
        title_zh,
        title_en: null,
        summary_zh,
        summary_en: null,
        cover: coverFileId,
        category: categoryMap[slug],
        publish_at,
        status: 'published',
        content_blocks_zh: wrapEditorJs(blocks),
        content_blocks_en: null,
        featured: false,
        seo_title_zh: null,
        seo_title_en: null,
        seo_desc_zh: null,
        seo_desc_en: null,
      };

      // 创建文章
      const resp = await client.post('/items/news_articles', payload);
      const articleUuid = resp?.data?.id;
      if (!articleUuid) throw new Error('文章创建响应无 id');
      articleIndex[legacyId] = articleUuid;
      report.total_articles_created++;
      report.pending_en_translations.push(legacyId);
      log('article', `[${report.total_articles_created}/${queue.length}] legacy_id=${legacyId} → ${articleUuid}（${blocks.length} blocks）`);

      // 增量持久化（dry-run 模式不写 index 缓存，避免假 id 污染下次真跑）
      if (!isDryRun) {
        await saveJsonCache(FILE_INDEX_PATH, fileIndex);
        await saveJsonCache(ARTICLE_INDEX_PATH, articleIndex);
      }
    } catch (e) {
      err('article', `legacy_id=${legacyId} 失败：${e.message}`);
      report.total_articles_failed++;
      report.error_log.push({
        legacy_id: legacyId,
        message: e.message,
        status: e.status || null,
        body: e.body || null,
      });
    }
  }

  // 8. 输出报告
  report.ended_at = new Date().toISOString();
  report.uploader_stats = uploader.stats;
  report.failed_uploads = uploader.failedPaths;
  const reportPath = path.join(CACHE_DIR, `report-${Date.now()}.json`);
  await saveJsonCache(reportPath, report);
  if (!isDryRun) {
    await saveJsonCache(FILE_INDEX_PATH, fileIndex);
    await saveJsonCache(ARTICLE_INDEX_PATH, articleIndex);
  }

  // 9. 摘要
  log('done', '——— 迁移完成 ———');
  log('done', `创建: ${report.total_articles_created} / 跳过: ${report.total_articles_skipped_existing} / 失败: ${report.total_articles_failed}`);
  log('done', `媒体: 上传 ${uploader.stats.uploaded} / 命中缓存 ${uploader.stats.cacheHit} / 失败 ${uploader.stats.failed}`);
  log('done', `分类分布: ${JSON.stringify(report.category_distribution)}`);
  log('done', `pending_videos: ${report.pending_videos.length} / pending_no_content: ${report.pending_no_content.length} / pending_en: ${report.pending_en_translations.length}`);
  log('done', `报告: ${path.relative(REPO_ROOT, reportPath)}`);
  if (report.error_log.length) {
    err('done', `❌ ${report.error_log.length} 条错误，详见报告 error_log`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  err('fatal', e.stack || e.message);
  process.exit(2);
});
