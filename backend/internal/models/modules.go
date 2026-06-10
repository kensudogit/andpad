package models

import "time"

type SaasModuleCode string

const (
	ModuleDX               SaasModuleCode = "DX"
	ModuleCRM              SaasModuleCode = "CRM"
	ModuleAttendance       SaasModuleCode = "ATTENDANCE"
	ModuleEContract        SaasModuleCode = "ECONTRACT"
	ModuleChatbot          SaasModuleCode = "CHATBOT"
	ModuleDocRAG           SaasModuleCode = "DOC_RAG"
	ModuleConstructionMgmt SaasModuleCode = "CONSTRUCTION_MGMT"
	ModuleDrawings         SaasModuleCode = "DRAWINGS"
	ModuleBlackboard       SaasModuleCode = "BLACKBOARD"
	ModuleInspection       SaasModuleCode = "INSPECTION"
	ModuleProjectBoard     SaasModuleCode = "PROJECT_BOARD"
	ModuleInquiryProfit    SaasModuleCode = "INQUIRY_PROFIT"
	ModuleOrders           SaasModuleCode = "ORDERS"
	ModuleRemoteSite       SaasModuleCode = "REMOTE_SITE"
	ModuleDocApproval      SaasModuleCode = "DOC_APPROVAL"
	ModuleScan3D           SaasModuleCode = "SCAN_3D"
	ModuleBilling          SaasModuleCode = "BILLING"
	ModuleWorkRate         SaasModuleCode = "WORK_RATE"
	ModuleSiteAccess       SaasModuleCode = "SITE_ACCESS"
	ModuleEDelivery        SaasModuleCode = "E_DELIVERY"
	ModuleBM               SaasModuleCode = "BM"
	ModuleAnalytics        SaasModuleCode = "ANALYTICS"
	ModuleAPIIntegration   SaasModuleCode = "API_INTEGRATION"
	ModuleBIM              SaasModuleCode = "BIM"
	ModuleBudgetMgmt       SaasModuleCode = "BUDGET_MGMT"
)

func IsConstructionModule(code SaasModuleCode) bool {
	switch code {
	case ModuleConstructionMgmt, ModuleDrawings, ModuleBlackboard, ModuleInspection,
		ModuleProjectBoard, ModuleInquiryProfit, ModuleOrders, ModuleRemoteSite,
		ModuleDocApproval, ModuleScan3D, ModuleBilling, ModuleWorkRate, ModuleSiteAccess,
		ModuleEDelivery, ModuleBM, ModuleAnalytics, ModuleAPIIntegration, ModuleBIM,
		ModuleBudgetMgmt:
		return true
	default:
		return false
	}
}

type SaasModule struct {
	Code        SaasModuleCode
	Name        string
	Description string
	Enabled     bool
}

type DxInitiative struct {
	ID          string
	OrgID       string
	Title       string
	Description string
	Status      string
	ProgressPct int
	OwnerName   string
	DueDate     *time.Time
	TaskCount   int
	TasksDone   int
	CreatedAt   time.Time
}

type DxTask struct {
	ID           string
	InitiativeID string
	Title        string
	Done         bool
	CreatedAt    time.Time
}

type CrmContact struct {
	ID        string
	OrgID     string
	Name      string
	Email     string
	Phone     string
	Company   string
	Stage     string
	Notes     string
	CreatedAt time.Time
}

type CrmInteraction struct {
	ID         string
	ContactID  string
	Kind       string
	Summary    string
	OccurredAt time.Time
}

type AttendanceRecord struct {
	ID      string
	OrgID   string
	UserID  string
	UserName string
	ClockIn time.Time
	ClockOut *time.Time
	Note    string
}

type LeaveRequest struct {
	ID        string
	OrgID     string
	UserID    string
	UserName  string
	StartDate time.Time
	EndDate   time.Time
	Reason    string
	Status    string
	CreatedAt time.Time
}

type ContractTemplate struct {
	ID        string
	OrgID     string
	Name      string
	Body      string
	CreatedAt time.Time
}

type Contract struct {
	ID         string
	OrgID      string
	TemplateID string
	Title      string
	PartyName  string
	PartyEmail string
	Body       string
	Status     string
	CreatedAt  time.Time
	SignedAt   *time.Time
}

type RagDocument struct {
	ID        string
	OrgID     string
	Title     string
	Content   string
	Tags      []string
	CreatedAt time.Time
}

type RagSearchHit struct {
	DocumentID string
	Title      string
	Snippet    string
	Score      float64
}

type ConsultMessageReply struct {
	ThreadID         string
	UserMessage      ConsultationMessage
	AssistantMessage ConsultationMessage
}

type DxInitiativeInput struct {
	Title       string
	Description string
	Status      string
	ProgressPct int
	OwnerName   string
	DueDate     *time.Time
}

type CrmContactInput struct {
	Name    string
	Email   string
	Phone   string
	Company string
	Stage   string
	Notes   string
}

type RagDocumentInput struct {
	Title   string
	Content string
	Tags    []string
}
