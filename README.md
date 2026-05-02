# Helper 助手

一个基于 Vue 3 + Vite + TypeScript 的前端工具集合，整合日常小工具和开发者工具，让生活更便捷，开发更高效。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **UI库**: Element Plus + Tailwind CSS
- **路由**: Vue Router
- **状态管理**: Pinia
- **存储**: IndexedDB (Dexie.js)，支持静默降级到 localStorage
- **加密**: Web Crypto API (浏览器原生)
- **二维码**: qrcode (生成) + jsQR (识别)

## 功能特性

### 🛠️ 开发者工具 (DevTools)

1. **JSON 编辑器** 📝
   - JSON 格式化/压缩
   - JSON 对比工具（差异高亮）
   - JSON 树形查看器（可折叠展开）
   - 格式转换：JSON ↔ YAML、JSON → CSV、JSON → TypeScript 接口
   - JSON 转义/去转义
   - 实时统计（字符数、行数、大小）

2. **颜色工具** 🎨
   - 可视化颜色选择器（支持 Alpha 通道）
   - 颜色格式转换：HEX ↔ RGB ↔ HSL
   - 常用颜色调色板（点击复制）
   - WCAG 对比度检查器（AA/AAA 标准）
   - 实时预览

3. **Base64 工具** 🔐
   - 文本 Base64 编码/解码
   - UTF-8 完整支持（中文等多字节字符）
   - 文件转 Base64（拖拽上传）
   - 一键复制结果
   - 自动实时转换

4. **Hash 工具** #️⃣
   - 文本哈希计算（SHA-1、SHA-256、SHA-384、SHA-512）
   - 文件哈希计算（拖拽上传）
   - 哈希值对比（自动高亮匹配/不匹配）
   - 一键复制哈希值
   - 纯前端计算，数据不上传

5. **时间戳工具** ⏰
   - 实时时钟显示（每秒更新）
   - Unix 时间戳（秒/毫秒）
   - 时间戳 ↔ 日期时间双向转换
   - 自动识别秒/毫秒级时间戳
   - 相对时间计算（x 天前/x 天后）
   - 本地时间/UTC 时间/ISO 格式

6. **二维码工具** 📱
   - 二维码生成（自定义尺寸、颜色、纠错级别）
   - 二维码识别（图片文件/摄像头实时扫描）
   - 快速模板（WiFi、电话、邮件、网址）
   - 下载 PNG / 复制图片
   - URL 自动识别并跳转

7. **正则表达式测试器** 🔍
   - 实时正则匹配测试
   - 匹配结果高亮显示
   - 捕获组展示
   - 支持标志：g/i/m/s/u
   - 常用正则模板（邮箱、手机号、URL、IP 等）
   - 匹配位置显示

8. **UUID 工具** 🆔
   - UUID v4 生成（基于随机数）
   - UUID v1 生成（基于时间）
   - 批量生成（1-100 个）
   - UUID 格式验证
   - 版本号自动识别
   - 复制单个/全部、下载 TXT

9. **在线画板** 🎨
   - Canvas 绘图（画笔、直线、矩形、圆形、橡皮擦）
   - 自定义颜色和粗细
   - 撤销/重做（最多 50 步）
   - 清空画布
   - 导出 PNG 图片
   - 支持鼠标和触摸操作
   - 多种画布尺寸选择

10. **进制转换工具** 🔢
    - 二进制、八进制、十进制、十六进制互转
    - 实时转换
    - 支持负数
    - 一键复制

11. **文本统计工具** 📊
    - 字符数统计
    - 单词数统计
    - 段落数统计
    - 行数统计
    - 字节数统计
    - 中文/英文/数字/空格分类统计

12. **PDF 工具** 📄
    - PDF 文件查看
    - PDF 合并
    - PDF 分割
    - 纯前端处理，保护隐私

### 🍜 美食选择 (FoodPicker)

