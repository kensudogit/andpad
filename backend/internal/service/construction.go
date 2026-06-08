package service

import (
	"context"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func (s *Service) ListConstructionProjects(ctx context.Context) ([]models.ConstructionProject, error) {
	if _, err := s.requireAuth(ctx); err != nil {
		return nil, err
	}
	if s.memoryMode() {
		return s.memoryConstructionProjects(), nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListConstructionProjects(ctx, p.OrgID)
}

func (s *Service) CreateConstructionProject(ctx context.Context, in models.ConstructionProjectInput) (models.ConstructionProject, error) {
	if _, err := s.requireAuth(ctx); err != nil {
		return models.ConstructionProject{}, err
	}
	if s.memoryMode() {
		return models.ConstructionProject{
			ID: "mem-prj", OrgID: demoOrgID, Name: in.Name, SiteAddress: in.SiteAddress,
			Status: in.Status, ManagerName: in.ManagerName, StartDate: in.StartDate, EndDate: in.EndDate,
			CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateConstructionProject(ctx, p.OrgID, in)
}

func (s *Service) ListProjectModuleRecords(ctx context.Context, code models.SaasModuleCode, projectID string) ([]models.ProjectModuleRecord, error) {
	if _, err := s.requireModule(ctx, code); err != nil {
		return nil, err
	}
	if s.memoryMode() {
		return []models.ProjectModuleRecord{}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListProjectModuleRecords(ctx, p.OrgID, code, projectID)
}

func (s *Service) CreateProjectModuleRecord(ctx context.Context, in models.ProjectModuleRecordInput) (models.ProjectModuleRecord, error) {
	if _, err := s.requireModule(ctx, in.ModuleCode); err != nil {
		return models.ProjectModuleRecord{}, err
	}
	if s.memoryMode() {
		return models.ProjectModuleRecord{
			ID: "mem-rec", OrgID: demoOrgID, ProjectID: in.ProjectID, ProjectName: "デモ案件",
			ModuleCode: in.ModuleCode, Title: in.Title, Status: in.Status, Detail: in.Detail,
			Amount: in.Amount, PersonName: in.PersonName, RecordDate: in.RecordDate,
			CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateProjectModuleRecord(ctx, p.OrgID, in)
}

func (s *Service) memoryConstructionProjects() []models.ConstructionProject {
	now := time.Now()
	start := now.AddDate(0, -1, 0)
	end := now.AddDate(0, 5, 0)
	return []models.ConstructionProject{
		{
			ID: "mem-prj-1", OrgID: demoOrgID, Name: "渋谷オフィスビル新築工事",
			SiteAddress: "東京都渋谷区1-1-1", Status: models.ProjectInProgress,
			ManagerName: "山田 太郎", StartDate: &start, EndDate: &end, RecordCount: 0, CreatedAt: now,
		},
	}
}
