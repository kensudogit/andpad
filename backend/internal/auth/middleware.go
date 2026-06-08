package auth

// GraphQL/REST 共通の認証コンテキスト注入

import (
	"context"
	"net/http"
	"strings"

	"github.com/pluszero/dental-video-api/internal/tenant"
)

// APIKeyLookup はライブ配信等のサーバー間連携用 API キーを組織に紐づける。
type APIKeyLookup func(prefix, secret string) (tenant.Principal, bool)

// Middleware は Authorization Bearer、dv_token Cookie、X-API-Key の順で Principal を解決する。
func Middleware(secret string, lookup APIKeyLookup) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			if auth := r.Header.Get("Authorization"); auth != "" {
				if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
					token := strings.TrimSpace(auth[7:])
					if claims, err := ParseToken(secret, token); err == nil {
						ctx = tenant.WithPrincipal(ctx, tenant.Principal{
							UserID:  claims.UserID,
							OrgID:   claims.OrgID,
							Role:    claims.Role,
							Email:   claims.Email,
							Name:    claims.Name,
							AuthVia: "jwt",
						})
					}
				}
			}
			if cookie, err := r.Cookie("dv_token"); err == nil && cookie.Value != "" {
				if claims, err := ParseToken(secret, cookie.Value); err == nil {
					ctx = tenant.WithPrincipal(ctx, tenant.Principal{
						UserID:  claims.UserID,
						OrgID:   claims.OrgID,
						Role:    claims.Role,
						Email:   claims.Email,
						Name:    claims.Name,
						AuthVia: "jwt",
					})
				}
			}
			if lookup != nil {
				if key := strings.TrimSpace(r.Header.Get("X-API-Key")); key != "" {
					const prefix = "dv_live_" // プレフィックスで本番キーと他用途を区別
					if strings.HasPrefix(key, prefix) {
						if p, ok := lookup(prefix, strings.TrimPrefix(key, prefix)); ok {
							ctx = tenant.WithPrincipal(ctx, p)
						}
					}
				}
			}
			ctx = tenant.WithForwardAuth(ctx, r.Header.Get("Authorization"), r.Header.Get("Cookie"), r.Header.Get("X-API-Key"))
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func ContextWithPrincipal(ctx context.Context, p tenant.Principal) context.Context {
	return tenant.WithPrincipal(ctx, p)
}
