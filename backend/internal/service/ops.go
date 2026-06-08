package service

// 動画カタログ・学習パス・ライブ・症例・AI 相談などの業務オペレーション

import (
	"context"
	"time"

	"github.com/pluszero/dental-video-api/internal/consult"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/openai"
	"github.com/pluszero/dental-video-api/internal/tenant"
	"github.com/pluszero/dental-video-api/internal/textutil"
)

func (s *Service) Dashboard(ctx context.Context) (models.DashboardStats, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return models.DashboardStats{}, err
		}
		return s.PG.Dashboard(ctx, oid)
	}
	return s.Memory.Dashboard(), nil
}

func (s *Service) PaginateVideos(ctx context.Context, category, skillLevel, search string, page, pageSize int) (models.VideoPage, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return models.VideoPage{}, err
		}
		return s.PG.PaginateVideos(ctx, oid, category, skillLevel, search, page, pageSize)
	}
	return s.Memory.PaginateVideos(category, skillLevel, search, page, pageSize), nil
}

func (s *Service) GetVideo(ctx context.Context, id string) (models.Video, bool, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return models.Video{}, false, err
		}
		return s.PG.GetVideo(ctx, oid, id)
	}
	v, ok := s.Memory.GetVideo(id)
	return v, ok, nil
}

func (s *Service) RecordVideoView(ctx context.Context, videoID string) (models.Video, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return models.Video{}, err
		}
		v, err := s.PG.IncrementVideoViewCount(ctx, oid, videoID)
		if err != nil {
			return models.Video{}, err
		}
		return v, nil
	}
	v, ok := s.Memory.IncrementVideoViewCount(videoID)
	if !ok {
		return models.Video{}, tenant.ErrForbidden
	}
	return v, nil
}

func (s *Service) ListInstructors(ctx context.Context) ([]models.Instructor, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return nil, err
		}
		return s.PG.ListInstructors(ctx, oid)
	}
	if s.Memory != nil {
		return s.Memory.ListInstructors(), nil
	}
	return nil, nil
}

func (s *Service) GetInstructor(ctx context.Context, id string) (models.Instructor, bool, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return models.Instructor{}, false, err
		}
		return s.PG.GetInstructor(ctx, oid, id)
	}
	if s.Memory != nil {
		i, ok := s.Memory.GetInstructor(id)
		return i, ok, nil
	}
	return models.Instructor{}, false, nil
}

func (s *Service) FeaturedVideos(ctx context.Context) ([]models.Video, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return nil, err
		}
		return s.PG.FeaturedVideos(ctx, oid)
	}
	return s.Memory.FeaturedVideos(), nil
}

func (s *Service) ListPaths(ctx context.Context, category, skillLevel string) ([]models.LearningPath, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return nil, err
		}
		return s.PG.ListPaths(ctx, oid, category, skillLevel)
	}
	return s.Memory.ListPaths(category, skillLevel), nil
}

func (s *Service) GetPath(ctx context.Context, id string) (models.LearningPath, bool, error) {
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return models.LearningPath{}, false, err
		}
		return s.PG.GetPath(ctx, oid, id)
	}
	p, ok := s.Memory.GetPath(id)
	return p, ok, nil
}

func (s *Service) UpdateProgress(ctx context.Context, p models.WatchProgress) (models.WatchProgress, error) {
	uid, _ := s.UserID(ctx)
	if uid != "" {
		p.LearnerID = uid
	}
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return models.WatchProgress{}, err
		}
		return s.PG.UpdateProgress(ctx, oid, p)
	}
	return s.Memory.UpdateProgress(p), nil
}

func (s *Service) ListProgress(ctx context.Context, learnerID string) ([]models.WatchProgress, error) {
	if learnerID == "" {
		learnerID, _ = s.UserID(ctx)
	}
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return nil, err
		}
		return s.PG.ListProgress(ctx, oid, learnerID)
	}
	return s.Memory.ListProgress(learnerID), nil
}

func (s *Service) EnrollPath(ctx context.Context, pathID, learnerID string) error {
	if learnerID == "" {
		learnerID, _ = s.UserID(ctx)
	}
	if s.PG != nil {
		oid, err := s.OrgID(ctx)
		if err != nil {
			return err
		}
		return s.PG.EnrollPath(ctx, oid, pathID, learnerID)
	}
	_, _ = s.Memory.EnrollPath(pathID, learnerID)
	return nil
}

func (s *Service) PresignVideoUpload(ctx context.Context, filename, contentType string) (models.UploadTarget, error) {
	if s.S3 == nil {
		return models.UploadTarget{}, tenant.ErrForbidden
	}
	p, err := s.requireAuth(ctx)
	if err != nil {
		return models.UploadTarget{}, err
	}
	key := s.S3.ObjectKey(p.OrgID, "videos", filename)
	url, err := s.S3.PresignPut(ctx, key, contentType, 15*time.Minute)
	if err != nil {
		return models.UploadTarget{}, err
	}
	return models.UploadTarget{UploadURL: url, ObjectKey: key, PublicURL: s.S3.PublicURL(key)}, nil
}

