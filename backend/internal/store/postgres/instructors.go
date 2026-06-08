package postgres

// 講師マスタ（動画数はサブクエリで集計）

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
)

func (db *DB) ListInstructors(ctx context.Context, orgID string) ([]models.Instructor, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT i.id, i.name, i.title, i.specialty, i.bio, i.avatar_url,
			(SELECT COUNT(*) FROM videos v WHERE v.instructor_id=i.id AND v.org_id=$1)
		FROM instructors i WHERE i.org_id=$1 ORDER BY i.name`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Instructor
	for rows.Next() {
		var i models.Instructor
		if err := rows.Scan(&i.ID, &i.Name, &i.Title, &i.Specialty, &i.Bio, &i.AvatarURL, &i.VideoCount); err != nil {
			return nil, err
		}
		out = append(out, i)
	}
	return out, rows.Err()
}

func (db *DB) GetInstructor(ctx context.Context, orgID, id string) (models.Instructor, bool, error) {
	var i models.Instructor
	err := db.Pool.QueryRow(ctx, `
		SELECT i.id, i.name, i.title, i.specialty, i.bio, i.avatar_url,
			(SELECT COUNT(*) FROM videos v WHERE v.instructor_id=i.id)
		FROM instructors i WHERE i.org_id=$1 AND i.id=$2`, orgID, id).
		Scan(&i.ID, &i.Name, &i.Title, &i.Specialty, &i.Bio, &i.AvatarURL, &i.VideoCount)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Instructor{}, false, nil
	}
	if err != nil {
		return models.Instructor{}, false, err
	}
	return i, true, nil
}
