<template>
  <div class="space-y-6">
    <!-- 上传区域 -->
    <div
      class="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-colors hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      :class="{ 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20': isDragging }"
    >
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
      <el-icon :size="48" class="text-gray-400 dark:text-gray-500 mb-4"><Upload /></el-icon>
      <p class="text-gray-600 dark:text-gray-400 mb-2">拖拽图片到此处，或点击上传</p>
      <p class="text-sm text-gray-400 dark:text-gray-500">支持 JPG、PNG、TIFF、HEIC 等常见格式</p>
    </div>

    <!-- 结果区域 -->
    <div v-if="imageSrc" class="space-y-4">
      <!-- 图片预览 -->
      <div class="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 text-center">
        <p class="text-sm text-gray-500 mb-2">图片预览</p>
        <div class="flex justify-center">
          <img :src="imageSrc" class="max-w-full max-h-[300px] object-contain rounded" />
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="flex justify-center py-8">
        <el-icon class="is-loading text-blue-500" :size="32"><Loading /></el-icon>
        <span class="ml-2 text-gray-500">正在解析EXIF信息...</span>
      </div>

      <!-- 无EXIF信息提示 -->
      <div
        v-if="!loading && !hasExif"
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center"
      >
        <el-icon :size="36" class="text-yellow-400 mb-2"><Warning /></el-icon>
        <p class="text-yellow-700 dark:text-yellow-400 font-medium">未找到EXIF信息</p>
        <p class="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
          该图片可能不包含EXIF元数据，或格式不受支持
        </p>
      </div>

      <!-- EXIF信息展示 -->
      <div v-if="!loading && hasExif" class="space-y-4">
        <!-- 相机信息 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <el-icon class="text-blue-500"><Camera /></el-icon>
            相机信息
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-if="exifData.Make" class="flex justify-between">
              <span class="text-sm text-gray-500">相机品牌</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.Make }}</span>
            </div>
            <div v-if="exifData.Model" class="flex justify-between">
              <span class="text-sm text-gray-500">相机型号</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.Model }}</span>
            </div>
            <div v-if="exifData.LensMake" class="flex justify-between">
              <span class="text-sm text-gray-500">镜头品牌</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.LensMake }}</span>
            </div>
            <div v-if="exifData.LensModel" class="flex justify-between">
              <span class="text-sm text-gray-500">镜头型号</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.LensModel }}</span>
            </div>
            <div v-if="exifData.Software" class="flex justify-between">
              <span class="text-sm text-gray-500">软件</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.Software }}</span>
            </div>
            <div v-if="exifData.Firmware" class="flex justify-between">
              <span class="text-sm text-gray-500">固件版本</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.Firmware }}</span>
            </div>
          </div>
          <p v-if="!hasCameraInfo" class="text-sm text-gray-400">暂无相机信息</p>
        </div>

        <!-- 拍摄参数 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <el-icon class="text-green-500"><Setting /></el-icon>
            拍摄参数
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-if="exifData.DateTimeOriginal || exifData.DateTime" class="flex justify-between">
              <span class="text-sm text-gray-500">拍摄时间</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.DateTimeOriginal || exifData.DateTime }}</span>
            </div>
            <div v-if="exifData.ExposureTime" class="flex justify-between">
              <span class="text-sm text-gray-500">曝光时间</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatExposureTime(exifData.ExposureTime) }}</span>
            </div>
            <div v-if="exifData.FNumber" class="flex justify-between">
              <span class="text-sm text-gray-500">光圈</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">f/{{ exifData.FNumber }}</span>
            </div>
            <div v-if="exifData.ISO" class="flex justify-between">
              <span class="text-sm text-gray-500">ISO</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.ISO }}</span>
            </div>
            <div v-if="exifData.FocalLength" class="flex justify-between">
              <span class="text-sm text-gray-500">焦距</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatFocalLength(exifData.FocalLength) }}</span>
            </div>
            <div v-if="exifData.ExposureProgram" class="flex justify-between">
              <span class="text-sm text-gray-500">曝光模式</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatExposureProgram(exifData.ExposureProgram) }}</span>
            </div>
            <div v-if="exifData.MeteringMode" class="flex justify-between">
              <span class="text-sm text-gray-500">测光模式</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatMeteringMode(exifData.MeteringMode) }}</span>
            </div>
            <div v-if="exifData.Flash !== undefined" class="flex justify-between">
              <span class="text-sm text-gray-500">闪光灯</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatFlash(exifData.Flash) }}</span>
            </div>
            <div v-if="exifData.WhiteBalance" class="flex justify-between">
              <span class="text-sm text-gray-500">白平衡</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatWhiteBalance(exifData.WhiteBalance) }}</span>
            </div>
            <div v-if="exifData.ExposureCompensation !== undefined" class="flex justify-between">
              <span class="text-sm text-gray-500">曝光补偿</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.ExposureCompensation }} EV</span>
            </div>
          </div>
          <p v-if="!hasShootingInfo" class="text-sm text-gray-400">暂无拍摄参数</p>
        </div>

        <!-- 图片尺寸信息 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <el-icon class="text-purple-500"><Picture /></el-icon>
            图片信息
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-if="exifData.ImageWidth || exifData.ExifImageWidth" class="flex justify-between">
              <span class="text-sm text-gray-500">宽度</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.ExifImageWidth || exifData.ImageWidth }} px</span>
            </div>
            <div v-if="exifData.ImageHeight || exifData.ExifImageHeight" class="flex justify-between">
              <span class="text-sm text-gray-500">高度</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.ExifImageHeight || exifData.ImageHeight }} px</span>
            </div>
            <div v-if="exifData.Orientation" class="flex justify-between">
              <span class="text-sm text-gray-500">方向</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatOrientation(exifData.Orientation) }}</span>
            </div>
            <div v-if="exifData.ColorSpace" class="flex justify-between">
              <span class="text-sm text-gray-500">色彩空间</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.ColorSpace === 1 ? 'sRGB' : 'Adobe RGB' }}</span>
            </div>
            <div v-if="exifData.XResolution" class="flex justify-between">
              <span class="text-sm text-gray-500">水平分辨率</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.XResolution }} DPI</span>
            </div>
            <div v-if="exifData.YResolution" class="flex justify-between">
              <span class="text-sm text-gray-500">垂直分辨率</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ exifData.YResolution }} DPI</span>
            </div>
          </div>
          <p v-if="!hasImageInfo" class="text-sm text-gray-400">暂无图片尺寸信息</p>
        </div>

        <!-- GPS信息 -->
        <div v-if="exifData.GPSLatitude || exifData.latitude" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <el-icon class="text-red-500"><Location /></el-icon>
            GPS信息
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-if="formatCoordinate(exifData.latitude || exifData.GPSLatitude)" class="flex justify-between">
              <span class="text-sm text-gray-500">纬度</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatCoordinate(exifData.latitude || exifData.GPSLatitude) }}</span>
            </div>
            <div v-if="formatCoordinate(exifData.longitude || exifData.GPSLongitude)" class="flex justify-between">
              <span class="text-sm text-gray-500">经度</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatCoordinate(exifData.longitude || exifData.GPSLongitude) }}</span>
            </div>
            <div v-if="exifData.GPSAltitude" class="flex justify-between">
              <span class="text-sm text-gray-500">海拔</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatAltitude(exifData.GPSAltitude) }}</span>
            </div>
            <div v-if="exifData.GPSImgDirection" class="flex justify-between">
              <span class="text-sm text-gray-500">方向</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDirection(exifData.GPSImgDirection) }}</span>
            </div>
          </div>
          <!-- 地图链接 -->
          <div v-if="formatCoordinate(exifData.latitude || exifData.GPSLatitude) || formatCoordinate(exifData.longitude || exifData.GPSLongitude)" class="mt-4">
            <a
              :href="`https://www.google.com/maps?q=${exifData.latitude || exifData.GPSLatitude},${exifData.longitude || exifData.GPSLongitude}`"
              target="_blank"
              class="text-sm text-blue-500 hover:text-blue-600 underline"
            >
              在 Google Maps 中查看位置 →
            </a>
          </div>
        </div>

        <!-- 原始数据 -->
        <details class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <summary class="font-semibold text-gray-900 dark:text-white cursor-pointer select-none flex items-center gap-2">
            <el-icon class="text-gray-500"><Document /></el-icon>
            查看全部原始数据
          </summary>
          <pre class="mt-4 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-96 bg-gray-50 dark:bg-gray-900 rounded p-4">{{ JSON.stringify(exifData, null, 2) }}</pre>
        </details>
      </div>
    </div>

    <!-- 说明 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-3">使用说明</h3>
      <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <li>• 支持查看 JPG、PNG、TIFF、HEIC 等常见图片格式的EXIF元数据</li>
        <li>• 拖拽或点击上传图片，即可自动解析EXIF信息</li>
        <li>• 信息分为：相机信息、拍摄参数、图片信息、GPS信息四类展示</li>
        <li>• 纯前端处理，图片不会上传到任何服务器</li>
        <li>• 部分图片可能已被清理EXIF数据（如截图、网络下载图片）</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Loading, Warning, Camera, Setting, Picture, Location, Document } from '@element-plus/icons-vue'
