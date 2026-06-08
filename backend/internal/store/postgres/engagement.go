package postgres

// ノート・ブックマーク・クイズ・修了証など学習者エンゲージメント

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
)

func (db *DB) ListNotes(ctx context.Context, orgID, videoID, learnerID string) ([]models.VideoNote, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, video_id, learner_id, timestamp_sec, body, created_at
		FROM video_notes WHERE org_id=$1 AND video_id=$2 AND learner_id=$3 ORDER BY timestamp_sec`,
		orgID, videoID, learnerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.VideoNote
	for rows.Next() {
		var n models.VideoNote
		if err := rows.Scan(&n.ID, &n.VideoID, &n.LearnerID, &n.TimestampSec, &n.Body, &n.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, rows.Err()
}

func (db *DB) CreateNote(ctx context.Context, orgID string, n models.VideoNote) (models.VideoNote, error) {
	if n.ID == "" {
		n.ID = "note-" + uuid.NewString()[:8]
	}
	n.CreatedAt = time.Now()
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO video_notes (id, org_id, video_id, learner_id, timestamp_sec, body, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7)`,
		n.ID, orgID, n.VideoID, n.LearnerID, n.TimestampSec, n.Body, n.CreatedAt)
	return n, err
}

func (db *DB) DeleteNote(ctx context.Context, orgID, id string) (bool, error) {
	tag, err := db.Pool.Exec(ctx, `DELETE FROM video_notes WHERE org_id=$1 AND id=$2`, orgID, id)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}

func (db *DB) ListBookmarks(ctx context.Context, orgID, learnerID string) ([]models.Bookmark, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, video_id, learner_id, created_at FROM bookmarks
		WHERE org_id=$1 AND learner_id=$2 ORDER BY created_at DESC`, orgID, learnerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Bookmark
	for rows.Next() {
		var b models.Bookmark
		if err := rows.Scan(&b.ID, &b.VideoID, &b.LearnerID, &b.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, b)
	}
	return out, rows.Err()
}

func (db *DB) ToggleBookmark(ctx context.Context, orgID, videoID, learnerID string) (*models.Bookmark, error) {
	var existing models.Bookmark
	err := db.Pool.QueryRow(ctx, `
		SELECT id, video_id, learner_id, created_at FROM bookmarks
		WHERE org_id=$1 AND video_id=$2 AND learner_id=$3`, orgID, videoID, learnerID).
		Scan(&existing.ID, &existing.VideoID, &existing.LearnerID, &existing.CreatedAt)
	if err == nil {
		_, _ = db.Pool.Exec(ctx, `DELETE FROM bookmarks WHERE id=$1`, existing.ID)
		return nil, nil
	}
	if err != pgx.ErrNoRows {
		return nil, err
	}
	b := models.Bookmark{
		ID: "bm-" + uuid.NewString()[:8], VideoID: videoID, LearnerID: learnerID, CreatedAt: time.Now(),
	}
	_, err = db.Pool.Exec(ctx, `
		INSERT INTO bookmarks (id, org_id, video_id, learner_id, created_at) VALUES ($1,$2,$3,$4,$5)`,
		b.ID, orgID, b.VideoID, b.LearnerID, b.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (db *DB) ListQuizzes(ctx context.Context, orgID, videoID string) ([]models.Quiz, error) {
	q := `SELECT id, COALESCE(video_id,''), title, passing_score FROM quizzes WHERE org_id=$1`
	args := []any{orgID}
	if videoID != "" {
		args = append(args, videoID)
		q += fmt.Sprintf(` AND video_id=$%d`, len(args))
	}
	rows, err := db.Pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []string
	var out []models.Quiz
	for rows.Next() {
		var quiz models.Quiz
		if err := rows.Scan(&quiz.ID, &quiz.VideoID, &quiz.Title, &quiz.PassingScore); err != nil {
			return nil, err
		}
		ids = append(ids, quiz.ID)
		out = append(out, quiz)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	for i, id := range ids {
		qs, err := db.loadQuizQuestions(ctx, id)
		if err != nil {
			return nil, err
		}
		out[i].Questions = qs
	}
	return out, nil
}

func (db *DB) GetQuiz(ctx context.Context, orgID, id string) (models.Quiz, bool, error) {
	row := db.Pool.QueryRow(ctx, `
		SELECT id, COALESCE(video_id,''), title, passing_score FROM quizzes WHERE org_id=$1 AND id=$2`, orgID, id)
	var q models.Quiz
	err := row.Scan(&q.ID, &q.VideoID, &q.Title, &q.PassingScore)
	if err == pgx.ErrNoRows {
		return models.Quiz{}, false, nil
	}
	if err != nil {
		return models.Quiz{}, false, err
	}
	q.Questions, err = db.loadQuizQuestions(ctx, id)
	return q, true, err
}

func (db *DB) loadQuizQuestions(ctx context.Context, quizID string) ([]models.QuizQuestion, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, prompt, correct_index FROM quiz_questions WHERE quiz_id=$1 ORDER BY sort_order`, quizID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.QuizQuestion
	for rows.Next() {
		var qn models.QuizQuestion
		if err := rows.Scan(&qn.ID, &qn.Prompt, &qn.CorrectIndex); err != nil {
			return nil, err
		}
		chRows, err := db.Pool.Query(ctx, `
			SELECT id, label FROM quiz_choices WHERE question_id=$1 ORDER BY sort_order`, qn.ID)
		if err != nil {
			return nil, err
		}
		for chRows.Next() {
			var c models.QuizChoice
			if err := chRows.Scan(&c.ID, &c.Label); err != nil {
				chRows.Close()
				return nil, err
			}
			qn.Choices = append(qn.Choices, c)
		}
		chRows.Close()
		out = append(out, qn)
	}
	return out, rows.Err()
}

