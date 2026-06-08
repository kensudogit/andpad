'use client'

/**
 * AI Board: 学習 KPI 表示と OpenAI 経営インサイト生成。
 */
import { useMutation, useQuery } from '@apollo/client/react'
import { useState } from 'react'
import { IconRefresh, IconSpark } from '@/components/ui/ButtonIcons'
import {
  BoardAnalyticsPageDocument,
  GenerateAnalyticsInsightDocument,
} from '@/lib/generated/graphql'
import { ui } from '@/lib/ui'

const kpiLabels: Record<string, string> = {
  watch_hours: '\u8996\u8074\u6642\u9593',
  completions: '\u5b8c\u4e86\u6570',
  active_learners: '\u30a2\u30af\u30c6\u30a3\u30d6\u5b66\u7fd2\u8005',
  new_enrollments: '\u65b0\u898f\u53d7\u8b16',
  video_library: '\u52d5\u753b\u6570',
}

export function AIBoardClient() {
  const [periodDays, setPeriodDays] = useState(30)
  const { data, loading, refetch } = useQuery(BoardAnalyticsPageDocument, { variables: { periodDays } })
  const [generate, { loading: aiBusy, data: insightData }] = useMutation(GenerateAnalyticsInsightDocument)

  const board = data?.analyticsBoard
  const insight = insightData?.generateAnalyticsInsight

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
                <div className="stat-label">{kpiLabels[k.label] ?? k.label}</div>
                <div className="stat-value">
                  {/* watch_hours のみ小数 1 桁表示 */}
                  {k.value.toFixed(k.label === 'watch_hours' ? 1 : 0)}
                  {k.unit ? ` ${k.unit}` : ''}
                </div>
              </div>
            ))}
            <div className="stat-card">
              <div className="stat-label">{ui.boardEngagement}</div>
              <div className="stat-value">{board.learnerEngagementScore.toFixed(0)}</div>
            </div>
          </section>

          <section className="panel">
            <h3>{ui.boardWeeklyWatch}</h3>
            <div className="bar-chart">
              {board.watchHoursByWeek.map((h, i) => (
                <div key={i} className="bar-col">
                  {/* 週次時間を棒グラフ高さに正規化（最大 5h ≒ 100%） */}
                  <div className="bar-fill" style={{ height: `${Math.min(100, h * 20)}%` }} />
                  <span>W{i + 1}</span>
                  <em>{h.toFixed(1)}h</em>
                </div>
              ))}
            </div>
          </section>

          <section className="panel board-two-col">
            <div>
              <h3>{ui.boardByCategory}</h3>
              <ul className="metric-list">
                {board.completionsByCategory.map((c) => (
                  <li key={c.category}>
                    <span>{c.category}</span>
                    <strong>{c.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{ui.boardTopVideos}</h3>
              <ul className="metric-list">
                {board.topVideos.map((v) => (
                  <li key={v.videoId}>
                    <span>{v.title}</span>
                    <strong>{ui.viewsCompletions(v.views, v.completions)}</strong>
                  </li>
                ))}
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
