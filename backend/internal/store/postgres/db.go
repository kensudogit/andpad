// Package postgres はマルチテナント SaaS の永続化層（pgx + 埋め込みマイグレーション）。
package postgres

import (
	"context"
	"fmt"
	"io/fs"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pluszero/dental-video-api/migrations"
)

// DB は接続プールとマイグレーション・シードのエントリを持つ。
type DB struct {
	Pool *pgxpool.Pool
}

// Connect は DATABASE_URL でプールを開き疎通確認する。
func Connect(databaseURL string) (*DB, error) {
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	cfg.ConnConfig.ConnectTimeout = 10 * time.Second
	pool, err := pgxpool.NewWithConfig(context.Background(), cfg)
	if err != nil {
		return nil, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return &DB{Pool: pool}, nil
}

func (db *DB) Close() {
	db.Pool.Close()
}

// Migrate は未適用 SQL を schema_migrations で追跡しながら適用する。
func (db *DB) Migrate() error {
	ctx := context.Background()
	if _, err := db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			filename TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`); err != nil {
		return err
	}
	if err := db.applyFromFS(ctx, migrations.FS); err == nil {
		return nil
	}
	return db.migrateFromDisk(ctx)
}

func (db *DB) applyFromFS(ctx context.Context, filesystem fs.FS) error {
	entries, err := fs.ReadDir(filesystem, ".")
	if err != nil {
		return err
	}
	names := make([]string, 0, len(entries))
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".sql") {
			continue
		}
		names = append(names, e.Name())
	}
	if len(names) == 0 {
		return fmt.Errorf("no migrations in embed FS")
	}
	sort.Strings(names)
	for _, name := range names {
		b, err := fs.ReadFile(filesystem, name)
		if err != nil {
			return err
		}
		if err := db.applyOne(ctx, name, string(b)); err != nil {
			return err
		}
	}
	return nil
}

// migrateFromDisk は embed 失敗時のローカル開発フォールバック。
func (db *DB) migrateFromDisk(ctx context.Context) error {
	paths := []string{"migrations/001_init.sql", "backend/migrations/001_init.sql"}
	for _, p := range paths {
		b, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		name := strings.TrimPrefix(strings.TrimPrefix(p, "backend/"), "migrations/")
		if err := db.applyOne(ctx, name, string(b)); err != nil {
			return err
		}
		return nil
	}
	return fmt.Errorf("migrations not found")
}

func (db *DB) applyOne(ctx context.Context, filename, sql string) error {
	var exists bool
	if err := db.Pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE filename = $1)`,
		filename,
	).Scan(&exists); err != nil {
		return err
	}
	if exists {
		return nil
	}
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	if _, err := tx.Exec(ctx, sql); err != nil {
		return fmt.Errorf("migration %s: %w", filename, err)
	}
	if _, err := tx.Exec(ctx, `INSERT INTO schema_migrations (filename) VALUES ($1)`, filename); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

// SeedIfEmpty は初回デプロイ用デモ組織を投入し、既存 DB でもデモ文言を修復する。
func (db *DB) SeedIfEmpty(ctx context.Context) error {
	var n int
	if err := db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM organizations`).Scan(&n); err != nil {
		return err
	}
	if n == 0 {
		if err := seedDemo(ctx, db); err != nil {
			return err
		}
	}
	return ensureDemoCredentials(ctx, db)
}
