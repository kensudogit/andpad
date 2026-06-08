/** ブラウザセッション用 JWT（HttpOnly Cookie の補完・GraphQL Authorization 用） */
const STORAGE_KEY = 'dv_auth_token'

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, token)
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(STORAGE_KEY)
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(STORAGE_KEY)
}
