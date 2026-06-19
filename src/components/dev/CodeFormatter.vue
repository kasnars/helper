<template>
  <div class="space-y-6">
    <!-- 语言选择 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">代码格式化</h3>
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <label class="text-sm text-gray-600 dark:text-gray-400">语言:</label>
          <el-radio-group v-model="language">
            <el-radio-button value="javascript">JavaScript</el-radio-button>
            <el-radio-button value="typescript">TypeScript</el-radio-button>
            <el-radio-button value="json">JSON</el-radio-button>
            <el-radio-button value="css">CSS</el-radio-button>
            <el-radio-button value="html">HTML</el-radio-button>
          </el-radio-group>
        </div>

        <div class="flex items-center gap-4">
          <label class="text-sm text-gray-600 dark:text-gray-400">缩进:</label>
          <el-radio-group v-model="indent">
            <el-radio-button :value="2">2 空格</el-radio-button>
            <el-radio-button :value="4">4 空格</el-radio-button>
            <el-radio-button :value="tab">Tab</el-radio-button>
          </el-radio-group>
        </div>

        <div class="flex items-center gap-4">
          <el-checkbox v-model="printWidth" label="每行最大宽度" />
          <el-input-number v-model="printWidthValue" :min="40" :max="200" :step="10" size="small" />
        </div>
      </div>
    </div>

    <!-- 输入 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">输入代码</h3>
        <div class="flex gap-2">
          <el-button size="small" @click="loadSample">
            <el-icon><Document /></el-icon>
            加载示例
          </el-button>
          <el-button size="small" @click="clearInput">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>
      <el-input
        v-model="inputCode"
        type="textarea"
        :rows="12"
        placeholder="粘贴你的代码..."
        input-style="font-family: monospace; font-size: 13px;"
      />
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-4">
      <el-button type="primary" @click="formatCode" :disabled="!inputCode.trim()">
        <el-icon><Check /></el-icon>
        格式化
      </el-button>
      <el-button @click="minifyCode" :disabled="!inputCode.trim()">
        <el-icon><Download /></el-icon>
        压缩
      </el-button>
    </div>

    <!-- 输出 -->
    <div v-if="outputCode" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">格式化结果</h3>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ outputLines }} 行 | {{ outputChars }} 字符
          </span>
          <el-button size="small" @click="copyOutput">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </div>
      </div>
      <pre class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm font-mono overflow-x-auto max-h-96"><code>{{ outputCode }}</code></pre>
    </div>

    <!-- 错误信息 -->
    <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4">
      <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
        <el-icon><Warning /></el-icon>
        <span class="font-semibold">格式化错误</span>
      </div>
      <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Document, Delete, Check, Download, CopyDocument, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as prettier from 'prettier/standalone'
import * as prettierBabel from 'prettier/plugins/babel'
import * as prettierEstree from 'prettier/plugins/estree'
import * as prettierTypescript from 'prettier/plugins/typescript'
import * as prettierCss from 'prettier/plugins/postcss'
import * as prettierHtml from 'prettier/plugins/html'

const language = ref('javascript')
const indent = ref(2)
const tab = 'tab' as any
const printWidth = ref(true)
const printWidthValue = ref(80)

const inputCode = ref('')
const outputCode = ref('')
const errorMessage = ref('')

const outputLines = computed(() => outputCode.value.split('\n').length)
const outputChars = computed(() => outputCode.value.length)

const samples: Record<string, string> = {
  javascript: `function hello(name) {
  if (name) {
    console.log("Hello, " + name + "!");
  } else {
    console.log("Hello, World!");
  }
}

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);`,
  typescript: `interface User {
  id: number;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];`,
  json: `{"name":"Helper","version":"1.0.0","description":"A collection of useful tools","keywords":["tools","utilities","frontend"],"author":{"name":"Helper Team","email":"helper@example.com"},"dependencies":{"vue":"^3.4.0","element-plus":"^2.5.0"}}`,
  css: `.container{display:flex;justify-content:center;align-items:center;min-height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}.card{background:white;border-radius:8px;padding:24px;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.card h1{font-size:24px;margin-bottom:16px;color:#333}`,
  html: `<!DOCTYPE html><html><head><title>My Page</title></head><body><div class="container"><h1>Hello World</h1><p>This is a paragraph.</p><button onclick="alert('Clicked!')">Click Me</button></div></body></html>`,
}

const loadSample = () => {
  inputCode.value = samples[language.value] || ''
  outputCode.value = ''
  errorMessage.value = ''
}

const clearInput = () => {
  inputCode.value = ''
  outputCode.value = ''
  errorMessage.value = ''
}

const formatCode = async () => {
  try {
    errorMessage.value = ''

    const parserMap: Record<string, string> = {
      javascript: 'babel',
      typescript: 'typescript',
      json: 'json',
      css: 'css',
      html: 'html',
    }

    const plugins = [prettierBabel, prettierEstree, prettierTypescript, prettierCss, prettierHtml]

    const result = await prettier.format(inputCode.value, {
      parser: parserMap[language.value],
      plugins,
      tabWidth: typeof indent.value === 'number' ? indent.value : 2,
      useTabs: indent.value === tab,
      printWidth: printWidth.value ? printWidthValue.value : Infinity,
    })

    outputCode.value = result
    ElMessage.success('格式化完成')
  } catch (e) {
    errorMessage.value = (e as Error).message
    ElMessage.error('格式化失败')
  }
}

const minifyCode = () => {
  try {
    errorMessage.value = ''

    if (language.value === 'json') {
      const parsed = JSON.parse(inputCode.value)
      outputCode.value = JSON.stringify(parsed)
    } else {
      // 简单压缩：移除多余空白
      outputCode.value = inputCode.value
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        .trim()
    }

    ElMessage.success('压缩完成')
  } catch (e) {
    errorMessage.value = (e as Error).message
    ElMessage.error('压缩失败')
  }
}

const copyOutput = () => {
  navigator.clipboard.writeText(outputCode.value)
  ElMessage.success('已复制')
}
</script>
