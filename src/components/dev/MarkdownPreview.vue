<template>
  <div class="space-y-6">
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Editor -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Markdown 编辑</h3>
          <div class="flex gap-2">
            <el-button size="small" @click="insertText('# ', '')">标题</el-button>
            <el-button size="small" @click="insertText('**', '**')">粗体</el-button>
            <el-button size="small" @click="insertText('*', '*')">斜体</el-button>
            <el-button size="small" @click="insertText('[', '](url)')">链接</el-button>
          </div>
        </div>
        
        <el-input
          v-model="markdownInput"
          type="textarea"
          :rows="20"
          placeholder="# 开始编写 Markdown...&#10;&#10;**粗体** *斜体*&#10;&#10;- 列表项1&#10;- 列表项2&#10;&#10;> 引用文本&#10;&#10;```javascript&#10;console.log('Hello')&#10;```"
          @input="renderMarkdown"
        />

        <div class="flex gap-2 mt-4">
          <el-button type="primary" class="flex-1" @click="copyMarkdown">
            <el-icon><CopyDocument /></el-icon>
            复制 Markdown
          </el-button>
          <el-button class="flex-1" @click="downloadHTML">
            <el-icon><Download /></el-icon>
            下载 HTML
          </el-button>
        </div>
      </div>

      <!-- Preview -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">实时预览</h3>
        
        <div
          class="markdown-body border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[500px] overflow-auto prose prose-sm dark:prose-invert max-w-none"
          v-html="renderedHTML"
        />
      </div>
    </div>

    <!-- Quick Templates -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速模板</h3>
      <div class="flex flex-wrap gap-3">
        <el-button @click="applyTemplate('readme')">README</el-button>
        <el-button @click="applyTemplate('article')">文章</el-button>
        <el-button @click="applyTemplate('changelog')">更新日志</el-button>
        <el-button @click="applyTemplate('table')">表格示例</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CopyDocument, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'

const markdownInput = ref('')
const renderedHTML = ref('')

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const renderMarkdown = () => {
  renderedHTML.value = md.render(markdownInput.value)
}

const insertText = (before: string, after: string) => {
  const textarea = document.querySelector('textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = markdownInput.value
  const selectedText = text.substring(start, end)

  markdownInput.value = text.substring(0, start) + before + selectedText + after + text.substring(end)
  
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, end + before.length)
  }, 0)
  
  renderMarkdown()
}

const copyMarkdown = async () => {
  try {
    await navigator.clipboard.writeText(markdownInput.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const downloadHTML = () => {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Markdown 文档</title>
  <style>
    body {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
    }
    pre {
      background: #f4f4f4;
      padding: 16px;
      overflow-x: auto;
      border-radius: 6px;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      margin: 0;
      padding-left: 16px;
      color: #666;
    }
    img {
      max-width: 100%;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background: #f4f4f4;
    }
  </style>
</head>
<body>
${renderedHTML.value}
</body>
</html>`

  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'document.html'
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('HTML 文件已下载')
}

const applyTemplate = (type: string) => {
  const templates: Record<string, string> = {
    readme: `# 项目名称

## 简介

这是一个示例项目。

## 安装

\`\`\`bash
npm install
\`\`\`

## 使用

\`\`\`javascript
const app = require('./app')
app.start()
\`\`\`

## 功能特性

- ✅ 功能 1
- ✅ 功能 2
- ✅ 功能 3

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT`,
    article: `# 文章标题

> 摘要：这是文章的摘要内容。

## 引言

这里是文章的引言部分。

## 正文

### 第一部分

详细内容...

### 第二部分

更多详情...

## 结论

总结全文...`,
    changelog: `# 更新日志

## [1.0.0] - 2024-01-01

### 新增
- 功能 1
- 功能 2

### 修复
- 修复 bug 1
- 修复 bug 2

### 改进
- 优化性能
- 改进 UI`,
    table: `# 表格示例

| 列 1 | 列 2 | 列 3 |
|------|------|------|
| 数据 1 | 数据 2 | 数据 3 |
| 数据 4 | 数据 5 | 数据 6 |
| 数据 7 | 数据 8 | 数据 9 |

---

**说明：** 这是一个表格示例。`,
  }

  markdownInput.value = templates[type]
  renderMarkdown()
}

onMounted(() => {
  markdownInput.value = `# 欢迎使用 Markdown 预览器

## 基本语法

**粗体文本** 和 *斜体文本*

### 列表示例

- 项目 1
- 项目 2
- 项目 3

### 引用

> 这是一段引用文本

### 代码

\`行内代码\`

\`\`\`javascript
function hello() {
  console.log('Hello World!')
}
\`\`\`

### 链接

[访问示例网站](https://www.example.com)

---

开始编写你的 Markdown 文档吧！`
  renderMarkdown()
})
</script>

<style scoped>
.markdown-body {
  background: transparent;
}
</style>
