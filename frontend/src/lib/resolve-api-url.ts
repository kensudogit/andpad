/**
 * Go API ベース URL の解決（末尾スラッシュなし）。
 *
 * 統合デプロイ: UNIFIED_DEPLOY=1、同一コンテナ内 127.0.0.1:8081。
 * 2 サービス Railway: Web サービスに API の公開 HTTPS URL を API_URL で設定。
 */

export function isRailway(): boolean {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_ID,
  )
}

export function isUnifiedDeploy(): boolean {
  return unifiedDeployActive() && isRailway()
}

/** Dockerfile / start-unified.sh が UNIFIED_DEPLOY=1 を設定しているか */
export function unifiedDeployActive(): boolean {
  return process.env.UNIFIED_DEPLOY === '1' || process.env.UNIFIED_DEPLOY === 'true'
}

export function readApiUrlFromEnv(): string | undefined {
  const keys = ['API_URL', 'API URL', 'NEXT_PUBLIC_API_URL'] as const
  for (const key of keys) {
    const v = process.env[key]?.trim()
    if (v) return v
  }
  return undefined
}

/** Railway テンプレート ${{...}} が未展開のまま残っているか */
export function isUnresolvedRailwayReference(value: string): boolean {
  return value.includes('${{')
}

function isInvalidApiUrlEnv(value: string): boolean {
  const v = value.trim()
  if (!v) return true
  if (isUnresolvedRailwayReference(v)) return true
  const broken = ['https://', 'http://', 'https:', 'http:']
  if (broken.includes(v)) return true
  try {
    const u = new URL(v.startsWith('http') ? v : `https://${v}`)
    if (!u.hostname || u.hostname.length < 2) return true
    if (u.hostname === 'https' || u.hostname === 'http') return true
    return false
  } catch {
    return true
  }
}

function isLocalhostApi(value: string): boolean {
  try {
    const u = new URL(value.startsWith('http') ? value : `http://${value}`)
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1'
  } catch {
    return value.includes('127.0.0.1') || value.includes('localhost')
  }
}

/** API_URL が Web 自身を指しているとループするため除外 */
function pointsToThisWebService(url: string): boolean {
  const own = process.env.RAILWAY_PUBLIC_DOMAIN?.trim()
  if (!own) return false
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    return host === own
  } catch {
    return url.includes(own)
  }
}

function normalizeApiUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (isInvalidApiUrlEnv(trimmed)) {
    return ''
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  if (trimmed.includes('.railway.internal') || trimmed.includes('localhost')) {
    return `http://${trimmed}`
  }
  return `https://${trimmed}`
}

function localGatewayPort(): string {
  return process.env.GATEWAY_HOST_PORT?.trim() || '8080'
}

function localGatewayUrl(): string {
  return `http://127.0.0.1:${localGatewayPort()}`
}

function unifiedInternalApiUrl(): string {
  const port = process.env.API_INTERNAL_PORT?.trim() || '8081'
  return `http://127.0.0.1:${port}`
}

function railwayInternalApiUrl(): string {
  const host =
    process.env.API_INTERNAL_HOST?.trim() ||
    process.env.RAILWAY_SERVICE_API_HOST?.trim() ||
    'api.railway.internal'
  const port =
    process.env.API_INTERNAL_PORT?.trim() ||
    process.env.API_PORT?.trim() ||
    '8080'
  return `http://${host}:${port}`
}

function externalApiUrlFromEnv(): string | undefined {
  const explicit = readApiUrlFromEnv()
  if (!explicit) return undefined
  const normalized = normalizeApiUrl(explicit)
  if (!normalized || pointsToThisWebService(normalized)) return undefined
  if (isLocalhostApi(normalized)) return undefined
  return normalized
}

