<template>
  <div class="space-y-6">
    <!-- Toolbar -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">添加节点:</span>
          <el-button size="small" @click="addNode('start')">开始</el-button>
          <el-button size="small" @click="addNode('process')">处理</el-button>
          <el-button size="small" @click="addNode('decision')">判断</el-button>
          <el-button size="small" @click="addNode('io')">输入/输出</el-button>
          <el-button size="small" @click="addNode('end')">结束</el-button>
        </div>
        <el-divider direction="vertical" />
        <el-button size="small" :disabled="!selectedNode && !selectedEdge" @click="deleteSelected">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
        <el-button size="small" :disabled="historyIndex < 1" @click="undo">撤销</el-button>
        <el-button size="small" :disabled="historyIndex >= history.length - 1" @click="redo">重做</el-button>
        <el-divider direction="vertical" />
        <el-button size="small" @click="clearAll">清空</el-button>
        <el-button size="small" type="primary" @click="exportPNG">
          <el-icon><Download /></el-icon> 导出 PNG
        </el-button>
        <el-button size="small" @click="exportSVG">
          <el-icon><Download /></el-icon> 导出 SVG
        </el-button>
      </div>
    </div>

    <!-- Editor Area -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-hidden">
      <div class="flex gap-4">
        <!-- Canvas -->
        <div class="flex-1 overflow-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900" style="height: 500px;">
          <svg
            ref="svgEl"
            :width="svgWidth"
            :height="svgHeight"
            class="cursor-default"
            @mousedown="onSvgMouseDown"
            @mousemove="onSvgMouseMove"
            @mouseup="onSvgMouseUp"
            @dblclick="onSvgDblClick"
          >
            <!-- Grid -->
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="0.5" class="dark:stroke-gray-700" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <!-- Edges -->
            <g v-for="edge in edges" :key="edge.id">
              <path
                :d="getEdgePath(edge)"
                fill="none"
                :stroke="selectedEdge === edge.id ? '#3b82f6' : '#6b7280'"
                :stroke-width="selectedEdge === edge.id ? 3 : 2"
                marker-end="url(#arrowhead)"
                class="cursor-pointer"
                @mousedown.stop="selectEdge(edge.id)"
              />
              <text
                v-if="edge.label"
                :x="getEdgeLabelPos(edge).x"
                :y="getEdgeLabelPos(edge).y"
                text-anchor="middle"
                dominant-baseline="middle"
                class="text-xs fill-gray-600 dark:fill-gray-400 pointer-events-none"
              >{{ edge.label }}</text>
            </g>

            <!-- Arrow marker -->
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>

            <!-- Temp edge while dragging -->
            <path
              v-if="isConnecting && tempEdgeEnd"
              :d="getTempEdgePath()"
              fill="none"
              stroke="#3b82f6"
              stroke-width="2"
              stroke-dasharray="5,5"
            />

            <!-- Nodes -->
            <g
              v-for="node in nodes"
              :key="node.id"
              :transform="`translate(${node.x}, ${node.y})`"
              class="cursor-move"
              @mousedown.stop="onNodeMouseDown($event, node)"
            >
              <!-- Start/End (rounded rect) -->
              <rect
                v-if="node.type === 'start' || node.type === 'end'"
                :x="-nodeWidth / 2"
                :y="-nodeHeight / 2"
                :width="nodeWidth"
                :height="nodeHeight"
                :rx="nodeHeight / 2"
                :fill="node.type === 'start' ? '#dcfce7' : '#fee2e2'"
                :stroke="selectedNode === node.id ? '#3b82f6' : '#9ca3af'"
                :stroke-width="selectedNode === node.id ? 3 : 1.5"
                class="dark:fill-green-900/30 dark:stroke-gray-500"
              />
              <!-- Process (rectangle) -->
              <rect
                v-else-if="node.type === 'process'"
                :x="-nodeWidth / 2"
                :y="-nodeHeight / 2"
                :width="nodeWidth"
                :height="nodeHeight"
                rx="8"
                fill="#dbeafe"
                :stroke="selectedNode === node.id ? '#3b82f6' : '#9ca3af'"
                :stroke-width="selectedNode === node.id ? 3 : 1.5"
                class="dark:fill-blue-900/30 dark:stroke-gray-500"
              />
              <!-- Decision (diamond) -->
              <polygon
                v-else-if="node.type === 'decision'"
                :points="diamondPoints"
                fill="#fef3c7"
                :stroke="selectedNode === node.id ? '#3b82f6' : '#9ca3af'"
                :stroke-width="selectedNode === node.id ? 3 : 1.5"
                class="dark:fill-yellow-900/30 dark:stroke-gray-500"
              />
              <!-- IO (parallelogram) -->
              <polygon
                v-else-if="node.type === 'io'"
                :points="parallelogramPoints"
                fill="#e0e7ff"
                :stroke="selectedNode === node.id ? '#3b82f6' : '#9ca3af'"
                :stroke-width="selectedNode === node.id ? 3 : 1.5"
                class="dark:fill-indigo-900/30 dark:stroke-gray-500"
              />

              <!-- Connection points -->
              <circle
                v-if="selectedNode === node.id"
                :cx="0" :cy="-nodeHeight / 2"
                r="6" fill="#3b82f6" class="cursor-crosshair"
                @mousedown.stop="startConnect(node, 'top')"
              />
              <circle
                v-if="selectedNode === node.id"
                :cx="0" :cy="nodeHeight / 2"
                r="6" fill="#3b82f6" class="cursor-crosshair"
                @mousedown.stop="startConnect(node, 'bottom')"
              />
              <circle
                v-if="selectedNode === node.id"
                :cx="-nodeWidth / 2" :cy="0"
                r="6" fill="#3b82f6" class="cursor-crosshair"
                @mousedown.stop="startConnect(node, 'left')"
              />
              <circle
                v-if="selectedNode === node.id"
                :cx="nodeWidth / 2" :cy="0"
                r="6" fill="#3b82f6" class="cursor-crosshair"
                @mousedown.stop="startConnect(node, 'right')"
              />

              <!-- Label -->
              <text
                text-anchor="middle"
                dominant-baseline="middle"
                class="text-sm select-none pointer-events-none fill-gray-800 dark:fill-gray-200"
                :font-weight="node.type === 'start' || node.type === 'end' ? 'bold' : 'normal'"
              >{{ node.label }}</text>
            </g>
          </svg>
        </div>

        <!-- Properties Panel -->
        <div class="w-56 flex-shrink-0 space-y-4">
          <div v-if="selectedNodeObj" class="space-y-3">
            <h4 class="font-semibold text-sm text-gray-900 dark:text-white">节点属性</h4>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">文字</label>
              <el-input v-model="selectedNodeObj.label" size="small" @input="saveHistory" />
            </div>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">类型</label>
              <el-tag size="small">{{ nodeTypeLabel(selectedNodeObj.type) }}</el-tag>
            </div>
          </div>
          <div v-else-if="selectedEdgeObj" class="space-y-3">
            <h4 class="font-semibold text-sm text-gray-900 dark:text-white">连线属性</h4>
            <div>
              <label class="text-xs text-gray-500 dark:text-gray-400">标签</label>
              <el-input v-model="selectedEdgeObj.label" size="small" placeholder="如: 是/否" @input="saveHistory" />
            </div>
          </div>
          <div v-else>
            <h4 class="font-semibold text-sm text-gray-900 dark:text-white">操作提示</h4>
            <ul class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <li>• 点击按钮添加节点</li>
              <li>• 拖拽移动节点</li>
              <li>• 选中节点后拖拽蓝点连线</li>
              <li>• 双击节点编辑文字</li>
              <li>• 点击选中，Delete 删除</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Delete, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface FlowNode {
  id: string
  type: 'start' | 'process' | 'decision' | 'io' | 'end'
  label: string
  x: number
  y: number
}

