<template>
  <div class="space-y-6">
    <!-- 搜索 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">HTTP 状态码查询</h3>
      <el-input
        v-model="searchQuery"
        placeholder="搜索状态码或描述..."
        clearable
        :prefix-icon="Search"
      />
    </div>

    <!-- 分类标签 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex flex-wrap gap-2">
        <el-tag
          v-for="category in categories"
          :key="category.value"
          :type="activeCategory === category.value ? '' : 'info'"
          class="cursor-pointer"
          @click="activeCategory = category.value"
        >
          {{ category.label }}
        </el-tag>
      </div>
    </div>

    <!-- 状态码列表 -->
    <div class="space-y-4">
      <div
        v-for="status in filteredStatuses"
        :key="status.code"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            :class="getStatusColor(status.code)"
          >
            {{ status.code }}
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-white text-lg">{{ status.phrase }}</h4>
            <p class="text-gray-600 dark:text-gray-400 mt-1">{{ status.description }}</p>
            <div v-if="status.usage" class="mt-3">
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">使用场景:</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ status.usage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredStatuses.length === 0" class="text-center py-12">
      <el-icon :size="48" class="text-gray-400"><Search /></el-icon>
      <p class="mt-4 text-gray-500 dark:text-gray-400">没有找到匹配的状态码</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

interface HttpStatusCode {
  code: number
  phrase: string
  description: string
  usage?: string
  category: string
}

const searchQuery = ref('')
const activeCategory = ref('all')

const categories = [
  { label: '全部', value: 'all' },
  { label: '1xx 信息', value: '1xx' },
  { label: '2xx 成功', value: '2xx' },
  { label: '3xx 重定向', value: '3xx' },
  { label: '4xx 客户端错误', value: '4xx' },
  { label: '5xx 服务器错误', value: '5xx' },
]

const statusCodes: HttpStatusCode[] = [
  // 1xx
  { code: 100, phrase: 'Continue', description: '服务器已收到请求的初始部分，客户端应继续发送剩余部分', category: '1xx' },
  { code: 101, phrase: 'Switching Protocols', description: '服务器正在切换协议，客户端应使用新的协议重新发送请求', category: '1xx' },
  { code: 102, phrase: 'Processing', description: '服务器已收到请求并正在处理，但尚无响应可用', category: '1xx' },
  { code: 103, phrase: 'Early Hints', description: '服务器在最终响应之前发送一些响应头，用于预加载资源', category: '1xx' },

  // 2xx
  { code: 200, phrase: 'OK', description: '请求成功', usage: 'GET 成功获取资源，PUT/PATCH 成功更新资源', category: '2xx' },
  { code: 201, phrase: 'Created', description: '请求成功并创建了新资源', usage: 'POST 请求成功创建资源时返回', category: '2xx' },
  { code: 202, phrase: 'Accepted', description: '请求已接受但尚未处理完成', usage: '异步任务已接收但未完成时返回', category: '2xx' },
  { code: 204, phrase: 'No Content', description: '请求成功但没有返回内容', usage: 'DELETE 请求成功删除资源时返回', category: '2xx' },
  { code: 206, phrase: 'Partial Content', description: '服务器成功处理了部分 GET 请求', usage: '文件下载断点续传、分页加载', category: '2xx' },

  // 3xx
  { code: 301, phrase: 'Moved Permanently', description: '请求的资源已永久移动到新 URL', usage: '网站域名更换、URL 结构调整', category: '3xx' },
  { code: 302, phrase: 'Found', description: '请求的资源临时位于不同的 URL', usage: '临时维护页面、A/B 测试', category: '3xx' },
  { code: 304, phrase: 'Not Modified', description: '资源未修改，客户端可使用缓存版本', usage: '配合 ETag/Last-Modified 实现缓存', category: '3xx' },
  { code: 307, phrase: 'Temporary Redirect', description: '请求临时重定向，保持原请求方法', usage: '临时重定向且需要保持 POST 方法', category: '3xx' },
  { code: 308, phrase: 'Permanent Redirect', description: '请求永久重定向，保持原请求方法', usage: '永久重定向且需要保持 POST 方法', category: '3xx' },

  // 4xx
  { code: 400, phrase: 'Bad Request', description: '请求语法错误或参数无效', usage: '表单验证失败、参数格式错误', category: '4xx' },
  { code: 401, phrase: 'Unauthorized', description: '请求需要身份验证', usage: '未登录或 Token 过期', category: '4xx' },
  { code: 403, phrase: 'Forbidden', description: '服务器拒绝请求，客户端没有权限', usage: '已登录但权限不足', category: '4xx' },
  { code: 404, phrase: 'Not Found', description: '请求的资源不存在', usage: '访问不存在的页面或 API', category: '4xx' },
  { code: 405, phrase: 'Method Not Allowed', description: '请求方法不被允许', usage: '用 POST 访问只支持 GET 的接口', category: '4xx' },
  { code: 408, phrase: 'Request Timeout', description: '服务器等待请求超时', usage: '网络不稳定导致请求超时', category: '4xx' },
  { code: 409, phrase: 'Conflict', description: '请求与服务器当前状态冲突', usage: '重复创建资源、并发冲突', category: '4xx' },
  { code: 413, phrase: 'Payload Too Large', description: '请求体超过服务器限制', usage: '上传文件过大', category: '4xx' },
  { code: 415, phrase: 'Unsupported Media Type', description: '请求的媒体类型不被支持', usage: '上传不支持的文件格式', category: '4xx' },
  { code: 422, phrase: 'Unprocessable Entity', description: '请求格式正确但语义错误', usage: '业务逻辑验证失败', category: '4xx' },
  { code: 429, phrase: 'Too Many Requests', description: '客户端发送了太多请求', usage: 'API 限流、防止暴力攻击', category: '4xx' },

  // 5xx
  { code: 500, phrase: 'Internal Server Error', description: '服务器遇到意外错误', usage: '服务器代码 Bug、未捕获异常', category: '5xx' },
  { code: 502, phrase: 'Bad Gateway', description: '服务器作为网关收到无效响应', usage: '上游服务不可用', category: '5xx' },
  { code: 503, phrase: 'Service Unavailable', description: '服务器暂时无法处理请求', usage: '服务器维护、过载', category: '5xx' },
  { code: 504, phrase: 'Gateway Timeout', description: '服务器作为网关等待响应超时', usage: '上游服务响应超时', category: '5xx' },
]

const filteredStatuses = computed(() => {
  let result = statusCodes

  if (activeCategory.value !== 'all') {
    result = result.filter(s => s.category === activeCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.code.toString().includes(query) ||
      s.phrase.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    )
  }

  return result
})

const getStatusColor = (code: number) => {
  if (code < 200) return 'bg-blue-500'
  if (code < 300) return 'bg-green-500'
  if (code < 400) return 'bg-yellow-500'
  if (code < 500) return 'bg-orange-500'
  return 'bg-red-500'
}
</script>
