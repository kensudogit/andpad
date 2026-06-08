package main

// dental-video-api の HTTP サーバエントリポイント。
// 環境変数から設定を読み込み、サービス層を初期化して API を待ち受けする。

import (
	"log"
	"net/http"

	"github.com/pluszero/dental-video-api/internal/api"
	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/service"
)

func main() {
	cfg := config.Load()
	svc, err := service.New(cfg)
	if err != nil {
		log.Fatal(err)
	}
	defer svc.Close()

	r := api.NewRouter(svc)
	addr := ":" + cfg.Port
	log.Printf("[dental-video-gateway] postgres=%v microservices=%v listening %s",
		svc.UsePostgres(), cfg.MicroservicesEnabled(), addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatal(err)
	}
}
