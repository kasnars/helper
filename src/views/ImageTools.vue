<template>
  <div class="min-h-screen pt-20 pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🖼️ 图片工具
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          图片压缩、转换、裁剪、水印、EXIF查看等工具
        </p>
      </div>

      <!-- Tool Navigation -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <el-radio-group v-model="activeTool" size="large" class="tool-switcher">
          <el-radio-button label="processor">
            <el-icon><Picture /></el-icon>
            <span class="hidden sm:inline">图片处理</span>
            <span class="sm:hidden">处理</span>
          </el-radio-button>
          <el-radio-button label="crop">
            <el-icon><Crop /></el-icon>
            <span class="hidden sm:inline">图片裁剪</span>
            <span class="sm:hidden">裁剪</span>
          </el-radio-button>
          <el-radio-button label="watermark">
            <el-icon><Picture /></el-icon>
            <span class="hidden sm:inline">图片水印</span>
            <span class="sm:hidden">水印</span>
          </el-radio-button>
          <el-radio-button label="exif">
            <el-icon><InfoFilled /></el-icon>
            <span class="hidden sm:inline">EXIF 信息</span>
            <span class="sm:hidden">EXIF</span>
          </el-radio-button>
          <el-radio-button label="idphoto">
            <el-icon><Avatar /></el-icon>
            <span class="hidden sm:inline">证件照换底色</span>
            <span class="sm:hidden">证件照</span>
          </el-radio-button>
          <el-radio-button label="pixelart">
            <el-icon><Grid /></el-icon>
            <span class="hidden sm:inline">像素画</span>
            <span class="sm:hidden">像素</span>
          </el-radio-button>
          <el-radio-button label="favicon">
            <el-icon><Picture /></el-icon>
            <span class="hidden sm:inline">Favicon生成</span>
            <span class="sm:hidden">Favicon</span>
          </el-radio-button>
          <el-radio-button label="formatdetect">
            <el-icon><InfoFilled /></el-icon>
            <span class="hidden sm:inline">格式检测</span>
            <span class="sm:hidden">检测</span>
          </el-radio-button>
          <el-radio-button label="collage">
            <el-icon><Grid /></el-icon>
            <span class="hidden sm:inline">图片拼贴</span>
            <span class="sm:hidden">拼贴</span>
          </el-radio-button>
          <el-radio-button label="gifcreator">
            <el-icon><VideoPlay /></el-icon>
            <span class="hidden sm:inline">GIF 制作</span>
            <span class="sm:hidden">GIF</span>
          </el-radio-button>
          <el-radio-button label="gifextractor">
            <el-icon><Film /></el-icon>
            <span class="hidden sm:inline">GIF 拆帧</span>
            <span class="sm:hidden">拆帧</span>
          </el-radio-button>
          <el-radio-button label="annotator">
            <el-icon><EditPen /></el-icon>
            <span class="hidden sm:inline">图片标注</span>
            <span class="sm:hidden">标注</span>
          </el-radio-button>
          <el-radio-button label="colorpicker">
            <el-icon><Brush /></el-icon>
            <span class="hidden sm:inline">颜色拾取</span>
            <span class="sm:hidden">拾色</span>
          </el-radio-button>
          <el-radio-button label="ascii">
            <el-icon><Memo /></el-icon>
            <span class="hidden sm:inline">ASCII 艺术</span>
            <span class="sm:hidden">ASCII</span>
          </el-radio-button>
          <el-radio-button label="batchresize">
            <el-icon><Picture /></el-icon><span class="hidden sm:inline">批量调整尺寸</span><span class="sm:hidden">尺寸</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Tool Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <ImageProcessor v-if="activeTool === 'processor'" />
        <ImageCropper v-if="activeTool === 'crop'" />
        <ImageWatermark v-if="activeTool === 'watermark'" />
        <ImageExif v-if="activeTool === 'exif'" />
        <IdPhotoBg v-if="activeTool === 'idphoto'" />
        <ImagePixelArt v-if="activeTool === 'pixelart'" />
        <FaviconGenerator v-if="activeTool === 'favicon'" />
        <ImageFormatDetector v-if="activeTool === 'formatdetect'" />
        <ImageCollage v-if="activeTool === 'collage'" />
        <GifCreator v-if="activeTool === 'gifcreator'" />
        <GifExtractor v-if="activeTool === 'gifextractor'" />
        <ImageAnnotator v-if="activeTool === 'annotator'" />
        <ImageColorPicker v-if="activeTool === 'colorpicker'" />
        <AsciiArtGenerator v-if="activeTool === 'ascii'" />
        <BatchImageResizer v-if="activeTool === 'batchresize'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { Picture, Crop, InfoFilled, Avatar, VideoPlay, Film, EditPen, Brush, Memo } from '@element-plus/icons-vue'
const ImageProcessor = defineAsyncComponent(() => import('./ImageProcessor.vue'))
const ImageCropper = defineAsyncComponent(() => import('../components/file/ImageCropper.vue'))
const ImageWatermark = defineAsyncComponent(() => import('../components/dev/ImageWatermark.vue'))
const ImageExif = defineAsyncComponent(() => import('../components/file/ImageExif.vue'))
const IdPhotoBg = defineAsyncComponent(() => import('../components/file/IdPhotoBg.vue'))
const ImagePixelArt = defineAsyncComponent(() => import('../components/image/ImagePixelArt.vue'))
const FaviconGenerator = defineAsyncComponent(() => import('../components/image/FaviconGenerator.vue'))
const ImageFormatDetector = defineAsyncComponent(() => import('../components/image/ImageFormatDetector.vue'))
const ImageCollage = defineAsyncComponent(() => import('../components/image/ImageCollage.vue'))
const GifCreator = defineAsyncComponent(() => import('../components/image/GifCreator.vue'))
const GifExtractor = defineAsyncComponent(() => import('../components/image/GifExtractor.vue'))
const ImageAnnotator = defineAsyncComponent(() => import('../components/image/ImageAnnotator.vue'))
const ImageColorPicker = defineAsyncComponent(() => import('../components/image/ImageColorPicker.vue'))
const AsciiArtGenerator = defineAsyncComponent(() => import('../components/image/AsciiArtGenerator.vue'))
const BatchImageResizer = defineAsyncComponent(() => import('../components/image/BatchImageResizer.vue'))

const activeTool = ref('processor')
const toolList = ['processor', 'crop', 'watermark', 'exif', 'idphoto', 'pixelart', 'favicon', 'formatdetect', 'collage', 'gifcreator', 'gifextractor', 'annotator', 'colorpicker', 'ascii', 'batchresize']

onMounted(() => {
  const savedTool = sessionStorage.getItem('activeImageTool')
  if (savedTool && toolList.includes(savedTool)) {
    activeTool.value = savedTool
    sessionStorage.removeItem('activeImageTool')
  }
})
</script>
