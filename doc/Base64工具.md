# Base64工具功能文档

## 功能概述
Base64工具是一个文本和文件编码/解码工具，支持文本的Base64编码和解码，以及将任意文件转换为Base64字符串。解决了中文等多字节字符的编码问题，确保UTF-8字符正确处理。

## 关键技术栈

### 核心技术
- **Vue 3**: 使用Composition API (setup语法糖)
- **TypeScript**: 提供类型安全
- **原生Base64 API**: 
  - `btoa()`: Binary to ASCII，将二进制字符串转为Base64
  - `atob()`: ASCII to Binary，将Base64转为二进制字符串
- **FileReader API**: 文件读取和Base64转换
- **encodeURIComponent/decodeURIComponent**: UTF-8编码处理

### 关键组件
- **Element Plus**: UI组件库
  - `el-radio-group`: 编码/解码模式切换
  - `el-input (textarea)`: 文本输入输出
  - `el-upload`: 文件上传组件
- **Clipboard API**: 复制结果到剪贴板

### Base64编码原理
Base64将每3个字节(24位)转换为4个可打印字符(每个字符6位)：
```
原始: 3 bytes (24 bits)
转换: 4 characters (6 bits each)
字符集: A-Z, a-z, 0-9, +, /
填充: = (当输入不是3的倍数时)
```

### UTF-8处理方案
原生`btoa/atob`只支持ASCII字符，处理UTF-8需要转换：
```typescript
// 编码：UTF-8字符串 → URI编码 → 二进制字符串 → Base64
btoa(unescape(encodeURIComponent(input)))

// 解码：Base64 → 二进制字符串 → URI解码 → UTF-8字符串
decodeURIComponent(escape(atob(input)))
```

## 实现思路与流程

### 1. 编码/解码核心逻辑

```typescript
const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')
const output = ref('')
const error = ref('')

const process = () => {
  error.value = ''
  try {
    if (mode.value === 'encode') {
      // 编码：支持UTF-8字符
      output.value = btoa(unescape(encodeURIComponent(input.value)))
    } else {
      // 解码：还原UTF-8字符
      output.value = decodeURIComponent(escape(atob(input.value)))
    }
  } catch (e) {
    error.value = mode.value === 'encode' 
      ? '编码失败' 
      : '解码失败：无效的 Base64 字符串'
    output.value = ''
  }
}
```

#### 编码流程详解
```typescript
// 示例：编码中文字符串 "你好"
const input = "你好"

// 步骤1: encodeURIComponent 将UTF-8字符转为百分号编码
const uriEncoded = encodeURIComponent(input)
// 结果: "%E4%BD%A0%E5%A5%BD"

// 步骤2: unescape 将百分号编码转为二进制字符串
const binaryStr = unescape(uriEncoded)
// 结果: 二进制字符串（每个字符代表一个字节）

// 步骤3: btoa 将二进制字符串转为Base64
const base64 = btoa(binaryStr)
// 结果: "5L2g5aW9"
```

#### 解码流程详解
```typescript
// 示例：解码Base64字符串 "5L2g5aW9"
const base64 = "5L2g5aW9"

// 步骤1: atob 将Base64转为二进制字符串
const binaryStr = atob(base64)
// 结果: 二进制字符串

// 步骤2: escape 将二进制字符串转为百分号编码
const uriEncoded = escape(binaryStr)
// 结果: "%E4%BD%A0%E5%A5%BD"

// 步骤3: decodeURIComponent 将百分号编码转为UTF-8字符串
const output = decodeURIComponent(uriEncoded)
// 结果: "你好"
```

### 2. 自动处理

监听模式和输入变化，自动执行编码/解码：

```typescript
import { watch } from 'vue'

watch([mode, input], () => {
  if (input.value) {
    process()
  }
})
```

### 3. 文件转Base64

```typescript
const fileBase64 = ref('')
const fileName = ref('')

const handleFileChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = () => {
    // reader.result 是 data URL 格式: "data:file/type;base64,..."
    fileBase64.value = reader.result as string
    fileName.value = file.name
  }
  reader.readAsDataURL(file.raw)
}
```

#### FileReader.readAsDataURL原理
- 读取文件并转换为data URL格式
- 格式：`data:[MIME type];base64,[Base64 encoded data]`
- 例如：`data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...`

### 4. 复制功能

