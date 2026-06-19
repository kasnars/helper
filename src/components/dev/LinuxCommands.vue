<template>
  <div class="space-y-6">
    <!-- 搜索 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Linux 常用命令查询</h3>
      <el-input
        v-model="searchQuery"
        placeholder="搜索命令名称或描述..."
        clearable
        :prefix-icon="Search"
      />
    </div>

    <!-- 分类标签 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex flex-wrap gap-2">
        <el-tag
          v-for="category in categories"
          :key="category.value"
          :type="activeCategory === category.value ? '' : 'info'"
          class="cursor-pointer"
          @click="activeCategory = category.value"
        >
          {{ category.icon }} {{ category.label }}
        </el-tag>
      </div>
    </div>

    <!-- 命令列表 -->
    <div class="space-y-4">
      <div
        v-for="cmd in filteredCommands"
        :key="cmd.name"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span class="text-blue-600 dark:text-blue-400 font-bold text-lg">{{ cmd.name.charAt(0) }}</span>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-white text-lg font-mono">{{ cmd.name }}</h4>
            <p class="text-gray-600 dark:text-gray-400 mt-1">{{ cmd.description }}</p>

            <!-- 语法 -->
            <div class="mt-3">
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">语法:</p>
              <code class="block bg-gray-50 dark:bg-gray-700/50 rounded px-3 py-2 text-sm font-mono text-gray-900 dark:text-white">
                {{ cmd.syntax }}
              </code>
            </div>

            <!-- 常用参数 -->
            <div v-if="cmd.options && cmd.options.length > 0" class="mt-3">
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">常用参数:</p>
              <div class="space-y-1">
                <div v-for="opt in cmd.options" :key="opt.flag" class="flex items-start gap-2">
                  <code class="text-sm font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">{{ opt.flag }}</code>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ opt.description }}</span>
                </div>
              </div>
            </div>

            <!-- 示例 -->
            <div v-if="cmd.examples && cmd.examples.length > 0" class="mt-3">
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">示例:</p>
              <div class="space-y-1">
                <div v-for="(example, index) in cmd.examples" :key="index">
                  <code class="block bg-gray-50 dark:bg-gray-700/50 rounded px-3 py-2 text-sm font-mono text-gray-900 dark:text-white">
                    {{ example }}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredCommands.length === 0" class="text-center py-12">
      <el-icon :size="48" class="text-gray-400"><Search /></el-icon>
      <p class="mt-4 text-gray-500 dark:text-gray-400">没有找到匹配的命令</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

interface CommandOption {
  flag: string
  description: string
}

interface LinuxCommand {
  name: string
  description: string
  syntax: string
  options?: CommandOption[]
  examples?: string[]
  category: string
}

const searchQuery = ref('')
const activeCategory = ref('all')

const categories = [
  { label: '全部', value: 'all', icon: '📋' },
  { label: '文件操作', value: 'file', icon: '📁' },
  { label: '文本处理', value: 'text', icon: '📝' },
  { label: '目录操作', value: 'directory', icon: '📂' },
  { label: '权限管理', value: 'permission', icon: '🔒' },
  { label: '网络', value: 'network', icon: '🌐' },
  { label: '系统信息', value: 'system', icon: '💻' },
  { label: '压缩打包', value: 'archive', icon: '📦' },
  { label: '进程管理', value: 'process', icon: '⚙️' },
]

