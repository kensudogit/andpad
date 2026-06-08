package base

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/pluszero/dental-video-api/internal/tenant"
)

func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func WriteError(w http.ResponseWriter, status int, msg string) {
	WriteJSON(w, status, map[string]string{"error": msg})
}

func WriteSvcErr(w http.ResponseWriter, err error) bool {
	if err == nil {
		return false
	}
	switch {
	case errors.Is(err, tenant.ErrUnauthorized):
		WriteError(w, http.StatusUnauthorized, "login required")
	case errors.Is(err, tenant.ErrForbidden):
		WriteError(w, http.StatusForbidden, "forbidden")
	default:
		WriteError(w, http.StatusInternalServerError, err.Error())
	}
	return true
}
