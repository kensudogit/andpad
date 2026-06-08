package postgres

// 動画カタログ・ダッシュボード集計（org_id でテナント分離）

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
)

func (db *DB) Dashboard(ctx context.Context, orgID string) (models.DashboardStats, error) {
	var d models.DashboardStats
	err := db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM videos WHERE org_id=$1`, orgID).Scan(&d.VideosTotal)
	if err != nil {
		return d, err
	}
	_ = db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM learning_paths WHERE org_id=$1`, orgID).Scan(&d.LearningPathsTotal)
	_ = db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM quizzes WHERE org_id=$1`, orgID).Scan(&d.QuizzesTotal)
	_ = db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FILTER (WHERE completed), COALESCE(SUM(position_sec),0)
		FROM watch_progress WHERE org_id=$1`, orgID).Scan(&d.CompletionsThisMonth, &d.WatchHoursThisMonth)
	d.WatchHoursThisMonth /= 3600
	_ = db.Pool.QueryRow(ctx, `SELECT COUNT(DISTINCT learner_id) FROM watch_progress WHERE org_id=$1`, orgID).Scan(&d.ActiveLearners)
	return d, nil
}

func (db *DB) PaginateVideos(ctx context.Context, orgID, category, skillLevel, search string, page, pageSize int) (models.VideoPage, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 12
	}
	args := []any{orgID}
	filters := []string{`org_id=$1`}
	joinFilters := []string{`v.org_id=$1`}
	if category != "" {
		args = append(args, category)
		n := len(args)
		filters = append(filters, fmt.Sprintf(`category=$%d`, n))
		joinFilters = append(joinFilters, fmt.Sprintf(`v.category=$%d`, n))
	}
	if skillLevel != "" {
		args = append(args, skillLevel)
		n := len(args)
		filters = append(filters, fmt.Sprintf(`skill_level=$%d`, n))
		joinFilters = append(joinFilters, fmt.Sprintf(`v.skill_level=$%d`, n))
	}
	if search = strings.TrimSpace(search); search != "" {
		args = append(args, "%"+strings.ToLower(search)+"%")
		n := len(args)
		pattern := fmt.Sprintf(`$%d`, n)
		like := fmt.Sprintf(`(LOWER(title) LIKE %s OR LOWER(description) LIKE %s)`, pattern, pattern)
		joinLike := fmt.Sprintf(`(LOWER(v.title) LIKE %s OR LOWER(v.description) LIKE %s)`, pattern, pattern)
		filters = append(filters, like)
		joinFilters = append(joinFilters, joinLike)
	}
	where := `WHERE ` + strings.Join(filters, ` AND `)
	whereJoin := `WHERE ` + strings.Join(joinFilters, ` AND `)
	var total int
	if err := db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM videos `+where, args...).Scan(&total); err != nil {
		return models.VideoPage{}, err
	}
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	if totalPages < 1 {
		totalPages = 1
	}
	offset := (page - 1) * pageSize
	args = append(args, pageSize, offset)
	q := `SELECT v.id, v.title, v.description, v.category, v.procedure, v.skill_level, v.duration_sec,
		v.thumbnail_url, v.video_url, v.instructor_id, COALESCE(i.name,''), v.tags, v.view_count, v.featured, v.published_at
		FROM videos v LEFT JOIN instructors i ON i.id=v.instructor_id AND i.org_id=v.org_id ` + whereJoin +
		fmt.Sprintf(` ORDER BY v.published_at DESC LIMIT $%d OFFSET $%d`, len(args)-1, len(args))
	rows, err := db.Pool.Query(ctx, q, args...)
	if err != nil {
		return models.VideoPage{}, err
	}
	defer rows.Close()
	items, err := scanVideos(rows)
	if err != nil {
		return models.VideoPage{}, err
	}
	return models.VideoPage{
		Items:    items,
		PageInfo: models.PageInfo{Total: total, Page: page, PageSize: pageSize, TotalPages: totalPages},
	}, nil
}

func scanVideos(rows pgx.Rows) ([]models.Video, error) {
	var items []models.Video
	for rows.Next() {
		var v models.Video
		var instName *string
		if err := rows.Scan(&v.ID, &v.Title, &v.Description, &v.Category, &v.Procedure, &v.SkillLevel,
			&v.DurationSec, &v.ThumbnailURL, &v.VideoURL, &v.InstructorID, &instName, &v.Tags, &v.ViewCount, &v.Featured, &v.PublishedAt); err != nil {
			return nil, err
		}
		if instName != nil {
			v.InstructorName = *instName
		}
		items = append(items, v)
	}
	return items, rows.Err()
}

func (db *DB) GetVideo(ctx context.Context, orgID, id string) (models.Video, bool, error) {
	row := db.Pool.QueryRow(ctx, `
		SELECT v.id, v.title, v.description, v.category, v.procedure, v.skill_level, v.duration_sec,
			v.thumbnail_url, v.video_url, v.instructor_id, COALESCE(i.name,''), v.tags, v.view_count, v.featured, v.published_at
		FROM videos v LEFT JOIN instructors i ON i.id=v.instructor_id AND i.org_id=v.org_id
		WHERE v.org_id=$1 AND v.id=$2`, orgID, id)
	var v models.Video
	var instName string
	err := row.Scan(&v.ID, &v.Title, &v.Description, &v.Category, &v.Procedure, &v.SkillLevel,
		&v.DurationSec, &v.ThumbnailURL, &v.VideoURL, &v.InstructorID, &instName, &v.Tags, &v.ViewCount, &v.Featured, &v.PublishedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return models.Video{}, false, nil
		}
		return models.Video{}, false, err
	}
	v.InstructorName = instName
	return v, true, nil
}

func (db *DB) IncrementVideoViewCount(ctx context.Context, orgID, id string) (models.Video, error) {
	tag, err := db.Pool.Exec(ctx, `
		UPDATE videos SET view_count = view_count + 1
		WHERE org_id=$1 AND id=$2`, orgID, id)
	if err != nil {
		return models.Video{}, err
	}
	if tag.RowsAffected() == 0 {
		return models.Video{}, pgx.ErrNoRows
	}
	v, ok, err := db.GetVideo(ctx, orgID, id)
	if err != nil {
		return models.Video{}, err
	}
	if !ok {
		return models.Video{}, pgx.ErrNoRows
	}
	return v, nil
}

func (db *DB) FeaturedVideos(ctx context.Context, orgID string) ([]models.Video, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT v.id, v.title, v.description, v.category, v.procedure, v.skill_level, v.duration_sec,
			v.thumbnail_url, v.video_url, v.instructor_id, COALESCE(i.name,''), v.tags, v.view_count, v.featured, v.published_at
		FROM videos v LEFT JOIN instructors i ON i.id=v.instructor_id AND i.org_id=v.org_id
		WHERE v.org_id=$1 AND v.featured=true ORDER BY v.view_count DESC LIMIT 12`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanVideos(rows)
}

func (db *DB) AttachVideoUpload(ctx context.Context, orgID, videoID, storageKey, publicURL string) error {
	_, err := db.Pool.Exec(ctx, `
		UPDATE videos SET storage_key=$3, video_url=$4
		WHERE org_id=$1 AND id=$2`, orgID, videoID, storageKey, publicURL)
	return err
}

func (db *DB) CreateVideoRecord(ctx context.Context, orgID string, v models.Video) (models.Video, error) {
	if v.ID == "" {
		v.ID = "v_" + randomID()
	}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO videos (id, org_id, instructor_id, title, description, category, procedure, skill_level,
			duration_sec, thumbnail_url, video_url, storage_key, featured, published_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
		v.ID, orgID, nullIfEmpty(v.InstructorID), v.Title, v.Description, v.Category, v.Procedure, v.SkillLevel,
		v.DurationSec, v.ThumbnailURL, v.VideoURL, v.StorageKey, v.Featured, time.Now())
	return v, err
}

func nullIfEmpty(s string) any {
	if s == "" {
		return nil
	}
	return s
}
