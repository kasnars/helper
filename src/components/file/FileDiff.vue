<template>
  <div class="space-y-6">
    <!-- 输入区域 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">文件对比</h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm text-gray-600 dark:text-gray-400">原始文本</label>
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(f: any) => handleFileChange(f, 'left')"
              accept=".txt,.js,.ts,.json,.css,.html,.md,.csv"
            >
              <el-button size="small" text>
                <el-icon><Upload /></el-icon>
                上传文件
              </el-button>
            </el-upload>
          </div>
          <el-input
            v-model="leftText"
            type="textarea"
            :rows="12"
            placeholder="输入或上传原始文本..."
            input-style="font-family: monospace; font-size: 12px;"
          />
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm text-gray-600 dark:text-gray-400">修改后文本</label>
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(f: any) => handleFileChange(f, 'right')"
              accept=".txt,.js,.ts,.json,.css,.html,.md,.csv"
            >
              <el-button size="small" text>
                <el-icon><Upload /></el-icon>
                上传文件
              </el-button>
            </el-upload>
          </div>
          <el-input
            v-model="rightText"
            type="textarea"
            :rows="12"
            placeholder="输入或上传修改后文本..."
            input-style="font-family: monospace; font-size: 12px;"
          />
        </div>
      </div>
      <div class="mt-4 flex gap-4">
        <el-button type="primary" @click="compareTexts">
          <el-icon><Document /></el-icon>
          对比文本
        </el-button>
        <el-button @click="clearAll">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div v-if="diffResult" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">对比统计</h3>
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.added }}</div>
          <div class="text-sm text-green-600 dark:text-green-400">新增行</div>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats.removed }}</div>
          <div class="text-sm text-red-600 dark:text-red-400">删除行</div>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.modified }}</div>
          <div class="text-sm text-blue-600 dark:text-blue-400">修改行</div>
        </div>
      </div>
    </div>

    <!-- 对比结果 -->
    <div v-if="diffResult" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">对比结果</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm font-mono">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700/50">
              <th class="px-4 py-2 text-left text-gray-500 dark:text-gray-400 w-16">行号</th>
              <th class="px-4 py-2 text-left text-gray-500 dark:text-gray-400 w-10">状态</th>
              <th class="px-4 py-2 text-left text-gray-500 dark:text-gray-400">内容</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(line, index) in diffResult"
              :key="index"
              :class="getLineClass(line.type)"
            >
              <td class="px-4 py-1 text-gray-500 dark:text-gray-400">{{ line.lineNumber }}</td>
              <td class="px-4 py-1">
                <span v-if="line.type === 'added'" class="text-green-600 dark:text-green-400">+</span>
                <span v-else-if="line.type === 'removed'" class="text-red-600 dark:text-red-400">-</span>
                <span v-else class="text-gray-400">&nbsp;</span>
              </td>
              <td class="px-4 py-1 whitespace-pre-wrap break-all">{{ line.content }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Document, Delete, Upload } from '@element-plus/icons-vue'

const leftText = ref('')
const rightText = ref('')

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified'
  content: string
  lineNumber: number
}

const diffResult = ref<DiffLine[] | null>(null)

const stats = computed(() => {
  if (!diffResult.value) return { added: 0, removed: 0, modified: 0 }

  return {
    added: diffResult.value.filter(l => l.type === 'added').length,
    removed: diffResult.value.filter(l => l.type === 'removed').length,
    modified: diffResult.value.filter(l => l.type === 'modified').length,
  }
})

const handleFileChange = (file: any, side: 'left' | 'right') => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (side === 'left') {
      leftText.value = content
    } else {
      rightText.value = content
    }
  }
  reader.readAsText(file.raw)
}

const compareTexts = () => {
  const leftLines = leftText.value.split('\n')
  const rightLines = rightText.value.split('\n')

  const result: DiffLine[] = []
  let leftIndex = 0
  let rightIndex = 0

  // 简单的逐行对比算法
  while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
    const leftLine = leftIndex < leftLines.length ? leftLines[leftIndex] : undefined
    const rightLine = rightIndex < rightLines.length ? rightLines[rightIndex] : undefined

    if (leftLine === undefined) {
      // 右侧剩余行都是新增
      result.push({
        type: 'added',
        content: rightLine!,
        lineNumber: rightIndex + 1,
      })
      rightIndex++
    } else if (rightLine === undefined) {
      // 左侧剩余行都是删除
      result.push({
        type: 'removed',
        content: leftLine,
        lineNumber: leftIndex + 1,
      })
      leftIndex++
    } else if (leftLine === rightLine) {
      // 相同行
      result.push({
        type: 'unchanged',
        content: leftLine,
        lineNumber: leftIndex + 1,
      })
      leftIndex++
      rightIndex++
    } else {
      // 不同行 - 尝试查找匹配
      const leftMatch = rightLines.indexOf(leftLine, rightIndex)
      const rightMatch = leftLines.indexOf(rightLine, leftIndex)

      if (leftMatch !== -1 && (rightMatch === -1 || leftMatch - rightIndex < rightMatch - leftIndex)) {
        // 右侧有匹配，中间的行是新增
        while (rightIndex < leftMatch) {
          result.push({
            type: 'added',
            content: rightLines[rightIndex],
            lineNumber: rightIndex + 1,
          })
          rightIndex++
        }
      } else if (rightMatch !== -1) {
        // 左侧有匹配，中间的行是删除
        while (leftIndex < rightMatch) {
          result.push({
            type: 'removed',
            content: leftLines[leftIndex],
            lineNumber: leftIndex + 1,
          })
          leftIndex++
        }
      } else {
        // 标记为修改
        result.push({
          type: 'removed',
          content: leftLine,
          lineNumber: leftIndex + 1,
        })
        result.push({
          type: 'added',
          content: rightLine,
          lineNumber: rightIndex + 1,
        })
        leftIndex++
        rightIndex++
      }
    }
  }

  diffResult.value = result
}

const getLineClass = (type: string) => {
  switch (type) {
    case 'added':
      return 'bg-green-50 dark:bg-green-900/20'
    case 'removed':
      return 'bg-red-50 dark:bg-red-900/20'
    case 'modified':
      return 'bg-yellow-50 dark:bg-yellow-900/20'
    default:
      return ''
  }
}

const clearAll = () => {
  leftText.value = ''
  rightText.value = ''
  diffResult.value = null
}
</script>
