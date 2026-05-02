# JSON编辑器功能文档

## 功能概述
JSON编辑器是一个多功能的JSON处理工具，提供三种模式：JSON编辑器（格式化/压缩/转换）、对比工具（比较两个JSON的差异）、树形查看器（可视化展示JSON结构）。支持JSON与YAML、CSV、TypeScript接口之间的转换。

## 关键技术栈

### 核心技术
- **Vue 3**: 使用Composition API (setup语法糖)
- **TypeScript**: 提供类型安全
- **JSON API**: JavaScript原生JSON解析和序列化
  - `JSON.parse()`: 解析JSON字符串
  - `JSON.stringify()`: 将对象转换为JSON字符串

### 关键组件

#### 1. JsonEditor.vue - 主编辑器
- **Element Plus**: UI组件库
  - `el-radio-group`: 模式切换
  - `el-input (textarea)`: JSON文本输入输出
  - `el-button`: 操作按钮
- **自定义转换算法**: YAML、CSV、TypeScript接口生成

#### 2. JsonTree.vue / JsonTreeItem.vue - 树形查看器
- **递归组件**: JsonTreeItem递归渲染JSON节点
- **折叠/展开**: 通过CSS类控制子节点显示

### JSON处理核心原理

```typescript
// 格式化（美化）
JSON.stringify(parsed, null, 2) // 2空格缩进

// 压缩（单行）
JSON.stringify(parsed) // 无额外空格

// 解析验证
try {
  const parsed = JSON.parse(input)
  // 有效JSON
} catch (e) {
  // 无效JSON
}
```

## 实现思路与流程

### 1. 模式切换

使用radio-group实现三种模式切换：

```vue
<el-radio-group v-model="mode">
  <el-radio-button label="editor">编辑器</el-radio-button>
  <el-radio-button label="diff">对比工具</el-radio-button>
  <el-radio-button label="tree">树形查看</el-radio-button>
</el-radio-group>
```

通过`v-if`条件渲染不同模式：
```vue
<template v-if="mode === 'editor'">
  <!-- 编辑器模式 -->
</template>

<template v-if="mode === 'diff'">
  <!-- 对比模式 -->
</template>

<template v-if="mode === 'tree'">
  <!-- 树形模式 -->
</template>
```

### 2. JSON格式化与压缩

```typescript
const jsonInput = ref('')
const jsonOutput = ref('')
const jsonError = ref('')

// 解析后的JSON（computed自动响应输入变化）
const parsedJson = computed(() => {
  try {
    return JSON.parse(jsonInput.value)
  } catch {
    return null
  }
})

// 格式化JSON（美化输出）
const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonOutput.value = JSON.stringify(parsed, null, 2)
    jsonError.value = ''
  } catch (e) {
    jsonError.value = '无效的 JSON 格式'
  }
}

// 压缩JSON（单行输出）
const compressJson = () => {
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonOutput.value = JSON.stringify(parsed)
    jsonError.value = ''
  } catch (e) {
    jsonError.value = '无效的 JSON 格式'
  }
}
```

### 3. JSON转YAML

实现简易的YAML转换器：

```typescript
const convertToYaml = () => {
  const obj = parsedJson.value
  jsonOutput.value = objectToYaml(obj)
}

const objectToYaml = (obj: any, indent = 0): string => {
  const spaces = '  '.repeat(indent)
  
  // 处理null
  if (obj === null) return 'null'
  
  // 处理基本类型
  if (typeof obj === 'string') return obj
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  
  // 处理数组
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map(item => 
      `${spaces}- ${objectToYaml(item, indent + 1).trim()}`
    ).join('\n')
  }
  
  // 处理对象
  const entries = Object.entries(obj)
  if (entries.length === 0) return '{}'
  return entries.map(([key, value]) => {
    const valueStr = objectToYaml(value, indent + 1)
    // 嵌套对象需要换行
    if (typeof value === 'object' && value !== null) {
      return `${spaces}${key}:\n${valueStr}`
    }
    return `${spaces}${key}: ${valueStr}`
  }).join('\n')
}
```

### 4. JSON转CSV

将JSON数组转换为CSV格式：

