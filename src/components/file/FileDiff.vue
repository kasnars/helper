<template>
  <div class="space-y-6" data-testid="diff-tool">
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="text-sm text-gray-500">原始文本</label>
          <el-upload :auto-upload="false" :show-file-list="false" :on-change="(file: any) => readFile(file, 'left')">
            <el-button size="small" text>上传</el-button>
          </el-upload>
        </div>
        <el-input v-model="leftText" type="textarea" :rows="10" data-testid="diff-left" />
      </div>
      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="text-sm text-gray-500">修改后文本</label>
          <el-upload :auto-upload="false" :show-file-list="false" :on-change="(file: any) => readFile(file, 'right')">
            <el-button size="small" text>上传</el-button>
          </el-upload>
        </div>
        <el-input v-model="rightText" type="textarea" :rows="10" data-testid="diff-right" />
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <el-button type="primary" data-testid="diff-run" @click="compare">对比</el-button>
      <el-radio-group v-model="view">
        <el-radio-button value="inline">行内</el-radio-button>
        <el-radio-button value="side">并排</el-radio-button>
      </el-radio-group>
      <el-button @click="clearAll">清空</el-button>
    </div>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <div v-if="rows" class="grid grid-cols-3 gap-3 text-center">
      <div class="rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-900/20">新增 {{ stats.added }}</div>
      <div class="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20">删除 {{ stats.removed }}</div>
      <div class="rounded-lg bg-amber-50 p-3 text-amber-700 dark:bg-amber-900/20">修改 {{ stats.changed }}</div>
    </div>
    <div v-if="rows && view === 'inline'" class="overflow-auto rounded-xl border border-gray-200 font-mono text-sm dark:border-gray-700">
      <div v-for="(row, index) in rows" :key="index" class="border-b border-gray-100 px-3 py-1 dark:border-gray-800" :class="rowClass(row.type)">
        <template v-if="row.type === 'change'">
          <span v-for="(part, partIndex) in row.wordDiff" :key="partIndex" :class="partClass(part.type)">{{ part.value }}</span>
        </template>
        <template v-else>{{ row.type === 'insert' ? row.right : row.left }}</template>
      </div>
    </div>
    <div v-if="rows && view === 'side'" class="grid gap-3 md:grid-cols-2">
      <div class="overflow-auto rounded-xl border border-gray-200 font-mono text-sm dark:border-gray-700">
        <div v-for="(row, index) in rows" :key="'l' + index" class="min-h-7 border-b border-gray-100 px-3 py-1 dark:border-gray-800" :class="row.type === 'insert' ? 'opacity-40' : rowClass(row.type)">
          <span class="mr-2 text-gray-400">{{ row.leftNumber || '' }}</span>{{ row.left }}
        </div>
      </div>
      <div class="overflow-auto rounded-xl border border-gray-200 font-mono text-sm dark:border-gray-700">
        <div v-for="(row, index) in rows" :key="'r' + index" class="min-h-7 border-b border-gray-100 px-3 py-1 dark:border-gray-800" :class="row.type === 'delete' ? 'opacity-40' : rowClass(row.type)">
          <span class="mr-2 text-gray-400">{{ row.rightNumber || '' }}</span>{{ row.right }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { diffLines, diffStats, type LineDiff } from '@/lib/diff'

const leftText = ref('hello world\nkeep\n')
const rightText = ref('hello there\nkeep\nadded')
const rows = ref<LineDiff[] | null>(null)
const stats = ref({ added: 0, removed: 0, changed: 0 })
const view = ref<'inline' | 'side'>('inline')
const error = ref('')

const compare = () => {
  try {
    rows.value = diffLines(leftText.value, rightText.value)
    stats.value = diffStats(rows.value)
    error.value = ''
  } catch (reason) {
    rows.value = null
    error.value = reason instanceof Error ? reason.message : '对比失败'
  }
}

const readFile = (file: { raw?: File }, side: 'left' | 'right') => {
  if (!file.raw) return
  const reader = new FileReader()
  reader.onload = () => {
    if (side === 'left') leftText.value = String(reader.result || '')
    else rightText.value = String(reader.result || '')
  }
  reader.readAsText(file.raw)
}

const clearAll = () => {
  leftText.value = ''
  rightText.value = ''
  rows.value = null
  error.value = ''
}

const rowClass = (type: string) => {
  if (type === 'insert') return 'bg-green-50 dark:bg-green-900/20'
  if (type === 'delete') return 'bg-red-50 dark:bg-red-900/20'
  if (type === 'change') return 'bg-amber-50 dark:bg-amber-900/20'
  return ''
}
const partClass = (type: string) => {
  if (type === 'insert') return 'bg-green-200 dark:bg-green-800'
  if (type === 'delete') return 'bg-red-200 line-through dark:bg-red-800'
  return ''
}
</script>
