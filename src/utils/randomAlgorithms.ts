/**
 * 随机数算法工具类
 * 支持多种随机数生成算法
 */

// 随机数算法类型
export type RandomAlgorithm = 'random' | 'lcg' | 'xorshift' | 'mersenne-twister' | 'pcg' | 'crypto'

// 随机数生成器接口
export interface RandomGenerator {
  name: string
  description: string
  next(): number
  setSeed?(seed: number): void
}

/**
 * Math.random() - JavaScript 内置随机数生成器
 */
class MathRandomGenerator implements RandomGenerator {
  name = 'Math.random()'
  description = 'JavaScript 内置的伪随机数生成器，简单快速'
  
  next(): number {
    return Math.random()
  }
}

/**
 * LCG - 线性同余生成器
 * 公式: X(n+1) = (a * Xn + c) mod m
 */
class LCGGenerator implements RandomGenerator {
  name = '线性同余 (LCG)'
  description = '线性同余生成器，可复现，适合游戏场景'
  
  private currentSeed: number
  
  constructor(seed: number = Date.now()) {
    this.currentSeed = seed
  }
  
  next(): number {
    // 使用 glibc 的参数
    this.currentSeed = (this.currentSeed * 1103515245 + 12345) & 0x7fffffff
    return this.currentSeed / 0x7fffffff
  }
  
  setSeed(seed: number): void {
    this.currentSeed = seed
  }
}

/**
 * XorShift - 位移随机数生成器
 */
class XorShiftGenerator implements RandomGenerator {
  name = 'XorShift'
  description = '基于位移运算的快速随机数生成器'
  
  private x: number
  private y: number
  private z: number
  private w: number
  
  constructor(seed: number = Date.now()) {
    this.x = seed || 123456789
    this.y = 362436069
    this.z = 521288629
    this.w = 88675123
  }
  
  next(): number {
    const t = this.x ^ (this.x << 11)
    this.x = this.y
    this.y = this.z
    this.z = this.w
    this.w = (this.w ^ (this.w >> 19)) ^ (t ^ (t >> 8))
    return (this.w >>> 0) / 4294967296
  }
  
  setSeed(seed: number): void {
    this.x = seed
    this.y = 362436069
    this.z = 521288629
    this.w = 88675123
  }
}

/**
 * Mersenne Twister - 梅森旋转算法
 * 简化版实现
 */
class MersenneTwisterGenerator implements RandomGenerator {
  name = '梅森旋转 (MT)'
  description = '周期极长的高质量随机数生成器'
  
  private static readonly N = 624
  private static readonly M = 397
  private static readonly MATRIX_A = 0x9908b0df
  private static readonly UPPER_MASK = 0x80000000
  private static readonly LOWER_MASK = 0x7fffffff
  
  private mt: number[]
  private mti: number
  
  constructor(seed: number = Date.now()) {
    this.mt = new Array(MersenneTwisterGenerator.N)
    this.mti = MersenneTwisterGenerator.N + 1
    
    this.initSeed(seed)
  }
  
  private initSeed(seed: number): void {
    this.mt[0] = seed >>> 0
    for (this.mti = 1; this.mti < MersenneTwisterGenerator.N; this.mti++) {
      this.mt[this.mti] = (1812433253 * (this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30)) + this.mti) >>> 0
    }
  }
  
  next(): number {
    const y = this.generateNumber()
    return y / 4294967296 // 转换为 [0, 1)
  }
  
  private generateNumber(): number {
    const mag01 = [0x0, MersenneTwisterGenerator.MATRIX_A]
    let y: number
    
    if (this.mti >= MersenneTwisterGenerator.N) {
      let kk: number
      
      if (this.mti === MersenneTwisterGenerator.N + 1) {
        this.initSeed(5489)
      }
      
      for (kk = 0; kk < MersenneTwisterGenerator.N - MersenneTwisterGenerator.M; kk++) {
        y = (this.mt[kk] & MersenneTwisterGenerator.UPPER_MASK) | (this.mt[kk + 1] & MersenneTwisterGenerator.LOWER_MASK)
        this.mt[kk] = this.mt[kk + MersenneTwisterGenerator.M] ^ (y >>> 1) ^ mag01[y & 0x1]
      }
      
      for (; kk < MersenneTwisterGenerator.N - 1; kk++) {
        y = (this.mt[kk] & MersenneTwisterGenerator.UPPER_MASK) | (this.mt[kk + 1] & MersenneTwisterGenerator.LOWER_MASK)
        this.mt[kk] = this.mt[kk + (MersenneTwisterGenerator.M - MersenneTwisterGenerator.N)] ^ (y >>> 1) ^ mag01[y & 0x1]
      }
      
      y = (this.mt[MersenneTwisterGenerator.N - 1] & MersenneTwisterGenerator.UPPER_MASK) | (this.mt[0] & MersenneTwisterGenerator.LOWER_MASK)
      this.mt[MersenneTwisterGenerator.N - 1] = this.mt[MersenneTwisterGenerator.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1]
      
      this.mti = 0
    }
    
    y = this.mt[this.mti++]
    
    y ^= (y >>> 11)
    y ^= (y << 7) & 0x9d2c5680
    y ^= (y << 15) & 0xefc60000
    y ^= (y >>> 18)
    
    return y >>> 0
  }
  
  setSeed(seed: number): void {
    this.initSeed(seed)
  }
}

