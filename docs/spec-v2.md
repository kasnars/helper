# Helper v2 行为规格

界面文案使用简体中文。新页面沿用现有白卡片、圆角、细边框和暗色模式，不另起一套视觉语言。工具元数据只存在 `src/tools/registry.ts`，菜单、首页、命令面板和收藏都读它。

## 路由与菜单

不新增顶层路由。新工具挂到已有页面：

| 页面 | 路径 | 新增或补齐的工具 |
| --- | --- | --- |
| 开发工具 | `/devtools` | curl 转代码 |
| 编码与安全 | `/securitytools` | JWT 签名校验（增强原解码器）、URL 查询表（增强原工具） |
| Web 与 CSS | `/webtools` | 色阶调色板（增强）、CSS 生成器 |
| 文本工具 | `/texttools` | 文本对比（增强）、Markdown（mermaid 与打印） |
| 实用工具 | `/utility` | Cron 解析（增强）、Mock（增强）、汇率、AI 费用、数据备份 |
| 图片工具 | `/imagetools` | 长图拼接、OCR、视频转 GIF；裁剪、水印、EXIF、Favicon 保持在此并补齐能力 |
| 生活工具 | `/life` | 番茄钟、记账、倒计时与纪念日、个税、房贷 |

打开工具时写入原来的 `sessionStorage` 键（`activeDevTool`、`activeLifeTool` 等），因此搜索跳转和刷新前的深链行为保持不变。

## 数据模型

本地键一律带 `helper_` 前缀，便于整包导出。

- `helper_favorites`: `string[]`，工具 id。
- `helper_recent`: `string[]`，最近使用，最多 12 个。
- `helper_pomodoro`: `{ note, noteDate, logs: { date, minutes }[] }`。
- `helper_expenses`: `{ id, amount, category, note, date }[]`。
- `helper_events`: `{ id, title, date, kind: 'countdown' | 'anniversary' }[]`。
- `helper_ai_prices`: `{ id, name, inputPerMillion, outputPerMillion }[]`。
- `helper_currency_rates`: `{ base: 'CNY', rates, updatedAt, source }`。
- 主题、食物、随机数配置仍在 IndexedDB `HelperDB`。

备份文件：

```json
{
  "app": "helper",
  "version": 1,
  "exportedAt": "ISO-8601",
  "indexedDB": {
    "foodOptions": [],
    "foodHistory": [],
    "randomConfig": [],
    "appSettings": []
  },
  "localStorage": { "helper_favorites": "[]" }
}
```

校验失败的条件：不是对象、`app` 不是 `helper`、`version` 不是 `1`、`exportedAt` 不是字符串、四张表缺失或不是数组、表内元素不是对象、`localStorage` 的值不是字符串。失败时不写入。

## 分项行为与边界

### Cron

字段范围：秒/分 0–59，时 0–23，日 1–31，月 1–12，周 0–7（0 和 7 都是周日）。`?` 与 `*` 等价。日和周都不是 `*` 时，满足任意一个即匹配。从给定时间的下一秒（5 字段则为下一分钟的 0 秒）开始向后找 10 次，搜索上限约 20 万步，找不到就返回已找到的部分。`60` 或空字段直接报错。

### JWT

`exp`、`iat`、`nbf` 按秒级时间戳格式化为本地时间。`now >= exp` 为已过期，`now < nbf` 为尚未生效。HS256/384/512 用 `crypto.subtle.verify`。`none`、RSA 或密钥为空时不报成功。

### URL

编码使用 `encodeURIComponent`。解析使用 `URL`。无协议的字符串视为非法。重建时保留用户编辑后的参数顺序，空键会被丢弃。

### Diff

行差异使用 LCS。相邻的删除和插入配成“修改”，并在该行内按空白和汉字切词再做一次差异。单侧超过 1500 行时停止并提示缩短文本，避免页面卡死。

### 格式化

SQL 方言沿用现有选择器（SQL、MySQL、PostgreSQL、T-SQL、SQLite）。代码格式化在点击时才加载 `prettier/standalone` 与对应插件。Markdown 用 `markdown` 解析器，YAML 用 `yaml`。

### Mock

interface 支持 `name: type`、可选 `?`、`string | number` 取第一个、`T[]`。JSON 示例取对象或对象数组的第一项，并递归一层对象。字段名包含 name、email、phone、city、company、url、date、id 时使用对应 faker 方法，否则按类型兜底。数量限制 1–200。

### Markdown

mermaid 只在围栏语言为 `mermaid` 时渲染。导出 PDF 打开仅含正文的新窗口并调用打印，避免把整个工具箱打进 PDF。

### curl

支持 `-X/--request`、`-H/--header`、`-d/--data/--data-raw/--data-binary`、`-u/--user`、`--url`、`-A`、引号和反斜杠续行。有 body 且未写方法时视为 POST。`-k`、`-L`、`-s`、`--compressed` 被忽略并在结果注释中说明。未知参数报错。

### 颜色

