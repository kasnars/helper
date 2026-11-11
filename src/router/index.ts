import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载 - 按需加载组件
const Home = () => import('../views/Home.vue')
const LifeTools = () => import('../views/LifeTools.vue')
const OtherTools = () => import('../views/OtherTools.vue')
const DevTools = () => import('../views/DevTools.vue')
const TextTools = () => import('../views/TextTools.vue')
const UtilityTools = () => import('../views/UtilityTools.vue')
const ImageTools = () => import('../views/ImageTools.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页', icon: 'HomeFilled', subtitle: '' },
  },
  {
    path: '/life',
    name: 'LifeTools',
    component: LifeTools,
    meta: { title: '生活工具', icon: 'Star', toolPage: 'life', subtitle: '计时、记账、税费和日子，都算在本地' },
  },
  {
    path: '/imagetools',
    name: 'ImageTools',
    component: ImageTools,
    meta: { title: '图片工具', icon: 'Picture', toolPage: 'image', subtitle: '裁剪、水印、拼接、识别，图片不会上传' },
  },
  {
    path: '/utility',
    name: 'UtilityTools',
    component: UtilityTools,
    meta: { title: '实用工具', icon: 'Suitcase', toolPage: 'utility', subtitle: '换算、生成、估算和备份' },
  },
  {
    path: '/other',
    name: 'OtherTools',
    component: OtherTools,
    meta: { title: '其他工具', icon: 'More', toolPage: 'other', subtitle: '二维码、画板、PDF 和其他小工具' },
  },
  {
    path: '/texttools',
    name: 'TextTools',
    component: TextTools,
    meta: { title: '文本工具', icon: 'Note', toolPage: 'text', subtitle: '编辑、对比和整理文本' },
  },
  {
    path: '/devtools',
    name: 'DevTools',
    component: DevTools,
    meta: { title: '开发工具', icon: 'Tools', toolPage: 'dev', toolGroup: 'format', subtitle: '格式化、转换和接口调试' },
  },
  {
    path: '/securitytools',
    name: 'SecurityTools',
    component: DevTools,
    meta: { title: '编码与安全', icon: 'Lock', toolPage: 'dev', toolGroup: 'encode', subtitle: '编码、哈希和令牌' },
  },
  {
    path: '/webtools',
    name: 'WebTools',
    component: DevTools,
    meta: { title: 'Web 与 CSS', icon: 'Brush', toolPage: 'dev', toolGroup: 'css', subtitle: '颜色、阴影、渐变和布局' },
  },
  {
    path: '/systemtools',
    name: 'SystemTools',
    component: DevTools,
    meta: { title: '系统与网络', icon: 'Monitor', toolPage: 'dev', toolGroup: 'system', subtitle: '时间、进制、命令和网络计算' },
  },
]

const router = createRouter({
  history: createWebHistory('/helper/'),
  routes,
})

// 页面标题
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Helper'} - Helper助手`
  next()
})

export default router
