<template>
  <div class="space-y-6">
    <!-- 输入区域 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">年龄星座计算器</h3>
      <div class="space-y-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">出生日期</label>
          <el-date-picker
            v-model="birthday"
            type="date"
            placeholder="选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            class="w-full sm:w-auto"
          />
        </div>
        <el-button type="primary" @click="calculate" :disabled="!birthday">
          开始计算
        </el-button>
      </div>
    </div>

    <!-- 结果 -->
    <div v-if="result" class="space-y-4">
      <!-- 基本信息 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">基本信息</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-blue-500">{{ result.years }}</div>
            <div class="text-xs text-gray-500 mt-1">岁</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-green-500">{{ result.months }}</div>
            <div class="text-xs text-gray-500 mt-1">月</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-purple-500">{{ result.days }}</div>
            <div class="text-xs text-gray-500 mt-1">天</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-orange-500">{{ result.totalDays.toLocaleString() }}</div>
            <div class="text-xs text-gray-500 mt-1">总天数</div>
          </div>
        </div>
      </div>

      <!-- 星座 & 生肖 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">星座</h3>
          <div class="flex items-center gap-4">
            <span class="text-4xl">{{ result.zodiacEmoji }}</span>
            <div>
              <div class="text-xl font-bold text-gray-900 dark:text-white">{{ result.zodiac }}</div>
              <div class="text-sm text-gray-500">{{ result.zodiacDate }}</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">生肖</h3>
          <div class="flex items-center gap-4">
            <span class="text-4xl">{{ result.chineseZodiacEmoji }}</span>
            <div>
              <div class="text-xl font-bold text-gray-900 dark:text-white">{{ result.chineseZodiac }}</div>
              <div class="text-sm text-gray-500">{{ result.birthYear }}年出生</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下次生日 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-3">🎂 距离下次生日</h3>
        <div class="flex items-center gap-6">
          <div class="text-center">
            <div class="text-4xl font-bold text-pink-500">{{ result.nextBirthdayDays }}</div>
            <div class="text-sm text-gray-500 mt-1">天</div>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p>下次生日：<span class="font-medium text-gray-900 dark:text-white">{{ result.nextBirthdayDate }}</span></p>
            <p class="mt-1">届时将满 <span class="font-medium text-gray-900 dark:text-white">{{ result.nextAge }}</span> 岁</p>
          </div>
        </div>
      </div>

      <!-- 更多信息 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-3">更多信息</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div class="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span class="text-gray-500">星期</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ result.dayOfWeek }}</span>
          </div>
          <div class="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span class="text-gray-500">出生小时数</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ result.totalHours.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span class="text-gray-500">出生分钟数</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ result.totalMinutes.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const birthday = ref('')

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  zodiac: string
  zodiacEmoji: string
  zodiacDate: string
  chineseZodiac: string
  chineseZodiacEmoji: string
  birthYear: number
  nextBirthdayDays: number
  nextBirthdayDate: string
  nextAge: number
  dayOfWeek: string
}

const result = ref<AgeResult | null>(null)

const zodiacSigns = [
  { name: '摩羯座', emoji: '♑', start: [1, 1], end: [1, 19] },
  { name: '水瓶座', emoji: '♒', start: [1, 20], end: [2, 18] },
  { name: '双鱼座', emoji: '♓', start: [2, 19], end: [3, 20] },
  { name: '白羊座', emoji: '♈', start: [3, 21], end: [4, 19] },
  { name: '金牛座', emoji: '♉', start: [4, 20], end: [5, 20] },
  { name: '双子座', emoji: '♊', start: [5, 21], end: [6, 21] },
  { name: '巨蟹座', emoji: '♋', start: [6, 22], end: [7, 22] },
  { name: '狮子座', emoji: '♌', start: [7, 23], end: [8, 22] },
  { name: '处女座', emoji: '♍', start: [8, 23], end: [9, 22] },
  { name: '天秤座', emoji: '♎', start: [9, 23], end: [10, 23] },
  { name: '天蝎座', emoji: '♏', start: [10, 24], end: [11, 22] },
  { name: '射手座', emoji: '♐', start: [11, 23], end: [12, 21] },
  { name: '摩羯座', emoji: '♑', start: [12, 22], end: [12, 31] },
]

const chineseZodiacAnimals = [
  { name: '鼠', emoji: '🐭' },
  { name: '牛', emoji: '🐂' },
  { name: '虎', emoji: '🐅' },
  { name: '兔', emoji: '🐇' },
  { name: '龙', emoji: '🐉' },
  { name: '蛇', emoji: '🐍' },
  { name: '马', emoji: '🐴' },
  { name: '羊', emoji: '🐑' },
  { name: '猴', emoji: '🐒' },
  { name: '鸡', emoji: '🐓' },
  { name: '狗', emoji: '🐕' },
  { name: '猪', emoji: '🐷' },
]

const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const calculate = () => {
  if (!birthday.value) return

  const birth = new Date(birthday.value)
  const now = new Date()

  // 计算年龄
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()

  if (days < 0) {
    months--
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += lastMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }

  // 总天数
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  const totalHours = totalDays * 24
  const totalMinutes = totalHours * 60

  // 星座
  const month = birth.getMonth() + 1
  const date = birth.getDate()
  const zodiac = zodiacSigns.find(z => {
    const [sm, sd] = z.start
    const [em, ed] = z.end
    return (month === sm && date >= sd) || (month === em && date <= ed)
  }) || zodiacSigns[0]

  // 生肖
  const birthYear = birth.getFullYear()
  const zodiacIndex = (birthYear - 4) % 12
  const chineseZodiac = chineseZodiacAnimals[zodiacIndex]

  // 下次生日
  const thisYearBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  let nextBirthday: Date
  if (thisYearBirthday > now) {
    nextBirthday = thisYearBirthday
  } else {
    nextBirthday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate())
  }
  const nextBirthdayDays = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const nextAge = nextBirthday.getFullYear() - birth.getFullYear()

  // 星期
  const dayOfWeek = weekDays[birth.getDay()]

  // 星座日期范围
  const zodiacDate = `${zodiac.start[0]}.${zodiac.start[1]} - ${zodiac.end[0]}.${zodiac.end[1]}`

  result.value = {
    years,
    months,
    days,
    totalDays,
    totalHours,
    totalMinutes,
    zodiac: zodiac.name,
    zodiacEmoji: zodiac.emoji,
    zodiacDate,
    chineseZodiac: chineseZodiac.name,
    chineseZodiacEmoji: chineseZodiac.emoji,
    birthYear,
    nextBirthdayDays,
    nextBirthdayDate: `${nextBirthday.getFullYear()}-${String(nextBirthday.getMonth() + 1).padStart(2, '0')}-${String(nextBirthday.getDate()).padStart(2, '0')}`,
    nextAge,
    dayOfWeek,
  }
}
</script>
