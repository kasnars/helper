export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface HslColor {
  h: number
  s: number
  l: number
}

export const TONE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

const LIGHT_MIX = [0.92, 0.84, 0.68, 0.46, 0.24, 0, 0.12, 0.28, 0.44, 0.6, 0.74]

export function normalizeHex(input: string): string {
  const raw = input.trim().replace('#', '')
  const hex = raw.length === 3 ? raw.split('').map((char) => char + char).join('') : raw.slice(0, 6)
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) throw new Error('请输入 #RRGGBB 颜色')
  return `#${hex.toUpperCase()}`
}

export function hexToRgb(input: string): RgbColor {
  const hex = normalizeHex(input).slice(1)
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const channel = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase()
}

export function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: lightness * 100 }
  const delta = max - min
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let hue = 0
  if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0)
  else if (max === green) hue = (blue - red) / delta + 2
  else hue = (red - green) / delta + 4
  return { h: hue * 60, s: saturation * 100, l: lightness * 100 }
}

function mix(base: RgbColor, target: RgbColor, weight: number): RgbColor {
  return {
    r: base.r + (target.r - base.r) * weight,
    g: base.g + (target.g - base.g) * weight,
    b: base.b + (target.b - base.b) * weight,
  }
}

export function tonalScale(input: string): { step: number; hex: string }[] {
  const base = hexToRgb(input)
  return TONE_STEPS.map((step, index) => {
    const weight = LIGHT_MIX[index]
    if (weight === 0) return { step, hex: rgbToHex(base) }
    const target = step < 500 ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 }
    return { step, hex: rgbToHex(mix(base, target, weight)) }
  })
}

function token(name: string): string {
  const cleaned = name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
  return cleaned || 'brand'
}

export function scaleToCss(name: string, scale: { step: number; hex: string }[]): string {
  const prefix = token(name)
  const lines = scale.map((item) => `  --${prefix}-${item.step}: ${item.hex};`)
  return `:root {\n${lines.join('\n')}\n}`
}

export function scaleToTailwind(name: string, scale: { step: number; hex: string }[]): string {
  const prefix = token(name)
  const body = scale.map((item) => `        ${item.step}: '${item.hex}',`).join('\n')
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        ${prefix}: {\n${body}\n        },\n      },\n    },\n  },\n}`
}