interface FlowEdge {
  id: string
  from: string
  fromPort: 'top' | 'bottom' | 'left' | 'right'
  to: string
  toPort: 'top' | 'bottom' | 'left' | 'right'
  label: string
}

const svgEl = ref<SVGSVGElement>()
const svgWidth = ref(1200)
const svgHeight = ref(800)
const nodeWidth = 140
const nodeHeight = 60

const nodes = ref<FlowNode[]>([])
const edges = ref<FlowEdge[]>([])
const selectedNode = ref<string | null>(null)
const selectedEdge = ref<string | null>(null)
const isConnecting = ref(false)
const tempEdgeEnd = ref<{ x: number; y: number } | null>(null)

let connectFrom: { nodeId: string; port: string } | null = null
let dragNode: { nodeId: string; offsetX: number; offsetY: number } | null = null
let history: string[] = []
let historyIndex = -1
let idCounter = 0

const selectedNodeObj = computed(() => nodes.value.find(n => n.id === selectedNode.value) || null)
const selectedEdgeObj = computed(() => edges.value.find(e => e.id === selectedEdge.value) || null)

const diamondPoints = computed(() => {
  const hw = nodeWidth * 0.7
  const hh = nodeHeight * 0.8
  return `0,${-hh} ${hw},0 0,${hh} ${-hw},0`
})

const parallelogramPoints = computed(() => {
  const hw = nodeWidth / 2
  const hh = nodeHeight / 2
  const skew = 15
  return `${-hw + skew},${-hh} ${hw},${-hh} ${hw - skew},${hh} ${-hw},${hh}`
})

const genId = () => `n${++idCounter}`

