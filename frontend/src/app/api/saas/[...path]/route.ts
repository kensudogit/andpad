/**
 * Proxy SaaS REST API to Go backend (same pattern as /graphql).
 */
import { listApiBaseCandidates } from '@/lib/resolve-api-url'
import { proxyToApiBases } from '@/lib/proxy-fetch'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function forwardAuthHeaders(request: Request, headers: Headers) {
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const cookie = request.headers.get('cookie')
  if (cookie) headers.set('cookie', cookie)
  const authorization = request.headers.get('authorization')
  if (authorization) headers.set('authorization', authorization)
}

async function proxy(request: Request, path: string): Promise<Response> {
  const bases = listApiBaseCandidates()
  const search = new URL(request.url).search
  const headers = new Headers()
  forwardAuthHeaders(request, headers)
  const bodyText =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()

  return proxyToApiBases(
    bases,
    (base) => `${base}/api/saas/${path}${search}`,
    { method: request.method, headers, body: bodyText, cache: 'no-store' },
  )
}

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(request: Request, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(request, path.join('/'))
}

export async function POST(request: Request, ctx: Ctx) {
  const { path } = await ctx.params
  return proxy(request, path.join('/'))
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, authorization, cookie',
    },
  })
}
