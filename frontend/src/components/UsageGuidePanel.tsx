'use client'

/**
 * 画面右下のドラッグ可能な利用手順パネル（localStorage で位置・開閉を保存）。
 * アーキテクチャ概要・運用手順をデモ／ポートフォリオ向けに表示する。
 */
import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'dental-video-usage-guide-v8'
const PANEL_WIDTH = 420

type GuideStep = {
  title: string
  body: string
  items?: readonly string[]
}

type FeaturedBlock = {
  badge: string
  title: string
  body: string
  items?: readonly string[]
  variant?: 'architecture' | 'saas' | 'default'
}

const architectureFeatured: FeaturedBlock = {
  badge: 'Architecture',
  title: 'BFF + 6 SaaS Microservices',
  body:
    'Next.js は Gateway のみに接続。認証・学習・GraphQL BFF は Gateway (:8080)、SaaS 業務は独立プロセス (:8081–8086) に分離。テナント分離は org_id + JWT 転送で一貫。',
  variant: 'architecture',
  items: [
    'Gateway — 認証 / 組織 / 学習 / GraphQL / org_modules ON-OFF',
    'saas-dx :8081 · saas-crm :8082 · saas-attendance :8083',
    'saas-contract :8084 · saas-chat :8085 · saas-rag :8086',
    'GraphQL SDL が API 契約の Single Source of Truth',
    'SAAS_MONOLITH=true でモノリスフォールバック（開発用）',
  ],
}

const saasFeatured: FeaturedBlock = {
  badge: 'SaaS',
  title: '建設プロジェクト管理 19モジュール',
  body: '/saas で施工管理・予算原価管理・電子納品・BIM・Analytics など19機能を ON/OFF。案件単位で記録を一元管理します。',
  variant: 'saas',
  items: [
    '施工管理 · 図面 · 電子納品 · BM · Analytics · API連携 · BIM',
    '検査 · ボード · 受発注 · 請求 · 歩掛 · 入退場 ほか',
    'デモ: demo@sakura-dental.jp / demo1234 → /projects → /saas',
    '組織設定 /settings — プラン・利用量・Team ロール',
  ],
}

const techStack = [
  'GraphQL · gqlgen',
  'Go 1.25 · chi',
  'Next.js 15 · Apollo',
  'PostgreSQL',
  'JWT · org_id',
  'Docker Compose',
] as const

const archDiagram = `Next.js :3000
    │ GraphQL / REST
    ▼
Gateway (BFF) :8080 ── org_modules
    ├─ saas-dx        :8081
    ├─ saas-crm       :8082
    ├─ saas-attendance:8083
    ├─ saas-contract  :8084
    ├─ saas-chat      :8085
    └─ saas-rag       :8086
         │ shared PostgreSQL + JWT_SECRET`

