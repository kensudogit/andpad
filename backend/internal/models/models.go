// Package models はドメインエンティティ（動画・学習パス・進捗など）の型定義。
package models

import "time"

type HealthResponse struct {
	OK      bool   `json:"ok"`
	Service string `json:"service"`
	Version string `json:"version"`
}

type DashboardStats struct {
	VideosTotal           int     `json:"videosTotal"`
	LearningPathsTotal    int     `json:"learningPathsTotal"`
	QuizzesTotal          int     `json:"quizzesTotal"`
	CompletionsThisMonth  int     `json:"completionsThisMonth"`
	WatchHoursThisMonth   float64 `json:"watchHoursThisMonth"`
	ActiveLearners        int     `json:"activeLearners"`
}

type Instructor struct {
	ID          string
	Name        string
	Title       string
	Specialty   string
	Bio         string
	AvatarURL   string
	VideoCount  int
}

type Video struct {
	ID             string
	OrgID          string
	Title          string
	Description    string
	Category       string
	Procedure      string
	SkillLevel     string
	DurationSec    int
	ThumbnailURL   string
	VideoURL       string
	StorageKey     string
	ThumbnailKey   string
	InstructorID   string
	InstructorName string
	Tags           []string
	ViewCount      int
	PublishedAt    time.Time
	Featured       bool
}

type LearningPath struct {
	ID               string
	Title            string
	Description      string
	Category         string
	SkillLevel       string
	VideoIDs         []string
	EstimatedMinutes int
	EnrolledCount    int
	CertificateTitle string
}

type WatchProgress struct {
	ID          string
	VideoID     string
	LearnerID   string
	PositionSec int
	Completed   bool
	UpdatedAt   time.Time
}

type VideoNote struct {
	ID           string
	VideoID      string
	LearnerID    string
	TimestampSec int
	Body         string
	CreatedAt    time.Time
}

type QuizChoice struct {
	ID    string
	Label string
}

type QuizQuestion struct {
	ID           string
	Prompt       string
	Choices      []QuizChoice
	CorrectIndex int
}

type Quiz struct {
	ID           string
	VideoID      string
	Title        string
	PassingScore int
	Questions    []QuizQuestion
}

type QuizAttempt struct {
	ID          string
	QuizID      string
	LearnerID   string
	Score       int
	Passed      bool
	CompletedAt time.Time
}

type Bookmark struct {
	ID        string
	VideoID   string
	LearnerID string
	CreatedAt time.Time
}

type Certificate struct {
	ID        string
	PathID    string
	LearnerID string
	Title     string
	IssuedAt  time.Time
}

type PageInfo struct {
	Total      int
	Page       int
	PageSize   int
	TotalPages int
}

type VideoPage struct {
	Items    []Video
	PageInfo PageInfo
}
