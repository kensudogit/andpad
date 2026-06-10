'use client'

import Link from 'next/link'
import { useMutation, useQuery } from '@apollo/client/react'
import { useEffect, useState } from 'react'
import {
  ApproveProjectBudgetDocument,
  BudgetDashboardDocument,
  BudgetStatus,
  BudgetType,
  ConstructionProjectsDocument,
  CostEntriesDocument,
  CreateCostEntryDocument,
  CostEntryType,
  CreateCostFromBillingDocument,
  ProjectBudgetsDocument,
} from '@/lib/generated/graphql'
import { exportBudgetLineItemsCsv, exportCostEntriesCsv } from '@/lib/budget-csv'
import { graphQLErrorHint, isAuthRequiredGraphQLError } from '@/lib/graphql-errors'
import { ui } from '@/lib/ui'

function fmtYen(n: number) {
  if (Math.abs(n) >= 100_000_000) return `¥${(n / 100_000_000).toFixed(1)}億`
  if (Math.abs(n) >= 10_000) return `¥${(n / 10_000).toFixed(0)}万`
  return `¥${n.toLocaleString()}`
}

function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

const entryTypeLabels: Record<string, string> = {
  MATERIAL: ui.budgetCostMaterial,
  LABOR: ui.budgetCostLabor,
  SUBCONTRACT: ui.budgetCostSubcontract,
  EQUIPMENT: ui.budgetCostEquipment,
  OVERHEAD: ui.budgetCostOverhead,
  OTHER: ui.budgetCostOther,
}

const budgetStatusLabels: Record<string, string> = {
  DRAFT: ui.budgetStatusDraft,
  APPROVED: ui.budgetStatusApproved,
  LOCKED: ui.budgetStatusLocked,
}

const budgetTypeLabels: Record<string, string> = {
  ESTIMATE: ui.budgetTypeEstimate,
  EXECUTION_BUDGET: ui.budgetTypeExecution,
  FORECAST: ui.budgetForecast,
}

const reconStatusLabels: Record<string, string> = {
  MATCHED: ui.budgetReconMatched,
  UNDER: ui.budgetReconUnder,
  OVER: ui.budgetReconOver,
  UNMATCHED: ui.budgetReconUnmatched,
  NONE: '—',
}

