package gqlconv

import (
	"github.com/pluszero/dental-video-api/internal/graph/generated"
	"github.com/pluszero/dental-video-api/internal/models"
)

func ToAndpadAnalyticsDashboard(d models.AndpadAnalyticsDashboard) *generated.AndpadAnalyticsDashboard {
	kpis := make([]*generated.AndpadAnalyticsKpi, len(d.Kpis))
	for i, k := range d.Kpis {
		kpis[i] = &generated.AndpadAnalyticsKpi{
			Label: k.Label, Value: k.Value, Unit: strPtr(k.Unit), TrendPct: k.TrendPct,
		}
	}
	statuses := make([]*generated.ProjectStatusCount, len(d.ProjectsByStatus))
	for i, s := range d.ProjectsByStatus {
		statuses[i] = &generated.ProjectStatusCount{
			Status: generated.ConstructionProjectStatus(s.Status), Count: s.Count,
		}
	}
	usage := make([]*generated.ModuleUsageMetric, len(d.ModuleUsage))
	for i, u := range d.ModuleUsage {
		usage[i] = &generated.ModuleUsageMetric{
			ModuleCode: generated.SaasModuleCode(u.ModuleCode),
			ModuleName: u.ModuleName, RecordCount: u.RecordCount,
		}
	}
	return &generated.AndpadAnalyticsDashboard{
		PeriodDays: d.PeriodDays, Kpis: kpis, ProjectsByStatus: statuses,
		ModuleUsage: usage, BillingTotal: d.BillingTotal,
		ActiveProjects: d.ActiveProjects, RecordsByWeek: d.RecordsByWeek,
		ProjectHealthScore: d.ProjectHealthScore,
		BudgetTotal: d.BudgetTotal, CostTotal: d.CostTotal,
		BudgetVariancePct: d.BudgetVariancePct,
		CostByMonth: ToMonthlyCostMetrics(d.CostByMonth),
		GeneratedAt: fmtTime(d.GeneratedAt),
	}
}

func ToApiIntegration(a models.ApiIntegration) *generated.APIIntegration {
	var lastSync *string
	if a.LastSyncAt != nil {
		s := fmtTime(*a.LastSyncAt)
		lastSync = &s
	}
	return &generated.APIIntegration{
		ID: a.ID, Name: a.Name, Provider: a.Provider, EndpointURL: a.EndpointURL,
		APIKeyHint: a.APIKeyHint, Status: a.Status, LastSyncAt: lastSync,
		CreatedAt: fmtTime(a.CreatedAt),
	}
}

func ToApiIntegrations(list []models.ApiIntegration) []*generated.APIIntegration {
	out := make([]*generated.APIIntegration, len(list))
	for i, a := range list {
		out[i] = ToApiIntegration(a)
	}
	return out
}

func ToBimModel(b models.BimModel) *generated.BimModel {
	return &generated.BimModel{
		ID: b.ID, ProjectID: b.ProjectID, ProjectName: b.ProjectName,
		Title: b.Title, Format: b.Format, ViewerURL: b.ViewerURL,
		FileSizeMb: b.FileSizeMB, Status: b.Status, UploadedBy: b.UploadedBy,
		CreatedAt: fmtTime(b.CreatedAt),
	}
}

func ToBimModels(list []models.BimModel) []*generated.BimModel {
	out := make([]*generated.BimModel, len(list))
	for i, b := range list {
		out[i] = ToBimModel(b)
	}
	return out
}

func ApiIntegrationFromInput(in generated.CreateAPIIntegrationInput) models.ApiIntegrationInput {
	return models.ApiIntegrationInput{
		Name: in.Name, Provider: derefStr(in.Provider),
		EndpointURL: derefStr(in.EndpointURL), APIKeyHint: derefStr(in.APIKeyHint),
	}
}

func BimModelFromInput(in generated.CreateBimModelInput) models.BimModelInput {
	return models.BimModelInput{
		ProjectID: in.ProjectID, Title: in.Title, Format: derefStr(in.Format),
		ViewerURL: derefStr(in.ViewerURL), FileSizeMB: in.FileSizeMb,
		UploadedBy: derefStr(in.UploadedBy),
	}
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
