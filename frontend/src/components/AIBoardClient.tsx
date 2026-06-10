'use client'

/**
 * AI Board: 建設 PM KPI 表示と OpenAI 経営インサイト生成。
 */
import { useMutation, useQuery } from '@apollo/client/react'
import { useMemo, useState } from 'react'
import { IconRefresh, IconSpark } from '@/components/ui/ButtonIcons'
import {
  BoardAnalyticsPageDocument,
  GenerateAnalyticsInsightDocument,
} from '@/lib/generated/graphql'
import { ui } from '@/lib/ui'

const statusLabels: Record<string, string> = {
  PLANNING: ui.projectPlanning,
  IN_PROGRESS: ui.projectInProgress,
  COMPLETED: ui.projectCompleted,
  ON_HOLD: ui.projectOnHold,
}

function formatKpiValue(value: number, unit?: string | null) {
  if (unit === '円') return `¥${value.toLocaleString()}`
  if (unit) return `${value.toLocaleString()}${unit}`
  return value.toLocaleString()
}

export function AIBoardClient() {
  const [periodDays, setPeriodDays] = useState(30)
  const { data, loading, refetch } = useQuery(BoardAnalyticsPageDocument, { variables: { periodDays } })
  const [generate, { loading: aiBusy, data: insightData }] = useMutation(GenerateAnalyticsInsightDocument)

  const board = data?.andpadAnalytics
  const insight = insightData?.generateAnalyticsInsight
  const maxWeekly = useMemo(
    () => Math.max(1, ...(board?.recordsByWeek ?? [1])),
    [board?.recordsByWeek],
  )
  const maxMonthlyCost = useMemo(
    () => Math.max(1, ...(board?.costByMonth?.map((m) => m.amount) ?? [1])),
    [board?.costByMonth],
  )

  return (
    <div className="board-layout">
      <div className="board-toolbar">
        <label>
          {ui.boardPeriod}
          <select value={periodDays} onChange={(e) => setPeriodDays(Number(e.target.value))}>
            <option value={7}>{ui.days(7)}</option>
            <option value={30}>{ui.days(30)}</option>
            <option value={90}>{ui.days(90)}</option>
          </select>
        </label>
        <div className="btn-group">
          <button type="button" className="btn btn-secondary" onClick={() => refetch()} disabled={loading}>
            <IconRefresh />
            {ui.boardRefresh}
          </button>
          <button
            type="button"
            className="btn btn-ai"
            disabled={aiBusy}
            onClick={() => generate({ variables: { periodDays } })}
          >
            <IconSpark />
            {aiBusy ? ui.boardAiBusy : ui.boardAiGenerate}
          </button>
        </div>
      </div>

      {board ? (
        <>
          <section className="stat-grid">
            {board.kpis.map((k) => (
              <div key={k.label} className="stat-card">
                <div className="stat-label">{k.label}</div>
                <div className="stat-value">{formatKpiValue(k.value, k.unit)}</div>
              </div>
            ))}
            <div className="stat-card">
              <div className="stat-label">{ui.boardHealthScore}</div>
              <div className="stat-value">{board.projectHealthScore.toFixed(0)}</div>
            </div>
          </section>

          <section className="panel">
            <h3>{ui.boardWeeklyRecords}</h3>
            <div className="bar-chart">
              {board.recordsByWeek.map((count, i) => (
                <div key={i} className="bar-col">
                  <div
                    className="bar-fill"
                    style={{ height: `${Math.min(100, (count / maxWeekly) * 100)}%` }}
                  />
                  <span>W{i + 1}</span>
                  <em>{count.toFixed(0)}</em>
                </div>
              ))}
            </div>
          </section>

          {board.costByMonth.length > 0 ? (
            <section className="panel">
              <h3>{ui.boardCostByMonth}</h3>
              <div className="bar-chart">
                {board.costByMonth.map((m) => (
                  <div key={m.month} className="bar-col">
                    <div
                      className="bar-fill"
                      style={{
                        height: `${Math.min(100, (m.amount / maxMonthlyCost) * 100)}%`,
                        background: 'linear-gradient(180deg, #7c3aed, #a78bfa)',
                      }}
                    />
                    <span>{m.month.slice(5)}月</span>
                    <em>{m.amount >= 100_000_000 ? `${(m.amount / 100_000_000).toFixed(1)}億` : `${(m.amount / 10_000).toFixed(0)}万`}</em>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel board-two-col">
            <div>
              <h3>{ui.boardByStatus}</h3>
              <ul className="metric-list">
                {board.projectsByStatus.length === 0 ? (
                  <li>
                    <span className="muted">{ui.boardNoData}</span>
                  </li>
                ) : (
                  board.projectsByStatus.map((s) => (
                    <li key={s.status}>
                      <span>{statusLabels[s.status] ?? s.status}</span>
                      <strong>{s.count}</strong>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <h3>{ui.boardModuleUsage}</h3>
              <ul className="metric-list">
                {board.moduleUsage.length === 0 ? (
                  <li>
                    <span className="muted">{ui.boardNoData}</span>
                  </li>
                ) : (
                  board.moduleUsage.slice(0, 5).map((m) => (
                    <li key={m.moduleCode}>
                      <span>{m.moduleName}</span>
                      <strong>{m.recordCount}</strong>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>
        </>
      ) : (
        <p className="muted">{loading ? ui.boardLoading : ui.boardNoData}</p>
      )}

      {insight ? (
        <section className="panel ai-insight">
          <h3>{ui.boardInsightTitle}</h3>
          <p>{insight.summary}</p>
          <div className="insight-cols">
            <div>
              <h4>{ui.boardStrengths}</h4>
              <ul>{insight.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
            <div>
              <h4>{ui.boardRisks}</h4>
              <ul>{insight.risks.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
            <div>
              <h4>{ui.boardRecommendations}</h4>
              <ul>{insight.recommendations.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          </div>
          <p className="muted small">{insight.generatedAt}</p>
        </section>
      ) : null}
    </div>
  )
}
