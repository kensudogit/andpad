package graph

// N+1 回避の DataLoader（講師参照のバッチ取得）

import (
	"context"
	"net/http"
	"time"

	"github.com/graph-gophers/dataloader/v7"
	"github.com/pluszero/dental-video-api/internal/gqlconv"
	"github.com/pluszero/dental-video-api/internal/graph/generated"
	"github.com/pluszero/dental-video-api/internal/service"
)

type loadersKey struct{}

// Loaders はリクエストスコープで講師をまとめて読み込む。
type Loaders struct {
	InstructorByID *dataloader.Loader[string, *generated.Instructor]
}

// NewLoaders は 2ms 待ち合わせで同一リクエスト内の講師 ID をバッチする。
func NewLoaders(svc *service.Service) *Loaders {
	batch := func(ctx context.Context, keys []string) []*dataloader.Result[*generated.Instructor] {
		results := make([]*dataloader.Result[*generated.Instructor], len(keys))
		cache := map[string]*dataloader.Result[*generated.Instructor]{}
		for i, id := range keys {
			if r, ok := cache[id]; ok {
				results[i] = r
				continue
			}
			inst, ok, err := svc.GetInstructor(ctx, id)
			if err != nil {
				r := &dataloader.Result[*generated.Instructor]{Error: err}
				cache[id] = r
				results[i] = r
				continue
			}
			var r *dataloader.Result[*generated.Instructor]
			if ok {
				r = &dataloader.Result[*generated.Instructor]{Data: gqlconv.ToInstructor(inst)}
			} else {
				r = &dataloader.Result[*generated.Instructor]{Data: nil}
			}
			cache[id] = r
			results[i] = r
		}
		return results
	}
	return &Loaders{
		InstructorByID: dataloader.NewBatchedLoader(batch, dataloader.WithWait[string, *generated.Instructor](2*time.Millisecond)),
	}
}

func (l *Loaders) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), loadersKey{}, l)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func loadersFrom(ctx context.Context) *Loaders {
	l, _ := ctx.Value(loadersKey{}).(*Loaders)
	return l
}
