'use client'

import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { useState } from 'react'
import { AndpadAnalyticsDocument } from '@/lib/generated/graphql'
import { graphQLErrorHint, isAuthRequiredGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

const statusLabels: Record<string, string> = {
  PLANNING: ui.projectPlanning,
  IN_PROGRESS: ui.projectInProgress,
  COMPLETED: ui.projectCompleted,
  ON_HOLD: ui.projectOnHold,
}

export function AnalyticsModuleClient() {
  const [periodDays, setPeriodDays] = useState(30)
  const { data, loading, error } = useQuery(AndpadAnalyticsDocument, {
    variables: { periodDays },
    fetchPolicy: 'network-only',
  })

  if (loading) return <p className="muted">{ui.boardLoading}</p>

  if (error) {
    const msg = isAuthRequiredGraphQLError(error)
      ? ui.saasLoginHint
      : error.message || graphQLErrorHint(error.message) || ui.saasLoadFailed
    return <p className="alert">{msg}</p>
  }

  const dash = data?.andpadAnalytics
  if (!dash) return null

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
        <div className="saas-form">
          <label>
            {ui.analyticsPeriod}:{' '}
            <select value={periodDays} onChange={(e) => setPeriodDays(Number(e.target.value))}>
              <option value={7}>7日</option>
              <option value={30}>30日</option>
              <option value={90}>90日</option>
            </select>
          </label>
        </div>
      </section>

      <section className="stat-grid">
        {dash.kpis.map((kpi) => (
          <div key={kpi.label} className="stat-card">
            <span className="stat-label">{kpi.label}</span>
            <span className="stat-value">
              {kpi.unit === '円'
                ? `¥${kpi.value.toLocaleString()}`
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

      <p className="muted small" style={{ marginTop: '1rem' }}>
        生成: {dash.generatedAt.replace('T', ' ').slice(0, 16)}
      </p>
    </>
  )
}
