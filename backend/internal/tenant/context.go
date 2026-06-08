// Package tenant はリクエストごとの認証済み Principal（組織・ユーザー）を context に載せる。
package tenant

import "context"

type ctxKey int

const principalKey ctxKey = 1
const forwardAuthKey ctxKey = 2

// ForwardAuth holds inbound auth headers for gateway → microservice propagation.
type ForwardAuth struct {
	Authorization string
	Cookie        string
	APIKey        string
}

func WithForwardAuth(ctx context.Context, authorization, cookie, apiKey string) context.Context {
	return context.WithValue(ctx, forwardAuthKey, ForwardAuth{
		Authorization: authorization,
		Cookie:        cookie,
		APIKey:        apiKey,
	})
}

func ForwardAuthFrom(ctx context.Context) ForwardAuth {
	if v, ok := ctx.Value(forwardAuthKey).(ForwardAuth); ok {
		return v
	}
	return ForwardAuth{}
}

// Principal はマルチテナント SaaS の現在操作主体。
type Principal struct {
	UserID string
	OrgID  string
	Role   string
	Email  string
	Name   string
	AuthVia string // jwt | api_key
}

func WithPrincipal(ctx context.Context, p Principal) context.Context {
	return context.WithValue(ctx, principalKey, p)
}

func PrincipalFrom(ctx context.Context) (Principal, bool) {
	p, ok := ctx.Value(principalKey).(Principal)
	return p, ok
}

func MustOrgID(ctx context.Context) (string, error) {
	p, ok := PrincipalFrom(ctx)
	if !ok || p.OrgID == "" {
		return "", ErrUnauthorized
	}
	return p.OrgID, nil
}

func MustUserID(ctx context.Context) (string, error) {
	p, ok := PrincipalFrom(ctx)
	if !ok || p.UserID == "" {
		return "", ErrUnauthorized
	}
	return p.UserID, nil
}
