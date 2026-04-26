<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-90"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-90"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <!-- Modal content -->
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full transform">
        <!-- Close button -->
        <button
          @click="close"
          class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <el-icon :size="20" class="text-gray-400 dark:text-gray-500">
            <Close />
          </el-icon>
        </button>

        <!-- Content -->
        <div class="text-center">
          <!-- Celebration animation -->
          <div class="mb-6">
            <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
              <span class="text-5xl">{{ emoji }}</span>
            </div>
          </div>

          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ title }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {{ subtitle }}
          </p>

          <!-- Action buttons -->
          <div class="flex gap-3">
            <el-button
              type="primary"
              size="large"
              class="flex-1"
              @click="close"
            >
              确定
            </el-button>
            <el-button
              v-if="showAgain"
              size="large"
              @click="onAgain"
            >
              再选一次
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  title: string
  subtitle?: string
  emoji?: string
  showAgain?: boolean
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  emoji: '🎉',
  showAgain: true,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'again'): void
}>()

const close = () => emit('close')
const onAgain = () => emit('again')
</script>
