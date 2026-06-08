package postgres

// 期間指定の KPI 集計と組織プロフィール更新

import (
	"context"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
)

func (db *DB) AnalyticsBoard(ctx context.Context, orgID string, periodDays int) (models.AnalyticsBoard, error) {
	if periodDays < 1 {
		periodDays = 30
	}
	since := time.Now().AddDate(0, 0, -periodDays)
	board := models.AnalyticsBoard{PeriodDays: periodDays}

	var watchHours float64
	var completions int
	var activeLearners int
	var enrollments int
	_ = db.Pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(position_sec),0)/3600.0,
			COUNT(*) FILTER (WHERE completed),
			COUNT(DISTINCT learner_id)
		FROM watch_progress WHERE org_id=$1 AND updated_at >= $2`,
		orgID, since).Scan(&watchHours, &completions, &activeLearners)
	_ = db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM enrollments WHERE org_id=$1 AND enrolled_at >= $2`, orgID, since).Scan(&enrollments)

	var videoCount int
	_ = db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM videos WHERE org_id=$1`, orgID).Scan(&videoCount)

	board.Kpis = []models.AnalyticsKpi{
		{Label: "watch_hours", Value: watchHours, Unit: "h", TrendPct: 0},
		{Label: "completions", Value: float64(completions), Unit: "", TrendPct: 0},
		{Label: "active_learners", Value: float64(activeLearners), Unit: "", TrendPct: 0},
		{Label: "new_enrollments", Value: float64(enrollments), Unit: "", TrendPct: 0},
		{Label: "video_library", Value: float64(videoCount), Unit: "", TrendPct: 0},
	}

	board.WatchHoursByWeek = make([]float64, 4)
	for i := 0; i < 4; i++ {
		start := time.Now().AddDate(0, 0, -7*(4-i))
		end := start.AddDate(0, 0, 7)
		var h float64
		_ = db.Pool.QueryRow(ctx, `
			SELECT COALESCE(SUM(position_sec),0)/3600.0 FROM watch_progress
			WHERE org_id=$1 AND updated_at >= $2 AND updated_at < $3`, orgID, start, end).Scan(&h)
		board.WatchHoursByWeek[i] = h
	}

	rows, err := db.Pool.Query(ctx, `
		SELECT v.category, COUNT(*) FILTER (WHERE wp.completed)
		FROM videos v
		LEFT JOIN watch_progress wp ON wp.video_id=v.id AND wp.org_id=v.org_id AND wp.updated_at >= $2
		WHERE v.org_id=$1
		GROUP BY v.category ORDER BY COUNT(*) DESC`, orgID, since)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var c models.CategoryMetric
			if err := rows.Scan(&c.Category, &c.Count); err != nil {
				break
			}
			board.CompletionsByCategory = append(board.CompletionsByCategory, c)
		}
	}

	topRows, err := db.Pool.Query(ctx, `
		SELECT v.id, v.title, v.view_count, COUNT(*) FILTER (WHERE wp.completed)
		FROM videos v
		LEFT JOIN watch_progress wp ON wp.video_id=v.id AND wp.org_id=v.org_id
		WHERE v.org_id=$1
		GROUP BY v.id, v.title, v.view_count
		ORDER BY v.view_count DESC LIMIT 5`, orgID)
	if err == nil {
		defer topRows.Close()
		for topRows.Next() {
			var m models.VideoMetric
			if err := topRows.Scan(&m.VideoID, &m.Title, &m.Views, &m.Completions); err != nil {
				break
			}
			board.TopVideos = append(board.TopVideos, m)
		}
	}

	if activeLearners > 0 && videoCount > 0 {
		board.LearnerEngagementScore = float64(completions) / float64(activeLearners*videoCount) * 100
		if board.LearnerEngagementScore > 100 {
			board.LearnerEngagementScore = 100
		}
	}

	return board, nil
}

func (db *DB) UpdateOrganization(ctx context.Context, orgID string, in models.OrganizationPatch) (models.Organization, error) {
	o, err := db.GetOrganization(ctx, orgID)
	if err != nil {
		return o, err
	}
	if in.Name != nil {
		o.Name = *in.Name
	}
	if in.Slug != nil {
		o.Slug = *in.Slug
	}
	if in.SeatCount != nil {
		o.SeatCount = *in.SeatCount
	}
	if in.Timezone != nil {
		o.Timezone = *in.Timezone
	}
	_, err = db.Pool.Exec(ctx, `
		UPDATE organizations SET name=$2, slug=$3, seat_count=$4, timezone=$5 WHERE id=$1`,
		orgID, o.Name, o.Slug, o.SeatCount, o.Timezone)
	if err != nil {
		return models.Organization{}, err
	}
	mc, _ := db.MemberCount(ctx, orgID)
	o.MemberCount = mc
	return o, nil
}
