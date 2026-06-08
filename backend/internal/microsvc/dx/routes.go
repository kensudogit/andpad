package dx

import (
	"encoding/json"
	"net/http"

	"github.com/pluszero/dental-video-api/internal/microsvc/base"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
)

// Register mounts DX microservice routes.
func Register(d *runtime.Deps) {
	h := &handler{db: d.DB}
	d.Router.Get("/initiatives", h.list)
	d.Router.Post("/initiatives", h.create)
}

type handler struct {
	db *postgres.DB
}

func (h *handler) list(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	list, err := h.db.ListDxInitiatives(r.Context(), p.OrgID)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"initiatives": list})
}

func (h *handler) create(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body models.DxInitiativeInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.db.CreateDxInitiative(r.Context(), p.OrgID, body)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusCreated, item)
}
