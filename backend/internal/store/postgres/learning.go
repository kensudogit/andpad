package postgres

// 学習パス・視聴進捗・パス受講登録

import (
	"context"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
)

func (db *DB) ListPaths(ctx context.Context, orgID, category, skillLevel string) ([]models.LearningPath, error) {
	q := `SELECT id, title, description, category, skill_level, estimated_minutes, enrolled_count, certificate_title FROM learning_paths WHERE org_id=$1`
	args := []any{orgID}
	if category != "" {
		args = append(args, category)
		q += ` AND category=$` + itoa(len(args))
	}
	if skillLevel != "" {
		args = append(args, skillLevel)
		q += ` AND skill_level=$` + itoa(len(args))
	}
	rows, err := db.Pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.LearningPath
	for rows.Next() {
		var p models.LearningPath
		if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.Category, &p.SkillLevel, &p.EstimatedMinutes, &p.EnrolledCount, &p.CertificateTitle); err != nil {
			return nil, err
		}
		p.VideoIDs, _ = db.pathVideoIDs(ctx, p.ID)
		out = append(out, p)
	}
	return out, rows.Err()
}

func (db *DB) pathVideoIDs(ctx context.Context, pathID string) ([]string, error) {
	rows, err := db.Pool.Query(ctx, `SELECT video_id FROM path_videos WHERE path_id=$1 ORDER BY sort_order`, pathID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

func (db *DB) GetPath(ctx context.Context, orgID, id string) (models.LearningPath, bool, error) {
	var p models.LearningPath
	err := db.Pool.QueryRow(ctx, `
		SELECT id, title, description, category, skill_level, estimated_minutes, enrolled_count, certificate_title
		FROM learning_paths WHERE org_id=$1 AND id=$2`, orgID, id).
		Scan(&p.ID, &p.Title, &p.Description, &p.Category, &p.SkillLevel, &p.EstimatedMinutes, &p.EnrolledCount, &p.CertificateTitle)
	if err == pgx.ErrNoRows {
		return models.LearningPath{}, false, nil
	}
	if err != nil {
		return models.LearningPath{}, false, err
	}
	p.VideoIDs, _ = db.pathVideoIDs(ctx, p.ID)
	return p, true, nil
}

func (db *DB) UpdateProgress(ctx context.Context, orgID string, p models.WatchProgress) (models.WatchProgress, error) {
	if p.ID == "" {
		p.ID = "wp_" + randomID()
	}
	p.UpdatedAt = time.Now()
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO watch_progress (id, org_id, video_id, learner_id, position_sec, completed, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		ON CONFLICT (org_id, video_id, learner_id) DO UPDATE SET position_sec=$5, completed=$6, updated_at=$7`,
		p.ID, orgID, p.VideoID, p.LearnerID, p.PositionSec, p.Completed, p.UpdatedAt)
	return p, err
}

func (db *DB) ListProgress(ctx context.Context, orgID, learnerID string) ([]models.WatchProgress, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, video_id, learner_id, position_sec, completed, updated_at
		FROM watch_progress WHERE org_id=$1 AND learner_id=$2`, orgID, learnerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanProgress(rows)
}

func scanProgress(rows pgx.Rows) ([]models.WatchProgress, error) {
	var out []models.WatchProgress
	for rows.Next() {
		var p models.WatchProgress
		if err := rows.Scan(&p.ID, &p.VideoID, &p.LearnerID, &p.PositionSec, &p.Completed, &p.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func itoa(n int) string { return strconv.Itoa(n) }

func (db *DB) EnrollPath(ctx context.Context, orgID, pathID, learnerID string) error {
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO enrollments (org_id, path_id, learner_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
		orgID, pathID, learnerID)
	if err != nil {
		return err
	}
	_, err = db.Pool.Exec(ctx, `UPDATE learning_paths SET enrolled_count = enrolled_count + 1 WHERE id=$1 AND org_id=$2`, pathID, orgID)
	return err
}
