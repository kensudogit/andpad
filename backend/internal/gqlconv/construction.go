package gqlconv

import (
	"time"

	"github.com/pluszero/dental-video-api/internal/graph/generated"
	"github.com/pluszero/dental-video-api/internal/models"
)

func ToConstructionProject(p models.ConstructionProject) *generated.ConstructionProject {
	var start, end *string
	if p.StartDate != nil {
		s := p.StartDate.Format("2006-01-02")
		start = &s
	}
	if p.EndDate != nil {
		s := p.EndDate.Format("2006-01-02")
		end = &s
	}
	return &generated.ConstructionProject{
		ID: p.ID, Name: p.Name, SiteAddress: p.SiteAddress,
		Status: generated.ConstructionProjectStatus(p.Status),
		ManagerName: p.ManagerName, StartDate: start, EndDate: end,
		RecordCount: p.RecordCount, CreatedAt: fmtTime(p.CreatedAt),
	}
}

func ToConstructionProjects(list []models.ConstructionProject) []*generated.ConstructionProject {
	out := make([]*generated.ConstructionProject, len(list))
	for i, p := range list {
		out[i] = ToConstructionProject(p)
	}
	return out
}

func ToProjectModuleRecord(r models.ProjectModuleRecord) *generated.ProjectModuleRecord {
	var amount *float64
	if r.Amount != nil {
		v := *r.Amount
		amount = &v
	}
	var recordDate *string
	if r.RecordDate != nil {
		s := r.RecordDate.Format("2006-01-02")
		recordDate = &s
	}
	return &generated.ProjectModuleRecord{
		ID: r.ID, ProjectID: r.ProjectID, ProjectName: r.ProjectName,
		ModuleCode: generated.SaasModuleCode(r.ModuleCode),
		Title: r.Title, Status: r.Status, Detail: r.Detail,
		Amount: amount, PersonName: r.PersonName, RecordDate: recordDate,
		CreatedAt: fmtTime(r.CreatedAt),
	}
}

func ToProjectModuleRecords(list []models.ProjectModuleRecord) []*generated.ProjectModuleRecord {
	out := make([]*generated.ProjectModuleRecord, len(list))
	for i, r := range list {
		out[i] = ToProjectModuleRecord(r)
	}
	return out
}

func ConstructionProjectFromInput(in generated.CreateConstructionProjectInput) models.ConstructionProjectInput {
	out := models.ConstructionProjectInput{
		Name: in.Name, SiteAddress: derefStr(in.SiteAddress), ManagerName: derefStr(in.ManagerName),
	}
	if in.Status != nil {
		out.Status = models.ConstructionProjectStatus(*in.Status)
	}
	if in.StartDate != nil && *in.StartDate != "" {
		if t, err := time.Parse("2006-01-02", *in.StartDate); err == nil {
			out.StartDate = &t
		}
	}
	if in.EndDate != nil && *in.EndDate != "" {
		if t, err := time.Parse("2006-01-02", *in.EndDate); err == nil {
			out.EndDate = &t
		}
	}
	return out
}

func ProjectModuleRecordFromInput(in generated.CreateProjectModuleRecordInput) models.ProjectModuleRecordInput {
	out := models.ProjectModuleRecordInput{
		ProjectID: in.ProjectID, ModuleCode: models.SaasModuleCode(in.ModuleCode),
		Title: in.Title, Status: derefStr(in.Status), Detail: derefStr(in.Detail),
		PersonName: derefStr(in.PersonName),
	}
	if in.Amount != nil {
		out.Amount = in.Amount
	}
	if in.RecordDate != nil && *in.RecordDate != "" {
		if t, err := time.Parse("2006-01-02", *in.RecordDate); err == nil {
			out.RecordDate = &t
		}
	}
	return out
}