```typescript
// 复制文本结果
const copyOutput = () => {
  navigator.clipboard.writeText(output.value)
  ElMessage.success('已复制')
}

// 复制文件Base64
const copyFileBase64 = () => {
  navigator.clipboard.writeText(fileBase64.value)
  ElMessage.success('文件 Base64 已复制')
}
```

### 5. 清空操作

```typescript
const clearInput = () => {
  input.value = ''
  output.value = ''
  error.value = ''
}
```

## 整体实现细节

### 组件结构
```
Base64Tool.vue
├── 模式切换
│   ├── 编码模式
│   └── 解码模式
├── 输入/输出区域
│   ├── 输入框
│   │   ├── 清空按钮
│   │   └── 动态placeholder
│   └── 输出框
│       ├── 复制按钮
│       ├── 只读
│       └── 错误提示
├── 操作按钮
│   └── 编码/解码按钮
└── 文件转Base64
    ├── 文件上传（拖拽/点击）
    ├── 文件名显示
    ├── Base64结果展示
    └── 复制按钮
```

### 数据类型定义

```typescript
const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')
const output = ref('')
const error = ref('')
const fileBase64 = ref('')
const fileName = ref('')
```

### UI布局
- **双栏布局**: 输入和输出并排显示（`md:grid-cols-2`）
- **等宽字体**: 使用`font-mono`显示Base64字符串
- **错误高亮**: 输出框在错误时显示红色边框
- **响应式**: 移动端单列，桌面端双列

### Element Plus Upload组件使用
```vue
<el-upload
  class="upload-demo"
  drag
  :auto-upload="false"
  :on-change="handleFileChange"
  :limit="1"
>
  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
  <div class="el-upload__text">
    拖拽文件到此处或 <em>点击上传</em>
  </div>
</el-upload>
```

### 错误处理
```typescript
try {
  // Base64操作
} catch (e) {
  error.value = mode.value === 'encode' 
    ? '编码失败' 
    : '解码失败：无效的 Base64 字符串'
  output.value = ''
}
```

### 按钮禁用逻辑
```vue
<!-- 输入为空时禁用处理按钮 -->
<el-button :disabled="!input">
  {{ mode === 'encode' ? '编码' : '解码' }}
</el-button>

<!-- 输出为空时禁用复制按钮 -->
<el-button :disabled="!output">
  复制
</el-button>
```

## Base64编码详解

### 编码表
```
索引  字符    索引  字符    索引  字符    索引  字符
0     A       16    Q       32    g       48    w
1     B       17    R       33    h       49    x
...   ...     ...   ...     ...   ...     ...   ...
25    Z       41    p       57    5       62    +
26    a       42    q       58    6       63    /
```

### 编码示例
```
输入: "Man" (ASCII: 77, 97, 110)
二进制: 01001101 01100001 01101110
分组:   010011 010110 000101 101110
十进制: 19     22     5      46
输出:   T      W      F      u
结果:   "TWFu"
```

### 填充规则
```
1字节: 01001101 → 010011 010000 → MT== (补4个0，2个=)
2字节: 01001101 01100001 → 010011 010110 000100 → TWF= (补2个0，1个=)
3字节: 01001101 01100001 01101110 → 010011 010110 000101 101110 → TWFu (无填充)
```

## 功能总结

### 核心特性
1. **双向转换**: 支持编码和解码
2. **UTF-8支持**: 正确处理中文等多字节字符
3. **文件转换**: 将任意文件转为Base64 data URL
4. **自动处理**: 输入变化时自动编码/解码
5. **便捷复制**: 一键复制结果到剪贴板
6. **错误提示**: 无效输入时显示明确错误信息

### 技术亮点
- **UTF-8编解码技巧**: 使用encodeURIComponent + unescape组合
- **FileReader API**: 原生文件读取和Base64转换
- **响应式监听**: watch实现自动处理
- **Clipboard API**: 现代浏览器剪贴板操作
- **错误边界**: try-catch优雅处理异常

### 使用场景
1. **Data URL生成**: 图片内联到HTML/CSS
2. **API认证**: Basic Auth头部编码
3. **数据传输**: 二进制数据转文本传输
4. **URL参数**: 安全传递特殊字符
5. **配置文件**: 简单数据序列化

### 优化空间
1. 支持Base64 URL安全编码（使用`-`和`_`替代`+`和`/`）
2. 添加Base64解码为文件下载功能
3. 支持大文件分块处理
4. 添加编码/解码历史记录
5. 支持批量文件转换
6. 显示Base64字符串大小和原始文件大小对比
7. 添加URL参数解码功能（自动识别URL编码的Base64）
