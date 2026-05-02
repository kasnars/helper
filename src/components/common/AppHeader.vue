<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left: Menu button + Logo -->
        <div class="flex items-center gap-4">
          <!-- Mobile menu button -->
          <button
            @click="appStore.toggleSideMenu"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 lg:hidden"
            aria-label="打开菜单"
          >
            <el-icon :size="24" class="text-gray-700 dark:text-gray-200">
              <Menu />
            </el-icon>
          </button>
          
          <!-- Desktop collapse button -->
          <button
            @click="appStore.toggleSideMenu"
            class="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="切换菜单"
          >
            <el-icon :size="24" class="text-gray-700 dark:text-gray-200">
              <Fold v-if="appStore.sideMenuOpen" />
              <Expand v-else />
            </el-icon>
          </button>
          
          <router-link to="/" class="flex items-center gap-2">
            <img src="/favicon.svg" alt="Helper" class="w-8 h-8" />
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Helper
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, Tools, Fold, Expand } from '@element-plus/icons-vue'
import { useAppStore } from '../../stores'

const appStore = useAppStore()
</script>
