// AI Board 用 KPI・集計の型定義。
package models

type AnalyticsKpi struct {
	Label    string
	Value    float64
	Unit     string
	TrendPct float64
}

type CategoryMetric struct {
	Category string
	Count    int
}

type VideoMetric struct {
	VideoID     string
	Title       string
	Views       int
	Completions int
}

type AnalyticsBoard struct {
	PeriodDays              int
	Kpis                    []AnalyticsKpi
	WatchHoursByWeek        []float64
	CompletionsByCategory   []CategoryMetric
	TopVideos               []VideoMetric
	LearnerEngagementScore  float64
}

type AnalyticsInsight struct {
	Summary         string
	Strengths       []string
	Risks           []string
	Recommendations []string
	GeneratedAt     string
}
