package postgres

// ライブ配信セッションと症例ディスカッション掲示板

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
)

func (db *DB) ListLiveSessions(ctx context.Context, orgID string) ([]models.LiveSession, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, org_id, host_user_id, title, description, scheduled_at, status, stream_url, created_at
		FROM live_sessions WHERE org_id=$1 ORDER BY scheduled_at ASC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.LiveSession
	for rows.Next() {
		var s models.LiveSession
		if err := rows.Scan(&s.ID, &s.OrgID, &s.HostUserID, &s.Title, &s.Description, &s.ScheduledAt, &s.Status, &s.StreamURL, &s.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

func (db *DB) CreateLiveSession(ctx context.Context, orgID, hostID, title, desc string, at time.Time, streamURL string) (models.LiveSession, error) {
	s := models.LiveSession{
		ID: "live_" + randomID(), OrgID: orgID, HostUserID: hostID,
		Title: title, Description: desc, ScheduledAt: at, Status: "SCHEDULED",
		StreamURL: streamURL, CreatedAt: time.Now(),
	}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO live_sessions (id, org_id, host_user_id, title, description, scheduled_at, status, stream_url)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		s.ID, s.OrgID, s.HostUserID, s.Title, s.Description, s.ScheduledAt, s.Status, s.StreamURL)
	return s, err
}

func (db *DB) ListCaseDiscussions(ctx context.Context, orgID string) ([]models.CaseDiscussion, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT d.id, d.org_id, d.author_user_id, d.title, d.summary, d.status, d.created_at,
			(SELECT COUNT(*) FROM case_discussion_posts p WHERE p.discussion_id=d.id)
		FROM case_discussions d WHERE d.org_id=$1 ORDER BY d.created_at DESC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.CaseDiscussion
	for rows.Next() {
		var d models.CaseDiscussion
		if err := rows.Scan(&d.ID, &d.OrgID, &d.AuthorUserID, &d.Title, &d.Summary, &d.Status, &d.CreatedAt, &d.PostCount); err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	return out, rows.Err()
}

func (db *DB) CreateCaseDiscussion(ctx context.Context, orgID, authorID, title, summary string) (models.CaseDiscussion, error) {
	d := models.CaseDiscussion{
		ID: "case_" + randomID(), OrgID: orgID, AuthorUserID: authorID,
		Title: title, Summary: summary, Status: "OPEN", CreatedAt: time.Now(),
	}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO case_discussions (id, org_id, author_user_id, title, summary, status)
		VALUES ($1,$2,$3,$4,$5,$6)`, d.ID, d.OrgID, d.AuthorUserID, d.Title, d.Summary, d.Status)
	return d, err
}

func (db *DB) AddCasePost(ctx context.Context, orgID, discussionID, authorID, body string) (models.CasePost, error) {
	p := models.CasePost{
		ID: "post_" + randomID(), DiscussionID: discussionID, AuthorUserID: authorID,
		Body: body, CreatedAt: time.Now(),
	}
	var name string
	_ = db.Pool.QueryRow(ctx, `SELECT name FROM users WHERE id=$1`, authorID).Scan(&name)
	p.AuthorName = name
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO case_discussion_posts (id, org_id, discussion_id, author_user_id, body)
		VALUES ($1,$2,$3,$4,$5)`, p.ID, orgID, discussionID, authorID, body)
	return p, err
}

func (db *DB) ListCasePosts(ctx context.Context, orgID, discussionID string) ([]models.CasePost, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT p.id, p.discussion_id, p.author_user_id, COALESCE(u.name,''), p.body, p.created_at
		FROM case_discussion_posts p
		LEFT JOIN users u ON u.id=p.author_user_id
		WHERE p.org_id=$1 AND p.discussion_id=$2 ORDER BY p.created_at ASC`, orgID, discussionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.CasePost
	for rows.Next() {
		var p models.CasePost
		if err := rows.Scan(&p.ID, &p.DiscussionID, &p.AuthorUserID, &p.AuthorName, &p.Body, &p.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func (db *DB) GetCaseDiscussion(ctx context.Context, orgID, id string) (models.CaseDiscussion, bool, error) {
	var d models.CaseDiscussion
	err := db.Pool.QueryRow(ctx, `
		SELECT d.id, d.org_id, d.author_user_id, d.title, d.summary, d.status, d.created_at,
			(SELECT COUNT(*) FROM case_discussion_posts p WHERE p.discussion_id=d.id)
		FROM case_discussions d WHERE d.org_id=$1 AND d.id=$2`, orgID, id).
		Scan(&d.ID, &d.OrgID, &d.AuthorUserID, &d.Title, &d.Summary, &d.Status, &d.CreatedAt, &d.PostCount)
	if err == pgx.ErrNoRows {
		return models.CaseDiscussion{}, false, nil
	}
	return d, err == nil, err
}
