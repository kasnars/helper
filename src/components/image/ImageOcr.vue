<template>
  <div class="space-y-4" data-testid="ocr-tool">
    <div class="flex flex-wrap items-center gap-3">
      <input ref="fileRef" type="file" accept="image/*" class="text-sm" data-testid="ocr-file" @change="onFile" />
      <el-select v-model="lang" class="w-40">
        <el-option label="中文 + 英文" value="chi_sim+eng" />
        <el-option label="仅中文" value="chi_sim" />
        <el-option label="仅英文" value="eng" />
      </el-select>
      <el-button type="primary" :loading="running" data-testid="ocr-run" @click="recognize">识别</el-button>
    </div>
    <img v-if="preview" :src="preview" alt="待识别图片" class="max-h-64 rounded-lg border border-gray-200 dark:border-gray-700" />
    <p v-if="progress" class="text-sm text-gray-500">{{ progress }}</p>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <el-input v-model="text" type="textarea" :rows="8" readonly placeholder="识别结果会出现在这里" />
    <el-button :disabled="!text" @click="copy">复制文本</el-button>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { copyToClipboard } from '@/utils/clipboard'

const fileRef = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const preview = ref('')
const lang = ref('chi_sim+eng')
const text = ref('')
const progress = ref('')
const error = ref('')
const running = ref(false)

const onFile = () => {
  const next = fileRef.value?.files?.[0]
  if (!next) return
  if (preview.value) URL.revokeObjectURL(preview.value)
  file.value = next
  preview.value = URL.createObjectURL(next)
  text.value = ''
  error.value = ''
}

const recognize = async () => {
  if (!file.value) {
    error.value = '请先选择图片'
    return
  }
  running.value = true
  error.value = ''
  progress.value = '正在加载识别引擎…'
  try {
    const { createWorker } = await import('tesseract.js')
    const base = import.meta.env.BASE_URL
    const worker = await createWorker(lang.value, 1, {
      workerPath: `${base}tesseract/worker.min.js`,
      corePath: `${base}tesseract/tesseract-core-lstm.wasm.js`,
      langPath: `${base}tessdata`,
      gzip: false,
      workerBlobURL: false,
      logger: (message) => {
        if (message.status) progress.value = `${message.status} ${Math.round((message.progress || 0) * 100)}%`
      },
    })
    const result = await worker.recognize(file.value)
    text.value = result.data.text.trim()
    progress.value = `完成，置信度 ${Math.round(result.data.confidence)}%`
    await worker.terminate()
  } catch (reason) {
    error.value = reason instanceof Error ? `识别失败：${reason.message}` : '识别失败'
    progress.value = ''
  } finally {
    running.value = false
  }
}

const copy = async () => {
  await copyToClipboard(text.value)
  ElMessage.success('已复制')
}
onUnmounted(() => { if (preview.value) URL.revokeObjectURL(preview.value) })
</script>
