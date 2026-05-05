# mint_bio

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

---

## 英文版入口恢复指引

当前英文版入口已通过功能开关临时下线。恢复步骤如下：

### 恢复方法

打开 `src/utils/language.js`，将开关常量改为 `true`：

```js
// 修改前（当前状态）
export const FEATURE_EN_ENABLED = false

// 修改后（恢复英文版）
export const FEATURE_EN_ENABLED = true
```

然后重新构建并部署即可：

```bash
yarn build
# 部署产出的 dist/ 目录
```

### 影响面说明

开关恢复为 `true` 后：

1. **Header / MobileHeader** 的语言切换按钮（中文 / English）将重新显示。
2. 地址栏 `?lang=en` 参数恢复生效，可通过分享链接直达英文版。
3. `localStorage` 中的语言偏好恢复正常读写，用户选择英文后下次访问仍为英文。
4. `en-US.json` 翻译文件及所有 i18n 逻辑代码均未删除，无需额外恢复。

### 注意事项

- 恢复前请确认 `src/i18n/en-US.json` 中的翻译内容已按需更新。
- 本次下线仅涉及入口隐藏，不影响任何翻译数据和路由配置。
