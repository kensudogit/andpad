'use client'

import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { useMemo, useState } from 'react'
import { AndpadAnalyticsDocument, ProjectBudgetSummariesDocument } from '@/lib/generated/graphql'
import { graphQLErrorHint, isAuthRequiredGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

const statusLabels: Record<string, string> = {
  PLANNING: ui.projectPlanning,
  IN_PROGRESS: ui.projectInProgress,
  COMPLETED: ui.projectCompleted,
  ON_HOLD: ui.projectOnHold,
}

function fmtYen(n: number) {
  if (Math.abs(n) >= 100_000_000) return `¥${(n / 100_000_000).toFixed(1)}億`
  if (Math.abs(n) >= 10_000) return `¥${(n / 10_000).toFixed(0)}万`
  return `¥${n.toLocaleString()}`
}

export function AnalyticsModuleClient() {
  const [periodDays, setPeriodDays] = useState(30)
  const [tab, setTab] = useState<'overview' | 'budget'>('overview')
  const { data, loading, error } = useQuery(AndpadAnalyticsDocument, {
    variables: { periodDays },
    fetchPolicy: 'network-only',
  })
  const { data: summariesData } = useQuery(ProjectBudgetSummariesDocument, {
    fetchPolicy: 'network-only',
  })

  const maxMonthlyCost = useMemo(
    () => Math.max(1, ...(data?.andpadAnalytics?.costByMonth?.map((m) => m.amount) ?? [1])),
    [data?.andpadAnalytics?.costByMonth],
  )

  if (loading) return <p className="muted">{ui.boardLoading}</p>

  if (error) {
    const msg = isAuthRequiredGraphQLError(error)
      ? ui.saasLoginHint
      : error.message || graphQLErrorHint(error.message) || ui.saasLoadFailed
    return <p className="alert">{msg}</p>
  }

  const dash = data?.andpadAnalytics
  if (!dash) return null

  const summaries = summariesData?.projectBudgetSummaries ?? []

  return (
    <>
      <div className="page-head">
        <Link href="/saas" className="muted">
          {ui.saasBack}
        </Link>
        <h1>{ui.analyticsTitle}</h1>
        <p className="muted">{ui.analyticsDesc}</p>
      </div>

      <section className="saas-panel">
        <div className="saas-form" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div className="btn-group">
            <button
              type="button"
              className={`btn${tab === 'overview' ? '' : ' btn-ghost'}`}
              onClick={() => setTab('overview')}
            >
              {ui.analyticsTabOverview}
            </button>
            <button
              type="button"
              className={`btn${tab === 'budget' ? '' : ' btn-ghost'}`}
              onClick={() => setTab('budget')}
            >
              {ui.analyticsTabBudget}
            </button>
          </div>
          <label>
            {ui.analyticsPeriod}:{' '}
            <select value={periodDays} onChange={(e) => setPeriodDays(Number(e.target.value))}>
              <option value={7}>7日</option>
              <option value={30}>30日</option>
              <option value={90}>90日</option>
            </select>
          </label>
          <Link href="/saas/budget" className="btn btn-ghost">
            {ui.analyticsBudgetLink}
          </Link>
        </div>
      </section>

      {tab === 'overview' ? (
        <>
          <section className="stat-grid">
            {dash.kpis.map((kpi) => (
              <div key={kpi.label} className="stat-card">
                <span className="stat-label">{kpi.label}</span>
                <span className="stat-value">
                  {kpi.unit === '円'
                    ? `¥${kpi.value.toLocaleString()}`
                    : kpi.unit === '%'
                      ? `${kpi.value.toFixed(1)}%`
                      : `${kpi.value.toLocaleString()}${kpi.unit ?? ''}`}
                </span>
                {kpi.trendPct != null && (
                  <span className="muted small">
                    {kpi.trendPct >= 0 ? '+' : ''}
                    {kpi.trendPct}% vs 前期
                  </span>
                )}
              </div>
            ))}
            <div className="stat-card">
              <span className="stat-label">{ui.analyticsHealthScore}</span>
              <span className="stat-value">{dash.projectHealthScore.toFixed(0)}</span>
            </div>
          </section>

          <div className="saas-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <section className="saas-panel">
              <h2>{ui.analyticsProjectsByStatus}</h2>
              <table className="saas-table">
                <tbody>
                  {dash.projectsByStatus.map((s) => (
                    <tr key={s.status}>
                      <td>{statusLabels[s.status] ?? s.status}</td>
                      <td>
                        <strong>{s.count}</strong> 件
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="saas-panel">
              <h2>{ui.analyticsModuleUsage}</h2>
              <table className="saas-table">
                <tbody>
                  {dash.moduleUsage.length === 0 ? (
                    <tr>
                      <td className="saas-empty">{ui.saasEmpty}</td>
                    </tr>
                  ) : (
                    dash.moduleUsage.map((m) => (
                      <tr key={m.moduleCode}>
                        <td>{m.moduleName}</td>
                        <td>
                          <strong>{m.recordCount}</strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </div>
        </>
      ) : (
        <>
          <section className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">{ui.budgetExecution}</span>
              <span className="stat-value">{fmtYen(dash.budgetTotal)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetActual}</span>
              <span className="stat-value">{fmtYen(dash.costTotal)}</span>
              <span className="muted small">{ui.analyticsPeriod}: {periodDays}日</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetVariance}</span>
              <span className="stat-value">{dash.budgetVariancePct.toFixed(1)}%</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetBillingTotal}</span>
              <span className="stat-value">{fmtYen(dash.billingTotal)}</span>
            </div>
          </section>

          {dash.costByMonth.length > 0 && (
            <section className="saas-panel" style={{ marginTop: '1rem' }}>
              <h2>{ui.boardCostByMonth}</h2>
              <div className="bar-chart" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', minHeight: 140 }}>
                {dash.costByMonth.map((m) => (
                  <div key={m.month} style={{ flex: 1, textAlign: 'center' }}>
                    <div
                      style={{
                        height: `${Math.min(100, (m.amount / maxMonthlyCost) * 100)}%`,
                        minHeight: m.amount > 0 ? 8 : 2,
                        maxHeight: 120,
                        background: 'linear-gradient(180deg, #7c3aed, #c4b5fd)',
                        borderRadius: 4,
                        margin: '0 auto',
                        width: '70%',
                      }}
                    />
                    <div className="muted small">{m.month.slice(5)}月</div>
                    <div style={{ fontSize: '0.85rem' }}>{fmtYen(m.amount)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="saas-panel" style={{ marginTop: '1rem' }}>
            <h2>{ui.analyticsProjectBudgets}</h2>
            {summaries.length === 0 ? (
              <p className="muted">{ui.budgetNoData}</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>{ui.projectName}</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>{ui.period}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetContract}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetExecution}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetActual}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetBillingTotal}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetVariance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map((s) => (
                      <tr key={s.projectId}>
                        <td style={{ padding: '0.5rem' }}>
                          <Link href="/saas/budget">{s.projectName}</Link>
                        </td>
                        <td style={{ padding: '0.5rem' }}>{statusLabels[s.status] ?? s.status}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(s.contractAmount)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(s.totalBudget)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(s.totalActual)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(s.billingTotal)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{s.variancePct.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <p className="muted small" style={{ marginTop: '1rem' }}>
        生成: {dash.generatedAt.replace('T', ' ').slice(0, 16)}
      </p>
    </>
  )
}
