package models

import "time"

type BudgetType string

const (
	BudgetTypeEstimate         BudgetType = "ESTIMATE"
	BudgetTypeExecutionBudget  BudgetType = "EXECUTION_BUDGET"
	BudgetTypeForecast         BudgetType = "FORECAST"
)

type BudgetStatus string

const (
	BudgetStatusDraft    BudgetStatus = "DRAFT"
	BudgetStatusApproved BudgetStatus = "APPROVED"
	BudgetStatusLocked   BudgetStatus = "LOCKED"
)

type CostEntryType string

const (
	CostEntryMaterial     CostEntryType = "MATERIAL"
	CostEntryLabor        CostEntryType = "LABOR"
	CostEntrySubcontract  CostEntryType = "SUBCONTRACT"
	CostEntryEquipment    CostEntryType = "EQUIPMENT"
	CostEntryOverhead     CostEntryType = "OVERHEAD"
	CostEntryOther        CostEntryType = "OTHER"
)

type ProjectBudget struct {
	ID             string
	OrgID          string
	ProjectID      string
	ProjectName    string
	Name           string
	BudgetType     BudgetType
	Status         BudgetStatus
	VersionNo      int
	ContractAmount float64
	TotalEstimate  float64
	TotalBudget    float64
	TotalCommitted float64
	TotalActual    float64
	Notes          string
	ApprovedAt     *time.Time
	CreatedAt      time.Time
}

type BudgetLineItem struct {
	ID              string
	OrgID           string
	BudgetID        string
	CategoryCode    string
	CategoryName    string
	WbsCode         string
	Description     string
	EstimateAmount  float64
	BudgetAmount    float64
	CommittedAmount float64
	ActualAmount    float64
	VarianceAmount  float64
	VariancePct     float64
	SortOrder       int
	CreatedAt       time.Time
}

type CostEntry struct {
	ID          string
	OrgID       string
	ProjectID   string
	ProjectName string
	LineItemID  string
	LineItemName string
	EntryType   CostEntryType
	VendorName  string
	Description string
	Amount      float64
	EntryDate   time.Time
	InvoiceNo   string
	RecordedBy  string
	CreatedAt   time.Time
}

type BudgetCategorySummary struct {
	CategoryCode string
	CategoryName string
	BudgetAmount float64
	ActualAmount float64
	VarianceAmount float64
}

type BudgetDashboard struct {
	ProjectID       string
	ProjectName     string
	ContractAmount  float64
	TotalEstimate   float64
	TotalBudget     float64
	TotalCommitted  float64
	TotalActual     float64
	TotalForecast   float64
	VarianceAmount       float64
	VariancePct          float64
	CompletionPct        float64
	EstimateBudgetTotal  float64
	GrossMarginPct       float64
	InquiryProfitTotal   float64
	BillingTotal         float64
	BillingBalance       float64
	MonthlyCosts         []MonthlyCostMetric
	Reconciliation       []BillingReconciliationItem
	LineItems            []BudgetLineItem
	RecentCosts     []CostEntry
	CategorySummary []BudgetCategorySummary
	GeneratedAt     time.Time
}

type ProjectBudgetInput struct {
	ProjectID      string
	Name           string
	BudgetType     BudgetType
	Status         BudgetStatus
	VersionNo      int
	ContractAmount float64
	Notes          string
}

type BudgetLineItemInput struct {
	BudgetID        string
	CategoryCode    string
	CategoryName    string
	WbsCode         string
	Description     string
	EstimateAmount  float64
	BudgetAmount    float64
	CommittedAmount float64
	SortOrder       int
}

type CostEntryInput struct {
	ProjectID   string
	LineItemID  string
	EntryType   CostEntryType
	VendorName  string
	Description string
	Amount      float64
	EntryDate   *time.Time
	InvoiceNo   string
	RecordedBy  string
}

type MonthlyCostMetric struct {
	Month  string
	Amount float64
}

type BillingReconciliationItem struct {
	BillingRecordID string
	Title           string
	BillingAmount   float64
	CostAmount      float64
	VarianceAmount  float64
	Status          string
	BillingDate     string
}

type ProjectBudgetSummary struct {
	ProjectID      string
	ProjectName    string
	Status         ConstructionProjectStatus
	ContractAmount float64
	TotalBudget    float64
	TotalActual    float64
	BillingTotal   float64
	VariancePct    float64
}
