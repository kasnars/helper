<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left: Menu button + Logo -->
        <div class="flex items-center gap-4">
          <!-- Mobile menu button -->
          <button
            @click="appStore.toggleSideMenu"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 lg:hidden"
            aria-label="打开菜单"
          >
            <el-icon :size="24" class="text-gray-700 dark:text-gray-200">
              <Menu />
            </el-icon>
          </button>
          
          <!-- Desktop collapse button -->
          <button
            @click="appStore.toggleSideMenu"
            class="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="切换菜单"
          >
            <el-icon :size="24" class="text-gray-700 dark:text-gray-200">
              <Fold v-if="appStore.sideMenuOpen" />
              <Expand v-else />
            </el-icon>
          </button>
          
          <router-link to="/" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-8 h-8">
              <circle style="fill:#3E4959" cx="256" cy="256" r="256"/>
              <path style="fill:#FFFFFF" d="M294.806,173.475L294.806,173.475c-0.974-1.906-0.733-4.169,0.654-6.213c1.47-2.174,1.794-5.46,1.09-6.834l-2.292-4.489c-0.723-1.414-0.165-3.135,1.252-3.865c1.404-0.717,3.131-0.162,3.848,1.259l2.302,4.489c1.741,3.419,1.12,8.859-1.45,12.658c-0.132,0.202-0.201,0.34-0.238,0.439c0.238,0.185,0.951,0.548,2.425,0.595l9.335,0.304c3.174,0.096,5.662,1.444,6.811,3.696c1.15,2.24,0.789,5.044-0.998,7.677l-5.232,7.736c-0.74,1.09-0.717,1.728-0.651,1.863c0.073,0.132,0.565,0.529,1.889,0.568l9.332,0.294c3.181,0.099,5.672,1.447,6.815,3.69c1.146,2.256,0.786,5.057-1.004,7.693l-5.229,7.736c-0.743,1.09-0.714,1.728-0.647,1.86c0.073,0.149,0.571,0.532,1.883,0.568l9.338,0.304c3.184,0.102,5.662,1.447,6.815,3.69c1.143,2.253,0.783,5.057-1.004,7.683l-5.229,7.736c-0.74,1.097-0.71,1.728-0.641,1.86c0.066,0.142,0.558,0.529,1.886,0.575l9.335,0.294c3.528,0.109,6.227,1.486,7.402,3.772c0.971,1.903,0.737,4.179-0.647,6.217c-1.239,1.823-1.381,6.273,0.271,9.513l29.729,58.203c0.717,1.404,0.155,3.138-1.255,3.861c-1.417,0.717-3.135,0.155-3.861-1.259l-29.729-58.196c-2.481-4.862-2.444-11.591,0.089-15.34c0.135-0.188,0.205-0.344,0.231-0.439c-0.225-0.185-0.948-0.548-2.418-0.595l-9.335-0.291c-3.181-0.096-5.662-1.447-6.818-3.703c-1.143-2.246-0.77-5.047,1.014-7.677l5.229-7.739c0.737-1.1,0.71-1.728,0.641-1.863c-0.066-0.126-0.568-0.525-1.883-0.565l-9.342-0.301c-3.174-0.092-5.662-1.453-6.808-3.7c-1.153-2.249-0.783-5.044,0.998-7.683l5.236-7.733c0.75-1.093,0.714-1.724,0.644-1.863c-0.069-0.132-0.568-0.529-1.883-0.571l-9.332-0.294c-3.184-0.099-5.662-1.444-6.815-3.693c-1.153-2.246-0.793-5.051,1.001-7.69l5.229-7.723c0.747-1.093,0.717-1.741,0.654-1.866c-0.069-0.139-0.571-0.532-1.893-0.565l-9.338-0.297C298.681,177.129,295.976,175.761,294.806,173.475z"/>
              <rect x="338.773" y="286.89" transform="matrix(0.4548 0.8906 -0.8906 0.4548 461.5439 -167.474)" style="fill:#CCCBCA" width="57.569" height="12.684"/>
              <path style="fill:#FFFFFF" d="M361.954,310.477h38.387V127.485l0,0c-9.827,0-19.644,3.743-27.143,11.238c-7.502,7.495-11.244,17.325-11.244,27.149V310.477z"/>
              <rect x="354.965" y="264.489" style="fill:#D9D8D7" width="45.367" height="65.13"/>
              <rect x="389.814" y="173.921" style="fill:#D9D8D7" width="2.441" height="47.986"/>
              <polygon style="fill:#FFFFFF" points="149.805,318.305 127.587,296.104 263.379,180.052 275.727,192.39"/>
              <polygon style="fill:#D9D8D7" points="181.869,292.296 158.888,269.319 127.587,296.104 152.83,321.328"/>
              <rect x="269.675" y="192.38" style="fill:#FFFFFF" width="6.055" height="6.061"/>
              <rect x="263.63" y="198.458" style="fill:#FFFFFF" width="6.055" height="6.052"/>
              <rect x="257.559" y="204.493" style="fill:#FFFFFF" width="6.055" height="6.058"/>
              <rect x="251.508" y="210.548" style="fill:#FFFFFF" width="6.052" height="6.065"/>
              <rect x="245.463" y="216.593" style="fill:#FFFFFF" width="6.058" height="6.061"/>
              <rect x="239.385" y="222.67" style="fill:#FFFFFF" width="6.055" height="6.052"/>
              <rect x="233.34" y="228.715" style="fill:#FFFFFF" width="6.058" height="6.052"/>
              <rect x="227.288" y="234.76" style="fill:#FFFFFF" width="6.048" height="6.058"/>
              <rect x="221.23" y="240.822" style="fill:#FFFFFF" width="6.061" height="6.055"/>
              <rect x="215.172" y="246.883" style="fill:#FFFFFF" width="6.045" height="6.048"/>
              <rect x="209.127" y="252.928" style="fill:#FFFFFF" width="6.055" height="6.055"/>
              <rect x="203.082" y="258.973" style="fill:#FFFFFF" width="6.058" height="6.052"/>
              <rect x="197.004" y="265.051" style="fill:#FFFFFF" width="6.045" height="6.052"/>
              <polygon style="fill:#FFFFFF" points="197.014,277.16 190.966,277.147 190.953,271.096 197.024,271.096"/>
              <rect x="184.908" y="277.141" style="fill:#FFFFFF" width="6.058" height="6.058"/>
              <rect x="125.622" y="173.921" style="fill:#FFFFFF" width="13.963" height="90.568"/>
              <rect x="120.379" y="264.489" style="fill:#D9D8D7" width="24.427" height="36.633"/>
              <path style="fill:#FF6D3B" d="M404.255,291.487c-6.861-6.867-15.859-10.299-24.847-10.299H132.595c-8.998,0-17.993,3.432-24.85,10.299c-6.861,6.857-10.296,15.855-10.296,24.847c0,8.991,3.435,17.989,10.296,24.853c6.857,6.867,15.855,10.296,24.85,10.296h246.814c8.991,0,17.986-3.429,24.847-10.296c6.864-6.864,10.299-15.862,10.299-24.853C414.555,307.342,411.119,298.344,404.255,291.487z"/>
              <path style="fill:#242D3C" d="M390.18,316.337c0,5.956-4.826,10.782-10.775,10.782s-10.785-4.826-10.785-10.782c0-5.939,4.836-10.775,10.785-10.775S390.18,310.398,390.18,316.337z"/>
              <path style="fill:#FFFFFF" d="M384.086,316.337c0,2.586-2.101,4.691-4.681,4.691c-2.59,0-4.694-2.104-4.694-4.691c0-2.58,2.104-4.691,4.694-4.691C381.988,311.646,384.086,313.754,384.086,316.337z"/>
              <path style="fill:#242D3C" d="M143.373,316.337c0,5.956-4.833,10.782-10.782,10.782c-5.952,0-10.782-4.826-10.782-10.782c0-5.939,4.829-10.775,10.782-10.775C138.541,305.562,143.373,310.398,143.373,316.337z"/>
              <path style="fill:#FFFFFF" d="M137.279,316.337c0,2.586-2.104,4.691-4.684,4.691c-2.59,0-4.687-2.104-4.687-4.691c0-2.58,2.098-4.691,4.687-4.691C135.175,311.646,137.279,313.754,137.279,316.337z"/>
            </svg>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Helper
            </span>
          </router-link>
        </div>

        <!-- Right: Search + Theme Toggle -->
        <div class="flex items-center gap-4">
          <!-- Global Search -->
          <div class="relative">
            <el-autocomplete
              v-model="searchQuery"
              :fetch-suggestions="searchTools"
              placeholder="搜索工具..."
              class="w-64"
              :trigger-on-focus="true"
              @select="handleSelect"
              @keyup.enter="handleFirstSelect"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #default="{ item }">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 flex items-center justify-center">
                    <el-icon v-if="item.icon === 'Food'" :size="16" class="text-gray-500"><Food /></el-icon>
                    <el-icon v-else-if="item.icon === 'CircleCheckFilled'" :size="16" class="text-gray-500"><CircleCheckFilled /></el-icon>
                    <el-icon v-else-if="item.icon === 'FullScreen'" :size="16" class="text-gray-500"><FullScreen /></el-icon>
                    <el-icon v-else-if="item.icon === 'ScaleToOriginal'" :size="16" class="text-gray-500"><ScaleToOriginal /></el-icon>
                    <el-icon v-else-if="item.icon === 'Picture'" :size="16" class="text-gray-500"><Picture /></el-icon>
                    <el-icon v-else-if="item.icon === 'DocumentChecked'" :size="16" class="text-gray-500"><DocumentChecked /></el-icon>
                    <el-icon v-else-if="item.icon === 'EditPen'" :size="16" class="text-gray-500"><EditPen /></el-icon>
                    <el-icon v-else-if="item.icon === 'Document'" :size="16" class="text-gray-500"><Document /></el-icon>
                    <el-icon v-else-if="item.icon === 'Search'" :size="16" class="text-gray-500"><Search /></el-icon>
                    <el-icon v-else-if="item.icon === 'Share'" :size="16" class="text-gray-500"><Share /></el-icon>
                    <el-icon v-else-if="item.icon === 'Timer'" :size="16" class="text-gray-500"><Timer /></el-icon>
                    <el-icon v-else-if="item.icon === 'Brush'" :size="16" class="text-gray-500"><Brush /></el-icon>
                    <el-icon v-else-if="item.icon === 'Key'" :size="16" class="text-gray-500"><Key /></el-icon>
                    <el-icon v-else-if="item.icon === 'Sort'" :size="16" class="text-gray-500"><Sort /></el-icon>
                    <el-icon v-else-if="item.icon === 'Postcard'" :size="16" class="text-gray-500"><Postcard /></el-icon>
                    <el-icon v-else-if="item.icon === 'Link'" :size="16" class="text-gray-500"><Link /></el-icon>
                  </div>
                  <div>
                    <div class="text-sm font-medium">{{ item.name }}</div>
                    <div class="text-xs text-gray-500">{{ item.category }}</div>
                  </div>
                </div>
              </template>
            </el-autocomplete>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Menu, FolderOpened, Fold, Expand, Search,
  Food, CircleCheckFilled, FullScreen, ScaleToOriginal,
  Picture, DocumentChecked, EditPen, Document,
  Share, Timer, Brush, Key, Sort, Postcard, Link
} from '@element-plus/icons-vue'
import { useAppStore } from '../../stores'

