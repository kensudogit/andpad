package crm

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/pluszero/dental-video-api/internal/microsvc/base"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
)

func Register(d *runtime.Deps) {
	h := &handler{db: d.DB}
	d.Router.Get("/contacts", h.listContacts)
	d.Router.Post("/contacts", h.createContact)
	d.Router.Get("/contacts/{id}/interactions", h.listInteractions)
	d.Router.Post("/contacts/{id}/interactions", h.createInteraction)
}

type handler struct {
	db *postgres.DB
}

func (h *handler) listContacts(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	list, err := h.db.ListCrmContacts(r.Context(), p.OrgID)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"contacts": list})
}

func (h *handler) createContact(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body models.CrmContactInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.db.CreateCrmContact(r.Context(), p.OrgID, body)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusCreated, item)
}

func (h *handler) listInteractions(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	id := chi.URLParam(r, "id")
	list, err := h.db.ListCrmInteractions(r.Context(), p.OrgID, id)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"interactions": list})
}

func (h *handler) createInteraction(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	id := chi.URLParam(r, "id")
	var body struct {
		Kind    string `json:"kind"`
		Summary string `json:"summary"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.db.CreateCrmInteraction(r.Context(), p.OrgID, id, body.Kind, body.Summary)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusCreated, item)
}
