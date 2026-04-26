<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left: Menu button + Logo -->
        <div class="flex items-center gap-4">
          <button
            @click="appStore.toggleSideMenu"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 lg:hidden"
            aria-label="打开菜单"
          >
            <el-icon :size="24" class="text-gray-700 dark:text-gray-200">
              <Menu />
            </el-icon>
          </button>
          
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <el-icon :size="20" class="text-white">
                <Tools />
              </el-icon>
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Helper
            </span>
          </router-link>
        </div>

        <!-- Right: Theme toggle -->
        <div class="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, Tools } from '@element-plus/icons-vue'
import { useAppStore } from '../../stores'
import ThemeToggle from './ThemeToggle.vue'

const appStore = useAppStore()
</script>
