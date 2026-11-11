export type ToolPageId = 'life' | 'image' | 'utility' | 'text' | 'other' | 'dev'
export type ToolCategory = 'format' | 'encode' | 'css' | 'system'

export interface ToolDefinition {
  id: string
  name: string
  shortName: string
  description: string
  keywords: string[]
  icon: string
  page: ToolPageId
  category?: ToolCategory
  load: () => Promise<unknown>
}

export const PAGE_TITLES: Record<string, string> = {
  '/': '首页',
  '/life': '生活工具',
  '/imagetools': '图片工具',
  '/utility': '实用工具',
  '/texttools': '文本工具',
  '/other': '其他工具',
  '/devtools': '开发工具',
  '/securitytools': '编码与安全',
  '/webtools': 'Web 与 CSS',
  '/systemtools': '系统与网络',
}

const tool = (entry: ToolDefinition) => entry

export const tools: ToolDefinition[] = [
  tool({ id: 'food', name: '今天吃什么', shortName: '吃什么', description: '转盘决定今天吃什么', keywords: ['美食', '外卖', '随机'], icon: 'Food', page: 'life', load: () => import('../views/FoodPicker.vue') }),
  tool({ id: 'random', name: '随机数生成', shortName: '随机数', description: '按范围生成随机数', keywords: ['抽签', '数字'], icon: 'CircleCheckFilled', page: 'life', load: () => import('../views/RandomNumber.vue') }),
  tool({ id: 'bmi', name: 'BMI 计算', shortName: 'BMI', description: '身体质量指数', keywords: ['体重', '健康'], icon: 'DataLine', page: 'life', load: () => import('../components/life/BmiCalculator.vue') }),
  tool({ id: 'age', name: '年龄星座', shortName: '年龄', description: '根据生日计算年龄和星座', keywords: ['生日'], icon: 'Calendar', page: 'life', load: () => import('../components/life/AgeCalculator.vue') }),
  tool({ id: 'datecalc', name: '日期计算', shortName: '日期', description: '计算日期间隔或推算日期', keywords: ['间隔'], icon: 'Timer', page: 'life', load: () => import('../components/life/DateCalculator.vue') }),
  tool({ id: 'countdown', name: '倒计时与纪念日', shortName: '倒计时', description: '记录未来倒计时和已经过的日子', keywords: ['纪念日', '周年', '倒数'], icon: 'AlarmClock', page: 'life', load: () => import('../components/life/CountdownTool.vue') }),
  tool({ id: 'pomodoro', name: '番茄钟', shortName: '番茄钟', description: '专注计时、每日复盘和本周统计', keywords: ['pomodoro', '专注', '计时'], icon: 'Timer', page: 'life', load: () => import('../components/life/PomodoroTimer.vue') }),
  tool({ id: 'expense', name: '记账本', shortName: '记账', description: '分类记账、汇总和 CSV 导入导出', keywords: ['支出', '账单', 'csv'], icon: 'Money', page: 'life', load: () => import('../components/life/ExpenseBook.vue') }),
  tool({ id: 'tax', name: '个税计算', shortName: '个税', description: '工资薪金累计预扣法', keywords: ['所得税', '税率'], icon: 'Tickets', page: 'life', load: () => import('../components/life/TaxCalculator.vue') }),
  tool({ id: 'mortgage', name: '房贷计算', shortName: '房贷', description: '等额本息与等额本金还款计划', keywords: ['贷款', '月供'], icon: 'House', page: 'life', load: () => import('../components/life/MortgageCalculator.vue') }),
  tool({ id: 'calorie', name: '热量计算', shortName: '热量', description: '估算基础代谢和热量', keywords: ['卡路里'], icon: 'DataLine', page: 'life', load: () => import('../components/life/CalorieCalculator.vue') }),
  tool({ id: 'lottery', name: '彩票号码', shortName: '彩票', description: '生成一组随机号码', keywords: ['双色球'], icon: 'CircleCheckFilled', page: 'life', load: () => import('../components/life/LotteryGenerator.vue') }),
  tool({ id: 'group', name: '随机分组', shortName: '分组', description: '把名单随机分成若干组', keywords: ['分组'], icon: 'Grid', page: 'life', load: () => import('../components/life/RandomGroup.vue') }),
  tool({ id: 'draw', name: '随机抽签', shortName: '抽签', description: '从名单中随机抽取', keywords: ['抽奖'], icon: 'Star', page: 'life', load: () => import('../components/life/RandomDraw.vue') }),

  tool({ id: 'processor', name: '图片处理', shortName: '处理', description: '压缩和转换图片格式', keywords: ['压缩', 'webp'], icon: 'Picture', page: 'image', load: () => import('../views/ImageProcessor.vue') }),
  tool({ id: 'crop', name: '图片裁剪', shortName: '裁剪', description: '按区域裁剪图片', keywords: ['crop'], icon: 'Crop', page: 'image', load: () => import('../components/file/ImageCropper.vue') }),
  tool({ id: 'watermark', name: '图片水印', shortName: '水印', description: '添加文字或图片水印', keywords: ['watermark'], icon: 'Picture', page: 'image', load: () => import('../components/dev/ImageWatermark.vue') }),
  tool({ id: 'exif', name: 'EXIF 信息', shortName: 'EXIF', description: '查看 GPS 等元数据并下载清除后的副本', keywords: ['gps', '元数据'], icon: 'InfoFilled', page: 'image', load: () => import('../components/file/ImageExif.vue') }),
  tool({ id: 'stitch', name: '长图拼接', shortName: '拼接', description: '纵向或横向拼接多张图片', keywords: ['长截图', '拼接'], icon: 'Grid', page: 'image', load: () => import('../components/image/ImageStitch.vue') }),
  tool({ id: 'ocr', name: '图片 OCR', shortName: 'OCR', description: '识别图片中的中文和英文', keywords: ['tesseract', '文字识别'], icon: 'View', page: 'image', load: () => import('../components/image/ImageOcr.vue') }),
  tool({ id: 'videogif', name: '视频转 GIF', shortName: 'GIF', description: '在浏览器里把视频片段转成 GIF', keywords: ['ffmpeg', '动图'], icon: 'VideoCamera', page: 'image', load: () => import('../components/image/VideoToGif.vue') }),
  tool({ id: 'favicon', name: '图标生成', shortName: '图标', description: '导出多尺寸图标、压缩包和 manifest', keywords: ['favicon', 'pwa'], icon: 'Picture', page: 'image', load: () => import('../components/image/FaviconGenerator.vue') }),
  tool({ id: 'idphoto', name: '证件照换底色', shortName: '证件照', description: '更换证件照背景色', keywords: ['底色'], icon: 'Avatar', page: 'image', load: () => import('../components/file/IdPhotoBg.vue') }),
  tool({ id: 'pixelart', name: '像素画', shortName: '像素', description: '把图片变成像素风', keywords: ['像素'], icon: 'Grid', page: 'image', load: () => import('../components/image/ImagePixelArt.vue') }),
  tool({ id: 'formatdetect', name: '格式检测', shortName: '检测', description: '识别图片的真实格式', keywords: ['mime'], icon: 'Document', page: 'image', load: () => import('../components/image/ImageFormatDetector.vue') }),
  tool({ id: 'collage', name: '图片拼贴', shortName: '拼贴', description: '把多张图排成拼贴', keywords: ['拼图'], icon: 'Grid', page: 'image', load: () => import('../components/image/ImageCollage.vue') }),
  tool({ id: 'gifcreator', name: 'GIF 制作', shortName: 'GIF', description: '用多张图片制作 GIF', keywords: ['动图'], icon: 'VideoPlay', page: 'image', load: () => import('../components/image/GifCreator.vue') }),
  tool({ id: 'gifextractor', name: 'GIF 拆帧', shortName: '拆帧', description: '把 GIF 拆成单帧', keywords: ['帧'], icon: 'Film', page: 'image', load: () => import('../components/image/GifExtractor.vue') }),
  tool({ id: 'annotator', name: '图片标注', shortName: '标注', description: '在图片上画箭头和文字', keywords: ['标注'], icon: 'EditPen', page: 'image', load: () => import('../components/image/ImageAnnotator.vue') }),
  tool({ id: 'colorpicker', name: '颜色拾取', shortName: '拾色', description: '从图片上取色', keywords: ['取色'], icon: 'Brush', page: 'image', load: () => import('../components/image/ImageColorPicker.vue') }),
  tool({ id: 'ascii', name: 'ASCII 艺术', shortName: 'ASCII', description: '把图片转成字符画', keywords: ['字符画'], icon: 'Memo', page: 'image', load: () => import('../components/image/AsciiArtGenerator.vue') }),
  tool({ id: 'batchresize', name: '批量调整尺寸', shortName: '尺寸', description: '一次调整多张图片的尺寸', keywords: ['缩放'], icon: 'Picture', page: 'image', load: () => import('../components/image/BatchImageResizer.vue') }),

  tool({ id: 'unit', name: '单位换算', shortName: '换算', description: '长度、重量、温度等单位换算', keywords: ['单位', '温度'], icon: 'ScaleToOriginal', page: 'utility', load: () => import('../components/dev/UnitConverter.vue') }),
  tool({ id: 'currency', name: '汇率换算', shortName: '汇率', description: '查询汇率，离线时使用缓存或估算', keywords: ['货币', '美元', '人民币'], icon: 'Coin', page: 'utility', load: () => import('../components/utility/CurrencyConverter.vue') }),
  tool({ id: 'password', name: '密码生成', shortName: '密码', description: '生成随机密码', keywords: ['password'], icon: 'Lock', page: 'utility', load: () => import('../components/life/PasswordGenerator.vue') }),
  tool({ id: 'encrypt', name: '加密解密', shortName: '加密', description: '对文本做对称加密', keywords: ['aes'], icon: 'Key', page: 'utility', load: () => import('../components/life/TextEncryptor.vue') }),
  tool({ id: 'cron', name: 'Cron 解析', shortName: 'Cron', description: '用中文解释 Cron，并列出接下来 10 次运行', keywords: ['定时', 'crontab'], icon: 'Timer', page: 'utility', load: () => import('../components/dev/CronGenerator.vue') }),
  tool({ id: 'mock', name: 'Mock 数据', shortName: 'Mock', description: '由 interface 或 JSON 示例生成假数据', keywords: ['faker', '模拟'], icon: 'DataLine', page: 'utility', load: () => import('../components/utility/MockDataGenerator.vue') }),
  tool({ id: 'aicost', name: 'AI 费用估算', shortName: '费用', description: '按百万 token 单价对比模型费用', keywords: ['token', 'openai', '价格'], icon: 'Cpu', page: 'utility', load: () => import('../components/utility/AiCostCalculator.vue') }),
  tool({ id: 'json2excel', name: 'JSON 转 Excel', shortName: 'Excel', description: '把 JSON 转成表格文件', keywords: ['xlsx'], icon: 'Grid', page: 'utility', load: () => import('../components/utility/JsonToExcel.vue') }),
  tool({ id: 'amount', name: '金额大写', shortName: '金额', description: '把数字金额转成中文大写', keywords: ['人民币'], icon: 'Money', page: 'utility', load: () => import('../components/utility/AmountToChinese.vue') }),
  tool({ id: 'tts', name: '文字转语音', shortName: '语音', description: '用浏览器朗读文本', keywords: ['tts'], icon: 'Microphone', page: 'utility', load: () => import('../components/utility/TextToSpeech.vue') }),
  tool({ id: 'cssunit', name: 'CSS 单位转换', shortName: 'CSS', description: 'px、rem、em 互转', keywords: ['rem'], icon: 'SetUp', page: 'utility', load: () => import('../components/utility/CssUnitConverter.vue') }),
  tool({ id: 'jsontree', name: 'JSON 查看器', shortName: 'JSON树', description: '树形查看 JSON', keywords: ['json'], icon: 'Share', page: 'utility', load: () => import('../components/utility/JsonTreeView.vue') }),
  tool({ id: 'audioviz', name: '音频可视化', shortName: '波形', description: '查看音频波形', keywords: ['音频'], icon: 'Headset', page: 'utility', load: () => import('../components/utility/AudioVisualizer.vue') }),
  tool({ id: 'pwcheck', name: '密码强度', shortName: '强度', description: '评估密码强度', keywords: ['密码'], icon: 'Lock', page: 'utility', load: () => import('../components/utility/PasswordStrengthChecker.vue') }),
  tool({ id: 'totp', name: 'TOTP 验证码', shortName: 'TOTP', description: '生成一次性验证码', keywords: ['2fa', 'otp'], icon: 'Key', page: 'utility', load: () => import('../components/utility/TotpGenerator.vue') }),
  tool({ id: 'backup', name: '数据备份', shortName: '备份', description: '导出或恢复本工具箱的本地数据', keywords: ['导入', '导出', 'json'], icon: 'Download', page: 'utility', load: () => import('../components/utility/DataBackup.vue') }),

  tool({ id: 'regex', name: '正则测试', shortName: '正则', description: '测试正则表达式', keywords: ['regexp'], icon: 'Search', page: 'text', load: () => import('../components/dev/RegexTester.vue') }),
  tool({ id: 'regexviz', name: '正则可视化', shortName: '可视化', description: '把正则画成结构', keywords: ['regex'], icon: 'View', page: 'text', load: () => import('../components/text/RegexVisualizer.vue') }),
  tool({ id: 'textstat', name: '文本统计', shortName: '统计', description: '统计字数和行数', keywords: ['字数'], icon: 'Reading', page: 'text', load: () => import('../components/dev/TextStatTool.vue') }),
  tool({ id: 'textdedup', name: '文本去重', shortName: '去重', description: '去掉重复行', keywords: ['去重'], icon: 'Delete', page: 'text', load: () => import('../components/dev/TextDedup.vue') }),
  tool({ id: 'markdown', name: 'Markdown 编辑', shortName: 'MD', description: '实时预览、Mermaid、导出 HTML 和 PDF', keywords: ['md', 'mermaid'], icon: 'Memo', page: 'text', load: () => import('../components/dev/MarkdownPreview.vue') }),
  tool({ id: 'filediff', name: '文本对比', shortName: '对比', description: '行级和词级差异，支持并排与行内', keywords: ['diff'], icon: 'Document', page: 'text', load: () => import('../components/file/FileDiff.vue') }),
  tool({ id: 'htmlentity', name: 'HTML 实体', shortName: '实体', description: '编码和解码 HTML 实体', keywords: ['entity'], icon: 'Document', page: 'text', load: () => import('../components/text/HtmlEntityTool.vue') }),
  tool({ id: 'charfreq', name: '字符频次', shortName: '频次', description: '统计字符出现次数', keywords: ['频率'], icon: 'Reading', page: 'text', load: () => import('../components/text/CharFrequency.vue') }),
  tool({ id: 'rot13', name: 'ROT13 / 凯撒', shortName: 'ROT13', description: '简单字母替换', keywords: ['凯撒'], icon: 'Key', page: 'text', load: () => import('../components/text/Rot13Cipher.vue') }),
  tool({ id: 'xml', name: 'XML 格式化', shortName: 'XML', description: '格式化 XML', keywords: ['xml'], icon: 'Document', page: 'text', load: () => import('../components/text/XmlFormatter.vue') }),
  tool({ id: 'textsort', name: '文本排序', shortName: '排序', description: '排序和过滤文本行', keywords: ['排序'], icon: 'Sort', page: 'text', load: () => import('../components/text/TextSortFilter.vue') }),
  tool({ id: 'textextractor', name: '文本提取', shortName: '提取', description: '从 PDF 或图片提取文字', keywords: ['pdf', 'ocr'], icon: 'Document', page: 'text', load: () => import('../components/dev/TextExtractor.vue') }),

  tool({ id: 'json', name: 'JSON 工具', shortName: 'JSON', description: '格式化、对比和转换 JSON', keywords: ['json'], icon: 'Document', page: 'dev', category: 'format', load: () => import('../components/dev/JsonEditor.vue') }),
  tool({ id: 'yaml', name: 'YAML / JSON', shortName: 'YAML', description: 'YAML 与 JSON 互转', keywords: ['yaml'], icon: 'Document', page: 'dev', category: 'format', load: () => import('../components/dev/YamlJsonConverter.vue') }),
  tool({ id: 'sql', name: 'SQL 格式化', shortName: 'SQL', description: '按数据库方言格式化 SQL', keywords: ['sql', 'mysql'], icon: 'Document', page: 'dev', category: 'format', load: () => import('../components/dev/SqlFormatter.vue') }),
  tool({ id: 'formatter', name: '代码格式化', shortName: '格式化', description: '格式化 JS、TS、CSS、HTML、JSON、Markdown 和 YAML', keywords: ['prettier'], icon: 'Edit', page: 'dev', category: 'format', load: () => import('../components/dev/CodeFormatter.vue') }),
  tool({ id: 'curl', name: 'curl 转代码', shortName: 'curl', description: '把 curl 转成 fetch、axios 和 Node 代码', keywords: ['http', 'fetch'], icon: 'Link', page: 'dev', category: 'format', load: () => import('../components/dev/CurlConverter.vue') }),
  tool({ id: 'svgoptimize', name: 'SVG 优化', shortName: 'SVG', description: '用 SVGO 压缩 SVG，并导出 Vue 组件', keywords: ['svgo'], icon: 'Document', page: 'dev', category: 'format', load: () => import('../components/dev/SvgOptimizer.vue') }),
  tool({ id: 'sqlcreate', name: 'SQL 建表', shortName: '建表', description: '根据字段生成建表语句', keywords: ['create table'], icon: 'Grid', page: 'dev', category: 'format', load: () => import('../components/text/SqlCreateTable.vue') }),

  tool({ id: 'base64', name: 'Base64', shortName: 'Base64', description: '文本和文件的 Base64 编解码', keywords: ['编码'], icon: 'Share', page: 'dev', category: 'encode', load: () => import('../components/dev/Base64Tool.vue') }),
  tool({ id: 'url', name: 'URL 工具', shortName: 'URL', description: '编码、解码，并把查询参数编辑后重新拼回', keywords: ['encode', 'query'], icon: 'Link', page: 'dev', category: 'encode', load: () => import('../components/dev/URLEncoder.vue') }),
  tool({ id: 'jwt', name: 'JWT 解码', shortName: 'JWT', description: '查看声明，并用密钥校验 HS 签名', keywords: ['token', 'hs256'], icon: 'Key', page: 'dev', category: 'encode', load: () => import('../components/dev/JWTDecoder.vue') }),
  tool({ id: 'hash', name: '哈希', shortName: '哈希', description: '计算 SHA 系列哈希', keywords: ['sha256'], icon: 'Key', page: 'dev', category: 'encode', load: () => import('../components/dev/HashTool.vue') }),
  tool({ id: 'jwtgenerate', name: 'JWT 生成', shortName: 'JWT', description: '生成 JWT', keywords: ['签名'], icon: 'Key', page: 'dev', category: 'encode', load: () => import('../components/dev/JwtGenerator.vue') }),
  tool({ id: 'hmac', name: 'HMAC 签名', shortName: 'HMAC', description: '计算 HMAC', keywords: ['hmac'], icon: 'Key', page: 'dev', category: 'encode', load: () => import('../components/dev/HmacTool.vue') }),

  tool({ id: 'color', name: '颜色工具', shortName: '颜色', description: '取色、转换和对比度检查', keywords: ['hex', 'rgb'], icon: 'Brush', page: 'dev', category: 'css', load: () => import('../components/dev/ColorTool.vue') }),
  tool({ id: 'palette', name: '调色板', shortName: '色阶', description: '由基色生成色阶，导出 CSS 变量和 Tailwind', keywords: ['palette', 'tailwind'], icon: 'Brush', page: 'dev', category: 'css', load: () => import('../components/dev/PaletteGenerator.vue') }),
  tool({ id: 'cssgen', name: 'CSS 生成器', shortName: 'CSS', description: '阴影、渐变、圆角和贝塞尔曲线', keywords: ['shadow', 'gradient', 'bezier'], icon: 'MagicStick', page: 'dev', category: 'css', load: () => import('../components/dev/CssGenerator.vue') }),
  tool({ id: 'gradient', name: '渐变生成', shortName: '渐变', description: '生成 CSS 渐变', keywords: ['gradient'], icon: 'Brush', page: 'dev', category: 'css', load: () => import('../components/dev/GradientGenerator.vue') }),
  tool({ id: 'boxshadow', name: '阴影生成', shortName: '阴影', description: '生成 box-shadow', keywords: ['shadow'], icon: 'Box', page: 'dev', category: 'css', load: () => import('../components/dev/BoxShadowGenerator.vue') }),
  tool({ id: 'flexbox', name: 'Flexbox', shortName: 'Flex', description: '调试 Flex 布局', keywords: ['flex'], icon: 'Grid', page: 'dev', category: 'css', load: () => import('../components/dev/FlexboxPlayground.vue') }),
  tool({ id: 'http', name: 'HTTP 状态码', shortName: 'HTTP', description: '查询 HTTP 状态码含义', keywords: ['404', '500'], icon: 'Link', page: 'dev', category: 'css', load: () => import('../components/dev/HttpStatusCode.vue') }),
  tool({ id: 'cssanimation', name: 'CSS 动画', shortName: '动画', description: '生成 CSS 动画', keywords: ['animation'], icon: 'Brush', page: 'dev', category: 'css', load: () => import('../components/dev/CssAnimationGenerator.vue') }),
  tool({ id: 'cssfilter', name: 'CSS Filter', shortName: 'Filter', description: '预览 CSS 滤镜', keywords: ['filter'], icon: 'Brush', page: 'dev', category: 'css', load: () => import('../components/dev/CssFilterGenerator.vue') }),

  tool({ id: 'timestamp', name: '时间戳', shortName: '时间戳', description: '时间戳和日期互转', keywords: ['unix'], icon: 'Timer', page: 'dev', category: 'system', load: () => import('../components/dev/TimestampTool.vue') }),
  tool({ id: 'uuid', name: 'UUID', shortName: 'UUID', description: '生成和校验 UUID', keywords: ['guid'], icon: 'Postcard', page: 'dev', category: 'system', load: () => import('../components/dev/UUIDTool.vue') }),
  tool({ id: 'radix', name: '进制转换', shortName: '进制', description: '二进制、八进制、十进制和十六进制', keywords: ['hex'], icon: 'Sort', page: 'dev', category: 'system', load: () => import('../components/dev/RadixTool.vue') }),
  tool({ id: 'chmod', name: 'Chmod 计算', shortName: 'Chmod', description: '计算 Linux 权限数字', keywords: ['权限'], icon: 'SetUp', page: 'dev', category: 'system', load: () => import('../components/dev/ChmodCalculator.vue') }),
  tool({ id: 'linux', name: 'Linux 命令', shortName: 'Linux', description: '查阅常用 Linux 命令', keywords: ['shell'], icon: 'Monitor', page: 'dev', category: 'system', load: () => import('../components/dev/LinuxCommands.vue') }),
  tool({ id: 'useragent', name: 'UA 解析', shortName: 'UA', description: '解析 User-Agent', keywords: ['浏览器'], icon: 'Monitor', page: 'dev', category: 'system', load: () => import('../components/dev/UserAgentParser.vue') }),
  tool({ id: 'ipcalc', name: 'IP 计算器', shortName: 'IP', description: '计算子网和地址范围', keywords: ['cidr'], icon: 'Monitor', page: 'dev', category: 'system', load: () => import('../components/dev/IpCalculator.vue') }),

  tool({ id: 'qrcode', name: '二维码工具', shortName: '二维码', description: '生成和识别二维码', keywords: ['qr'], icon: 'FullScreen', page: 'other', load: () => import('../components/dev/QrCodeTool.vue') }),
  tool({ id: 'whiteboard', name: '在线画板', shortName: '画板', description: '在画布上涂鸦并导出', keywords: ['画板'], icon: 'EditPen', page: 'other', load: () => import('../components/dev/Whiteboard.vue') }),
  tool({ id: 'svg', name: 'SVG 编辑器', shortName: 'SVG', description: '编辑 SVG', keywords: ['矢量'], icon: 'Edit', page: 'other', load: () => import('../components/file/SvgEditor.vue') }),
  tool({ id: 'pdf', name: 'PDF 工具', shortName: 'PDF', description: '查看、合并和拆分 PDF', keywords: ['pdf'], icon: 'Document', page: 'other', load: () => import('../components/dev/PdfTool.vue') }),
  tool({ id: 'responsive', name: '响应式测试', shortName: '响应式', description: '预览不同宽度的页面', keywords: ['viewport'], icon: 'View', page: 'other', load: () => import('../components/dev/ResponsiveTester.vue') }),
  tool({ id: 'gridsplitter', name: '九宫格切图', shortName: '切图', description: '把图片切成网格', keywords: ['九宫格'], icon: 'Grid', page: 'other', load: () => import('../components/image/ImageGridSplitter.vue') }),
  tool({ id: 'emoji', name: 'Emoji 搜索', shortName: 'Emoji', description: '按中文搜索表情', keywords: ['表情'], icon: 'Star', page: 'other', load: () => import('../components/other/EmojiSearch.vue') }),
  tool({ id: 'flowchart', name: '流程图', shortName: '流程图', description: '绘制简单流程图', keywords: ['流程'], icon: 'Share', page: 'other', load: () => import('../components/other/FlowchartEditor.vue') }),
  tool({ id: 'zip', name: 'ZIP 解压', shortName: 'ZIP', description: '在浏览器里查看压缩包', keywords: ['zip'], icon: 'Document', page: 'other', load: () => import('../components/other/ZipExtractor.vue') }),
]

