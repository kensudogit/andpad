/**
 * REST（認証）用 API ベース URL。
 * ブラウザは常に同一オリジン（Next.js が Go へプロキシ）。
 */
export function apiBase(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return (process.env.API_URL ?? 'http://localhost:8080').replace(/\/+$/, '')
}
