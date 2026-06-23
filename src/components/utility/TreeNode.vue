<template>
  <div class="select-none">
    <div
      class="flex items-start py-0.5 rounded transition-colors"
      :class="[
        isMatch ? 'bg-yellow-100 dark:bg-yellow-900/30' : '',
        'hover:bg-gray-100 dark:hover:bg-gray-800/50'
      ]"
      :style="{ paddingLeft: depth * 20 + 'px' }"
    >
      <!-- 展开/折叠按钮 -->
      <button
        v-if="isExpandable"
        @click="$emit('toggle', path)"
        class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0 mt-0.5"
      >
        <svg
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="isExpanded ? 'rotate-90' : ''"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      <span v-else class="w-5 flex-shrink-0"></span>

      <!-- Key 名称 -->
      <span v-if="keyName !== undefined && keyName !== null" class="flex-shrink-0">
        <span class="text-blue-600 dark:text-blue-400 font-medium">"{{ keyName }}"</span>
        <span class="text-gray-500 mx-1">:</span>
      </span>

      <!-- 值 / 类型标签 -->
      <span class="flex items-center gap-1.5 flex-wrap">
        <!-- 可展开的容器 -->
        <template v-if="isExpandable">
          <span class="text-gray-500">{{ isArray ? '[' : '{' }}</span>
          <span
            v-if="!isExpanded"
            class="text-xs px-1.5 py-0.5 rounded-full"
            :class="getTypeBadgeClass(type)"
          >
            {{ childCount }} {{ isArray ? 'items' : 'keys' }}
          </span>
          <span v-if="!isExpanded" class="text-gray-500">{{ isArray ? ']' : '}' }}</span>
        </template>

        <!-- 基本类型值 -->
        <template v-else>
          <span :class="getValueClass(type)">
            {{ formatValue(data) }}
          </span>
          <span
            class="text-xs px-1.5 py-0.5 rounded-full"
            :class="getTypeBadgeClass(type)"
          >
            {{ type }}
          </span>
        </template>
      </span>
    </div>

    <!-- 子节点 -->
    <template v-if="isExpandable && isExpanded">
      <template v-if="isArray">
        <TreeNode
          v-for="(item, index) in data"
          :key="index"
          :data="item"
          :key-name="index"
          :depth="depth + 1"
          :search="search"
          :expanded-paths="expandedPaths"
          @toggle="(p: string) => $emit('toggle', p)"
        />
      </template>
      <template v-else>
        <TreeNode
          v-for="(val, key) in data"
          :key="key"
          :data="val"
          :key-name="key"
          :depth="depth + 1"
          :search="search"
          :expanded-paths="expandedPaths"
          @toggle="(p: string) => $emit('toggle', p)"
        />
      </template>
      <!-- 闭合括号 -->
      <div
        class="text-gray-500 py-0.5"
        :style="{ paddingLeft: depth * 20 + 20 + 'px' }"
      >
        {{ isArray ? ']' : '}' }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default { name: 'TreeNode' }
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: any
  keyName: string | number | undefined
  depth: number
  search: string
  expandedPaths: Set<string>
}>()

defineEmits<{
  toggle: [path: string]
}>()

const path = computed(() => {
  if (props.keyName === undefined) return 'root'
  if (typeof props.keyName === 'number') {
    return `root[${props.keyName}]`
  }
  return `root.${props.keyName}`
})

const type = computed(() => {
  if (props.data === null) return 'null'
  if (Array.isArray(props.data)) return 'array'
  return typeof props.data
})

const isArray = computed(() => type.value === 'array')
const isObject = computed(() => type.value === 'object')
const isExpandable = computed(() => isArray.value || isObject.value)

const childCount = computed(() => {
  if (isArray.value) return (props.data as any[]).length
  if (isObject.value) return Object.keys(props.data).length
  return 0
})

const isExpanded = computed(() => props.expandedPaths.has(path.value))

const isMatch = computed(() => {
  if (!props.search) return false
  const q = props.search.toLowerCase()
  if (props.keyName !== undefined && String(props.keyName).toLowerCase().includes(q)) return true
  if (!isExpandable.value) {
    return String(props.data).toLowerCase().includes(q)
  }
  return false
})

const formatValue = (val: any): string => {
  if (val === null) return 'null'
  if (typeof val === 'string') return `"${val}"`
  return String(val)
}

const getValueClass = (t: string): string => {
  const classes: Record<string, string> = {
    string: 'text-amber-600 dark:text-amber-400',
    number: 'text-blue-600 dark:text-blue-400',
    boolean: 'text-green-600 dark:text-green-400',
    null: 'text-gray-400 dark:text-gray-500 italic',
  }
  return classes[t] || ''
}

const getTypeBadgeClass = (t: string): string => {
  const classes: Record<string, string> = {
    string: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    number: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    boolean: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    object: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    array: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    null: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  }
  return classes[t] || classes.null
}
</script>
