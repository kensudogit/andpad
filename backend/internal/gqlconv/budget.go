package gqlconv

import (
	"time"

	"github.com/pluszero/dental-video-api/internal/graph/generated"
	"github.com/pluszero/dental-video-api/internal/models"
)

func ToProjectBudget(b models.ProjectBudget) *generated.ProjectBudget {
	var approved *string
	if b.ApprovedAt != nil {
		s := fmtTime(*b.ApprovedAt)
		approved = &s
	}
	return &generated.ProjectBudget{
		ID: b.ID, ProjectID: b.ProjectID, ProjectName: b.ProjectName, Name: b.Name,
		BudgetType: generated.BudgetType(b.BudgetType), Status: generated.BudgetStatus(b.Status),
		VersionNo: b.VersionNo, ContractAmount: b.ContractAmount,
		TotalEstimate: b.TotalEstimate, TotalBudget: b.TotalBudget,
		TotalCommitted: b.TotalCommitted, TotalActual: b.TotalActual,
		Notes: b.Notes, ApprovedAt: approved, CreatedAt: fmtTime(b.CreatedAt),
	}
}

func ToProjectBudgets(list []models.ProjectBudget) []*generated.ProjectBudget {
	out := make([]*generated.ProjectBudget, len(list))
	for i, b := range list {
		out[i] = ToProjectBudget(b)
	}
	return out
}

func ToBudgetLineItem(item models.BudgetLineItem) *generated.BudgetLineItem {
	return &generated.BudgetLineItem{
		ID: item.ID, BudgetID: item.BudgetID, CategoryCode: item.CategoryCode,
		CategoryName: item.CategoryName, WbsCode: item.WbsCode, Description: item.Description,
		EstimateAmount: item.EstimateAmount, BudgetAmount: item.BudgetAmount,
		CommittedAmount: item.CommittedAmount, ActualAmount: item.ActualAmount,
		VarianceAmount: item.VarianceAmount, VariancePct: item.VariancePct,
		SortOrder: item.SortOrder, CreatedAt: fmtTime(item.CreatedAt),
	}
}

func ToBudgetLineItems(list []models.BudgetLineItem) []*generated.BudgetLineItem {
	out := make([]*generated.BudgetLineItem, len(list))
	for i, item := range list {
		out[i] = ToBudgetLineItem(item)
	}
	return out
}

func ToCostEntry(c models.CostEntry) *generated.CostEntry {
	return &generated.CostEntry{
		ID: c.ID, ProjectID: c.ProjectID, ProjectName: c.ProjectName,
		LineItemID: c.LineItemID, LineItemName: c.LineItemName,
		EntryType: generated.CostEntryType(c.EntryType), VendorName: c.VendorName,
		Description: c.Description, Amount: c.Amount, EntryDate: c.EntryDate.Format("2006-01-02"),
		InvoiceNo: c.InvoiceNo, RecordedBy: c.RecordedBy, CreatedAt: fmtTime(c.CreatedAt),
	}
}

func ToCostEntries(list []models.CostEntry) []*generated.CostEntry {
	out := make([]*generated.CostEntry, len(list))
	for i, c := range list {
		out[i] = ToCostEntry(c)
	}
	return out
}

func ToBudgetDashboard(d models.BudgetDashboard) *generated.BudgetDashboard {
	cats := make([]*generated.BudgetCategorySummary, len(d.CategorySummary))
	for i, c := range d.CategorySummary {
		cats[i] = &generated.BudgetCategorySummary{
			CategoryCode: c.CategoryCode, CategoryName: c.CategoryName,
			BudgetAmount: c.BudgetAmount, ActualAmount: c.ActualAmount,
			VarianceAmount: c.VarianceAmount,
		}
	}
	return &generated.BudgetDashboard{
		ProjectID: d.ProjectID, ProjectName: d.ProjectName,
		ContractAmount: d.ContractAmount, TotalEstimate: d.TotalEstimate,
		TotalBudget: d.TotalBudget, TotalCommitted: d.TotalCommitted,
		TotalActual: d.TotalActual, TotalForecast: d.TotalForecast,
		VarianceAmount: d.VarianceAmount, VariancePct: d.VariancePct,
		CompletionPct: d.CompletionPct,
		EstimateBudgetTotal: d.EstimateBudgetTotal, GrossMarginPct: d.GrossMarginPct,
		InquiryProfitTotal: d.InquiryProfitTotal,
		BillingTotal: d.BillingTotal, BillingBalance: d.BillingBalance,
		MonthlyCosts: ToMonthlyCostMetrics(d.MonthlyCosts),
		Reconciliation: ToBillingReconciliationItems(d.Reconciliation),
		LineItems: ToBudgetLineItems(d.LineItems),
		RecentCosts: ToCostEntries(d.RecentCosts),
		CategorySummary: cats,
		GeneratedAt: fmtTime(d.GeneratedAt),
	}
}

