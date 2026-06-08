'use client'

/**
 * urql Subscription で学習進捗・ダッシュボード更新をリアルタイム表示。
 */
import { useContext, useEffect, useState } from 'react'
import { useSubscription } from 'urql'
import { GraphqlRuntimeContext } from '@/components/GraphQLProviders'
import {
  DashboardUpdatedDocument,
  LearningActivityDocument,
  ProgressUpdatedDocument,
} from '@/lib/generated/graphql'
import { DEMO_LEARNER_ID } from '@/lib/learner'
import { ui } from '@/lib/ui'

type ActivityRow = {
  kind: string
  message: string
  occurredAt: string
}

function liveBadgeState(wsConnection: string, wsError: boolean): {
  label: string
  className: string
  showOfflineHint: boolean
} {
  if (wsConnection === 'connected') {
    return { label: ui.liveActive, className: '', showOfflineHint: false }
  }
  if (wsConnection === 'reconnecting') {
    return { label: ui.liveReconnecting, className: ' live-badge--connecting', showOfflineHint: false }
  }
  if (wsConnection === 'connecting') {
    return { label: ui.liveConnecting, className: ' live-badge--connecting', showOfflineHint: false }
  }
  if (wsError) {
    return { label: ui.liveOffline, className: ' live-badge--offline', showOfflineHint: true }
  }
  return { label: ui.liveReconnecting, className: ' live-badge--connecting', showOfflineHint: false }
}

function LivePanelConnecting() {
  return (
    <section className="live-panel" aria-live="polite">
      <header className="live-panel-head">
        <h2>{ui.livePanelTitle}</h2>
        <span className="live-badge live-badge--connecting">{ui.liveConnecting}</span>
      </header>
      <p className="muted small">{ui.liveConnecting}</p>
    </section>
  )
}

function LivePanelBody() {
  const runtime = useContext(GraphqlRuntimeContext)
  const [stats, setStats] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [feed, setFeed] = useState<ActivityRow[]>([])

  const [dash] = useSubscription({ query: DashboardUpdatedDocument })
  const [prog] = useSubscription({
    query: ProgressUpdatedDocument,
    variables: { learnerId: DEMO_LEARNER_ID },
  })
  const [activity] = useSubscription({
    query: LearningActivityDocument,
    variables: { learnerId: DEMO_LEARNER_ID },
  })

  const wsError = Boolean(dash.error ?? prog.error ?? activity.error)
  const badge = liveBadgeState(runtime.wsConnection, wsError)
  const wsTarget = runtime.graphqlWsUrl || runtime.apiBase || 'Gateway'
  const offlineHint = ui.liveOfflineHint(wsTarget, runtime.localDev)

  useEffect(() => {
    const d = dash.data?.dashboardUpdated
    if (d) {
      setStats(
        `\u52d5\u753b ${d.videosTotal} \u00b7 \u5b66\u7fd2\u30d1\u30b9 ${d.learningPathsTotal} \u00b7 \u8996\u8074 ${d.watchHoursThisMonth.toFixed(1)}h`,
      )
    }
  }, [dash.data])

  useEffect(() => {
    const p = prog.data?.progressUpdated
    if (p) {
      setProgress(`\u52d5\u753b ${p.videoId}: ${p.positionSec}s ${p.completed ? '(\u5b8c\u4e86)' : ''}`)
    }
  }, [prog.data])

  useEffect(() => {
    const ev = activity.data?.learningActivity
    if (ev) {
      setFeed((rows) => [{ kind: ev.kind, message: ev.message, occurredAt: ev.occurredAt }, ...rows].slice(0, 8))
    }
  }, [activity.data])

  return (
    <section className="live-panel" aria-live="polite">
      <header className="live-panel-head">
        <h2>{ui.livePanelTitle}</h2>
        <span className={`live-badge${badge.className}`}>{badge.label}</span>
      </header>
      {badge.showOfflineHint ? <p className="muted small live-offline-hint">{offlineHint}</p> : null}
      {stats ? <p className="live-stat">{stats}</p> : null}
      {progress ? <p className="live-progress">{progress}</p> : null}
      <ul className="live-feed">
        {feed.map((row, i) => (
          <li key={`${row.occurredAt}-${i}`}>
            <span className="live-kind">{row.kind}</span>
            <span>{row.message}</span>
          </li>
        ))}
      </ul>
      {feed.length === 0 && !badge.showOfflineHint ? <p className="muted small">{ui.liveEmpty}</p> : null}
    </section>
  )
}

export function LearningLivePanel() {
  const runtime = useContext(GraphqlRuntimeContext)
  if (!runtime.subscriptionReady) {
    return <LivePanelConnecting />
  }
  return <LivePanelBody />
}
