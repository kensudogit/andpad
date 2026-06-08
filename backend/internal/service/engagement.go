package service

// ブックマーク・ノート・クイズ・証明書と、サブスクリプション向けリアルタイム通知

import (
	"context"
	"time"

	"github.com/pluszero/dental-video-api/internal/gqlconv"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func (s *Service) ListBookmarks(ctx context.Context, learnerID string) ([]models.Bookmark, error) {
	if learnerID == "" {
		learnerID, _ = s.UserID(ctx)
	}
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return nil, err
		}
		return s.PG.ListBookmarks(ctx, oid, learnerID)
	}
	if s.Memory != nil {
		return s.Memory.ListBookmarks(learnerID), nil
	}
	return nil, nil
}

func (s *Service) ListNotes(ctx context.Context, videoID, learnerID string) ([]models.VideoNote, error) {
	if learnerID == "" {
		learnerID, _ = s.UserID(ctx)
	}
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return nil, err
		}
		return s.PG.ListNotes(ctx, oid, videoID, learnerID)
	}
	if s.Memory != nil {
		return s.Memory.ListNotes(videoID, learnerID), nil
	}
	return nil, nil
}

func (s *Service) CreateNote(ctx context.Context, n models.VideoNote) (models.VideoNote, error) {
	if n.LearnerID == "" {
		n.LearnerID, _ = s.UserID(ctx)
	}
	var created models.VideoNote
	var err error
	if s.PG != nil {
		oid, oerr := s.OrgID(ctx)
		if oerr != nil {
			return models.VideoNote{}, oerr
		}
		created, err = s.PG.CreateNote(ctx, oid, n)
	} else if s.Memory != nil {
		created = s.Memory.CreateNote(n)
	} else {
		return models.VideoNote{}, tenant.ErrForbidden
	}
	if err != nil {
		return models.VideoNote{}, err
	}
	s.publishActivity(ctx, n.LearnerID, models.ActivityNoteCreated, ptr(n.VideoID), nil, nil, "Note created")
	s.publishDashboard(ctx)
	return created, nil
}

func (s *Service) DeleteNote(ctx context.Context, id string) (bool, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return false, err
		}
		return s.PG.DeleteNote(ctx, oid, id)
	}
	if s.Memory != nil {
		return s.Memory.DeleteNote(id), nil
	}
	return false, nil
}

func (s *Service) ToggleBookmark(ctx context.Context, videoID, learnerID string) (*models.Bookmark, error) {
	if learnerID == "" {
		learnerID, _ = s.UserID(ctx)
	}
	var bm *models.Bookmark
	var err error
	if s.PG != nil {
		oid, oerr := s.OrgID(ctx)
		if oerr != nil {
			return nil, oerr
		}
		bm, err = s.PG.ToggleBookmark(ctx, oid, videoID, learnerID)
	} else if s.Memory != nil {
		bm, _ = s.Memory.ToggleBookmark(videoID, learnerID)
	} else {
		return nil, tenant.ErrForbidden
	}
	if err != nil {
		return nil, err
	}
	s.publishActivity(ctx, learnerID, models.ActivityBookmarkToggled, ptr(videoID), nil, nil, "Bookmark toggled")
	return bm, nil
}

func (s *Service) ListQuizzes(ctx context.Context, videoID string) ([]models.Quiz, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return nil, err
		}
		return s.PG.ListQuizzes(ctx, oid, videoID)
	}
	if s.Memory != nil {
		return s.Memory.ListQuizzes(videoID), nil
	}
	return nil, nil
}

func (s *Service) GetQuiz(ctx context.Context, id string) (models.Quiz, bool, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return models.Quiz{}, false, err
		}
		return s.PG.GetQuiz(ctx, oid, id)
	}
	if s.Memory != nil {
		q, ok := s.Memory.GetQuiz(id)
		return q, ok, nil
	}
	return models.Quiz{}, false, nil
}

