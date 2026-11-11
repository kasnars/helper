# Markdown 编辑

## 功能概述
左侧编写，右侧实时预览。围栏代码块里的 mermaid 会画成图。可以下载 HTML，或通过打印导出 PDF。

## 关键技术栈
- markdown-it
- mermaid，仅在文中出现 mermaid 围栏时加载
- 浏览器打印

## 关键组件
- `MarkdownPreview.vue`

## 实现思路
预览 HTML 使用严格的 mermaid 安全级别。打印时打开只含预览内容的窗口并调用 `print()`。主题跟随页面的暗色类名。

## 功能总结
写说明、画简单流程图，再导出给别人看。
