package gqlconv

import (
	"testing"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
)

func TestToHealth(t *testing.T) {
	h := ToHealth()
	if h == nil {
		t.Fatal("expected non-nil health")
	}
	if !h.Ok || h.Service != "andpad-api" || h.Version != "2.0.0-gqlgen" {
		t.Fatalf("unexpected health: %+v", h)
	}
}

func TestToDashboard(t *testing.T) {
	d := ToDashboard(models.DashboardStats{
		VideosTotal: 10, LearningPathsTotal: 2, QuizzesTotal: 5,
		CompletionsThisMonth: 3, WatchHoursThisMonth: 12.5, ActiveLearners: 7,
	})
	if d.VideosTotal != 10 || d.ActiveLearners != 7 {
		t.Fatalf("unexpected dashboard: %+v", d)
	}
}

func TestFmtTimeViaToCostEntry(t *testing.T) {
	when := time.Date(2024, 7, 8, 15, 30, 0, 0, time.UTC)
	c := ToCostEntry(models.CostEntry{
		ID: "c1", ProjectID: "p1", EntryDate: when, CreatedAt: when,
		EntryType: models.CostEntryMaterial, Amount: 1000,
	})
	if c.EntryDate != "2024-07-08" {
		t.Fatalf("entryDate got %q", c.EntryDate)
	}
	if c.CreatedAt != "2024-07-08T15:30:00Z" {
		t.Fatalf("createdAt got %q", c.CreatedAt)
	}
}
