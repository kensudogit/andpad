package service

// クリニック向け学習 KPI ボードと OpenAI による経営インサイト生成

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/openai"
)

func (s *Service) AnalyticsBoard(ctx context.Context, periodDays int) (models.AnalyticsBoard, error) {
	if s.PG == nil {
		return memoryAnalyticsBoard(s), nil
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return models.AnalyticsBoard{}, err
	}
	return s.PG.AnalyticsBoard(ctx, oid, periodDays)
}

func memoryAnalyticsBoard(s *Service) models.AnalyticsBoard {
	d := s.Memory.Dashboard()
	return models.AnalyticsBoard{
		PeriodDays: 30,
		Kpis: []models.AnalyticsKpi{
			{Label: "watch_hours", Value: d.WatchHoursThisMonth, Unit: "h"},
			{Label: "completions", Value: float64(d.CompletionsThisMonth), Unit: ""},
			{Label: "active_learners", Value: float64(d.ActiveLearners), Unit: ""},
			{Label: "video_library", Value: float64(d.VideosTotal), Unit: ""},
		},
		WatchHoursByWeek:        []float64{d.WatchHoursThisMonth * 0.2, d.WatchHoursThisMonth * 0.25, d.WatchHoursThisMonth * 0.3, d.WatchHoursThisMonth * 0.25},
		LearnerEngagementScore:  72,
	}
}

// GenerateAnalyticsInsight は KPI JSON を LLM に渡し、失敗時はルールベースの日本語要約にフォールバックする。
func (s *Service) GenerateAnalyticsInsight(ctx context.Context, periodDays int) (models.AnalyticsInsight, error) {
	board, err := s.AnalyticsBoard(ctx, periodDays)
	if err != nil {
		return models.AnalyticsInsight{}, err
	}
	now := time.Now().UTC().Format(time.RFC3339)
	if s.OpenAI == nil {
		return fallbackInsight(board, now), nil
	}
	payload, _ := json.Marshal(board)
	reply, err := s.OpenAI.Chat(ctx, openai.DentalAnalyticsSystem, nil, string(payload))
	if err != nil {
		return fallbackInsight(board, now), nil
	}
	var parsed struct {
		Summary         string   `json:"summary"`
		Strengths       []string `json:"strengths"`
		Risks           []string `json:"risks"`
		Recommendations []string `json:"recommendations"`
	}
	if err := json.Unmarshal([]byte(extractJSON(reply)), &parsed); err != nil {
		return fallbackInsight(board, now), nil
	}
	return models.AnalyticsInsight{
		Summary: parsed.Summary, Strengths: parsed.Strengths,
		Risks: parsed.Risks, Recommendations: parsed.Recommendations,
		GeneratedAt: now,
	}, nil
}

func fallbackInsight(b models.AnalyticsBoard, at string) models.AnalyticsInsight {
	watch := 0.0
	if len(b.Kpis) > 0 {
		watch = b.Kpis[0].Value
	}
	return models.AnalyticsInsight{
		Summary: fmt.Sprintf("\u904e\u53bb%d\u65e5\u9593\u306e\u8996\u8074\u306f%.1f\u6642\u9593\u3002\u5b66\u7fd2\u53c2\u52a0\u30b9\u30b3\u30a2\u306f%.0f\u70b9\u3067\u3059\u3002", b.PeriodDays, watch, b.LearnerEngagementScore),
		Strengths:       []string{"\u52d5\u753b\u30e9\u30a4\u30d6\u30e9\u30ea\u304c\u6574\u5099\u3055\u308c\u3066\u3044\u307e\u3059"},
		Risks:           []string{"OPENAI_API_KEY \u672a\u8a2d\u5b9a\u6642\u306f\u30eb\u30fc\u30eb\u30d9\u30fc\u30b9\u5206\u6790\u306e\u307f\u8868\u793a"},
		Recommendations: []string{"\u7406\u89e3\u5ea6\u30c6\u30b9\u30c8\u5b8c\u4e86\u7387\u3092\u9031\u6b21\u78ba\u8a8d", "\u5b66\u7fd2\u30d1\u30b9\u53d7\u8b16\u7387\u3092\u5411\u4e0a"},
		GeneratedAt:     at,
	}
}

func extractJSON(s string) string {
	start := strings.Index(s, "{")
	end := strings.LastIndex(s, "}")
	if start >= 0 && end > start {
		return s[start : end+1]
	}
	return s
}
