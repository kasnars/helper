# Hash工具功能文档

## 功能概述
Hash工具是一个哈希计算和对比工具，支持文本和文件的哈希值计算（SHA-1、SHA-256、SHA-384、SHA-512），并提供两个哈希值的对比功能。所有计算均在浏览器端完成，无需上传数据到服务器，保证数据安全。

## 关键技术栈

### 核心技术
- **Vue 3**: 使用Composition API (setup语法糖)
- **TypeScript**: 提供类型安全
- **Web Crypto API**: 浏览器原生加密API
  - `crypto.subtle.digest()`: 计算哈希值
  - 支持SHA-1、SHA-256、SHA-384、SHA-512算法
- **File API**: 文件读取和处理
- **TextEncoder API**: 文本编码为UTF-8字节数组

### 关键组件
- **Element Plus**: UI组件库
  - `el-input`: 文本输入
  - `el-upload`: 文件上传
  - `el-button`: 操作按钮
- **Clipboard API**: 复制哈希值到剪贴板

### Web Crypto API原理
```typescript
// 计算哈希值
const hashBuffer = await crypto.subtle.digest(
  algorithmName,  // 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'
  data            // ArrayBuffer或BufferSource
)

// 返回ArrayBuffer，需要转换为十六进制字符串
```

## 实现思路与流程

### 1. 文本哈希计算

```typescript
const inputText = ref('')
const hashes = ref<any>(null)

const generateHashes = async () => {
  if (!inputText.value) {
    hashes.value = null
    return
  }
  
  try {
    // 步骤1: 将文本编码为UTF-8字节数组
    const encoder = new TextEncoder()
    const data = encoder.encode(inputText.value)
    
    // 步骤2: 并行计算多种哈希算法
    const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
    const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
    const sha384Buffer = await crypto.subtle.digest('SHA-384', data)
    const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
    
    // 步骤3: 将ArrayBuffer转换为十六进制字符串
    hashes.value = {
      'SHA-1': arrayBufferToHex(sha1Buffer),
      'SHA-256': arrayBufferToHex(sha256Buffer),
      'SHA-384': arrayBufferToHex(sha384Buffer),
      'SHA-512': arrayBufferToHex(sha512Buffer),
    }
  } catch (e) {
    ElMessage.error('哈希计算失败')
  }
}
```

#### TextEncoder编码示例
```typescript
const encoder = new TextEncoder()
const data = encoder.encode("Hello")
// data: Uint8Array [72, 101, 108, 108, 111]
// 对应ASCII码
```

### 2. 文件哈希计算

```typescript
const fileName = ref('')
const fileSize = ref(0)
const fileHashes = ref<any>(null)
const calculating = ref(false)

const handleFileChange = async (file: any) => {
  fileName.value = file.name
  fileSize.value = file.size
  calculating.value = true
  fileHashes.value = null
  
  try {
    // 步骤1: 读取文件为ArrayBuffer
    const buffer = await file.raw.arrayBuffer()
    
    // 步骤2: 计算多种哈希
    const sha1Buffer = await crypto.subtle.digest('SHA-1', buffer)
    const sha256Buffer = await crypto.subtle.digest('SHA-256', buffer)
    const sha384Buffer = await crypto.subtle.digest('SHA-384', buffer)
    const sha512Buffer = await crypto.subtle.digest('SHA-512', buffer)
    
    // 步骤3: 转换结果
    fileHashes.value = {
      'SHA-1': arrayBufferToHex(sha1Buffer),
      'SHA-256': arrayBufferToHex(sha256Buffer),
      'SHA-384': arrayBufferToHex(sha384Buffer),
      'SHA-512': arrayBufferToHex(sha512Buffer),
    }
  } catch (e) {
    ElMessage.error('文件哈希计算失败')
  } finally {
    calculating.value = false
  }
}
```

#### 文件读取原理
```typescript
// File对象继承自Blob，提供arrayBuffer()方法
const file = fileInput.files[0]
const buffer = await file.arrayBuffer()

// 文件读取是异步操作，大文件可能需要较长时间
// 整个文件会被加载到内存中
```

### 3. ArrayBuffer转十六进制

```typescript
const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  // 步骤1: 创建Uint8Array视图
  const bytes = new Uint8Array(buffer)
  
  // 步骤2: 将每个字节转换为2位十六进制
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
```

#### 转换示例
```typescript
const buffer = new Uint8Array([72, 101, 108, 108, 111])
// 72 -> "48"
// 101 -> "65"
// 108 -> "6c"
// 108 -> "6c"
// 111 -> "6f"
// 结果: "48656c6c6f"
```

### 4. 哈希值对比

```typescript
const hash1 = ref('')
const hash2 = ref('')
const hashMatch = ref(false)

// 监听两个哈希值变化，自动对比
import { watch } from 'vue'
watch([hash1, hash2], () => {
  if (hash1.value && hash2.value) {
    // 去除空格并转为小写进行比较
    hashMatch.value = hash1.value.trim().toLowerCase() === 
                      hash2.value.trim().toLowerCase()
  }
})
```

### 5. 复制功能

```typescript
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}
```

### 6. 文件大小格式化

```typescript
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}
```

## 整体实现细节

