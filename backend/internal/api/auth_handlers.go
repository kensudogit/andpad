package api

// クリニック向け SaaS のログイン・新規登録・Cookie セッション

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/pluszero/dental-video-api/internal/service"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

// AuthHandler は JWT を Cookie に載せる従来型 REST 認証を担当する。
type AuthHandler struct {
	svc *service.Service
}

// Login はメール/パスワードで認証し、dv_token Cookie と JSON を返す。
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	// Railway 上の初回 DB 接続遅延でハングしないよう上限を設ける
	ctx, cancel := context.WithTimeout(r.Context(), 12*time.Second)
	defer cancel()
	payload, err := h.svc.Login(ctx, body.Email, body.Password)
	if err != nil {
		switch {
		case errors.Is(err, postgres.ErrInvalidCredentials):
			writeError(w, http.StatusUnauthorized, "invalid credentials")
		case errors.Is(err, tenant.ErrUnauthorized):
			writeError(w, http.StatusUnauthorized, "invalid credentials")
		case errors.Is(err, context.DeadlineExceeded):
			writeError(w, http.StatusGatewayTimeout, "login timed out — check DATABASE_URL")
		default:
			writeError(w, http.StatusInternalServerError, "login failed")
		}
		return
	}
	setTokenCookie(w, r, payload.Token)
	writeJSON(w, http.StatusOK, map[string]any{"token": payload.Token, "session": payload.Session})
}

// Register は新規クリニック（組織）とオーナーアカウントを同時作成する。
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ClinicName string `json:"clinicName"`
		Slug       string `json:"slug"`
		OwnerName  string `json:"ownerName"`
		Email      string `json:"email"`
		Password   string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	payload, err := h.svc.RegisterClinic(r.Context(), postgres.RegisterInput{
		ClinicName: body.ClinicName, Slug: body.Slug, OwnerName: body.OwnerName,
		Email: body.Email, Password: body.Password,
	})
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	setTokenCookie(w, r, payload.Token)
	writeJSON(w, http.StatusOK, map[string]any{"token": payload.Token, "session": payload.Session})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	clearTokenCookie(w, r)
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// cookieSecure はリバースプロキシ経由の HTTPS を考慮して Secure 属性を決める。
func cookieSecure(r *http.Request) bool {
	if r.TLS != nil {
		return true
	}
	return r.Header.Get("X-Forwarded-Proto") == "https"
}

// setTokenCookie はブラウザが GraphQL と共有できる HttpOnly セッションを設定する。
func setTokenCookie(w http.ResponseWriter, r *http.Request, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "dv_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   cookieSecure(r),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int((72 * time.Hour).Seconds()),
	})
}

func clearTokenCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "dv_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   cookieSecure(r),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]any{"error": msg})
}
