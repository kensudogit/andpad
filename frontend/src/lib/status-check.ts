/**
 * サーバー側 API 接続診断（/status ページ・/api/status 共通）。
 */
import { isUnifiedDeploy, resolveApiUrl } from '@/lib/resolve-api-url'

export type SetupStatus = {
  postgres?: boolean
  databaseSource?: string
  databaseUrl?: string
  databasePrivateUrl?: string
  pgHost?: string
  jwtSecret?: string
  jwtSecretWarning?: string
  openaiApiKey?: string
  railway?: boolean
  hint?: string
}

export type StatusPayload = {
  service: string
  ok: boolean
  apiUrl: string
  apiUrlNote?: string
  graphqlProxy: string
  unified: boolean
  postgres?: boolean
  openai?: boolean
  setup?: SetupStatus
  health: { ok?: boolean; service?: string; version?: string }
  error?: string
}

export async function fetchApiStatus(): Promise<StatusPayload> {
  const apiUrl = resolveApiUrl()
  const unified = isUnifiedDeploy()

  let health: StatusPayload['health'] = {}
  let apiReachable = false
  let postgres: boolean | undefined
  let openai: boolean | undefined
  let setup: SetupStatus | undefined
  let error: string | undefined

  try {
    const res = await fetch(`${apiUrl}/health`, { cache: 'no-store' })
    health = (await res.json()) as StatusPayload['health']
    apiReachable = res.ok && health.ok === true

    const statusRes = await fetch(`${apiUrl}/status`, { cache: 'no-store' })
    if (statusRes.ok) {
      const statusJson = (await statusRes.json()) as {
        postgres?: boolean
        openai?: boolean
        setup?: SetupStatus
      }
      postgres = statusJson.postgres
      openai = statusJson.openai
      setup = statusJson.setup
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  const payload: StatusPayload = {
    service: 'andpad-web',
    ok: apiReachable,
    apiUrl,
    graphqlProxy: '/graphql',
    unified,
    postgres,
    openai,
    setup,
    health,
    error,
  }

  // 統合デプロイでは 127.0.0.1 は正常（ブラウザは /graphql プロキシを使用）
  if (unified && apiUrl.includes('127.0.0.1')) {
    payload.apiUrlNote =
      'Unified deploy: API runs inside the same container. Browsers use /graphql and /auth on this site (not 127.0.0.1).'
  }

  if (apiReachable && postgres === false) {
    payload.apiUrlNote =
      (payload.apiUrlNote ? payload.apiUrlNote + ' ' : '') +
      (setup?.hint ??
        'PostgreSQL is not connected. Set DATABASE_URL (Postgres Reference) on the Railway app service.')
  }

  return payload
}
