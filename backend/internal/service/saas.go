package service

// 組織設定・チーム・利用量 — 認証必須の SaaS 管理 API

import (
	"context"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func (s *Service) GetOrganization(ctx context.Context) (models.Organization, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return models.Organization{}, err
	}
	if s.memoryMode() {
		org := memoryDemoSession().Organization
		org.ID = p.OrgID
		return org, nil
	}
	if s.PG == nil {
		return models.Organization{}, tenant.ErrUnauthorized
	}
	o, err := s.PG.GetOrganization(ctx, p.OrgID)
	if err != nil {
		return o, err
	}
	o.MemberCount, _ = s.PG.MemberCount(ctx, p.OrgID)
	return o, nil
}

func (s *Service) UsageSummary(ctx context.Context) (models.UsageSummary, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return models.UsageSummary{}, err
	}
	if s.memoryMode() {
		_ = p
		return models.UsageSummary{
			Members: 1, MembersLimit: 10, Videos: 1, VideosLimit: 50,
			APICallsThisMonth: 0, APICallsLimit: 10000, ConsultTokensMonth: 0,
		}, nil
	}
	if s.PG == nil {
		return models.UsageSummary{}, tenant.ErrUnauthorized
	}
	return s.PG.UsageSummary(ctx, p.OrgID)
}

func (s *Service) ListTeamMembers(ctx context.Context) ([]models.TeamMember, []models.User, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return nil, nil, err
	}
	if s.memoryMode() {
		sess := memoryDemoSession()
		sess.User.ID = p.UserID
		sess.User.Email = p.Email
		sess.User.Name = p.Name
		return []models.TeamMember{{
			ID: "tm_demo", UserID: p.UserID, OrgID: p.OrgID, Role: models.RoleOwner,
		}}, []models.User{sess.User}, nil
	}
	if s.PG == nil {
		return nil, nil, tenant.ErrUnauthorized
	}
	return s.PG.ListTeamMembers(ctx, p.OrgID)
}

func (s *Service) UpdateOrganization(ctx context.Context, patch models.OrganizationPatch) (models.Organization, error) {
	if s.PG == nil {
		return models.Organization{}, tenant.ErrUnauthorized
	}
	p, err := s.requireAuth(ctx)
	if err != nil {
		return models.Organization{}, err
	}
	return s.PG.UpdateOrganization(ctx, p.OrgID, patch)
}
