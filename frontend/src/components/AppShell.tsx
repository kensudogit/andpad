'use client'

/**
 * アプリ共通レイアウト: サイドバー・トップバー・利用手順パネル。
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/BrandLogo'
import { ui } from '@/lib/ui'
import { UsageGuidePanel } from '@/components/UsageGuidePanel'

const nav = [
  { href: '/', label: ui.navHome, short: ui.navHome },
  { href: '/projects', label: ui.navProjects, short: ui.navProjects },
  { href: '/saas', label: ui.navSaas, short: 'SaaS' },
  { href: '/saas/analytics', label: ui.navAnalytics, short: 'Analytics' },
  { href: '/board', label: ui.navBoard, short: ui.navBoard },
  { href: '/settings', label: ui.navSettings, short: ui.navSettings },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)

  // ページ遷移時にモバイルメニューを閉じる
  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <div className={`app-shell${navOpen ? ' nav-open' : ''}`}>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="close menu"
        onClick={() => setNavOpen(false)}
      />
      <aside className="sidebar">
        <div className="brand">
          <BrandLogo size={44} animated />
          <div>
            <div className="brand-title">{ui.appTitle}</div>
            <div className="brand-sub">{ui.appSubtitle}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => {
            const active =
              // ホームのみ完全一致、他はプレフィックス一致
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'nav-link active' : 'nav-link'}
              >
                <span className="nav-full">{item.label}</span>
                <span className="nav-short">{item.short}</span>
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-foot">
          <Link href="/status" className="status-link">
            {ui.apiStatus}
          </Link>
        </div>
      </aside>
      <div className="main-col">
        <header className="topbar">
          <button
            type="button"
            className="menu-btn"
            aria-label="menu"
            onClick={() => setNavOpen((o) => !o)}
          >
            &#9776;
          </button>
          <span className="topbar-title">{ui.topbar}</span>
        </header>
        <main className="main-content">{children}</main>
      </div>
      <UsageGuidePanel />
    </div>
  )
}
