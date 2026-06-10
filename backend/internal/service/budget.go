package service

import (
	"context"
	"fmt"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func (s *Service) ListProjectBudgets(ctx context.Context, projectID string, budgetType models.BudgetType) ([]models.ProjectBudget, error) {
	if _, err := s.requireModule(ctx, models.ModuleBudgetMgmt); err != nil {
		return nil, err
	}
	if s.memoryMode() {
		return s.memoryProjectBudgets(projectID), nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListProjectBudgets(ctx, p.OrgID, projectID, budgetType)
}

func (s *Service) ListBudgetLineItems(ctx context.Context, budgetID string) ([]models.BudgetLineItem, error) {
	if _, err := s.requireModule(ctx, models.ModuleBudgetMgmt); err != nil {
		return nil, err
	}
	if s.memoryMode() {
		return s.memoryBudgetLineItems(budgetID), nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListBudgetLineItems(ctx, p.OrgID, budgetID)
}

func (s *Service) ListCostEntries(ctx context.Context, projectID, lineItemID string) ([]models.CostEntry, error) {
	if _, err := s.requireModule(ctx, models.ModuleBudgetMgmt); err != nil {
		return nil, err
	}
	if s.memoryMode() {
		return s.memoryCostEntries(projectID), nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListCostEntries(ctx, p.OrgID, projectID, lineItemID)
}

func (s *Service) BudgetDashboard(ctx context.Context, projectID string) (models.BudgetDashboard, error) {
	if _, err := s.requireModule(ctx, models.ModuleBudgetMgmt); err != nil {
		return models.BudgetDashboard{}, err
	}
	if s.memoryMode() {
		return s.memoryBudgetDashboard(projectID), nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.BudgetDashboard(ctx, p.OrgID, projectID)
}

func (s *Service) CreateProjectBudget(ctx context.Context, in models.ProjectBudgetInput) (models.ProjectBudget, error) {
	if _, err := s.requireModule(ctx, models.ModuleBudgetMgmt); err != nil {
		return models.ProjectBudget{}, err
	}
	if s.memoryMode() {
		return models.ProjectBudget{
			ID: "mem-bud", OrgID: demoOrgID, ProjectID: in.ProjectID,
			ProjectName: "渋谷オフィスビル新築工事", Name: in.Name,
			BudgetType: in.BudgetType, Status: models.BudgetStatusDraft,
			ContractAmount: in.ContractAmount, CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateProjectBudget(ctx, p.OrgID, in)
}

func (s *Service) CreateBudgetLineItem(ctx context.Context, in models.BudgetLineItemInput) (models.BudgetLineItem, error) {
	if _, err := s.requireModule(ctx, models.ModuleBudgetMgmt); err != nil {
		return models.BudgetLineItem{}, err
	}
	if s.memoryMode() {
		item := models.BudgetLineItem{
			ID: "mem-bli", OrgID: demoOrgID, BudgetID: in.BudgetID,
			CategoryCode: in.CategoryCode, CategoryName: in.CategoryName,
			EstimateAmount: in.EstimateAmount, BudgetAmount: in.BudgetAmount,
			CreatedAt: time.Now(),
		}
		item.VarianceAmount = item.BudgetAmount
		item.VariancePct = 100
		return item, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateBudgetLineItem(ctx, p.OrgID, in)
}

func (s *Service) CreateCostEntry(ctx context.Context, in models.CostEntryInput) (models.CostEntry, error) {
	if _, err := s.requireModule(ctx, models.ModuleBudgetMgmt); err != nil {
		return models.CostEntry{}, err
	}
	if s.memoryMode() {
		return models.CostEntry{
			ID: "mem-cost", OrgID: demoOrgID, ProjectID: in.ProjectID,
			ProjectName: "渋谷オフィスビル新築工事", EntryType: in.EntryType,
			VendorName: in.VendorName, Description: in.Description,
			Amount: in.Amount, CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateCostEntry(ctx, p.OrgID, in)
}

func (s *Service) ApproveProjectBudget(ctx context.Context, id string) (models.ProjectBudget, error) {
	if _, err := s.requireModule(ctx, models.ModuleBudgetMgmt); err != nil {
		return models.ProjectBudget{}, err
	}
	if s.memoryMode() {
		now := time.Now()
		for _, b := range s.memoryProjectBudgets("") {
			if b.ID == id {
				b.Status = models.BudgetStatusApproved
				b.ApprovedAt = &now
				return b, nil
			}
		}
		return models.ProjectBudget{}, fmt.Errorf("budget not found")
	}
	p, _ := tenant.PrincipalFrom(ctx)
	b, err := s.PG.ApproveProjectBudget(ctx, p.OrgID, id)
	if err != nil {
		return models.ProjectBudget{}, err
	}
	return b, nil
}

func (s *Service) ListProjectBudgetSummaries(ctx context.Context) ([]models.ProjectBudgetSummary, error) {
	if _, err := s.requireModule(ctx, models.ModuleBudgetMgmt); err != nil {
		return nil, err
	}
	if s.memoryMode() {
		return s.memoryProjectBudgetSummaries(), nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListProjectBudgetSummaries(ctx, p.OrgID)
}

func (s *Service) CreateCostFromBilling(ctx context.Context, billingRecordID, projectID string) (models.CostEntry, error) {
	if _, err := s.requireModule(ctx, models.ModuleBudgetMgmt); err != nil {
		return models.CostEntry{}, err
	}
	if s.memoryMode() {
		return models.CostEntry{
			ID: "mem-cost-bill", ProjectID: projectID, ProjectName: "渋谷オフィスビル新築工事",
			Description: "請求連携原価", Amount: 485_000_000, EntryType: models.CostEntryOther,
			VendorName: "請求連携", CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateCostFromBilling(ctx, p.OrgID, billingRecordID, projectID)
}

func (s *Service) memoryProjectBudgetSummaries() []models.ProjectBudgetSummary {
	return []models.ProjectBudgetSummary{
		{
			ProjectID: "prj-demo-1", ProjectName: "渋谷オフィスビル新築工事",
			Status: models.ProjectInProgress, ContractAmount: 4_850_000_000,
			TotalBudget: 4_680_000_000, TotalActual: 2_145_000_000,
			BillingTotal: 980_000_000, VariancePct: 54.2,
		},
	}
}

func (s *Service) memoryProjectBudgets(projectID string) []models.ProjectBudget {
	return []models.ProjectBudget{
		{
			ID: "mem-bud-1", OrgID: demoOrgID, ProjectID: "prj-demo-1",
			ProjectName: "渋谷オフィスビル新築工事", Name: "実行予算 v3",
			BudgetType: models.BudgetTypeExecutionBudget, Status: models.BudgetStatusApproved,
			VersionNo: 3, ContractAmount: 4_850_000_000,
			TotalEstimate: 4_720_000_000, TotalBudget: 4_680_000_000,
			TotalCommitted: 3_920_000_000, TotalActual: 2_145_000_000,
			CreatedAt: time.Now(),
		},
		{
			ID: "mem-bud-2", OrgID: demoOrgID, ProjectID: "prj-demo-1",
			ProjectName: "渋谷オフィスビル新築工事", Name: "当初見積 v1",
			BudgetType: models.BudgetTypeEstimate, Status: models.BudgetStatusLocked,
			VersionNo: 1, ContractAmount: 5_200_000_000,
			TotalEstimate: 4_950_000_000, TotalBudget: 4_950_000_000,
			CreatedAt: time.Now(),
		},
		{
			ID: "mem-bud-3", OrgID: demoOrgID, ProjectID: "prj-demo-1",
			ProjectName: "渋谷オフィスビル新築工事", Name: "実行予算 v4（改定案）",
			BudgetType: models.BudgetTypeExecutionBudget, Status: models.BudgetStatusDraft,
			VersionNo: 4, ContractAmount: 4_850_000_000,
			TotalEstimate: 4_700_000_000, TotalBudget: 4_650_000_000,
			CreatedAt: time.Now(),
		},
	}
}

func (s *Service) memoryBudgetLineItems(budgetID string) []models.BudgetLineItem {
	items := []models.BudgetLineItem{
		{ID: "bli-1", CategoryCode: "DIRECT", CategoryName: "直接工事費", WbsCode: "WBS-01",
			Description: "躯体工事（RC造）", EstimateAmount: 1_850_000_000, BudgetAmount: 1_820_000_000,
			CommittedAmount: 1_650_000_000, ActualAmount: 980_000_000, SortOrder: 1},
		{ID: "bli-2", CategoryCode: "SUBCONTRACT", CategoryName: "外注費", WbsCode: "WBS-02",
			Description: "電気・空調設備", EstimateAmount: 980_000_000, BudgetAmount: 960_000_000,
			CommittedAmount: 890_000_000, ActualAmount: 520_000_000, SortOrder: 2},
		{ID: "bli-3", CategoryCode: "MATERIAL", CategoryName: "材料費", WbsCode: "WBS-03",
			Description: "鉄骨・コンクリート", EstimateAmount: 720_000_000, BudgetAmount: 710_000_000,
			CommittedAmount: 680_000_000, ActualAmount: 410_000_000, SortOrder: 3},
		{ID: "bli-4", CategoryCode: "LABOR", CategoryName: "労務費", WbsCode: "WBS-04",
			Description: "現場監督・作業員", EstimateAmount: 380_000_000, BudgetAmount: 370_000_000,
			CommittedAmount: 350_000_000, ActualAmount: 185_000_000, SortOrder: 4},
		{ID: "bli-5", CategoryCode: "TEMPORARY", CategoryName: "仮設費", WbsCode: "WBS-05",
			Description: "仮設足場・仮設電気", EstimateAmount: 120_000_000, BudgetAmount: 115_000_000,
			CommittedAmount: 110_000_000, ActualAmount: 35_000_000, SortOrder: 5},
		{ID: "bli-6", CategoryCode: "OVERHEAD", CategoryName: "経費", WbsCode: "WBS-06",
			Description: "現場経費・消耗品", EstimateAmount: 95_000_000, BudgetAmount: 90_000_000,
			CommittedAmount: 75_000_000, ActualAmount: 12_000_000, SortOrder: 6},
		{ID: "bli-7", CategoryCode: "GENERAL", CategoryName: "一般管理費", WbsCode: "WBS-07",
			Description: "本社配賦・間接費", EstimateAmount: 575_000_000, BudgetAmount: 615_000_000,
			CommittedAmount: 165_000_000, ActualAmount: 3_000_000, SortOrder: 7},
	}
	for i := range items {
		items[i].BudgetID = budgetID
		items[i].OrgID = demoOrgID
		items[i].VarianceAmount = items[i].BudgetAmount - items[i].ActualAmount
		if items[i].BudgetAmount > 0 {
			items[i].VariancePct = items[i].VarianceAmount / items[i].BudgetAmount * 100
		}
		items[i].CreatedAt = time.Now()
	}
	return items
}

func (s *Service) memoryCostEntries(projectID string) []models.CostEntry {
	now := time.Now()
	return []models.CostEntry{
		{ID: "cost-1", ProjectID: projectID, ProjectName: "渋谷オフィスビル新築工事",
			LineItemID: "bli-1", LineItemName: "直接工事費 躯体工事", EntryType: models.CostEntrySubcontract,
			VendorName: "株式会社〇〇建設", Description: "3階スラブコンクリート打設",
			Amount: 28_500_000, EntryDate: now.AddDate(0, 0, -3), InvoiceNo: "INV-2026-0412", RecordedBy: "山田 太郎"},
		{ID: "cost-2", ProjectID: projectID, ProjectName: "渋谷オフィスビル新築工事",
			LineItemID: "bli-3", LineItemName: "材料費 鉄骨", EntryType: models.CostEntryMaterial,
			VendorName: "日本製鉄株式会社", Description: "H形鋼 4階分納入",
			Amount: 42_800_000, EntryDate: now.AddDate(0, 0, -7), InvoiceNo: "INV-2026-0398", RecordedBy: "佐藤 花子"},
		{ID: "cost-3", ProjectID: projectID, ProjectName: "渋谷オフィスビル新築工事",
			LineItemID: "bli-2", LineItemName: "外注費 電気設備", EntryType: models.CostEntrySubcontract,
			VendorName: "△△電気工業", Description: "配管工事 第2工区",
			Amount: 15_200_000, EntryDate: now.AddDate(0, 0, -10), InvoiceNo: "INV-2026-0371", RecordedBy: "山田 太郎"},
	}
}

func (s *Service) memoryBudgetDashboard(projectID string) models.BudgetDashboard {
	lineItems := s.memoryBudgetLineItems("mem-bud-1")
	var totalEst, totalBud, totalCom, totalAct float64
	catMap := map[string]*models.BudgetCategorySummary{}
	for _, item := range lineItems {
		totalEst += item.EstimateAmount
		totalBud += item.BudgetAmount
		totalCom += item.CommittedAmount
		totalAct += item.ActualAmount
		cs, ok := catMap[item.CategoryCode]
		if !ok {
			cs = &models.BudgetCategorySummary{CategoryCode: item.CategoryCode, CategoryName: item.CategoryName}
			catMap[item.CategoryCode] = cs
		}
		cs.BudgetAmount += item.BudgetAmount
		cs.ActualAmount += item.ActualAmount
	}
	var cats []models.BudgetCategorySummary
	for _, cs := range catMap {
		cs.VarianceAmount = cs.BudgetAmount - cs.ActualAmount
		cats = append(cats, *cs)
	}
	variance := totalBud - totalAct
	variancePct := 0.0
	completionPct := 0.0
	if totalBud > 0 {
		variancePct = variance / totalBud * 100
		completionPct = totalAct / totalBud * 100
	}
	contract := 4_850_000_000.0
	grossMargin := 0.0
	if contract > 0 {
		grossMargin = (contract - totalBud) / contract * 100
	}
	return models.BudgetDashboard{
		ProjectID: projectID, ProjectName: "渋谷オフィスビル新築工事",
		ContractAmount: contract, TotalEstimate: totalEst, TotalBudget: totalBud,
		TotalCommitted: totalCom, TotalActual: totalAct,
		TotalForecast: totalAct + (totalBud - totalCom),
		VarianceAmount: variance, VariancePct: variancePct, CompletionPct: completionPct,
		EstimateBudgetTotal: 4_950_000_000, GrossMarginPct: grossMargin,
		InquiryProfitTotal: 170_000_000,
		BillingTotal: 980_000_000, BillingBalance: 980_000_000 - totalAct,
		MonthlyCosts: []models.MonthlyCostMetric{
			{Month: time.Now().AddDate(0, -5, 0).Format("2006-01"), Amount: 320_000_000},
			{Month: time.Now().AddDate(0, -4, 0).Format("2006-01"), Amount: 410_000_000},
			{Month: time.Now().AddDate(0, -3, 0).Format("2006-01"), Amount: 385_000_000},
			{Month: time.Now().AddDate(0, -2, 0).Format("2006-01"), Amount: 450_000_000},
			{Month: time.Now().AddDate(0, -1, 0).Format("2006-01"), Amount: 520_000_000},
			{Month: time.Now().Format("2006-01"), Amount: 86_500_000},
		},
		Reconciliation: []models.BillingReconciliationItem{
			{BillingRecordID: "rec-bill-1", Title: "第1回出来高請求", BillingAmount: 485_000_000,
				CostAmount: 320_000_000, VarianceAmount: 165_000_000, Status: "UNDER", BillingDate: "2026-04-01"},
			{BillingRecordID: "rec-bill-2", Title: "第2回出来高請求", BillingAmount: 495_000_000,
				CostAmount: 86_500_000, VarianceAmount: 408_500_000, Status: "UNDER", BillingDate: "2026-05-01"},
		},
		LineItems: lineItems, RecentCosts: s.memoryCostEntries(projectID),
		CategorySummary: cats,
		GeneratedAt: time.Now(),
	}
}
