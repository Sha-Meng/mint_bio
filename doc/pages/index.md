# 页面功能索引

## 全局共性

所有页面都会用到的能力：

| 能力 | 说明 | 位置 |
|------|------|------|
| 布局切换 | PC/移动端自动切换 | `src/App.vue` + `src/utils/isPc.js` |
| 滚动动画 | 元素进入视口触发 | `v-intersect` 指令 (`src/utils/directives/intersect.js`) |
| 图片解析 | JSON 配置图片路径 | `getImageUrl()` (`src/utils/index.js`) |
| 联系弹窗 | 匹配顾问/联系我们 | 事件总线 `emitter.emit('open-popover')` |

详见 [全局布局文档](./global-layout.md)

## 路由 → 页面映射

| 路由 | PC 页面 | 移动端页面 | 说明 |
|------|---------|------------|------|
| `/` | `pages/Home/index.vue` | `pages/HomeMobile/index.vue` | 首页（含新闻预览） |
| `/home` | `pages/Home/index.vue` | `pages/HomeMobile/index.vue` | 首页（隐藏 Header） |
| `/bioIntelligent` | `pages/BioIntelligent/index.vue` | `pages/BioIntelligentMobile/index.vue` | 生物智造 |
| `/corporate` | `pages/CorporateVision/index.vue` | `pages/CorporateVisionMobile/index.vue` | 企业介绍 |
| `/vision` | `pages/Vision/index.vue` | `pages/VisionMobile/index.vue` | 愿景与责任 |
| `/material` | `pages/NewMaterial/index.vue` | `pages/NewMaterialMobile/index.vue` | 生物降解新材料 |
| `/aminoAcid` | `pages/AminoAcid/index.vue` | `pages/AminoAcidMobile/index.vue` | 生物合成氨基酸 |
| `/knotWeed` | `pages/KnotWeed/index.vue` | `pages/KnotWeedMobile/index.vue` | 节豆日粮方案 |
| `/mintNews` | `pages/MiNTNews/MiNTNews.vue` | `pages/MiNTNewsMobile/MiNTNewsMobile.vue` | 发展动态列表 |
| `/mintNews/detail/:configId` | `pages/MiNTNews/MiNTNewsDetail.vue` | `pages/MiNTNewsMobile/MiNTNewsDetailMobile.vue` | 新闻详情 |

## 快速检索

### 按修改需求定位

| 需求 | 修改文件 |
|------|----------|
| 顶部导航/菜单 | `components/Header/index.vue`、`components/MobileHeader/index.vue` |
| 页脚文案/备案 | `components/Footer/index.vue`、`components/FooterMobile/index.vue` |
| 联系弹窗/提交接口 | `components/Contact/index.vue`、`components/ContactMobile/index.vue` |
| 首页新闻预览 | `pages/Home/index.vue`、`pages/HomeMobile/index.vue` |
| 新闻列表/详情 | `components/MiNTNews/*` |

## 分页面文档

| 页面 | 文档 |
|------|------|
| 全局布局 | [global-layout.md](./global-layout.md) |
| 首页 | [home.md](./home.md) |
| 生物智造 | [bio-intelligent.md](./bio-intelligent.md) |
| 企业介绍 | [corporate-vision.md](./corporate-vision.md) |
| 愿景与责任 | [vision.md](./vision.md) |
| 生物降解新材料 | [new-material.md](./new-material.md) |
| 生物合成氨基酸 | [amino-acid.md](./amino-acid.md) |
| 节豆日粮方案 | [knotweed.md](./knotweed.md) |
| 发展动态 | [mint-news.md](./mint-news.md) |