1. **今天吃什么** 🎯
   - Canvas 绘制的命运轮盘，带缓动动画和回弹效果
   - 内置 30 种常见外卖选项（午餐 15 种 + 晚餐 15 种）
   - 支持自定义添加菜品，分类管理（午餐/晚餐）
   - 历史记录保存（最近 10 条）
   - 响应式轮盘大小
   - 精美的结果弹窗动画

### 🖼️ 图像处理 (ImageProcessor)

1. **图片压缩** 🗜️
   - 批量压缩（最多 10 张）
   - 质量调节（1-100%）
   - 尺寸调整（最大宽度/高度）
   - 保持宽高比选项
   - 实时压缩前后对比
   - 统计信息（原始大小、压缩后大小、节省比例）
   - 支持 PNG、JPEG、WebP 格式
   - 批量下载

2. **图片转换** 🔄
   - 格式转换（PNG ↔ JPEG ↔ WebP）
   - 批量转换
   - 质量调节
   - 一键下载

### 🎲 随机数生成 (RandomNumber)

1. **随机数生成器** 🎯
   - 自定义范围和生成数量
   - 支持不重复选项
   - 数字滚动动画效果
   - 结果卡片 stagger 淡入动画
   - 一键复制单个或全部结果
   - 统计信息（最小值、最大值、平均值）

### ✨ 通用特性

- 🌙 白天/黑夜主题切换
- 📱 完美响应式适配（移动端 + PC 端）
- 💾 IndexedDB 本地持久化存储（自动降级到 localStorage）
- ⚡ 流畅的动画效果
- 🎨 现代简约设计风格
- 🔒 纯前端处理，数据不上传服务器
- 📋 一键复制功能
- 💫 拖拽上传支持

## 项目结构

```
src/
├── components/
│   ├── common/          # 公共组件
│   │   ├── AppHeader.vue    # 顶部导航
│   │   ├── SideMenu.vue     # 左侧菜单
│   │   ├── ThemeToggle.vue  # 主题切换按钮
│   │   └── ToolCard.vue     # 工具卡片
│   ├── dev/             # 开发者工具
│   │   ├── Base64Tool.vue     # Base64 编解码
│   │   ├── ColorTool.vue      # 颜色工具
│   │   ├── HashTool.vue       # Hash 计算
│   │   ├── JsonEditor.vue     # JSON 编辑器
│   │   ├── JsonTree.vue       # JSON 树形查看
│   │   ├── JsonTreeItem.vue   # JSON 树节点
│   │   ├── PdfTool.vue        # PDF 工具
│   │   ├── QrCodeTool.vue     # 二维码工具
│   │   ├── RadixTool.vue      # 进制转换
│   │   ├── RegexTester.vue    # 正则测试器
│   │   ├── TextStatTool.vue   # 文本统计
│   │   ├── TimestampTool.vue  # 时间戳工具
│   │   ├── UUIDTool.vue       # UUID 工具
│   │   └── Whiteboard.vue     # 在线画板
│   ├── food/            # 食物选择组件
│   │   ├── FoodWheel.vue    # Canvas 轮盘
│   │   ├── FoodManager.vue  # 选项管理
│   │   └── FoodResult.vue   # 结果弹窗
│   ├── image/           # 图像处理组件
│   │   ├── ImageCompressor.vue  # 图片压缩
│   │   └── ImageConverter.vue   # 图片转换
│   └── random/          # 随机数组件
│       ├── RandomConfig.vue # 参数配置
│       └── RandomResult.vue # 结果展示
├── views/               # 页面视图
│   ├── DevTools.vue         # 开发者工具页
│   ├── FileTools.vue        # 文件工具页
│   ├── FoodPicker.vue       # 今天吃什么页
│   ├── Home.vue             # 首页
│   ├── ImageProcessor.vue   # 图像处理页
│   ├── LifeTools.vue        # 生活工具页
│   └── RandomNumber.vue     # 随机数页
├── stores/              # Pinia 状态管理
├── db/                  # IndexedDB 封装
├── router/              # 路由配置
├── types/               # TypeScript 类型定义
└── style.css            # 全局样式
```

