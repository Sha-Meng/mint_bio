# 构建与配置

## NPM 脚本

| 命令 | 说明 |
|------|------|
| `yarn serve` | 开发启动（自动打开浏览器 `--open`） |
| `yarn build` | 生产构建 |
| `yarn lint` | ESLint 检查（`lintOnSave: false`，保存时不触发） |

## Vue CLI 配置 `vue.config.js`

### 开发代理

```javascript
devServer: {
  proxy: {
    '/api': {
      target: 'http://8.155.35.138:8080',
      changeOrigin: true,
    }
  }
}
```

本地开发时 `/api/*` 请求会被转发到目标后端服务器。

### Vue 兼容层

```javascript
config.resolve.alias.set('vue', '@vue/compat')
```

允许在 Vue 3 下使用 Vue 2 的兼容写法（如 `import Vue from 'vue'`）。

### 图片构建规则

| 配置项 | 值 |
|--------|-----|
| 匹配格式 | `png/jpg/jpeg/gif/jfif` |
| 处理方式 | `asset/resource` |
| 输出路径 | `static/img/[name].[hash:8][ext]` |
| 压缩工具 | `image-webpack-loader` |

压缩选项：
- mozjpeg：`quality: 75`
- pngquant：`quality: [0.8, 0.9]`
- webp：`quality: 75`

### 视频构建规则

| 配置项 | 值 |
|--------|-----|
| 匹配格式 | `mp4/webm/ogg/mov/avi/flv/wmv/mkv` |
| 处理方式 | `file-loader` |
| 输出路径 | `static/video/[name].[hash:8].[ext]` |

> **注意**：通过 `require()` / `import` 引入的视频走此规则；新闻详情中的视频字段使用 URL 直接访问，不经打包。

### HTML 标题

```javascript
config.plugin('html').tap(args => {
  args[0].title = '元素驱动: 引领生物制造创新'
  return args
})
```

## PostCSS 配置 `src/postcss.config.js`

使用 `postcss-pxtorem` 实现 px 到 rem 自动转换：

| 配置项 | 值 |
|--------|-----|
| `rootValue` | `16` |
| `propList` | `['*']`（全量转换） |
| `selectorBlackList` | `fixedPx`, `pc-layout`, `mobile-layout` 等不转换 |
| `exclude` | `/node_modules/`, `/public/` |

## 路径别名 `jsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## HTML 模板 `public/index.html`

- 通过 `<%= BASE_URL %>` 引入 favicon
- 引入 `public/reset.css` 清除默认样式
- 包含 SEO meta 标签（keywords/description）
