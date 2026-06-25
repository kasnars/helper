<template>
  <div class="space-y-6">
    <!-- Search -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">🔍 Emoji 搜索</h3>
      <el-input
        v-model="searchQuery"
        placeholder="搜索 Emoji，如: 笑脸、动物、食物..."
        size="large"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- Recent -->
    <div v-if="recentEmojis.length > 0 && !searchQuery" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">⏱ 最近使用</h3>
        <el-button size="small" text @click="recentEmojis = []; saveRecent()">清空</el-button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="emoji in recentEmojis"
          :key="emoji.char"
          class="text-3xl hover:scale-125 transition-transform cursor-pointer p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          :title="emoji.name"
          @click="copyEmoji(emoji)"
        >{{ emoji.char }}</button>
      </div>
    </div>

    <!-- Categories -->
    <div v-if="!searchQuery" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex flex-wrap gap-2 mb-4">
        <el-button
          v-for="cat in categories"
          :key="cat.key"
          :type="activeCategory === cat.key ? 'primary' : ''"
          :plain="activeCategory !== cat.key"
          @click="activeCategory = cat.key"
        >
          {{ cat.icon }} {{ cat.label }}
        </el-button>
      </div>
    </div>

    <!-- Emoji Grid -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
        {{ searchQuery ? `搜索结果 (${filteredEmojis.length})` : currentCategoryLabel }}
      </h3>
      <div v-if="filteredEmojis.length > 0" class="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-1">
        <button
          v-for="emoji in displayedEmojis"
          :key="emoji.char"
          class="text-2xl hover:scale-125 transition-transform cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative group"
          :title="emoji.name"
          @click="copyEmoji(emoji)"
        >{{ emoji.char }}
          <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {{ emoji.name }}
          </span>
        </button>
      </div>
      <p v-else class="text-gray-400 dark:text-gray-500 text-center py-8">没有找到匹配的 Emoji</p>
      <div v-if="filteredEmojis.length > displayCount" class="mt-4 text-center">
        <el-button @click="displayCount += 100">加载更多 ({{ filteredEmojis.length - displayCount }} 个)</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface EmojiItem {
  char: string
  name: string
  category: string
  keywords: string[]
}

const searchQuery = ref('')
const activeCategory = ref('smileys')
const displayCount = ref(100)
const recentEmojis = ref<EmojiItem[]>([])

const categories = [
  { key: 'smileys', label: '表情', icon: '😀' },
  { key: 'people', label: '人物', icon: '👋' },
  { key: 'animals', label: '动物', icon: '🐱' },
  { key: 'food', label: '食物', icon: '🍕' },
  { key: 'travel', label: '旅行', icon: '🚗' },
  { key: 'activities', label: '活动', icon: '⚽' },
  { key: 'objects', label: '物品', icon: '💡' },
  { key: 'symbols', label: '符号', icon: '❤️' },
  { key: 'flags', label: '旗帜', icon: '🏳️' },
]

