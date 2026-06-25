<template>
  <div class="space-y-6">
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Encode -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">HTML 实体编码</h3>

        <el-input
          v-model="encodeInput"
          type="textarea"
          :rows="4"
          placeholder="输入需要编码的内容，如 <div>Hello &amp; World</div>"
        />

        <el-button type="primary" class="w-full mt-4" @click="handleEncode">
          编码
        </el-button>

        <div v-if="encodeResult" class="mt-4">
          <el-input
            v-model="encodeResult"
            type="textarea"
            :rows="4"
            readonly
            class="w-full"
          />
          <div class="flex gap-2 mt-2">
            <el-button size="small" @click="copyText(encodeResult)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
        </div>
      </div>

      <!-- Decode -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">HTML 实体解码</h3>

        <el-input
          v-model="decodeInput"
          type="textarea"
          :rows="4"
          placeholder="输入需要解码的内容，如 &lt;div&gt;Hello &amp; World&lt;/div&gt;"
        />

        <el-button type="primary" class="w-full mt-4" @click="handleDecode">
          解码
        </el-button>

        <div v-if="decodeResult" class="mt-4">
          <el-input
            v-model="decodeResult"
            type="textarea"
            :rows="4"
            readonly
            class="w-full"
          />
          <div class="flex gap-2 mt-2">
            <el-button size="small" @click="copyText(decodeResult)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Common Entities Reference -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">常用 HTML 实体</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="entity in commonEntities"
          :key="entity.name"
          class="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 cursor-pointer hover:border-blue-400 transition-colors"
          @click="copyEntity(entity)"
        >
          <span class="font-mono text-lg text-blue-600 dark:text-blue-400">{{ entity.entity }}</span>
          <span class="text-xs text-gray-500 mt-1">{{ entity.name }}</span>
          <span class="text-xs text-gray-400 font-mono">{{ entity.char }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Examples -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速示例</h3>
      <div class="flex flex-wrap gap-3">
        <el-button @click="applyExample('html')">HTML 标签</el-button>
        <el-button @click="applyExample('special')">特殊字符</el-button>
        <el-button @click="applyExample('mixed')">混合文本</el-button>
        <el-button @click="applyExample('entity')">实体字符串</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { copyToClipboard } from '@/utils/clipboard'
import { ref } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const encodeInput = ref('')
const encodeResult = ref('')
const decodeInput = ref('')
const decodeResult = ref('')

const commonEntities = [
  { name: '小于号', char: '<', entity: '&lt;', code: 'lt' },
  { name: '大于号', char: '>', entity: '&gt;', code: 'gt' },
  { name: '与号', char: '&', entity: '&amp;', code: 'amp' },
  { name: '双引号', char: '"', entity: '&quot;', code: 'quot' },
  { name: '单引号', char: "'", entity: '&#39;', code: '#39' },
  { name: '空格', char: ' ', entity: '&nbsp;', code: 'nbsp' },
  { name: '版权', char: '©', entity: '&copy;', code: 'copy' },
  { name: '注册', char: '®', entity: '&reg;', code: 'reg' },
  { name: '商标', char: '™', entity: '&trade;', code: 'trade' },
  { name: '欧元', char: '€', entity: '&euro;', code: 'euro' },
  { name: '英镑', char: '£', entity: '&pound;', code: 'pound' },
  { name: '人民币', char: '¥', entity: '&yen;', code: 'yen' },
]

const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  ' ': '&nbsp;',
}

const reverseHtmlEntities: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&sect;': '§',
  '&para;': '¶',
  '&times;': '×',
  '&divide;': '÷',
  '&plusmn;': '±',
  '&micro;': 'µ',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾',
  '&iexcl;': '¡',
  '&iquest;': '¿',
  '&laquo;': '«',
  '&raquo;': '»',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
  '&larr;': '←',
  '&rarr;': '→',
  '&uarr;': '↑',
  '&darr;': '↓',
}

const handleEncode = () => {
  if (!encodeInput.value) return
  try {
    const input = encodeInput.value
    let result = ''
    for (let i = 0; i < input.length; i++) {
      const char = input[i]
      if (htmlEntities[char]) {
        result += htmlEntities[char]
      } else {
        result += char
      }
    }
    encodeResult.value = result
    ElMessage.success('编码成功')
  } catch {
    ElMessage.error('编码失败')
  }
}

const handleDecode = () => {
  if (!decodeInput.value) return
  try {
    let input = decodeInput.value
    // Replace named entities
    input = input.replace(/&\w+;/g, (match) => {
      return reverseHtmlEntities[match] ?? match
    })
    // Replace numeric entities: &#123; or &#x1F;
    input = input.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16))
    })
    input = input.replace(/&#(\d+);/g, (_, dec) => {
      return String.fromCharCode(parseInt(dec, 10))
    })
    decodeResult.value = input
    ElMessage.success('解码成功')
  } catch {
    ElMessage.error('解码失败，输入内容格式不正确')
  }
}

const copyText = async (text: string) => {
  try {
    await copyToClipboard(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const copyEntity = (entity: { entity: string; char: string }) => {
  copyText(entity.entity)
}

const applyExample = (type: string) => {
  const examples: Record<string, { input: string; isEncode: boolean }> = {
    html: { input: '<div class="container"><p>Hello &amp; World!</p></div>', isEncode: true },
    special: { input: '"Quotes" & \'Apostrophe\' < > & Spaces', isEncode: true },
    mixed: { input: '© 2024 Company™. All rights reserved. Price: $100 & free!', isEncode: true },
    entity: { input: '&lt;div&gt;Hello &amp; World!&lt;/div&gt;', isEncode: false },
  }

  const example = examples[type]
  if (example.isEncode) {
    encodeInput.value = example.input
    handleEncode()
  } else {
    decodeInput.value = example.input
    handleDecode()
  }
}
</script>
