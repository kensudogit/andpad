// Package graph は gqlgen サーバ・認証ミドルウェア・GraphiQL の HTTP 登録を行う。
package graph

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
	"github.com/pluszero/dental-video-api/internal/auth"
	"github.com/pluszero/dental-video-api/internal/graph/generated"
	"github.com/pluszero/dental-video-api/internal/service"
)

// RegisterRoutes は /graphql と /graphiql を chi ルータにマウントする。
func RegisterRoutes(r chi.Router, svc *service.Service) error {
	resolver := NewResolver(svc)
	srv := handler.New(generated.NewExecutableSchema(generated.Config{Resolvers: resolver}))

	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				origin := r.Header.Get("Origin")
				if origin == "" {
					return true
				}
				lower := strings.ToLower(origin)
				if strings.HasPrefix(lower, "http://localhost:") ||
					strings.HasPrefix(lower, "http://127.0.0.1:") ||
					strings.HasSuffix(lower, ".up.railway.app") {
					return true
				}
				for _, allowed := range strings.Split(strings.TrimSpace(os.Getenv("CORS_ORIGINS")), ",") {
					if strings.TrimSpace(allowed) == origin {
						return true
					}
				}
				return false
			},
		},
	})
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.Use(extension.Introspection{})

	// 認証 → DataLoader の順でコンテキストを enrich
	authed := auth.Middleware(svc.Cfg.JWTSecret, svc.APIKeyLookup)(resolver.loaders.Middleware(srv))
	r.Handle("/graphql", authed)
	r.Handle("/graphiql", playground.Handler("Dental Video GraphQL", "/graphql"))
	return nil
}

// NewHTTPHandler is kept for compatibility; mounts GraphQL + GraphiQL on a fresh mux.
func NewHTTPHandler(svc *service.Service) (http.Handler, error) {
	mux := chi.NewRouter()
	if err := RegisterRoutes(mux, svc); err != nil {
		return nil, err
	}
	return mux, nil
}
