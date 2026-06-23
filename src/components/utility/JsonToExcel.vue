<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 输入 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📝 输入 JSON</h3>
        <el-input
          v-model="jsonInput"
          type="textarea"
          :rows="12"
          placeholder='粘贴JSON数组，例如：[{"name":"张三","age":25},{"name":"李四","age":30}]'
          class="font-mono text-sm"
        />
        <div class="mt-3 flex gap-2">
          <el-button type="primary" @click="parseJson" :disabled="!jsonInput.trim()">
            <el-icon><View /></el-icon> 预览表格
          </el-button>
          <el-button @click="loadExample">加载示例</el-button>
        </div>
      </div>

      <!-- 预览 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📊 表格预览</h3>
        <div v-if="tableData.length > 0" class="overflow-auto max-h-80 border rounded-lg">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th v-for="key in columns" :key="key" class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b">
                  {{ key }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in tableData.slice(0, 20)" :key="i" class="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                <td v-for="key in columns" :key="key" class="px-4 py-2 text-gray-600 dark:text-gray-400">
                  {{ row[key] ?? '' }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="tableData.length > 20" class="p-2 text-center text-gray-500 text-sm">
            显示前20条，共{{ tableData.length }}条
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-40 text-gray-400 border-2 border-dashed rounded-lg">
          输入JSON后点击预览
        </div>
      </div>
    </div>

    <!-- 下载 -->
    <div v-if="tableData.length > 0" class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <el-input v-model="fileName" placeholder="文件名" class="w-48" />
      <el-button type="success" @click="downloadExcel">
        <el-icon><Download /></el-icon> 下载 Excel
      </el-button>
      <span class="text-sm text-gray-500">共 {{ tableData.length }} 行，{{ columns.length }} 列</span>
    </div>

    <!-- 错误提示 -->
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { View, Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

const jsonInput = ref('')
const tableData = ref<any[]>([])
const columns = ref<string[]>([])
const fileName = ref('export')
const error = ref('')

const parseJson = () => {
  error.value = ''
  try {
    const data = JSON.parse(jsonInput.value)
    const arr = Array.isArray(data) ? data : [data]
    if (arr.length === 0) {
      error.value = 'JSON数组为空'
      return
    }
    tableData.value = arr
    // 收集所有列名
    const colSet = new Set<string>()
    arr.forEach(row => {
      if (typeof row === 'object' && row !== null) {
        Object.keys(row).forEach(k => colSet.add(k))
      }
    })
    columns.value = Array.from(colSet)
  } catch (e) {
    error.value = 'JSON格式错误：' + (e as Error).message
  }
}

const downloadExcel = () => {
  const ws = XLSX.utils.json_to_sheet(tableData.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, `${fileName.value}.xlsx`)
}

const loadExample = () => {
  jsonInput.value = JSON.stringify([
    { 姓名: '张三', 年龄: 25, 城市: '北京', 职业: '工程师' },
    { 姓名: '李四', 年龄: 30, 城市: '上海', 职业: '设计师' },
    { 姓名: '王五', 年龄: 28, 城市: '深圳', 职业: '产品经理' },
    { 姓名: '赵六', 年龄: 35, 城市: '杭州', 职业: '架构师' },
  ], null, 2)
  parseJson()
}
</script>
