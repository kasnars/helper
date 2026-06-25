<template>
  <div v-if="error" class="error-boundary p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0">
        <el-icon :size="24" class="text-red-500">
          <WarningFilled />
        </el-icon>
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          组件加载出错
        </h3>
        <p class="text-sm text-red-600 dark:text-red-400 mb-4">
          {{ errorMessage }}
        </p>
        <div class="flex gap-3">
          <el-button type="danger" size="small" @click="retry">
            <el-icon><Refresh /></el-icon>
            重试
          </el-button>
          <el-button size="small" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
        </div>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { WarningFilled, Refresh, HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()
const error = ref<Error | null>(null)
const errorMessage = ref('')

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  console.error('组件错误:', err, info)
  error.value = err
  errorMessage.value = err.message || '未知错误'
  return false // 阻止错误继续向上传播
})

const retry = () => {
  error.value = null
  errorMessage.value = ''
  // 触发重新渲染
  window.location.reload()
}

const goHome = () => {
  error.value = null
  errorMessage.value = ''
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
