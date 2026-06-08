package postgres

// 組織・チーム・API キー・監査ログ・カスタムドメイン解決

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
)

func (db *DB) SessionByUser(ctx context.Context, userID, orgID string) (models.Session, error) {
	var u models.User
	err := db.Pool.QueryRow(ctx, `SELECT id, email, name, COALESCE(avatar_url,'') FROM users WHERE id=$1`, userID).
		Scan(&u.ID, &u.Email, &u.Name, &u.AvatarURL)
	if err != nil {
		return models.Session{}, err
	}
	var o models.Organization
	var role models.MemberRole
	err = db.Pool.QueryRow(ctx, `
		SELECT o.id, o.name, o.slug, o.plan_tier, o.subscription_status, o.seat_count, o.timezone, COALESCE(o.custom_domain,''), o.created_at, tm.role
		FROM organizations o JOIN team_members tm ON tm.org_id=o.id
		WHERE o.id=$1 AND tm.user_id=$2`, orgID, userID).
		Scan(&o.ID, &o.Name, &o.Slug, &o.PlanTier, &o.SubscriptionStatus, &o.SeatCount, &o.Timezone, &o.CustomDomain, &o.CreatedAt, &role)
	if err != nil {
		return models.Session{}, err
	}
	return models.Session{User: u, Organization: o, Role: role}, nil
}

func (db *DB) GetOrganization(ctx context.Context, orgID string) (models.Organization, error) {
	var o models.Organization
	err := db.Pool.QueryRow(ctx, `
		SELECT id, name, slug, plan_tier, subscription_status, seat_count, timezone, COALESCE(custom_domain,''), created_at
		FROM organizations WHERE id=$1`, orgID).
		Scan(&o.ID, &o.Name, &o.Slug, &o.PlanTier, &o.SubscriptionStatus, &o.SeatCount, &o.Timezone, &o.CustomDomain, &o.CreatedAt)
	return o, err
}

func (db *DB) ListTeamMembers(ctx context.Context, orgID string) ([]models.TeamMember, []models.User, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT tm.id, tm.user_id, tm.org_id, tm.role, tm.joined_at, tm.last_active_at,
			u.email, u.name, COALESCE(u.avatar_url,'')
		FROM team_members tm JOIN users u ON u.id=tm.user_id WHERE tm.org_id=$1`, orgID)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()
	var members []models.TeamMember
	var users []models.User
	for rows.Next() {
		var m models.TeamMember
		var u models.User
		if err := rows.Scan(&m.ID, &m.UserID, &m.OrgID, &m.Role, &m.JoinedAt, &m.LastActiveAt, &u.Email, &u.Name, &u.AvatarURL); err != nil {
			return nil, nil, err
		}
		u.ID = m.UserID
		members = append(members, m)
		users = append(users, u)
	}
	return members, users, rows.Err()
}

func (db *DB) MemberCount(ctx context.Context, orgID string) (int, error) {
	var n int
	err := db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM team_members WHERE org_id=$1`, orgID).Scan(&n)
	return n, err
}

func (db *DB) UsageSummary(ctx context.Context, orgID string) (models.UsageSummary, error) {
	var u models.UsageSummary
	u.MembersLimit = 10
	u.VideosLimit = 500
	u.APICallsLimit = 10000
	_ = db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM team_members WHERE org_id=$1`, orgID).Scan(&u.Members)
	_ = db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM videos WHERE org_id=$1`, orgID).Scan(&u.Videos)
	_ = db.Pool.QueryRow(ctx, `
		SELECT COALESCE(api_calls_month,0), COALESCE(consult_tokens_month,0) FROM usage_counters WHERE org_id=$1`, orgID).
		Scan(&u.APICallsThisMonth, &u.ConsultTokensMonth)
	return u, nil
}

func (db *DB) ListAPIKeys(ctx context.Context, orgID string) ([]models.APIKey, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, org_id, name, prefix, secret_hash, last_used_at, created_at, revoked_at
		FROM api_keys WHERE org_id=$1 AND revoked_at IS NULL ORDER BY created_at DESC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var keys []models.APIKey
	for rows.Next() {
		var k models.APIKey
		if err := rows.Scan(&k.ID, &k.OrgID, &k.Name, &k.Prefix, &k.SecretHash, &k.LastUsedAt, &k.CreatedAt, &k.RevokedAt); err != nil {
			return nil, err
		}
		keys = append(keys, k)
	}
	return keys, rows.Err()
}

func (db *DB) CreateAPIKey(ctx context.Context, orgID, name, secret string) (models.APIKeyCreated, error) {
	prefix := "dv_live_"
	hash, err := hashSecret(secret)
	if err != nil {
		return models.APIKeyCreated{}, err
	}
	k := models.APIKey{ID: "key_" + randomID(), OrgID: orgID, Name: name, Prefix: prefix, SecretHash: hash}
	_, err = db.Pool.Exec(ctx, `
		INSERT INTO api_keys (id, org_id, name, prefix, secret_hash) VALUES ($1,$2,$3,$4,$5)`,
		k.ID, k.OrgID, k.Name, k.Prefix, k.SecretHash)
	return models.APIKeyCreated{Key: k, Secret: prefix + secret}, err
}

func hashSecret(secret string) (string, error) {
	return authHash(secret)
}

// avoid import cycle - duplicate thin wrapper in auth package usage
func authHash(secret string) (string, error) {
	return postgresHash(secret)
}

// implemented in saas_hash.go

var ErrNotFound = errors.New("not found")

func (db *DB) RevokeAPIKey(ctx context.Context, orgID, keyID string) error {
	_, err := db.Pool.Exec(ctx, `UPDATE api_keys SET revoked_at=NOW() WHERE org_id=$1 AND id=$2`, orgID, keyID)
	return err
}

func (db *DB) ListAuditLogs(ctx context.Context, orgID string, limit int) ([]models.AuditLogEntry, error) {
	if limit < 1 {
		limit = 20
	}
	rows, err := db.Pool.Query(ctx, `
		SELECT id, org_id, action, resource, actor_name, ip_address, metadata::text, created_at
		FROM audit_logs WHERE org_id=$1 ORDER BY created_at DESC LIMIT $2`, orgID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.AuditLogEntry
	for rows.Next() {
		var e models.AuditLogEntry
		if err := rows.Scan(&e.ID, &e.OrgID, &e.Action, &e.Resource, &e.ActorName, &e.IPAddress, &e.Metadata, &e.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, rows.Err()
}

func (db *DB) AppendAudit(ctx context.Context, e models.AuditLogEntry) error {
	if e.ID == "" {
		e.ID = "log_" + randomID()
	}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO audit_logs (id, org_id, action, resource, actor_name, ip_address, metadata)
		VALUES ($1,$2,$3,$4,$5,$6,$7)`, e.ID, e.OrgID, e.Action, e.Resource, e.ActorName, e.IPAddress, e.Metadata)
	return err
}

// ResolveOrgByHost はカスタムドメインまたは slug から組織 ID を解決する（テナント分離）。
func (db *DB) ResolveOrgByHost(ctx context.Context, host string) (string, error) {
	var id string
	err := db.Pool.QueryRow(ctx, `
		SELECT id FROM organizations WHERE custom_domain=$1 OR slug=$2 LIMIT 1`, host, host).Scan(&id)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNotFound
	}
	return id, err
}