import exifr from 'exifr'

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const loading = ref(false)
const imageSrc = ref('')
const exifData = ref<Record<string, any>>({})

const hasExif = computed(() => Object.keys(exifData.value).length > 0)
const hasCameraInfo = computed(() =>
  exifData.value.Make || exifData.value.Model || exifData.value.LensMake || exifData.value.LensModel || exifData.value.Software
)
const hasShootingInfo = computed(() =>
  exifData.value.DateTimeOriginal || exifData.value.ExposureTime || exifData.value.FNumber || exifData.value.ISO || exifData.value.FocalLength
)
const hasImageInfo = computed(() =>
  exifData.value.ExifImageWidth || exifData.value.ImageWidth || exifData.value.ExifImageHeight || exifData.value.Orientation
)

const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadImage(file)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file?.type.startsWith('image/')) loadImage(file)
}

const loadImage = async (file: File) => {
  imageSrc.value = URL.createObjectURL(file)
  loading.value = true
  exifData.value = {}

  try {
    const data = await exifr.parse(file, {
      // 提取所有可用的EXIF数据
      tiff: true,
      xmp: true,
      icc: true,
      iptc: true,
      jfif: true,
      ihdr: true,
      gps: true,
      interop: true,
      // 包含自定义标签
      reviveValues: true,
    })

    if (data && Object.keys(data).length > 0) {
      exifData.value = data
    }
  } catch (err) {
    console.error('EXIF解析失败:', err)
    exifData.value = {}
  } finally {
    loading.value = false
  }
}

