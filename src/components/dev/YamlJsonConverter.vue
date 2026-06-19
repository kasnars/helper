<template>
  <div class="space-y-6">
    <!-- 转换方向 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">YAML / JSON 互转</h3>
      <div class="flex items-center gap-4">
        <el-radio-group v-model="direction">
          <el-radio-button value="json-to-yaml">JSON → YAML</el-radio-button>
          <el-radio-button value="yaml-to-json">YAML → JSON</el-radio-button>
        </el-radio-group>
        <el-button @click="swapDirection">
          <el-icon><Switch /></el-icon>
          交换
        </el-button>
      </div>
    </div>

    <!-- 输入输出 -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- 输入 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ direction === 'json-to-yaml' ? 'JSON 输入' : 'YAML 输入' }}
          </h3>
          <div class="flex gap-2">
            <el-button size="small" @click="loadSample">
              <el-icon><Document /></el-icon>
              示例
            </el-button>
            <el-button size="small" @click="clearInput">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
        </div>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="16"
          :placeholder="direction === 'json-to-yaml' ? '粘贴 JSON...' : '粘贴 YAML...'"
          input-style="font-family: monospace; font-size: 13px;"
        />
      </div>

      <!-- 输出 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ direction === 'json-to-yaml' ? 'YAML 输出' : 'JSON 输出' }}
          </h3>
          <div class="flex gap-2">
            <el-checkbox v-model="prettyPrint" label="格式化" />
            <el-button size="small" @click="copyOutput">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
        </div>
        <el-input
          v-model="outputText"
          type="textarea"
          :rows="16"
          readonly
          placeholder="转换结果..."
          input-style="font-family: monospace; font-size: 13px;"
        />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-4">
      <el-button type="primary" @click="convert" :disabled="!inputText.trim()">
        <el-icon><Right /></el-icon>
        转换
      </el-button>
    </div>

    <!-- 错误信息 -->
    <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4">
      <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
        <el-icon><Warning /></el-icon>
        <span class="font-semibold">转换错误</span>
      </div>
      <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
    </div>

    <!-- 说明 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">使用说明</h3>
      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>• <strong>JSON</strong> 是一种轻量级的数据交换格式，易于人阅读和编写</p>
        <p>• <strong>YAML</strong> 是一种人类可读的数据序列化格式，常用于配置文件</p>
        <p>• 转换过程在浏览器本地完成，数据不会上传到服务器</p>
        <p>• 支持复杂嵌套结构、数组、多行字符串等</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Document, Delete, CopyDocument, Switch, Right, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import yaml from 'js-yaml'

const direction = ref<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml')
const inputText = ref('')
const outputText = ref('')
const errorMessage = ref('')
const prettyPrint = ref(true)

const jsonSample = `{
  "name": "Helper Tools",
  "version": "1.0.0",
  "description": "A collection of useful tools",
  "features": [
    "JSON Editor",
    "YAML Converter",
    "Code Formatter"
  ],
  "config": {
    "theme": "light",
    "language": "zh-CN",
    "autoSave": true
  },
  "tags": ["tools", "frontend", "vue"]
}`

const yamlSample = `name: Helper Tools
version: 1.0.0
description: A collection of useful tools
features:
  - JSON Editor
  - YAML Converter
  - Code Formatter
config:
  theme: light
  language: zh-CN
  autoSave: true
tags:
  - tools
  - frontend
  - vue`

const loadSample = () => {
  inputText.value = direction.value === 'json-to-yaml' ? jsonSample : yamlSample
  outputText.value = ''
  errorMessage.value = ''
}

const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
}

const swapDirection = () => {
  direction.value = direction.value === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml'
  if (outputText.value) {
    inputText.value = outputText.value
    outputText.value = ''
  }
}

const convert = () => {
  try {
    errorMessage.value = ''

    if (direction.value === 'json-to-yaml') {
      const parsed = JSON.parse(inputText.value)
      outputText.value = yaml.dump(parsed, {
        indent: 2,
        lineWidth: prettyPrint.value ? 80 : -1,
        noRefs: true,
      })
    } else {
      const parsed = yaml.load(inputText.value)
      outputText.value = JSON.stringify(parsed, null, prettyPrint.value ? 2 : 0)
    }

    ElMessage.success('转换成功')
  } catch (e) {
    errorMessage.value = (e as Error).message
    ElMessage.error('转换失败')
  }
}

const copyOutput = () => {
  navigator.clipboard.writeText(outputText.value)
  ElMessage.success('已复制')
}
</script>
