# UUID工具功能文档

## 功能概述
UUID工具是一个通用唯一识别码生成和验证工具，支持Version 1（基于时间）和Version 4（基于随机数）两种版本的UUID生成，提供批量生成、复制、下载以及UUID格式验证功能。

## 关键技术栈

### 核心技术
- **Vue 3**: 使用Composition API (setup语法糖)
- **TypeScript**: 提供类型安全
- **UUID算法**: 手动实现UUID v1和v4生成算法
- **正则表达式**: UUID格式验证

### 关键组件
- **Element Plus**: UI组件库
  - `el-select`: UUID版本选择
  - `el-input-number`: 生成数量控制
  - `el-button`: 操作按钮
- **Clipboard API**: 复制到剪贴板
- **File API**: 下载UUID列表

### UUID格式规范
```
格式: xxxxxxxx-xxxx-Vxxx-yxxx-xxxxxxxxxxxx
总长度: 36个字符（32个十六进制字符 + 4个连字符）
示例: 550e8400-e29b-41d4-a716-446655440000

V = 版本号 (1-5)
y = 变体 (8, 9, A, B)
```

## 实现思路与流程

### 1. UUID v4 生成（基于随机数）

```typescript
const generateUUIDv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
```

#### 算法详解
```typescript
// 模板: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
// 4 表示版本号（第13位）
// y 表示变体（第17位），必须是 8, 9, A, B 之一

// 替换逻辑:
// x: 随机十六进制数 (0-15)
// y: (随机数 & 0x3) | 0x8
//    = (00xx xxxx & 0000 0011) | 1000 0000
//    = 10xx xxxx (确保最高两位是10)
//    = 8, 9, A, B 之一

// 示例步骤:
// 1. Math.random() * 16 = 12.345
// 2. | 0 (位运算取整) = 12
// 3. toString(16) = 'c'
```

### 2. UUID v1 生成（基于时间）

```typescript
const generateUUIDv1 = (): string => {
  const now = new Date().getTime()
  
  // 简化版v1（实际v1需要MAC地址和更复杂的时间处理）
  const uuid = 'xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
  
  return uuid
}
```

#### v1 vs v4 对比
| 特性 | Version 1 | Version 4 |
|------|-----------|-----------|
| 基础 | 时间戳 + MAC地址 | 随机数 |
| 唯一性 | 时间维度保证 | 概率保证 |
| 可追溯 | 可生成时间 | 不可追溯 |
| 隐私 | 包含MAC地址 | 无隐私问题 |
| 使用频率 | 较少 | 最常用 |

### 3. 批量生成

```typescript
const uuidVersion = ref(4)
const count = ref(5)
const uuids = ref<string[]>([])

const generateUUIDs = () => {
  uuids.value = []
  for (let i = 0; i < count.value; i++) {
    uuids.value.push(generateUUID(uuidVersion.value))
  }
  ElMessage.success(`已生成 ${count.value} 个 UUID`)
}

const generateUUID = (version: number): string => {
  if (version === 4) {
    return generateUUIDv4()
  } else {
    return generateUUIDv1()
  }
}
```

### 4. UUID验证

```typescript
const uuidToValidate = ref('')
const validationResult = ref<any>(null)

const validateUUID = () => {
  if (!uuidToValidate.value) {
    validationResult.value = null
    return
  }
  
  // UUID正则表达式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  const isValid = uuidRegex.test(uuidToValidate.value)
  
  if (isValid) {
    // 提取版本号
    const version = uuidToValidate.value.charAt(14)
    validationResult.value = {
      valid: true,
      version: `Version ${version}`
    }
  } else {
    validationResult.value = {
      valid: false
    }
  }
}
```

#### 正则表达式详解
```regex
/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

^                         # 字符串开始
[0-9a-f]{8}               # 8个十六进制字符
-                         # 连字符
[0-9a-f]{4}               # 4个十六进制字符
-                         # 连字符
[1-5]                     # 版本号 (1-5)
[0-9a-f]{3}               # 3个十六进制字符
-                         # 连字符
[89ab]                    # 变体 (8, 9, a, b)
[0-9a-f]{3}               # 3个十六进制字符
-                         # 连字符
[0-9a-f]{12}              # 12个十六进制字符
$                         # 字符串结束
i                         # 忽略大小写
```

### 5. 复制和下载

```typescript
// 复制单个UUID
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

// 复制所有UUID
const copyAll = () => {
  const allUuids = uuids.value.join('\n')
  navigator.clipboard.writeText(allUuids)
  ElMessage.success('已复制全部')
}

// 下载UUID列表
const downloadUUIDs = () => {
  const content = uuids.value.join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `uuids_${Date.now()}.txt`
  link.click()
  
  URL.revokeObjectURL(url)
  ElMessage.success('已下载')
}

// 清空列表
const clearUUIDs = () => {
  uuids.value = []
  ElMessage.success('已清空')
}
```

