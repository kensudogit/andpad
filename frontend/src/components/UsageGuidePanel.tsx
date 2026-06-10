'use client'

/**
 * 画面右下のドラッグ可能な利用手順パネル（localStorage で位置・開閉を保存）。
 * アーキテクチャ概要・運用手順をデモ／ポートフォリオ向けに表示する。
 */
import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'andpad-usage-guide-v1'
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
  title: '統合デプロイ（Railway 本番）',
  body:
    'Go API と Next.js を同一コンテナで起動。ブラウザは同一オリジンの /graphql · /auth のみ使用し、Next.js が内部 127.0.0.1:8081 へプロキシします。',
  variant: 'architecture',
  items: [
    'Next.js — Web UI · /health（Railway ヘルスチェック）',
    'Go API — GraphQL · 認証 · 組織 · 案件 · 19 モジュール',
    'PostgreSQL — 起動時マイグレーション + org_demo シード',
    'テナント分離 — org_id + JWT（sessionStorage）',
    'ローカル上級者向け: docker compose / 6 マイクロサービス構成も可',
  ],
}

const saasFeatured: FeaturedBlock = {
  badge: 'SaaS',
  title: '施行管理モジュール 19 + 共通 SaaS',
  body: '/saas で施工管理・予算原価・電子納品・BIM · Analytics など 19 機能と AI チャットボットを ON/OFF。案件単位で記録を一元管理します。',
  variant: 'saas',
  items: [
    '施工管理 · 図面 · 黒板 · 検査 · ボード · 引合粗利 · 受発注',
    '請求 · 歩掛 · 入退場 · 電子納品 · BM · 予算原価 · Analytics · BIM · API 連携',
    'デモ: demo@sakura-dental.jp / demo1234 → /projects → /saas',
    '組織設定 /settings — プラン · 利用量 · Team ロール',
  ],
}

const techStack = [
  'GraphQL · gqlgen',
  'Go 1.25 · chi',
  'Next.js 15 · Apollo',
  'PostgreSQL',
  'JWT · org_id',
  'Docker · Railway',
] as const

const archDiagram = `Browser
    │ HTTPS (同一オリジン)
    ▼
Next.js :PORT          Railway /health
    │ /graphql /auth /api/*
    ▼
Go API :8081           内部のみ
    │
    ▼
PostgreSQL             マイグレーション自動適用`

const L = {
  title: '利用手順',
  subtitle: 'Architecture & Ops',
  dragHint: 'ドラッグで移動',
  expand: '開く',
  collapse: '閉じる',
  heroTitle: 'ANDPAD 建設プロジェクト管理',
  heroLead:
    '現場の効率化から経営改善まで一元管理。案件 × 19 モジュール × AI Board · Analytics。',
  stackLabel: 'Tech stack',
  diagramLabel: 'Service topology（本番）',
  scrollHint: '↓ デプロイ・開発・機能別の手順は下へ',
  footer:
    '▼▲ で開閉 · ヘッダーをドラッグして移動 · 表示位置は自動保存されます。',
  steps: [
    {
      title: '1. 接続確認（最初に）',
      body: '本番・ローカル共通。障害切り分けの起点です。',
      items: [
        '/health — Web 生存確認（ok: true, service: andpad-web）',
        '/status — PostgreSQL connected · GraphQL 接続 OK',
        '統合デプロイでは API (127.0.0.1:8081) 表示は正常（ブラウザは /graphql を使用）',
        '左下「API 接続確認」から同内容を確認',
      ],
    },
    {
      title: '2. デモログイン & テナント',
      body: 'PostgreSQL 接続時は org_id でデータ完全分離。フロントは同一オリジン API プロキシのみを使用します。',
      items: [
        '/login → demo@sakura-dental.jp / demo1234',
        'JWT → sessionStorage → GraphQL Authorization ヘッダ',
        'デモ組織: サンプル建設株式会社（org_demo）',
      ],
    },
    {
      title: '3. 案件 & 施行管理モジュール',
      body: '業務モジュールはプラガブル。無効モジュールは UI / API 双方でガードされます。',
      items: [
        '/projects — 案件一覧 · デモ現場（渋谷オフィスビル新築工事）',
        '/saas — 19 モジュール ON/OFF · 各機能画面へ',
        '/saas/budget — 予算 · 原価 · 請求突合 · CSV 出力',
        '/saas/analytics — KPI · 予算原価タブ · 案件別サマリー',
        'GraphQL: saasModules · setSaasModuleEnabled',
      ],
    },
    {
      title: '4. npm ローカル開発（推奨）',
      body: 'Go API + Next.js のモノリス構成。DATABASE_URL 未設定時はメモリストア（学習のみ）。',
      items: [
        'npm run install:all → cd backend; go mod tidy',
        'npm run dev:monolith — API :8080 + Web :3000',
        '.env に DATABASE_URL を設定すると Postgres モード',
        'npm run codegen（graphql/schema.graphql 変更後）',
      ],
    },
    {
      title: '5. Docker ローカル（上級）',
      body: 'PostgreSQL + MinIO + Gateway + 6 マイクロサービス + Web を一括起動（レガシー構成）。',
      items: [
        'cp .env.example .env → OPENAI_API_KEY（AI Board / Chat）',
        'npm run docker:up',
        'Web http://localhost:3001 · Gateway http://localhost:18080/graphql',
        '停止: npm run docker:down',
      ],
    },
    {
      title: '6. AI Board & チャット',
      body: '建設 PM KPI 集約 + OpenAI 経営インサイト。予算 · 原価データも KPI に反映されます。',
      items: [
        '/board — 期間 KPI · 月次原価 · AI 経営インサイト生成',
        '/saas/chatbot — AI チャット（OPENAI_API_KEY 要）',
        'OPENAI_API_KEY 未設定時はルールベース / 案内メッセージ',
      ],
    },
    {
      title: '7. 学習コンテンツ（デモ）',
      body: '動画 · パス · テストはデモ用カタログ。建設 PM 本体とは独立した学習 UI です。',
      items: [
        '/videos — 動画ライブラリ',
        '/paths — 学習パス · 修了証',
        '/quizzes · /learning — 理解度テスト · マイ学習',
      ],
    },
    {
      title: '8. Railway 本番',
      body: 'GitHub push → Dockerfile.unified 自動ビルド。詳細は docs/RAILWAY.md。',
      items: [
        'GitHub + /railway.toml · Root Directory は空',
        'Variables: DATABASE_URL（Postgres Reference）· JWT_SECRET',
        'OPENAI_API_KEY（任意）— CORS / APP_PUBLIC_URL は自動設定可',
        'API_URL は設定しない（統合デプロイ）',
        'Redeploy → /health OK → /status で PostgreSQL: connected → /login',
      ],
    },
    {
      title: '9. 開発者向け GraphQL',
      body: 'Schema-first · Codegen · Apollo Client + urql Subscription。',
      items: [
        'graphql/schema.graphql → backend go generate · npm run codegen',
        'ローカル GraphiQL http://localhost:8080/graphiql',
        '本番 /graphql · Subscription は同一オリジン WS',
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
