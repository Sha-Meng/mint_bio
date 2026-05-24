# 技术栈与工程结构总览

## 技术栈

| 类别 | 技术 | 版本/说明 |
|------|------|----------|
| 构建工具 | Vue CLI 5 | `@vue/cli-service ^5.0.8` |
| 框架 | Vue 3 | `^3.2.19` + `@vue/compat` 兼容层 |
| 路由 | Vue Router 4 | Hash 模式 (`createWebHashHistory`) |
| UI 组件库 | Element Plus | `^2.9.0` |
| HTTP 请求 | Axios | `^1.7.9` |
| 动画库 | animate.css | `^4.1.1` |
| 事件总线 | mitt | `^3.0.1` |
| 轮播组件 | Swiper | `^11.1.15` |
| CSS 预处理 | Less / Sass | 混用 |
| 响应式适配 | postcss-pxtorem | `^6.1.0` |

## 目录结构

```
mint_bio/
├── src/                    # 业务源码
│   ├── main.js            # 应用入口
│   ├── App.vue            # 根组件（PC/移动端布局切换）
│   ├── router/            # 路由配置
│   ├── pages/             # 页面组件
│   ├── components/        # 公共/业务组件
│   ├── assets/            # 静态资源（图片、字体）
│   ├── style/             # 全局样式
│   ├── utils/             # 工具函数
│   └── event/             # 事件总线
├── public/                 # 原样拷贝的静态资源
│   ├── data/              # 新闻 JSON 数据
│   ├── reset.css          # CSS Reset
│   └── index.html         # HTML 模板
├── dist/                   # 构建产物
├── vue.config.js          # Vue CLI 配置
└── package.json           # 依赖配置
```

## 运行时架构

### 应用入口 `src/main.js`

```javascript
import Vue from 'vue'                    // 通过 @vue/compat 兼容层
const { createApp } = Vue
const app = createApp({ render: h => h(App) })
app.use(router)                          // 路由
app.use(ElementPlus)                     // UI 组件库
app.use(directives)                      // 自定义指令（v-intersect）
app.mount('#app')
```

### 根布局 `src/App.vue`

- 通过 `validPcOrPhone()` 判断 PC/移动端
- PC 端渲染：`Header` + `router-view` + `Footer` + `Contact`
- 移动端渲染：`MobileHeader` + `router-view` + `FooterMobile` + `ContactMobile`
- 监听 `window.onresize`：当 `isPc` 状态变化时触发 `window.location.reload()` 重新初始化

### 路由分流 `src/router/index.js`

- 定义 `PcRoutes` 与 `MobileRoutes` 两套独立路由表
- 创建 Router 时通过 `validPcOrPhone()` **一次性决定**使用哪套路由
- 窗口尺寸变化时通过 reload 重新选择路由表

## 代码组织约定

| 目录 | 说明 |
|------|------|
| `src/pages/**` | 页面组件，多数为 `index.vue`，新闻页为独立 `.vue` 文件 |
| `src/components/**` | 可复用组件，新闻组件集中在 `MiNTNews/` |
| `src/utils/**` | 工具函数：资源解析、端判断、自定义指令 |
| `src/style/*` | 全局样式变量与通用类 |

## 开发注意事项

1. **Vue 兼容层**：因使用 `@vue/compat`，代码风格混合（Options API / Composition API / `<script setup>`），改造时建议保持既有风格
2. **路由策略**：路由在创建时一次性决定，改变窗口尺寸会触发强制 reload
3. **端判断阈值**：`< 992px` 判定为移动端（见 `src/utils/isPc.js`）
