package api

// （api パッケージの一部）公開用の軽量 REST ハンドラ（ヘルス・ステータス）

import (
	"encoding/json"
	"net/http"

	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/service"
)

// Handler は DB/S3 等の稼働状況を返す補助エンドポイント用。
type Handler struct {
	svc *service.Service
}

// NewHandler はサービスを注入した Handler を返す。
func NewHandler(svc *service.Service) *Handler {
	return &Handler{svc: svc}
}

// Health はロードバランサ・監視向けの生存確認。
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, models.HealthResponse{
		OK: true, Service: "dental-video-api", Version: "2.0.0-saas",
	})
}

func (h *Handler) Root(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"service": "dental-video-api",
		"message": "Dental video learning SaaS API. GraphQL at /graphql",
		"links": map[string]string{
			"health": "/health", "graphql": "/graphql", "authLogin": "/auth/login",
		},
	})
}

// Status は Postgres/S3/OpenAI の接続可否とセットアップヒントを返す（運用デバッグ用）。
func (h *Handler) Status(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"service":  "dental-video-api",
		"ok":       true,
		"postgres": h.svc.UsePostgres(),
		"s3":       h.svc.S3 != nil,
		"openai":   h.svc.OpenAI != nil,
		"setup":    config.SetupStatus(h.svc.UsePostgres(), h.svc.Cfg.DatabaseSource),
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
