// Package gqlconv は domain models を gqlgen 生成型へ変換する（GraphQL 境界）。
package gqlconv

import (
	"time"

	"github.com/pluszero/dental-video-api/internal/graph/generated"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/textutil"
)

// txt は DB に \uXXXX が文字列のまま残った日本語フィールドを復元する。
func txt(s string) string {
	return textutil.DecodeJSONUnicodeEscapes(s)
}

func fmtTime(t time.Time) string {
	if t.IsZero() {
		return time.Now().UTC().Format(time.RFC3339)
	}
	return t.UTC().Format(time.RFC3339)
}

func ToHealth() *generated.Health {
	return &generated.Health{Ok: true, Service: "andpad-api", Version: "2.0.0-gqlgen"}
}

func ToDashboard(d models.DashboardStats) *generated.DashboardStats {
	return &generated.DashboardStats{
		VideosTotal: d.VideosTotal, LearningPathsTotal: d.LearningPathsTotal,
		QuizzesTotal: d.QuizzesTotal, CompletionsThisMonth: d.CompletionsThisMonth,
		WatchHoursThisMonth: d.WatchHoursThisMonth, ActiveLearners: d.ActiveLearners,
	}
}

func ToInstructor(i models.Instructor) *generated.Instructor {
	return &generated.Instructor{
		ID: i.ID, Name: txt(i.Name), Title: txt(i.Title), Specialty: txt(i.Specialty),
		Bio: txt(i.Bio), AvatarURL: i.AvatarURL, VideoCount: i.VideoCount,
	}
}

func ToVideo(v models.Video) *generated.Video {
	var name *string
	if v.InstructorName != "" {
		n := txt(v.InstructorName)
		name = &n
	}
	return &generated.Video{
		ID: v.ID, Title: txt(v.Title), Description: txt(v.Description),
		Category: models.VideoCategory(v.Category), Procedure: txt(v.Procedure),
		SkillLevel: models.SkillLevel(v.SkillLevel), DurationSec: v.DurationSec,
		ThumbnailURL: v.ThumbnailURL, VideoURL: v.VideoURL,
		InstructorID: v.InstructorID, InstructorName: name,
		Tags: v.Tags, ViewCount: v.ViewCount,
		PublishedAt: fmtTime(v.PublishedAt), Featured: v.Featured,
	}
}

func ToVideos(videos []models.Video) []*generated.Video {
	out := make([]*generated.Video, len(videos))
	for i, v := range videos {
		out[i] = ToVideo(v)
	}
	return out
}

func ToVideoPage(p models.VideoPage) *generated.VideoPage {
	return &generated.VideoPage{
		Items: ToVideos(p.Items),
		PageInfo: &generated.PageInfo{
			Total: p.PageInfo.Total, Page: p.PageInfo.Page,
			PageSize: p.PageInfo.PageSize, TotalPages: p.PageInfo.TotalPages,
		},
	}
}

func ToPath(p models.LearningPath) *generated.LearningPath {
	return &generated.LearningPath{
		ID: p.ID, Title: txt(p.Title), Description: txt(p.Description),
		Category: models.VideoCategory(p.Category), SkillLevel: models.SkillLevel(p.SkillLevel),
		VideoIds: p.VideoIDs, EstimatedMinutes: p.EstimatedMinutes,
		EnrolledCount: p.EnrolledCount, CertificateTitle: txt(p.CertificateTitle),
	}
}

func ToPaths(paths []models.LearningPath) []*generated.LearningPath {
	out := make([]*generated.LearningPath, len(paths))
	for i, p := range paths {
		out[i] = ToPath(p)
	}
	return out
}

func ToProgress(p models.WatchProgress) *generated.WatchProgress {
	return &generated.WatchProgress{
		ID: p.ID, VideoID: p.VideoID, LearnerID: p.LearnerID,
		PositionSec: p.PositionSec, Completed: p.Completed, UpdatedAt: fmtTime(p.UpdatedAt),
	}
}

func ToNote(n models.VideoNote) *generated.VideoNote {
	return &generated.VideoNote{
		ID: n.ID, VideoID: n.VideoID, LearnerID: n.LearnerID,
		TimestampSec: n.TimestampSec, Body: n.Body, CreatedAt: fmtTime(n.CreatedAt),
	}
}

func ToBookmark(b models.Bookmark) *generated.Bookmark {
	return &generated.Bookmark{
		ID: b.ID, VideoID: b.VideoID, LearnerID: b.LearnerID, CreatedAt: fmtTime(b.CreatedAt),
	}
}

func ToQuiz(q models.Quiz) *generated.Quiz {
	var vid *string
	if q.VideoID != "" {
		vid = &q.VideoID
	}
	questions := make([]*generated.QuizQuestion, len(q.Questions))
	for i, qn := range q.Questions {
		choices := make([]*generated.QuizChoice, len(qn.Choices))
		for j, c := range qn.Choices {
			choices[j] = &generated.QuizChoice{ID: c.ID, Label: c.Label}
		}
		questions[i] = &generated.QuizQuestion{
			ID: qn.ID, Prompt: qn.Prompt, Choices: choices, CorrectIndex: qn.CorrectIndex,
		}
	}
	return &generated.Quiz{
		ID: q.ID, VideoID: vid, Title: q.Title, PassingScore: q.PassingScore, Questions: questions,
	}
}

func ToAttempt(a models.QuizAttempt) *generated.QuizAttempt {
	return &generated.QuizAttempt{
		ID: a.ID, QuizID: a.QuizID, LearnerID: a.LearnerID,
		Score: a.Score, Passed: a.Passed, CompletedAt: fmtTime(a.CompletedAt),
	}
}

func ToCertificate(c models.Certificate) *generated.Certificate {
	return &generated.Certificate{
		ID: c.ID, PathID: c.PathID, LearnerID: c.LearnerID,
		Title: c.Title, IssuedAt: fmtTime(c.IssuedAt),
	}
}

func ToActivityEvent(ev models.LearningActivityEvent) *generated.LearningActivityEvent {
	return &generated.LearningActivityEvent{
		Kind: ev.Kind, LearnerID: ev.LearnerID, VideoID: ev.VideoID,
		PathID: ev.PathID, QuizID: ev.QuizID, Message: ev.Message, OccurredAt: ev.OccurredAt,
	}
}

func EnumStr(cat *models.VideoCategory) string {
	if cat == nil {
		return ""
	}
	return string(*cat)
}

func LevelStr(level *models.SkillLevel) string {
	if level == nil {
		return ""
	}
	return string(*level)
}
