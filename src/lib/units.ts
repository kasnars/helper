export interface UnitDef {
  id: string
  label: string
  factor: number
}

export const UNIT_CATEGORIES: Record<string, UnitDef[]> = {
  length: [
    { id: 'mm', label: '毫米 (mm)', factor: 0.001 },
    { id: 'cm', label: '厘米 (cm)', factor: 0.01 },
    { id: 'm', label: '米 (m)', factor: 1 },
    { id: 'km', label: '千米 (km)', factor: 1000 },
    { id: 'in', label: '英寸 (in)', factor: 0.0254 },
    { id: 'ft', label: '英尺 (ft)', factor: 0.3048 },
    { id: 'yd', label: '码 (yd)', factor: 0.9144 },
    { id: 'mi', label: '英里 (mi)', factor: 1609.344 },
  ],
  weight: [
    { id: 'mg', label: '毫克 (mg)', factor: 0.000001 },
    { id: 'g', label: '克 (g)', factor: 0.001 },
    { id: 'kg', label: '千克 (kg)', factor: 1 },
    { id: 't', label: '吨 (t)', factor: 1000 },
    { id: 'oz', label: '盎司 (oz)', factor: 0.0283495 },
    { id: 'lb', label: '磅 (lb)', factor: 0.453592 },
  ],
  area: [
    { id: 'mm2', label: '平方毫米 (mm²)', factor: 0.000001 },
    { id: 'cm2', label: '平方厘米 (cm²)', factor: 0.0001 },
    { id: 'm2', label: '平方米 (m²)', factor: 1 },
    { id: 'ha', label: '公顷 (ha)', factor: 10000 },
    { id: 'km2', label: '平方千米 (km²)', factor: 1000000 },
    { id: 'ac', label: '英亩 (ac)', factor: 4046.86 },
  ],
  volume: [
    { id: 'ml', label: '毫升 (ml)', factor: 0.001 },
    { id: 'l', label: '升 (L)', factor: 1 },
    { id: 'm3', label: '立方米 (m³)', factor: 1000 },
    { id: 'gal', label: '加仑 (gal)', factor: 3.78541 },
  ],
  speed: [
    { id: 'ms', label: '米/秒 (m/s)', factor: 1 },
    { id: 'kmh', label: '千米/时 (km/h)', factor: 1 / 3.6 },
    { id: 'mph', label: '英里/时 (mph)', factor: 0.44704 },
    { id: 'kn', label: '节 (kn)', factor: 0.514444 },
  ],
  time: [
    { id: 'ms', label: '毫秒 (ms)', factor: 0.001 },
    { id: 's', label: '秒 (s)', factor: 1 },
    { id: 'min', label: '分钟 (min)', factor: 60 },
    { id: 'h', label: '小时 (h)', factor: 3600 },
    { id: 'd', label: '天 (d)', factor: 86400 },
    { id: 'w', label: '周', factor: 604800 },
  ],
  data: [
    { id: 'b', label: '字节 (B)', factor: 1 },
    { id: 'kb', label: '千字节 (KB)', factor: 1024 },
    { id: 'mb', label: '兆字节 (MB)', factor: 1048576 },
    { id: 'gb', label: '吉字节 (GB)', factor: 1073741824 },
    { id: 'tb', label: '太字节 (TB)', factor: 1099511627776 },
  ],
  temperature: [
    { id: 'c', label: '摄氏度 (°C)', factor: 1 },
    { id: 'f', label: '华氏度 (°F)', factor: 1 },
    { id: 'k', label: '开尔文 (K)', factor: 1 },
  ],
}

function toCelsius(unit: string, value: number): number {
  if (unit === 'c') return value
  if (unit === 'f') return (value - 32) * 5 / 9
  if (unit === 'k') return value - 273.15
  throw new Error('未知温度单位')
}

function fromCelsius(unit: string, value: number): number {
  if (unit === 'c') return value
  if (unit === 'f') return value * 9 / 5 + 32
  if (unit === 'k') return value + 273.15
  throw new Error('未知温度单位')
}

export function convertUnit(category: string, value: number, from: string, to: string): number {
  if (!Number.isFinite(value)) throw new Error('请输入数字')
  const units = UNIT_CATEGORIES[category]
  if (!units) throw new Error('未知单位类别')
  if (!units.some((unit) => unit.id === from) || !units.some((unit) => unit.id === to)) {
    throw new Error('未知单位')
  }
  if (category === 'temperature') return fromCelsius(to, toCelsius(from, value))
  const fromFactor = units.find((unit) => unit.id === from)!.factor
  const toFactor = units.find((unit) => unit.id === to)!.factor
  return (value * fromFactor) / toFactor
}
