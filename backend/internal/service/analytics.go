package service

// 建設 PM KPI ボードと OpenAI による経営インサイト生成

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
		WatchHoursByWeek:       []float64{d.WatchHoursThisMonth * 0.2, d.WatchHoursThisMonth * 0.25, d.WatchHoursThisMonth * 0.3, d.WatchHoursThisMonth * 0.25},
		LearnerEngagementScore: 72,
	}
}

// GenerateAnalyticsInsight は KPI JSON を LLM に渡し、失敗時はルールベースの日本語要約にフォールバックする。
func (s *Service) GenerateAnalyticsInsight(ctx context.Context, periodDays int) (models.AnalyticsInsight, error) {
	dash, err := s.AndpadAnalytics(ctx, periodDays)
	if err != nil {
		return models.AnalyticsInsight{}, err
	}
	now := time.Now().UTC().Format(time.RFC3339)
	if s.OpenAI == nil {
		return fallbackConstructionInsight(dash, now), nil
	}
	payload, _ := json.Marshal(dash)
	reply, err := s.OpenAI.Chat(ctx, openai.ConstructionAnalyticsSystem, nil, string(payload))
	if err != nil {
		return fallbackConstructionInsight(dash, now), nil
	}
	var parsed struct {
		Summary         string   `json:"summary"`
		Strengths       []string `json:"strengths"`
		Risks           []string `json:"risks"`
		Recommendations []string `json:"recommendations"`
	}
	if err := json.Unmarshal([]byte(extractJSON(reply)), &parsed); err != nil {
		return fallbackConstructionInsight(dash, now), nil
	}
	return models.AnalyticsInsight{
		Summary: parsed.Summary, Strengths: parsed.Strengths,
		Risks: parsed.Risks, Recommendations: parsed.Recommendations,
		GeneratedAt: now,
	}, nil
}

func fallbackConstructionInsight(d models.AndpadAnalyticsDashboard, at string) models.AnalyticsInsight {
	return models.AnalyticsInsight{
		Summary: fmt.Sprintf("過去%d日間: 進行中案件%d件、プロジェクト健全性スコア%.0f点。請求合計¥%.0f。",
			d.PeriodDays, d.ActiveProjects, d.ProjectHealthScore, d.BillingTotal),
		Strengths:       []string{"案件データが集約され、モジュール利用状況を可視化できます"},
		Risks:           []string{"OPENAI_API_KEY 未設定時はルールベース分析のみ表示"},
		Recommendations: []string{"保留案件の原因を週次で確認", "工程・安全モジュールの記録頻度を向上"},
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
