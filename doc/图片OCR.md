# 图片 OCR

## 功能概述
用 tesseract.js 识别图片里的中文和英文。引擎、核心和语言包都从本站加载，不访问公共 CDN。

## 关键技术栈
- tesseract.js，点击识别时动态导入
- 构建时把 worker、lstm wasm 和 `eng` / `chi_sim` 训练数据复制到 `public/`

## 关键组件
- `ImageOcr.vue`

## 实现思路
`createWorker` 指定本地 `workerPath`、`corePath` 和 `langPath`，关闭 gzip 后缀，并关闭 blob worker URL，避免去拉取远程脚本。语言包在构建时解压成 `.traineddata`，避免静态服务器把 `.gz` 再声明成 gzip 导致引擎解不开。语言可选中英混合、仅中文或仅英文。

## 功能总结
从截图里抄文字。首次识别要加载语言包，之后由浏览器缓存。