/** サーバー側 fetch 用: 優先順に重複排除した候補 URL 一覧 */
export function listApiBaseCandidates(): string[] {
  const seen = new Set<string>()
  const add = (raw: string) => {
    const trimmed = raw.trim().replace(/\/+$/, '')
    if (trimmed) seen.add(trimmed)
  }

  // 統合デプロイは同一コンテナ内 API を最優先（外部 API_URL 誤設定でも 502 を防ぐ）
  if (unifiedDeployActive()) {
    add(unifiedInternalApiUrl())
    add(`http://localhost:${process.env.API_INTERNAL_PORT?.trim() || '8081'}`)
  }

  const external = externalApiUrlFromEnv()
  if (external) {
    add(external)
  }

  const explicit = readApiUrlFromEnv()
  if (explicit) {
    const normalized = normalizeApiUrl(explicit)
    if (normalized && !pointsToThisWebService(normalized)) {
      // Railway 本番で localhost API_URL は無効（統合デプロイ時を除く）
      if (!(isRailway() && isLocalhostApi(normalized) && !unifiedDeployActive())) {
        add(normalized)
      }
    }
  }

  if (isRailway() && !isUnifiedDeploy()) {
    add(railwayInternalApiUrl())
  }

  if (!unifiedDeployActive()) {
    add(localGatewayUrl())
    add(`http://localhost:${localGatewayPort()}`)
  }
  return [...seen]
}

export function resolveApiUrl(): string {
  const external = externalApiUrlFromEnv()
  if (external) {
    return external
  }

  if (unifiedDeployActive()) {
    return unifiedInternalApiUrl()
  }

  const explicit = readApiUrlFromEnv()
  if (explicit) {
    const normalized = normalizeApiUrl(explicit)
    if (normalized && !pointsToThisWebService(normalized)) {
      if (isRailway() && isLocalhostApi(normalized)) {
        return railwayInternalApiUrl()
      }
      return normalized
    }
  }

  if (isRailway()) {
    return railwayInternalApiUrl()
  }

  return localGatewayUrl()
}

export function isProductionDeploy(): boolean {
  return process.env.NODE_ENV === 'production'
}

/** 接続失敗時 UI 向けの診断メッセージ（日本語/英語混在） */
export function graphQLConnectionHint(): string {
  const raw = readApiUrlFromEnv()
  const target = resolveApiUrl()

  if (isUnifiedDeploy()) {
    return (
      'Go API に接続できません。Railway の Deploy ログで "[unified] API ready" を確認してください。' +
      ' Variables の API_URL は削除してください（統合デプロイでは不要）。'
    )
  }

  if (isProductionDeploy() && isRailway() && raw && isLocalhostApi(raw)) {
    return (
      'This container runs Next.js only. Delete API_URL=' +
      JSON.stringify(raw) +
      ' and redeploy with unified Dockerfile, ' +
      'OR set API_URL to your api service public HTTPS URL.'
    )
  }

  if (raw && pointsToThisWebService(normalizeApiUrl(raw) || raw)) {
    return (
      'API_URL points to this Web app (' +
      raw +
      '). Set API_URL to the api service URL instead.'
    )
  }

  if (raw && process.env['API URL'] && !process.env.API_URL) {
    return 'Rename variable "API URL" to API_URL (underscore) on the Web service.'
  }

  if (raw && isInvalidApiUrlEnv(raw) && !isUnresolvedRailwayReference(raw)) {
    return 'API_URL is invalid (' + JSON.stringify(raw) + '). Use full https URL.'
  }

  if (raw && isUnresolvedRailwayReference(raw)) {
    return 'API_URL is still a Railway template. Set it via Add Reference with https:// prefix.'
  }

  if (isProductionDeploy() && isRailway()) {
    return 'Tried ' + target + '. Recreate the api service or use unified deploy (see docs/RAILWAY.md).'
  }

  if (isProductionDeploy()) {
    return 'Tried ' + target + '. Set API_URL to the API public HTTPS URL.'
  }

  return 'Local: run npm run dev from repository root, or docker compose up --build (Web :3001, Gateway :18080).'
}
