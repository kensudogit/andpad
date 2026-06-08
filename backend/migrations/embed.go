// Package migrations はバイナリに埋め込む SQL マイグレーション（Railway 単一コンテナ向け）。
package migrations

import "embed"

// FS は postgres.Migrate が起動時に適用する .sql ファイル群。
//
//go:embed *.sql
var FS embed.FS
