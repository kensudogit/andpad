/**
 * ブラウザからの GraphQL を Go API へプロキシする Route Handler。
 * 同一オリジン /graphql で CORS・Cookie を維持する。
 */
import { listApiBaseCandidates } from '@/lib/resolve-api-url'
import { PROXY_TIMEOUT_GRAPHQL_POST_MS, PROXY_TIMEOUT_DEFAULT_MS, proxyToApiBases } from '@/lib/proxy-fetch'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
/** OpenAI 連携 mutation 向け（Railway / Next Route Handler） */
export const maxDuration = 120

function forwardAuthHeaders(request: Request, headers: Headers) {
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const accept = request.headers.get('accept')
  if (accept) headers.set('accept', accept)
  const cookie = request.headers.get('cookie')
  if (cookie) headers.set('cookie', cookie)
  const authorization = request.headers.get('authorization')
  if (authorization) headers.set('authorization', authorization)
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) headers.set('x-api-key', apiKey)
}

async function proxy(request: Request): Promise<Response> {
  const bases = listApiBaseCandidates()
  const search = new URL(request.url).search

  const headers = new Headers()
  forwardAuthHeaders(request, headers)

  const bodyText =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()

  const res = await proxyToApiBases(
    bases,
    (base) => `${base}/graphql${search}`,
    {
      method: request.method,
      headers,
      body: bodyText,
      cache: 'no-store',
    },
    request.method === 'POST' ? PROXY_TIMEOUT_GRAPHQL_POST_MS : PROXY_TIMEOUT_DEFAULT_MS,
  )

  // 502 は GraphQL エラー形式に変換して返す
  if (res.status === 502) {
    const j = (await res.json()) as { error?: string }
    return Response.json(
      { errors: [{ message: j.error ?? 'Cannot reach API' }] },
      { status: 502 },
    )
  }
  return res
}

export async function GET(request: Request) {
  return proxy(request)
}

export async function POST(request: Request) {
  return proxy(request)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, accept, authorization, cookie, x-api-key',
    },
  })
}
