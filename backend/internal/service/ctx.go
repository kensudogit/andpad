package service

// テナント ID・認証済み Principal の解決（マルチテナント SaaS の要）

import (
	"context"
	"time"

	"github.com/pluszero/dental-video-api/internal/auth"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

const (
	demoOrgID  = "org_demo"
	demoUserID = "user_demo"
)

// OrgID は JWT から組織 ID を得る。未ログイン時はデモ組織へフォールバック（カタログ閲覧用）。
func (s *Service) OrgID(ctx context.Context) (string, error) {
	if p, ok := tenant.PrincipalFrom(ctx); ok && p.OrgID != "" {
		return p.OrgID, nil
	}
	if s.Memory != nil {
		return "org_memory", nil
	}
	if s.PG != nil {
		// Anonymous catalog reads use seeded demo tenant (same as in-memory dev mode).
		return demoOrgID, nil
	}
	return "", tenant.ErrUnauthorized
}

// UserID は学習者 ID。未認証でも Postgres デモユーザーとして進捗 API を試せる。
func (s *Service) UserID(ctx context.Context) (string, error) {
	if p, ok := tenant.PrincipalFrom(ctx); ok && p.UserID != "" {
		return p.UserID, nil
	}
	if s.Memory != nil {
		return "learner-demo", nil
	}
	if s.PG != nil {
		return demoUserID, nil
	}
	return "", tenant.ErrUnauthorized
}

func (s *Service) requireAuth(ctx context.Context) (tenant.Principal, error) {
	p, ok := tenant.PrincipalFrom(ctx)
	if !ok || p.AuthVia == "" {
		return tenant.Principal{}, tenant.ErrUnauthorized
	}
	return p, nil
}

func (s *Service) APIKeyLookup(prefix, secret string) (tenant.Principal, bool) {
	if s.PG == nil {
		return tenant.Principal{}, false
	}
	uid, oid, role, email, name, ok := s.PG.LookupAPIKey(context.Background(), prefix, secret)
	if !ok {
		return tenant.Principal{}, false
	}
	return tenant.Principal{UserID: uid, OrgID: oid, Role: role, Email: email, Name: name, AuthVia: "api_key"}, true
}

// Login は資格情報検証後に JWT 付き AuthPayload を返す。
func (s *Service) Login(ctx context.Context, email, password string) (models.AuthPayload, error) {
	if s.PG == nil {
		return s.memoryDemoLogin(email, password)
	}
	u, org, role, err := s.PG.Login(ctx, email, password)
	if err != nil {
		return models.AuthPayload{}, err
	}
	token, err := auth.IssueToken(s.Cfg.JWTSecret, time.Duration(s.Cfg.TokenTTLHours)*time.Hour, u.ID, org.ID, string(role), u.Email, u.Name)
	if err != nil {
		return models.AuthPayload{}, err
	}
	return models.AuthPayload{Token: token, Session: models.Session{User: u, Organization: org, Role: role}}, nil
}

// RegisterClinic は新規クリニックテナントとオーナーを作成し即ログイン可能にする。
func (s *Service) RegisterClinic(ctx context.Context, in postgres.RegisterInput) (models.AuthPayload, error) {
	if s.PG == nil {
		return models.AuthPayload{}, tenant.ErrUnauthorized
	}
	u, org, err := s.PG.RegisterClinic(ctx, in)
	if err != nil {
		return models.AuthPayload{}, err
	}
	token, err := auth.IssueToken(s.Cfg.JWTSecret, time.Duration(s.Cfg.TokenTTLHours)*time.Hour, u.ID, org.ID, string(models.RoleOwner), u.Email, u.Name)
	if err != nil {
		return models.AuthPayload{}, err
	}
	return models.AuthPayload{Token: token, Session: models.Session{User: u, Organization: org, Role: models.RoleOwner}}, nil
}

func (s *Service) CurrentSession(ctx context.Context) (*models.Session, error) {
	if s.Memory != nil {
		p, ok := tenant.PrincipalFrom(ctx)
		if !ok || p.AuthVia == "" {
			return nil, nil
		}
		sess := memoryDemoSession()
		sess.User.ID = p.UserID
		sess.User.Email = p.Email
		sess.User.Name = p.Name
		sess.Organization.ID = p.OrgID
		if p.Role != "" {
			sess.Role = models.MemberRole(p.Role)
		}
		return &sess, nil
	}
	if s.PG == nil {
		return nil, nil
	}
	uid, err := s.UserID(ctx)
	if err != nil {
		return nil, nil
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return nil, nil
	}
	sess, err := s.PG.SessionByUser(ctx, uid, oid)
	if err != nil {
		return nil, err
	}
	if mc, err := s.PG.MemberCount(ctx, oid); err == nil {
		sess.Organization.MemberCount = mc
	}
	return &sess, nil
}
