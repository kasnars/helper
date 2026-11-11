import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { gunzipSync } from 'zlib'
import { dirname, resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const root = __dirname

function copyAsset(from: string, to: string) {
  const source = resolve(root, from)
  const target = resolve(root, to)
  if (!existsSync(source)) return
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(source, target)
}

function copyGunzip(from: string, to: string) {
  const source = resolve(root, from)
  const target = resolve(root, to)
  if (!existsSync(source)) return
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, gunzipSync(readFileSync(source)))
}

function vendorLocalAssets() {
  const copy = () => {
    const files = [
      ['node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js', 'public/ffmpeg/ffmpeg-core.js'],
      ['node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm', 'public/ffmpeg/ffmpeg-core.wasm'],
      ['node_modules/tesseract.js/dist/worker.min.js', 'public/tesseract/worker.min.js'],
      ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'public/tesseract/tesseract-core-lstm.wasm.js'],
      ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm', 'public/tesseract/tesseract-core-lstm.wasm'],
      ['node_modules/@tesseract.js-data/eng/4.0.0/eng.traineddata.gz', 'public/tessdata/eng.traineddata.gz'],
      ['node_modules/@tesseract.js-data/chi_sim/4.0.0/chi_sim.traineddata.gz', 'public/tessdata/chi_sim.traineddata.gz'],
    ]
    files.forEach(([from, to]) => copyAsset(from, to))
    copyGunzip('node_modules/@tesseract.js-data/eng/4.0.0/eng.traineddata.gz', 'public/tessdata/eng.traineddata')
    copyGunzip('node_modules/@tesseract.js-data/chi_sim/4.0.0/chi_sim.traineddata.gz', 'public/tessdata/chi_sim.traineddata')
  }
  return {
    name: 'vendor-local-assets',
    buildStart: copy,
    configureServer: copy,
  }
}

export default defineConfig({
  base: '/helper/',
  plugins: [
    vue(),
    vendorLocalAssets(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Helper 助手',
        short_name: 'Helper',
        description: '纯前端工具箱，数据留在浏览器里',
        lang: 'zh-CN',
        theme_color: '#3B82F6',
        background_color: '#f9fafb',
        display: 'standalone',
        start_url: '/helper/',
        scope: '/helper/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/ffmpeg/**', '**/tesseract/**', '**/tessdata/**'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: '/helper/index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    open: process.env.PLAYWRIGHT !== '1',
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
