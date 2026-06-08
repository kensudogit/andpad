package postgres

import "github.com/pluszero/dental-video-api/internal/auth"

func postgresHash(secret string) (string, error) {
	return auth.HashPassword(secret)
}
