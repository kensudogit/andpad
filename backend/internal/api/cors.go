// Package api（補助）— CORS 許可オリジンの環境変数解釈。
package api

import (
	"os"
	"strings"
)

// corsOrigins は CORS_ORIGINS 未設定時にローカル Next.js 開発用オリジンを返す。
func corsOrigins() []string {
	raw := os.Getenv("CORS_ORIGINS")
	if raw == "" {
		return []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}
