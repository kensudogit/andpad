package rag

import (
	"testing"

	"github.com/pluszero/dental-video-api/internal/models"
)

func TestLocalSearchJapanese(t *testing.T) {
	docs := []models.RagDocument{{
		ID: "1", Title: "感染対策マニュアル", Content: "手洗いは20秒以上",
	}}
	hits := LocalSearch(docs, "手洗い", 5)
	if len(hits) != 1 {
		t.Fatalf("expected 1 hit, got %d", len(hits))
	}
	if hits[0].Title != "感染対策マニュアル" {
		t.Fatalf("unexpected title %q", hits[0].Title)
	}
}