const commands: LinuxCommand[] = [
  // 文件操作
  {
    name: 'ls',
    description: '列出目录内容',
    syntax: 'ls [选项] [目录]',
    options: [
      { flag: '-l', description: '显示详细信息' },
      { flag: '-a', description: '显示隐藏文件' },
      { flag: '-h', description: '人性化显示文件大小' },
      { flag: '-R', description: '递归显示子目录' },
    ],
    examples: ['ls -la', 'ls -lh /var/log'],
    category: 'file',
  },
  {
    name: 'cp',
    description: '复制文件或目录',
    syntax: 'cp [选项] 源 目标',
    options: [
      { flag: '-r', description: '递归复制目录' },
      { flag: '-i', description: '覆盖前提示' },
      { flag: '-v', description: '显示复制过程' },
    ],
    examples: ['cp file.txt backup/', 'cp -r dir1/ dir2/'],
    category: 'file',
  },
  {
    name: 'mv',
    description: '移动或重命名文件',
    syntax: 'mv [选项] 源 目标',
    options: [
      { flag: '-i', description: '覆盖前提示' },
      { flag: '-v', description: '显示移动过程' },
    ],
    examples: ['mv old.txt new.txt', 'mv file.txt /tmp/'],
    category: 'file',
  },
  {
    name: 'rm',
    description: '删除文件或目录',
    syntax: 'rm [选项] 文件...',
    options: [
      { flag: '-r', description: '递归删除目录' },
      { flag: '-f', description: '强制删除，不提示' },
      { flag: '-i', description: '删除前提示' },
    ],
    examples: ['rm file.txt', 'rm -rf directory/'],
    category: 'file',
  },
  {
    name: 'touch',
    description: '创建空文件或更新文件时间戳',
    syntax: 'touch [选项] 文件...',
    options: [
      { flag: '-a', description: '只更新访问时间' },
      { flag: '-m', description: '只更新修改时间' },
    ],
    examples: ['touch newfile.txt', 'touch -t 202401011200 file'],
    category: 'file',
  },
  {
    name: 'cat',
    description: '查看文件内容',
    syntax: 'cat [选项] 文件...',
    options: [
      { flag: '-n', description: '显示行号' },
      { flag: '-b', description: '只为非空行编号' },
    ],
    examples: ['cat file.txt', 'cat -n /etc/passwd'],
    category: 'file',
  },
  {
    name: 'find',
    description: '搜索文件',
    syntax: 'find [路径] [选项] [表达式]',
    options: [
      { flag: '-name', description: '按名称搜索' },
      { flag: '-type', description: '按类型搜索 (f/d)' },
      { flag: '-size', description: '按大小搜索' },
      { flag: '-mtime', description: '按修改时间搜索' },
    ],
    examples: ['find . -name "*.txt"', 'find /var -type f -size +100M'],
    category: 'file',
  },

  // 文本处理
  {
    name: 'grep',
    description: '搜索文本内容',
    syntax: 'grep [选项] 模式 文件...',
    options: [
      { flag: '-i', description: '忽略大小写' },
      { flag: '-r', description: '递归搜索目录' },
      { flag: '-n', description: '显示行号' },
      { flag: '-v', description: '反向匹配' },
    ],
    examples: ['grep "error" log.txt', 'grep -rn "TODO" ./src'],
    category: 'text',
  },
  {
    name: 'sed',
    description: '流编辑器，用于文本替换',
    syntax: 'sed [选项] \'命令\' 文件...',
    options: [
      { flag: '-i', description: '直接修改文件' },
      { flag: '-e', description: '指定多个命令' },
    ],
    examples: ['sed \'s/old/new/g\' file.txt', 'sed -i \'s/ /_/g\' file.txt'],
    category: 'text',
  },
  {
    name: 'awk',
    description: '文本处理语言',
    syntax: 'awk \'模式 {动作}\' 文件...',
    options: [
      { flag: '-F', description: '指定分隔符' },
    ],
    examples: ['awk \'{print $1}\' file.txt', 'awk -F: \'{print $1}\' /etc/passwd'],
    category: 'text',
  },
  {
    name: 'sort',
    description: '对文本行进行排序',
    syntax: 'sort [选项] 文件...',
    options: [
      { flag: '-r', description: '反向排序' },
      { flag: '-n', description: '按数字排序' },
      { flag: '-k', description: '指定排序字段' },
    ],
    examples: ['sort file.txt', 'sort -n -k2 data.txt'],
    category: 'text',
  },
  {
    name: 'wc',
    description: '统计行数、单词数、字节数',
    syntax: 'wc [选项] 文件...',
    options: [
      { flag: '-l', description: '只统计行数' },
      { flag: '-w', description: '只统计单词数' },
      { flag: '-c', description: '只统计字节数' },
    ],
    examples: ['wc -l file.txt', 'wc -w *.txt'],
    category: 'text',
  },

  // 目录操作
  {
    name: 'cd',
    description: '切换目录',
    syntax: 'cd [目录]',
    examples: ['cd /home', 'cd ..', 'cd ~'],
    category: 'directory',
  },
  {
    name: 'pwd',
    description: '显示当前工作目录',
    syntax: 'pwd',
    examples: ['pwd'],
    category: 'directory',
  },
  {
    name: 'mkdir',
    description: '创建目录',
    syntax: 'mkdir [选项] 目录...',
    options: [
      { flag: '-p', description: '递归创建父目录' },
      { flag: '-v', description: '显示创建过程' },
    ],
    examples: ['mkdir newdir', 'mkdir -p path/to/dir'],
    category: 'directory',
  },
  {
    name: 'rmdir',
    description: '删除空目录',
    syntax: 'rmdir [选项] 目录...',
    options: [
      { flag: '-p', description: '递归删除空父目录' },
    ],
    examples: ['rmdir emptydir', 'rmdir -p path/to/dir'],
    category: 'directory',
  },

  // 权限管理
  {
    name: 'chmod',
    description: '修改文件权限',
    syntax: 'chmod [选项] 模式 文件...',
    options: [
      { flag: '-R', description: '递归修改' },
      { flag: '-v', description: '显示修改过程' },
    ],
    examples: ['chmod 755 script.sh', 'chmod -R 644 directory/'],
    category: 'permission',
  },
  {
    name: 'chown',
    description: '修改文件所有者',
    syntax: 'chown [选项] 用户:组 文件...',
    options: [
      { flag: '-R', description: '递归修改' },
    ],
    examples: ['chown user:group file', 'chown -R user:group dir/'],
    category: 'permission',
  },

  // 网络
  {
    name: 'ping',
    description: '测试网络连通性',
    syntax: 'ping [选项] 主机',
    options: [
      { flag: '-c', description: '指定发送次数' },
      { flag: '-i', description: '指定间隔时间' },
    ],
    examples: ['ping google.com', 'ping -c 4 8.8.8.8'],
    category: 'network',
  },
  {
    name: 'curl',
    description: '传输 URL 内容',
    syntax: 'curl [选项] URL',
    options: [
      { flag: '-o', description: '输出到文件' },
      { flag: '-O', description: '使用远程文件名' },
      { flag: '-L', description: '跟随重定向' },
      { flag: '-H', description: '设置请求头' },
    ],
    examples: ['curl https://api.example.com', 'curl -O https://example.com/file.zip'],
    category: 'network',
  },
  {
    name: 'wget',
    description: '下载文件',
    syntax: 'wget [选项] URL',
    options: [
      { flag: '-O', description: '指定输出文件名' },
      { flag: '-c', description: '断点续传' },
      { flag: '-r', description: '递归下载' },
    ],
    examples: ['wget https://example.com/file.zip', 'wget -c https://example.com/large.iso'],
    category: 'network',
  },
  {
    name: 'ssh',
    description: '安全远程登录',
    syntax: 'ssh [选项] 用户@主机',
    options: [
      { flag: '-p', description: '指定端口' },
      { flag: '-i', description: '指定密钥文件' },
    ],
    examples: ['ssh user@192.168.1.100', 'ssh -p 2222 user@server.com'],
    category: 'network',
  },

  // 系统信息
  {
    name: 'uname',
    description: '显示系统信息',
    syntax: 'uname [选项]',
    options: [
      { flag: '-a', description: '显示所有信息' },
      { flag: '-r', description: '显示内核版本' },
    ],
    examples: ['uname -a', 'uname -r'],
    category: 'system',
  },
  {
    name: 'df',
    description: '显示磁盘空间使用情况',
    syntax: 'df [选项] [文件系统]',
    options: [
      { flag: '-h', description: '人性化显示' },
      { flag: '-T', description: '显示文件系统类型' },
    ],
    examples: ['df -h', 'df -h /home'],
    category: 'system',
  },
  {
    name: 'du',
    description: '显示目录空间使用情况',
    syntax: 'du [选项] [目录]',
    options: [
      { flag: '-h', description: '人性化显示' },
      { flag: '-s', description: '只显示总计' },
    ],
    examples: ['du -sh *', 'du -h --max-depth=1'],
    category: 'system',
  },
  {
    name: 'free',
    description: '显示内存使用情况',
    syntax: 'free [选项]',
    options: [
      { flag: '-h', description: '人性化显示' },
      { flag: '-m', description: '以 MB 为单位' },
    ],
    examples: ['free -h', 'free -m'],
    category: 'system',
  },

  // 压缩打包
  {
    name: 'tar',
    description: '打包和解包文件',
    syntax: 'tar [选项] 文件...',
    options: [
      { flag: '-c', description: '创建打包文件' },
      { flag: '-x', description: '解包文件' },
      { flag: '-v', description: '显示过程' },
      { flag: '-f', description: '指定文件名' },
      { flag: '-z', description: '使用 gzip 压缩' },
      { flag: '-j', description: '使用 bzip2 压缩' },
    ],
    examples: ['tar -czvf archive.tar.gz dir/', 'tar -xzvf archive.tar.gz'],
    category: 'archive',
  },
  {
    name: 'zip',
    description: '创建 zip 压缩文件',
    syntax: 'zip [选项] 文件.zip 文件...',
    options: [
      { flag: '-r', description: '递归压缩目录' },
      { flag: '-q', description: '静默模式' },
    ],
    examples: ['zip -r archive.zip directory/', 'zip file.zip file1 file2'],
    category: 'archive',
  },
  {
    name: 'unzip',
    description: '解压 zip 文件',
    syntax: 'unzip [选项] 文件.zip',
    options: [
      { flag: '-d', description: '指定解压目录' },
      { flag: '-l', description: '列出文件内容' },
    ],
    examples: ['unzip archive.zip', 'unzip -d /tmp archive.zip'],
    category: 'archive',
  },

  // 进程管理
  {
    name: 'ps',
    description: '显示进程状态',
    syntax: 'ps [选项]',
    options: [
      { flag: '-aux', description: '显示所有进程' },
      { flag: '-ef', description: '显示所有进程（完整格式）' },
    ],
    examples: ['ps aux', 'ps -ef | grep nginx'],
    category: 'process',
  },
  {
    name: 'top',
    description: '实时显示进程状态',
    syntax: 'top [选项]',
    options: [
      { flag: '-u', description: '只显示指定用户的进程' },
    ],
    examples: ['top', 'top -u www-data'],
    category: 'process',
  },
  {
    name: 'kill',
    description: '终止进程',
    syntax: 'kill [选项] PID...',
    options: [
      { flag: '-9', description: '强制终止' },
      { flag: '-15', description: '正常终止（默认）' },
    ],
    examples: ['kill 1234', 'kill -9 1234'],
    category: 'process',
  },
  {
    name: 'nohup',
    description: '在后台运行命令',
    syntax: 'nohup 命令 &',
    examples: ['nohup python app.py &', 'nohup ./script.sh > output.log 2>&1 &'],
    category: 'process',
  },
]

const filteredCommands = computed(() => {
  let result = commands

  if (activeCategory.value !== 'all') {
    result = result.filter(cmd => cmd.category === activeCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(cmd =>
      cmd.name.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query)
    )
  }

  return result
})
</script>