const appStore = useAppStore()
const router = useRouter()
const searchQuery = ref('')

// 工具搜索数据
const allTools = [
  // 生活工具
  { name: '今天吃什么', category: '生活工具', path: '/life', tab: 'food', icon: 'Food' },
  { name: '随机数生成', category: '生活工具', path: '/life', tab: 'random', icon: 'CircleCheckFilled' },
  { name: '二维码工具', category: '生活工具', path: '/life', tab: 'qrcode', icon: 'FullScreen' },
  { name: '单位换算', category: '生活工具', path: '/life', tab: 'unit', icon: 'ScaleToOriginal' },
  
  // 文件工具
  { name: '图片处理', category: '文件工具', path: '/file', tab: 'image', icon: 'Picture' },
  { name: 'PDF 工具', category: '文件工具', path: '/file', tab: 'pdf', icon: 'DocumentChecked' },
  { name: '在线画板', category: '文件工具', path: '/file', tab: 'whiteboard', icon: 'EditPen' },
  { name: '文字提取', category: '文件工具', path: '/file', tab: 'text', icon: 'Document' },
  { name: '图片水印', category: '文件工具', path: '/file', tab: 'watermark', icon: 'Picture' },
  
  // 开发工具
  { name: '正则测试', category: '开发工具', path: '/devtools', tab: 'regex', icon: 'Search' },
  { name: 'JSON 工具', category: '开发工具', path: '/devtools', tab: 'json', icon: 'Document' },
  { name: 'Base64', category: '开发工具', path: '/devtools', tab: 'base64', icon: 'Share' },
  { name: '时间戳', category: '开发工具', path: '/devtools', tab: 'timestamp', icon: 'Timer' },
  { name: '颜色工具', category: '开发工具', path: '/devtools', tab: 'color', icon: 'Brush' },
  { name: '哈希', category: '开发工具', path: '/devtools', tab: 'hash', icon: 'Key' },
  { name: '文本统计', category: '开发工具', path: '/devtools', tab: 'textstat', icon: 'Document' },
  { name: '进制转换', category: '开发工具', path: '/devtools', tab: 'radix', icon: 'Sort' },
  { name: 'UUID', category: '开发工具', path: '/devtools', tab: 'uuid', icon: 'Postcard' },
  { name: 'JWT 解码', category: '开发工具', path: '/devtools', tab: 'jwt', icon: 'Key' },
  { name: 'URL 编解码', category: '开发工具', path: '/devtools', tab: 'url', icon: 'Link' },
  { name: 'Cron 生成器', category: '开发工具', path: '/devtools', tab: 'cron', icon: 'Timer' },
  { name: 'Markdown 预览', category: '开发工具', path: '/devtools', tab: 'markdown', icon: 'Document' },
]

const searchTools = (queryString: string, cb: Function) => {
  if (!queryString) {
    cb([])
    return
  }
  
  const query = queryString.toLowerCase()
  const results = allTools.filter(tool => 
    tool.name.toLowerCase().includes(query) ||
    tool.category.toLowerCase().includes(query)
  )
  
  cb(results.map(tool => ({
    value: tool.name,
    ...tool,
  })))
}

const handleSelect = (item: any) => {
  navigateToTool(item)
}

const handleFirstSelect = () => {
  // 当按下回车时，如果有搜索结果，跳转到第一个
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    const firstResult = allTools.find(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    )
    if (firstResult) {
      navigateToTool(firstResult)
    }
  }
}

const navigateToTool = (tool: any) => {
  // 跳转到对应页面
  router.push(tool.path)
  
  // 设置对应的 tab
  if (tool.tab) {
    // 使用 sessionStorage 传递 tab 信息
    sessionStorage.setItem('activeTool', tool.tab)
  }
  
  // 清空搜索
  searchQuery.value = ''
}
</script>
