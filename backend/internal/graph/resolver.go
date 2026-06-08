package graph

import "github.com/pluszero/dental-video-api/internal/service"

// Resolver は gqlgen のルートリゾルバ（ビジネスロジックは service 層へ委譲）。
type Resolver struct {
	svc     *service.Service
	loaders *Loaders
}

func NewResolver(svc *service.Service) *Resolver {
	return &Resolver{svc: svc, loaders: NewLoaders(svc)}
}
