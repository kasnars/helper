<template>
  <el-config-provider :locale="zhCn">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <!-- Header -->
      <AppHeader />
      
      <!-- Side menu -->
      <SideMenu />
      
      <!-- Main content -->
      <main 
        class="transition-all duration-300"
        :class="appStore.sideMenuOpen ? 'lg:pl-64' : 'lg:pl-0'"
      >
        <div class="pt-16">
          <router-view v-slot="{ Component }">
            <transition
              name="fade"
              mode="out-in"
            >
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import AppHeader from './components/common/AppHeader.vue'
import SideMenu from './components/common/SideMenu.vue'
import { useThemeStore, useFoodStore, useRandomStore, useAppStore } from './stores'
import { initDatabase } from './db'

const themeStore = useThemeStore()
const appStore = useAppStore()
const foodStore = useFoodStore()
const randomStore = useRandomStore()

// Initialize on mount
onMounted(async () => {
  // Initialize database
  await initDatabase()
  
  // Load theme preference
  await themeStore.loadThemePreference()
  
  // Load data
  await foodStore.loadOptions()
  await foodStore.loadHistory()
  await randomStore.loadConfig()
})
</script>

<style>
/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Element Plus dark mode overrides */
html.dark {
  --el-bg-color: #1f2937;
  --el-bg-color-overlay: #374151;
  --el-text-color-primary: #f9fafb;
  --el-text-color-regular: #e5e7eb;
  --el-text-color-secondary: #9ca3af;
  --el-border-color: #4b5563;
  --el-border-color-light: #374151;
  --el-fill-color: #374151;
  --el-fill-color-light: #4b5563;
  --el-fill-color-lighter: #6b7280;
}
</style>
