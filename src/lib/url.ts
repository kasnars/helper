export interface QueryParam {
  key: string
  value: string
}

export interface ParsedUrl {
  protocol: string
  hostname: string
  port: string
  pathname: string
  hash: string
  params: QueryParam[]
}

export function encodeUrlComponent(value: string): string {
  return encodeURIComponent(value)
}

export function decodeUrlComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    throw new Error('解码失败，内容不是合法的 URL 编码')
  }
}

export function parseUrl(input: string): ParsedUrl {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    throw new Error('请输入带协议的完整 URL')
  }
  const params: QueryParam[] = []
  url.searchParams.forEach((value, key) => {
    params.push({ key, value })
  })
  return {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    hash: url.hash,
    params,
  }
}

export function buildUrl(parts: ParsedUrl): string {
  const protocol = parts.protocol.endsWith(':') ? parts.protocol : `${parts.protocol}:`
  const port = parts.port ? `:${parts.port}` : ''
  const path = parts.pathname.startsWith('/') ? parts.pathname : `/${parts.pathname}`
  const url = new URL(`${protocol}//${parts.hostname}${port}${path}`)
  url.search = ''
  for (const param of parts.params) {
    if (!param.key) continue
    url.searchParams.append(param.key, param.value)
  }
  url.hash = parts.hash
  return url.toString()
}
