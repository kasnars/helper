<template>
  <div class="space-y-4" data-testid="videogif-tool">
    <input type="file" accept="video/*" data-testid="videogif-file" @change="onFile" />
    <div class="grid gap-3 md:grid-cols-4">
      <label class="text-sm text-gray-500">开始（秒）<el-input-number v-model="start" :min="0" :step="0.1" class="w-full" /></label>
      <label class="text-sm text-gray-500">时长（秒）<el-input-number v-model="duration" :min="0.1" :max="30" :step="0.1" class="w-full" /></label>
      <label class="text-sm text-gray-500">帧率<el-input-number v-model="fps" :min="1" :max="30" class="w-full" /></label>
      <label class="text-sm text-gray-500">宽度<el-input-number v-model="width" :min="16" :max="1280" :step="16" class="w-full" /></label>
    </div>
    <el-button type="primary" :loading="running" data-testid="videogif-run" @click="convert">转成 GIF</el-button>
    <p class="text-sm text-gray-500">使用单线程 ffmpeg.wasm，不依赖 SharedArrayBuffer。首次转换要加载约 30MB 的本地核心文件。</p>
    <p v-if="status" class="text-sm text-gray-600 dark:text-gray-300">{{ status }}</p>
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <img v-if="gifUrl" :src="gifUrl" alt="生成的 GIF" class="max-w-full rounded-lg border border-gray-200" />
    <el-button v-if="gifUrl" @click="download">下载 GIF</el-button>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

const file = ref<File | null>(null)
const start = ref(0)
const duration = ref(3)
const fps = ref(10)
const width = ref(480)
const running = ref(false)
const status = ref('')
const error = ref('')
const gifUrl = ref('')

const onFile = (event: Event) => {
  file.value = (event.target as HTMLInputElement).files?.[0] || null
  error.value = ''
}

const convert = async () => {
  if (!file.value) {
    error.value = '请先选择视频'
    return
  }
  if (start.value < 0 || duration.value < 0.1 || width.value < 16 || width.value > 1280) {
    error.value = '请检查开始时间、时长和宽度'
    return
  }
  running.value = true
  error.value = ''
  status.value = '正在加载单线程 ffmpeg…'
  try {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util')
    const ffmpeg = new FFmpeg()
    const base = `${import.meta.env.BASE_URL}ffmpeg`
    await ffmpeg.load({
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    status.value = '正在转换…'
    const input = 'input' + (file.value.name.slice(file.value.name.lastIndexOf('.')) || '.mp4')
    await ffmpeg.writeFile(input, await fetchFile(file.value))
    await ffmpeg.exec([
      '-ss', String(start.value),
      '-t', String(duration.value),
      '-i', input,
      '-filter_complex', `fps=${fps.value},scale=${width.value}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
      'out.gif',
    ])
    const data = await ffmpeg.readFile('out.gif')
    if (gifUrl.value) URL.revokeObjectURL(gifUrl.value)
    const bytes = data instanceof Uint8Array ? data : new Uint8Array()
    const copy = new Uint8Array(bytes.byteLength)
    copy.set(bytes)
    gifUrl.value = URL.createObjectURL(new Blob([copy.buffer], { type: 'image/gif' }))
    status.value = '转换完成'
  } catch (reason) {
    error.value = reason instanceof Error
      ? `无法完成转换：${reason.message}。若浏览器拦截了本地 wasm，请换用桌面版 Chrome。`
      : '无法完成转换'
    status.value = ''
  } finally {
    running.value = false
  }
}

const download = () => {
  const link = document.createElement('a')
  link.href = gifUrl.value
  link.download = 'clip.gif'
  link.click()
}
onUnmounted(() => { if (gifUrl.value) URL.revokeObjectURL(gifUrl.value) })
</script>
