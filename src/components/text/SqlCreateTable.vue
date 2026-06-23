<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：字段配置 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📋 字段配置</h3>

        <!-- 表名 -->
        <div class="mb-4">
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">表名</label>
          <el-input v-model="tableName" placeholder="users" />
        </div>

        <!-- 数据库类型 -->
        <div class="mb-4">
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">数据库</label>
          <el-radio-group v-model="dbType">
            <el-radio-button label="mysql">MySQL</el-radio-button>
            <el-radio-button label="postgresql">PostgreSQL</el-radio-button>
            <el-radio-button label="sqlite">SQLite</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 字段列表 -->
        <div class="space-y-3">
          <div v-for="(field, i) in fields" :key="i" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-2 gap-2 mb-2">
              <el-input v-model="field.name" placeholder="字段名" size="small" />
              <el-select v-model="field.type" placeholder="类型" size="small">
                <el-option v-for="t in types" :key="t" :label="t" :value="t" />
              </el-select>
            </div>
            <div class="grid grid-cols-3 gap-2 items-center">
              <el-input v-model="field.length" placeholder="长度" size="small" />
              <el-checkbox v-model="field.notNull" size="small">NOT NULL</el-checkbox>
              <el-input v-model="field.default" placeholder="默认值" size="small" />
            </div>
            <div class="flex items-center gap-2 mt-2">
              <el-input v-model="field.comment" placeholder="注释" size="small" class="flex-1" />
              <el-button type="danger" size="small" circle @click="removeField(i)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <el-button class="mt-3" @click="addField">
          <el-icon><Plus /></el-icon> 添加字段
        </el-button>
      </div>

      <!-- 右侧：生成结果 -->
      <div>
        <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">📄 生成的SQL</h3>
        <pre class="p-4 bg-gray-900 text-green-400 rounded-xl text-sm font-mono overflow-auto max-h-96 whitespace-pre-wrap">{{ generatedSql }}</pre>
        <el-button type="primary" class="mt-3" @click="copySql">
          <el-icon><DocumentCopy /></el-icon> 复制SQL
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Field {
  name: string
  type: string
  length: string
  notNull: boolean
  default: string
  comment: string
}

const tableName = ref('users')
const dbType = ref('mysql')
const fields = ref<Field[]>([
  { name: 'id', type: 'INT', length: '', notNull: true, default: '', comment: '主键' },
  { name: 'name', type: 'VARCHAR', length: '255', notNull: true, default: '', comment: '姓名' },
  { name: 'email', type: 'VARCHAR', length: '255', notNull: false, default: '', comment: '邮箱' },
  { name: 'created_at', type: 'DATETIME', length: '', notNull: true, default: 'CURRENT_TIMESTAMP', comment: '创建时间' },
])

const types = computed(() => {
  if (dbType.value === 'mysql') return ['INT', 'BIGINT', 'VARCHAR', 'TEXT', 'DECIMAL', 'FLOAT', 'DOUBLE', 'BOOLEAN', 'DATE', 'DATETIME', 'TIMESTAMP', 'JSON', 'BLOB']
  if (dbType.value === 'postgresql') return ['SERIAL', 'BIGSERIAL', 'INTEGER', 'BIGINT', 'VARCHAR', 'TEXT', 'NUMERIC', 'REAL', 'DOUBLE PRECISION', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'JSONB', 'BYTEA']
  return ['INTEGER', 'REAL', 'TEXT', 'BLOB', 'NUMERIC', 'BOOLEAN', 'DATE', 'DATETIME']
})

const addField = () => {
  fields.value.push({ name: '', type: 'VARCHAR', length: '255', notNull: false, default: '', comment: '' })
}

const removeField = (i: number) => {
  fields.value.splice(i, 1)
}

const generatedSql = computed(() => {
  const validFields = fields.value.filter(f => f.name.trim())
  if (!tableName.value || validFields.length === 0) {
    return '-- 请填写表名和至少一个字段'
  }

  const lines = validFields.map(f => {
    let line = `  ${f.name} ${f.type}`
    if (f.length) line += `(${f.length})`
    if (f.notNull) line += ' NOT NULL'
    if (f.default) {
      if (f.default === 'CURRENT_TIMESTAMP' || f.default === 'NOW()') {
        line += ` DEFAULT ${f.default}`
      } else {
        line += ` DEFAULT '${f.default}'`
      }
    }
    if (dbType.value === 'mysql' && f.comment) {
      line += ` COMMENT '${f.comment}'`
    }
    return line
  })

  if (dbType.value === 'mysql') {
    return `CREATE TABLE \`${tableName.value}\` (\n${lines.join(',\n')}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  } else if (dbType.value === 'postgresql') {
    return `CREATE TABLE ${tableName.value} (\n${lines.join(',\n')}\n);`
  } else {
    return `CREATE TABLE ${tableName.value} (\n${lines.join(',\n')}\n);`
  }
})

const copySql = () => {
  navigator.clipboard.writeText(generatedSql.value)
  ElMessage.success('已复制')
}
</script>
