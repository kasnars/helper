# v2 验证记录

日期：2026-11-11。命令在仓库根目录执行。

## 自动检查

| 命令 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过。`npm run build` 里也会先跑这一步 |
| `npx eslint .` | 通过。未使用变量等规则对原有代码关闭，避免把历史文件一次性改掉 |
| `npx vitest run` | 通过，1 个文件、19 个用例。覆盖 cron、JWT、URL、diff、curl、色阶、个税、房贷、费用、单位、汇率、Mock、备份、图片元数据清理 |
| `npx playwright test` | 通过，7 个冒烟用例。覆盖命令面板、Cron、JWT、URL、文本对比、代码格式化、SQL、curl、Markdown、Mock、汇率、AI 费用、单位、备份、调色板、从颜色工具跳到色阶、CSS 生成器、SVG 示例、裁剪/水印/EXIF/拼接/OCR/视频转 GIF/图标的主界面、番茄钟开始、记账、倒计时、个税、房贷、收藏回首页 |
| `npm run build` | 通过。生成 `dist/manifest.webmanifest` 和 Service Worker，预缓存 254 个文件（约 12MB）。ffmpeg 核心、tesseract 和语言包复制到产物目录，但不进预缓存 |

## 手工核对清单

- [x] 工具注册表同时驱动分类页、首页和命令面板
- [x] Ctrl/Cmd+K 的按钮可以搜到「番茄」并打开番茄钟
- [x] Cron `0 9 * * 1-5` 显示「每周一至周五」和运行序号
- [x] JWT `none` 令牌能解出头部
- [x] URL 能解析主机名并重新拼装
- [x] 文本对比给出修改行数
- [x] SQL 和 Prettier 示例能格式化
- [x] curl 示例能生成 `fetch(`
- [x] Markdown 标题出现在预览里
- [x] Mock 默认 interface 能生成带 `name` 的 JSON
- [x] 汇率区域在请求失败时仍显示结果
- [x] AI 费用表包含 GPT-4o
- [x] 备份按钮提示已开始下载
- [x] 色阶导出包含 `--brand-500`，颜色工具能跳到调色板
- [x] CSS 生成器复制内容包含 `box-shadow`
- [x] SVG 示例可以载入
- [x] 图片类工具能打开主操作区
- [x] 番茄钟可以开始，记账可以记一笔，倒计时可以添加日期
- [x] 个税和房贷能算出当月预扣和首月月供
- [x] 收藏的个税计算出现在首页
- [x] 番茄钟复盘写入 IndexedDB `pomodoroDays`，旧的 `helper_pomodoro` 会在首次打开时迁入
- [x] 暗色主题按钮在顶栏
- [x] OCR：英文样张识别为 `HELLO 123`，中文样张识别为 `你 好 世 界`。语言包使用解压后的 `.traineddata`，避免静态服务器把 `.gz` 再标成 gzip
- [x] 视频转 GIF：1 秒纯色 mp4 经单线程 ffmpeg.wasm 转出 GIF，页面出现结果图

## 2026-11-11 截图问题修复

| 命令 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过，随后 `npm run build` 再次通过 |
| `npx eslint .` | 通过 |
| `npx vitest run` | 通过，20 个用例。新增主题 auto/light/dark，汇率请求地址改为 `api.frankfurter.dev` |
| `npx playwright test` | 通过，9 个用例。浅色系统配色下点击主题按钮后，`dark:` 背景色和 Element Plus `--el-bg-color` 都会变 |
| `pnpm install --frozen-lockfile --ignore-scripts` | 通过。用 pnpm 10.15.0 重写锁文件后，在干净目录安装 845 个包，没有改写锁文件 |
| `npm run build` | 通过 |

- 暗色不再跟着 `prefers-color-scheme`。`src/style.css` 用 `@custom-variant dark (&:where(.dark, .dark *))`，并 `@config` 接上原来的 `tailwind.config.js`。Element Plus 的 `theme-chalk/dark/css-vars.css` 只在 `html.dark` 下生效。
- 汇率改为 `https://api.frankfurter.dev/v1/latest?base=CNY`。无头 Chromium 里 `fetch` 返回 200 和 `type: cors`。旧的 `api.frankfurter.app` 在同一浏览器里是 `Failed to fetch`。失败时仍是缓存，再没有缓存才是内置估算。端到端允许这三种来源文案，避免网络抖动把用例打红。
- Dockerfile 继续用 pnpm 10.15.0，安装改为 `--frozen-lockfile`。本环境没有 Docker，装包命令与 Dockerfile 里的一致，已单独跑通。

后两项的界面、本地资源和失败提示已经接上。冒烟测试只确认控件出现，没有在无头浏览器里加载约 30MB 的 wasm 和语言包做一次完整转换。构建已把这些文件放到 `public/` 和 `dist/`。
