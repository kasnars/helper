<template>
  <div class="space-y-6">
    <!-- 输入 -->
    <div>
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">🔍 输入正则表达式</h3>
      <div class="flex gap-2">
        <el-input
          v-model="regexInput"
          placeholder="例如：^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
          size="large"
          class="font-mono"
          @input="visualize"
        />
      </div>
      <div class="mt-2 flex gap-2 flex-wrap">
        <el-button size="small" @click="setRegex('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')">邮箱</el-button>
        <el-button size="small" @click="setRegex('^1[3-9]\\d{9}$')">手机号</el-button>
        <el-button size="small" @click="setRegex('^\\d{4}-\\d{2}-\\d{2}$')">日期</el-button>
        <el-button size="small" @click="setRegex('^(https?:\\/\\/)?[\\w.-]+\\.[a-zA-Z]{2,}.*$')">URL</el-button>
        <el-button size="small" @click="setRegex('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}$')">强密码</el-button>
      </div>
    </div>

    <!-- 可视化 -->
    <div v-if="nodes.length > 0">
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📊 结构可视化</h3>
      <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-x-auto">
        <svg :width="svgWidth" :height="svgHeight" class="min-w-full">
          <!-- 连线 -->
          <line
            v-for="(edge, i) in edges"
            :key="'e' + i"
            :x1="edge.x1"
            :y1="edge.y1"
            :x2="edge.x2"
            :y2="edge.y2"
            stroke="#6B7280"
            stroke-width="2"
            marker-end="url(#arrowhead)"
          />
          <!-- 节点 -->
          <g v-for="(node, i) in nodes" :key="'n' + i">
            <rect
              :x="node.x - node.width / 2"
              :y="node.y - 20"
              :width="node.width"
              :height="40"
              :rx="node.type === 'group' ? 8 : 4"
              :fill="nodeColor(node.type)"
              stroke="#374151"
              stroke-width="1"
            />
            <text
              :x="node.x"
              :y="node.y + 5"
              text-anchor="middle"
              fill="white"
              font-size="12"
              font-family="monospace"
            >
              {{ node.label }}
            </text>
          </g>
          <!-- 箭头定义 -->
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>

    <!-- 解析说明 -->
    <div v-if="tokens.length > 0">
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📖 Token 解析</h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(token, i) in tokens"
          :key="i"
          class="px-3 py-2 rounded-lg border text-sm"
          :class="tokenClass(token.type)"
        >
          <span class="font-mono font-bold">{{ token.value }}</span>
          <span class="ml-2 text-xs opacity-75">{{ token.desc }}</span>
        </div>
      </div>
    </div>

    <!-- 测试匹配 -->
    <div v-if="regexInput">
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">🧪 测试匹配</h3>
      <el-input
        v-model="testString"
        placeholder="输入测试字符串"
        @input="testMatch"
      />
      <div v-if="testResult !== null" class="mt-2 p-3 rounded-lg" :class="testResult ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'">
        <span v-if="testResult" class="text-green-700 dark:text-green-300">✓ 匹配成功</span>
        <span v-else class="text-red-700 dark:text-red-300">✗ 不匹配</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const regexInput = ref('')
const testString = ref('')
const testResult = ref<boolean | null>(null)
const tokens = ref<{ value: string; type: string; desc: string }[]>([])
const nodes = ref<{ x: number; y: number; width: number; label: string; type: string }[]>([])
const edges = ref<{ x1: number; y1: number; x2: number; y2: number }[]>([])
const svgWidth = ref(600)
const svgHeight = ref(200)

const setRegex = (r: string) => {
  regexInput.value = r
  visualize()
}

const visualize = () => {
  testResult.value = null
  if (!regexInput.value) {
    tokens.value = []
    nodes.value = []
    edges.value = []
    return
  }

  // 解析token
  tokens.value = parseTokens(regexInput.value)

  // 生成节点和边
  const result = buildGraph(regexInput.value)
  nodes.value = result.nodes
  edges.value = result.edges
  svgWidth.value = Math.max(600, result.maxX + 100)
  svgHeight.value = result.maxY + 60
}

