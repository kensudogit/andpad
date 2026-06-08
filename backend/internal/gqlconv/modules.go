package gqlconv

import (
	"time"

	"github.com/pluszero/dental-video-api/internal/graph/generated"
	"github.com/pluszero/dental-video-api/internal/models"
)

func ToSaasModule(m models.SaasModule) *generated.SaasModule {
	return &generated.SaasModule{
		Code:        generated.SaasModuleCode(m.Code),
		Name:        m.Name,
		Description: m.Description,
		Enabled:     m.Enabled,
	}
}

func ToSaasModules(list []models.SaasModule) []*generated.SaasModule {
	out := make([]*generated.SaasModule, len(list))
	for i, m := range list {
		out[i] = ToSaasModule(m)
	}
	return out
}

func ToDxInitiative(i models.DxInitiative) *generated.DxInitiative {
	var due *string
	if i.DueDate != nil {
		s := i.DueDate.Format("2006-01-02")
		due = &s
	}
	return &generated.DxInitiative{
		ID: i.ID, Title: i.Title, Description: i.Description, Status: i.Status,
		ProgressPct: i.ProgressPct, OwnerName: i.OwnerName, DueDate: due,
		TaskCount: i.TaskCount, TasksDone: i.TasksDone, CreatedAt: fmtTime(i.CreatedAt),
	}
}

func ToCrmContact(c models.CrmContact) *generated.CrmContact {
	return &generated.CrmContact{
		ID: c.ID, Name: c.Name, Email: c.Email, Phone: c.Phone,
		Company: c.Company, Stage: c.Stage, Notes: c.Notes, CreatedAt: fmtTime(c.CreatedAt),
	}
}

func ToCrmInteraction(i models.CrmInteraction) *generated.CrmInteraction {
	return &generated.CrmInteraction{
		ID: i.ID, ContactID: i.ContactID, Kind: i.Kind, Summary: i.Summary,
		OccurredAt: fmtTime(i.OccurredAt),
	}
}

func ToAttendanceRecord(r models.AttendanceRecord) *generated.AttendanceRecord {
	var out *string
	if r.ClockOut != nil {
		s := fmtTime(*r.ClockOut)
		out = &s
	}
	return &generated.AttendanceRecord{
		ID: r.ID, UserID: r.UserID, UserName: r.UserName,
		ClockIn: fmtTime(r.ClockIn), ClockOut: out, Note: r.Note,
	}
}

func ToLeaveRequest(l models.LeaveRequest) *generated.LeaveRequest {
	return &generated.LeaveRequest{
		ID: l.ID, UserID: l.UserID, UserName: l.UserName,
		StartDate: l.StartDate.Format("2006-01-02"), EndDate: l.EndDate.Format("2006-01-02"),
		Reason: l.Reason, Status: l.Status, CreatedAt: fmtTime(l.CreatedAt),
	}
}

func ToContractTemplate(t models.ContractTemplate) *generated.ContractTemplate {
	return &generated.ContractTemplate{
		ID: t.ID, Name: t.Name, Body: t.Body, CreatedAt: fmtTime(t.CreatedAt),
	}
}

func ToContract(c models.Contract) *generated.Contract {
	var tid *string
	if c.TemplateID != "" {
		tid = &c.TemplateID
	}
	var signed *string
	if c.SignedAt != nil {
		s := fmtTime(*c.SignedAt)
		signed = &s
	}
	return &generated.Contract{
		ID: c.ID, TemplateID: tid, Title: c.Title, PartyName: c.PartyName,
		PartyEmail: c.PartyEmail, Body: c.Body, Status: c.Status,
		CreatedAt: fmtTime(c.CreatedAt), SignedAt: signed,
	}
}

func ToConsultMessage(m models.ConsultationMessage) *generated.ConsultMessage {
	return &generated.ConsultMessage{
		ID: m.ID, Role: m.Role, Content: m.Content, CreatedAt: fmtTime(m.CreatedAt),
	}
}

func ToConsultThread(t models.ConsultationThread, msgs []models.ConsultationMessage) *generated.ConsultThread {
	gmsgs := make([]*generated.ConsultMessage, len(msgs))
	for i, m := range msgs {
		gmsgs[i] = ToConsultMessage(m)
	}
	return &generated.ConsultThread{
		ID: t.ID, Title: t.Title, CreatedAt: fmtTime(t.CreatedAt), Messages: gmsgs,
	}
}

func ToConsultMessageReply(r models.ConsultMessageReply) *generated.ConsultMessageReply {
	return &generated.ConsultMessageReply{
		ThreadID: r.ThreadID,
		UserMessage:      ToConsultMessage(r.UserMessage),
		AssistantMessage: ToConsultMessage(r.AssistantMessage),
	}
}

func ToRagDocument(d models.RagDocument) *generated.RagDocument {
	return &generated.RagDocument{
		ID: d.ID, Title: d.Title, Content: d.Content, Tags: d.Tags, CreatedAt: fmtTime(d.CreatedAt),
	}
}

func ToRagSearchHit(h models.RagSearchHit) *generated.RagSearchHit {
	return &generated.RagSearchHit{
		DocumentID: h.DocumentID, Title: h.Title, Snippet: h.Snippet, Score: h.Score,
	}
}

func ToRagSearchHits(list []models.RagSearchHit) []*generated.RagSearchHit {
	out := make([]*generated.RagSearchHit, len(list))
	for i, h := range list {
		out[i] = ToRagSearchHit(h)
	}
	return out
}

func ToRagAnswer(answer string, hits []models.RagSearchHit) *generated.RagAnswer {
	return &generated.RagAnswer{Answer: answer, Sources: ToRagSearchHits(hits)}
}

func ToEnabledSaasModules(list []models.SaasModule) []*generated.SaasModule {
	out := make([]*generated.SaasModule, 0, len(list))
	for _, m := range list {
		if m.Enabled {
			out = append(out, ToSaasModule(m))
		}
	}
	return out
}

func DxInitiativeFromInput(in generated.CreateDxInitiativeInput) models.DxInitiativeInput {
	out := models.DxInitiativeInput{
		Title: in.Title, Description: derefStr(in.Description), Status: derefStr(in.Status),
		OwnerName: derefStr(in.OwnerName),
	}
	if in.ProgressPct != nil {
		out.ProgressPct = *in.ProgressPct
	}
	if in.DueDate != nil && *in.DueDate != "" {
		if t, err := time.Parse("2006-01-02", *in.DueDate); err == nil {
			out.DueDate = &t
		}
	}
	return out
}

func CrmContactFromInput(in generated.CreateCrmContactInput) models.CrmContactInput {
	return models.CrmContactInput{
		Name: in.Name, Email: derefStr(in.Email), Phone: derefStr(in.Phone),
		Company: derefStr(in.Company), Stage: derefStr(in.Stage), Notes: derefStr(in.Notes),
	}
}

func RagDocumentFromInput(in generated.CreateRagDocumentInput) models.RagDocumentInput {
	tags := in.Tags
	if tags == nil {
		tags = []string{}
	}
	return models.RagDocumentInput{Title: in.Title, Content: in.Content, Tags: tags}
}

func derefStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
