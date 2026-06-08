/**
 * GraphQL HTTP / WebSocket エンドポイント解決（Gateway BFF 向け）。
 */
import { isRailway, isUnifiedDeploy, resolveApiUrl } from '@/lib/resolve-api-url'
import type { WsConnectionState } from '@/lib/urql-client'

export function isLoopbackHost(host: string): boolean {
  const h = host.toLowerCase()
  return h === 'localhost' || h === '127.0.0.1' || h === '::1'
}

export function forceHttpBase(base: string): string {
  const trimmed = base.trim().replace(/\/+$/, '')
  if (/^https:\/\//i.test(trimmed)) {
    return trimmed.replace(/^https:\/\//i, 'http://')
  }
  if (/^http:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `http://${trimmed}`
}

/** ローカル開発では wss://localhost は TLS 未設定のため接続できない */
export function forceWsScheme(wsUrl: string, httpBase?: string): string {
  try {
    const u = new URL(wsUrl)
    if (isLoopbackHost(u.hostname)) {
      u.protocol = 'ws:'
      return u.toString().replace(/\/$/, '')
    }
    if (httpBase) {
      const base = new URL(forceHttpBase(httpBase))
      if (isLoopbackHost(base.hostname)) {
        u.protocol = 'ws:'
        return u.toString().replace(/\/$/, '')
      }
    }
    return wsUrl.replace(/\/$/, '')
  } catch {
    return wsUrl.replace(/^wss:\/\//i, 'ws://').replace(/\/$/, '')
  }
}

export function httpBaseToGraphqlWs(httpBase: string): string {
  const u = new URL(forceHttpBase(httpBase))
  u.protocol = 'ws:'
  u.pathname = '/graphql'
  return forceWsScheme(u.toString(), httpBase)
}

export function graphqlHttpUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/graphql`
  }
  return `${resolveApiUrl().replace(/\/+$/, '')}/graphql`
}

export type GraphqlRuntimeConfig = {
  graphqlWsUrl: string
  apiBase: string
  unified: boolean
  localDev: boolean
}

export type GraphqlRuntimeContextValue = GraphqlRuntimeConfig & {
  subscriptionReady: boolean
  wsConnection: WsConnectionState
}

export function pickBrowserApiBase(bases: string[]): string {
  for (const base of bases) {
    try {
      const host = new URL(forceHttpBase(base)).hostname.toLowerCase()
      if (isLoopbackHost(host)) {
        return forceHttpBase(base)
      }
    } catch {
      continue
    }
  }
  for (const base of bases) {
    if (!base.includes('.railway.internal') && !base.includes('://api:')) {
      return forceHttpBase(base)
    }
  }
  return 'http://127.0.0.1:8080'
}

export function resolveBrowserGraphqlWsUrl(
  request: Request,
  apiBase: string,
): Pick<GraphqlRuntimeConfig, 'graphqlWsUrl' | 'unified' | 'localDev'> {
  const reqUrl = new URL(request.url)
  const localDev = isLoopbackHost(reqUrl.hostname)
  const unified = isUnifiedDeploy() && isRailway() && !localDev

  const fromPublic = process.env.NEXT_PUBLIC_WS_URL?.trim()
  if (fromPublic) {
    const trimmed = fromPublic.replace(/\/+$/, '')
    const ws = trimmed.endsWith('/graphql') ? trimmed : `${trimmed}/graphql`
    return {
      graphqlWsUrl: forceWsScheme(ws, apiBase),
      unified,
      localDev,
    }
  }

  // Railway 統合デプロイ: 公開 URL と同一オリジン WS
  if (unified) {
    const wsProto = reqUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    return {
      graphqlWsUrl: `${wsProto}//${reqUrl.host}/graphql`,
      unified: true,
      localDev: false,
    }
  }

  // ローカル / Docker Compose: ブラウザから Gateway 公開ポートへ直接 WS
  if (localDev) {
    try {
      const u = new URL(forceHttpBase(apiBase))
      const port = u.port || '8080'
      return {
        graphqlWsUrl: `ws://127.0.0.1:${port}/graphql`,
        unified: false,
        localDev: true,
      }
    } catch {
      return {
        graphqlWsUrl: 'ws://127.0.0.1:8080/graphql',
        unified: false,
        localDev: true,
      }
    }
  }

  return {
    graphqlWsUrl: httpBaseToGraphqlWs(apiBase),
    unified: false,
    localDev: false,
  }
}

export function defaultGraphqlWsUri(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL?.trim()
  if (fromEnv) {
    const trimmed = fromEnv.replace(/\/+$/, '')
    const ws = trimmed.endsWith('/graphql') ? trimmed : `${trimmed}/graphql`
    return forceWsScheme(ws)
  }
  return 'ws://127.0.0.1:8080/graphql'
}