### 组件结构
```
HashTool.vue
├── 哈希生成器
│   ├── 文本输入框
│   │   └── 实时计算（@input事件）
│   └── 哈希结果列表
│       ├── SHA-1
│       ├── SHA-256
│       ├── SHA-384
│       └── SHA-512
│       （每个算法都有复制按钮）
├── 文件哈希计算
│   ├── 文件上传（拖拽/点击）
│   ├── 文件信息展示
│   ├── 计算中状态
│   └── 哈希结果列表
└── 哈希值对比
    ├── 哈希值1输入
    ├── 哈希值2输入
    └── 对比结果
        ├── 匹配（绿色）
        └── 不匹配（红色）
```

### 数据类型定义

```typescript
const inputText = ref('')
const hashes = ref<{
  'SHA-1': string
  'SHA-256': string
  'SHA-384': string
  'SHA-512': string
} | null>(null)

const fileName = ref('')
const fileSize = ref(0)
const fileHashes = ref<{
  'SHA-1': string
  'SHA-256': string
  'SHA-384': string
  'SHA-512': string
} | null>(null)
const calculating = ref(false)

const hash1 = ref('')
const hash2 = ref('')
const hashMatch = ref(false)
```

### 实时计算
```vue
<el-input
  v-model="inputText"
  type="textarea"
  :rows="4"
  placeholder="输入要计算哈希的文本..."
  @input="generateHashes"
/>
```
- 使用`@input`事件实现实时计算
- 输入为空时清空结果

### 加载状态
```vue
<div v-if="calculating" class="text-center py-4">
  <el-icon class="is-loading" :size="32"><Loading /></el-icon>
  <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
    正在计算哈希...
  </p>
</div>
```

### 结果展示样式
```vue
<div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
  <div class="flex items-center justify-between mb-2">
    <span class="font-semibold text-sm">SHA-256</span>
    <el-button size="small" @click="copyToClipboard(hash)">
      复制
    </el-button>
  </div>
  <p class="font-mono text-xs break-all">{{ hash }}</p>
</div>
```
- 使用`font-mono`等宽字体显示哈希值
- `break-all`允许长字符串换行
- `text-xs`小字号适应长文本

### 对比结果可视化
```vue
<div v-if="hash1 && hash2" class="p-4 rounded-lg" 
     :class="hashMatch ? 'bg-green-50' : 'bg-red-50'">
  <div class="flex items-center gap-2">
    <el-icon :size="24" :color="hashMatch ? '#67C23A' : '#F56C6C'">
      <component :is="hashMatch ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
    </el-icon>
    <span :class="hashMatch ? 'text-green-700' : 'text-red-700'">
      {{ hashMatch ? '哈希值匹配' : '哈希值不匹配' }}
    </span>
  </div>
</div>
```

## SHA算法详解

### SHA-1
- **输出长度**: 160位（40个十六进制字符）
- **安全性**: 已被证明存在碰撞攻击，不推荐用于安全场景
- **用途**: 文件校验、Git提交哈希

### SHA-256
- **输出长度**: 256位（64个十六进制字符）
- **安全性**: 目前安全，广泛使用
- **用途**: SSL证书、区块链、密码存储

### SHA-384
- **输出长度**: 384位（96个十六进制字符）
- **安全性**: 比SHA-256更安全
- **用途**: 高安全需求场景

### SHA-512
- **输出长度**: 512位（128个十六进制字符）
- **安全性**: 目前最安全的SHA算法
- **用途**: 军事级加密、长期数据保护

## 使用场景

### 文本哈希
1. **密码校验**: 存储密码的哈希值而非明文
2. **数据完整性**: 验证数据是否被篡改
3. **数字签名**: 生成消息摘要

### 文件哈希
1. **文件校验**: 验证下载文件的完整性
2. **去重**: 通过哈希值识别重复文件
3. **版本控制**: 标识文件版本

### 哈希对比
1. **验证一致性**: 确认两个哈希值是否相同
2. **证书验证**: 对比证书指纹
3. **数据同步**: 检查文件是否需要同步

## 功能总结

### 核心特性
1. **多算法支持**: SHA-1、SHA-256、SHA-384、SHA-512
2. **文本和文件**: 支持两种输入方式
3. **实时计算**: 文本输入时自动计算
4. **哈希对比**: 可视化对比两个哈希值
5. **一键复制**: 快速复制哈希值
6. **纯前端计算**: 数据不上传，保证安全

### 技术亮点
- **Web Crypto API**: 浏览器原生加密，性能优秀
- **TextEncoder**: 正确处理UTF-8编码
- **异步计算**: 不阻塞UI线程
- **响应式设计**: watch实现自动对比
- **类型安全**: TypeScript全程类型保护
- **加载状态**: 文件计算时显示进度

### 用户体验优化
1. 文本输入实时计算哈希
2. 文件计算显示加载动画
3. 哈希值使用等宽字体便于阅读
4. 长哈希值自动换行
5. 对比结果颜色区分（绿/红）
6. 每个哈希值都有独立复制按钮

### 性能考虑
- **内存使用**: 大文件会完全加载到内存
- **计算时间**: 文件大小影响计算速度
- **并行计算**: 四种算法可同时计算

### 优化空间
1. 支持MD5算法（非安全场景）
2. 大文件分块计算哈希（减少内存占用）
3. 支持批量文件哈希计算
4. 添加哈希值导出功能
5. 支持拖拽对比（拖入两个文件自动对比）
6. 显示计算耗时
7. 添加BLAKE2、SHA-3等现代算法
8. 支持HMAC（带密钥的哈希）