const nodeTypeLabel = (type: string) => {
  const map: Record<string, string> = { start: '开始', process: '处理', decision: '判断', io: '输入/输出', end: '结束' }
  return map[type] || type
}

const addNode = (type: FlowNode['type']) => {
  const labels: Record<string, string> = { start: '开始', process: '处理', decision: '判断?', io: '输入/输出', end: '结束' }
  const id = genId()
  nodes.value.push({
    id,
    type,
    label: labels[type],
    x: 200 + Math.random() * 400,
    y: 100 + Math.random() * 300,
  })
  selectedNode.value = id
  selectedEdge.value = null
  saveHistory()
}

const selectEdge = (id: string) => {
  selectedEdge.value = id
  selectedNode.value = null
}

const deleteSelected = () => {
  if (selectedNode.value) {
    edges.value = edges.value.filter(e => e.from !== selectedNode.value && e.to !== selectedNode.value)
    nodes.value = nodes.value.filter(n => n.id !== selectedNode.value)
    selectedNode.value = null
    saveHistory()
  } else if (selectedEdge.value) {
    edges.value = edges.value.filter(e => e.id !== selectedEdge.value)
    selectedEdge.value = null
    saveHistory()
  }
}

const clearAll = () => {
  nodes.value = []
  edges.value = []
  selectedNode.value = null
  selectedEdge.value = null
  saveHistory()
}

// Node dragging
const onNodeMouseDown = (e: MouseEvent, node: FlowNode) => {
  selectedNode.value = node.id
  selectedEdge.value = null
  const svgRect = svgEl.value!.getBoundingClientRect()
  dragNode = {
    nodeId: node.id,
    offsetX: e.clientX - svgRect.left - node.x,
    offsetY: e.clientY - svgRect.top - node.y,
  }
}

const onSvgMouseDown = (e: MouseEvent) => {
  if (e.target === svgEl.value || (e.target as Element).tagName === 'rect' && (e.target as Element).getAttribute('fill') === 'url(#grid)') {
    selectedNode.value = null
    selectedEdge.value = null
  }
}

const onSvgMouseMove = (e: MouseEvent) => {
  const svgRect = svgEl.value!.getBoundingClientRect()
  const x = e.clientX - svgRect.left
  const y = e.clientY - svgRect.top

  if (dragNode) {
    const node = nodes.value.find(n => n.id === dragNode!.nodeId)
    if (node) {
      node.x = Math.max(nodeWidth / 2, Math.min(svgWidth.value - nodeWidth / 2, x - dragNode.offsetX))
      node.y = Math.max(nodeHeight / 2, Math.min(svgHeight.value - nodeHeight / 2, y - dragNode.offsetY))
    }
  }

  if (isConnecting.value) {
    tempEdgeEnd.value = { x, y }
  }
}

const onSvgMouseUp = () => {
  if (dragNode) {
    saveHistory()
    dragNode = null
  }
  if (isConnecting.value) {
    isConnecting.value = false
    connectFrom = null
    tempEdgeEnd.value = null
  }
}

const onSvgDblClick = (e: MouseEvent) => {
  // Find clicked node
  const svgRect = svgEl.value!.getBoundingClientRect()
  const x = e.clientX - svgRect.left
  const y = e.clientY - svgRect.top
  const node = nodes.value.find(n =>
    Math.abs(n.x - x) < nodeWidth / 2 && Math.abs(n.y - y) < nodeHeight / 2
  )
  if (node) {
    const newLabel = prompt('编辑节点文字:', node.label)
    if (newLabel !== null) {
      node.label = newLabel
      saveHistory()
    }
  }
}

// Connection
const startConnect = (node: FlowNode, port: string) => {
  isConnecting.value = true
  connectFrom = { nodeId: node.id, port }
}

const getPortPos = (nodeId: string, port: string) => {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return { x: 0, y: 0 }
  switch (port) {
    case 'top': return { x: node.x, y: node.y - nodeHeight / 2 }
    case 'bottom': return { x: node.x, y: node.y + nodeHeight / 2 }
    case 'left': return { x: node.x - nodeWidth / 2, y: node.y }
    case 'right': return { x: node.x + nodeWidth / 2, y: node.y }
    default: return { x: node.x, y: node.y }
  }
}

const getEdgePath = (edge: FlowEdge) => {
  const from = getPortPos(edge.from, edge.fromPort)
  const to = getPortPos(edge.to, edge.toPort)
  return buildPath(from, to, edge.fromPort, edge.toPort)
}

const getTempEdgePath = () => {
  if (!connectFrom || !tempEdgeEnd.value) return ''
  const from = getPortPos(connectFrom.nodeId, connectFrom.port)
  return buildPath(from, tempEdgeEnd.value, connectFrom.port, 'top')
}

