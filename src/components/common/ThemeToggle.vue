<template>
  <button
    @click="themeStore.toggleTheme"
    class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
    aria-label="切换主题"
  >
    <!-- Sun icon -->
    <el-icon
      :size="22"
      class="transition-all duration-500"
      :class="themeStore.isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100 text-amber-500'"
    >
      <Sunny />
    </el-icon>
    
    <!-- Moon icon -->
    <el-icon
      :size="22"
      class="absolute inset-0 m-auto transition-all duration-500"
      :class="themeStore.isDark ? 'opacity-100 rotate-0 scale-100 text-blue-400' : 'opacity-0 -rotate-90 scale-0'"
    >
      <Moon />
    </el-icon>
  </button>
</template>

<script setup lang="ts">
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useThemeStore } from '../../stores'

const themeStore = useThemeStore()
</script>
