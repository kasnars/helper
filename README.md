# Helper 助手

一个基于 Vue 3 + Vite + TypeScript 的前端工具集合，整合日常小工具，让生活更便捷。

## 技术栈

- **框架**: Vue 3 + Vite
- **语言**: TypeScript
- **UI库**: Element Plus + Tailwind CSS
- **路由**: Vue Router
- **状态管理**: Pinia
- **存储**: IndexedDB (Dexie.js)，支持静默降级到 localStorage

## 功能特性

### ✅ 已实现功能

1. **今天吃什么** 🍜
   - Canvas 绘制的命运轮盘，带缓动动画和回弹效果
   - 内置 30 种常见外卖选项（午餐 15 种 + 晚餐 15 种）
   - 支持自定义添加菜品，分类管理
   - 历史记录保存（最近 10 条）
   - 响应式轮盘大小

2. **随机数生成器** 🎲
   - 自定义范围和生成数量
   - 支持不重复选项
   - 数字滚动动画效果
   - 结果卡片 stagger 淡入动画
   - 一键复制单个或全部结果
   - 统计信息（最小值、最大值、平均值）

### 通用特性

- 🌙 白天/黑夜主题切换
- 📱 完美响应式适配（移动端 + PC 端）
- 💾 IndexedDB 本地持久化存储（自动降级到 localStorage）
- ⚡ 流畅的动画效果
- 🎨 现代简约设计风格

## 项目结构

```
src/
├── components/
│   ├── common/          # 公共组件
│   │   ├── AppHeader.vue    # 顶部导航
│   │   ├── SideMenu.vue     # 左侧菜单
│   │   ├── ThemeToggle.vue  # 主题切换按钮
│   │   └── ToolCard.vue     # 工具卡片
│   ├── food/            # 食物选择组件
│   │   ├── FoodWheel.vue    # Canvas 轮盘
│   │   ├── FoodManager.vue  # 选项管理
│   │   └── FoodResult.vue   # 结果弹窗
│   └── random/          # 随机数组件
│       ├── RandomConfig.vue # 参数配置
│       └── RandomResult.vue # 结果展示
├── views/               # 页面视图
│   ├── Home.vue
│   ├── FoodPicker.vue
│   └── RandomNumber.vue
├── stores/              # Pinia 状态管理
├── db/                  # IndexedDB 封装
├── router/              # 路由配置
└── style.css            # 全局样式
```

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

## 内置外卖选项

### 午餐（15种）
盖浇饭、黄焖鸡米饭、兰州牛肉面、东北饺子、扬州炒饭、螺蛳粉、重庆酸辣粉、重庆小面、云南过桥米线、日式豚骨拉面、汉堡套餐、三明治轻食、披萨、韩式炸鸡、轻食沙拉碗

### 晚餐（15种）
麻辣烫、火锅冒菜、冷锅串串、北京烤鸭套餐、酸菜鱼、日式寿司套餐、石锅拌饭、墨西哥鸡肉卷、日式咖喱饭、番茄肉酱意面、麻辣小龙虾、烧烤撸串、鲜肉馄饨、皮蛋瘦肉粥套餐、麻辣香锅

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

## 许可证

MIT
