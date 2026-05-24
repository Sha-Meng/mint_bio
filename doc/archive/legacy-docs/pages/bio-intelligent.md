# 生物智造

**路由**：`/bioIntelligent`

| 端 | 页面文件 |
|----|----------|
| PC | `src/pages/BioIntelligent/index.vue` |
| 移动端 | `src/pages/BioIntelligentMobile/index.vue` |

## PC 端结构

本页主要通过组合组件完成，页面自身不拉取远程数据：

| 区块 | 组件 |
|------|------|
| Banner | `BannerTitleAnimation` |
| Part2 | `components/BioIntelligent/BioIntelligentPart2.vue` |
| Part3 | `components/BioIntelligent/BioIntelligentPart3.vue` |
| 分割线 | `MiNTDivider` |
| Part7 | `components/BioIntelligent/BioIntelligentPart7.vue` |
| 产品引导 | 复用 `pages/Vision/VisionModule5.vue` |
| Part6 | `components/BioIntelligent/BioIntelligentPart6.vue` |

## 移动端结构

| 区块 | 实现方式 |
|------|----------|
| Banner | `BannerTitleAnimationMobile` |
| Part2 | `Swiper` 展示"科研 0～1 / 产业 1～∞"两张卡片 |
| Part3 | `Swiper` 展示多张"了解生物智造"科普卡片 |
| Part4 | 静态图片 `assets/images/part4.png` |
| 产品引导 | 复用 `pages/VisionMobile/VisionModule5.vue` |
| Part6 | 基地图片区块（`base-1/2/3.png`） |

## 常见改动点

| 需求 | 修改位置 |
|------|----------|
| PC 各 Part 内容 | `src/components/BioIntelligent/*` |
| 移动端轮播内容 | `BioIntelligentMobile/index.vue` 内 `caseList/caseList2` |
