# 全局布局与公共组件

## 1. 全局布局 `src/App.vue`

根据 `isPc`（`validPcOrPhone()`）选择 PC 或移动端组件：

| 端 | Header | Footer | Contact |
|----|--------|--------|---------|
| PC | `Header` | `Footer` | `Contact` |
| 移动端 | `MobileHeader` | `FooterMobile` | `ContactMobile` |

**Header 显示控制**：
- 仅 PC 端生效
- 路由 `meta.unRequiresHeader: true` 时隐藏 Header
- 适用路由：`/home`、`/bioIntelligent`、`/corporate`

```vue
<!-- src/App.vue 核心结构 -->
<Header v-if="!$route.meta.unRequiresHeader && isPc" />
<MobileHeader v-if="!isPc" />
<router-view />
<Footer v-if="isPc" />
<FooterMobile v-else />
<Contact v-if="isPc" />
<ContactMobile v-else />
```

## 2. Header（PC 顶部导航）

**文件**：`src/components/Header/index.vue`

### 菜单结构

菜单数据在组件内硬编码（`navData`），不读取外部配置：

| 一级菜单 | 二级菜单 | 路由 |
|----------|----------|------|
| 生物智造 | - | `/bioIntelligent` |
| 产品 | 生物降解新材料 | `/material` |
| | 生物合成氨基酸 | `/aminoAcid` |
| | 节豆日粮方案 | `/knotWeed` |
| 关于我们 | 企业介绍 | `/corporate` |
| | 愿景与责任 | `/vision` |
| 发展动态 | - | `/mintNews` |

### 交互功能

- **联系我们**：点击触发 `emitter.emit('open-popover')` 打开 Contact 弹窗
- **背景模糊**：部分路由（`/`、`home`、`bioIntelligent`、`corporate`）参与背景模糊效果，根据 `bannerHeight` 与滚动位置计算

## 3. MobileHeader（移动端抽屉菜单）

**文件**：`src/components/MobileHeader/index.vue`

- 菜单结构与 PC 类似
- "产品"/"关于我们"为可展开面板（`isPanelOpen.productPanel/aboutUsPanel`）
- 语言切换：目前只展示 CN（EN 代码保留但未启用）

## 4. Footer / FooterMobile

| 端 | 文件 |
|----|------|
| PC | `src/components/Footer/index.vue` |
| 移动端 | `src/components/FooterMobile/index.vue` |

**功能**：
- 导航跳转：通过 `router.push({ name })`
- 联系顾问二维码：`@/assets/images/wxCode.png`
- 备案链接：`https://beian.miit.gov.cn`

> **注意**：Footer 中"加入我们/下载中心"等文案为占位，路由中暂无对应页面

## 5. Contact / ContactMobile（联系表单弹窗）

| 端 | 文件 |
|----|------|
| PC | `src/components/Contact/index.vue` |
| 移动端 | `src/components/ContactMobile/index.vue` |

### 打开方式

1. 点击悬浮按钮（组件自身的 `reference`）
2. 监听事件总线：`emitter.on('open-popover', openPopover)`

### 表单提交

| 配置项 | 值 |
|--------|-----|
| 接口地址 | `http://8.155.35.138:8080/api/contact/submit` |
| 请求方式 | POST |
| 请求体 | `JSON.stringify(formData)` |
| 防抖 | `lodash/debounce` 500ms |

**校验规则**：
- 必填：姓名、邮箱、电话、留言
- 邮箱格式：`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- 手机号格式：`/^1[3-9]\d{9}$/`

## 常见改动点

| 需求 | 修改位置 |
|------|----------|
| 新增/调整导航项 | `Header/index.vue` 的 `navData` + `MobileHeader/index.vue` |
| Header 隐藏规则 | `src/router/index.js` 对应路由的 `meta.unRequiresHeader` |
| 联系表单接口 | `Contact/index.vue` + `ContactMobile/index.vue` 的 `axios.post()` |
| 二维码/联系方式 | `Contact*` 与 `Footer*` 中的图片与文案 |
