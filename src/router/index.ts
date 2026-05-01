import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import LifeTools from '../views/LifeTools.vue'
import FileTools from '../views/FileTools.vue'
import DevTools from '../views/DevTools.vue'

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
    path: '/file',
    name: 'FileTools',
    component: FileTools,
    meta: { title: '文件工具', icon: 'FolderOpened' },
  },
  {
    path: '/devtools',
    name: 'DevTools',
    component: DevTools,
    meta: { title: '开发工具', icon: 'Tools' },
  },
]

const router = createRouter({
  history: createWebHistory('/help/'),
  routes,
})

// 页面标题
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Helper'} - Helper助手`
  next()
})

export default router