```typescript
const convertToCsv = () => {
  const arr = parsedJson.value as any[]
  if (!arr.length) return
  
  // 提取表头
  const headers = Object.keys(arr[0])
  
  // 转换每一行数据
  const rows = arr.map(obj => 
    headers.map(h => obj[h]).join(',')
  )
  
  jsonOutput.value = [headers.join(','), ...rows].join('\n')
}
```

### 5. JSON转TypeScript接口

递归生成TypeScript类型定义：

```typescript
const convertToTypescript = () => {
  const obj = parsedJson.value
  const interfaces = generateTypescript(obj, 'Root')
  jsonOutput.value = interfaces
}

const generateTypescript = (obj: any, name: string): string => {
  // null类型
  if (obj === null) return 'null'
  
  // 基本类型
  if (typeof obj !== 'object') return typeof obj
  
  // 数组类型
  if (Array.isArray(obj)) {
    const itemType = obj.length > 0 
      ? generateTypescript(obj[0], name + 'Item') 
      : 'any'
    return `${itemType}[]`
  }
  
  // 对象类型 - 生成interface
  const fields = Object.entries(obj).map(([key, value]) => {
    const optional = value === undefined ? '?' : ''
    const type = value === undefined 
      ? 'any' 
      : generateTypescript(value, capitalize(key))
    return `  ${key}${optional}: ${type};`
  }).join('\n')
  
  return `interface ${name} {\n${fields}\n}`
}

const capitalize = (s: string) => 
  s.charAt(0).toUpperCase() + s.slice(1)
```

### 6. JSON转义/去转义

```typescript
// 转义JSON字符串（用于嵌入代码）
const escapeJson = () => {
  jsonOutput.value = JSON.stringify(jsonInput.value)
}

// 去转义JSON字符串
const unescapeJson = () => {
  try {
    jsonOutput.value = JSON.parse(jsonInput.value)
  } catch {
    jsonError.value = '无法去转义'
  }
}
```

### 7. JSON对比功能

实现简易的行级差异比较：

```typescript
const diffLeft = ref('')
const diffRight = ref('')
const diffResult = ref<Array<{ 
  type: 'added' | 'removed' | 'unchanged'
  text: string 
}>>([])

const compareJson = () => {
  try {
    const left = JSON.parse(diffLeft.value)
    const right = JSON.parse(diffRight.value)
    
    // 格式化为统一的字符串
    const leftStr = JSON.stringify(left, null, 2)
    const rightStr = JSON.stringify(right, null, 2)
    
    // 逐行比较
    diffResult.value = simpleDiff(
      leftStr.split('\n'), 
      rightStr.split('\n')
    )
  } catch {
    ElMessage.error('请确保两边都是有效的 JSON')
  }
}

// 简易diff算法
const simpleDiff = (
  left: string[], 
  right: string[]
): Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }> => {
  const result = []
  const maxLen = Math.max(left.length, right.length)
  
  for (let i = 0; i < maxLen; i++) {
    if (i >= left.length) {
      // 右侧新增
      result.push({ type: 'added', text: right[i] })
    } else if (i >= right.length) {
      // 左侧删除
      result.push({ type: 'removed', text: left[i] })
    } else if (left[i] !== right[i]) {
      // 行内容变化（先删除后添加）
      result.push({ type: 'removed', text: left[i] })
      result.push({ type: 'added', text: right[i] })
    } else {
      // 未变化
      result.push({ type: 'unchanged', text: left[i] })
    }
  }
  
  return result
}

// 交换左右内容
const swapDiff = () => {
  const temp = diffLeft.value
  diffLeft.value = diffRight.value
  diffRight.value = temp
}
```

### 8. 树形查看器

递归渲染JSON结构：

```typescript
// 输入监听，自动解析
watch(treeInput, (val) => {
  try {
    treeData.value = JSON.parse(val)
  } catch {
    treeData.value = null
  }
})
```