const parseTokens = (regex: string) => {
  const result: { value: string; type: string; desc: string }[] = []
  let i = 0
  while (i < regex.length) {
    const c = regex[i]
    if (c === '\\') {
      const next = regex[i + 1] || ''
      const desc: Record<string, string> = {
        d: '数字', D: '非数字', w: '单词字符', W: '非单词字符',
        s: '空白', S: '非空白', b: '单词边界',
      }
      result.push({ value: '\\' + next, type: 'escape', desc: desc[next] || `字符 ${next}` })
      i += 2
    } else if (c === '^') {
      result.push({ value: '^', type: 'anchor', desc: '行首' })
      i++
    } else if (c === '$') {
      result.push({ value: '$', type: 'anchor', desc: '行尾' })
      i++
    } else if (c === '.') {
      result.push({ value: '.', type: 'wildcard', desc: '任意字符' })
      i++
    } else if ('*+?'.includes(c)) {
      const desc: Record<string, string> = { '*': '0或多次', '+': '1或多次', '?': '0或1次' }
      result.push({ value: c, type: 'quantifier', desc: desc[c] })
      i++
    } else if (c === '{') {
      const match = regex.substring(i).match(/^\{(\d+)(?:,(\d*))?\}/)
      if (match) {
        const label = match[2] !== undefined ? `{${match[1]},${match[2] || '∞'}}` : `{${match[1]}}`
        result.push({ value: label, type: 'quantifier', desc: '重复次数' })
        i += match[0].length
      } else {
        result.push({ value: c, type: 'literal', desc: '字符' })
        i++
      }
    } else if (c === '[') {
      const match = regex.substring(i).match(/^\[([^\]]*)\]/)
      if (match) {
        result.push({ value: match[0], type: 'charclass', desc: '字符类' })
        i += match[0].length
      } else {
        result.push({ value: c, type: 'literal', desc: '字符' })
        i++
      }
    } else if (c === '(') {
      result.push({ value: '(', type: 'group-start', desc: '分组开始' })
      i++
    } else if (c === ')') {
      result.push({ value: ')', type: 'group-end', desc: '分组结束' })
      i++
    } else if (c === '|') {
      result.push({ value: '|', type: 'alternation', desc: '或' })
      i++
    } else {
      result.push({ value: c, type: 'literal', desc: '字符' })
      i++
    }
  }
  return result
}

const buildGraph = (regex: string) => {
  const nodes: { x: number; y: number; width: number; label: string; type: string }[] = []
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = []
  let x = 60
  const y = 80
  let maxX = 60

  // 起始节点
  nodes.push({ x, y, width: 50, label: 'START', type: 'anchor' })
  x += 80

  const tokens = parseTokens(regex)
  for (const token of tokens) {
    const w = Math.max(40, token.value.length * 12 + 20)
    nodes.push({ x, y, width: w, label: token.value, type: token.type })
    edges.push({ x1: x - w / 2 - 10, y1: y, x2: x - w / 2, y2: y })
    x += w + 30
    maxX = Math.max(maxX, x)
  }

  // 结束节点
  nodes.push({ x, y, width: 40, label: 'END', type: 'anchor' })
  edges.push({ x1: x - 40, y1: y, x2: x - 20, y2: y })

  return { nodes, edges, maxX, maxY: y }
}

const nodeColor = (type: string) => {
  const colors: Record<string, string> = {
    anchor: '#6366F1',
    escape: '#10B981',
    wildcard: '#F59E0B',
    quantifier: '#EF4444',
    charclass: '#8B5CF6',
    'group-start': '#3B82F6',
    'group-end': '#3B82F6',
    alternation: '#EC4899',
    literal: '#6B7280',
  }
  return colors[type] || '#6B7280'
}

const tokenClass = (type: string) => {
  const classes: Record<string, string> = {
    anchor: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700',
    escape: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
    wildcard: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
    quantifier: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    charclass: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
    'group-start': 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    'group-end': 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    alternation: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700',
    literal: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
  }
  return classes[type] || ''
}

const testMatch = () => {
  try {
    const regex = new RegExp(regexInput.value)
    testResult.value = regex.test(testString.value)
  } catch {
    testResult.value = null
  }
}
</script>