export const menuPages = [
  { path: '/', title: '首页', icon: 'HomeFilled' },
  { path: '/imagetools', title: '图片工具', icon: 'Picture' },
  { path: '/texttools', title: '文本工具', icon: 'Memo' },
  { path: '/utility', title: '实用工具', icon: 'Suitcase' },
  { path: '/devtools', title: '开发工具', icon: 'Tools' },
  { path: '/securitytools', title: '编码与安全', icon: 'Lock' },
  { path: '/webtools', title: 'Web 与 CSS', icon: 'Brush' },
  { path: '/systemtools', title: '系统与网络', icon: 'Monitor' },
  { path: '/life', title: '生活工具', icon: 'Star' },
  { path: '/other', title: '其他工具', icon: 'More' },
]

export function toolRoute(entry: ToolDefinition): string {
  if (entry.page === 'life') return '/life'
  if (entry.page === 'image') return '/imagetools'
  if (entry.page === 'utility') return '/utility'
  if (entry.page === 'text') return '/texttools'
  if (entry.page === 'other') return '/other'
  if (entry.category === 'encode') return '/securitytools'
  if (entry.category === 'css') return '/webtools'
  if (entry.category === 'system') return '/systemtools'
  return '/devtools'
}

export function toolCategoryLabel(entry: ToolDefinition): string {
  return PAGE_TITLES[toolRoute(entry)] || '工具'
}

