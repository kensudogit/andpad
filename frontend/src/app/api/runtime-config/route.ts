/**
 * ブラウザ向け Gateway 接続情報（WebSocket URL 等）。
 */
import {
  pickBrowserApiBase,
  resolveBrowserGraphqlWsUrl,
  type GraphqlRuntimeConfig,
} from '@/lib/graphql-endpoints'
import { listApiBaseCandidates } from '@/lib/resolve-api-url'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const bases = listApiBaseCandidates()
  const apiBase = pickBrowserApiBase(bases)
  const ws = resolveBrowserGraphqlWsUrl(request, apiBase)

  const body: GraphqlRuntimeConfig = {
    apiBase,
    ...ws,
  }

  return Response.json(body)
}
