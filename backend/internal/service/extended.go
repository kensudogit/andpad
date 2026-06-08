package service

import (
	"context"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func (s *Service) AndpadAnalytics(ctx context.Context, periodDays int) (models.AndpadAnalyticsDashboard, error) {
	if s.memoryMode() {
		trend := 8.5
		return models.AndpadAnalyticsDashboard{
			PeriodDays: periodDays, ActiveProjects: 1, BillingTotal: 12500000,
			GeneratedAt: time.Now(), ProjectHealthScore: 78,
			RecordsByWeek: []float64{2, 4, 3, 5},
			Kpis: []models.AndpadAnalyticsKpi{
				{Label: "進行中案件", Value: 1, Unit: "件", TrendPct: &trend},
				{Label: "登録案件", Value: 1, Unit: "件"},
				{Label: "期間内記録", Value: 3, Unit: "件"},
				{Label: "請求合計", Value: 12500000, Unit: "円"},
			},
			ProjectsByStatus: []models.ProjectStatusCount{
				{Status: models.ProjectInProgress, Count: 1},
			},
			ModuleUsage: []models.ModuleUsageMetric{
				{ModuleCode: "BILLING", ModuleName: "請求管理", RecordCount: 2},
				{ModuleCode: "SCHEDULE", ModuleName: "工程管理", RecordCount: 1},
			},
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.AndpadAnalytics(ctx, p.OrgID, periodDays)
}

func (s *Service) ListApiIntegrations(ctx context.Context) ([]models.ApiIntegration, error) {
	if _, err := s.requireModule(ctx, models.ModuleAPIIntegration); err != nil {
		return nil, err
	}
	if s.memoryMode() {
		return []models.ApiIntegration{}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListApiIntegrations(ctx, p.OrgID)
}

func (s *Service) CreateApiIntegration(ctx context.Context, in models.ApiIntegrationInput) (models.ApiIntegration, error) {
	if _, err := s.requireModule(ctx, models.ModuleAPIIntegration); err != nil {
		return models.ApiIntegration{}, err
	}
	if s.memoryMode() {
		return models.ApiIntegration{
			ID: "mem-api", OrgID: demoOrgID, Name: in.Name, Provider: in.Provider,
			EndpointURL: in.EndpointURL, APIKeyHint: in.APIKeyHint, Status: "ACTIVE",
			CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateApiIntegration(ctx, p.OrgID, in)
}

func (s *Service) SyncApiIntegration(ctx context.Context, id string) (models.ApiIntegration, error) {
	if _, err := s.requireModule(ctx, models.ModuleAPIIntegration); err != nil {
		return models.ApiIntegration{}, err
	}
	if s.memoryMode() {
		now := time.Now()
		return models.ApiIntegration{
			ID: id, OrgID: demoOrgID, Name: "デモ連携", Provider: "kintone",
			Status: "ACTIVE", LastSyncAt: &now, CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.SyncApiIntegration(ctx, p.OrgID, id)
}

func (s *Service) ListBimModels(ctx context.Context, projectID string) ([]models.BimModel, error) {
	if _, err := s.requireModule(ctx, models.ModuleBIM); err != nil {
		return nil, err
	}
	if s.memoryMode() {
		return s.memoryBimModels(), nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListBimModels(ctx, p.OrgID, projectID)
}

func (s *Service) GetBimModel(ctx context.Context, id string) (models.BimModel, bool, error) {
	if _, err := s.requireModule(ctx, models.ModuleBIM); err != nil {
		return models.BimModel{}, false, err
	}
	if s.memoryMode() {
		for _, m := range s.memoryBimModels() {
			if m.ID == id {
				return m, true, nil
			}
		}
		return models.BimModel{}, false, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.GetBimModel(ctx, p.OrgID, id)
}

func (s *Service) CreateBimModel(ctx context.Context, in models.BimModelInput) (models.BimModel, error) {
	if _, err := s.requireModule(ctx, models.ModuleBIM); err != nil {
		return models.BimModel{}, err
	}
	if s.memoryMode() {
		size := 42.5
		if in.FileSizeMB != nil {
			size = *in.FileSizeMB
		}
		return models.BimModel{
			ID: "mem-bim", OrgID: demoOrgID, ProjectID: in.ProjectID,
			ProjectName: "デモ案件", Title: in.Title, Format: in.Format,
			ViewerURL: in.ViewerURL, FileSizeMB: &size, Status: "READY",
			UploadedBy: in.UploadedBy, CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateBimModel(ctx, p.OrgID, in)
}

func (s *Service) memoryBimModels() []models.BimModel {
	size := 128.0
	viewerURL := "https://modelviewer.dev/shared-assets/models/Astronaut.glb"
	return []models.BimModel{
		{
			ID: "mem-bim-1", OrgID: demoOrgID, ProjectID: "prj-demo-1",
			ProjectName: "渋谷オフィスビル新築工事", Title: "本館 IFC モデル v2",
			Format: "glTF", ViewerURL: viewerURL, FileSizeMB: &size,
			Status: "READY", UploadedBy: "山田 太郎", CreatedAt: time.Now(),
		},
	}
}
