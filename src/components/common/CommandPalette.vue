<template>
  <el-dialog
    v-model="open"
    width="min(560px, calc(100vw - 24px))"
    :show-close="false"
    append-to-body
    class="command-palette"
    @opened="focusInput"
  >
    <div data-testid="command-palette">
      <el-input
        ref="inputRef"
        v-model="query"
        size="large"
        placeholder="搜索全部工具"
        data-testid="palette-input"
        @keydown="onKeydown"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <div class="mt-3 max-h-80 overflow-auto" role="listbox">
        <button
          v-for="(entry, index) in results"
          :key="entry.id"
          type="button"
          class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left"
          :class="index === cursor ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' : 'text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800'"
          @mouseenter="cursor = index"
          @click="choose(entry.id)"
        >
          <span>
            <span class="block text-sm font-medium">{{ entry.name }}</span>
            <span class="block text-xs text-gray-500 dark:text-gray-400">{{ entry.description }}</span>
          </span>
          <span class="shrink-0 text-xs text-gray-400">{{ label(entry) }}</span>
        </button>
        <p v-if="results.length === 0" class="px-3 py-6 text-center text-sm text-gray-500">没有匹配的工具</p>
      </div>
      <p class="mt-3 text-xs text-gray-400">↑↓ 选择 · Enter 打开 · Esc 关闭</p>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useUsageStore } from '../../stores/usage'
import { openTool } from '../../tools/navigate'
import { scoreTool, toolCategoryLabel, tools, type ToolDefinition } from '../../tools/registry'

const open = ref(false)
const query = ref('')
const cursor = ref(0)
const inputRef = ref<{ focus: () => void } | null>(null)
const usage = useUsageStore()

const results = computed(() => {
  const keyword = query.value.trim()
  if (!keyword) {
    const pinned = [...usage.favorites, ...usage.recent]
    const ordered = [...tools].sort((a, b) => {
      const ai = pinned.indexOf(a.id)
      const bi = pinned.indexOf(b.id)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    return ordered
  }
  return tools
    .map((entry) => ({ entry, score: scoreTool(keyword, entry) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.entry)
})

const label = (entry: ToolDefinition) => {
  const marks = []
  if (usage.favorites.includes(entry.id)) marks.push('收藏')
  if (usage.recent.includes(entry.id)) marks.push('最近')
  return [toolCategoryLabel(entry), ...marks].join(' · ')
}

const show = () => {
  usage.load()
  query.value = ''
  cursor.value = 0
  open.value = true
}

const focusInput = () => {
  void nextTick(() => inputRef.value?.focus())
}

const choose = (id: string) => {
  open.value = false
  openTool(id)
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    cursor.value = Math.min(results.value.length - 1, cursor.value + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    cursor.value = Math.max(0, cursor.value - 1)
  } else if (event.key === 'Enter' && results.value[cursor.value]) {
    event.preventDefault()
    choose(results.value[cursor.value].id)
  }
}

const onGlobal = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (open.value) open.value = false
    else show()
  }
}

watch(query, () => {
  cursor.value = 0
})

const onOpenRequest = () => show()

onMounted(() => {
  window.addEventListener('keydown', onGlobal)
  window.addEventListener('helper:open-palette', onOpenRequest)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onGlobal)
  window.removeEventListener('helper:open-palette', onOpenRequest)
})

defineExpose({ show })
</script>

<style>
.command-palette.el-dialog {
  background: #fff;
  color: #111827;
}
html.dark .command-palette.el-dialog {
  background: #1f2937;
  color: #f9fafb;
}
</style>
