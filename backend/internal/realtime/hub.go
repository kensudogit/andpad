// Package realtime は GraphQL サブスクリプション向けのプロセス内イベント Hub。
package realtime

import (
	"sync"

	"github.com/pluszero/dental-video-api/internal/graph/generated"
)

// Hub は組織/学習者単位でダッシュボード・進捗・活動イベントを購読者へ配信する（将来 Redis 化想定）。
type Hub struct {
	mu sync.RWMutex

	dashboard map[string][]chan *generated.DashboardStats
	progress  map[string][]chan *generated.WatchProgress
	activity  map[string][]chan *generated.LearningActivityEvent
}

func New() *Hub {
	return &Hub{
		dashboard: map[string][]chan *generated.DashboardStats{},
		progress:  map[string][]chan *generated.WatchProgress{},
		activity:  map[string][]chan *generated.LearningActivityEvent{},
	}
}

func (h *Hub) SubscribeDashboard(orgID string) <-chan *generated.DashboardStats {
	ch := make(chan *generated.DashboardStats, 4)
	h.mu.Lock()
	h.dashboard[orgID] = append(h.dashboard[orgID], ch)
	h.mu.Unlock()
	return ch
}

func (h *Hub) UnsubscribeDashboard(orgID string, ch <-chan *generated.DashboardStats) {
	h.mu.Lock()
	defer h.mu.Unlock()
	list := h.dashboard[orgID]
	for i, c := range list {
		if c == ch {
			h.dashboard[orgID] = append(list[:i], list[i+1:]...)
			close(c)
			break
		}
	}
}

func (h *Hub) PublishDashboard(orgID string, stats *generated.DashboardStats) {
	h.mu.RLock()
	list := append([]chan *generated.DashboardStats(nil), h.dashboard[orgID]...)
	h.mu.RUnlock()
	for _, ch := range list {
		// 遅い購読者はドロップ（UI は次回ポーリングで追いつく想定）
		select {
		case ch <- stats:
		default:
		}
	}
}

func (h *Hub) SubscribeProgress(learnerID string) <-chan *generated.WatchProgress {
	ch := make(chan *generated.WatchProgress, 8)
	h.mu.Lock()
	h.progress[learnerID] = append(h.progress[learnerID], ch)
	h.mu.Unlock()
	return ch
}

func (h *Hub) UnsubscribeProgress(learnerID string, ch <-chan *generated.WatchProgress) {
	h.mu.Lock()
	defer h.mu.Unlock()
	list := h.progress[learnerID]
	for i, c := range list {
		if c == ch {
			h.progress[learnerID] = append(list[:i], list[i+1:]...)
			close(c)
			break
		}
	}
}

func (h *Hub) PublishProgress(learnerID string, p *generated.WatchProgress) {
	h.mu.RLock()
	list := append([]chan *generated.WatchProgress(nil), h.progress[learnerID]...)
	h.mu.RUnlock()
	for _, ch := range list {
		select {
		case ch <- p:
		default:
		}
	}
}

func (h *Hub) SubscribeActivity(learnerID string) <-chan *generated.LearningActivityEvent {
	ch := make(chan *generated.LearningActivityEvent, 16)
	h.mu.Lock()
	h.activity[learnerID] = append(h.activity[learnerID], ch)
	h.mu.Unlock()
	return ch
}

func (h *Hub) UnsubscribeActivity(learnerID string, ch <-chan *generated.LearningActivityEvent) {
	h.mu.Lock()
	defer h.mu.Unlock()
	list := h.activity[learnerID]
	for i, c := range list {
		if c == ch {
			h.activity[learnerID] = append(list[:i], list[i+1:]...)
			close(c)
			break
		}
	}
}

func (h *Hub) PublishActivity(learnerID string, ev *generated.LearningActivityEvent) {
	h.mu.RLock()
	list := append([]chan *generated.LearningActivityEvent(nil), h.activity[learnerID]...)
	h.mu.RUnlock()
	for _, ch := range list {
		select {
		case ch <- ev:
		default:
		}
	}
}
