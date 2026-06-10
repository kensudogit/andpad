/** ダッシュボード（案件概要・モジュール導線） */
import Link from 'next/link'
import { constructionModules } from '@/lib/construction-modules'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <div className="page-head">
        <h1>{ui.dashboardTitle}</h1>
        <p>{ui.dashboardDesc}</p>
      </div>

      <section className="stat-grid">
        <Link href="/projects" className="stat-card stat-card--cyan">
          <span className="stat-label">{ui.navProjects}</span>
          <span className="stat-value">{ui.projectList}</span>
        </Link>
        <Link href="/saas" className="stat-card stat-card--violet">
          <span className="stat-label">{ui.navSaas}</span>
          <span className="stat-value">19 {ui.saasModulesTitle}</span>
        </Link>
        <Link href="/board" className="stat-card stat-card--emerald">
          <span className="stat-label">{ui.navBoard}</span>
          <span className="stat-value">KPI + AI</span>
        </Link>
        <Link href="/settings" className="stat-card stat-card--amber">
          <span className="stat-label">{ui.navSettings}</span>
          <span className="stat-value">{ui.navSettings}</span>
        </Link>
      </section>

      <section className="saas-panel" style={{ marginTop: '1.5rem' }}>
        <h2>{ui.saasHubTitle}</h2>
        <p className="muted">{ui.saasHubDesc}</p>
        <div className="saas-grid" style={{ marginTop: '1rem' }}>
          {constructionModules.slice(0, 6).map((item) => (
            <Link key={item.href} href={item.href} className={`saas-card saas-card--${item.tone}`}>
              <div className="saas-card-head">
                <span className={`saas-card-icon saas-card-icon--${item.tone}`}>{item.icon}</span>
                <div className="saas-card-body">
                  <h3>{item.label}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: '1rem' }}>
          <Link href="/saas" className="btn">
            {ui.saasOpen} ›
          </Link>
        </p>
      </section>
    </>
  )
}
