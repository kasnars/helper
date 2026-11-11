export interface JwtClaim {
  key: string
  label: string
  value: string
}

export interface DecodedJwt {
  headerText: string
  payloadText: string
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  algorithm: string
  type: string
  claims: JwtClaim[]
  expiration: string
  issuedAt: string
  notBefore: string
  expired: boolean
  pending: boolean
  validStructure: boolean
}

const CLAIM_LABELS: Record<string, string> = {
  iss: '签发者',
  sub: '主题',
  aud: '受众',
  exp: '过期时间',
  nbf: '生效时间',
  iat: '签发时间',
  jti: 'JWT ID',
}

const HASHES: Record<string, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
}

export function base64UrlToString(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function base64UrlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function formatTime(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return ''
  return new Date(value * 1000).toLocaleString('zh-CN', { hour12: false })
}

function empty(validStructure: boolean): DecodedJwt {
  return {
    headerText: '',
    payloadText: '',
    header: {},
    payload: {},
    signature: '',
    algorithm: '',
    type: '',
    claims: [],
    expiration: '',
    issuedAt: '',
    notBefore: '',
    expired: false,
    pending: false,
    validStructure,
  }
}

export function decodeJwt(token: string, now = Date.now()): DecodedJwt {
  const parts = token.trim().split('.')
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) return empty(false)
  try {
    const header = JSON.parse(base64UrlToString(parts[0])) as Record<string, unknown>
    const payload = JSON.parse(base64UrlToString(parts[1])) as Record<string, unknown>
    const claims = Object.entries(CLAIM_LABELS)
      .filter(([key]) => payload[key] !== undefined)
      .map(([key, label]) => {
        const raw = payload[key]
        const value = key === 'exp' || key === 'iat' || key === 'nbf' ? formatTime(raw) : String(raw)
        return { key, label, value }
      })
    const exp = typeof payload.exp === 'number' ? payload.exp * 1000 : undefined
    const nbf = typeof payload.nbf === 'number' ? payload.nbf * 1000 : undefined
    return {
      headerText: JSON.stringify(header, null, 2),
      payloadText: JSON.stringify(payload, null, 2),
      header,
      payload,
      signature: parts[2],
      algorithm: String(header.alg || ''),
      type: String(header.typ || ''),
      claims,
      expiration: formatTime(payload.exp),
      issuedAt: formatTime(payload.iat),
      notBefore: formatTime(payload.nbf),
      expired: exp !== undefined && now >= exp,
      pending: nbf !== undefined && now < nbf,
      validStructure: true,
    }
  } catch {
    return empty(false)
  }
}

export async function verifyJwtHs(token: string, secret: string): Promise<{ ok: boolean; reason: string }> {
  const decoded = decodeJwt(token)
  if (!decoded.validStructure) return { ok: false, reason: 'Token 结构无效' }
  const hash = HASHES[decoded.algorithm]
  if (!hash) return { ok: false, reason: `${decoded.algorithm || '未知算法'} 不能用对称密钥校验` }
  if (!secret) return { ok: false, reason: '请输入密钥' }
  const [header, payload, signature] = token.trim().split('.')
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash },
    false,
    ['verify'],
  )
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(`${header}.${payload}`),
  )
  return { ok, reason: ok ? '签名匹配' : '签名不匹配' }
}

export async function signJwtHs(payload: Record<string, unknown>, secret: string, algorithm = 'HS256'): Promise<string> {
  const hash = HASHES[algorithm]
  if (!hash) throw new Error('不支持的算法')
  const header = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ alg: algorithm, typ: 'JWT' })))
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash },
    false,
    ['sign'],
  )
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${body}`)))
  return `${header}.${body}.${bytesToBase64Url(signature)}`
}
