// Package service は GraphQL/HTTP から呼ばれるアプリケーション境界（ユースケース層）。
package service

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/openai"
	"github.com/pluszero/dental-video-api/internal/realtime"
	"github.com/pluszero/dental-video-api/internal/saasremote"
	"github.com/pluszero/dental-video-api/internal/storage"
	"github.com/pluszero/dental-video-api/internal/store"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
)

// Service は Postgres またはインメモリ、S3、OpenAI、リアルタイム Hub を束ねる。
type Service struct {
	Cfg    config.Config
	Memory *store.Store
	PG     *postgres.DB
	S3       *storage.S3
	OpenAI   *openai.Client
	Realtime *realtime.Hub
	SaaSRemote *saasremote.Client
	// memoryModuleEnabled は DATABASE_URL 未設定のローカル開発用。
	memoryModuleEnabled map[models.SaasModuleCode]bool
	memoryConsultStore  *memoryConsultStore
	memoryRagStore      *memoryRagStore
}

// New は DB 接続・マイグレーション・空 DB へのデモシードまで行う。
func New(cfg config.Config) (*Service, error) {
	svc := &Service{Cfg: cfg, OpenAI: openai.New(cfg), Realtime: realtime.New()}
	var err error
	svc.S3, err = storage.New(cfg)
	if err != nil {
		return nil, err
	}
	if cfg.DatabaseURL == "" {
		if config.IsRailway() && os.Getenv("USE_MEMORY_STORE") != "true" {
			return nil, config.RailwayDatabaseRequiredError()
		}
		svc.Memory = store.New()
		svc.initMemoryModules()
		return svc, nil
	}
	svc.PG, err = postgres.Connect(cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}
	if err := svc.PG.Migrate(); err != nil {
		return nil, err
	}
	if err := svc.PG.SeedIfEmpty(context.Background()); err != nil {
		return nil, err
	}
	if cfg.MicroservicesEnabled() {
		client := saasremote.New(cfg)
		if waitForRemote(client) {
			svc.SaaSRemote = client
			log.Printf("[gateway] SaaS microservices: remote (dx=%s)", cfg.SaasDxURL)
		} else {
			log.Printf("[gateway] SaaS microservices unreachable at %s; using in-process handlers", cfg.SaasDxURL)
		}
	}
	return svc, nil
}

func (s *Service) Close() {
	if s.PG != nil {
		s.PG.Close()
	}
}

// UsePostgres は本番データが Postgres かどうか（ステータス表示用）。
func (s *Service) UsePostgres() bool {
	return s.PG != nil
}

func waitForRemote(client *saasremote.Client) bool {
	for attempt := 0; attempt < 5; attempt++ {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		ok := client.Available(ctx)
		cancel()
		if ok {
			return true
		}
		if attempt < 4 {
			time.Sleep(time.Second)
		}
	}
	return false
}
