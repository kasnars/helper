<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">生成设置</h3>
    
    <div class="grid grid-cols-2 gap-4 mb-4">
      <!-- Min value -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">最小值</label>
        <el-input-number
          v-model="config.min"
          :min="0"
          :max="config.max - 1"
          controls-position="right"
          class="w-full"
          @change="validate"
        />
      </div>
      
      <!-- Max value -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">最大值</label>
        <el-input-number
          v-model="config.max"
          :min="config.min + 1"
          :max="999999"
          controls-position="right"
          class="w-full"
          @change="validate"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <!-- Count -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">生成数量</label>
        <el-input-number
          v-model="config.count"
          :min="1"
          :max="100"
          controls-position="right"
          class="w-full"
        />
      </div>
      
      <!-- Unique toggle -->
      <div class="flex items-end">
        <el-checkbox v-model="config.unique" class="!mb-0">
          <span class="text-sm text-gray-700 dark:text-gray-300">不重复</span>
        </el-checkbox>
      </div>
    </div>

    <!-- Range warning -->
    <el-alert
      v-if="showWarning"
      :title="warningMessage"
      type="warning"
      :closable="false"
      class="mb-4"
    />

    <!-- Generate button -->
    <el-button
      type="primary"
      size="large"
      class="w-full"
      :loading="generating"
      @click="generate"
    >
      <template #icon>
        <el-icon><Refresh /></el-icon>
      </template>
      {{ generating ? '生成中...' : '生成随机数' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useRandomStore } from '../../stores'

const randomStore = useRandomStore()

const config = computed({
  get: () => randomStore.config,
  set: (val) => randomStore.updateConfig(val),
})

const generating = computed(() => randomStore.generating)

const showWarning = ref(false)
const warningMessage = ref('')

const validate = () => {
  showWarning.value = false
  
  if (config.value.min >= config.value.max) {
    config.value.max = config.value.min + 1
  }
  
  const range = config.value.max - config.value.min + 1
  if (config.value.unique && config.value.count > range) {
    showWarning.value = true
    warningMessage.value = `范围只有 ${range} 个数，将生成 ${range} 个不重复数字`
  }
}

const generate = async () => {
  validate()
  await randomStore.generate()
}

// Watch for changes to validate
watch(() => config.value.unique, validate)
watch(() => config.value.count, validate)
</script>
