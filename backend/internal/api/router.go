// Package api は REST エンドポイントと GraphQL の HTTP ルーティングを提供する。
package api

import (
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/pluszero/dental-video-api/internal/auth"
	"github.com/pluszero/dental-video-api/internal/graph"
	"github.com/pluszero/dental-video-api/internal/service"
)

// NewRouter はヘルスチェック・認証・GraphQL を含む chi ルータを組み立てる。
func NewRouter(svc *service.Service) http.Handler {
	h := NewHandler(svc)
	authH := &AuthHandler{svc: svc}
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	origins := svc.Cfg.AllowedOrigins
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   origins,
		// Railway プレビュー URL は CORS_ORIGINS 未登録でも許可（デプロイ先の都合）
		AllowOriginFunc:  func(_ *http.Request, origin string) bool { return strings.Contains(origin, ".railway.app") || origin == "" },
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-API-Key"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", h.Health)
	r.Get("/status", h.Status)
	r.Get("/", h.Root)

	r.Route("/auth", func(r chi.Router) {
		r.Post("/login", authH.Login)
		r.Post("/register", authH.Register)
		r.Post("/logout", authH.Logout)
	})

	if err := graph.RegisterRoutes(r, svc); err != nil {
		log.Fatalf("graphql: %v", err)
	}

	saasH := &SaasHandler{svc: svc}
	r.Route("/api/saas", func(r chi.Router) {
		r.Use(auth.Middleware(svc.Cfg.JWTSecret, svc.APIKeyLookup))
		saasH.Routes(r)
	})

	return r
}
