<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：配置 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">⚙️ 数据配置</h3>

        <!-- 数据类型 -->
        <div class="mb-4">
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-2 block">选择数据类型</label>
          <div class="grid grid-cols-2 gap-2">
            <el-button
              v-for="t in dataTypes"
              :key="t.value"
              :type="selectedTypes.includes(t.value) ? 'primary' : ''"
              :plain="!selectedTypes.includes(t.value)"
              size="small"
              @click="toggleType(t.value)"
            >
              {{ t.icon }} {{ t.label }}
            </el-button>
          </div>
        </div>

        <!-- 生成数量 -->
        <div class="mb-4">
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">生成数量: {{ count }}</label>
          <el-slider v-model="count" :min="1" :max="100" />
        </div>

        <!-- 输出格式 -->
        <div class="mb-4">
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">输出格式</label>
          <el-radio-group v-model="outputFormat">
            <el-radio-button label="json">JSON</el-radio-button>
            <el-radio-button label="csv">CSV</el-radio-button>
            <el-radio-button label="sql">SQL</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 表名（SQL格式时） -->
        <div v-if="outputFormat === 'sql'" class="mb-4">
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">表名</label>
          <el-input v-model="tableName" placeholder="mock_data" />
        </div>

        <el-button type="primary" size="large" @click="generate">
          <el-icon><Refresh /></el-icon> 生成数据
        </el-button>
      </div>

      <!-- 右侧：结果 -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">📄 生成结果</h3>
          <el-button v-if="output" size="small" @click="copyOutput">
            <el-icon><DocumentCopy /></el-icon> 复制
          </el-button>
        </div>
        <pre class="p-4 bg-gray-900 text-green-400 rounded-xl text-sm font-mono overflow-auto max-h-96 whitespace-pre-wrap">{{ output || '点击"生成数据"开始' }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Refresh, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const dataTypes = [
  { value: 'name', label: '姓名', icon: '👤' },
  { value: 'phone', label: '手机号', icon: '📱' },
  { value: 'email', label: '邮箱', icon: '📧' },
  { value: 'address', label: '地址', icon: '📍' },
  { value: 'company', label: '公司', icon: '🏢' },
  { value: 'date', label: '日期', icon: '📅' },
  { value: 'number', label: '数字', icon: '🔢' },
  { value: 'uuid', label: 'UUID', icon: '🆔' },
  { value: 'word', label: '随机词', icon: '📝' },
  { value: 'sentence', label: '随机句', icon: '📃' },
]

const selectedTypes = ref<string[]>(['name', 'phone', 'email'])
const count = ref(10)
const outputFormat = ref('json')
const tableName = ref('mock_data')
const output = ref('')

const toggleType = (type: string) => {
  const idx = selectedTypes.value.indexOf(type)
  if (idx >= 0) selectedTypes.value.splice(idx, 1)
  else selectedTypes.value.push(type)
}

// 简单的伪随机生成器
const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomChar = (len: number) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗']
const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋', '军', '杰', '娟', '艳', '涛', '明', '超', '秀兰', '霞', '平']
const companies = ['科技', '网络', '信息', '软件', '智能', '数据', '云计算', '创新', '数码', '电子']
const domains = ['qq.com', '163.com', '126.com', 'gmail.com', 'outlook.com', 'foxmail.com']
const streets = ['中山路', '解放路', '人民路', '建设路', '胜利路', '和平路', '光明路', '新华路']
const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '重庆', '西安']

const generateValue = (type: string) => {
  switch (type) {
    case 'name': return randomFrom(surnames) + randomFrom(names)
    case 'phone': return '1' + randomFrom(['3', '5', '7', '8', '9']) + randomInt(100000000, 999999999)
    case 'email': return randomChar(randomInt(5, 10)) + '@' + randomFrom(domains)
    case 'address': return randomFrom(cities) + randomFrom(streets) + randomInt(1, 200) + '号'
    case 'company': return randomFrom(cities) + randomFrom(companies) + '有限公司'
    case 'date': {
      const d = new Date(2020, 0, 1)
      d.setDate(d.getDate() + randomInt(0, 2000))
      return d.toISOString().split('T')[0]
    }
    case 'number': return randomInt(1, 99999)
    case 'uuid': return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    case 'word': return randomFrom(['系统', '优化', '配置', '部署', '监控', '测试', '开发', '设计', '分析', '管理'])
    case 'sentence': return `这是一条模拟数据，用于${randomFrom(['测试', '开发', '演示'])}目的。`
    default: return ''
  }
}

const generate = () => {
  if (selectedTypes.value.length === 0) {
    ElMessage.warning('请选择至少一种数据类型')
    return
  }

  const rows: Record<string, any>[] = []
  for (let i = 0; i < count.value; i++) {
    const row: Record<string, any> = {}
    for (const type of selectedTypes.value) {
      row[type] = generateValue(type)
    }
    rows.push(row)
  }

  if (outputFormat.value === 'json') {
    output.value = JSON.stringify(rows, null, 2)
  } else if (outputFormat.value === 'csv') {
    const headers = selectedTypes.value.join(',')
    const csvRows = rows.map(r => selectedTypes.value.map(k => r[k]).join(','))
    output.value = [headers, ...csvRows].join('\n')
  } else {
    // SQL INSERT
    const cols = selectedTypes.value.join(', ')
    const sqlRows = rows.map(r => {
      const vals = selectedTypes.value.map(k => `'${r[k]}'`).join(', ')
      return `INSERT INTO ${tableName.value} (${cols}) VALUES (${vals});`
    })
    output.value = sqlRows.join('\n')
  }
}

const copyOutput = () => {
  navigator.clipboard.writeText(output.value)
  ElMessage.success('已复制')
}
</script>
