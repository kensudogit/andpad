/**
 * SSR / RSC 向け GraphQL クライアント。
 * ブラウザは同一オリジン /graphql、サーバーは候補 API ベースを順に試行する。
 */
import { print } from 'graphql'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { listApiBaseCandidates } from '@/lib/resolve-api-url'

const GQL_FETCH_TIMEOUT_MS = 120_000

export class GraphQLClientError extends Error {
  constructor(
    message: string,
    public readonly errors?: { message: string }[],
  ) {
    super(message)
    this.name = 'GraphQLClientError'
  }
}

/** RSC から Go API へセッション Cookie を転送する */
async function serverCookieHeader(): Promise<string | undefined> {
  if (typeof window !== 'undefined') return undefined
  try {
    const { headers } = await import('next/headers')
    const h = await headers()
    return h.get('cookie') ?? undefined
  } catch {
    return undefined
  }
}

async function postGraphQL(body: string): Promise<Response> {
  const cookie = await serverCookieHeader()
  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body,
    cache: 'no-store',
    signal: AbortSignal.timeout(GQL_FETCH_TIMEOUT_MS),
  }

  // クライアントは Next プロキシ経由、サーバーは複数ベース URL をフォールバック
  const urls =
    typeof window !== 'undefined'
      ? ['/graphql']
      : listApiBaseCandidates().map((b) => `${b}/graphql`)

  const failures: string[] = []
  for (const url of urls) {
    try {
      const res = await fetch(url, init)
      if (res.ok) return res
      // 502/503 のみ次候補へ。401 等のアプリエラーはそのまま返す
      if (res.status === 502 || res.status === 503) {
        failures.push(`${url}: HTTP ${res.status}`)
        continue
      }
      return res
    } catch (err) {
      failures.push(`${url}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  throw new GraphQLClientError(`fetch failed (${failures.join('; ')})`)
}

export async function gqlRequest<TResult, TVariables = Record<string, never>>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
): Promise<TResult> {
  const body = JSON.stringify({
    query: print(document),
    variables: variables ?? {},
  })

  const res = await postGraphQL(body)
  const text = await res.text()
  let json: { data?: unknown; errors?: { message: string }[] }
  try {
    json = JSON.parse(text) as typeof json
  } catch {
    throw new GraphQLClientError(`API returned non-JSON (HTTP ${res.status})`)
  }

  if (json.errors?.length) {
    throw new GraphQLClientError(json.errors[0]?.message ?? 'GraphQL error', json.errors)
  }
  if (!json.data) {
    throw new GraphQLClientError('Empty GraphQL response')
  }
  return json.data as TResult
}
