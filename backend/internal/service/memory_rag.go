package service

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/rag"
)

type memoryRagStore struct {
	mu   sync.Mutex
	docs map[string][]models.RagDocument
	seq  int
}

func (s *Service) memoryRag() *memoryRagStore {
	if s.memoryRagStore == nil {
		s.memoryRagStore = &memoryRagStore{
			docs: map[string][]models.RagDocument{
				demoOrgID: defaultMemoryRagDocs(demoOrgID),
			},
		}
	}
	return s.memoryRagStore
}

func defaultMemoryRagDocs(orgID string) []models.RagDocument {
	now := time.Now()
	return []models.RagDocument{
		{
			ID: "mem-rag-1", OrgID: orgID,
			Title: "感染対策マニュアル",
			Content: "手洗いは20秒以上、アルコール消毒はドアノブとスイッチを使用。" +
				"手袋は一回のための使用を原則とする。",
			Tags: []string{"感染対策", "院内規程"}, CreatedAt: now,
		},
		{
			ID: "mem-rag-2", OrgID: orgID,
			Title: "予約キャンセルポリシー",
			Content: "前日17時以降のキャンセルはキャンセル料1000円。" +
				"無断キャンセルは2回で予約制限を検討する。",
			Tags: []string{"受付", "運営"}, CreatedAt: now,
		},
		{
			ID: "mem-rag-3", OrgID: orgID,
			Title: "滅菌・感染管理チェックリスト",
			Content: "ユニット水系統は毎朝フラッシュ。滅菌パックは指示書どおり温度・時間を記録。" +
				"ハンドピースは患者ごとに交換または内部清拭を実施。",
			Tags: []string{"滅菌", "感染対策"}, CreatedAt: now,
		},
	}
}

func (s *Service) memoryListRagDocuments(ctx context.Context) ([]models.RagDocument, error) {
	p, err := s.requireModule(ctx, models.ModuleDocRAG)
	if err != nil {
		return nil, err
	}
	store := s.memoryRag()
	store.mu.Lock()
	defer store.mu.Unlock()
	return append([]models.RagDocument(nil), store.docs[p.OrgID]...), nil
}

func (s *Service) memoryCreateRagDocument(ctx context.Context, in models.RagDocumentInput) (models.RagDocument, error) {
	p, err := s.requireModule(ctx, models.ModuleDocRAG)
	if err != nil {
		return models.RagDocument{}, err
	}
	tags := in.Tags
	if tags == nil {
		tags = []string{}
	}
	store := s.memoryRag()
	store.mu.Lock()
	defer store.mu.Unlock()
	store.seq++
	d := models.RagDocument{
		ID: fmt.Sprintf("mem-rag-%d", store.seq), OrgID: p.OrgID,
		Title: in.Title, Content: in.Content, Tags: tags, CreatedAt: time.Now(),
	}
	store.docs[p.OrgID] = append(store.docs[p.OrgID], d)
	return d, nil
}

func (s *Service) memorySearchRagDocuments(ctx context.Context, query string, limit int) ([]models.RagSearchHit, error) {
	if _, err := s.requireModule(ctx, models.ModuleDocRAG); err != nil {
		return nil, err
	}
	docs, err := s.memoryListRagDocuments(ctx)
	if err != nil {
		return nil, err
	}
	hits := rag.LocalSearch(docs, query, limit)
	if len(hits) > 0 {
		return hits, nil
	}
	return rag.FallbackSearchWhenEmpty(ctx, s.Cfg, s.OpenAI, query, docs), nil
}

func (s *Service) memoryRagAnswer(ctx context.Context, query string) (string, []models.RagSearchHit, error) {
	hits, err := s.memorySearchRagDocuments(ctx, query, 5)
	if err != nil {
		return "", nil, err
	}
	docs, _ := s.memoryListRagDocuments(ctx)
	answer := rag.GenerateAnswer(ctx, s.Cfg, s.OpenAI, query, hits, docs)
	return answer, hits, nil
}
