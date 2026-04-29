<template>
  <div class="tree-item" :style="{ marginLeft: depth > 0 ? '20px' : '0' }">
    <!-- Array -->
    <template v-if="isArray">
      <div
        class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1"
        @click="toggle"
      >
        <span class="text-gray-500 select-none">{{ expanded ? '▼' : '▶' }}</span>
        <span v-if="name" class="text-purple-600 dark:text-purple-400 ml-1">{{ name }}:</span>
        <span class="text-gray-600 dark:text-gray-400">Array({{ data.length }})</span>
      </div>
      <div v-show="expanded">
        <JsonTreeItem
          v-for="(item, index) in data"
          :key="index"
          :data="item"
          :name="String(index)"
          :depth="depth + 1"
        />
      </div>
    </template>

    <!-- Object -->
    <template v-else-if="isObject">
      <div
        class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1"
        @click="toggle"
      >
        <span class="text-gray-500 select-none">{{ expanded ? '▼' : '▶' }}</span>
        <span v-if="name" class="text-purple-600 dark:text-purple-400 ml-1">{{ name }}:</span>
        <span class="text-gray-600 dark:text-gray-400">Object({{ keys.length }})</span>
      </div>
      <div v-show="expanded">
        <JsonTreeItem
          v-for="key in keys"
          :key="key"
          :data="data[key]"
          :name="key"
          :depth="depth + 1"
        />
      </div>
    </template>

    <!-- Primitive -->
    <div v-else class="px-1">
      <span v-if="name" class="text-purple-600 dark:text-purple-400">{{ name }}:</span>
      <span :class="valueClass">{{ formattedValue }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  data: any
  name?: string
  depth: number
}>()

const expanded = ref(props.depth < 2)

const isArray = computed(() => Array.isArray(props.data))
const isObject = computed(() => props.data !== null && typeof props.data === 'object' && !Array.isArray(props.data))
const keys = computed(() => isObject.value ? Object.keys(props.data) : [])

const toggle = () => {
  expanded.value = !expanded.value
}

const formattedValue = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'string') return `"${props.data}"`
  return String(props.data)
})

const valueClass = computed(() => {
  const type = typeof props.data
  switch (type) {
    case 'string':
      return 'text-green-600 dark:text-green-400'
    case 'number':
      return 'text-blue-600 dark:text-blue-400'
    case 'boolean':
      return 'text-orange-600 dark:text-orange-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
})
</script>
