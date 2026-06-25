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
    meta: { title: '首页', icon: 'HomeFilled' },
  },
  {
    path: '/life',
    name: 'LifeTools',
    component: LifeTools,
    meta: { title: '生活工具', icon: 'Star' },
  },
  {
    path: '/imagetools',
    name: 'ImageTools',
    component: ImageTools,
    meta: { title: '图片工具', icon: 'Picture' },
  },
  {
    path: '/utility',
    name: 'UtilityTools',
    component: UtilityTools,
    meta: { title: '实用工具', icon: 'Suitcase' },
  },
  {
    path: '/other',
    name: 'OtherTools',
    component: OtherTools,
    meta: { title: '其他工具', icon: 'More' },
  },
  {
    path: '/texttools',
    name: 'TextTools',
    component: TextTools,
    meta: { title: '文本工具', icon: 'Note' },
  },
  {
    path: '/devtools',
    name: 'DevTools',
    component: DevTools,
    meta: { title: '开发工具', icon: 'Tools' },
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