export function storageKeyFor(page: ToolPageId): string {
  const keys: Record<ToolPageId, string> = {
    life: 'activeLifeTool',
    image: 'activeImageTool',
    utility: 'activeUtilityTool',
    text: 'activeTextTool',
    other: 'activeOtherTool',
    dev: 'activeDevTool',
  }
  return keys[page]
}

export function findTool(id: string): ToolDefinition | undefined {
  return tools.find((entry) => entry.id === id)
}

export function toolsFor(page: ToolPageId, category?: string): ToolDefinition[] {
  return tools.filter((entry) => entry.page === page && (!category || entry.category === category))
}

export function scoreTool(query: string, entry: ToolDefinition): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1
  const fields = [entry.name, entry.shortName, entry.description, toolCategoryLabel(entry), ...entry.keywords]
  let best = 0
  for (const field of fields) {
    const text = field.toLowerCase()
    const index = text.indexOf(q)
    if (index >= 0) best = Math.max(best, 200 - index + (text === q ? 50 : 0))
    else {
      let cursor = 0
      let score = 0
      let streak = 0
      for (const char of text) {
        if (char === q[cursor]) {
          streak += 1
          score += 4 + streak
          cursor += 1
          if (cursor === q.length) {
            best = Math.max(best, score)
            break
          }
        } else {
          streak = 0
        }
      }
    }
  }
  return best
}