// 格式化曝光时间
const formatExposureTime = (time: number) => {
  if (time >= 1) return `${time}s`
  if (time >= 1/2) return `1/${Math.round(1/time)}s`
  if (time >= 1/4) return `1/${Math.round(1/time)}s`
  if (time >= 1/8) return `1/${Math.round(1/time)}s`
  return `1/${Math.round(1/time)}s`
}

// 格式化焦距
const formatFocalLength = (focal: number) => {
  return `${focal}mm`
}

// 格式化曝光模式
const formatExposureProgram = (program: number) => {
  const programs: Record<number, string> = {
    0: '未定义',
    1: '手动',
    2: '自动',
    3: '光圈优先',
    4: '快门优先',
    5: '创意模式',
    6: '运动模式',
    7: '人像模式',
    8: '风景模式',
  }
  return programs[program] || `模式 ${program}`
}

// 格式化测光模式
const formatMeteringMode = (mode: number) => {
  const modes: Record<number, string> = {
    0: '未知',
    1: '平均',
    2: '中央重点平均',
    3: '点测光',
    4: '多点测光',
    5: '矩阵测光',
    6: '局部测光',
  }
  return modes[mode] || `模式 ${mode}`
}

// 格式化闪光灯
const formatFlash = (flash: number) => {
  if (flash === 0) return '未闪光'
  if (flash === 1) return '闪光'
  if (flash === 5) return '闪光（未检测到反射光）'
  if (flash === 7) return '闪光（检测到反射光）'
  if (flash === 16) return '未闪光'
  if (flash === 24) return '未闪光'
  if (flash === 25) return '闪光（未检测到反射光）'
  if (flash === 31) return '闪光（检测到反射光）'
  return flash ? '闪光' : '未闪光'
}

// 格式化白平衡
const formatWhiteBalance = (wb: number) => {
  return wb === 0 ? '自动' : '手动'
}

// 格式化方向
const formatOrientation = (orientation: number) => {
  const orientations: Record<number, string> = {
    1: '正常',
    2: '水平翻转',
    3: '旋转180°',
    4: '垂直翻转',
    5: '顺时针90°+水平翻转',
    6: '顺时针90°',
    7: '逆时针90°+水平翻转',
    8: '逆时针90°',
  }
  return orientations[orientation] || `方向 ${orientation}`
}

// 格式化坐标
const formatCoordinate = (coord: number) => {
  if (coord === undefined || coord === null) return ''
  return `${coord.toFixed(6)}°`
}

// 格式化海拔
const formatAltitude = (altitude: number) => {
  return `${altitude.toFixed(1)}m`
}

// 格式化方向
const formatDirection = (direction: number) => {
  return `${direction.toFixed(1)}°`
}
</script>
