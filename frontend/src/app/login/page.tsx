'use client'

/**
 * クリニックログイン（/auth/login へ POST、成功後は /settings へ遷移）。
 */
import Link from 'next/link'
import { useState } from 'react'
import { apiBase } from '@/lib/api-base'
import { setAuthToken } from '@/lib/auth-session'
import { resetApolloClient } from '@/lib/apollo-client'
import { ui } from '@/lib/ui'

const LOGIN_TIMEOUT_MS = 20000

export default function LoginPage() {
  const [email, setEmail] = useState('demo@sakura-dental.jp')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase()}/auth/login`, {
        // 同一オリジン → Next プロキシ → Go /auth/login
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
      })
      const body = (await res.json()) as { token?: string; error?: string }
      if (!res.ok) {
        throw new Error(body.error ?? 'Login failed')
      }
      if (body.token) {
        setAuthToken(body.token)
      }
      await resetApolloClient()
      // フルページ遷移で Apollo / Router のハングを回避
      window.location.assign('/settings')
    } catch (err) {
      if (err instanceof Error && err.name === 'TimeoutError') {
        setError('Login timed out. Check /status and DATABASE_URL on Railway, then retry.')
      } else if (err instanceof Error && err.message === 'Failed to fetch') {
        setError(
          isLocalHost
            ? 'API に接続できません。Docker の場合は npm run docker:up で Web(:3001) を再ビルドし、Gateway http://localhost:18080/health を確認してください。'
            : 'API に接続できません。/status で接続状態を確認してください。',
        )
      } else {
        setError(err instanceof Error ? err.message : 'Login failed')
      }
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="panel auth-card">
        <h1>{ui.loginTitle}</h1>
        <p className="muted">{ui.loginDesc}</p>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? ui.loginBusy : ui.loginSubmit}
          </button>
        </form>
        {error ? (
          <div className="alert">
            <p>{error}</p>
            {error.includes('postgresql') ||
            error.includes('DATABASE_URL') ||
            error.includes('Cannot reach API') ? (
              <div className="muted small" style={{ marginTop: '0.5rem' }}>
                {isLocalHost ? (
                  <>
                    <p>ローカル開発: ターミナルで Ctrl+C → 以下を実行して API を再起動してください。</p>
                    <pre style={{ marginTop: '0.5rem', overflow: 'auto' }}>npm run dev:monolith</pre>
                    <p style={{ marginTop: '0.5rem' }}>
                      デモ: <code>demo@sakura-dental.jp</code> / <code>demo1234</code>
                    </p>
                  </>
                ) : (
                  <>
                    <p>Railway（andpad サービス → Variables）:</p>
                    <ol style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                      <li>
                        <strong>+ New Variable</strong> → Name: <code>DATABASE_URL</code> →{' '}
                        <strong>Add Reference</strong> → Postgres → DATABASE_URL
                      </li>
                      <li>
                        <strong>JWT_SECRET</strong> = ランダム文字列（API キーではない）
                      </li>
                      <li>
                        <strong>OPENAI_API_KEY</strong> = OpenAI 用（JWT_SECRET とは別）
                      </li>
                      <li>
                        Redeploy → <Link href="/status">/status</Link> で PostgreSQL: connected
                      </li>
                    </ol>
                  </>
                )}
              </div>
            ) : error.includes('timed out') || error.includes('Timeout') ? (
              <p className="muted small" style={{ marginTop: '0.5rem' }}>
                <Link href="/status">/status</Link> で PostgreSQL: connected を確認してください。
              </p>
            ) : error === 'invalid credentials' ? (
              <p className="muted small" style={{ marginTop: '0.5rem' }}>
                Demo: demo@sakura-dental.jp / demo1234
                {!isLocalHost ? ' — redeploy after DATABASE_URL is set so the demo account is seeded.' : ''}
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="muted small" style={{ marginTop: '1rem' }}>
          {ui.loginDemoHint}
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          <Link href="/">{ui.backHome}</Link>
        </p>
      </div>
    </div>
  )
}