树形组件实现（JsonTreeItem.vue）：
```vue
<template>
  <div class="tree-item">
    <div 
      v-if="isObject || isArray" 
      class="tree-node"
      @click="toggle"
    >
      <span class="toggle-icon">{{ expanded ? '▼' : '▶' }}</span>
      <span v-if="keyName" class="key">{{ keyName }}: </span>
      <span class="type">{{ isArray ? `Array(${value.length})` : 'Object' }}</span>
    </div>
    
    <div v-if="expanded && (isObject || isArray)" class="children">
      <JsonTreeItem
        v-for="(childValue, childKey) in (isObject ? value : value)"
        :key="childKey"
        :value="isObject ? value[childKey] : childValue"
        :key-name="isArray ? undefined : childKey"
      />
    </div>
    
    <div v-if="!isObject && !isArray" class="leaf">
      <span v-if="keyName" class="key">{{ keyName }}: </span>
      <span :class="getType(value)">{{ formatValue(value) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: any
  keyName?: string
}>()

const expanded = ref(true)

const isObject = computed(() => 
  typeof props.value === 'object' && 
  props.value !== null && 
  !Array.isArray(props.value)
)

const isArray = computed(() => Array.isArray(props.value))

const toggle = () => {
  expanded.value = !expanded.value
}

const getType = (val: any) => {
  if (val === null) return 'null'
  if (typeof val === 'string') return 'string'
  if (typeof val === 'number') return 'number'
  if (typeof val === 'boolean') return 'boolean'
  return ''
}

const formatValue = (val: any) => {
  if (val === null) return 'null'
  if (typeof val === 'string') return `"${val}"`
  return String(val)
}
</script>
```

### 9. 统计信息

使用computed实时计算JSON统计：

```typescript
const jsonStats = computed(() => {
  if (!jsonOutput.value) return null
  return {
    chars: jsonOutput.value.length,
    lines: jsonOutput.value.split('\n').length,
    size: formatBytes(new Blob([jsonOutput.value]).size),
  }
})

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
```

### 10. 复制功能

```typescript
const copyOutput = () => {
  navigator.clipboard.writeText(jsonOutput.value)
  ElMessage.success('已复制')
}
```

## 整体实现细节

### 组件结构
```
JsonEditor.vue
├── 模式切换
│   ├── 编辑器模式
│   ├── 对比工具模式
│   └── 树形查看模式
├── 编辑器模式
│   ├── 输入区域（左侧）
│   │   ├── JSON输入框
│   │   └── 错误提示
│   ├── 输出区域（右侧）
│   │   ├── 格式化结果
│   │   └── 复制按钮
│   ├── 操作按钮
│   │   ├── 格式化
│   │   ├── 压缩
│   │   └── 清空
│   └── 转换功能
│       ├── 转YAML
│       ├── 转CSV
│       ├── 转TypeScript接口
│       ├── 转义字符串
│       └── 去转义
├── 对比工具模式
│   ├── 原始JSON输入
│   ├── 对比JSON输入
│   ├── 对比按钮
│   ├── 交换按钮
│   └── 差异结果展示
└── 树形查看模式
    ├── JSON输入框
    ├── 展开全部/折叠全部按钮
    └── JsonTree递归组件
```

### 数据类型定义

```typescript
// 对比结果行
interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  text: string
}

// 统计信息
interface JsonStats {
  chars: number
  lines: number
  size: string
}
```

### 响应式布局
- 使用Tailwind CSS的grid布局
- 移动端单列，桌面端双列（`md:grid-cols-2`）
- 自适应的统计面板

## 功能总结

### 核心特性
1. **三合一模式**: 编辑器、对比工具、树形查看器
2. **格式转换**: 支持YAML、CSV、TypeScript接口
3. **格式化/压缩**: 一键美化或压缩JSON
4. **差异对比**: 可视化显示JSON差异
5. **树形展示**: 递归展开/折叠JSON结构
6. **实时统计**: 字符数、行数、大小统计

### 技术亮点
- **递归算法**: TypeScript接口生成和树形渲染
- **computed响应式**: 自动解析和统计
- **自定义Diff算法**: 轻量级行级差异比较
- **类型安全**: TypeScript全程类型保护
- **错误处理**: try-catch捕获解析错误

### 用户体验优化
1. 输入错误实时提示
2. 无效操作按钮禁用状态
3. 一键复制结果
4. 树形节点可折叠展开
5. 对比结果颜色区分（绿增红删）

### 优化空间
1. 集成专业的diff库（如json-diff）实现深度对比
2. 使用代码编辑器（如Monaco Editor）替代textarea
3. 支持JSON Schema验证
4. 添加JSONPath查询功能
5. 支持更多格式转换（XML、TOML等）
6. 添加JSON修复功能（自动修复常见错误）
7. 支持大文件分块处理
