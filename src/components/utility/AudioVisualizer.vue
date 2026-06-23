<template>
  <div class="space-y-6">
    <!-- 文件上传 -->
    <div>
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">🎵 音频/视频文件</h3>
      <el-upload
        drag
        :auto-upload="false"
        :show-file-list="true"
        :limit="1"
        accept=".mp3,.wav,.ogg,.m4a,.flac,.mp4,.webm"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        class="mb-4"
      >
        <el-icon class="text-4xl text-gray-400 mb-2"><UploadFilled /></el-icon>
        <div class="text-gray-600 dark:text-gray-400">拖拽或点击上传音频/视频文件</div>
        <template #tip>
          <div class="text-xs text-gray-500 dark:text-gray-500">
            支持 mp3 / wav / ogg / m4a / flac / mp4 / webm
          </div>
        </template>
      </el-upload>
    </div>

    <!-- 音频信息 -->
    <div v-if="audioInfo" class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">📋 音频信息</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <span class="text-gray-500 dark:text-gray-500">文件名：</span>
          <span class="text-gray-800 dark:text-gray-200 font-medium">{{ audioInfo.name }}</span>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-500">时长：</span>
          <span class="text-gray-800 dark:text-gray-200 font-medium">{{ audioInfo.duration }}</span>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-500">采样率：</span>
          <span class="text-gray-800 dark:text-gray-200 font-medium">{{ audioInfo.sampleRate }}</span>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-500">声道：</span>
          <span class="text-gray-800 dark:text-gray-200 font-medium">{{ audioInfo.channels }}</span>
        </div>
      </div>
    </div>

    <!-- 可视化模式选择 -->
    <div v-if="audioBuffer">
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📊 可视化模式</h3>
      <el-radio-group v-model="vizMode" size="large">
        <el-radio-button label="waveform">波形图</el-radio-button>
        <el-radio-button label="spectrum">频谱图</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 波形 Canvas -->
    <div v-if="audioBuffer" class="relative">
      <canvas
        ref="canvasRef"
        class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-900"
        :height="canvasHeight"
      />
      <!-- 播放位置指示线 -->
      <div
        v-if="isPlaying"
        class="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
        :style="{ left: `${playProgress * 100}%` }"
      />
    </div>

    <!-- 进度条 -->
    <div v-if="audioBuffer" class="flex items-center gap-3">
      <span class="text-xs text-gray-500 w-14 text-right">{{ formatTime(currentTime) }}</span>
      <el-slider
        v-model="seekValue"
        :max="100"
        :step="0.1"
        :disabled="!audioBuffer"
        @change="seek"
        class="flex-1"
      />
      <span class="text-xs text-gray-500 w-14">{{ formatTime(duration) }}</span>
    </div>

    <!-- 播放控制 -->
    <div v-if="audioBuffer" class="flex items-center gap-3">
      <el-button type="primary" size="large" @click="play" :disabled="isPlaying">
        <el-icon><VideoPlay /></el-icon> 播放
      </el-button>
      <el-button size="large" @click="pause" :disabled="!isPlaying">
        <el-icon><VideoPause /></el-icon> 暂停
      </el-button>
      <el-button size="large" @click="stop" :disabled="!audioBuffer">
        <el-icon><CloseBold /></el-icon> 停止
      </el-button>

      <!-- 状态指示 -->
      <div class="ml-auto flex items-center gap-2">
        <div
          class="w-3 h-3 rounded-full"
          :class="isPlaying ? 'bg-green-500 animate-pulse' : isPaused ? 'bg-yellow-500' : 'bg-gray-400'"
        />
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ statusText }}</span>
      </div>
    </div>

    <!-- 无文件提示 -->
    <div v-if="!audioBuffer" class="text-center py-12 text-gray-400">
      <el-icon class="text-5xl mb-3"><Headset /></el-icon>
      <p>请上传音频或视频文件以开始可视化</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { VideoPlay, VideoPause, CloseBold, UploadFilled, Headset } from '@element-plus/icons-vue'
import { ElMessage, type UploadFile } from 'element-plus'

// 状态
const canvasRef = ref<HTMLCanvasElement | null>(null)
const audioBuffer = ref<AudioBuffer | null>(null)
const audioInfo = ref<{
  name: string
  duration: string
  sampleRate: string
  channels: string
} | null>(null)

const vizMode = ref<'waveform' | 'spectrum'>('waveform')
const isPlaying = ref(false)
const isPaused = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const seekValue = ref(0)
const canvasHeight = ref(200)

