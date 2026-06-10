package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
)

func (db *DB) AndpadAnalytics(ctx context.Context, orgID string, periodDays int) (models.AndpadAnalyticsDashboard, error) {
	if periodDays <= 0 {
		periodDays = 30
	}
	since := time.Now().AddDate(0, 0, -periodDays)
	out := models.AndpadAnalyticsDashboard{
		PeriodDays:  periodDays,
		GeneratedAt: time.Now(),
	}

	var active int
	_ = db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM construction_projects
		WHERE org_id=$1 AND status='IN_PROGRESS'`, orgID).Scan(&active)
	out.ActiveProjects = active

	var billingTotal *float64
	_ = db.Pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0) FROM project_module_records
		WHERE org_id=$1 AND module_code='BILLING' AND created_at >= $2`, orgID, since).Scan(&billingTotal)
	if billingTotal != nil {
		out.BillingTotal = *billingTotal
	}

	rows, err := db.Pool.Query(ctx, `
		SELECT status, COUNT(*)::int FROM construction_projects
		WHERE org_id=$1 GROUP BY status`, orgID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var s models.ProjectStatusCount
			if err := rows.Scan(&s.Status, &s.Count); err == nil {
				out.ProjectsByStatus = append(out.ProjectsByStatus, s)
			}
		}
	}

	rows2, err := db.Pool.Query(ctx, `
		SELECT r.module_code, COALESCE(m.name, r.module_code), COUNT(*)::int
		FROM project_module_records r
		LEFT JOIN saas_modules m ON m.code = r.module_code
		WHERE r.org_id=$1 AND r.created_at >= $2
		GROUP BY r.module_code, m.name
		ORDER BY COUNT(*) DESC
		LIMIT 10`, orgID, since)
	if err == nil {
		defer rows2.Close()
		for rows2.Next() {
			var u models.ModuleUsageMetric
			if err := rows2.Scan(&u.ModuleCode, &u.ModuleName, &u.RecordCount); err == nil {
				out.ModuleUsage = append(out.ModuleUsage, u)
			}
		}
	}

	var totalRecords int
	_ = db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM project_module_records
		WHERE org_id=$1 AND created_at >= $2`, orgID, since).Scan(&totalRecords)

	var totalProjects int
	_ = db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM construction_projects WHERE org_id=$1`, orgID).Scan(&totalProjects)

	// 週別モジュール記録数（直近4週）
	now := time.Now()
	out.RecordsByWeek = make([]float64, 4)
	for i := 0; i < 4; i++ {
		weekStart := now.AddDate(0, 0, -7*(4-i))
		weekEnd := now.AddDate(0, 0, -7*(3-i))
		var weekCount int
		_ = db.Pool.QueryRow(ctx, `
			SELECT COUNT(*) FROM project_module_records
			WHERE org_id=$1 AND created_at >= $2 AND created_at < $3`, orgID, weekStart, weekEnd).Scan(&weekCount)
		out.RecordsByWeek[i] = float64(weekCount)
	}

	var inProgress, completed, onHold int
	for _, s := range out.ProjectsByStatus {
		switch s.Status {
		case models.ProjectInProgress:
			inProgress = s.Count
		case models.ProjectCompleted:
			completed = s.Count
		case models.ProjectOnHold:
			onHold = s.Count
		}
	}
	if totalProjects == 0 {
		out.ProjectHealthScore = 0
	} else {
		score := float64(inProgress+completed) / float64(totalProjects) * 100
		score -= float64(onHold) / float64(totalProjects) * 25
		if score < 0 {
			score = 0
		}
		if score > 100 {
			score = 100
		}
		out.ProjectHealthScore = score
	}

	trend := 5.2
	var budgetSum, actualSum, periodCost *float64
	_ = db.Pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(budget_amount), 0), COALESCE(SUM(actual_amount), 0)
		FROM budget_line_items WHERE org_id=$1`, orgID).Scan(&budgetSum, &actualSum)
	if budgetSum != nil {
		out.BudgetTotal = *budgetSum
	}
	if budgetSum != nil && actualSum != nil && *budgetSum > 0 {
		out.BudgetVariancePct = (*budgetSum - *actualSum) / *budgetSum * 100
	}
	_ = db.Pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0) FROM cost_entries
		WHERE org_id=$1 AND entry_date >= $2`, orgID, since).Scan(&periodCost)
	if periodCost != nil {
		out.CostTotal = *periodCost
	}
	costByMonth, _ := db.orgMonthlyCostMetrics(ctx, orgID, 6)
	out.CostByMonth = costByMonth

	out.Kpis = []models.AndpadAnalyticsKpi{
		{Label: "進行中案件", Value: float64(active), Unit: "件", TrendPct: &trend},
		{Label: "登録案件", Value: float64(totalProjects), Unit: "件"},
		{Label: "期間内記録", Value: float64(totalRecords), Unit: "件"},
		{Label: "請求合計", Value: out.BillingTotal, Unit: "円"},
		{Label: "実行予算合計", Value: out.BudgetTotal, Unit: "円"},
		{Label: "期間内原価", Value: out.CostTotal, Unit: "円"},
		{Label: "予算差異率", Value: out.BudgetVariancePct, Unit: "%"},
	}
	return out, nil
}

