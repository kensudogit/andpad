package service

import (
	"context"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/rag"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func (s *Service) requireModule(ctx context.Context, code models.SaasModuleCode) (tenant.Principal, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return tenant.Principal{}, err
	}
	if s.Memory != nil && s.PG == nil {
		if !s.memoryIsModuleEnabled(code) {
			return tenant.Principal{}, tenant.ErrModuleDisabled
		}
		return p, nil
	}
	if s.PG == nil {
		return tenant.Principal{}, tenant.ErrUnauthorized
	}
	ok, err := s.PG.IsModuleEnabled(ctx, p.OrgID, code)
	if err != nil {
		return tenant.Principal{}, err
	}
	if !ok {
		return tenant.Principal{}, tenant.ErrModuleDisabled
	}
	return p, nil
}

func (s *Service) ListSaasModules(ctx context.Context) ([]models.SaasModule, error) {
	if _, err := s.requireAuth(ctx); err != nil {
		return nil, err
	}
	if s.memoryMode() {
		return s.memoryListSaasModules(), nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListOrgModules(ctx, p.OrgID)
}

func (s *Service) SetSaasModuleEnabled(ctx context.Context, code models.SaasModuleCode, enabled bool) (models.SaasModule, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return models.SaasModule{}, err
	}
	if p.Role != string(models.RoleOwner) && p.Role != string(models.RoleAdmin) {
		return models.SaasModule{}, tenant.ErrForbidden
	}
	if !isValidModuleCode(code) {
		return models.SaasModule{}, tenant.ErrForbidden
	}
	if s.memoryMode() {
		return s.memorySetSaasModuleEnabled(code, enabled)
	}
	return s.PG.SetOrgModuleEnabled(ctx, p.OrgID, code, enabled)
}

func isValidModuleCode(code models.SaasModuleCode) bool {
	switch code {
	case models.ModuleDX, models.ModuleCRM, models.ModuleAttendance, models.ModuleEContract, models.ModuleChatbot, models.ModuleDocRAG,
		models.ModuleConstructionMgmt, models.ModuleDrawings, models.ModuleBlackboard, models.ModuleInspection,
		models.ModuleProjectBoard, models.ModuleInquiryProfit, models.ModuleOrders, models.ModuleRemoteSite,
		models.ModuleDocApproval, models.ModuleScan3D, models.ModuleBilling, models.ModuleWorkRate, models.ModuleSiteAccess,
		models.ModuleEDelivery, models.ModuleBM, models.ModuleAnalytics, models.ModuleAPIIntegration, models.ModuleBIM:
		return true
	default:
		return false
	}
}

func (s *Service) useRemoteSaaS() bool {
	return s.SaaSRemote != nil && s.Cfg.MicroservicesEnabled()
}

func (s *Service) ListDxInitiatives(ctx context.Context) ([]models.DxInitiative, error) {
	if _, err := s.requireModule(ctx, models.ModuleDX); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListDxInitiatives(ctx)
	}
	if s.memoryMode() {
		return []models.DxInitiative{}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListDxInitiatives(ctx, p.OrgID)
}

