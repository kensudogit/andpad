/**
 * サーバー側プロキシ用 fetch（タイムアウト付き）。
 * auth / graphql ルートから Go API へ転送する際に使用。
 */
export const PROXY_TIMEOUT_DEFAULT_MS = 15_000
/** OpenAI 連携 mutation（チャット・RAG・AI Board）向け */
export const PROXY_TIMEOUT_GRAPHQL_POST_MS = 120_000
export const PROXY_TIMEOUT_AUTH_MS = 20_000

export async function fetchUpstream(
  url: string,
  init: RequestInit = {},
  timeoutMs = PROXY_TIMEOUT_DEFAULT_MS,
): Promise<Response> {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
  })
}

/** ログイン応答の Set-Cookie をブラウザへ中継 */
function forwardSetCookies(upstream: Response, outHeaders: Headers) {
  const setCookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : upstream.headers.get('set-cookie')
        ? [upstream.headers.get('set-cookie')!]
        : []
  for (const value of setCookies) {
    outHeaders.append('set-cookie', value)
  }
}

/** 最初に応答した上流をそのまま返す（401 等のアプリエラーも含む） */
export async function proxyUpstreamResponse(upstream: Response): Promise<Response> {
  const text = await upstream.text()
  const outHeaders = new Headers()
  const upstreamType = upstream.headers.get('content-type')
  if (upstreamType) outHeaders.set('content-type', upstreamType)
  forwardSetCookies(upstream, outHeaders)
  return new Response(text, { status: upstream.status, headers: outHeaders })
}

/** 候補ベース URL を順に試し、接続失敗時のみ次へ */
export async function proxyToApiBases(
  bases: string[],
  buildTarget: (base: string) => string,
  init: RequestInit,
  timeoutMs = PROXY_TIMEOUT_DEFAULT_MS,
): Promise<Response> {
  const failures: string[] = []
  for (const base of bases) {
    const target = buildTarget(base)
    try {
      const upstream = await fetchUpstream(target, init, timeoutMs)
      return proxyUpstreamResponse(upstream)
    } catch (err) {
      failures.push(`${base}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  return Response.json({ error: `Cannot reach API (${failures.join('; ')})` }, { status: 502 })
}
