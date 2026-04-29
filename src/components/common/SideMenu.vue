<template>
  <!-- Mobile drawer overlay -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="appStore.sideMenuOpen"
      class="fixed inset-0 bg-black/50 z-50 lg:hidden"
      @click="appStore.closeSideMenu"
    />
  </Transition>

  <!-- Side menu -->
  <aside
    class="fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 transition-transform duration-300 lg:translate-x-0"
    :class="appStore.sideMenuOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <nav class="p-4 space-y-2">
      <router-link
        v-for="route in menuRoutes"
        :key="route.path"
        :to="route.path"
        @click="appStore.closeSideMenu"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
        :class="[
          $route.path === route.path
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        ]"
      >
        <el-icon :size="20" class="transition-transform duration-200 group-hover:scale-110">
          <component :is="route.icon" />
        </el-icon>
        <span class="font-medium">{{ route.title }}</span>
        
        <!-- Active indicator -->
        <div
          v-if="$route.path === route.path"
          class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
        />
      </router-link>
    </nav>

    <!-- Bottom info -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
      <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
        Helper 助手 v1.0
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { HomeFilled, Food, CircleCheckFilled, Picture, Lock, Tools } from '@element-plus/icons-vue'
import { useAppStore } from '../../stores'

const appStore = useAppStore()

const menuRoutes = computed(() => [
  { path: '/', title: '首页', icon: HomeFilled },
  { path: '/food', title: '今天吃什么', icon: Food },
  { path: '/random', title: '随机数生成', icon: CircleCheckFilled },
  { path: '/image', title: '图片处理', icon: Picture },
  { path: '/password', title: '密码本', icon: Lock },
  { path: '/devtools', title: '开发工具', icon: Tools },
])
</script>
