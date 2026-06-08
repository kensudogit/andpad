/**
 * /auth/* を Go API 認証エンドポイントへプロキシ（ログイン Cookie 中継）。
 */
import { listApiBaseCandidates } from '@/lib/resolve-api-url'
import { PROXY_TIMEOUT_AUTH_MS, proxyToApiBases } from '@/lib/proxy-fetch'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function forwardRequestHeaders(request: Request, headers: Headers) {
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const accept = request.headers.get('accept')
  if (accept) headers.set('accept', accept)
  const cookie = request.headers.get('cookie')
  if (cookie) headers.set('cookie', cookie)
  const authorization = request.headers.get('authorization')
  if (authorization) headers.set('authorization', authorization)
}

async function proxyAuth(request: Request, path: string[]): Promise<Response> {
  const subpath = path.join('/')
  const search = new URL(request.url).search
  const bases = listApiBaseCandidates()

  const headers = new Headers()
  forwardRequestHeaders(request, headers)

  const bodyText =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()

  return proxyToApiBases(
    bases,
    (base) => `${base}/auth/${subpath}${search}`,
    {
      method: request.method,
      headers,
      body: bodyText,
      cache: 'no-store',
    },
    PROXY_TIMEOUT_AUTH_MS,
  )
}

type RouteContext = { params: Promise<{ path: string[] }> }

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params
  return proxyAuth(request, path)
}

export async function POST(request: Request, context: RouteContext) {
  const { path } = await context.params
  return proxyAuth(request, path)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, accept, authorization, cookie',
    },
  })
}
