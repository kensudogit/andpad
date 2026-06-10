package models

import "time"

type AndpadAnalyticsKpi struct {
	Label    string
	Value    float64
	Unit     string
	TrendPct *float64
}

type ProjectStatusCount struct {
	Status ConstructionProjectStatus
	Count  int
}

type ModuleUsageMetric struct {
	ModuleCode  SaasModuleCode
	ModuleName  string
	RecordCount int
}

type AndpadAnalyticsDashboard struct {
	PeriodDays         int
	Kpis               []AndpadAnalyticsKpi
	ProjectsByStatus   []ProjectStatusCount
	ModuleUsage        []ModuleUsageMetric
	BillingTotal       float64
	ActiveProjects     int
	RecordsByWeek      []float64
	ProjectHealthScore float64
	BudgetTotal        float64
	CostTotal          float64
	BudgetVariancePct  float64
	CostByMonth        []MonthlyCostMetric
	GeneratedAt        time.Time
}

type ApiIntegration struct {
	ID          string
	OrgID       string
	Name        string
	Provider    string
	EndpointURL string
	APIKeyHint  string
	Status      string
	LastSyncAt  *time.Time
	CreatedAt   time.Time
}

type ApiIntegrationInput struct {
	Name        string
	Provider    string
	EndpointURL string
	APIKeyHint  string
}

type BimModel struct {
	ID          string
	OrgID       string
	ProjectID   string
	ProjectName string
	Title       string
	Format      string
	ViewerURL   string
	FileSizeMB  *float64
	Status      string
	UploadedBy  string
	CreatedAt   time.Time
}

type BimModelInput struct {
	ProjectID  string
	Title      string
	Format     string
	ViewerURL  string
	FileSizeMB *float64
	UploadedBy string
}