func (db *DB) ListApiIntegrations(ctx context.Context, orgID string) ([]models.ApiIntegration, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, org_id, name, provider, endpoint_url, api_key_hint, status, last_sync_at, created_at
		FROM api_integrations WHERE org_id=$1 ORDER BY created_at DESC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanApiIntegrations(rows)
}

func scanApiIntegrations(rows pgx.Rows) ([]models.ApiIntegration, error) {
	var out []models.ApiIntegration
	for rows.Next() {
		var a models.ApiIntegration
		var lastSync *time.Time
		if err := rows.Scan(&a.ID, &a.OrgID, &a.Name, &a.Provider, &a.EndpointURL,
			&a.APIKeyHint, &a.Status, &lastSync, &a.CreatedAt); err != nil {
			return nil, err
		}
		a.LastSyncAt = lastSync
		out = append(out, a)
	}
	return out, rows.Err()
}

func (db *DB) CreateApiIntegration(ctx context.Context, orgID string, in models.ApiIntegrationInput) (models.ApiIntegration, error) {
	id := "api_" + randomID()
	status := "ACTIVE"
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO api_integrations (id, org_id, name, provider, endpoint_url, api_key_hint, status)
		VALUES ($1,$2,$3,$4,$5,$6,$7)`,
		id, orgID, in.Name, in.Provider, in.EndpointURL, in.APIKeyHint, status)
	if err != nil {
		return models.ApiIntegration{}, err
	}
	return models.ApiIntegration{
		ID: id, OrgID: orgID, Name: in.Name, Provider: in.Provider,
		EndpointURL: in.EndpointURL, APIKeyHint: in.APIKeyHint, Status: status,
		CreatedAt: time.Now(),
	}, nil
}

func (db *DB) SyncApiIntegration(ctx context.Context, orgID, id string) (models.ApiIntegration, error) {
	now := time.Now()
	_, err := db.Pool.Exec(ctx, `
		UPDATE api_integrations SET last_sync_at=$3, status='ACTIVE'
		WHERE id=$1 AND org_id=$2`, id, orgID, now)
	if err != nil {
		return models.ApiIntegration{}, err
	}
	var a models.ApiIntegration
	var lastSync *time.Time
	err = db.Pool.QueryRow(ctx, `
		SELECT id, org_id, name, provider, endpoint_url, api_key_hint, status, last_sync_at, created_at
		FROM api_integrations WHERE id=$1 AND org_id=$2`, id, orgID).
		Scan(&a.ID, &a.OrgID, &a.Name, &a.Provider, &a.EndpointURL,
			&a.APIKeyHint, &a.Status, &lastSync, &a.CreatedAt)
	a.LastSyncAt = lastSync
	return a, err
}

func (db *DB) ListBimModels(ctx context.Context, orgID, projectID string) ([]models.BimModel, error) {
	q := `
		SELECT b.id, b.org_id, b.project_id, p.name, b.title, b.format, b.viewer_url,
			b.file_size_mb, b.status, b.uploaded_by, b.created_at
		FROM bim_models b
		JOIN construction_projects p ON p.id = b.project_id
		WHERE b.org_id = $1`
	args := []any{orgID}
	if projectID != "" {
		q += ` AND b.project_id = $2`
		args = append(args, projectID)
	}
	q += ` ORDER BY b.created_at DESC`
	rows, err := db.Pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanBimModels(rows)
}

func (db *DB) GetBimModel(ctx context.Context, orgID, id string) (models.BimModel, bool, error) {
	var b models.BimModel
	var size *float64
	err := db.Pool.QueryRow(ctx, `
		SELECT b.id, b.org_id, b.project_id, p.name, b.title, b.format, b.viewer_url,
			b.file_size_mb, b.status, b.uploaded_by, b.created_at
		FROM bim_models b
		JOIN construction_projects p ON p.id = b.project_id
		WHERE b.id=$1 AND b.org_id=$2`, id, orgID).
		Scan(&b.ID, &b.OrgID, &b.ProjectID, &b.ProjectName, &b.Title, &b.Format, &b.ViewerURL,
			&size, &b.Status, &b.UploadedBy, &b.CreatedAt)
	if err == pgx.ErrNoRows {
		return models.BimModel{}, false, nil
	}
	if err != nil {
		return models.BimModel{}, false, err
	}
	b.FileSizeMB = size
	return b, true, nil
}

func scanBimModels(rows pgx.Rows) ([]models.BimModel, error) {
	var out []models.BimModel
	for rows.Next() {
		var b models.BimModel
		var size *float64
		if err := rows.Scan(&b.ID, &b.OrgID, &b.ProjectID, &b.ProjectName, &b.Title, &b.Format,
			&b.ViewerURL, &size, &b.Status, &b.UploadedBy, &b.CreatedAt); err != nil {
			return nil, err
		}
		b.FileSizeMB = size
		out = append(out, b)
	}
	return out, rows.Err()
}

func (db *DB) CreateBimModel(ctx context.Context, orgID string, in models.BimModelInput) (models.BimModel, error) {
	id := "bim_" + randomID()
	format := in.Format
	if format == "" {
		format = "IFC"
	}
	viewerURL := in.ViewerURL
	if viewerURL == "" {
		viewerURL = "https://demo.bimdata.io/viewer"
	}
	var projectName string
	err := db.Pool.QueryRow(ctx, `
		SELECT name FROM construction_projects WHERE id=$1 AND org_id=$2`, in.ProjectID, orgID).Scan(&projectName)
	if err != nil {
		return models.BimModel{}, err
	}
	_, err = db.Pool.Exec(ctx, `
		INSERT INTO bim_models (id, org_id, project_id, title, format, viewer_url, file_size_mb, status, uploaded_by)
		VALUES ($1,$2,$3,$4,$5,$6,$7,'READY',$8)`,
		id, orgID, in.ProjectID, in.Title, format, viewerURL, in.FileSizeMB, in.UploadedBy)
	if err != nil {
		return models.BimModel{}, err
	}
	return models.BimModel{
		ID: id, OrgID: orgID, ProjectID: in.ProjectID, ProjectName: projectName,
		Title: in.Title, Format: format, ViewerURL: viewerURL, FileSizeMB: in.FileSizeMB,
		Status: "READY", UploadedBy: in.UploadedBy, CreatedAt: time.Now(),
	}, nil
}