func ProjectBudgetFromInput(in generated.CreateProjectBudgetInput) models.ProjectBudgetInput {
	out := models.ProjectBudgetInput{
		ProjectID: in.ProjectID, Name: in.Name, Notes: derefStr(in.Notes),
	}
	if in.BudgetType != nil {
		out.BudgetType = models.BudgetType(*in.BudgetType)
	}
	if in.Status != nil {
		out.Status = models.BudgetStatus(*in.Status)
	}
	if in.VersionNo != nil {
		out.VersionNo = *in.VersionNo
	}
	if in.ContractAmount != nil {
		out.ContractAmount = *in.ContractAmount
	}
	return out
}

func BudgetLineItemFromInput(in generated.CreateBudgetLineItemInput) models.BudgetLineItemInput {
	return models.BudgetLineItemInput{
		BudgetID: in.BudgetID, CategoryCode: in.CategoryCode, CategoryName: in.CategoryName,
		WbsCode: derefStr(in.WbsCode), Description: derefStr(in.Description),
		EstimateAmount: derefFloat(in.EstimateAmount), BudgetAmount: derefFloat(in.BudgetAmount),
		CommittedAmount: derefFloat(in.CommittedAmount), SortOrder: derefInt(in.SortOrder),
	}
}

func CostEntryFromInput(in generated.CreateCostEntryInput) models.CostEntryInput {
	out := models.CostEntryInput{
		ProjectID: in.ProjectID, Description: in.Description, Amount: in.Amount,
		VendorName: derefStr(in.VendorName), InvoiceNo: derefStr(in.InvoiceNo),
		RecordedBy: derefStr(in.RecordedBy),
	}
	if in.LineItemID != nil {
		out.LineItemID = *in.LineItemID
	}
	if in.EntryType != nil {
		out.EntryType = models.CostEntryType(*in.EntryType)
	}
	if in.EntryDate != nil && *in.EntryDate != "" {
		if t, err := time.Parse("2006-01-02", *in.EntryDate); err == nil {
			out.EntryDate = &t
		}
	}
	return out
}

func ToMonthlyCostMetrics(list []models.MonthlyCostMetric) []*generated.MonthlyCostMetric {
	out := make([]*generated.MonthlyCostMetric, len(list))
	for i, m := range list {
		out[i] = &generated.MonthlyCostMetric{Month: m.Month, Amount: m.Amount}
	}
	return out
}

func ToBillingReconciliationItem(item models.BillingReconciliationItem) *generated.BillingReconciliationItem {
	var date *string
	if item.BillingDate != "" {
		date = &item.BillingDate
	}
	return &generated.BillingReconciliationItem{
		BillingRecordID: item.BillingRecordID, Title: item.Title,
		BillingAmount: item.BillingAmount, CostAmount: item.CostAmount,
		VarianceAmount: item.VarianceAmount, Status: item.Status, BillingDate: date,
	}
}

func ToBillingReconciliationItems(list []models.BillingReconciliationItem) []*generated.BillingReconciliationItem {
	out := make([]*generated.BillingReconciliationItem, len(list))
	for i, item := range list {
		out[i] = ToBillingReconciliationItem(item)
	}
	return out
}

func ToProjectBudgetSummary(s models.ProjectBudgetSummary) *generated.ProjectBudgetSummary {
	return &generated.ProjectBudgetSummary{
		ProjectID: s.ProjectID, ProjectName: s.ProjectName,
		Status: generated.ConstructionProjectStatus(s.Status),
		ContractAmount: s.ContractAmount, TotalBudget: s.TotalBudget,
		TotalActual: s.TotalActual, BillingTotal: s.BillingTotal,
		VariancePct: s.VariancePct,
	}
}

func ToProjectBudgetSummaries(list []models.ProjectBudgetSummary) []*generated.ProjectBudgetSummary {
	out := make([]*generated.ProjectBudgetSummary, len(list))
	for i, s := range list {
		out[i] = ToProjectBudgetSummary(s)
	}
	return out
}

func derefFloat(v *float64) float64 {
	if v == nil {
		return 0
	}
	return *v
}

func derefInt(v *int) int {
	if v == nil {
		return 0
	}
	return *v
}