const L = {
  title: '利用手順',
  subtitle: 'Architecture & Ops',
  dragHint: 'ドラッグで移動',
  expand: '開く',
  collapse: '閉じる',
  heroTitle: 'ANDPAD 建設プロジェクト管理',
  heroLead:
    '現場の効率化から経営改善まで一元管理。案件 × 13モジュール × AI Board。',
  stackLabel: 'Tech stack',
  diagramLabel: 'Service topology',
  scrollHint: '↓ デプロイ・開発・機能別の手順は下へ',
  footer:
    '▼▲ で開閉 · ヘッダーをドラッグして移動 · 表示位置は自動保存されます。',
  steps: [
    {
      title: '1. 接続確認（最初に）',
      body: '本番・ローカル共通。障害切り分けの起点です。',
      items: [
        '/health — Web / Gateway 生存確認',
        '/status — PostgreSQL connected · JWT 設定の有無',
        '左下「API 接続確認」から同内容を確認',
        '各マイクロサービス: GET /health → ok + service 名',
      ],
    },
    {
      title: '2. デモログイン & テナント',
      body: 'PostgreSQL 接続時は org_id でデータ完全分離。フロントは Gateway のみを知ります。',
      items: [
        '/login → demo@sakura-dental.jp / demo1234',
        'JWT Cookie (dv_token) → GraphQL Authorization',
        'Gateway が JWT を各 SaaS サービスへヘッダ転送',
      ],
    },
    {
      title: '3. SaaS ハブ & モジュール',
      body: '業務モジュールはプラガブル。無効モジュールは UI / API 双方でガード。',
      items: [
        '/saas — 6 モジュールの ON/OFF と各機能画面へ',
        '/saas/dx · /crm · /attendance · /contracts · /chat · /rag',
        'GraphQL: saasModules · setSaasModuleEnabled',
      ],
    },
    {
      title: '4. Docker ローカル（推奨）',
      body: 'PostgreSQL + MinIO + Gateway + 6 マイクロサービス + Web を一括起動。',
      items: [
        'cp .env.example .env → OPENAI_API_KEY（AI Board / Chat / RAG）',
        'npm run docker:up',
        'Web http://localhost:3001 · Gateway http://localhost:18080/graphql',
        'Gateway env: SAAS_DX_URL … SAAS_RAG_URL（compose 内 DNS）',
        '停止: npm run docker:down',
      ],
    },
    {
      title: '5. npm ローカル開発',
      body: 'Gateway と 6 サービスを concurrently で起動。DB 未設定時はメモリストア（学習のみ）。',
      items: [
        'npm run install:all → cd backend; go mod tidy',
        'npm run dev — gw + dx + crm + att + ctr + chat + rag + web',
        'npm run dev:monolith — Gateway のみ（SaaS は DB 直アクセス）',
        'マイクロサービス未起動時は Gateway が自動で in-process にフォールバック',
        'npm run codegen（schema 変更後）',
      ],
    },
    {
      title: '6. 学習コンテンツ（Gateway 内）',
      body: '動画・パス・テストは Gateway モノリス領域。SaaS とはプロセス分離。',
      items: [
        '動画ライブラリ — 分野・難易度・キーワード検索',
        '学習パス — カリキュラム順 · 修了証',
        '理解度テスト · マイ学習（進捗・ブックマーク）',
      ],
    },
    {
      title: '7. AI Board',
      body: '建設 PM KPI 集約 + OpenAI 経営インサイト（Gateway 内）。',
      items: [
        '/board — 期間 KPI → AI 経営インサイト生成',
        'OPENAI_API_KEY 未設定時はルールベース表示',
      ],
    },
    {
      title: '8. Railway 本番',
      body: '統合デプロイ（Gateway + Web）または将来マイクロサービス個別デプロイ。詳細 docs/RAILWAY.md。',
      items: [
        'GitHub + /railway.toml · DATABASE_URL Reference · JWT_SECRET',
        'OPENAI_API_KEY · CORS_ORIGINS · APP_PUBLIC_URL',
        'API_URL は統合デプロイでは不要',
        'Redeploy → /status OK → /login',
      ],
    },
    {
      title: '9. 開発者向け GraphQL',
      body: 'Schema-first · Codegen · Apollo Client + urql Subscription。',
      items: [
        'graphql/schema.graphql → go generate · npm run codegen',
        'GraphiQL http://localhost:8080/graphiql',
        '本番 /graphql · Subscription は WS',
      ],
    },
  ] satisfies readonly GuideStep[],
} as const

type SavedState = {
  x: number
  y: number
  expanded: boolean
}

function defaultPosition() {
  if (typeof window === 'undefined') return { x: 24, y: 24 }
  const x = Math.max(16, window.innerWidth - PANEL_WIDTH - 24)
  const y = Math.max(72, window.innerHeight - 480)
  return { x, y }
}

function clampPosition(x: number, y: number, width: number, height: number) {
  const maxX = Math.max(8, window.innerWidth - width - 8)
  const maxY = Math.max(8, window.innerHeight - height - 8)
  return {
    x: Math.min(Math.max(8, x), maxX),
    y: Math.min(Math.max(8, y), maxY),
  }
}