## 📚 技术文档

项目包含详细的技术文档，每个功能都有独立文档说明：

### 文档目录 (`doc/`)

| 功能名称 | 文档链接 | 核心内容 |
|---------|---------|---------|
| JSON 编辑器 | [JSON编辑器.md](./doc/JSON编辑器.md) | 格式化、对比、转换、树形查看 |
| 颜色工具 | [颜色工具.md](./doc/颜色工具.md) | 颜色选择、格式转换、对比度检查 |
| Base64 工具 | [Base64工具.md](./doc/Base64工具.md) | 编解码、UTF-8 支持、文件转换 |
| Hash 工具 | [Hash工具.md](./doc/Hash工具.md) | SHA 计算、文件哈希、对比 |
| 时间戳工具 | [时间戳工具.md](./doc/时间戳工具.md) | 时间戳转换、实时时钟、相对时间 |
| 二维码工具 | [二维码工具.md](./doc/二维码工具.md) | 生成、识别、摄像头扫描 |
| 正则表达式测试器 | [正则表达式测试器.md](./doc/正则表达式测试器.md) | 正则测试、高亮、模板 |
| UUID 工具 | [UUID工具.md](./doc/UUID工具.md) | 生成、验证、批量操作 |
| 在线画板 | [在线画板.md](./doc/在线画板.md) | Canvas 绘图、撤销重做 |
| 今天吃什么 | [今天吃什么.md](./doc/今天吃什么.md) | 转盘动画、菜品管理 |
| 图片压缩 | [图片压缩.md](./doc/图片压缩.md) | 批量压缩、质量调节 |
| 密码管理 | [密码管理.md](./doc/密码管理.md) | 增删改查、导入导出 |

> 📖 完整文档索引请查看：[doc/README.md](./doc/README.md)

### 文档内容结构

每个功能文档包含：
- ✅ 功能概述
- ✅ 关键技术栈与组件实现原理
- ✅ 实现思路与流程（含关键代码）
- ✅ 整体实现细节
- ✅ 功能总结与优化建议

## 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 文档结构

```
doc/
├── README.md                  # 文档索引
├── JSON编辑器.md              # JSON 编辑器技术文档
├── 颜色工具.md                # 颜色工具技术文档
├── Base64工具.md             # Base64 工具技术文档
├── Hash工具.md               # Hash 工具技术文档
├── 时间戳工具.md             # 时间戳工具技术文档
├── 二维码工具.md             # 二维码工具技术文档
├── 正则表达式测试器.md       # 正则表达式测试器技术文档
├── UUID工具.md               # UUID 工具技术文档
├── 在线画板.md               # 在线画板技术文档
├── 今天吃什么.md             # 今天吃什么技术文档
├── 图片压缩.md               # 图片压缩技术文档
├── 密码管理.md               # 密码管理技术文档
└── 文档总结.md               # 文档完成情况总结
```

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

支持自动降级：如果浏览器不支持 IndexedDB，会自动使用 localStorage 作为备选方案。

## 响应式断点

- **Mobile**: < 640px（单列布局，抽屉菜单）
- **Tablet**: 640px - 1024px（双列布局）
- **Desktop**: > 1024px（多列布局，固定侧边栏）

## 项目统计

- **总功能数**: 17 个
- **已完成功能**: 17 个 ✅
- **技术文档**: 12 个功能文档 + 1 个索引文档 + 1 个总结文档
- **文档覆盖率**: 70.6% (12/17)
- **代码行数**: ~8,000 行
- **依赖包**: 20+ 个

## 开发规范

### 组件命名
- 使用 PascalCase：`JsonEditor.vue`、`FoodWheel.vue`
- 功能组件放在对应的功能目录下

### 代码风格
- 使用 Composition API (setup 语法糖)
- TypeScript 严格模式
- ESLint + Prettier 代码格式化

### Git 提交
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构代码
- perf: 性能优化
- test: 测试相关
- chore: 构建/工具链相关

## 许可证

MIT