func (s *Service) CreateDxInitiative(ctx context.Context, in models.DxInitiativeInput) (models.DxInitiative, error) {
	if _, err := s.requireModule(ctx, models.ModuleDX); err != nil {
		return models.DxInitiative{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateDxInitiative(ctx, in)
	}
	if s.memoryMode() {
		return models.DxInitiative{
			ID: in.Title, OrgID: demoOrgID, Title: in.Title, Description: in.Description,
			Status: in.Status, ProgressPct: in.ProgressPct, OwnerName: in.OwnerName, DueDate: in.DueDate,
			CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateDxInitiative(ctx, p.OrgID, in)
}

func (s *Service) ListCrmContacts(ctx context.Context) ([]models.CrmContact, error) {
	if _, err := s.requireModule(ctx, models.ModuleCRM); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListCrmContacts(ctx)
	}
	if s.memoryMode() {
		return []models.CrmContact{}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListCrmContacts(ctx, p.OrgID)
}

func (s *Service) CreateCrmContact(ctx context.Context, in models.CrmContactInput) (models.CrmContact, error) {
	if _, err := s.requireModule(ctx, models.ModuleCRM); err != nil {
		return models.CrmContact{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateCrmContact(ctx, in)
	}
	if s.memoryMode() {
		return models.CrmContact{
			ID: "mem-crm", OrgID: demoOrgID, Name: in.Name, Email: in.Email, Phone: in.Phone,
			Company: in.Company, Stage: in.Stage, Notes: in.Notes, CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateCrmContact(ctx, p.OrgID, in)
}

func (s *Service) CreateCrmInteraction(ctx context.Context, contactID, kind, summary string) (models.CrmInteraction, error) {
	if _, err := s.requireModule(ctx, models.ModuleCRM); err != nil {
		return models.CrmInteraction{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateCrmInteraction(ctx, contactID, kind, summary)
	}
	if s.memoryMode() {
		return models.CrmInteraction{ID: "mem-int", ContactID: contactID, Kind: kind, Summary: summary, OccurredAt: time.Now()}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateCrmInteraction(ctx, p.OrgID, contactID, kind, summary)
}

func (s *Service) ListCrmInteractions(ctx context.Context, contactID string) ([]models.CrmInteraction, error) {
	if _, err := s.requireModule(ctx, models.ModuleCRM); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListCrmInteractions(ctx, contactID)
	}
	if s.memoryMode() {
		return []models.CrmInteraction{}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListCrmInteractions(ctx, p.OrgID, contactID)
}

func (s *Service) ListAttendanceRecords(ctx context.Context, userID string) ([]models.AttendanceRecord, error) {
	if _, err := s.requireModule(ctx, models.ModuleAttendance); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListAttendanceRecords(ctx)
	}
	if s.memoryMode() {
		return []models.AttendanceRecord{}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	if userID == "" {
		userID = p.UserID
	}
	return s.PG.ListAttendanceRecords(ctx, p.OrgID, userID, 40)
}

func (s *Service) ClockIn(ctx context.Context, note string) (models.AttendanceRecord, error) {
	if _, err := s.requireModule(ctx, models.ModuleAttendance); err != nil {
		return models.AttendanceRecord{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ClockIn(ctx, note)
	}
	if s.memoryMode() {
		p, _ := tenant.PrincipalFrom(ctx)
		now := time.Now()
		return models.AttendanceRecord{ID: "mem-att", OrgID: demoOrgID, UserID: p.UserID, UserName: p.Name, ClockIn: now, Note: note}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	if open, has, err := s.PG.OpenAttendanceClock(ctx, p.OrgID, p.UserID); err != nil {
		return models.AttendanceRecord{}, err
	} else if has {
		return open, nil
	}
	return s.PG.ClockIn(ctx, p.OrgID, p.UserID, note)
}

func (s *Service) ClockOut(ctx context.Context) (models.AttendanceRecord, error) {
	if _, err := s.requireModule(ctx, models.ModuleAttendance); err != nil {
		return models.AttendanceRecord{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ClockOut(ctx)
	}
	if s.memoryMode() {
		now := time.Now()
		return models.AttendanceRecord{ID: "mem-att", OrgID: demoOrgID, ClockIn: now.Add(-8 * time.Hour), ClockOut: &now}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	open, has, err := s.PG.OpenAttendanceClock(ctx, p.OrgID, p.UserID)
	if err != nil {
		return models.AttendanceRecord{}, err
	}
	if !has {
		return models.AttendanceRecord{}, tenant.ErrForbidden
	}
	return s.PG.ClockOut(ctx, p.OrgID, open.ID)
}

func (s *Service) ListLeaveRequests(ctx context.Context) ([]models.LeaveRequest, error) {
	if _, err := s.requireModule(ctx, models.ModuleAttendance); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListLeaveRequests(ctx)
	}
	if s.memoryMode() {
		return []models.LeaveRequest{}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListLeaveRequests(ctx, p.OrgID)
}

func (s *Service) CreateLeaveRequest(ctx context.Context, start, end time.Time, reason string) (models.LeaveRequest, error) {
	if _, err := s.requireModule(ctx, models.ModuleAttendance); err != nil {
		return models.LeaveRequest{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateLeaveRequest(ctx, start.Format("2006-01-02"), end.Format("2006-01-02"), reason)
	}
	if s.memoryMode() {
		p, _ := tenant.PrincipalFrom(ctx)
		return models.LeaveRequest{
			ID: "mem-lv", OrgID: demoOrgID, UserID: p.UserID, UserName: p.Name,
			StartDate: start, EndDate: end, Reason: reason, Status: "PENDING", CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateLeaveRequest(ctx, p.OrgID, p.UserID, start, end, reason)
}

func (s *Service) ApproveLeaveRequest(ctx context.Context, id string) (models.LeaveRequest, error) {
	p, err := s.requireModule(ctx, models.ModuleAttendance)
	if err != nil {
		return models.LeaveRequest{}, err
	}
	if p.Role != string(models.RoleOwner) && p.Role != string(models.RoleAdmin) {
		return models.LeaveRequest{}, tenant.ErrForbidden
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ApproveLeaveRequest(ctx, id)
	}
	if s.memoryMode() {
		return models.LeaveRequest{ID: id, OrgID: demoOrgID, Status: "APPROVED"}, nil
	}
	return s.PG.UpdateLeaveStatus(ctx, p.OrgID, id, "APPROVED")
}

func (s *Service) ListContractTemplates(ctx context.Context) ([]models.ContractTemplate, error) {
	if _, err := s.requireModule(ctx, models.ModuleEContract); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListContractTemplates(ctx)
	}
	if s.memoryMode() {
		return []models.ContractTemplate{}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListContractTemplates(ctx, p.OrgID)
}

func (s *Service) CreateContractTemplate(ctx context.Context, name, body string) (models.ContractTemplate, error) {
	if _, err := s.requireModule(ctx, models.ModuleEContract); err != nil {
		return models.ContractTemplate{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateContractTemplate(ctx, name, body)
	}
	if s.memoryMode() {
		return models.ContractTemplate{ID: "mem-tpl", OrgID: demoOrgID, Name: name, Body: body, CreatedAt: time.Now()}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateContractTemplate(ctx, p.OrgID, name, body)
}

func (s *Service) ListContracts(ctx context.Context) ([]models.Contract, error) {
	if _, err := s.requireModule(ctx, models.ModuleEContract); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListContracts(ctx)
	}
	if s.memoryMode() {
		return []models.Contract{}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListContracts(ctx, p.OrgID)
}

func (s *Service) CreateContract(ctx context.Context, templateID, title, partyName, partyEmail, body string) (models.Contract, error) {
	if _, err := s.requireModule(ctx, models.ModuleEContract); err != nil {
		return models.Contract{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateContract(ctx, templateID, title, partyName, partyEmail, body)
	}
	if s.memoryMode() {
		return models.Contract{
			ID: "mem-ctr", OrgID: demoOrgID, TemplateID: templateID, Title: title,
			PartyName: partyName, PartyEmail: partyEmail, Body: body, Status: "DRAFT", CreatedAt: time.Now(),
		}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateContract(ctx, p.OrgID, templateID, title, partyName, partyEmail, body)
}

func (s *Service) SignContract(ctx context.Context, id string) (models.Contract, error) {
	if _, err := s.requireModule(ctx, models.ModuleEContract); err != nil {
		return models.Contract{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.SignContract(ctx, id)
	}
	if s.memoryMode() {
		now := time.Now()
		return models.Contract{ID: id, OrgID: demoOrgID, Status: "SIGNED", SignedAt: &now}, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.SignContract(ctx, p.OrgID, id)
}

func (s *Service) ListConsultThreadsModule(ctx context.Context) ([]models.ConsultationThread, error) {
	if _, err := s.requireModule(ctx, models.ModuleChatbot); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListConsultThreads(ctx)
	}
	return s.ListConsultThreads(ctx)
}

func (s *Service) GetConsultThreadModule(ctx context.Context, threadID string) (models.ConsultationThread, []models.ConsultationMessage, error) {
	if _, err := s.requireModule(ctx, models.ModuleChatbot); err != nil {
		return models.ConsultationThread{}, nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.GetConsultThread(ctx, threadID)
	}
	return s.GetConsultThread(ctx, threadID)
}

func (s *Service) SendConsultationModule(ctx context.Context, threadID, message string) (models.ConsultMessageReply, error) {
	if _, err := s.requireModule(ctx, models.ModuleChatbot); err != nil {
		return models.ConsultMessageReply{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.SendConsultation(ctx, threadID, message)
	}
	userMsg, aiMsg, err := s.SendConsultation(ctx, threadID, message)
	if err != nil {
		return models.ConsultMessageReply{}, err
	}
	tid := threadID
	if tid == "" {
		tid = userMsg.ThreadID
	}
	return models.ConsultMessageReply{ThreadID: tid, UserMessage: userMsg, AssistantMessage: aiMsg}, nil
}

func (s *Service) ListRagDocuments(ctx context.Context) ([]models.RagDocument, error) {
	if _, err := s.requireModule(ctx, models.ModuleDocRAG); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListRagDocuments(ctx)
	}
	if s.memoryMode() {
		return s.memoryListRagDocuments(ctx)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListRagDocuments(ctx, p.OrgID)
}

func (s *Service) CreateRagDocument(ctx context.Context, in models.RagDocumentInput) (models.RagDocument, error) {
	if _, err := s.requireModule(ctx, models.ModuleDocRAG); err != nil {
		return models.RagDocument{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateRagDocument(ctx, in)
	}
	if s.memoryMode() {
		return s.memoryCreateRagDocument(ctx, in)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateRagDocument(ctx, p.OrgID, in)
}

func (s *Service) SearchRagDocuments(ctx context.Context, query string, limit int) ([]models.RagSearchHit, error) {
	if _, err := s.requireModule(ctx, models.ModuleDocRAG); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.SearchRagDocuments(ctx, query, limit)
	}
	if s.memoryMode() {
		return s.memorySearchRagDocuments(ctx, query, limit)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	hits, err := s.PG.SearchRagDocuments(ctx, p.OrgID, query, limit)
	if err != nil {
		return nil, err
	}
	if len(hits) > 0 {
		return hits, nil
	}
	docs, _ := s.PG.ListRagDocuments(ctx, p.OrgID)
	if extra := rag.FallbackSearchWhenEmpty(ctx, s.Cfg, s.OpenAI, query, docs); len(extra) > 0 {
		return extra, nil
	}
	return hits, nil
}

func (s *Service) RagAnswer(ctx context.Context, query string) (string, []models.RagSearchHit, error) {
	if s.memoryMode() {
		return s.memoryRagAnswer(ctx, query)
	}
	if s.useRemoteSaaS() {
		if _, err := s.requireModule(ctx, models.ModuleDocRAG); err != nil {
			return "", nil, err
		}
		return s.SaaSRemote.RagAnswer(ctx, query)
	}
	hits, err := s.SearchRagDocuments(ctx, query, 5)
	if err != nil {
		return "", nil, err
	}
	p, _ := tenant.PrincipalFrom(ctx)
	docs, _ := s.PG.ListRagDocuments(ctx, p.OrgID)
	answer := rag.GenerateAnswer(ctx, s.Cfg, s.OpenAI, query, hits, docs)
	return answer, hits, nil
}
