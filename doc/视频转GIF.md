# 视频转 GIF

## 功能概述
在浏览器里把视频片段转成 GIF，可设置开始时间、时长、帧率和宽度。使用单线程 ffmpeg.wasm，不要求 SharedArrayBuffer。

## 关键技术栈
- `@ffmpeg/ffmpeg` 0.12，动态导入
- `@ffmpeg/core` 单线程核心，构建时复制到 `public/ffmpeg`

## 关键组件
- `VideoToGif.vue`

## 实现思路
`ffmpeg.load` 通过 `toBlobURL` 读取同源的 js 和 wasm。滤镜链是 `fps`、`scale`、`palettegen` 和 `paletteuse`。核心加载失败时提示换用桌面版 Chrome，而不是静默失败。

## 功能总结
截一小段视频做成动图。核心文件约 30MB，不放进 PWA 预缓存。