const emojis: EmojiItem[] = [
  // Smileys
  { char: '😀', name: '笑脸', category: 'smileys', keywords: ['笑', '开心', 'happy', 'smile'] },
  { char: '😃', name: '哈哈', category: 'smileys', keywords: ['笑', '开心', 'happy'] },
  { char: '😄', name: '大笑', category: 'smileys', keywords: ['笑', '开心', 'laugh'] },
  { char: '😁', name: '嘻嘻', category: 'smileys', keywords: ['笑', 'grin'] },
  { char: '😆', name: '眯眼笑', category: 'smileys', keywords: ['笑', 'laugh'] },
  { char: '😅', name: '苦笑', category: 'smileys', keywords: ['汗', '尴尬', 'sweat'] },
  { char: '🤣', name: '笑哭', category: 'smileys', keywords: ['笑', '哭', 'lol'] },
  { char: '😂', name: '笑到哭', category: 'smileys', keywords: ['笑', '哭', 'joy'] },
  { char: '🙂', name: '微笑', category: 'smileys', keywords: ['微笑', 'smile'] },
  { char: '🙃', name: '倒脸', category: 'smileys', keywords: ['倒', 'upsidedown'] },
  { char: '😉', name: '眨眼', category: 'smileys', keywords: ['眨眼', 'wink'] },
  { char: '😊', name: '害羞笑', category: 'smileys', keywords: ['害羞', 'blush'] },
  { char: '😇', name: '天使', category: 'smileys', keywords: ['天使', 'angel'] },
  { char: '🥰', name: '爱心眼', category: 'smileys', keywords: ['爱', 'love', 'heart'] },
  { char: '😍', name: '花痴', category: 'smileys', keywords: ['爱', 'heart eyes'] },
  { char: '🤩', name: '星星眼', category: 'smileys', keywords: ['兴奋', 'star'] },
  { char: '😘', name: '飞吻', category: 'smileys', keywords: ['吻', 'kiss'] },
  { char: '😜', name: '吐舌眨眼', category: 'smileys', keywords: ['吐舌', 'tongue'] },
  { char: '🤔', name: '思考', category: 'smileys', keywords: ['思考', 'think'] },
  { char: '😐', name: '无语', category: 'smileys', keywords: ['无语', 'neutral'] },
  { char: '😑', name: '面无表情', category: 'smileys', keywords: ['无语', 'expressionless'] },
  { char: '😶', name: '闭嘴', category: 'smileys', keywords: ['闭嘴', 'quiet'] },
  { char: '😏', name: '得意', category: 'smileys', keywords: ['得意', 'smirk'] },
  { char: '😒', name: '不开心', category: 'smileys', keywords: ['不开心', 'unamused'] },
  { char: '🙄', name: '翻白眼', category: 'smileys', keywords: ['翻白眼', 'eye roll'] },
  { char: '😬', name: '龇牙', category: 'smileys', keywords: ['尴尬', 'grimace'] },
  { char: '😮', name: '惊讶', category: 'smileys', keywords: ['惊讶', 'surprised'] },
  { char: '😢', name: '哭', category: 'smileys', keywords: ['哭', 'sad', 'cry'] },
  { char: '😭', name: '大哭', category: 'smileys', keywords: ['哭', 'sob'] },
  { char: '😤', name: '生气', category: 'smileys', keywords: ['生气', 'angry'] },
  { char: '😠', name: '愤怒', category: 'smileys', keywords: ['愤怒', 'angry'] },
  { char: '😡', name: '发怒', category: 'smileys', keywords: ['发怒', 'rage'] },
  { char: '🥺', name: '恳求', category: 'smileys', keywords: ['恳求', 'puppy eyes'] },
  { char: '😱', name: '吓死', category: 'smileys', keywords: ['害怕', 'scream'] },
  { char: '😰', name: '冷汗', category: 'smileys', keywords: ['紧张', 'anxious'] },
  { char: '😴', name: '睡觉', category: 'smileys', keywords: ['睡觉', 'sleep'] },
  { char: '🤮', name: '呕吐', category: 'smileys', keywords: ['呕吐', 'sick'] },
  { char: '🥳', name: '庆祝', category: 'smileys', keywords: ['庆祝', 'party'] },
  { char: '😎', name: '墨镜', category: 'smileys', keywords: ['酷', 'cool'] },
  { char: '🤓', name: '书呆子', category: 'smileys', keywords: ['书呆子', 'nerd'] },
  // People
  { char: '👋', name: '挥手', category: 'people', keywords: ['挥手', 'wave', 'hello'] },
  { char: '👍', name: '点赞', category: 'people', keywords: ['赞', 'thumbs up', 'good'] },
  { char: '👎', name: '踩', category: 'people', keywords: ['踩', 'thumbs down', 'bad'] },
  { char: '👏', name: '鼓掌', category: 'people', keywords: ['鼓掌', 'clap'] },
  { char: '🙌', name: '举手', category: 'people', keywords: ['举手', 'hooray'] },
  { char: '🤝', name: '握手', category: 'people', keywords: ['握手', 'handshake'] },
  { char: '🙏', name: '祈祷', category: 'people', keywords: ['祈祷', 'pray', 'thanks'] },
  { char: '💪', name: '肌肉', category: 'people', keywords: ['肌肉', 'strong', 'muscle'] },
  { char: '✌️', name: '胜利', category: 'people', keywords: ['胜利', 'peace'] },
  { char: '🤞', name: '交叉手指', category: 'people', keywords: ['运气', 'luck'] },
  { char: '👈', name: '左指', category: 'people', keywords: ['左', 'left'] },
  { char: '👉', name: '右指', category: 'people', keywords: ['右', 'right'] },
  { char: '👆', name: '上指', category: 'people', keywords: ['上', 'up'] },
  { char: '👇', name: '下指', category: 'people', keywords: ['下', 'down'] },
  { char: '👀', name: '眼睛', category: 'people', keywords: ['眼睛', 'eyes', 'look'] },
  { char: '👁️', name: '一只眼', category: 'people', keywords: ['眼睛', 'eye'] },
  { char: '👅', name: '舌头', category: 'people', keywords: ['舌头', 'tongue'] },
  { char: '👄', name: '嘴巴', category: 'people', keywords: ['嘴巴', 'mouth', 'lips'] },
  { char: '👶', name: '婴儿', category: 'people', keywords: ['婴儿', 'baby'] },
  { char: '👨', name: '男人', category: 'people', keywords: ['男人', 'man'] },
  { char: '👩', name: '女人', category: 'people', keywords: ['女人', 'woman'] },
  { char: '🧓', name: '老人', category: 'people', keywords: ['老人', 'old'] },
  { char: '🎅', name: '圣诞老人', category: 'people', keywords: ['圣诞', 'santa'] },
  { char: '🦸', name: '超级英雄', category: 'people', keywords: ['英雄', 'hero'] },
  { char: '🧙', name: '法师', category: 'people', keywords: ['法师', 'wizard'] },
  // Animals
  { char: '🐱', name: '猫', category: 'animals', keywords: ['猫', 'cat', 'kitty'] },
  { char: '🐶', name: '狗', category: 'animals', keywords: ['狗', 'dog', 'puppy'] },
  { char: '🐭', name: '老鼠', category: 'animals', keywords: ['老鼠', 'mouse'] },
  { char: '🐹', name: '仓鼠', category: 'animals', keywords: ['仓鼠', 'hamster'] },
  { char: '🐰', name: '兔子', category: 'animals', keywords: ['兔子', 'rabbit'] },
  { char: '🦊', name: '狐狸', category: 'animals', keywords: ['狐狸', 'fox'] },
  { char: '🐻', name: '熊', category: 'animals', keywords: ['熊', 'bear'] },
  { char: '🐼', name: '熊猫', category: 'animals', keywords: ['熊猫', 'panda'] },
  { char: '🐨', name: '考拉', category: 'animals', keywords: ['考拉', 'koala'] },
  { char: '🐯', name: '老虎', category: 'animals', keywords: ['老虎', 'tiger'] },
  { char: '🦁', name: '狮子', category: 'animals', keywords: ['狮子', 'lion'] },
  { char: '🐮', name: '牛', category: 'animals', keywords: ['牛', 'cow'] },
  { char: '🐷', name: '猪', category: 'animals', keywords: ['猪', 'pig'] },
  { char: '🐸', name: '青蛙', category: 'animals', keywords: ['青蛙', 'frog'] },
  { char: '🐵', name: '猴子', category: 'animals', keywords: ['猴子', 'monkey'] },
  { char: '🐔', name: '鸡', category: 'animals', keywords: ['鸡', 'chicken'] },
  { char: '🐧', name: '企鹅', category: 'animals', keywords: ['企鹅', 'penguin'] },
  { char: '🐦', name: '鸟', category: 'animals', keywords: ['鸟', 'bird'] },
  { char: '🦅', name: '鹰', category: 'animals', keywords: ['鹰', 'eagle'] },
  { char: '🦆', name: '鸭子', category: 'animals', keywords: ['鸭子', 'duck'] },
  { char: '🦉', name: '猫头鹰', category: 'animals', keywords: ['猫头鹰', 'owl'] },
  { char: '🐍', name: '蛇', category: 'animals', keywords: ['蛇', 'snake'] },
  { char: '🐢', name: '乌龟', category: 'animals', keywords: ['乌龟', 'turtle'] },
  { char: '🐟', name: '鱼', category: 'animals', keywords: ['鱼', 'fish'] },
  { char: '🐠', name: '热带鱼', category: 'animals', keywords: ['热带鱼', 'tropical fish'] },
  { char: '🐙', name: '章鱼', category: 'animals', keywords: ['章鱼', 'octopus'] },
  { char: '🦋', name: '蝴蝶', category: 'animals', keywords: ['蝴蝶', 'butterfly'] },
  { char: '🐝', name: '蜜蜂', category: 'animals', keywords: ['蜜蜂', 'bee'] },
  { char: '🐞', name: '瓢虫', category: 'animals', keywords: ['瓢虫', 'ladybug'] },
  { char: '🌸', name: '樱花', category: 'animals', keywords: ['花', 'cherry blossom'] },
  // Food
  { char: '🍕', name: '披萨', category: 'food', keywords: ['披萨', 'pizza'] },
  { char: '🍔', name: '汉堡', category: 'food', keywords: ['汉堡', 'burger', 'hamburger'] },
  { char: '🍟', name: '薯条', category: 'food', keywords: ['薯条', 'fries'] },
  { char: '🌭', name: '热狗', category: 'food', keywords: ['热狗', 'hotdog'] },
  { char: '🍿', name: '爆米花', category: 'food', keywords: ['爆米花', 'popcorn'] },
  { char: '🧂', name: '盐', category: 'food', keywords: ['盐', 'salt'] },
  { char: '🥚', name: '蛋', category: 'food', keywords: ['蛋', 'egg'] },
  { char: '🍳', name: '煎蛋', category: 'food', keywords: ['煎蛋', 'fried egg'] },
  { char: '🥞', name: '煎饼', category: 'food', keywords: ['煎饼', 'pancake'] },
  { char: '🧇', name: '华夫饼', category: 'food', keywords: ['华夫饼', 'waffle'] },
  { char: '🍞', name: '面包', category: 'food', keywords: ['面包', 'bread'] },
  { char: '🥐', name: '牛角面包', category: 'food', keywords: ['牛角面包', 'croissant'] },
  { char: '🧀', name: '奶酪', category: 'food', keywords: ['奶酪', 'cheese'] },
  { char: '🍖', name: '肉', category: 'food', keywords: ['肉', 'meat'] },
  { char: '🍗', name: '鸡腿', category: 'food', keywords: ['鸡腿', 'chicken leg'] },
  { char: '🥩', name: '牛排', category: 'food', keywords: ['牛排', 'steak'] },
  { char: '🍣', name: '寿司', category: 'food', keywords: ['寿司', 'sushi'] },
  { char: '🍱', name: '便当', category: 'food', keywords: ['便当', 'bento'] },
  { char: '🍜', name: '拉面', category: 'food', keywords: ['拉面', 'noodles', 'ramen'] },
  { char: '🍝', name: '意面', category: 'food', keywords: ['意面', 'pasta', 'spaghetti'] },
  { char: '🍚', name: '米饭', category: 'food', keywords: ['米饭', 'rice'] },
  { char: '🍙', name: '饭团', category: 'food', keywords: ['饭团', 'onigiri'] },
  { char: '🍰', name: '蛋糕', category: 'food', keywords: ['蛋糕', 'cake'] },
  { char: '🎂', name: '生日蛋糕', category: 'food', keywords: ['生日', 'birthday cake'] },
  { char: '🍮', name: '布丁', category: 'food', keywords: ['布丁', 'pudding'] },
  { char: '🍩', name: '甜甜圈', category: 'food', keywords: ['甜甜圈', 'donut'] },
  { char: '🍪', name: '饼干', category: 'food', keywords: ['饼干', 'cookie'] },
  { char: '🍫', name: '巧克力', category: 'food', keywords: ['巧克力', 'chocolate'] },
  { char: '🍬', name: '糖果', category: 'food', keywords: ['糖果', 'candy'] },
  { char: '🍎', name: '苹果', category: 'food', keywords: ['苹果', 'apple'] },
  { char: '🍊', name: '橘子', category: 'food', keywords: ['橘子', 'orange'] },
  { char: '🍋', name: '柠檬', category: 'food', keywords: ['柠檬', 'lemon'] },
  { char: '🍇', name: '葡萄', category: 'food', keywords: ['葡萄', 'grape'] },
  { char: '🍓', name: '草莓', category: 'food', keywords: ['草莓', 'strawberry'] },
  { char: '🍉', name: '西瓜', category: 'food', keywords: ['西瓜', 'watermelon'] },
  { char: '🍌', name: '香蕉', category: 'food', keywords: ['香蕉', 'banana'] },
  { char: '🥑', name: '牛油果', category: 'food', keywords: ['牛油果', 'avocado'] },
  { char: '☕', name: '咖啡', category: 'food', keywords: ['咖啡', 'coffee'] },
  { char: '🍵', name: '茶', category: 'food', keywords: ['茶', 'tea'] },
  { char: '🍺', name: '啤酒', category: 'food', keywords: ['啤酒', 'beer'] },
  { char: '🍷', name: '红酒', category: 'food', keywords: ['红酒', 'wine'] },
  { char: '🥤', name: '饮料', category: 'food', keywords: ['饮料', 'juice', 'drink'] },
  // Travel
  { char: '🚗', name: '汽车', category: 'travel', keywords: ['汽车', 'car'] },
  { char: '🚕', name: '出租车', category: 'travel', keywords: ['出租车', 'taxi'] },
  { char: '🚌', name: '公交车', category: 'travel', keywords: ['公交车', 'bus'] },
  { char: '🚆', name: '火车', category: 'travel', keywords: ['火车', 'train'] },
  { char: '✈️', name: '飞机', category: 'travel', keywords: ['飞机', 'airplane', 'fly'] },
  { char: '🚀', name: '火箭', category: 'travel', keywords: ['火箭', 'rocket'] },
  { char: '🚢', name: '轮船', category: 'travel', keywords: ['轮船', 'ship'] },
  { char: '🚲', name: '自行车', category: 'travel', keywords: ['自行车', 'bike', 'bicycle'] },
  { char: '🏠', name: '房子', category: 'travel', keywords: ['房子', 'house', 'home'] },
  { char: '🏢', name: '办公楼', category: 'travel', keywords: ['办公楼', 'office', 'building'] },
  { char: '🏥', name: '医院', category: 'travel', keywords: ['医院', 'hospital'] },
  { char: '🏫', name: '学校', category: 'travel', keywords: ['学校', 'school'] },
  { char: '🏰', name: '城堡', category: 'travel', keywords: ['城堡', 'castle'] },
  { char: '🗼', name: '东京塔', category: 'travel', keywords: ['东京塔', 'tower', 'tokyo'] },
  { char: '🗽', name: '自由女神', category: 'travel', keywords: ['自由女神', 'liberty'] },
  { char: '🌍', name: '地球', category: 'travel', keywords: ['地球', 'earth', 'globe'] },
  { char: '🌙', name: '月亮', category: 'travel', keywords: ['月亮', 'moon'] },
  { char: '⭐', name: '星星', category: 'travel', keywords: ['星星', 'star'] },
  { char: '☀️', name: '太阳', category: 'travel', keywords: ['太阳', 'sun'] },
  { char: '🌈', name: '彩虹', category: 'travel', keywords: ['彩虹', 'rainbow'] },
  { char: '⛅', name: '多云', category: 'travel', keywords: ['多云', 'cloud'] },
  { char: '❄️', name: '雪花', category: 'travel', keywords: ['雪花', 'snow', 'winter'] },
  { char: '🔥', name: '火', category: 'travel', keywords: ['火', 'fire', 'hot'] },
  { char: '💧', name: '水滴', category: 'travel', keywords: ['水滴', 'water', 'drop'] },
  // Activities
  { char: '⚽', name: '足球', category: 'activities', keywords: ['足球', 'soccer', 'football'] },
  { char: '🏀', name: '篮球', category: 'activities', keywords: ['篮球', 'basketball'] },
  { char: '🏈', name: '橄榄球', category: 'activities', keywords: ['橄榄球', 'football'] },
  { char: '⚾', name: '棒球', category: 'activities', keywords: ['棒球', 'baseball'] },
  { char: '🎾', name: '网球', category: 'activities', keywords: ['网球', 'tennis'] },
  { char: '🏐', name: '排球', category: 'activities', keywords: ['排球', 'volleyball'] },
  { char: '🎱', name: '台球', category: 'activities', keywords: ['台球', 'pool', 'billiards'] },
  { char: '🏓', name: '乒乓球', category: 'activities', keywords: ['乒乓球', 'ping pong'] },
  { char: '🏸', name: '羽毛球', category: 'activities', keywords: ['羽毛球', 'badminton'] },
  { char: '🥊', name: '拳击', category: 'activities', keywords: ['拳击', 'boxing'] },
  { char: '🎯', name: '靶心', category: 'activities', keywords: ['靶心', 'target', 'dart'] },
  { char: '🎮', name: '游戏手柄', category: 'activities', keywords: ['游戏', 'game', 'controller'] },
  { char: '🎲', name: '骰子', category: 'activities', keywords: ['骰子', 'dice'] },
  { char: '🧩', name: '拼图', category: 'activities', keywords: ['拼图', 'puzzle'] },
  { char: '🎭', name: '面具', category: 'activities', keywords: ['面具', 'theater', 'drama'] },
  { char: '🎨', name: '画板', category: 'activities', keywords: ['画板', 'art', 'paint'] },
  { char: '🎬', name: '电影', category: 'activities', keywords: ['电影', 'movie', 'film'] },
  { char: '🎤', name: '麦克风', category: 'activities', keywords: ['麦克风', 'microphone', 'karaoke'] },
  { char: '🎧', name: '耳机', category: 'activities', keywords: ['耳机', 'headphones', 'music'] },
  { char: '🎵', name: '音符', category: 'activities', keywords: ['音符', 'music', 'note'] },
  { char: '🎹', name: '钢琴', category: 'activities', keywords: ['钢琴', 'piano'] },
  { char: '🎸', name: '吉他', category: 'activities', keywords: ['吉他', 'guitar'] },
  { char: '🎺', name: '小号', category: 'activities', keywords: ['小号', 'trumpet'] },
  { char: '🥁', name: '鼓', category: 'activities', keywords: ['鼓', 'drum'] },
  // Objects
  { char: '💡', name: '灯泡', category: 'objects', keywords: ['灯泡', 'idea', 'light'] },
  { char: '📱', name: '手机', category: 'objects', keywords: ['手机', 'phone', 'mobile'] },
  { char: '💻', name: '电脑', category: 'objects', keywords: ['电脑', 'laptop', 'computer'] },
  { char: '⌨️', name: '键盘', category: 'objects', keywords: ['键盘', 'keyboard'] },
  { char: '🖥️', name: '显示器', category: 'objects', keywords: ['显示器', 'monitor', 'desktop'] },
  { char: '📷', name: '相机', category: 'objects', keywords: ['相机', 'camera'] },
  { char: '📹', name: '摄像机', category: 'objects', keywords: ['摄像机', 'video'] },
  { char: '📺', name: '电视', category: 'objects', keywords: ['电视', 'tv'] },
  { char: '📻', name: '收音机', category: 'objects', keywords: ['收音机', 'radio'] },
  { char: '🔔', name: '铃铛', category: 'objects', keywords: ['铃铛', 'bell', 'notification'] },
  { char: '📌', name: '图钉', category: 'objects', keywords: ['图钉', 'pin', 'pushpin'] },
  { char: '📎', name: '回形针', category: 'objects', keywords: ['回形针', 'paperclip'] },
  { char: '✏️', name: '铅笔', category: 'objects', keywords: ['铅笔', 'pencil', 'write'] },
  { char: '📝', name: '备忘录', category: 'objects', keywords: ['备忘录', 'memo', 'note'] },
  { char: '📖', name: '书', category: 'objects', keywords: ['书', 'book', 'read'] },
  { char: '📚', name: '书本', category: 'objects', keywords: ['书本', 'books'] },
  { char: '🔑', name: '钥匙', category: 'objects', keywords: ['钥匙', 'key'] },
  { char: '🔒', name: '锁', category: 'objects', keywords: ['锁', 'lock', 'secure'] },
  { char: '🔓', name: '开锁', category: 'objects', keywords: ['开锁', 'unlock'] },
  { char: '⏰', name: '闹钟', category: 'objects', keywords: ['闹钟', 'alarm', 'clock'] },
  { char: '⌚', name: '手表', category: 'objects', keywords: ['手表', 'watch', 'time'] },
  { char: '💰', name: '钱袋', category: 'objects', keywords: ['钱', 'money', 'bag'] },
  { char: '💎', name: '钻石', category: 'objects', keywords: ['钻石', 'diamond', 'gem'] },
  { char: '🧲', name: '磁铁', category: 'objects', keywords: ['磁铁', 'magnet'] },
  { char: '🎁', name: '礼物', category: 'objects', keywords: ['礼物', 'gift', 'present'] },
  { char: '🧸', name: '泰迪熊', category: 'objects', keywords: ['泰迪熊', 'teddy bear'] },
  // Symbols
  { char: '❤️', name: '红心', category: 'symbols', keywords: ['红心', 'heart', 'love'] },
  { char: '💔', name: '心碎', category: 'symbols', keywords: ['心碎', 'broken heart'] },
  { char: '💕', name: '两颗心', category: 'symbols', keywords: ['两颗心', 'love', 'hearts'] },
  { char: '💖', name: '闪亮的心', category: 'symbols', keywords: ['闪亮', 'sparkling heart'] },
  { char: '✨', name: '闪光', category: 'symbols', keywords: ['闪光', 'sparkle', 'star'] },
  { char: '💫', name: '头晕', category: 'symbols', keywords: ['头晕', 'dizzy'] },
  { char: '💥', name: '碰撞', category: 'symbols', keywords: ['碰撞', 'boom', 'collision'] },
  { char: '💢', name: '愤怒', category: 'symbols', keywords: ['愤怒', 'anger'] },
  { char: '💬', name: '对话气泡', category: 'symbols', keywords: ['对话', 'chat', 'speech'] },
  { char: '💭', name: '思考气泡', category: 'symbols', keywords: ['思考', 'thought'] },
  { char: '💤', name: '睡觉', category: 'symbols', keywords: ['睡觉', 'zzz', 'sleep'] },
  { char: '✅', name: '绿色对勾', category: 'symbols', keywords: ['对勾', 'check', 'done', 'yes'] },
  { char: '❌', name: '叉', category: 'symbols', keywords: ['叉', 'cross', 'no', 'wrong'] },
  { char: '⚠️', name: '警告', category: 'symbols', keywords: ['警告', 'warning'] },
  { char: '🚫', name: '禁止', category: 'symbols', keywords: ['禁止', 'prohibited', 'no'] },
  { char: '❓', name: '问号', category: 'symbols', keywords: ['问号', 'question'] },
  { char: '❗', name: '感叹号', category: 'symbols', keywords: ['感叹号', 'exclamation'] },
  { char: '💯', name: '满分', category: 'symbols', keywords: ['满分', '100', 'perfect'] },
  { char: '♻️', name: '循环', category: 'symbols', keywords: ['循环', 'recycle'] },
  { char: '🔴', name: '红色圆', category: 'symbols', keywords: ['红色', 'red', 'circle'] },
  { char: '🟢', name: '绿色圆', category: 'symbols', keywords: ['绿色', 'green', 'circle'] },
  { char: '🔵', name: '蓝色圆', category: 'symbols', keywords: ['蓝色', 'blue', 'circle'] },
  { char: '⬆️', name: '向上', category: 'symbols', keywords: ['向上', 'up', 'arrow'] },
  { char: '⬇️', name: '向下', category: 'symbols', keywords: ['向下', 'down', 'arrow'] },
  { char: '⬅️', name: '向左', category: 'symbols', keywords: ['向左', 'left', 'arrow'] },
  { char: '➡️', name: '向右', category: 'symbols', keywords: ['向右', 'right', 'arrow'] },
  { char: '🔄', name: '刷新', category: 'symbols', keywords: ['刷新', 'refresh', 'reload'] },
  { char: '🔃', name: '顺时针', category: 'symbols', keywords: ['顺时针', 'clockwise'] },
  // Flags
  { char: '🏳️', name: '白旗', category: 'flags', keywords: ['白旗', 'white flag', 'surrender'] },
  { char: '🏴', name: '黑旗', category: 'flags', keywords: ['黑旗', 'black flag'] },
  { char: '🏁', name: '格子旗', category: 'flags', keywords: ['格子旗', 'checkered', 'finish'] },
  { char: '🇨🇳', name: '中国国旗', category: 'flags', keywords: ['中国', 'china', 'flag'] },
  { char: '🇺🇸', name: '美国国旗', category: 'flags', keywords: ['美国', 'usa', 'america'] },
  { char: '🇯🇵', name: '日本国旗', category: 'flags', keywords: ['日本', 'japan'] },
  { char: '🇰🇷', name: '韩国国旗', category: 'flags', keywords: ['韩国', 'korea'] },
  { char: '🇬🇧', name: '英国国旗', category: 'flags', keywords: ['英国', 'uk', 'britain'] },
  { char: '🇫🇷', name: '法国国旗', category: 'flags', keywords: ['法国', 'france'] },
  { char: '🇩🇪', name: '德国国旗', category: 'flags', keywords: ['德国', 'germany'] },
  { char: '🇮🇹', name: '意大利国旗', category: 'flags', keywords: ['意大利', 'italy'] },
  { char: '🇪🇸', name: '西班牙国旗', category: 'flags', keywords: ['西班牙', 'spain'] },
  { char: '🇷🇺', name: '俄罗斯国旗', category: 'flags', keywords: ['俄罗斯', 'russia'] },
  { char: '🇧🇷', name: '巴西国旗', category: 'flags', keywords: ['巴西', 'brazil'] },
  { char: '🇦🇺', name: '澳大利亚国旗', category: 'flags', keywords: ['澳大利亚', 'australia'] },
  { char: '🇨🇦', name: '加拿大国旗', category: 'flags', keywords: ['加拿大', 'canada'] },
]

