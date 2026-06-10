package postgres

// デモクリニック（org_demo）の投入と文字化け修復 — 本番デモログイン用

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/auth"
	"github.com/pluszero/dental-video-api/internal/demo"
)

const demoEmail = "demo@sakura-dental.jp"
const demoPassword = "demo1234" // デモ環境向け既知パスワード（本番は別途ローテーション推奨）

// ensureDemoCredentials は org_demo とデモユーザーを常にログイン可能な状態に保つ。
func ensureDemoCredentials(ctx context.Context, db *DB) error {
	hash, err := auth.HashPassword(demoPassword)
	if err != nil {
		return err
	}

	var orgDemo bool
	if err := db.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM organizations WHERE id='org_demo')`).Scan(&orgDemo); err != nil {
		return err
	}
	if !orgDemo {
		if err := insertDemoOrg(ctx, db, hash); err != nil {
			return err
		}
	} else {
		var userID string
		err = db.Pool.QueryRow(ctx, `SELECT id FROM users WHERE LOWER(email)=$1`, demoEmail).Scan(&userID)
		if errors.Is(err, pgx.ErrNoRows) {
			if err := insertDemoUser(ctx, db, hash); err != nil {
				return err
			}
		} else if err != nil {
			return err
		} else {
			_, err = db.Pool.Exec(ctx, `UPDATE users SET password_hash=$1 WHERE id=$2`, hash, userID)
			if err != nil {
				return err
			}
		}
	}
	if err := ensureSaasDemoData(ctx, db); err != nil {
		return err
	}
	return repairDemoTextEncoding(ctx, db)
}

// repairDemoTextEncoding は過去マイグレーションで文字化けした日本語ラベルを上書き修復する。
func repairDemoTextEncoding(ctx context.Context, db *DB) error {
	_, err := db.Pool.Exec(ctx, `
		UPDATE live_sessions SET title=$2, description=$3
		WHERE id=$1 AND org_id='org_demo'`,
		"live-1", "\u6b6f\u5185\u7642\u6cd5\u30e9\u30a4\u30d6", "\u958b\u7a9e\u30c7\u30e2")
	if err != nil {
		return err
	}
	_, err = db.Pool.Exec(ctx, `
		UPDATE case_discussions SET title=$2, summary=$3
		WHERE id=$1 AND org_id='org_demo'`,
		"case-1", "\u96e3\u629c\u6b6f\u75c7\u4f8b", "\u5206\u5272\u629c\u6b6f\u306e\u5224\u65ad")
	if err != nil {
		return err
	}
	return repairDemoCatalog(ctx, db)
}

func repairDemoCatalog(ctx context.Context, db *DB) error {
	for _, v := range demo.CatalogVideos() {
		if _, err := db.Pool.Exec(ctx, `
			INSERT INTO videos (id, org_id, instructor_id, title, description, category, procedure, skill_level,
				duration_sec, thumbnail_url, video_url, featured, published_at)
			VALUES ($1, 'org_demo', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
			ON CONFLICT (id) DO UPDATE SET
				instructor_id = EXCLUDED.instructor_id,
				title = EXCLUDED.title,
				description = EXCLUDED.description,
				category = EXCLUDED.category,
				procedure = EXCLUDED.procedure,
				skill_level = EXCLUDED.skill_level,
				duration_sec = EXCLUDED.duration_sec,
				thumbnail_url = EXCLUDED.thumbnail_url,
				video_url = EXCLUDED.video_url,
				featured = EXCLUDED.featured`,
			v.ID, v.InstructorID, v.Title, v.Description, v.Category, v.Procedure, v.SkillLevel,
			v.DurationSec, v.ThumbnailURL(), v.EmbedURL(), v.Featured,
		); err != nil {
			return err
		}
	}

	for _, p := range demo.LearningPaths() {
		if _, err := db.Pool.Exec(ctx, `
			INSERT INTO learning_paths (id, org_id, title, description, category, skill_level, estimated_minutes, enrolled_count, certificate_title)
			VALUES ($1, 'org_demo', $2, $3, $4, $5, $6, $7, $8)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				description = EXCLUDED.description,
				category = EXCLUDED.category,
				skill_level = EXCLUDED.skill_level,
				estimated_minutes = EXCLUDED.estimated_minutes,
				certificate_title = EXCLUDED.certificate_title`,
			p.ID, p.Title, p.Description, p.Category, p.SkillLevel, p.EstimatedMinutes, p.EnrolledCount, p.Certificate,
		); err != nil {
			return err
		}
		for i, vid := range p.VideoIDs {
			if _, err := db.Pool.Exec(ctx, `
				INSERT INTO path_videos (path_id, video_id, sort_order) VALUES ($1, $2, $3)
				ON CONFLICT (path_id, video_id) DO UPDATE SET sort_order = EXCLUDED.sort_order`,
				p.ID, vid, i+1,
			); err != nil {
				return err
			}
		}
	}
	return nil
}

func insertDemoOrg(ctx context.Context, db *DB, hash string) error {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	orgID := "org_demo"
	userID := "user_demo"
	slug := "sample-construction"
	var slugTaken bool
	if err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM organizations WHERE slug=$1 AND id<>$2)`, slug, orgID).Scan(&slugTaken); err != nil {
		return err
	}
	if slugTaken {
		slug = "sample-construction-demo"
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO organizations (id, name, slug, plan_tier, subscription_status, seat_count, timezone)
		VALUES ($1, $2, $3, 'PRO', 'ACTIVE', 10, 'Asia/Tokyo')
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			slug = EXCLUDED.slug`,
		orgID, "\u30b5\u30f3\u30d7\u30eb\u5efa\u8a2d\u682a\u5f0f\u4f1a\u793e", slug)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
		userID, demoEmail, "\u7530\u4e2d \u5065\u4e00", hash)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO team_members (id, org_id, user_id, role) VALUES ($1, $2, $3, 'OWNER')
		ON CONFLICT (org_id, user_id) DO NOTHING`,
		"tm_demo", orgID, userID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO usage_counters (org_id) VALUES ($1) ON CONFLICT (org_id) DO NOTHING`, orgID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func insertDemoUser(ctx context.Context, db *DB, hash string) error {
	userID := "user_demo"
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	_, err = tx.Exec(ctx, `
		INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
		userID, demoEmail, "\u7530\u4e2d \u5065\u4e00", hash)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO team_members (id, org_id, user_id, role) VALUES ($1, 'org_demo', $2, 'OWNER')
		ON CONFLICT (org_id, user_id) DO NOTHING`,
		"tm_demo", userID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func seedDemo(ctx context.Context, db *DB) error {
	now := time.Now()
	orgID := "org_demo"
	userID := "user_demo"
	hash, err := auth.HashPassword(demoPassword)
	if err != nil {
		return err
	}

	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		INSERT INTO organizations (id, name, slug, plan_tier, subscription_status, seat_count, timezone)
		VALUES ($1, $2, $3, 'PRO', 'ACTIVE', 10, 'Asia/Tokyo')`,
		orgID, "\u30b5\u30f3\u30d7\u30eb\u5efa\u8a2d\u682a\u5f0f\u4f1a\u793e", "sample-construction")
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)`,
		userID, "demo@sakura-dental.jp", "\u7530\u4e2d \u5065\u4e00", hash)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO team_members (id, org_id, user_id, role) VALUES ($1, $2, $3, 'OWNER')`,
		"tm_demo", orgID, userID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO usage_counters (org_id) VALUES ($1)`, orgID)
	if err != nil {
		return err
	}

	inst := []struct{ id, name, title, spec, bio string }{
		{"inst-1", "\u7530\u4e2d \u5065\u4e00", "\u6b6f\u79d1\u533b\u5e2b", "\u6b6f\u5185\u7642\u6cd5", "\u5927\u5b66\u75c5\u9662\u6b6f\u5185\u79d1"},
		{"inst-2", "\u4f50\u85e4 \u7f8e\u54b2", "\u6b6f\u79d1\u885b\u751f\u58eb", "\u6b6f\u5468\u6cbb\u7642", "SRP\u6307\u5c0e"},
		{"inst-3", "\u9234\u6728 \u5927\u8f14", "\u6b6f\u79d1\u533b\u5e2b", "\u53e3\u8154\u5916\u79d1", "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8"},
	}
	for _, i := range inst {
		_, err = tx.Exec(ctx, `
			INSERT INTO instructors (id, org_id, name, title, specialty, bio, avatar_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			i.id, orgID, i.name, i.title, i.spec, i.bio, "/avatars/"+i.id+".svg")
		if err != nil {
			return err
		}
	}

	type vid struct {
		id, title, desc, cat, proc, level string
		dur                               int
		thumb, url, instID                string
		featured                          bool
	}
	videos := []vid{
		{"v-1", "\u6839\u7ba1\u6cbb\u7642 Step1", "\u958b\u7a9e\u3068\u30a2\u30af\u30bb\u30b9", "ENDODONTICS", "\u6839\u7ba1\u6cbb\u7642", "BEGINNER", 720,
			"https://placehold.co/640x360/0d9488/fff?text=Endo", demo.VideoURL("v-1"), "inst-1", true},
		{"v-3", "SRP \u57fa\u672c\u624b\u6280", "SRP\u57fa\u790e", "PERIODONTICS", "SRP", "BEGINNER", 600,
			"https://placehold.co/640x360/059669/fff?text=SRP", demo.VideoURL("v-3"), "inst-2", true},
		{"v-6", "\u611f\u67d3\u5bfe\u7b56", "\u6ec1\u83cc\u30b5\u30a4\u30af\u30eb", "INFECTION_CONTROL", "\u6ec1\u83cc", "BEGINNER", 480,
			"https://placehold.co/640x360/475569/fff?text=Sterile", demo.VideoURL("v-6"), "inst-2", true},
	}
	for _, v := range videos {
		_, err = tx.Exec(ctx, `
			INSERT INTO videos (id, org_id, instructor_id, title, description, category, procedure, skill_level,
				duration_sec, thumbnail_url, video_url, featured, published_at)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
			v.id, orgID, v.instID, v.title, v.desc, v.cat, v.proc, v.level, v.dur, v.thumb, v.url, v.featured, now)
		if err != nil {
			return err
		}
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO learning_paths (id, org_id, title, description, category, skill_level, estimated_minutes, certificate_title)
		VALUES ($1, $2, $3, $4, 'ENDODONTICS', 'BEGINNER', 25, $5)`,
		"path-1", orgID, "\u6839\u7ba1\u57fa\u790e", "\u521d\u7d1a\u30b3\u30fc\u30b9", "\u6839\u7ba1\u4fee\u4e86")
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO path_videos (path_id, video_id, sort_order) VALUES ('path-1', 'v-1', 1)`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO live_sessions (id, org_id, host_user_id, title, description, scheduled_at, status, stream_url)
		VALUES ($1, $2, $3, $4, $5, $6, 'SCHEDULED', '')`,
		"live-1", orgID, userID, "\u6b6f\u5185\u7642\u6cd5\u30e9\u30a4\u30d6", "\u958b\u7a9e\u30c7\u30e2", now.Add(48*time.Hour))
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO case_discussions (id, org_id, author_user_id, title, summary, status)
		VALUES ($1, $2, $3, $4, $5, 'OPEN')`,
		"case-1", orgID, userID, "\u96e3\u629c\u6b6f\u75c7\u4f8b", "\u5206\u5272\u629c\u6b6f\u306e\u5224\u65ad")
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// ensureSaasDemoData seeds sample records for SaaS business modules on org_demo.
func ensureSaasDemoData(ctx context.Context, db *DB) error {
	const orgID = "org_demo"

	_, err := db.Pool.Exec(ctx, `
		INSERT INTO org_modules (org_id, module_code, enabled)
		SELECT $1, code, TRUE FROM saas_modules
		ON CONFLICT DO NOTHING`, orgID)
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO dx_initiatives (id, org_id, title, description, status, progress_pct, owner_name, due_date)
		VALUES ($1, $2, $3, $4, 'IN_PROGRESS', 35, $5, CURRENT_DATE + 30)
		ON CONFLICT (id) DO NOTHING`,
		"dx-1", orgID, "ペーパーレス受付", "タブレット受付と電子カルテ連携", "\u7530\u4e2d \u5065\u4e00")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO crm_contacts (id, org_id, name, email, phone, company, stage, notes)
		VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', $7)
		ON CONFLICT (id) DO NOTHING`,
		"crm-1", orgID, "\u5c71\u7530 \u82b1\u5b50", "hanako@example.com", "090-1234-5678",
		"\u5c71\u7530\u69d8", "定期検診のリマインド希望")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO contract_templates (id, org_id, name, body)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (id) DO NOTHING`,
		"ct-1", orgID, "\u6b3d\u4e0d\u958b\u793a\u540c\u610f\u66f8",
		"\u672c\u9662\u306f\u60a3\u8005\u69d8\u306e\u533b\u7642\u60c5\u5831\u3092\u9069\u6cd5\u306b\u7ba1\u7406\u3057\u3001\u6b3d\u4e0d\u958b\u793a\u306b\u95a2\u3059\u308b\u6cd5\u4ee4\u306b\u5f93\u3044\u307e\u3059\u3002")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO rag_documents (id, org_id, title, content, tags)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (id) DO NOTHING`,
		"rag-1", orgID, "\u611f\u67d3\u5bfe\u7b56\u30de\u30cb\u30e5\u30a2\u30eb",
		"\u624b\u6e17\u306f20\u79d2\u4ee5\u4e0a\u3001\u30a2\u30eb\u30b3\u30fc\u30eb\u6d88\u6bd2\u306f\u30c9\u30a2\u30ce\u30d6\u3068\u30b9\u30a4\u30c3\u30c1\u3092\u4f7f\u7528\u3002\u624b\u888b\u306f\u4e00\u56de\u306e\u305f\u3081\u306e\u4f7f\u7528\u3092\u539f\u5247\u3068\u3059\u308b\u3002",
		[]string{"感染対策", "院内規程"})
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO rag_documents (id, org_id, title, content, tags)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (id) DO NOTHING`,
		"rag-2", orgID, "\u4e88\u7d04\u30ad\u30e3\u30f3\u30bb\u30eb\u30dd\u30ea\u30b7\u30fc",
		"\u524d\u65e517\u6642\u4ee5\u964d\u306e\u30ad\u30e3\u30f3\u30bb\u30eb\u306f\u30ad\u30e3\u30f3\u30bb\u30eb\u65991000\u5186\u3002\u7121\u65ad\u30ad\u30e3\u30f3\u30bb\u30eb\u306f2\u56de\u3067\u4e88\u7d04\u5236\u9650\u3092\u691c\u8a0e\u3059\u308b\u3002",
		[]string{"受付", "運営"})
	if err != nil {
		return err
	}

	return ensureConstructionDemoData(ctx, db)
}

