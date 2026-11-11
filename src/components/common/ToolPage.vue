<template>
  <div class="min-h-screen pb-8 pt-20" data-testid="tool-page" :data-active-tool="activeId">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{{ heading }}</h1>
        <p class="text-gray-600 dark:text-gray-400">{{ subtitle }}</p>
      </div>

      <div class="mb-8 flex flex-wrap justify-center gap-2">
        <el-radio-group v-model="activeId" size="large" class="tool-switcher">
          <el-radio-button v-for="entry in visible" :key="entry.id" :value="entry.id">
            <el-icon><component :is="entry.icon" /></el-icon>
            <span class="hidden sm:inline">{{ entry.name }}</span>
            <span class="sm:hidden">{{ entry.shortName }}</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <div v-if="current" class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ current.name }}</h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ current.description }}</p>
          </div>
          <el-button :type="usage.isFavorite(current.id) ? 'warning' : 'default'" plain @click="usage.toggleFavorite(current.id)">
            <el-icon class="mr-1"><StarFilled v-if="usage.isFavorite(current.id)" /><Star v-else /></el-icon>
            {{ usage.isFavorite(current.id) ? '已收藏' : '收藏' }}
          </el-button>
        </div>
        <div class="tool-embed">
          <component :is="activeComponent" v-if="activeComponent" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { useUsageStore } from '../../stores/usage'
import { storageKeyFor, toolsFor, type ToolDefinition, type ToolPageId } from '../../tools/registry'

const route = useRoute()
const usage = useUsageStore()
const page = computed(() => (route.meta.toolPage as ToolPageId) || 'dev')
const category = computed(() => route.meta.toolGroup as string | undefined)
const visible = computed(() => toolsFor(page.value, category.value))
const heading = computed(() => String(route.meta.title || '工具'))
const subtitle = computed(() => String(route.meta.subtitle || '纯前端处理，数据留在这台设备上'))
const activeId = ref('')
const loaders = new Map<string, ReturnType<typeof defineAsyncComponent>>()
const activeComponent = shallowRef<ReturnType<typeof defineAsyncComponent> | null>(null)

const current = computed(() => visible.value.find((entry) => entry.id === activeId.value))

const resolveComponent = (entry: ToolDefinition | undefined) => {
  if (!entry) {
    activeComponent.value = null
    return
  }
  if (!loaders.has(entry.id)) {
    loaders.set(entry.id, defineAsyncComponent(entry.load as () => Promise<{ default: object }>))
  }
  activeComponent.value = loaders.get(entry.id) || null
}

const selectInitial = () => {
  const saved = sessionStorage.getItem(storageKeyFor(page.value))
  if (saved && visible.value.some((entry) => entry.id === saved)) {
    activeId.value = saved
    sessionStorage.removeItem(storageKeyFor(page.value))
  } else if (!visible.value.some((entry) => entry.id === activeId.value)) {
    activeId.value = visible.value[0]?.id || ''
  }
  resolveComponent(current.value)
}

const onOpen = (event: Event) => {
  const id = (event as CustomEvent<string>).detail
  if (visible.value.some((entry) => entry.id === id)) activeId.value = id
}

onMounted(() => {
  usage.load()
  selectInitial()
  window.addEventListener('helper:open-tool', onOpen)
})

onUnmounted(() => {
  window.removeEventListener('helper:open-tool', onOpen)
})

watch(() => route.fullPath, selectInitial)
watch(activeId, (id) => {
  if (id) usage.touch(id)
  resolveComponent(current.value)
})
</script>

<style scoped>
.tool-embed :deep(.min-h-screen) {
  min-height: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
.tool-embed :deep(.min-h-screen > .max-w-6xl),
.tool-embed :deep(.min-h-screen > .max-w-4xl),
.tool-embed :deep(.min-h-screen > .mx-auto) {
  max-width: none;
  padding-left: 0;
  padding-right: 0;
}
.tool-embed :deep(.min-h-screen > div > .text-center:first-child) {
  display: none;
}
</style>
