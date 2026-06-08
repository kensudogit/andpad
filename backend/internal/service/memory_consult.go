package service

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/pluszero/dental-video-api/internal/consult"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/openai"
	"github.com/pluszero/dental-video-api/internal/tenant"
	"github.com/pluszero/dental-video-api/internal/textutil"
)

type memoryConsultStore struct {
	mu       sync.Mutex
	threads  map[string]models.ConsultationThread
	messages map[string][]models.ConsultationMessage
	seq      int
}

func (s *Service) memoryConsult() *memoryConsultStore {
	if s.memoryConsultStore == nil {
		s.memoryConsultStore = &memoryConsultStore{
			threads:  make(map[string]models.ConsultationThread),
			messages: make(map[string][]models.ConsultationMessage),
		}
	}
	return s.memoryConsultStore
}

func (s *Service) memoryListConsultThreads(ctx context.Context) ([]models.ConsultationThread, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return nil, err
	}
	orgWide := consultOrgWide(p)
	store := s.memoryConsult()
	store.mu.Lock()
	defer store.mu.Unlock()
	out := make([]models.ConsultationThread, 0)
	for _, t := range store.threads {
		if t.OrgID != p.OrgID {
			continue
		}
		if !orgWide && t.UserID != p.UserID {
			continue
		}
		out = append(out, t)
	}
	return out, nil
}

func (s *Service) memoryGetConsultThread(ctx context.Context, threadID string) (models.ConsultationThread, []models.ConsultationMessage, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return models.ConsultationThread{}, nil, err
	}
	orgWide := consultOrgWide(p)
	store := s.memoryConsult()
	store.mu.Lock()
	defer store.mu.Unlock()
	t, ok := store.threads[threadID]
	if !ok || t.OrgID != p.OrgID || (!orgWide && t.UserID != p.UserID) {
		return models.ConsultationThread{}, nil, tenant.ErrForbidden
	}
	return t, append([]models.ConsultationMessage(nil), store.messages[threadID]...), nil
}

func (s *Service) memorySendConsultation(ctx context.Context, threadID, message string) (models.ConsultationMessage, models.ConsultationMessage, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return models.ConsultationMessage{}, models.ConsultationMessage{}, err
	}
	store := s.memoryConsult()
	store.mu.Lock()

	now := time.Now()
	if threadID == "" {
		store.seq++
		threadID = fmt.Sprintf("mem-thread-%d", store.seq)
		title := textutil.TruncateRunes(message, 40)
		store.threads[threadID] = models.ConsultationThread{
			ID: threadID, OrgID: p.OrgID, UserID: p.UserID, Title: title, CreatedAt: now,
		}
	}

	t, ok := store.threads[threadID]
	if !ok {
		store.mu.Unlock()
		return models.ConsultationMessage{}, models.ConsultationMessage{}, tenant.ErrForbidden
	}
	if t.OrgID != p.OrgID || t.UserID != p.UserID {
		store.mu.Unlock()
		return models.ConsultationMessage{}, models.ConsultationMessage{}, tenant.ErrForbidden
	}

	store.seq++
	userMsg := models.ConsultationMessage{
		ID: fmt.Sprintf("mem-msg-%d", store.seq), ThreadID: threadID, Role: "user", Content: message, CreatedAt: now,
	}
	store.messages[threadID] = append(store.messages[threadID], userMsg)

	history := make([]openai.ChatMessage, 0, len(store.messages[threadID]))
	for _, m := range store.messages[threadID] {
		if m.ID == userMsg.ID {
			continue
		}
		history = append(history, openai.ChatMessage{Role: m.Role, Content: m.Content})
	}
	store.mu.Unlock()
	reply := consult.GenerateReply(ctx, s.Cfg, s.OpenAI, history, message)
	store.mu.Lock()

	store.seq++
	aiMsg := models.ConsultationMessage{
		ID: fmt.Sprintf("mem-msg-%d", store.seq), ThreadID: threadID, Role: "assistant", Content: reply, CreatedAt: time.Now(),
	}
	store.messages[threadID] = append(store.messages[threadID], aiMsg)
	store.mu.Unlock()
	return userMsg, aiMsg, nil
}
