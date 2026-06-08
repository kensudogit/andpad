package attendance

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/pluszero/dental-video-api/internal/microsvc/base"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func Register(d *runtime.Deps) {
	h := &handler{db: d.DB}
	d.Router.Get("/records", h.listRecords)
	d.Router.Post("/clock-in", h.clockIn)
	d.Router.Post("/clock-out", h.clockOut)
	d.Router.Get("/leave", h.listLeave)
	d.Router.Post("/leave", h.createLeave)
	d.Router.Post("/leave/{id}/approve", h.approveLeave)
}

type handler struct {
	db *postgres.DB
}

func (h *handler) listRecords(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	list, err := h.db.ListAttendanceRecords(r.Context(), p.OrgID, p.UserID, 40)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"records": list})
}

func (h *handler) clockIn(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body struct {
		Note string `json:"note"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if open, has, err := h.db.OpenAttendanceClock(r.Context(), p.OrgID, p.UserID); err != nil {
		base.WriteSvcErr(w, err)
		return
	} else if has {
		base.WriteJSON(w, http.StatusOK, open)
		return
	}
	item, err := h.db.ClockIn(r.Context(), p.OrgID, p.UserID, body.Note)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, item)
}

func (h *handler) clockOut(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	open, has, err := h.db.OpenAttendanceClock(r.Context(), p.OrgID, p.UserID)
	if base.WriteSvcErr(w, err) {
		return
	}
	if !has {
		base.WriteSvcErr(w, tenant.ErrForbidden)
		return
	}
	item, err := h.db.ClockOut(r.Context(), p.OrgID, open.ID)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, item)
}

func (h *handler) listLeave(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	list, err := h.db.ListLeaveRequests(r.Context(), p.OrgID)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"requests": list})
}

func (h *handler) createLeave(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body struct {
		StartDate string `json:"startDate"`
		EndDate   string `json:"endDate"`
		Reason    string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	start, err := time.Parse("2006-01-02", body.StartDate)
	if err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid startDate")
		return
	}
	end, err := time.Parse("2006-01-02", body.EndDate)
	if err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid endDate")
		return
	}
	item, err := h.db.CreateLeaveRequest(r.Context(), p.OrgID, p.UserID, start, end, body.Reason)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusCreated, item)
}

func (h *handler) approveLeave(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	if p.Role != string(models.RoleOwner) && p.Role != string(models.RoleAdmin) {
		base.WriteSvcErr(w, tenant.ErrForbidden)
		return
	}
	id := chi.URLParam(r, "id")
	item, err := h.db.UpdateLeaveStatus(r.Context(), p.OrgID, id, "APPROVED")
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, item)
}
