<template>
  <div class="space-y-6">
    <!-- 配置 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">SQL 格式化</h3>
      <div class="flex flex-wrap gap-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">数据库方言</label>
          <el-select v-model="dialect" class="w-40">
            <el-option label="SQL" value="sql" />
            <el-option label="MySQL" value="mysql" />
            <el-option label="PostgreSQL" value="postgresql" />
            <el-option label="SQL Server" value="tsql" />
            <el-option label="SQLite" value="sqlite" />
          </el-select>
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">缩进</label>
          <el-select v-model="indent" class="w-32">
            <el-option label="2 空格" :value="2" />
            <el-option label="4 空格" :value="4" />
            <el-option label="Tab" value="tab" />
          </el-select>
        </div>
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">关键字大小写</label>
          <el-select v-model="keywordCase" class="w-32">
            <el-option label="大写" value="upper" />
            <el-option label="小写" value="lower" />
            <el-option label="保持原样" value="preserve" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 输入 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">输入 SQL</h3>
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
        v-model="inputSQL"
        type="textarea"
        :rows="12"
        placeholder="粘贴你的 SQL 语句..."
        input-style="font-family: monospace; font-size: 13px;"
      />
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-4">
      <el-button type="primary" @click="formatSQL" :disabled="!inputSQL.trim()">
        <el-icon><Check /></el-icon>
        格式化
      </el-button>
      <el-button @click="minifySQL" :disabled="!inputSQL.trim()">
        <el-icon><Download /></el-icon>
        压缩
      </el-button>
    </div>

    <!-- 输出 -->
    <div v-if="outputSQL" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">格式化结果</h3>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ outputLines }} 行
          </span>
          <el-button size="small" @click="copyOutput">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </div>
      </div>
      <pre class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm font-mono overflow-x-auto max-h-96"><code>{{ outputSQL }}</code></pre>
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
import { copyToClipboard } from '@/utils/clipboard'
import { ref, computed } from 'vue'
import { Document, Delete, Check, Download, CopyDocument, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { format } from 'sql-formatter'

const dialect = ref('sql')
const indent = ref<number | string>(2)
const keywordCase = ref<'upper' | 'lower' | 'preserve'>('upper')

const inputSQL = ref('')
const outputSQL = ref('')
const errorMessage = ref('')

const outputLines = computed(() => outputSQL.value.split('\n').length)

const sampleSQL = `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND u.created_at > '2024-01-01' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 5 ORDER BY total_spent DESC LIMIT 10`

const loadSample = () => {
  inputSQL.value = sampleSQL
  outputSQL.value = ''
  errorMessage.value = ''
}

const clearInput = () => {
  inputSQL.value = ''
  outputSQL.value = ''
  errorMessage.value = ''
}

const formatSQL = () => {
  try {
    errorMessage.value = ''

    const useTabs = indent.value === 'tab'
    const tabWidth = useTabs ? 2 : (indent.value as number)

    outputSQL.value = format(inputSQL.value, {
      language: dialect.value as any,
      tabWidth,
      useTabs,
      keywordCase: keywordCase.value as any,
    })

    ElMessage.success('格式化完成')
  } catch (e) {
    errorMessage.value = (e as Error).message
    ElMessage.error('格式化失败')
  }
}

const minifySQL = () => {
  try {
    errorMessage.value = ''

    outputSQL.value = inputSQL.value
      .replace(/\s+/g, ' ')
      .replace(/\s*([(),])\s*/g, '$1')
      .replace(/\s*(=|<>|!=|<|>|<=|>=)\s*/g, ' $1 ')
      .trim()

    ElMessage.success('压缩完成')
  } catch (e) {
    errorMessage.value = (e as Error).message
    ElMessage.error('压缩失败')
  }
}

const copyOutput = () => {
  copyToClipboard(outputSQL.value)
  ElMessage.success('已复制')
}
</script>