export function BudgetModuleClient() {
  const [projectId, setProjectId] = useState('')
  const [vendor, setVendor] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [lineItemId, setLineItemId] = useState('')
  const [entryType, setEntryType] = useState<CostEntryType>(CostEntryType.Subcontract)

  const { data: projectsData } = useQuery(ConstructionProjectsDocument, { fetchPolicy: 'network-only' })
  const { data, loading, error, refetch } = useQuery(BudgetDashboardDocument, {
    variables: { projectId },
    skip: !projectId,
    fetchPolicy: 'network-only',
  })
  const { data: budgetsData, refetch: refetchBudgets } = useQuery(ProjectBudgetsDocument, {
    variables: { projectId },
    skip: !projectId,
    fetchPolicy: 'network-only',
  })
  const { data: costsData } = useQuery(CostEntriesDocument, {
    variables: { projectId },
    skip: !projectId,
    fetchPolicy: 'network-only',
  })
  const [createCost, { loading: busy }] = useMutation(CreateCostEntryDocument, {
    onCompleted: () => {
      setVendor('')
      setDescription('')
      setAmount('')
      refetch()
    },
  })
  const [approveBudget, { loading: approving }] = useMutation(ApproveProjectBudgetDocument, {
    onCompleted: () => {
      refetch()
      refetchBudgets()
    },
  })
  const [syncBilling, { loading: syncing }] = useMutation(CreateCostFromBillingDocument, {
    onCompleted: () => refetch(),
  })

  const projects = projectsData?.constructionProjects ?? []
  const dash = data?.budgetDashboard
  const budgets = budgetsData?.projectBudgets ?? []
  const allCosts = costsData?.costEntries ?? []

  useEffect(() => {
    if (!projectId && projects.length > 0) setProjectId(projects[0].id)
  }, [projectId, projects])

  if (loading && !dash) return <p className="muted">{ui.boardLoading}</p>

  if (error) {
    const msg = isAuthRequiredGraphQLError(error)
      ? ui.saasLoginHint
      : error.message || graphQLErrorHint(error.message) || ui.saasLoadFailed
    return <p className="alert">{msg}</p>
  }

  const estimateDiff = dash ? dash.totalBudget - dash.estimateBudgetTotal : 0

  return (
    <>
      <div className="page-head">
        <Link href="/saas" className="muted">
          {ui.saasBack}
        </Link>
        <h1>{ui.budgetTitle}</h1>
        <p className="muted">{ui.budgetDesc}</p>
      </div>

      <section className="saas-panel">
        <div className="saas-form" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <label>
            {ui.budgetSelectProject}:{' '}
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          {dash && (
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  exportBudgetLineItemsCsv(dash.projectName, dash.lineItems.map((item) => ({
                    wbsCode: item.wbsCode,
                    categoryName: item.categoryName,
                    description: item.description,
                    estimateAmount: item.estimateAmount,
                    budgetAmount: item.budgetAmount,
                    committedAmount: item.committedAmount,
                    actualAmount: item.actualAmount,
                    varianceAmount: item.varianceAmount,
                    variancePct: item.variancePct,
                  })))
                }
              >
                {ui.budgetExportLines}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  exportCostEntriesCsv(
                    dash.projectName,
                    allCosts.map((c) => ({
                      entryDate: c.entryDate,
                      entryType: entryTypeLabels[c.entryType] ?? c.entryType,
                      vendorName: c.vendorName,
                      description: c.description,
                      amount: c.amount,
                      invoiceNo: c.invoiceNo,
                    })),
                  )
                }
              >
                {ui.budgetExportCosts}
              </button>
            </>
          )}
        </div>
      </section>

      {dash && (
        <>
          <section className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">{ui.budgetContract}</span>
              <span className="stat-value">{fmtYen(dash.contractAmount)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetExecution}</span>
              <span className="stat-value">{fmtYen(dash.totalBudget)}</span>
              <span className="muted small">{ui.budgetEstimate}: {fmtYen(dash.totalEstimate)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetActual}</span>
              <span className="stat-value">{fmtYen(dash.totalActual)}</span>
              <span className="muted small">{ui.budgetCommitted}: {fmtYen(dash.totalCommitted)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetVariance}</span>
              <span className="stat-value" style={{ color: dash.varianceAmount >= 0 ? '#059669' : '#dc2626' }}>
                {fmtYen(dash.varianceAmount)}
              </span>
              <span className="muted small">{fmtPct(dash.variancePct)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetGrossMargin}</span>
              <span className="stat-value">{fmtPct(dash.grossMarginPct)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetEstimateTotal}</span>
              <span className="stat-value">{fmtYen(dash.estimateBudgetTotal)}</span>
              <span className="muted small">
                {ui.budgetCompareEstimate}: {fmtYen(estimateDiff)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetInquiryProfit}</span>
              <span className="stat-value">{fmtYen(dash.inquiryProfitTotal)}</span>
              <Link href="/saas/inquiry-profit" className="muted small">
                {ui.budgetInquiryLink}
              </Link>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetBillingTotal}</span>
              <span className="stat-value">{fmtYen(dash.billingTotal)}</span>
              <Link href="/saas/billing" className="muted small">
                {ui.budgetBillingLink}
              </Link>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetBillingBalance}</span>
              <span className="stat-value" style={{ color: dash.billingBalance >= 0 ? '#059669' : '#dc2626' }}>
                {fmtYen(dash.billingBalance)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{ui.budgetProgress}</span>
              <span className="stat-value">{dash.completionPct.toFixed(1)}%</span>
              <span className="muted small">{ui.budgetForecast}: {fmtYen(dash.totalForecast)}</span>
            </div>
          </section>

          {budgets.length > 0 && (
            <section className="saas-panel" style={{ marginTop: '1rem' }}>
              <h2>{ui.budgetVersions}</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {budgets.map((b) => (
                  <li
                    key={b.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0',
                      borderBottom: '1px solid var(--border, #e5e7eb)',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <strong>{b.name}</strong>
                      <div className="muted small">
                        {budgetTypeLabels[b.budgetType] ?? b.budgetType} · v{b.versionNo} ·{' '}
                        {budgetStatusLabels[b.status] ?? b.status} · {fmtYen(b.totalBudget)}
                      </div>
                    </div>
                    {b.status === BudgetStatus.Draft && b.budgetType === BudgetType.ExecutionBudget && (
                      <button
                        type="button"
                        className="btn"
                        disabled={approving}
                        onClick={() => approveBudget({ variables: { id: b.id } })}
                      >
                        {ui.budgetApprove}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dash.monthlyCosts.length > 0 && (
            <section className="saas-panel" style={{ marginTop: '1rem' }}>
              <h2>{ui.budgetMonthlyReport}</h2>
              <div className="bar-chart" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', minHeight: 160 }}>
                {dash.monthlyCosts.map((m) => {
                  const max = Math.max(1, ...dash.monthlyCosts.map((x) => x.amount))
                  const pct = (m.amount / max) * 100
                  return (
                    <div key={m.month} style={{ flex: 1, textAlign: 'center' }}>
                      <div
                        style={{
                          height: `${Math.max(pct, m.amount > 0 ? 4 : 0)}%`,
                          minHeight: m.amount > 0 ? 8 : 2,
                          maxHeight: 120,
                          background: 'linear-gradient(180deg, #7c3aed, #c4b5fd)',
                          borderRadius: 4,
                          margin: '0 auto',
                          width: '70%',
                        }}
                      />
                      <div className="muted small" style={{ marginTop: 4 }}>{m.month.slice(5)}月</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{fmtYen(m.amount)}</div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {dash.reconciliation.length > 0 && (
            <section className="saas-panel" style={{ marginTop: '1rem' }}>
              <h2>{ui.budgetReconciliation}</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>{ui.budgetItemDesc}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetBillingTotal}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetActual}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetVariance}</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>{ui.period}</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dash.reconciliation.map((r) => (
                      <tr key={r.billingRecordId}>
                        <td style={{ padding: '0.5rem' }}>{r.title}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(r.billingAmount)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(r.costAmount)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(r.varianceAmount)}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <span className="muted small">{reconStatusLabels[r.status] ?? r.status}</span>
                          {r.billingDate ? ` · ${r.billingDate}` : ''}
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          {(r.status === 'UNMATCHED' || r.status === 'UNDER') && (
                            <button
                              type="button"
                              className="btn btn-ghost"
                              disabled={syncing}
                              onClick={() =>
                                syncBilling({
                                  variables: { billingRecordId: r.billingRecordId, projectId },
                                })
                              }
                            >
                              {ui.budgetReconSync}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="saas-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <section className="saas-panel">
              <h2>{ui.budgetByCategory}</h2>
              {dash.categorySummary.length === 0 ? (
                <p className="muted">{ui.budgetNoData}</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {dash.categorySummary.map((cat) => {
                    const pct = cat.budgetAmount > 0 ? (cat.actualAmount / cat.budgetAmount) * 100 : 0
                    return (
                      <li key={cat.categoryCode} style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span>{cat.categoryName}</span>
                          <span className="muted">{fmtYen(cat.actualAmount)} / {fmtYen(cat.budgetAmount)}</span>
                        </div>
                        <div style={{ background: '#e5e7eb', borderRadius: 4, height: 8, marginTop: 4 }}>
                          <div
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: pct > 90 ? '#dc2626' : '#7c3aed',
                              height: '100%',
                              borderRadius: 4,
                            }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section className="saas-panel">
              <h2>{ui.budgetCostEntry}</h2>
              <div className="saas-form">
                <select value={lineItemId} onChange={(e) => setLineItemId(e.target.value)}>
                  <option value="">{ui.budgetLineItemOptional}</option>
                  {dash.lineItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.categoryName} — {item.description}
                    </option>
                  ))}
                </select>
                <select value={entryType} onChange={(e) => setEntryType(e.target.value as CostEntryType)}>
                  {Object.entries(entryTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder={ui.budgetVendor} />
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={ui.budgetCostDesc} />
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={ui.budgetAmount} />
                <button
                  type="button"
                  className="btn"
                  disabled={busy || !description.trim() || !amount || !projectId}
                  onClick={() =>
                    createCost({
                      variables: {
                        input: {
                          projectId,
                          lineItemId: lineItemId || undefined,
                          entryType,
                          vendorName: vendor,
                          description,
                          amount: parseFloat(amount),
                        },
                      },
                    })
                  }
                >
                  {ui.budgetRegisterCost}
                </button>
              </div>
            </section>
          </div>

          <section className="saas-panel" style={{ marginTop: '1rem' }}>
            <h2>{ui.budgetLineItems}</h2>
            {dash.lineItems.length === 0 ? (
              <p className="muted">{ui.budgetNoData}</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>WBS</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>{ui.budgetCategory}</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>{ui.budgetItemDesc}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetEstimate}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetExecution}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetCommitted}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetActual}</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>{ui.budgetVariance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dash.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td style={{ padding: '0.5rem' }} className="muted">{item.wbsCode}</td>
                        <td style={{ padding: '0.5rem' }}>{item.categoryName}</td>
                        <td style={{ padding: '0.5rem' }}>{item.description}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(item.estimateAmount)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(item.budgetAmount)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(item.committedAmount)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{fmtYen(item.actualAmount)}</td>
                        <td
                          style={{
                            padding: '0.5rem',
                            textAlign: 'right',
                            color: item.varianceAmount >= 0 ? '#059669' : '#dc2626',
                          }}
                        >
                          {fmtYen(item.varianceAmount)} ({fmtPct(item.variancePct)})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="saas-panel" style={{ marginTop: '1rem' }}>
            <h2>{ui.budgetRecentCosts}</h2>
            {dash.recentCosts.length === 0 ? (
              <p className="muted">{ui.budgetNoCosts}</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {dash.recentCosts.map((c) => (
                  <li
                    key={c.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--border, #e5e7eb)',
                    }}
                  >
                    <div>
                      <strong>{c.description}</strong>
                      <div className="muted small">
                        {entryTypeLabels[c.entryType] ?? c.entryType}
                        {c.vendorName ? ` · ${c.vendorName}` : ''}
                        {c.entryDate ? ` · ${c.entryDate}` : ''}
                        {c.invoiceNo ? ` · ${c.invoiceNo}` : ''}
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtYen(c.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  )
}