const buildPath = (from: { x: number; y: number }, to: { x: number; y: number }, fromPort: string, toPort: string) => {
  const dx = Math.abs(to.x - from.x) * 0.5
  const dy = Math.abs(to.y - from.y) * 0.5
  let cx1 = from.x, cy1 = from.y, cx2 = to.x, cy2 = to.y
  if (fromPort === 'bottom') cy1 += dy
  else if (fromPort === 'top') cy1 -= dy
  else if (fromPort === 'right') cx1 += dx
  else if (fromPort === 'left') cx1 -= dx
  if (toPort === 'top') cy2 -= dy
  else if (toPort === 'bottom') cy2 += dy
  else if (toPort === 'left') cx2 -= dx
  else if (toPort === 'right') cx2 += dx
  return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`
}

const getEdgeLabelPos = (edge: FlowEdge) => {
  const from = getPortPos(edge.from, edge.fromPort)
  const to = getPortPos(edge.to, edge.toPort)
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
}

// History
const saveHistory = () => {
  const state = JSON.stringify({ nodes: nodes.value, edges: edges.value })
  history = history.slice(0, historyIndex + 1)
  history.push(state)
  historyIndex++
  if (history.length > 50) {
    history.shift()
    historyIndex--
  }
}

const undo = () => {
  if (historyIndex > 0) {
    historyIndex--
    restoreHistory()
  }
}

const redo = () => {
  if (historyIndex < history.length - 1) {
    historyIndex++
    restoreHistory()
  }
}

const restoreHistory = () => {
  const state = JSON.parse(history[historyIndex])
  nodes.value = state.nodes
  edges.value = state.edges
}

// Find closest port when dropping connection
const findClosestPort = (x: number, y: number, excludeNodeId: string): { nodeId: string; port: string } | null => {
  let closest: { nodeId: string; port: string; dist: number } | null = null
  for (const node of nodes.value) {
    if (node.id === excludeNodeId) continue
    const ports = ['top', 'bottom', 'left', 'right'] as const
    for (const port of ports) {
      const pos = getPortPos(node.id, port)
      const dist = Math.hypot(pos.x - x, pos.y - y)
      if (dist < 30 && (!closest || dist < closest.dist)) {
        closest = { nodeId: node.id, port, dist }
      }
    }
  }
  return closest ? { nodeId: closest.nodeId, port: closest.port } : null
}

// Override mouseup to handle connection dropping
const originalMouseUp = onSvgMouseUp
const onSvgMouseUpWithConnect = () => {
  if (isConnecting.value && connectFrom && tempEdgeEnd.value) {
    const target = findClosestPort(tempEdgeEnd.value.x, tempEdgeEnd.value.y, connectFrom.nodeId)
    if (target) {
      const exists = edges.value.some(e =>
        e.from === connectFrom!.nodeId && e.to === target.nodeId
      )
      if (!exists) {
        edges.value.push({
          id: genId(),
          from: connectFrom.nodeId,
          fromPort: connectFrom.port as any,
          to: target.nodeId,
          toPort: target.port as any,
          label: '',
        })
        saveHistory()
      }
    }
  }
  isConnecting.value = false
  connectFrom = null
  tempEdgeEnd.value = null
  dragNode = null
}

// Export
const exportPNG = () => {
  const svg = svgEl.value
  if (!svg) return
  const canvas = document.createElement('canvas')
  canvas.width = svgWidth.value * 2
  canvas.height = svgHeight.value * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, svgWidth.value, svgHeight.value)

  const svgData = new XMLSerializer().serializeToString(svg)
  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `flowchart_${Date.now()}.png`
    a.click()
  }
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
}

const exportSVG = () => {
  const svg = svgEl.value
  if (!svg) return
  const svgData = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([svgData], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `flowchart_${Date.now()}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  // Add default nodes
  nodes.value = [
    { id: 'n1', type: 'start', label: '开始', x: 300, y: 60 },
    { id: 'n2', type: 'process', label: '处理数据', x: 300, y: 180 },
    { id: 'n3', type: 'decision', label: '是否通过?', x: 300, y: 310 },
    { id: 'n4', type: 'process', label: '执行操作', x: 300, y: 440 },
    { id: 'n5', type: 'end', label: '结束', x: 300, y: 560 },
  ]
  edges.value = [
    { id: 'e1', from: 'n1', fromPort: 'bottom', to: 'n2', toPort: 'top', label: '' },
    { id: 'e2', from: 'n2', fromPort: 'bottom', to: 'n3', toPort: 'top', label: '' },
    { id: 'e3', from: 'n3', fromPort: 'bottom', to: 'n4', toPort: 'top', label: '是' },
    { id: 'e4', from: 'n4', fromPort: 'bottom', to: 'n5', toPort: 'top', label: '' },
  ]
  idCounter = 5
  saveHistory()
})
</script>
