# 路由地图

## 路由配置位置

- 文件：`src/router/index.js`
- 路由模式：`createWebHashHistory()`（Hash 模式）

## PC/移动端分流策略

```
┌─────────────────────────────────────────────────────────────┐
│                    应用启动                                  │
│                       ↓                                      │
│              validPcOrPhone()                               │
│              (窗口宽度 >= 992px ?)                           │
│                  ↙      ↘                                   │
│           PcRoutes    MobileRoutes                          │
│                  ↘      ↙                                   │
│              createRouter()                                  │
│                       ↓                                      │
│              App.vue 监听 resize                            │
│              isPc 变化 → reload                             │
└─────────────────────────────────────────────────────────────┘
```

- 通过 `validPcOrPhone()`（`src/utils/isPc.js`）在**创建 router 时**决定使用哪套路由
- `src/App.vue` 监听窗口 resize：一旦 `isPc` 状态变化会触发 `window.location.reload()` 重新初始化

## 路由表

### PC 路由 (`PcRoutes`)

| 路由 | 组件 | Header |
|------|------|--------|
| `/` | `Home` | 显示 |
| `/home` | `Home` | **隐藏** |
| `/bioIntelligent` | `BioIntelligent` | **隐藏** |
| `/corporate` | `CorporateVision` | **隐藏** |
| `/vision` | `Vision` | 显示 |
| `/material` | `NewMaterial` | 显示 |
| `/aminoAcid` | `AminoAcid` | 显示 |
| `/knotWeed` | `KnotWeed` | 显示 |
| `/mintNews` | `MiNTNews` | 显示 |
| `/mintNews/detail/:configId` | `MiNTNewsDetail` | 显示 |

### 移动端路由 (`MobileRoutes`)

| 路由 | 组件 | 说明 |
|------|------|------|
| `/` | `HomeMobile` | - |
| `/home` | `HomeMobile` | `unRequiresHeader: true` |
| `/bioIntelligent` | `BioIntelligentMobile` | `unRequiresHeader: true` |
| `/corporate` | `CorporateVisionMobile` | `unRequiresHeader: true` |
| `/vision` | `VisionMobile` | - |
| `/material` | `NewMaterialMobile` | - |
| `/aminoAcid` | `AminoAcidMobile` | - |
| `/knotWeed` | `KnotWeedMobile` | - |
| `/mintNews` | `MiNTNewsMobile` | - |
| `/mintNews/detail/:configId` | `MiNTNewsDetailMobile` | - |

> **注意**：移动端始终显示 `MobileHeader`，`unRequiresHeader` 仅影响 PC 端 Header 显示

## 布局控制 `src/App.vue`

```vue
<template>
  <Header v-if="!$route.meta.unRequiresHeader && isPc" />
  <MobileHeader v-if="!isPc" />
  <router-view />
  <Footer v-if="isPc" />
  <FooterMobile v-else />
  <Contact v-if="isPc" />
  <ContactMobile v-else />
</template>
```

- PC 端：默认展示 `Header/Footer/Contact`；若路由 `meta.unRequiresHeader` 为 `true` 则隐藏 `Header`
- 移动端：始终使用 `MobileHeader/FooterMobile/ContactMobile`
