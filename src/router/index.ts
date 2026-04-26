import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import FoodPicker from '../views/FoodPicker.vue'
import RandomNumber from '../views/RandomNumber.vue'

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
