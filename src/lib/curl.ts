export interface CurlHeader {
  name: string
  value: string
}

export interface CurlRequest {
  method: string
  url: string
  headers: CurlHeader[]
  body?: string
  ignored: string[]
}

const IGNORED = new Set(['-k', '--insecure', '-L', '--location', '-s', '--silent', '-S', '--compressed', '--http1.1', '--http2'])

function tokenize(command: string): string[] {
  const source = command.trim().replace(/\\\r?\n/g, ' ')
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | '' = ''
  for (const char of source) {
    if (quote) {
      if (char === quote) quote = ''
      else current += char
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (/\s/.test(char)) {
      if (current) tokens.push(current)
      current = ''
      continue
    }
    current += char
  }
  if (quote) throw new Error('引号没有闭合')
  if (current) tokens.push(current)
  return tokens
}

function header(raw: string): CurlHeader {
  const index = raw.indexOf(':')
  if (index <= 0) throw new Error(`请求头格式应为 Name: value，收到 ${raw}`)
  return { name: raw.slice(0, index).trim(), value: raw.slice(index + 1).trim() }
}

function utf8ToBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export function parseCurl(command: string): CurlRequest {
  const tokens = tokenize(command)
  if (tokens[0] !== 'curl') throw new Error('请输入以 curl 开头的命令')
  let method = ''
  let url = ''
  const headers: CurlHeader[] = []
  const data: string[] = []
  const ignored: string[] = []
  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index]
    const take = () => {
      const value = tokens[++index]
      if (value === undefined) throw new Error(`${token} 缺少参数`)
      return value
    }
    if (token === '-X' || token === '--request') method = take()
    else if (token.startsWith('-X') && token.length > 2) method = token.slice(2)
    else if (token === '-H' || token === '--header') headers.push(header(take()))
    else if (['-d', '--data', '--data-raw', '--data-binary', '--data-urlencode'].includes(token)) data.push(take())
    else if (token === '-u' || token === '--user') {
      headers.push({ name: 'Authorization', value: `Basic ${utf8ToBase64(take())}` })
    } else if (token === '--url') url = take()
    else if (token === '-A' || token === '--user-agent') headers.push({ name: 'User-Agent', value: take() })
    else if (IGNORED.has(token)) ignored.push(token)
    else if (token.startsWith('-')) throw new Error(`暂不支持的参数：${token}`)
    else if (!url) url = token
    else throw new Error('命令里出现了多个 URL')
  }
  if (!url) throw new Error('缺少 URL')
  return {
    method: (method || (data.length ? 'POST' : 'GET')).toUpperCase(),
    url,
    headers,
    body: data.length ? data.join('&') : undefined,
    ignored,
  }
}

function renderHeaders(headers: CurlHeader[]): string {
  if (!headers.length) return ''
  const lines = headers.map((item) => `    ${JSON.stringify(item.name)}: ${JSON.stringify(item.value)},`).join('\n')
  return `headers: {\n${lines}\n  }`
}

export function toFetch(request: CurlRequest): string {
  const fields = [`method: ${JSON.stringify(request.method)}`]
  const headers = renderHeaders(request.headers)
  if (headers) fields.push(headers)
  if (request.body !== undefined) fields.push(`body: ${JSON.stringify(request.body)}`)
  const note = request.ignored.length ? `// 已忽略 ${request.ignored.join(' ')}，浏览器里没有对应选项\n` : ''
  return `${note}fetch(${JSON.stringify(request.url)}, {\n  ${fields.join(',\n  ')}\n})`
}

export function toAxios(request: CurlRequest): string {
  const fields = [`url: ${JSON.stringify(request.url)}`, `method: ${JSON.stringify(request.method)}`]
  const headers = renderHeaders(request.headers)
  if (headers) fields.push(headers)
  if (request.body !== undefined) fields.push(`data: ${JSON.stringify(request.body)}`)
  return `axios({\n  ${fields.join(',\n  ')}\n})`
}

export function toNode(request: CurlRequest): string {
  return `// Node.js 18+ 自带 fetch\n${toFetch(request)}`
}
