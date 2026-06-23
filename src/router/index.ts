import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import LifeTools from '../views/LifeTools.vue'
import OtherTools from '../views/OtherTools.vue'
import DevTools from '../views/DevTools.vue'
import TextTools from '../views/TextTools.vue'
import UtilityTools from '../views/UtilityTools.vue'
import ImageTools from '../views/ImageTools.vue'

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
