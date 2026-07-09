package gqlconv

import (
	"testing"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
)

func TestToApiIntegrationLastSyncNil(t *testing.T) {
	when := time.Date(2024, 7, 1, 0, 0, 0, 0, time.UTC)
	a := ToApiIntegration(models.ApiIntegration{
		ID: "api-1", Name: "連携A", Provider: "demo", Status: "ACTIVE", CreatedAt: when,
	})
	if a.LastSyncAt != nil {
		t.Fatalf("expected nil lastSyncAt, got %v", a.LastSyncAt)
	}
}

func TestToApiIntegrationLastSyncSet(t *testing.T) {
	when := time.Date(2024, 7, 1, 0, 0, 0, 0, time.UTC)
	synced := time.Date(2024, 7, 8, 15, 30, 0, 0, time.UTC)
	a := ToApiIntegration(models.ApiIntegration{
		ID: "api-2", Name: "連携B", Provider: "demo", Status: "ACTIVE",
		LastSyncAt: &synced, CreatedAt: when,
	})
	if a.LastSyncAt == nil || *a.LastSyncAt != "2024-07-08T15:30:00Z" {
		t.Fatalf("unexpected lastSyncAt: %+v", a.LastSyncAt)
	}
}

func TestToAndpadAnalyticsDashboard(t *testing.T) {
	when := time.Date(2024, 7, 8, 21, 0, 0, 0, time.UTC)
	d := ToAndpadAnalyticsDashboard(models.AndpadAnalyticsDashboard{
		PeriodDays: 30, BillingTotal: 980000000, ActiveProjects: 1,
		BudgetTotal: 8930000000, CostTotal: 6780000000, BudgetVariancePct: 76,
		GeneratedAt: when,
		Kpis: []models.AndpadAnalyticsKpi{{Label: "案件数", Value: 1}},
	})
	if d.BillingTotal != 980000000 || len(d.Kpis) != 1 {
		t.Fatalf("unexpected dashboard: %+v", d)
	}
	if d.GeneratedAt != "2024-07-08T21:00:00Z" {
		t.Fatalf("generatedAt got %q", d.GeneratedAt)
	}
}
