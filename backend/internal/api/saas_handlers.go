package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/service"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

// SaasHandler exposes multi-tenant business modules over REST (works before gqlgen regenerate).
type SaasHandler struct {
	svc *service.Service
}

func (h *SaasHandler) Routes(r chi.Router) {
	r.Get("/modules", h.ListModules)
	r.Patch("/modules/{code}", h.SetModuleEnabled)
	r.Get("/dx/initiatives", h.ListDx)
	r.Post("/dx/initiatives", h.CreateDx)
	r.Get("/crm/contacts", h.ListCrmContacts)
	r.Post("/crm/contacts", h.CreateCrmContact)
	r.Get("/crm/contacts/{id}/interactions", h.ListCrmInteractions)
	r.Post("/crm/contacts/{id}/interactions", h.CreateCrmInteraction)
	r.Get("/attendance/records", h.ListAttendance)
	r.Post("/attendance/clock-in", h.ClockIn)
	r.Post("/attendance/clock-out", h.ClockOut)
	r.Get("/attendance/leave", h.ListLeave)
	r.Post("/attendance/leave", h.CreateLeave)
	r.Post("/attendance/leave/{id}/approve", h.ApproveLeave)
	r.Get("/contracts/templates", h.ListTemplates)
	r.Post("/contracts/templates", h.CreateTemplate)
	r.Get("/contracts", h.ListContracts)
	r.Post("/contracts", h.CreateContract)
	r.Post("/contracts/{id}/sign", h.SignContract)
	r.Get("/chat/threads", h.ListChatThreads)
	r.Get("/chat/threads/{id}", h.GetChatThread)
	r.Post("/chat/messages", h.SendChatMessage)
	r.Get("/rag/documents", h.ListRagDocs)
	r.Post("/rag/documents", h.CreateRagDoc)
	r.Get("/rag/search", h.SearchRag)
	r.Post("/rag/answer", h.RagAnswer)
}

func (h *SaasHandler) ListModules(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListSaasModules(r.Context())
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"modules": list})
}

func (h *SaasHandler) SetModuleEnabled(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	var body struct {
		Enabled bool `json:"enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.svc.SetSaasModuleEnabled(r.Context(), models.SaasModuleCode(code), body.Enabled)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *SaasHandler) ListDx(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListDxInitiatives(r.Context())
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"initiatives": list})
}

func (h *SaasHandler) CreateDx(w http.ResponseWriter, r *http.Request) {
	var body models.DxInitiativeInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.svc.CreateDxInitiative(r.Context(), body)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *SaasHandler) ListCrmContacts(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListCrmContacts(r.Context())
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"contacts": list})
}

func (h *SaasHandler) CreateCrmContact(w http.ResponseWriter, r *http.Request) {
	var body models.CrmContactInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.svc.CreateCrmContact(r.Context(), body)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *SaasHandler) ListCrmInteractions(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	list, err := h.svc.ListCrmInteractions(r.Context(), id)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"interactions": list})
}

func (h *SaasHandler) CreateCrmInteraction(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var body struct {
		Kind    string `json:"kind"`
		Summary string `json:"summary"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.svc.CreateCrmInteraction(r.Context(), id, body.Kind, body.Summary)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *SaasHandler) ListAttendance(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListAttendanceRecords(r.Context(), "")
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"records": list})
}

func (h *SaasHandler) ClockIn(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Note string `json:"note"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	item, err := h.svc.ClockIn(r.Context(), body.Note)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *SaasHandler) ClockOut(w http.ResponseWriter, r *http.Request) {
	item, err := h.svc.ClockOut(r.Context())
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *SaasHandler) ListLeave(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListLeaveRequests(r.Context())
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"requests": list})
}

func (h *SaasHandler) CreateLeave(w http.ResponseWriter, r *http.Request) {
	var body struct {
		StartDate string `json:"startDate"`
		EndDate   string `json:"endDate"`
		Reason    string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	start, err1 := time.Parse("2006-01-02", body.StartDate)
	end, err2 := time.Parse("2006-01-02", body.EndDate)
	if err1 != nil || err2 != nil {
		writeError(w, http.StatusBadRequest, "invalid date (YYYY-MM-DD)")
		return
	}
	item, err := h.svc.CreateLeaveRequest(r.Context(), start, end, body.Reason)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *SaasHandler) ApproveLeave(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	item, err := h.svc.ApproveLeaveRequest(r.Context(), id)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *SaasHandler) ListTemplates(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListContractTemplates(r.Context())
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"templates": list})
}

func (h *SaasHandler) CreateTemplate(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name string `json:"name"`
		Body string `json:"body"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.svc.CreateContractTemplate(r.Context(), body.Name, body.Body)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *SaasHandler) ListContracts(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListContracts(r.Context())
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"contracts": list})
}

func (h *SaasHandler) CreateContract(w http.ResponseWriter, r *http.Request) {
	var body struct {
		TemplateID string `json:"templateId"`
		Title      string `json:"title"`
		PartyName  string `json:"partyName"`
		PartyEmail string `json:"partyEmail"`
		Body       string `json:"body"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.svc.CreateContract(r.Context(), body.TemplateID, body.Title, body.PartyName, body.PartyEmail, body.Body)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *SaasHandler) SignContract(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	item, err := h.svc.SignContract(r.Context(), id)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *SaasHandler) ListChatThreads(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListConsultThreadsModule(r.Context())
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"threads": list})
}

func (h *SaasHandler) GetChatThread(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	thread, msgs, err := h.svc.GetConsultThreadModule(r.Context(), id)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"thread": thread, "messages": msgs})
}

func (h *SaasHandler) SendChatMessage(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ThreadID string `json:"threadId"`
		Message  string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	reply, err := h.svc.SendConsultationModule(r.Context(), body.ThreadID, body.Message)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, reply)
}

func (h *SaasHandler) ListRagDocs(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListRagDocuments(r.Context())
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"documents": list})
}

func (h *SaasHandler) CreateRagDoc(w http.ResponseWriter, r *http.Request) {
	var body models.RagDocumentInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.svc.CreateRagDocument(r.Context(), body)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *SaasHandler) SearchRag(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	hits, err := h.svc.SearchRagDocuments(r.Context(), q, limit)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"hits": hits})
}

func (h *SaasHandler) RagAnswer(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Query string `json:"query"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	answer, sources, err := h.svc.RagAnswer(r.Context(), body.Query)
	if h.writeSvcErr(w, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"answer": answer, "sources": sources})
}

func (h *SaasHandler) writeSvcErr(w http.ResponseWriter, err error) bool {
	if err == nil {
		return false
	}
	switch {
	case errors.Is(err, tenant.ErrUnauthorized):
		writeError(w, http.StatusUnauthorized, "login required")
	case errors.Is(err, tenant.ErrModuleDisabled):
		writeError(w, http.StatusForbidden, "module not enabled for your organization")
	case errors.Is(err, tenant.ErrForbidden):
		writeError(w, http.StatusForbidden, "forbidden")
	default:
		writeError(w, http.StatusInternalServerError, err.Error())
	}
	return true
}