/**
 * PCG -  permuted congruential generator
 */
class PCGGenerator implements RandomGenerator {
  name = 'PCG'
  description = '高质量快速随机数生成器，统计特性优秀'
  
  private state: bigint
  private inc: bigint
  
  constructor(seed: number = Date.now()) {
    this.state = BigInt(0)
    this.inc = BigInt(0)
    this.setSeed(seed)
  }
  
  next(): number {
    const oldstate = this.state
    this.state = oldstate * BigInt(6364136223846793005) + this.inc
    const xorshifted = ((oldstate >> BigInt(18)) ^ oldstate) >> BigInt(27)
    const rot = oldstate >> BigInt(59)
    const result = Number((xorshifted >> rot) | (xorshifted << (BigInt(64) - rot)))
    return (result >>> 0) / 4294967296
  }
  
  setSeed(seed: number): void {
    this.state = BigInt(0)
    this.inc = (BigInt(seed) * BigInt(6364136223846793005)) | BigInt(1)
    this.next()
    this.state = this.state + BigInt(seed)
    this.next()
  }
}

/**
 * Crypto - Web Crypto API (密码学安全)
 */
class CryptoGenerator implements RandomGenerator {
  name = 'Web Crypto API'
  description = '基于浏览器硬件熵源的密码学安全随机数生成器'
  
  private buffer: Uint32Array
  private index: number
  
  constructor() {
    this.buffer = new Uint32Array(256)
    this.index = 256
  }
  
  next(): number {
    if (this.index >= this.buffer.length) {
      crypto.getRandomValues(this.buffer)
      this.index = 0
    }
    return this.buffer[this.index++] / 4294967296
  }
}

/**
 * 随机数算法工厂
 */
export class RandomAlgorithmFactory {
  private static generators: Map<RandomAlgorithm, RandomGenerator> = new Map()
  
  static getAlgorithmInfo(): Array<{ value: RandomAlgorithm; name: string; description: string }> {
    return [
      { value: 'random', name: 'Math.random()', description: 'JavaScript 内置，简单快速' },
      { value: 'lcg', name: '线性同余 (LCG)', description: '可复现，适合游戏' },
      { value: 'xorshift', name: 'XorShift', description: '基于位移运算，极快' },
      { value: 'mersenne-twister', name: '梅森旋转 (MT)', description: '周期长，高质量' },
      { value: 'pcg', name: 'PCG', description: '统计特性优秀' },
      { value: 'crypto', name: 'Web Crypto API', description: '密码学安全' },
    ]
  }
  
  static createGenerator(algorithm: RandomAlgorithm, seed?: number): RandomGenerator {
    switch (algorithm) {
      case 'random':
        return new MathRandomGenerator()
      case 'lcg':
        return new LCGGenerator(seed)
      case 'xorshift':
        return new XorShiftGenerator(seed)
      case 'mersenne-twister':
        return new MersenneTwisterGenerator(seed)
      case 'pcg':
        return new PCGGenerator(seed)
      case 'crypto':
        return new CryptoGenerator()
      default:
        return new MathRandomGenerator()
    }
  }
}
