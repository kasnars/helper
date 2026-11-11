# PWA

## 功能概述
站点可以安装，并用 Service Worker 离线打开已经访问过的页面。图标为 192 和 512 两档。

## 关键技术栈
- `vite-plugin-pwa`，`registerType: autoUpdate`
- 范围和起始地址都是 `/helper/`

## 关键组件
- `vite.config.ts` 中的 VitePWA
- `public/icons/icon-192.png`、`icon-512.png`

## 实现思路
预缓存脚本、样式和图标。ffmpeg、tesseract 和语言包体积大，构建时复制到 `public/` 供按需加载，但不进预缓存。开发服务器不启用 Service Worker，避免干扰本地调试。不设置 COOP/COEP，单线程 ffmpeg 不需要跨域隔离。

## 功能总结
装到桌面后，没网也能打开已经用过的工具。识别和转 GIF 仍要本机已有对应的大文件。
