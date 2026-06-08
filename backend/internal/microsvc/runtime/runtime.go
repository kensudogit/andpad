package runtime

import (
	"context"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/pluszero/dental-video-api/internal/auth"
	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/microsvc/base"
	"github.com/pluszero/dental-video-api/internal/openai"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

// Deps holds shared dependencies for a SaaS microservice.
type Deps struct {
	Cfg    config.Config
	DB     *postgres.DB
	OpenAI *openai.Client
	Router chi.Router
}

// RegisterFn mounts service routes on an authenticated sub-router.
type RegisterFn func(d *Deps)

// Run starts a SaaS microservice HTTP server.
func Run(serviceName string, defaultPort string, register RegisterFn) {
	cfg := config.Load()
	if cfg.Port == "8080" && defaultPort != "" {
		cfg.Port = defaultPort
	}
	if cfg.DatabaseURL == "" {
		log.Fatalf("[%s] DATABASE_URL required", serviceName)
	}
	db, err := postgres.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("[%s] db: %v", serviceName, err)
	}
	defer db.Close()
	if err := db.Migrate(); err != nil {
		log.Fatalf("[%s] migrate: %v", serviceName, err)
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-API-Key"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		base.WriteJSON(w, http.StatusOK, map[string]any{
			"ok": true, "service": serviceName, "role": "microservice",
		})
	})

	apiKeyLookup := func(prefix, secret string) (tenant.Principal, bool) {
		uid, oid, role, email, name, ok := db.LookupAPIKey(context.Background(), prefix, secret)
		if !ok {
			return tenant.Principal{}, false
		}
		return tenant.Principal{
			UserID: uid, OrgID: oid, Role: role, Email: email, Name: name, AuthVia: "api_key",
		}, true
	}

	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(cfg.JWTSecret, apiKeyLookup))
		d := &Deps{Cfg: cfg, DB: db, OpenAI: openai.New(cfg), Router: r}
		register(d)
	})

	addr := ":" + cfg.Port
	log.Printf("[%s] listening %s", serviceName, addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatal(err)
	}
}
