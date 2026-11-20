/**
 * 새 UI의 데모 요청을 처리한다. EPUB 리더는 기존 /api를 사용한다.
 */

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown
  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type Query = Record<string, string | number | boolean | undefined>

interface RequestOptions extends Omit<RequestInit, 'body'> {
  query?: Query
  body?: unknown
}

function buildUrl(path: string, query?: Query) {
  const url = `/reading-fun-api${path}`
  if (!query) return url
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) if (v !== undefined) qs.set(k, String(v))
  const s = qs.toString()
  return s ? `${url}?${s}` : url
}

export async function http<T>(path: string, { query, body, headers, ...init }: RequestOptions = {}): Promise<T> {
  const isForm = body instanceof FormData
  const res = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined
  if (!res.ok) {
    const message = (data && typeof data === 'object' && 'message' in data && String(data.message)) || res.statusText
    throw new ApiError(res.status, message, data)
  }
  return data as T
}
