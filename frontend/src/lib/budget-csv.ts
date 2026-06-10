type BudgetCsvLineItem = {
  wbsCode: string
  categoryName: string
  description: string
  estimateAmount: number
  budgetAmount: number
  committedAmount: number
  actualAmount: number
  varianceAmount: number
  variancePct: number
}

type BudgetCsvCost = {
  entryDate: string
  entryType: string
  vendorName: string
  description: string
  amount: number
  invoiceNo: string
}

function csvCell(v: string | number) {
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const bom = '\uFEFF'
  const body = rows.map((row) => row.map(csvCell).join(',')).join('\n')
  const blob = new Blob([bom + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportBudgetLineItemsCsv(projectName: string, items: BudgetCsvLineItem[]) {
  const rows: (string | number)[][] = [
    ['WBS', '費目', '内容', '見積', '実行予算', '発注確定', '実績原価', '予算差異', '差異率(%)'],
    ...items.map((item) => [
      item.wbsCode,
      item.categoryName,
      item.description,
      item.estimateAmount,
      item.budgetAmount,
      item.committedAmount,
      item.actualAmount,
      item.varianceAmount,
      item.variancePct.toFixed(1),
    ]),
  ]
  const safe = projectName.replace(/[^\w\u3000-\u9fff-]+/g, '_').slice(0, 40)
  downloadCsv(`${safe}_budget_${new Date().toISOString().slice(0, 10)}.csv`, rows)
}

export function exportCostEntriesCsv(projectName: string, costs: BudgetCsvCost[]) {
  const rows: (string | number)[][] = [
    ['計上日', '費目区分', '業者', '摘要', '金額', '請求書No'],
    ...costs.map((c) => [
      c.entryDate,
      c.entryType,
      c.vendorName,
      c.description,
      c.amount,
      c.invoiceNo,
    ]),
  ]
  const safe = projectName.replace(/[^\w\u3000-\u9fff-]+/g, '_').slice(0, 40)
  downloadCsv(`${safe}_costs_${new Date().toISOString().slice(0, 10)}.csv`, rows)
}
