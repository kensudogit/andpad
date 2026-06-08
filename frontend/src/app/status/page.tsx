/**
 * Go API 接続・PostgreSQL 設定状態の診断ページ（SSR）。
 */
import Link from 'next/link'
import { fetchApiStatus } from '@/lib/status-check'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function StatusPage() {
  const s = await fetchApiStatus()

  return (
    <div className="page-head">
      <h1>{ui.statusPageTitle}</h1>
      <p>{ui.statusPageDesc}</p>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <p>
          <strong>{ui.statusApiLabel}</strong>{' '}
          <span className={s.ok ? 'text-ok' : 'text-bad'}>{s.ok ? ui.statusOk : ui.statusNg}</span>
        </p>
        {s.apiUrlNote ? <p className="muted small">{s.apiUrlNote}</p> : null}
        <ul className="metric-list" style={{ marginTop: '0.75rem' }}>
          <li>
            <span>{ui.statusGraphql}</span>
            <code>/graphql</code> {s.ok ? '? OK' : ''}
          </li>
          <li>
            <span>{ui.statusAuth}</span>
            <code>/auth/login</code>
          </li>
          <li>
            <span>API (internal)</span>
            <code>{s.apiUrl}</code>
          </li>
          {s.health?.version ? (
            <li>
              <span>API version</span>
              <code>{s.health.version}</code>
            </li>
          ) : null}
          {typeof s.postgres === 'boolean' ? (
            <li>
              <span>PostgreSQL</span>
              <code>{s.postgres ? 'connected' : 'not configured'}</code>
            </li>
          ) : null}
          {typeof s.openai === 'boolean' ? (
            <li>
              <span>OpenAI</span>
              <code>{s.openai ? 'configured' : 'not configured'}</code>
            </li>
          ) : null}
        </ul>
        {s.postgres === false ? (
          <div className="alert" style={{ marginTop: '0.75rem' }}>
            <p>{s.setup?.hint ?? 'PostgreSQL is not connected.'}</p>
            <ul className="metric-list" style={{ marginTop: '0.5rem' }}>
              <li>
                <span>DATABASE_URL</span>
                <code>{s.setup?.databaseUrl ?? 'unknown'}</code>
              </li>
              <li>
                <span>DATABASE_PRIVATE_URL</span>
                <code>{s.setup?.databasePrivateUrl ?? 'unknown'}</code>
              </li>
              <li>
                <span>PGHOST</span>
                <code>{s.setup?.pgHost ?? 'unknown'}</code>
              </li>
              <li>
                <span>JWT_SECRET</span>
                <code>{s.setup?.jwtSecret ?? 'unknown'}</code>
              </li>
              <li>
                <span>OPENAI_API_KEY</span>
                <code>{s.setup?.openaiApiKey ?? 'unknown'}</code>
              </li>
            </ul>
            {s.setup?.jwtSecretWarning ? (
              <p className="muted small" style={{ marginTop: '0.5rem' }}>
                {s.setup.jwtSecretWarning}
              </p>
            ) : null}
          </div>
        ) : null}
        {s.ok && s.postgres && s.openai === false ? (
          <div className="alert muted" style={{ marginTop: '0.75rem' }}>
            <p>
              AI チャットボット / AI Board 用に <code>OPENAI_API_KEY</code> を Railway Variables に設定してください（
              <code>{s.setup?.openaiApiKey ?? 'unknown'}</code>）。
            </p>
          </div>
        ) : null}
        {s.error ? <p className="alert">{s.error}</p> : null}
        {!s.ok ? <p className="muted small">{ui.statusFailHint}</p> : null}
        {s.ok ? (
          <p className="muted small" style={{ marginTop: '0.75rem' }}>
            {ui.statusLoginHint}
          </p>
        ) : null}
        <p style={{ marginTop: '1rem' }}>
          <Link href="/login" className="btn">
            {ui.loginSubmit}
          </Link>{' '}
          <Link href="/">{ui.backHome}</Link>
        </p>
        <p className="muted small" style={{ marginTop: '0.75rem' }}>
          JSON: <Link href="/api/status">/api/status</Link>
        </p>
      </section>
    </div>
  )
}