色阶固定 50、100、200、300、400、500、600、700、800、900、950。500 为基色，更小的阶混入白色，更大的阶混入黑色。CSS 变量名为 `--{name}-{step}`。

### CSS 生成器

阴影输出 `box-shadow`，渐变输出 `linear-gradient`，圆角输出四值 `border-radius`，曲线输出 `cubic-bezier(x1, y1, x2, y2)`，控制点限制在 0–1。

### SVG

优先 `svgo/browser` 的 `optimize`。同时提供不依赖 SVGO 的原有清理，并在优化文本外包一层 Vue `<template>`。

### Favicon

默认尺寸 16、32、48、180、192、512。zip 内为 PNG 和 `site.webmanifest`。

### EXIF

展示逻辑保持现状。清除时 JPEG 去掉 APP0–APP15 与注释段，PNG 去掉 `eXIf`、`tEXt`、`iTXt`、`zTXt`。其它格式把图像画到 canvas 再导出，因此会重新编码。

### OCR

`createWorker('chi_sim+eng')`，worker、core、语言包都从站点自身的 `public/` 加载。语言可改成仅中文或仅英文。

### 视频转 GIF

单线程 `@ffmpeg/core`，从 `/ffmpeg/` 加载，不依赖 `SharedArrayBuffer`。滤镜为 `fps`、`scale` 和调色板。开始时间小于 0、时长小于 0.1 秒或宽度超出 16–1280 时拒绝执行。

### 番茄钟

默认专注 25 分钟、短休 5 分钟、长休 15 分钟，均可改。一次专注自然结束才计入当天分钟数。笔记按自然日保存，跨日不覆盖历史日志。

### 记账

预设分类：餐饮、交通、购物、居住、娱乐、医疗、其他。金额必须大于 0。CSV 列为 `date,category,amount,note`。

### 倒计时与纪念日

日期按本地日历的 0 点比较。同一天剩余天数为 0。列表存在本地，可删除。

### 个税

月应纳税所得额累计值 = 累计收入 − 5000×月数 − 累计社保 − 累计专项附加 − 累计其他扣除。税率表使用现行综合所得七级超额累进和速算扣除数。当月税额 = 本月累计税额 − 上月累计税额。负数应纳税所得额按 0 计税。

### 房贷

月利率 = 年利率百分比 / 100 / 12。等额本息月供使用标准年金公式；等额本金每月本金相同，利息按剩余本金递减。金额保留到分，最后一期吃掉四舍五入余数，使本金合计等于贷款本金。利率为 0 时退化为平均分摊。

### AI 费用

费用 = 输入 token / 1e6 × 输入单价 + 输出 token / 1e6 × 输出单价。价格可增删改，重置可回到内置表。结果按费用从低到高排列。

### 汇率

请求 `https://api.frankfurter.app/latest?from=CNY`。`rates` 表示 1 人民币可兑换的外币数量。换算：`amount / rates[from] * rates[to]`。界面标明“实时”“缓存”或“离线估算”。

### 命令面板与收藏

空查询时收藏在最前，其次是最近使用，然后是全部工具。模糊匹配先看完整子串，再看按顺序出现的字符。`Esc` 关闭，方向键移动，回车跳转。收藏星标写在工具页标题旁。

### PWA

`vite-plugin-pwa`，`registerType: 'autoUpdate'`，`scope` 与 `start_url` 为 `/helper/`。图标 192 与 512。预缓存忽略 ffmpeg、tesseract 和 tessdata。

## 库的选择

| 能力 | 库 | 加载方式 |
| --- | --- | --- |
| SQL | 已有 `sql-formatter` | 工具页异步组件 |
| 代码格式化 | 已有 `prettier` standalone 与 plugins | 点击时动态 import |
| Mock | `@faker-js/faker` | 仅 Mock 工具块 |
| 图表文字 | `mermaid` | 预览时动态 import |
| SVG | `svgo/browser` | 点击优化时动态 import |
| OCR | 已有 `tesseract.js` | 点击识别时动态 import，资源放 `public/` |
| GIF | `@ffmpeg/ffmpeg`、`@ffmpeg/core` 单线程 | 点击转换时动态 import，wasm 放 `public/ffmpeg` |
| 打包图标 | 已有 `jszip` | Favicon 工具块 |
| EXIF 读取 | 已有 `exifr` | 图片工具块 |
| 汇率 | Frankfurter 公开接口 | 仅汇率工具发起 |
| 测试 | Vitest、Playwright | 开发依赖 |

不引入图表框架，周统计和记账汇总用页面内的比例条完成。

## 纯逻辑位置

可单测的函数放在 `src/lib/`：`cron.ts`、`jwt.ts`、`url.ts`、`diff.ts`、`curl.ts`、`color.ts`、`tax.ts`、`mortgage.ts`、`cost.ts`、`units.ts`、`currency.ts`、`mock.ts`、`backup.ts`、`metadata.ts`。组件只负责输入和展示。