// Web Audio API
let audioContext: AudioContext | null = null
let sourceNode: AudioBufferSourceNode | null = null
let analyserNode: AnalyserNode | null = null
let gainNode: GainNode | null = null
let startOffset = 0
let startTime = 0
let animationFrameId = 0

const playProgress = ref(0)

// 初始化
onMounted(() => {
  canvasHeight.value = 200
})

onUnmounted(() => {
  stop()
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
})

// 格式化时间
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 文件选择
const handleFileChange = async (file: UploadFile) => {
  if (!file.raw) return

  const isVideo = file.raw.type.startsWith('video/')

  try {
    if (!audioContext) {
      audioContext = new AudioContext()
    }

    const arrayBuffer = await file.raw.arrayBuffer()

    if (isVideo) {
      // 视频文件：使用 HTMLVideoElement 提取音频
      await extractAudioFromVideo(file.raw)
    } else {
      // 音频文件：直接解码
      audioBuffer.value = await audioContext.decodeAudioData(arrayBuffer.slice(0))
      setAudioInfo(file.raw.name)
      duration.value = audioBuffer.value.duration
      await nextTick()
      drawWaveform()
    }

    ElMessage.success('文件加载成功')
  } catch (err) {
    console.error('音频解码失败:', err)
    ElMessage.error('文件解码失败，请尝试其他格式')
  }
}

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件，请先移除已上传的文件')
}

// 从视频提取音频
const extractAudioFromVideo = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = false

    const url = URL.createObjectURL(file)
    video.src = url

    video.onloadeddata = async () => {
      try {
        duration.value = video.duration
        // 无法直接从 video element 获取 AudioBuffer，使用 MediaElementSource
        // 但需要用户交互后才能播放，这里改为使用 fetch + decode
        const response = await fetch(url)
        const data = await response.arrayBuffer()
        audioBuffer.value = await audioContext!.decodeAudioData(data)
        setAudioInfo(file.name)
        URL.revokeObjectURL(url)
        await nextTick()
        drawWaveform()
        resolve()
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err)
      }
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('视频加载失败'))
    }
  })
}

const setAudioInfo = (name: string) => {
  if (!audioBuffer.value) return
  audioInfo.value = {
    name,
    duration: formatTime(audioBuffer.value.duration),
    sampleRate: `${audioBuffer.value.sampleRate} Hz`,
    channels: audioBuffer.value.numberOfChannels === 2 ? '立体声' : '单声道',
  }
}

// 绘制波形
const drawWaveform = () => {
  const canvas = canvasRef.value
  const buffer = audioBuffer.value
  if (!canvas || !buffer) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置 canvas 实际像素尺寸
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  const width = rect.width
  const height = rect.height

  // 清除画布
  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, width, height)

  // 中线
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()

  if (vizMode.value === 'waveform') {
    drawStaticWaveform(ctx, buffer, width, height)
  } else {
    drawSpectrumStatic(ctx, buffer, width, height)
  }
}

// 静态波形图
const drawStaticWaveform = (
  ctx: CanvasRenderingContext2D,
  buffer: AudioBuffer,
  width: number,
  height: number,
) => {
  const data = buffer.getChannelData(0)
  const step = Math.ceil(data.length / width)
  const mid = height / 2

  // 渐变
  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, '#3b82f6')
  gradient.addColorStop(0.5, '#8b5cf6')
  gradient.addColorStop(1, '#06b6d4')

  ctx.fillStyle = gradient
  ctx.beginPath()

  for (let i = 0; i < width; i++) {
    let min = 1.0
    let max = -1.0
    const start = Math.floor(i * step)
    for (let j = 0; j < step; j++) {
      const datum = data[start + j]
      if (datum !== undefined) {
        if (datum < min) min = datum
        if (datum > max) max = datum
      }
    }

    const yMin = (1 + min) * mid
    const yMax = (1 + max) * mid

    ctx.fillRect(i, yMax, 1, Math.max(yMin - yMax, 1))
  }
}

