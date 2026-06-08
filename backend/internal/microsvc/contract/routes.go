package contract

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/pluszero/dental-video-api/internal/microsvc/base"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
)

func Register(d *runtime.Deps) {
	h := &handler{db: d.DB}
	d.Router.Get("/templates", h.listTemplates)
	d.Router.Post("/templates", h.createTemplate)
	d.Router.Get("/contracts", h.listContracts)
	d.Router.Post("/contracts", h.createContract)
	d.Router.Post("/contracts/{id}/sign", h.signContract)
}

type handler struct {
	db *postgres.DB
}

func (h *handler) listTemplates(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	list, err := h.db.ListContractTemplates(r.Context(), p.OrgID)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"templates": list})
}

func (h *handler) createTemplate(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body struct {
		Name string `json:"name"`
		Body string `json:"body"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.db.CreateContractTemplate(r.Context(), p.OrgID, body.Name, body.Body)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusCreated, item)
}

func (h *handler) listContracts(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	list, err := h.db.ListContracts(r.Context(), p.OrgID)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"contracts": list})
}

func (h *handler) createContract(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body struct {
		TemplateID string `json:"templateId"`
		Title      string `json:"title"`
		PartyName  string `json:"partyName"`
		PartyEmail string `json:"partyEmail"`
		Body       string `json:"body"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.db.CreateContract(r.Context(), p.OrgID, body.TemplateID, body.Title, body.PartyName, body.PartyEmail, body.Body)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusCreated, item)
}

func (h *handler) signContract(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	id := chi.URLParam(r, "id")
	item, err := h.db.SignContract(r.Context(), p.OrgID, id)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, item)
}
