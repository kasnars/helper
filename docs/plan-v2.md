# Helper v2 实现计划

按下面的顺序提交。每一步都保持应用可以类型检查，不把半成品逻辑留在组件里。

1. **docs: 需求、规格与计划**
   - 写入 `docs/requirements-v2.md`、`docs/spec-v2.md`、`docs/plan-v2.md`。

2. **feat: 纯逻辑与单元测试**
   - 在 `src/lib/` 实现 Cron、JWT、URL、diff、curl、色阶、个税、房贷、费用、单位、汇率、Mock、备份校验、图片元数据清理。
   - 用 Vitest 覆盖规格里的例子和主要边界。

3. **feat: 工具注册表、命令面板、收藏**
   - `src/tools/registry.ts` 收录旧工具和新工具。
   - 各分类页改为读取注册表的 `ToolPage`。
   - `Cmd/Ctrl+K` 命令面板，首页展示收藏和最近使用。

4. **feat: 开发与文本工具**
   - Cron 改为真实的下一次运行时间。
   - JWT 增加 HS 签名校验。
   - URL 查询参数可编辑并重建。
   - 文本对比增加词级差异和并排/行内视图。
   - 代码格式化补上 Markdown、YAML，并改为按需加载 Prettier。
   - Mock 支持 interface 和 JSON 示例。
   - Markdown 支持 mermaid 与打印。
   - 新增 curl 转代码。

5. **feat: 设计与图片工具**
   - 色阶导出 CSS 变量和 Tailwind 片段，颜色工具可跳转。
   - 新增 CSS 生成器。
   - SVG 增加 SVGO 与 Vue 组件输出。
   - Favicon 打包 zip 和 manifest。
   - EXIF 增加清除下载。
   - 接上长图拼接，新增 OCR 与视频转 GIF。

6. **feat: 生活工具、汇率、备份与 PWA**
   - 番茄钟、记账、倒计时与纪念日、个税、房贷、AI 费用、汇率、全量备份。
   - `vite-plugin-pwa`、图标、ESLint。
   - 把 ffmpeg 与 tesseract 资源放到站点目录，避免运行时请求第三方。

7. **test: 端到端冒烟**
   - Playwright 打开每个新工具并走主路径，另测命令面板。
   - 修复测试暴露的问题。

8. **docs: 功能文档与进度**
   - `doc/` 为每个新能力补一篇说明，更新索引和 README。
   - `docs/progress-v2.md` 记录 typecheck、lint、单元测试、e2e、构建和手工检查清单。