// 静态频谱图
const drawSpectrumStatic = (
  ctx: CanvasRenderingContext2D,
  buffer: AudioBuffer,
  width: number,
  height: number,
) => {
  const data = buffer.getChannelData(0)

  // 对数据分块计算 RMS 绘制频谱柱状图
  const blockSize = Math.floor(data.length / width)
  const bars = width

  for (let i = 0; i < bars; i++) {
    const start = Math.floor(i * blockSize)
    let sum = 0
    for (let j = 0; j < blockSize; j++) {
      const val = data[start + j]
      if (val !== undefined) sum += val * val
    }
    const rms = Math.sqrt(sum / blockSize)
    const barHeight = Math.min(rms * height * 3, height * 0.95)

    const hue = (i / bars) * 270
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`
    ctx.fillRect(i, height - barHeight, 1, barHeight)
  }
}

// 实时波形绘制（播放时）
const drawRealtime = () => {
  const canvas = canvasRef.value
  if (!canvas || !analyserNode || !audioBuffer.value) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  const width = rect.width
  const height = rect.height

  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, width, height)

  const bufferLength = analyserNode.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  if (vizMode.value === 'waveform') {
    // 实时时域波形
    analyserNode.getByteTimeDomainData(dataArray)

    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()

    const sliceWidth = width / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = (v * height) / 2

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)

      x += sliceWidth
    }

    ctx.lineTo(width, height / 2)
    ctx.stroke()
  } else {
    // 实时频谱
    analyserNode.getByteFrequencyData(dataArray)

    const barWidth = width / bufferLength * 2.5
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height

      const hue = (i / bufferLength) * 270
      ctx.fillStyle = `hsl(${hue}, 80%, 60%)`
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)

      x += barWidth
      if (x > width) break
    }
  }

  if (isPlaying.value) {
    animationFrameId = requestAnimationFrame(drawRealtime)
  }
}

// 播放
const play = () => {
  if (!audioContext || !audioBuffer.value) return

  // 恢复上下文（浏览器策略）
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  stop(false)

  sourceNode = audioContext.createBufferSource()
  sourceNode.buffer = audioBuffer.value

  analyserNode = audioContext.createAnalyser()
  analyserNode.fftSize = 2048

  gainNode = audioContext.createGain()
  gainNode.gain.value = 1

  sourceNode.connect(analyserNode)
  analyserNode.connect(gainNode)
  gainNode.connect(audioContext.destination)

  sourceNode.onended = () => {
    if (isPlaying.value) {
      stop()
    }
  }

  sourceNode.start(0, startOffset)
  startTime = audioContext.currentTime - startOffset

  isPlaying.value = true
  isPaused.value = false

  animationFrameId = requestAnimationFrame(drawRealtime)
  updateProgress()
}

// 暂停
const pause = () => {
  if (!isPlaying.value || !sourceNode) return

  startOffset = audioContext!.currentTime - startTime
  sourceNode.stop()
  sourceNode.disconnect()
  isPlaying.value = false
  isPaused.value = true

  cancelAnimationFrame(animationFrameId)

  // 绘制当前静态
  drawWaveform()
}

// 停止
const stop = (resetOffset = true) => {
  if (sourceNode) {
    try {
      sourceNode.stop()
    } catch {}
    sourceNode.disconnect()
    sourceNode = null
  }

  cancelAnimationFrame(animationFrameId)

  isPlaying.value = false
  isPaused.value = false

  if (resetOffset) {
    startOffset = 0
    currentTime.value = 0
    seekValue.value = 0
    playProgress.value = 0
  }

  analyserNode = null
  gainNode = null

  // 重绘静态波形
  nextTick(() => drawWaveform())
}

// 跳转
const seek = (val: number) => {
  if (!audioBuffer.value) return
  const newTime = (val / 100) * audioBuffer.value.duration
  startOffset = newTime
  currentTime.value = newTime
  playProgress.value = val / 100

  if (isPlaying.value) {
    play()
  } else {
    drawWaveform()
  }
}

// 更新进度
const updateProgress = () => {
  if (!isPlaying.value || !audioBuffer.value || !audioContext) return

  currentTime.value = audioContext.currentTime - startTime
  playProgress.value = currentTime.value / audioBuffer.value.duration
  seekValue.value = playProgress.value * 100

  if (currentTime.value >= audioBuffer.value.duration) {
    stop()
    return
  }

  animationFrameId = requestAnimationFrame(updateProgress)
}

// 状态文本
const statusText = ref('就绪')
watch([isPlaying, isPaused], () => {
  if (isPlaying.value) statusText.value = '播放中...'
  else if (isPaused.value) statusText.value = '已暂停'
  else statusText.value = '就绪'
})

// 模式切换时重绘
watch(vizMode, () => {
  if (!isPlaying.value) {
    nextTick(() => drawWaveform())
  }
})
</script>
