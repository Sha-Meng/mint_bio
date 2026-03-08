---
name: fix-missing-style-tags
overview: 修复Contact和ContactMobile组件中缺失的style结束标签导致的编译错误
todos:
  - id: explore-components
    content: 使用[subagent:code-explorer]探索项目结构，确认Contact和ContactMobile组件位置
    status: completed
  - id: fix-contact-mobile-style
    content: 修复ContactMobile/index.vue第331行缺失的
    status: completed
    dependencies:
      - explore-components
---

## 问题概述

修复Contact和ContactMobile组件中缺失的style结束标签导致的Vue编译错误

## 核心问题

- ContactMobile/index.vue第331行缺少`</style>`结束标签
- Contact/index.vue第399行缺少`</style>`结束标签
- 两个组件都出现"Element is missing end tag"编译错误
- 影响项目正常构建和运行

## 推荐的代理扩展

### SubAgent

- **code-explorer**
- 目的：深入探索项目结构，定位并确认所有相关的Vue组件文件
- 预期结果：准确识别需要修复的文件位置，确保没有遗漏其他类似问题