package rag

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/microsvc/base"
	ragsvc "github.com/pluszero/dental-video-api/internal/rag"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/openai"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
)

func Register(d *runtime.Deps) {
	h := &handler{cfg: d.Cfg, db: d.DB, ai: d.OpenAI}
	d.Router.Get("/documents", h.listDocs)
	d.Router.Post("/documents", h.createDoc)
	d.Router.Get("/search", h.search)
	d.Router.Post("/answer", h.answer)
}

type handler struct {
	cfg config.Config
	db  *postgres.DB
	ai  *openai.Client
}

func (h *handler) listDocs(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	list, err := h.db.ListRagDocuments(r.Context(), p.OrgID)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"documents": list})
}

func (h *handler) createDoc(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body models.RagDocumentInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.db.CreateRagDocument(r.Context(), p.OrgID, body)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusCreated, item)
}

func (h *handler) search(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	q := r.URL.Query().Get("q")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	hits, err := h.searchDocs(r.Context(), p.OrgID, q, limit)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"hits": hits})
}

func (h *handler) answer(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body struct {
		Query string `json:"query"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	ans, hits, err := h.ragAnswer(r.Context(), p.OrgID, body.Query)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"answer": ans, "sources": hits})
}

func (h *handler) searchDocs(ctx context.Context, orgID, query string, limit int) ([]models.RagSearchHit, error) {
	hits, err := h.db.SearchRagDocuments(ctx, orgID, query, limit)
	if err != nil {
		return nil, err
	}
	if len(hits) > 0 {
		return hits, nil
	}
	docs, _ := h.db.ListRagDocuments(ctx, orgID)
	return ragsvc.FallbackSearchWhenEmpty(ctx, h.cfg, h.ai, query, docs), nil
}

func (h *handler) ragAnswer(ctx context.Context, orgID, query string) (string, []models.RagSearchHit, error) {
	hits, err := h.searchDocs(ctx, orgID, query, 5)
	if err != nil {
		return "", nil, err
	}
	docs, _ := h.db.ListRagDocuments(ctx, orgID)
	answer := ragsvc.GenerateAnswer(ctx, h.cfg, h.ai, query, hits, docs)
	return answer, hits, nil
}
