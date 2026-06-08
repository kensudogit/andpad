package base

import (
	"context"

	"github.com/pluszero/dental-video-api/internal/tenant"
)

func RequireAuth(ctx context.Context) (tenant.Principal, error) {
	p, ok := tenant.PrincipalFrom(ctx)
	if !ok || p.AuthVia == "" {
		return tenant.Principal{}, tenant.ErrUnauthorized
	}
	return p, nil
}