func (s *Service) ListAttempts(ctx context.Context, learnerID string) ([]models.QuizAttempt, error) {
	if learnerID == "" {
		learnerID, _ = s.UserID(ctx)
	}
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return nil, err
		}
		return s.PG.ListAttempts(ctx, oid, learnerID)
	}
	if s.Memory != nil {
		return s.Memory.ListAttempts(learnerID), nil
	}
	return nil, nil
}

func (s *Service) SubmitQuizAttempt(ctx context.Context, quizID, learnerID string, answers []int) (models.QuizAttempt, bool, error) {
	if learnerID == "" {
		learnerID, _ = s.UserID(ctx)
	}
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return models.QuizAttempt{}, false, err
		}
		attempt, ok, err := s.PG.SubmitQuizAttempt(ctx, oid, quizID, learnerID, answers)
		if err == nil && ok {
			s.publishActivity(ctx, learnerID, models.ActivityQuizSubmitted, nil, nil, ptr(quizID), "Quiz submitted")
			s.publishDashboard(ctx)
		}
		return attempt, ok, err
	}
	if s.Memory != nil {
		attempt, ok := s.Memory.SubmitQuizAttempt(quizID, learnerID, answers)
		if ok {
			s.publishActivity(ctx, learnerID, models.ActivityQuizSubmitted, nil, nil, ptr(quizID), "Quiz submitted")
			s.publishDashboard(ctx)
		}
		return attempt, ok, nil
	}
	return models.QuizAttempt{}, false, tenant.ErrForbidden
}

func (s *Service) ListCertificates(ctx context.Context, learnerID string) ([]models.Certificate, error) {
	if learnerID == "" {
		learnerID, _ = s.UserID(ctx)
	}
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return nil, err
		}
		return s.PG.ListCertificates(ctx, oid, learnerID)
	}
	if s.Memory != nil {
		return s.Memory.ListCertificates(learnerID), nil
	}
	return nil, nil
}

// UpdateProgressWithEvents は視聴進捗更新後に WebSocket 購読者へダッシュボード/活動を配信する。
func (s *Service) UpdateProgressWithEvents(ctx context.Context, p models.WatchProgress) (models.WatchProgress, error) {
	updated, err := s.UpdateProgress(ctx, p)
	if err != nil {
		return updated, err
	}
	if s.Realtime != nil {
		s.Realtime.PublishProgress(updated.LearnerID, gqlconv.ToProgress(updated))
	}
	s.publishActivity(ctx, updated.LearnerID, models.ActivityProgressUpdated, ptr(updated.VideoID), nil, nil, "Progress updated")
	s.publishDashboard(ctx)
	return updated, nil
}

func (s *Service) EnrollPathWithEvents(ctx context.Context, pathID, learnerID string) error {
	if err := s.EnrollPath(ctx, pathID, learnerID); err != nil {
		return err
	}
	if learnerID == "" {
		learnerID, _ = s.UserID(ctx)
	}
	s.publishActivity(ctx, learnerID, models.ActivityPathEnrolled, nil, ptr(pathID), nil, "Enrolled in learning path")
	s.publishDashboard(ctx)
	return nil
}

func (s *Service) publishDashboard(ctx context.Context) {
	if s.Realtime == nil {
		return
	}
	d, err := s.Dashboard(ctx)
	if err != nil {
		return
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return
	}
	s.Realtime.PublishDashboard(oid, gqlconv.ToDashboard(d))
}

func (s *Service) publishActivity(ctx context.Context, learnerID string, kind models.LearningActivityKind, videoID, pathID, quizID *string, msg string) {
	if s.Realtime == nil {
		return
	}
	ev := models.LearningActivityEvent{
		Kind: kind, LearnerID: learnerID, VideoID: videoID, PathID: pathID, QuizID: quizID,
		Message: msg, OccurredAt: time.Now().UTC().Format(time.RFC3339),
	}
	s.Realtime.PublishActivity(learnerID, gqlconv.ToActivityEvent(ev))
}

func ptr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