func (s *Service) ListLiveSessions(ctx context.Context) ([]models.LiveSession, error) {
	if s.PG == nil {
		return nil, nil
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return nil, err
	}
	return s.PG.ListLiveSessions(ctx, oid)
}

func (s *Service) CreateLiveSession(ctx context.Context, title, desc string, at time.Time, streamURL string) (models.LiveSession, error) {
	if s.PG == nil {
		return models.LiveSession{}, tenant.ErrForbidden
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return models.LiveSession{}, err
	}
	uid, err := s.UserID(ctx)
	if err != nil {
		return models.LiveSession{}, err
	}
	return s.PG.CreateLiveSession(ctx, oid, uid, title, desc, at, streamURL)
}

func (s *Service) ListCaseDiscussions(ctx context.Context) ([]models.CaseDiscussion, error) {
	if s.PG == nil {
		return nil, nil
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return nil, err
	}
	return s.PG.ListCaseDiscussions(ctx, oid)
}

func (s *Service) CreateCaseDiscussion(ctx context.Context, title, summary string) (models.CaseDiscussion, error) {
	if s.PG == nil {
		return models.CaseDiscussion{}, tenant.ErrForbidden
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return models.CaseDiscussion{}, err
	}
	uid, err := s.UserID(ctx)
	if err != nil {
		return models.CaseDiscussion{}, err
	}
	return s.PG.CreateCaseDiscussion(ctx, oid, uid, title, summary)
}

func (s *Service) AddCasePost(ctx context.Context, discussionID, body string) (models.CasePost, error) {
	if s.PG == nil {
		return models.CasePost{}, tenant.ErrForbidden
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return models.CasePost{}, err
	}
	uid, err := s.UserID(ctx)
	if err != nil {
		return models.CasePost{}, err
	}
	return s.PG.AddCasePost(ctx, oid, discussionID, uid, body)
}

// SendConsultation はユーザ発言を保存し OpenAI で歯科臨床教育アシスタント応答を生成する。
func (s *Service) SendConsultation(ctx context.Context, threadID, message string) (models.ConsultationMessage, models.ConsultationMessage, error) {
	if s.memoryMode() {
		return s.memorySendConsultation(ctx, threadID, message)
	}
	if s.PG == nil {
		return models.ConsultationMessage{}, models.ConsultationMessage{}, tenant.ErrForbidden
	}
	oid, uid, _, err := s.consultScope(ctx)
	if err != nil {
		return models.ConsultationMessage{}, models.ConsultationMessage{}, err
	}
	// 初回メッセージからスレッドタイトルを自動生成
	if threadID == "" {
		t, err := s.PG.CreateConsultThread(ctx, oid, uid, textutil.TruncateRunes(message, 40))
		if err != nil {
			return models.ConsultationMessage{}, models.ConsultationMessage{}, err
		}
		threadID = t.ID
	} else if err := s.PG.VerifyConsultThreadAccess(ctx, oid, uid, threadID); err != nil {
		return models.ConsultationMessage{}, models.ConsultationMessage{}, err
	}
	userMsg, err := s.PG.AddConsultMessage(ctx, oid, threadID, "user", message)
	if err != nil {
		return models.ConsultationMessage{}, models.ConsultationMessage{}, err
	}
	_, msgs, err := s.PG.GetConsultThread(ctx, oid, uid, threadID, false)
	if err != nil {
		return userMsg, models.ConsultationMessage{}, err
	}
	history := make([]openai.ChatMessage, 0, len(msgs))
	// 直前のユーザ発言は userMessage 引数で渡すため履歴から除外
	for _, m := range msgs {
		if m.ID == userMsg.ID {
			continue
		}
		history = append(history, openai.ChatMessage{Role: m.Role, Content: m.Content})
	}
	reply := consult.GenerateReply(ctx, s.Cfg, s.OpenAI, history, message)
	aiMsg, err := s.PG.AddConsultMessage(ctx, oid, threadID, "assistant", reply)
	_ = s.PG.IncrementConsultUsage(ctx, oid, len(message)+len(reply))
	return userMsg, aiMsg, err
}

func (s *Service) ListConsultThreads(ctx context.Context) ([]models.ConsultationThread, error) {
	if s.memoryMode() {
		return s.memoryListConsultThreads(ctx)
	}
	if s.PG == nil {
		return nil, nil
	}
	oid, uid, orgWide, err := s.consultScope(ctx)
	if err != nil {
		return nil, err
	}
	return s.PG.ListConsultThreads(ctx, oid, uid, orgWide)
}

func (s *Service) GetConsultThread(ctx context.Context, threadID string) (models.ConsultationThread, []models.ConsultationMessage, error) {
	if s.memoryMode() {
		return s.memoryGetConsultThread(ctx, threadID)
	}
	if s.PG == nil {
		return models.ConsultationThread{}, nil, tenant.ErrForbidden
	}
	oid, uid, orgWide, err := s.consultScope(ctx)
	if err != nil {
		return models.ConsultationThread{}, nil, err
	}
	return s.PG.GetConsultThread(ctx, oid, uid, threadID, orgWide)
}

