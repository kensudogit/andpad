package chat

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/consult"
	"github.com/pluszero/dental-video-api/internal/microsvc/base"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/openai"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
	"github.com/pluszero/dental-video-api/internal/textutil"
)

func Register(d *runtime.Deps) {
	h := &handler{cfg: d.Cfg, db: d.DB, ai: d.OpenAI}
	d.Router.Get("/threads", h.listThreads)
	d.Router.Get("/threads/{id}", h.getThread)
	d.Router.Post("/messages", h.sendMessage)
}

type handler struct {
	cfg config.Config
	db  *postgres.DB
	ai  *openai.Client
}

func (h *handler) listThreads(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	orgWide := p.Role == "OWNER" || p.Role == "ADMIN"
	list, err := h.db.ListConsultThreads(r.Context(), p.OrgID, p.UserID, orgWide)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"threads": list})
}

func (h *handler) getThread(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	id := chi.URLParam(r, "id")
	orgWide := p.Role == "OWNER" || p.Role == "ADMIN"
	thread, msgs, err := h.db.GetConsultThread(r.Context(), p.OrgID, p.UserID, id, orgWide)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"thread": thread, "messages": msgs})
}

func (h *handler) sendMessage(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body struct {
		ThreadID string `json:"threadId"`
		Message  string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	userMsg, aiMsg, threadID, err := h.consult(r.Context(), p.OrgID, p.UserID, body.ThreadID, body.Message)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, models.ConsultMessageReply{
		ThreadID: threadID, UserMessage: userMsg, AssistantMessage: aiMsg,
	})
}

func (h *handler) consult(ctx context.Context, oid, uid, threadID, message string) (models.ConsultationMessage, models.ConsultationMessage, string, error) {
	if threadID == "" {
		t, err := h.db.CreateConsultThread(ctx, oid, uid, textutil.TruncateRunes(message, 40))
		if err != nil {
			return models.ConsultationMessage{}, models.ConsultationMessage{}, "", err
		}
		threadID = t.ID
	} else if err := h.db.VerifyConsultThreadAccess(ctx, oid, uid, threadID); err != nil {
		return models.ConsultationMessage{}, models.ConsultationMessage{}, "", err
	}
	userMsg, err := h.db.AddConsultMessage(ctx, oid, threadID, "user", message)
	if err != nil {
		return models.ConsultationMessage{}, models.ConsultationMessage{}, "", err
	}
	_, msgs, err := h.db.GetConsultThread(ctx, oid, uid, threadID, false)
	if err != nil {
		return userMsg, models.ConsultationMessage{}, threadID, err
	}
	history := make([]openai.ChatMessage, 0, len(msgs))
	for _, m := range msgs {
		if m.ID == userMsg.ID {
			continue
		}
		history = append(history, openai.ChatMessage{Role: m.Role, Content: m.Content})
	}
	reply := consult.GenerateReply(ctx, h.cfg, h.ai, history, message)
	aiMsg, err := h.db.AddConsultMessage(ctx, oid, threadID, "assistant", reply)
	_ = h.db.IncrementConsultUsage(ctx, oid, len(message)+len(reply))
	return userMsg, aiMsg, threadID, err
}