func (db *DB) ListAttempts(ctx context.Context, orgID, learnerID string) ([]models.QuizAttempt, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, quiz_id, learner_id, score, passed, completed_at FROM quiz_attempts
		WHERE org_id=$1 AND learner_id=$2 ORDER BY completed_at DESC`, orgID, learnerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.QuizAttempt
	for rows.Next() {
		var a models.QuizAttempt
		if err := rows.Scan(&a.ID, &a.QuizID, &a.LearnerID, &a.Score, &a.Passed, &a.CompletedAt); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

func (db *DB) SubmitQuizAttempt(ctx context.Context, orgID, quizID, learnerID string, answers []int) (models.QuizAttempt, bool, error) {
	quiz, ok, err := db.GetQuiz(ctx, orgID, quizID)
	if err != nil || !ok {
		return models.QuizAttempt{}, false, err
	}
	correct := 0
	for i, qn := range quiz.Questions {
		if i < len(answers) && answers[i] == qn.CorrectIndex {
			correct++
		}
	}
	score := 0
	if len(quiz.Questions) > 0 {
		score = int(float64(correct) / float64(len(quiz.Questions)) * 100)
	}
	passed := score >= quiz.PassingScore
	attempt := models.QuizAttempt{
		ID: "qa-" + uuid.NewString()[:8], QuizID: quizID, LearnerID: learnerID,
		Score: score, Passed: passed, CompletedAt: time.Now(),
	}
	_, err = db.Pool.Exec(ctx, `
		INSERT INTO quiz_attempts (id, org_id, quiz_id, learner_id, score, passed, completed_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7)`,
		attempt.ID, orgID, attempt.QuizID, attempt.LearnerID, attempt.Score, attempt.Passed, attempt.CompletedAt)
	if err != nil {
		return models.QuizAttempt{}, false, err
	}
	if passed && quiz.VideoID != "" {
		_ = db.maybeIssueCertificate(ctx, orgID, learnerID, quiz.VideoID)
	}
	return attempt, true, nil
}

func (db *DB) ListCertificates(ctx context.Context, orgID, learnerID string) ([]models.Certificate, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, path_id, learner_id, title, issued_at FROM certificates
		WHERE org_id=$1 AND learner_id=$2 ORDER BY issued_at DESC`, orgID, learnerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Certificate
	for rows.Next() {
		var c models.Certificate
		if err := rows.Scan(&c.ID, &c.PathID, &c.LearnerID, &c.Title, &c.IssuedAt); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

// maybeIssueCertificate は学習パス内の全動画完了時に証明書を1回だけ発行する。
func (db *DB) maybeIssueCertificate(ctx context.Context, orgID, learnerID, videoID string) error {
	rows, err := db.Pool.Query(ctx, `
		SELECT lp.id, lp.certificate_title, array_agg(pv.video_id ORDER BY pv.sort_order)
		FROM learning_paths lp
		JOIN path_videos pv ON pv.path_id = lp.id
		WHERE lp.org_id=$1
		GROUP BY lp.id, lp.certificate_title`, orgID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var pathID, title string
		var videoIDs []string
		if err := rows.Scan(&pathID, &title, &videoIDs); err != nil {
			return err
		}
		allDone := len(videoIDs) > 0
		for _, vid := range videoIDs {
			if vid == videoID {
				continue
			}
			var completed bool
			_ = db.Pool.QueryRow(ctx, `
				SELECT completed FROM watch_progress WHERE org_id=$1 AND learner_id=$2 AND video_id=$3`,
				orgID, learnerID, vid).Scan(&completed)
			if !completed {
				allDone = false
				break
			}
		}
		if !allDone {
			continue
		}
		var exists int
		_ = db.Pool.QueryRow(ctx, `
			SELECT COUNT(*) FROM certificates WHERE org_id=$1 AND path_id=$2 AND learner_id=$3`,
			orgID, pathID, learnerID).Scan(&exists)
		if exists > 0 {
			continue
		}
		_, err = db.Pool.Exec(ctx, `
			INSERT INTO certificates (id, org_id, path_id, learner_id, title, issued_at)
			VALUES ($1,$2,$3,$4,$5,$6)`,
			"cert-"+uuid.NewString()[:8], orgID, pathID, learnerID, title, time.Now())
		if err != nil {
			return err
		}
	}
	return rows.Err()
}
