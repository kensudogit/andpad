package postgres

// AI 臨床相談スレッドと月次トークン利用量

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func (db *DB) ListConsultThreads(ctx context.Context, orgID, userID string, orgWide bool) ([]models.ConsultationThread, error) {
	var (
		rows pgx.Rows
		err  error
	)
	if orgWide {
		rows, err = db.Pool.Query(ctx, `
			SELECT id, org_id, user_id, title, created_at
			FROM consultation_threads WHERE org_id=$1 ORDER BY created_at DESC`, orgID)
	} else {
		rows, err = db.Pool.Query(ctx, `
			SELECT id, org_id, user_id, title, created_at
			FROM consultation_threads WHERE org_id=$1 AND user_id=$2 ORDER BY created_at DESC`, orgID, userID)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.ConsultationThread
	for rows.Next() {
		var t models.ConsultationThread
		if err := rows.Scan(&t.ID, &t.OrgID, &t.UserID, &t.Title, &t.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}

func (db *DB) GetConsultThread(ctx context.Context, orgID, userID, threadID string, orgWide bool) (models.ConsultationThread, []models.ConsultationMessage, error) {
	var t models.ConsultationThread
	var err error
	if orgWide {
		err = db.Pool.QueryRow(ctx, `
			SELECT id, org_id, user_id, title, created_at FROM consultation_threads WHERE org_id=$1 AND id=$2`,
			orgID, threadID).Scan(&t.ID, &t.OrgID, &t.UserID, &t.Title, &t.CreatedAt)
	} else {
		err = db.Pool.QueryRow(ctx, `
			SELECT id, org_id, user_id, title, created_at FROM consultation_threads WHERE org_id=$1 AND user_id=$2 AND id=$3`,
			orgID, userID, threadID).Scan(&t.ID, &t.OrgID, &t.UserID, &t.Title, &t.CreatedAt)
	}
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return t, nil, tenant.ErrForbidden
		}
		return t, nil, err
	}
	rows, err := db.Pool.Query(ctx, `
		SELECT id, thread_id, role, content, created_at FROM consultation_messages
		WHERE org_id=$1 AND thread_id=$2 ORDER BY created_at ASC`, orgID, threadID)
	if err != nil {
		return t, nil, err
	}
	defer rows.Close()
	var msgs []models.ConsultationMessage
	for rows.Next() {
		var m models.ConsultationMessage
		if err := rows.Scan(&m.ID, &m.ThreadID, &m.Role, &m.Content, &m.CreatedAt); err != nil {
			return t, nil, err
		}
		msgs = append(msgs, m)
	}
	return t, msgs, rows.Err()
}

// VerifyConsultThreadAccess ensures the thread belongs to the tenant and user before posting.
func (db *DB) VerifyConsultThreadAccess(ctx context.Context, orgID, userID, threadID string) error {
	var exists bool
	err := db.Pool.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM consultation_threads WHERE id=$1 AND org_id=$2 AND user_id=$3
		)`, threadID, orgID, userID).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return tenant.ErrForbidden
	}
	return nil
}

func (db *DB) CreateConsultThread(ctx context.Context, orgID, userID, title string) (models.ConsultationThread, error) {
	t := models.ConsultationThread{
		ID: "ct_" + randomID(), OrgID: orgID, UserID: userID, Title: title, CreatedAt: time.Now(),
	}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO consultation_threads (id, org_id, user_id, title) VALUES ($1,$2,$3,$4)`,
		t.ID, t.OrgID, t.UserID, t.Title)
	return t, err
}

func (db *DB) AddConsultMessage(ctx context.Context, orgID, threadID, role, content string) (models.ConsultationMessage, error) {
	m := models.ConsultationMessage{
		ID: "cm_" + randomID(), ThreadID: threadID, Role: role, Content: content, CreatedAt: time.Now(),
	}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO consultation_messages (id, org_id, thread_id, role, content) VALUES ($1,$2,$3,$4,$5)`,
		m.ID, orgID, threadID, role, content)
	return m, err
}

func (db *DB) IncrementConsultUsage(ctx context.Context, orgID string, tokens int) error {
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO usage_counters (org_id, consult_tokens_month) VALUES ($1, $2)
		ON CONFLICT (org_id) DO UPDATE SET consult_tokens_month = usage_counters.consult_tokens_month + $2`,
		orgID, tokens)
	return err
}
