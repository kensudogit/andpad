package service

import (
	"context"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

// consultScope resolves tenant (org) and user for chat isolation.
// OWNER/ADMIN can list/view all threads within their organization.
func (s *Service) consultScope(ctx context.Context) (orgID, userID string, orgWide bool, err error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return "", "", false, err
	}
	orgWide = p.Role == string(models.RoleOwner) || p.Role == string(models.RoleAdmin)
	return p.OrgID, p.UserID, orgWide, nil
}

func consultOrgWide(p tenant.Principal) bool {
	return p.Role == string(models.RoleOwner) || p.Role == string(models.RoleAdmin)
}
