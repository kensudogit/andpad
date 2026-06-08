package postgres

// ログイン・クリニック新規登録・API キー認証

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/auth"
	"github.com/pluszero/dental-video-api/internal/models"
)

// ErrInvalidCredentials はメール未登録・パスワード不一致をまとめて返す（情報漏えい防止）。
var ErrInvalidCredentials = errors.New("invalid credentials")

// Login は最初に参加した組織のロール付きでセッション情報を組み立てる。
func (db *DB) Login(ctx context.Context, email, password string) (models.User, models.Organization, models.MemberRole, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	var u models.User
	var hash string
	err := db.Pool.QueryRow(ctx, `
		SELECT id, email, name, COALESCE(avatar_url,''), password_hash FROM users WHERE LOWER(email)=$1`, email).
		Scan(&u.ID, &u.Email, &u.Name, &u.AvatarURL, &hash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.User{}, models.Organization{}, "", ErrInvalidCredentials
		}
		return models.User{}, models.Organization{}, "", err
	}
	if !auth.CheckPassword(hash, password) {
		return models.User{}, models.Organization{}, "", ErrInvalidCredentials
	}
	var org models.Organization
	var role models.MemberRole
	err = db.Pool.QueryRow(ctx, `
		SELECT o.id, o.name, o.slug, o.plan_tier, o.subscription_status, o.seat_count, o.timezone, o.created_at, tm.role
		FROM team_members tm
		JOIN organizations o ON o.id = tm.org_id
		WHERE tm.user_id = $1
		ORDER BY tm.joined_at ASC LIMIT 1`, u.ID).
		Scan(&org.ID, &org.Name, &org.Slug, &org.PlanTier, &org.SubscriptionStatus, &org.SeatCount, &org.Timezone, &org.CreatedAt, &role)
	if err != nil {
		return models.User{}, models.Organization{}, "", err
	}
	_, _ = db.Pool.Exec(ctx, `UPDATE team_members SET last_active_at=NOW() WHERE user_id=$1 AND org_id=$2`, u.ID, org.ID)
	return u, org, role, nil
}

// RegisterInput は新規クリニック SaaS テナント作成時の入力。
type RegisterInput struct {
	ClinicName string
	Slug       string
	OwnerName  string
	Email      string
	Password   string
}

// RegisterClinic は組織・オーナー・利用カウンタを同一トランザクションで作成する。
func (db *DB) RegisterClinic(ctx context.Context, in RegisterInput) (models.User, models.Organization, error) {
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))
	in.Slug = strings.ToLower(strings.TrimSpace(in.Slug))
	if in.Slug == "" {
		in.Slug = fmt.Sprintf("clinic-%d", time.Now().Unix())
	}
	hash, err := auth.HashPassword(in.Password)
	if err != nil {
		return models.User{}, models.Organization{}, err
	}
	orgID := "org_" + randomID()
	userID := "user_" + randomID()
	tmID := "tm_" + randomID()
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return models.User{}, models.Organization{}, err
	}
	defer tx.Rollback(ctx)
	now := time.Now()
	_, err = tx.Exec(ctx, `
		INSERT INTO organizations (id, name, slug, plan_tier, subscription_status, seat_count)
		VALUES ($1,$2,$3,'STARTER','TRIALING',5)`, orgID, in.ClinicName, in.Slug)
	if err != nil {
		return models.User{}, models.Organization{}, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO users (id, email, name, password_hash) VALUES ($1,$2,$3,$4)`,
		userID, in.Email, in.OwnerName, hash)
	if err != nil {
		return models.User{}, models.Organization{}, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO team_members (id, org_id, user_id, role) VALUES ($1,$2,$3,'OWNER')`, tmID, orgID, userID)
	if err != nil {
		return models.User{}, models.Organization{}, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO usage_counters (org_id) VALUES ($1)`, orgID)
	if err != nil {
		return models.User{}, models.Organization{}, err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO org_modules (org_id, module_code, enabled)
		SELECT $1, code, TRUE FROM saas_modules`, orgID)
	if err != nil {
		return models.User{}, models.Organization{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return models.User{}, models.Organization{}, err
	}
	org := models.Organization{
		ID: orgID, Name: in.ClinicName, Slug: in.Slug,
		PlanTier: models.PlanStarter, SubscriptionStatus: models.SubTrialing,
		SeatCount: 5, Timezone: "Asia/Tokyo", CreatedAt: now,
	}
	user := models.User{ID: userID, Email: in.Email, Name: in.OwnerName}
	return user, org, nil
}

func (db *DB) LookupAPIKey(ctx context.Context, prefix, secret string) (userID, orgID, role, email, name string, ok bool) {
	var hash string
	var keyID string
	err := db.Pool.QueryRow(ctx, `
		SELECT id, org_id, secret_hash FROM api_keys
		WHERE prefix=$1 AND revoked_at IS NULL`, prefix).Scan(&keyID, &orgID, &hash)
	if err != nil {
		return "", "", "", "", "", false
	}
	if !auth.CheckPassword(hash, secret) {
		return "", "", "", "", "", false
	}
	_, _ = db.Pool.Exec(ctx, `UPDATE api_keys SET last_used_at=NOW() WHERE id=$1`, keyID)
	err = db.Pool.QueryRow(ctx, `
		SELECT u.id, u.email, u.name, tm.role FROM team_members tm
		JOIN users u ON u.id = tm.user_id
		WHERE tm.org_id=$1 AND tm.role IN ('OWNER','ADMIN')
		ORDER BY tm.joined_at LIMIT 1`, orgID).Scan(&userID, &email, &name, &role)
	if err != nil {
		role = "ADMIN"
		userID = "api_" + keyID
		email = "api-key@" + orgID
		name = "API Key"
		ok = true
		return
	}
	ok = true
	return
}

func randomID() string {
	return fmt.Sprintf("%x", time.Now().UnixNano())
}
