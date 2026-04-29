import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import FoodPicker from '../views/FoodPicker.vue'
import RandomNumber from '../views/RandomNumber.vue'
import ImageProcessor from '../views/ImageProcessor.vue'
import PasswordBook from '../views/PasswordBook.vue'
import DevTools from '../views/DevTools.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页', icon: 'HomeFilled' },
  },
  {
    path: '/food',
    name: 'FoodPicker',
    component: FoodPicker,
    meta: { title: '今天吃什么', icon: 'Food' },
  },
  {
    path: '/random',
    name: 'RandomNumber',
    component: RandomNumber,
    meta: { title: '随机数生成', icon: 'CircleCheckFilled' },
  },
  {
    path: '/image',
    name: 'ImageProcessor',
    component: ImageProcessor,
    meta: { title: '图片处理', icon: 'Picture' },
  },
  {
    path: '/password',
    name: 'PasswordBook',
    component: PasswordBook,
    meta: { title: '密码本', icon: 'Lock' },
  },
  {
    path: '/devtools',
    name: 'DevTools',
    component: DevTools,
    meta: { title: '开发工具', icon: 'Tools' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 页面标题
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Helper'} - Helper助手`
  next()
})

export default router
