import Link from 'next/link'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

type Report = {
  generatedAt: string
  success: boolean
  durationSec: number
  summary: { packages: number; passed: number; failed: number; skipped: number; tests: number }
  packages: Array<{ package: string; status: string; elapsedSec: number; coveragePct?: number }>
  tests: Array<{ package: string; name: string; status: string; elapsedSec: number }>
}

function loadReport(): Report | null {
  const file = path.join(process.cwd(), 'public', 'test-reports', 'report.json')
  if (!existsSync(file)) return null
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as Report
  } catch {
    return null
  }
}

function shortPkg(pkg: string): string {
  const prefix = 'github.com/pluszero/dental-video-api/'
  return pkg.startsWith(prefix) ? pkg.slice(prefix.length) : pkg
}

export default function TestsPage() {
  const report = loadReport()
  const hasCoverage = existsSync(path.join(process.cwd(), 'public', 'test-reports', 'coverage.html'))
  const hasHtml = existsSync(path.join(process.cwd(), 'public', 'test-reports', 'index.html'))

  if (!report) {
    return (
      <div className="page-head">
        <h1>{ui.testsPageTitle}</h1>
        <p>{ui.testsPageDesc}</p>
        <section className="panel" style={{ marginTop: '1rem' }}>
          <p className="alert">{ui.testsNoReport}</p>
          <pre className="code-block" style={{ marginTop: '0.75rem' }}>
            {`cd C:\\devlop\\andpad
npm run test:go:report
npm run dev:web`}
          </pre>
          <p style={{ marginTop: '1rem' }}>
            <Link href="/status">{ui.apiStatus}</Link>
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="page-head">
      <h1>{ui.testsPageTitle}</h1>
      <p>{ui.testsPageDesc}</p>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <p>
          <strong>{ui.testsResultLabel}</strong>{' '}
          <span className={report.success ? 'text-ok' : 'text-bad'}>
            {report.success ? ui.testsPass : ui.testsFail}
          </span>
          <span className="muted small" style={{ marginLeft: '0.75rem' }}>
            {new Date(report.generatedAt).toLocaleString('ja-JP')} · {report.durationSec}s
          </span>
        </p>

        <ul className="metric-list" style={{ marginTop: '0.75rem' }}>
          <li>
            <span>{ui.testsPackages}</span>
            <code>
              {report.summary.passed}/{report.summary.packages} OK
            </code>
          </li>
          <li>
            <span>{ui.testsCases}</span>
            <code>{report.summary.tests}</code>
          </li>
          {report.summary.failed > 0 ? (
            <li>
              <span>{ui.testsFailed}</span>
              <code className="text-bad">{report.summary.failed}</code>
            </li>
          ) : null}
        </ul>

        <p style={{ marginTop: '1rem' }}>
          {hasHtml ? (
            <a href="/test-reports/index.html" className="btn" target="_blank" rel="noreferrer">
              {ui.testsOpenHtml}
            </a>
          ) : null}{' '}
          {hasCoverage ? (
            <a href="/test-reports/coverage.html" className="btn secondary" target="_blank" rel="noreferrer">
              {ui.testsOpenCoverage}
            </a>
          ) : null}
        </p>

        <p className="muted small" style={{ marginTop: '0.75rem' }}>
          {ui.testsRefreshHint}
        </p>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>{ui.testsPackageList}</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>Status</th>
              <th>Elapsed</th>
              <th>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {report.packages.map((p) => (
              <tr key={p.package}>
                <td>
                  <code>{shortPkg(p.package)}</code>
                </td>
                <td className={p.status === 'pass' ? 'text-ok' : p.status === 'fail' ? 'text-bad' : 'muted'}>
                  {p.status.toUpperCase()}
                </td>
                <td>{p.elapsedSec.toFixed(3)}s</td>
                <td>{p.coveragePct != null ? `${p.coveragePct.toFixed(1)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {hasHtml ? (
        <section className="panel" style={{ marginTop: '1rem' }}>
          <h2 style={{ marginTop: 0 }}>{ui.testsEmbedTitle}</h2>
          <iframe
            src="/test-reports/index.html"
            title="Go test report"
            style={{ width: '100%', minHeight: '480px', border: '1px solid var(--border)', borderRadius: '8px' }}
          />
        </section>
      ) : null}
    </div>
  )
}
