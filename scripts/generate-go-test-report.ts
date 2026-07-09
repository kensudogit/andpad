/**
 * Go テストを実行し、結果を HTML / JSON で frontend/public/test-reports に出力する。
 *
 * Usage: npm run test:go:report
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const backend = path.join(root, 'backend')
const outDir = path.join(root, 'frontend', 'public', 'test-reports')
const coverageOut = path.join(outDir, 'coverage.out')
const coverageHTML = path.join(outDir, 'coverage.html')
const reportJSON = path.join(outDir, 'report.json')
const reportHTML = path.join(outDir, 'index.html')

type GoTestEvent = {
  Time?: string
  Action: string
  Package?: string
  Test?: string
  Elapsed?: number
  Output?: string
}

type TestCase = {
  package: string
  name: string
  status: 'pass' | 'fail' | 'skip'
  elapsedSec: number
  output: string
}

type PackageResult = {
  package: string
  status: 'pass' | 'fail' | 'skip'
  elapsedSec: number
  coveragePct?: number
}

type Report = {
  generatedAt: string
  success: boolean
  durationSec: number
  summary: { packages: number; passed: number; failed: number; skipped: number; tests: number }
  packages: PackageResult[]
  tests: TestCase[]
}

function goBin(): string {
  const candidates = [
    process.env.GO,
    process.platform === 'win32'
      ? path.join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Go', 'bin', 'go.exe')
      : '/usr/local/go/bin/go',
    'go',
  ].filter((c): c is string => Boolean(c))
  return candidates.find((c) => c === 'go' || existsSync(c)) ?? 'go'
}

function parseTestJSON(raw: string): { events: GoTestEvent[]; exitCode: number } {
  const events: GoTestEvent[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      events.push(JSON.parse(trimmed) as GoTestEvent)
    } catch {
      // ignore non-json lines
    }
  }
  const failed = events.some((e) => e.Action === 'fail' && !e.Test)
  return { events, exitCode: failed ? 1 : 0 }
}

function buildReport(events: GoTestEvent[], success: boolean): Report {
  const pkgMap = new Map<string, PackageResult>()
  const tests: TestCase[] = []
  const testOutputs = new Map<string, string[]>()
  let totalElapsed = 0

  for (const e of events) {
    if (e.Action === 'output' && e.Package && e.Test) {
      const key = `${e.Package}\0${e.Test}`
      const lines = testOutputs.get(key) ?? []
      lines.push(e.Output ?? '')
      testOutputs.set(key, lines)
    }
  }

  for (const e of events) {
    if (!e.Package) continue
    if (e.Test && (e.Action === 'pass' || e.Action === 'fail' || e.Action === 'skip')) {
      const key = `${e.Package}\0${e.Test}`
      tests.push({
        package: e.Package,
        name: e.Test,
        status: e.Action,
        elapsedSec: e.Elapsed ?? 0,
        output: (testOutputs.get(key) ?? []).join(''),
      })
    }
    if (!e.Test && (e.Action === 'pass' || e.Action === 'fail' || e.Action === 'skip')) {
      const covMatch = (testOutputs.get(`${e.Package}\0`) ?? []).join('').match(/coverage: ([\d.]+)% of statements/)
      pkgMap.set(e.Package, {
        package: e.Package,
        status: e.Action,
        elapsedSec: e.Elapsed ?? 0,
        coveragePct: covMatch ? Number(covMatch[1]) : undefined,
      })
      totalElapsed += e.Elapsed ?? 0
    }
  }

  const packages = [...pkgMap.values()].sort((a, b) => a.package.localeCompare(b.package))
  const passed = packages.filter((p) => p.status === 'pass').length
  const failed = packages.filter((p) => p.status === 'fail').length
  const skipped = packages.filter((p) => p.status === 'skip').length

  return {
    generatedAt: new Date().toISOString(),
    success,
    durationSec: Math.round(totalElapsed * 1000) / 1000,
    summary: {
      packages: packages.length,
      passed,
      failed,
      skipped,
      tests: tests.length,
    },
    packages,
    tests: tests.sort((a, b) => a.package.localeCompare(b.package) || a.name.localeCompare(b.name)),
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderHTML(report: Report, hasCoverage: boolean): string {
  const statusClass = report.success ? 'ok' : 'fail'
  const statusLabel = report.success ? 'PASS' : 'FAIL'

  const pkgRows = report.packages
    .map((p) => {
      const cov = p.coveragePct != null ? `${p.coveragePct.toFixed(1)}%` : '—'
      return `<tr class="${p.status}">
        <td><code>${esc(shortPkg(p.package))}</code></td>
        <td class="status-${p.status}">${p.status.toUpperCase()}</td>
        <td>${p.elapsedSec.toFixed(3)}s</td>
        <td>${cov}</td>
      </tr>`
    })
    .join('\n')

  const testRows = report.tests
    .map((t) => {
      const out = t.output.trim()
        ? `<details><summary>出力</summary><pre>${esc(t.output)}</pre></details>`
        : ''
      return `<tr class="${t.status}">
        <td><code>${esc(shortPkg(t.package))}</code></td>
        <td><code>${esc(t.name)}</code></td>
        <td class="status-${t.status}">${t.status.toUpperCase()}</td>
        <td>${t.elapsedSec.toFixed(3)}s</td>
        <td>${out}</td>
      </tr>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ANDPAD Go Test Report</title>
  <style>
    :root { --ok:#0d7a4e; --fail:#c0392b; --skip:#888; --bg:#f6f8fb; --card:#fff; --line:#e2e8f0; }
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", "Hiragino Sans", Meiryo, sans-serif; margin:0; background:var(--bg); color:#1a202c; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
    h1 { margin: 0 0 .25rem; font-size: 1.5rem; }
    .meta { color:#64748b; margin-bottom: 1rem; }
    .badge { display:inline-block; padding:.2rem .6rem; border-radius:999px; font-weight:700; color:#fff; }
    .badge.ok { background:var(--ok); }
    .badge.fail { background:var(--fail); }
    .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:.75rem; margin:1rem 0; }
    .card { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:1rem; }
    .card strong { display:block; font-size:1.4rem; }
    .links { margin: 1rem 0; }
    .links a { margin-right: 1rem; }
    table { width:100%; border-collapse:collapse; background:var(--card); border:1px solid var(--line); border-radius:10px; overflow:hidden; margin:1rem 0; }
    th, td { padding:.55rem .7rem; border-bottom:1px solid var(--line); text-align:left; vertical-align:top; }
    th { background:#edf2f7; font-size:.85rem; }
    tr.fail td { background:#fff5f5; }
    .status-pass { color:var(--ok); font-weight:700; }
    .status-fail { color:var(--fail); font-weight:700; }
    .status-skip { color:var(--skip); font-weight:700; }
    pre { white-space:pre-wrap; font-size:.8rem; background:#0f172a; color:#e2e8f0; padding:.75rem; border-radius:6px; overflow:auto; }
    details summary { cursor:pointer; color:#2563eb; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>ANDPAD Go Test Report</h1>
    <p class="meta">Generated: ${esc(report.generatedAt)} · Duration: ${report.durationSec}s</p>
    <span class="badge ${statusClass}">${statusLabel}</span>
    <div class="cards">
      <div class="card"><span>Packages</span><strong>${report.summary.packages}</strong></div>
      <div class="card"><span>Passed</span><strong>${report.summary.passed}</strong></div>
      <div class="card"><span>Failed</span><strong>${report.summary.failed}</strong></div>
      <div class="card"><span>Tests</span><strong>${report.summary.tests}</strong></div>
    </div>
    <div class="links">
      <a href="/tests">← Web ダッシュボード</a>
      ${hasCoverage ? '<a href="/test-reports/coverage.html" target="_blank">カバレッジ HTML</a>' : ''}
    </div>
    <h2>Packages</h2>
    <table>
      <thead><tr><th>Package</th><th>Status</th><th>Elapsed</th><th>Coverage</th></tr></thead>
      <tbody>${pkgRows}</tbody>
    </table>
    <h2>Test Cases</h2>
    <table>
      <thead><tr><th>Package</th><th>Test</th><th>Status</th><th>Elapsed</th><th>Output</th></tr></thead>
      <tbody>${testRows}</tbody>
    </table>
  </div>
</body>
</html>`
}

function shortPkg(pkg: string): string {
  const prefix = 'github.com/pluszero/dental-video-api/'
  return pkg.startsWith(prefix) ? pkg.slice(prefix.length) : pkg
}

function main(): void {
  mkdirSync(outDir, { recursive: true })
  const go = goBin()

  console.log('[test-report] running go test ./...')

  const result = spawnSync(
    go,
    ['test', './...', '-json', '-coverprofile=' + coverageOut, '-covermode=atomic'],
    { cwd: backend, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
  )

  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  if (stderr.trim()) {
    console.error(stderr)
  }

  const { events } = parseTestJSON(stdout)
  const success = result.status === 0
  const report = buildReport(events, success)

  // package-level coverage from go test output lines
  for (const line of stdout.split('\n')) {
    const m = line.match(/^(ok|FAIL)\s+(\S+)\s+[\d.]+s(?:\s+coverage: ([\d.]+)% of statements)?/)
    if (!m) continue
    const pkg = m[2]
    const entry = report.packages.find((p) => p.package === pkg)
    if (entry && m[3]) {
      entry.coveragePct = Number(m[3])
    }
  }

  writeFileSync(reportJSON, JSON.stringify(report, null, 2), 'utf8')

  const hasCoverage = existsSync(coverageOut)
  if (existsSync(coverageOut)) {
    const cover = spawnSync(go, ['tool', 'cover', '-html=' + coverageOut, '-o', coverageHTML], {
      cwd: backend,
      encoding: 'utf8',
    })
    if (cover.status !== 0) {
      console.warn('[test-report] coverage HTML generation failed:', cover.stderr)
    } else {
      console.log('[test-report] coverage HTML:', coverageHTML)
    }
  }

  writeFileSync(reportHTML, renderHTML(report, existsSync(coverageHTML)), 'utf8')

  console.log('[test-report] JSON :', reportJSON)
  console.log('[test-report] HTML :', reportHTML)
  console.log(
    `[test-report] ${success ? 'PASS' : 'FAIL'} — ${report.summary.passed}/${report.summary.packages} packages, ${report.summary.tests} tests`,
  )
  console.log('[test-report] view: http://localhost:3000/tests (after npm run dev:web)')

  if (!success) {
    process.exit(1)
  }
}

main()