function FeaturedSection({ block }: { block: FeaturedBlock }) {
  const variant = block.variant ?? 'default'
  return (
    <section
      className={`usage-guide-featured usage-guide-featured--${variant}`}
      aria-label={block.title}
    >
      <div className="usage-guide-featured-head">
        <span className="usage-guide-featured-badge">{block.badge}</span>
        <strong>{block.title}</strong>
      </div>
      <p>{block.body}</p>
      {block.items?.length ? (
        <ul className="usage-guide-items">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export function UsageGuidePanel() {
  const panelRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const [ready, setReady] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [pos, setPos] = useState({ x: 24, y: 24 })
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedState
        setPos({ x: parsed.x, y: parsed.y })
        setExpanded(parsed.expanded)
      } catch {
        setPos(defaultPosition())
      }
    } else {
      setPos(defaultPosition())
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const payload: SavedState = { ...pos, expanded }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [pos, expanded, ready])

  useEffect(() => {
    if (!ready) return
    const onResize = () => {
      const el = panelRef.current
      if (!el) return
      setPos((current) => clampPosition(current.x, current.y, el.offsetWidth, el.offsetHeight))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [ready])

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if ((e.target as HTMLElement).closest('.usage-guide-toggle')) return
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: pos.x,
        originY: pos.y,
      }
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [pos.x, pos.y],
  )

  const onHeaderPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const el = panelRef.current
    const width = el?.offsetWidth ?? PANEL_WIDTH
    const height = el?.offsetHeight ?? 120
    setPos(
      clampPosition(
        drag.originX + (e.clientX - drag.startX),
        drag.originY + (e.clientY - drag.startY),
        width,
        height,
      ),
    )
  }, [])

  const onHeaderPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    dragRef.current = null
    setDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  if (!ready) return null

  return (
    <div
      ref={panelRef}
      className={`usage-guide-panel${expanded ? ' is-expanded' : ' is-collapsed'}${dragging ? ' is-dragging' : ''}`}
      style={{ left: pos.x, top: pos.y, width: PANEL_WIDTH }}
      role="dialog"
      aria-label={L.title}
      aria-modal="false"
    >
      <header
        className="usage-guide-header"
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        onPointerCancel={onHeaderPointerUp}
      >
        <div className="usage-guide-header-text">
          <span className="usage-guide-drag-icon" aria-hidden>
            ☰
          </span>
          <div className="usage-guide-header-titles">
            <strong>{L.title}</strong>
            <span className="usage-guide-header-sub">{L.subtitle}</span>
          </div>
          <span className="usage-guide-drag-hint">{L.dragHint}</span>
        </div>
        <button
          type="button"
          className="usage-guide-toggle"
          aria-label={expanded ? L.collapse : L.expand}
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? '▼' : '▲'}
        </button>
      </header>

      {expanded ? (
        <div className="usage-guide-body">
          <div className="usage-guide-hero">
            <p className="usage-guide-hero-kicker">Portfolio-ready demo</p>
            <h2 className="usage-guide-hero-title">{L.heroTitle}</h2>
            <p className="usage-guide-hero-lead">{L.heroLead}</p>
            <div className="usage-guide-stack" aria-label={L.stackLabel}>
              {techStack.map((tag) => (
                <span key={tag} className="usage-guide-stack-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <FeaturedSection block={architectureFeatured} />

          <figure className="usage-guide-diagram" aria-label={L.diagramLabel}>
            <figcaption>{L.diagramLabel}</figcaption>
            <pre>{archDiagram}</pre>
          </figure>

          <FeaturedSection block={saasFeatured} />

          <p className="usage-guide-scroll-hint">{L.scrollHint}</p>
          <ol className="usage-guide-steps">
            {L.steps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
                {step.items?.length ? (
                  <ul className="usage-guide-items">
                    {step.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="usage-guide-footer">{L.footer}</p>
        </div>
      ) : null}
    </div>
  )
}
