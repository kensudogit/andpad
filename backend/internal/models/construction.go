package models

import "time"

type ConstructionProjectStatus string

const (
	ProjectPlanning   ConstructionProjectStatus = "PLANNING"
	ProjectInProgress ConstructionProjectStatus = "IN_PROGRESS"
	ProjectCompleted  ConstructionProjectStatus = "COMPLETED"
	ProjectOnHold     ConstructionProjectStatus = "ON_HOLD"
)

type ConstructionProject struct {
	ID          string
	OrgID       string
	Name        string
	SiteAddress string
	Status      ConstructionProjectStatus
	ManagerName string
	StartDate   *time.Time
	EndDate     *time.Time
	RecordCount int
	CreatedAt   time.Time
}

type ProjectModuleRecord struct {
	ID          string
	OrgID       string
	ProjectID   string
	ProjectName string
	ModuleCode  SaasModuleCode
	Title       string
	Status      string
	Detail      string
	Amount      *float64
	PersonName  string
	RecordDate  *time.Time
	CreatedAt   time.Time
}

type ConstructionProjectInput struct {
	Name        string
	SiteAddress string
	Status      ConstructionProjectStatus
	ManagerName string
	StartDate   *time.Time
	EndDate     *time.Time
}

type ProjectModuleRecordInput struct {
	ProjectID  string
	ModuleCode SaasModuleCode
	Title      string
	Status     string
	Detail     string
	Amount     *float64
	PersonName string
	RecordDate *time.Time
}