func ensureConstructionDemoData(ctx context.Context, db *DB) error {
	const orgID = "org_demo"
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO construction_projects (id, org_id, name, site_address, status, manager_name, start_date, end_date)
		VALUES ($1, $2, $3, $4, 'IN_PROGRESS', $5, CURRENT_DATE - 30, CURRENT_DATE + 180)
		ON CONFLICT (id) DO NOTHING`,
		"prj-demo-1", orgID, "\u6e0b\u8c37\u30aa\u30d5\u30a3\u30b9\u30d3\u30eb\u65b0\u7bc9\u5de5\u4e8b",
		"\u6771\u4eac\u90fd\u6e0b\u8c37\u533a\u90531-1-1", "\u5c71\u7530 \u592a\u90ce")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO project_module_records (id, org_id, project_id, module_code, title, status, detail, person_name, record_date)
		VALUES
			($1, $2, $3, 'CONSTRUCTION_MGMT', $4, 'IN_PROGRESS', $5, $6, CURRENT_DATE),
			($7, $2, $3, 'DRAWINGS', $8, 'APPROVED', $9, $6, CURRENT_DATE),
			($10, $2, $3, 'INSPECTION', $11, 'OPEN', $12, $6, CURRENT_DATE)
		ON CONFLICT (id) DO NOTHING`,
		"rec-demo-1", orgID, "prj-demo-1",
		"\u57fa\u790e\u5de5\u7a0b\u9032\u6357\u78ba\u8a8d", "\u914d\u7b4b\u7d4c\u306e\u914d\u7f6e\u5b8c\u4e86\u3001\u6b21\u56de\u30b3\u30f3\u30af\u30ea\u30fc\u30c8\u6253\u8a2d",
		"\u5c71\u7530 \u592a\u90ce",
		"rec-demo-2", "\u69cb\u9020\u56f3\u7b2c3\u7248", "\u5c4b\u4e0a\u8a73\u7d30\u56f3\u3092\u66f4\u65b0",
		"rec-demo-3", "\u914d\u7b4b\u7d4c\u691c\u67fb", "\u7b2c2\u968e\u6bb5\u306e\u54c1\u8cea\u691c\u67fb\u4e88\u5b9a")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO project_module_records (id, org_id, project_id, module_code, title, status, detail, person_name, record_date)
		VALUES
			($1, $2, $3, 'E_DELIVERY', $4, 'SUBMITTED', $5, $6, CURRENT_DATE),
			($7, $2, $3, 'BM', $8, 'SCHEDULED', $9, $6, CURRENT_DATE)
		ON CONFLICT (id) DO NOTHING`,
		"rec-demo-4", orgID, "prj-demo-1",
		"\u7ae3\u5de5\u56f3\u66f8\u96fb\u5b50\u7d0d\u54c1", "\u5efa\u8a2d\u4e3b\u3078\u306e\u7b2c1\u6b21\u7d0d\u54c1\u5b8c\u4e86",
		"\u5c71\u7530 \u592a\u90ce",
		"rec-demo-5", "\u7a7a\u8abf\u8a2d\u70b9\u691c", "\u5e74\u6b21\u5b9a\u671f\u70b9\u691c\u4e88\u5b9a")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO api_integrations (id, org_id, name, provider, endpoint_url, api_key_hint, status, last_sync_at)
		VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', NOW())
		ON CONFLICT (id) DO NOTHING`,
		"api-demo-1", orgID, "kintone \u6848\u4ef6\u9023\u643a", "kintone",
		"https://example.cybozu.com/k/v1/", "****7a3f")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO bim_models (id, org_id, project_id, title, format, viewer_url, file_size_mb, status, uploaded_by)
		VALUES ($1, $2, $3, $4, 'glTF', $5, 128.5, 'READY', $6)
		ON CONFLICT (id) DO NOTHING`,
		"bim-demo-1", orgID, "prj-demo-1",
		"\u672c\u9928\u69cb\u9020BIM\u30e2\u30c7\u30eb v2",
		"https://modelviewer.dev/shared-assets/models/Astronaut.glb",
		"\u5c71\u7530 \u592a\u90ce")
	if err != nil {
		return err
	}

	return ensureBudgetDemoData(ctx, db)
}

func ensureBudgetDemoData(ctx context.Context, db *DB) error {
	const orgID = "org_demo"
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO project_budgets (id, org_id, project_id, name, budget_type, status, version_no, contract_amount, notes, approved_at)
		VALUES
			($1, $2, $3, $4, 'EXECUTION_BUDGET', 'APPROVED', 3, 4850000000, $5, NOW()),
			($6, $2, $3, $7, 'ESTIMATE', 'LOCKED', 1, 5200000000, $8, NOW())
		ON CONFLICT (id) DO NOTHING`,
		"bud-demo-1", orgID, "prj-demo-1",
		"\u5b9f\u884c\u4e88\u7b97 v3", "\u672c\u5de5\u4e8b\u78ba\u5b9a\u5f8c\u306e\u6700\u7d42\u4e88\u7b97",
		"bud-demo-2", "\u5f53\u521d\u898b\u7a4d v1", "\u5165\u672d\u6642\u70b9\u306e\u898b\u7a4d")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO budget_line_items (id, org_id, budget_id, category_code, category_name, wbs_code, description,
			estimate_amount, budget_amount, committed_amount, actual_amount, sort_order)
		VALUES
			('bli-demo-1', $1, 'bud-demo-1', 'DIRECT', $2, 'WBS-01', $3, 1850000000, 1820000000, 1650000000, 980000000, 1),
			('bli-demo-2', $1, 'bud-demo-1', 'SUBCONTRACT', $4, 'WBS-02', $5, 980000000, 960000000, 890000000, 520000000, 2),
			('bli-demo-3', $1, 'bud-demo-1', 'MATERIAL', $6, 'WBS-03', $7, 720000000, 710000000, 680000000, 410000000, 3),
			('bli-demo-4', $1, 'bud-demo-1', 'LABOR', $8, 'WBS-04', $9, 380000000, 370000000, 350000000, 185000000, 4),
			('bli-demo-5', $1, 'bud-demo-1', 'TEMPORARY', $10, 'WBS-05', $11, 120000000, 115000000, 110000000, 35000000, 5),
			('bli-demo-6', $1, 'bud-demo-1', 'OVERHEAD', $12, 'WBS-06', $13, 95000000, 90000000, 75000000, 12000000, 6),
			('bli-demo-7', $1, 'bud-demo-1', 'GENERAL', $14, 'WBS-07', $15, 575000000, 615000000, 165000000, 3000000, 7)
		ON CONFLICT (id) DO NOTHING`,
		orgID,
		"\u76f4\u63a5\u5de5\u4e8b\u8cbb", "\u4f53\u6839\u5de5\u4e8b\uff08RC\u9020\uff09",
		"\u5916\u6ce8\u8cbb", "\u96fb\u6c17\u30fb\u7a7a\u8abf\u8a2d\u5099",
		"\u6750\u6599\u8cbb", "\u9244\u9aa8\u30fb\u30b3\u30f3\u30af\u30ea\u30fc\u30c8",
		"\u52b4\u52d9\u8cbb", "\u73fe\u5834\u7763\u7766\u30fb\u4f5c\u696d\u54e1",
		"\u5047\u8a2d\u8cbb", "\u5047\u8a2d\u8db3\u5834\u30fb\u5047\u8a2d\u96fb\u6c17",
		"\u7d4c\u8cbb", "\u73fe\u5834\u7d4c\u8cbb\u30fb\u6d88\u8017\u54c1",
		"\u4e00\u822c\u7ba1\u7406\u8cbb", "\u672c\u793e\u914d\u8ce6\u30fb\u9593\u63a5\u8cbb")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO cost_entries (id, org_id, project_id, line_item_id, entry_type, vendor_name, description, amount, entry_date, invoice_no, recorded_by)
		VALUES
			('cost-demo-1', $1, 'prj-demo-1', 'bli-demo-1', 'SUBCONTRACT', $2, $3, 28500000, CURRENT_DATE - 3, 'INV-2026-0412', $4),
			('cost-demo-2', $1, 'prj-demo-1', 'bli-demo-3', 'MATERIAL', $5, $6, 42800000, CURRENT_DATE - 7, 'INV-2026-0398', $7),
			('cost-demo-3', $1, 'prj-demo-1', 'bli-demo-2', 'SUBCONTRACT', $8, $9, 15200000, CURRENT_DATE - 10, 'INV-2026-0371', $4)
		ON CONFLICT (id) DO NOTHING`,
		orgID,
		"\u682a\u5f0f\u4f1a\u793e\u3007\u3007\u5efa\u8a2d", "3\u968e\u30b9\u30e9\u30d6\u30b3\u30f3\u30af\u30ea\u30fc\u30c8\u6253\u8a2d", "\u5c71\u7530 \u592a\u90ce",
		"\u65e5\u672c\u88fd\u9244\u682a\u5f0f\u4f1a\u793e", "H\u5f62\u92fc 4\u968e\u5206\u7d0d\u5165", "\u4f50\u85e4 \u82b1\u5b50",
		"\u25b3\u25b3\u96fb\u6c17\u5de5\u696d", "\u914d\u7ba1\u5de5\u4e8b \u7b2c2\u5de5\u533a")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO project_budgets (id, org_id, project_id, name, budget_type, status, version_no, contract_amount, notes)
		VALUES ('bud-demo-3', $1, 'prj-demo-1', $2, 'EXECUTION_BUDGET', 'DRAFT', 4, 4850000000, $3)
		ON CONFLICT (id) DO NOTHING`,
		orgID, "\u5b9f\u884c\u4e88\u7b97 v4\uff08\u6539\u5b9a\u6848\uff09", "\u8a2d\u8a08\u5909\u66f4\u5bfe\u5fdc\u306e\u6539\u5b9a\u6848")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO budget_line_items (id, org_id, budget_id, category_code, category_name, wbs_code, description,
			estimate_amount, budget_amount, committed_amount, actual_amount, sort_order)
		VALUES
			('bli-est-1', $1, 'bud-demo-2', 'DIRECT', $2, 'WBS-01', $3, 1900000000, 1900000000, 0, 0, 1),
			('bli-est-2', $1, 'bud-demo-2', 'SUBCONTRACT', $4, 'WBS-02', $5, 1020000000, 1020000000, 0, 0, 2),
			('bli-est-3', $1, 'bud-demo-2', 'MATERIAL', $6, 'WBS-03', $7, 750000000, 750000000, 0, 0, 3),
			('bli-est-4', $1, 'bud-demo-2', 'GENERAL', $8, 'WBS-07', $9, 580000000, 580000000, 0, 0, 4)
		ON CONFLICT (id) DO NOTHING`,
		orgID,
		"\u76f4\u63a5\u5de5\u4e8b\u8cbb", "\u4f53\u6839\u5de5\u4e8b\uff08RC\u9020\uff09",
		"\u5916\u6ce8\u8cbb", "\u96fb\u6c17\u30fb\u7a7a\u8abf\u8a2d\u5099",
		"\u6750\u6599\u8cbb", "\u9244\u9aa8\u30fb\u30b3\u30f3\u30af\u30ea\u30fc\u30c8",
		"\u4e00\u822c\u7ba1\u7406\u8cbb", "\u672c\u793e\u914d\u8ce6\u30fb\u9593\u63a5\u8cbb")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO project_module_records (id, org_id, project_id, module_code, title, status, detail, amount, person_name, record_date)
		VALUES
			('rec-inq-1', $1, 'prj-demo-1', 'INQUIRY_PROFIT', $2, 'WON', $3, 170000000, $4, CURRENT_DATE),
			('rec-inq-2', $1, 'prj-demo-1', 'INQUIRY_PROFIT', $5, 'SUBMITTED', $6, 85000000, $4, CURRENT_DATE - 14)
		ON CONFLICT (id) DO NOTHING`,
		orgID,
		"\u672c\u5de5\u4e8b\u78ba\u5b9a\u898b\u7a4d", "\u8acb\u8ca0\u91d1\u984d48.5\u5104\u5186\u306b\u5bfe\u3057\u5b9f\u884c\u4e88\u7b9746.8\u5104\u5186\u306e\u7c97\u5229\u78ba\u4fdd",
		"\u5c71\u7530 \u592a\u90ce",
		"\u8a2d\u8a08\u5909\u66f4\u898b\u7a4d\uff08\u7b2c2\u56de\uff09", "\u9676\u6750\u9676\u74f7\u4ea4\u63db\u5de5\u4e8b\u5206\u306e\u88dc\u6b63\u898b\u7a4d")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO project_module_records (id, org_id, project_id, module_code, title, status, detail, amount, person_name, record_date)
		VALUES
			('rec-bill-1', $1, 'prj-demo-1', 'BILLING', $2, 'PAID', $3, 485000000, $4, CURRENT_DATE - 60),
			('rec-bill-2', $1, 'prj-demo-1', 'BILLING', $5, 'INVOICED', $6, 495000000, $4, CURRENT_DATE - 30)
		ON CONFLICT (id) DO NOTHING`,
		orgID,
		"\u7b2c1\u56de\u90e8\u8acb\u6c42", "\u5b8c\u4e86\u51fa\u6765\u9ad8\u8acb\u6c42\u30fb\u5165\u91d1\u6e08",
		"\u5c71\u7530 \u592a\u90ce",
		"\u7b2c2\u56de\u90e8\u8acb\u6c42", "\u9032\u6357\u51fa\u6765\u9ad8\u8acb\u6c42\u767a\u884c\u6e08")
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `
		INSERT INTO cost_entries (id, org_id, project_id, line_item_id, entry_type, vendor_name, description, amount, entry_date, invoice_no, recorded_by)
		VALUES
			('cost-demo-4', $1, 'prj-demo-1', 'bli-demo-1', 'SUBCONTRACT', $2, $3, 320000000, date_trunc('month', CURRENT_DATE) - interval '5 months' + interval '15 days', 'INV-2025-1201', $4),
			('cost-demo-5', $1, 'prj-demo-1', 'bli-demo-3', 'MATERIAL', $5, $6, 410000000, date_trunc('month', CURRENT_DATE) - interval '4 months' + interval '10 days', 'INV-2026-0105', $7),
			('cost-demo-6', $1, 'prj-demo-1', 'bli-demo-2', 'SUBCONTRACT', $8, $9, 385000000, date_trunc('month', CURRENT_DATE) - interval '3 months' + interval '20 days', 'INV-2026-0208', $4)
		ON CONFLICT (id) DO NOTHING`,
		orgID,
		"\u682a\u5f0f\u4f1a\u793e\u3007\u3007\u5efa\u8a2d", "\u4f53\u6839\u5de5\u4e8b\u9032\u6357\u5206",
		"\u5c71\u7530 \u592a\u90ce",
		"\u65e5\u672c\u88fd\u9244\u682a\u5f0f\u4f1a\u793e", "\u9244\u6750\u96c6\u7d04\u5206",
		"\u25b3\u25b3\u96fb\u6c17\u5de5\u696d", "\u8a2d\u5099\u5de5\u4e8b\u9032\u6357\u5206")
	return err
}
