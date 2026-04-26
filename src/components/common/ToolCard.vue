<template>
  <router-link
    :to="to"
    class="tool-card group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-blue-300 dark:hover:border-blue-700"
  >
    <!-- Icon -->
    <div
      class="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
      :class="iconBgClass"
    >
      <el-icon :size="28" :class="iconColorClass">
        <component :is="icon" />
      </el-icon>
    </div>

    <!-- Content -->
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {{ title }}
    </h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
      {{ description }}
    </p>

    <!-- Arrow -->
    <div class="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
      <el-icon :size="20" class="text-gray-400 dark:text-gray-500">
        <ArrowRight />
      </el-icon>
    </div>

    <!-- Gradient overlay on hover -->
    <div class="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

interface Props {
  to: string
  title: string
  description: string
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink'
}

const props = defineProps<Props>()

const iconBgClass = computed(() => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    pink: 'bg-pink-100 dark:bg-pink-900/30',
  }
  return colors[props.color] || colors.blue
})

const iconColorClass = computed(() => {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
    pink: 'text-pink-600 dark:text-pink-400',
  }
  return colors[props.color] || colors.blue
})
</script>