const currentCategoryLabel = computed(() => {
  const cat = categories.find(c => c.key === activeCategory.value)
  return cat ? `${cat.icon} ${cat.label}` : ''
})

const filteredEmojis = computed(() => {
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    return emojis.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.keywords.some(k => k.toLowerCase().includes(q))
    )
  }
  return emojis.filter(e => e.category === activeCategory.value)
})

const displayedEmojis = computed(() => filteredEmojis.value.slice(0, displayCount.value))

watch(searchQuery, () => { displayCount.value = 100 })
watch(activeCategory, () => { displayCount.value = 100 })

const copyEmoji = async (emoji: EmojiItem) => {
  try {
    await navigator.clipboard.writeText(emoji.char)
    ElMessage.success(`已复制 ${emoji.char} ${emoji.name}`)
    addToRecent(emoji)
  } catch {
    ElMessage.error('复制失败')
  }
}

const addToRecent = (emoji: EmojiItem) => {
  recentEmojis.value = recentEmojis.value.filter(e => e.char !== emoji.char)
  recentEmojis.value.unshift(emoji)
  if (recentEmojis.value.length > 20) recentEmojis.value.pop()
  saveRecent()
}

const saveRecent = () => {
  try {
    localStorage.setItem('emoji_recent', JSON.stringify(recentEmojis.value.map(e => e.char)))
  } catch {}
}

const loadRecent = () => {
  try {
    const saved = localStorage.getItem('emoji_recent')
    if (saved) {
      const chars: string[] = JSON.parse(saved)
      recentEmojis.value = chars
        .map(char => emojis.find(e => e.char === char))
        .filter((e): e is EmojiItem => !!e)
    }
  } catch {}
}

onMounted(() => loadRecent())
</script>
