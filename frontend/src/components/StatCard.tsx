/** ダッシュボード KPI 用の色付き統計カード */
type Accent = 'cyan' | 'violet' | 'emerald' | 'amber'

const accentClass: Record<Accent, string> = {
  cyan: 'stat-cyan',
  violet: 'stat-violet',
  emerald: 'stat-emerald',
  amber: 'stat-amber',
}

export function StatCard({
  label,
  value,
  sub,
  accent = 'cyan',
}: {
  label: string
  value: string
  sub?: string
  accent?: Accent
}) {
  return (
    <div className={`stat-card ${accentClass[accent]}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub ? <div className="stat-sub">{sub}</div> : null}
    </div>
  )
}