## 整体实现细节

### 组件结构
```
UUIDTool.vue
├── UUID生成器
│   ├── 版本选择 (v1/v4)
│   ├── 数量输入 (1-100)
│   ├── 生成按钮
│   ├── UUID列表
│   │   ├── 单个UUID显示
│   │   └── 复制按钮
│   └── 批量操作
│       ├── 复制全部
│       ├── 下载
│       └── 清空
├── UUID验证器
│   ├── 输入框
│   └── 验证结果
│       ├── 有效/无效
│       └── 版本号显示
└── UUID信息
    ├── 什么是UUID
    ├── UUID格式
    └── UUID版本说明
```

### 数据类型定义

```typescript
const uuidVersion = ref(4)
const count = ref(5)
const uuids = ref<string[]>([])
const uuidToValidate = ref('')
const validationResult = ref<{
  valid: boolean
  version?: string
} | null>(null)
```

### UI布局特点

#### 生成控制区
```vue
<div class="flex gap-2">
  <el-select v-model="uuidVersion" class="w-32">
    <el-option label="Version 4" :value="4" />
    <el-option label="Version 1" :value="1" />
  </el-select>
  <el-input-number v-model="count" :min="1" :max="100" class="w-32" />
</div>
```

#### UUID列表展示
```vue
<div class="space-y-2">
  <div v-for="(uuid, index) in uuids" class="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
    <span class="font-mono text-sm flex-1 break-all">{{ uuid }}</span>
    <el-button size="small" link @click="copyToClipboard(uuid)">
      <el-icon><CopyDocument /></el-icon>
    </el-button>
  </div>
</div>
```

#### 验证结果可视化
```vue
<div v-if="validationResult" class="p-4 rounded-lg" 
     :class="validationResult.valid ? 'bg-green-50' : 'bg-red-50'">
  <div class="flex items-center gap-2">
    <el-icon :color="validationResult.valid ? '#67C23A' : '#F56C6C'">
      <component :is="validationResult.valid ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
    </el-icon>
    <div>
      <p :class="validationResult.valid ? 'text-green-700' : 'text-red-700'">
        {{ validationResult.valid ? '有效的 UUID' : '无效的 UUID' }}
      </p>
      <p v-if="validationResult.version">
        版本: {{ validationResult.version }}
      </p>
    </div>
  </div>
</div>
```

### 样式设计
- **等宽字体**: `font-mono`显示UUID
- **自动换行**: `break-all`处理长字符串
- **卡片布局**: `bg-gray-50 rounded-lg`
- **颜色区分**: 绿色有效，红色无效

## UUID版本详解

### Version 1 (基于时间)
```
结构: time_low-time_mid-time_hi_version-clock_seq-node
time_low: 32位时间戳（低）
time_mid: 16位时间戳（中）
time_hi_version: 12位时间戳（高）+ 4位版本号
clock_seq: 14位时钟序列
node: 48位MAC地址
```

### Version 4 (基于随机数)
```
结构: random-random-version-random-variant-random
总共122位随机数
碰撞概率: 极低（2^122种可能）
```

### 其他版本
- **Version 2**: DCE安全（罕见）
- **Version 3**: 基于MD5哈希（已废弃）
- **Version 5**: 基于SHA-1哈希（命名空间）

## 功能总结

### 核心特性
1. **双版本支持**: UUID v1和v4
2. **批量生成**: 一次生成最多100个UUID
3. **格式验证**: 实时验证UUID有效性
4. **版本识别**: 自动识别UUID版本
5. **便捷操作**: 复制、下载、清空
6. **知识普及**: UUID信息说明

### 技术亮点
- **算法实现**: 手动实现UUID生成算法
- **正则验证**: 精确的UUID格式验证
- **位运算**: 使用位运算确保格式正确
- **Blob下载**: 前端生成文件下载
- **类型安全**: TypeScript完整类型定义

### 使用场景
1. **数据库主键**: 唯一标识记录
2. **分布式系统**: 全局唯一ID
3. **会话标识**: Session ID生成
4. **文件名**: 避免文件名冲突
5. **API密钥**: 生成随机密钥
6. **测试数据**: 批量生成测试用UUID

### 优化空间
1. 支持Version 5（SHA-1命名空间）
2. 添加UUID解析功能（提取时间、MAC等）
3. 支持自定义UUID格式
4. 添加UUID碰撞检测
5. 支持生成带大写字母的UUID
6. 添加UUID历史记录
7. 支持导入UUID文件进行验证
