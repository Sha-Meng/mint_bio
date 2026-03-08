---
name: fix-homepage-issues
overview: 修复首页三个问题：hover功能丢失、文案没有英文翻译、动态新闻未切换英文版本
todos:
  - id: explore-project
    content: 使用 [subagent:code-explorer] 分析项目结构并定位首页相关文件
    status: completed
  - id: fix-hover-effects
    content: 修复首页 hover 功能丢失问题
    status: completed
    dependencies:
      - explore-project
  - id: update-english-text
    content: 更新首页文案为英文翻译版本
    status: completed
    dependencies:
      - explore-project
  - id: implement-news-i18n
    content: 实现动态新闻的中英文切换功能
    status: completed
    dependencies:
      - explore-project
  - id: test-language-switch
    content: 测试语言切换功能的完整性
    status: completed
    dependencies:
      - fix-hover-effects
      - update-english-text
      - implement-news-i18n
---

## 产品概述

修复 MiNT Bio 首页的三个关键问题，确保网站的交互功能正常运行和国际化内容准确显示。

## 核心功能

- 修复首页 hover 交互效果丢失问题，恢复元素的鼠标悬停响应
- 更新首页文案为对应的英文翻译版本
- 实现动态新闻模块的中英文内容切换功能
- 确保语言切换时所有内容同步更新

## 技术栈选择

基于现有项目的技术架构，保持技术栈的一致性，避免引入新的技术复杂性。

## 架构设计

### 现有项目分析

需要首先分析现有项目的代码结构，了解：

- 当前的国际化实现方式
- hover 效果的 CSS/JavaScript 实现
- 动态新闻数据的存储和渲染机制
- 语言切换的状态管理方式

### 修复策略

- **Hover 功能修复**：检查 CSS 样式表和 JavaScript 事件绑定，恢复丢失的交互效果
- **文案翻译更新**：定位需要更新的文本内容，替换为提供的英文翻译
- **动态新闻国际化**：实现新闻内容的中英文版本管理和切换机制

## 实现细节

### 核心目录结构

针对现有项目的修改，只显示相关的修改文件：

```
project-root/
├── src/
│   ├── components/
│   │   ├── HomePage.js          # 修改：首页主组件
│   │   └── NewsSection.js       # 修改：动态新闻组件
│   ├── styles/
│   │   └── homepage.css         # 修改：首页样式文件
│   └── locales/
│       ├── zh.json              # 修改：中文翻译文件
│       └── en.json              # 修改：英文翻译文件
```

### 关键代码结构

**国际化文本管理**：定义中英文对照的翻译键值对，确保文案内容的准确性和一致性。

**新闻数据结构**：扩展现有新闻数据模型，支持多语言版本的标题和内容字段。

**语言切换逻辑**：实现统一的语言切换机制，确保所有页面元素同步更新。

### 技术实现方案

1. **问题定位**：系统性检查首页的 CSS 和 JavaScript 代码
2. **样式修复**：恢复丢失的 hover 效果和交互动画
3. **内容替换**：更新文案为准确的英文翻译
4. **数据结构调整**：扩展新闻数据支持多语言
5. **测试验证**：确保所有修复功能在不同语言环境下正常工作

### 集成点

- 与现有的国际化系统集成
- 保持与当前语言切换机制的兼容性
- 确保不影响其他页面的正常功能

## 智能体扩展

### SubAgent

- **code-explorer**
- 目的：深入分析现有项目的代码结构，定位首页相关文件和国际化实现方式
- 预期结果：找到需要修改的具体文件位置，了解当前的技术实现方案