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
		Summary: fmt.Sprintf("過去%d日間: 進行中案件%d件、健全性%.0f点。請求¥%.0f、実行予算¥%.0f、期間原価¥%.0f、予算差異率%.1f%%。",
			d.PeriodDays, d.ActiveProjects, d.ProjectHealthScore, d.BillingTotal, d.BudgetTotal, d.CostTotal, d.BudgetVariancePct),
		Strengths:       []string{"予算・原価・請求データが案件横断で可視化されています"},
		Risks:           []string{"原価進捗が予算に対して高い案件は完工予想の再算定が必要です"},
		Recommendations: []string{"月次原価レポートで費目別差異を確認", "請求と原価のバランスを四半期ごとにレビュー"},
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
