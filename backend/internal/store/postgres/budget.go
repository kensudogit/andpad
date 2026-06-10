package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
)

func (db *DB) ListProjectBudgets(ctx context.Context, orgID, projectID string, budgetType models.BudgetType) ([]models.ProjectBudget, error) {
	q := `
		SELECT b.id, b.org_id, b.project_id, p.name, b.name, b.budget_type, b.status, b.version_no,
			b.contract_amount, b.notes, b.approved_at, b.created_at
		FROM project_budgets b
		JOIN construction_projects p ON p.id = b.project_id
		WHERE b.org_id = $1`
	args := []any{orgID}
	if projectID != "" {
		q += ` AND b.project_id = $2`
		args = append(args, projectID)
	}
	if budgetType != "" {
		if projectID != "" {
			q += ` AND b.budget_type = $3`
		} else {
			q += ` AND b.budget_type = $2`
		}
		args = append(args, string(budgetType))
	}
	q += ` ORDER BY b.created_at DESC`
	rows, err := db.Pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.ProjectBudget
	for rows.Next() {
		b, err := scanProjectBudgetRow(rows)
		if err != nil {
			return nil, err
		}
		if err := db.fillBudgetTotals(ctx, &b); err != nil {
			return nil, err
		}
		out = append(out, b)
	}
	return out, rows.Err()
}

func scanProjectBudgetRow(rows pgx.Rows) (models.ProjectBudget, error) {
	var b models.ProjectBudget
	var approvedAt *time.Time
	if err := rows.Scan(&b.ID, &b.OrgID, &b.ProjectID, &b.ProjectName, &b.Name, &b.BudgetType,
		&b.Status, &b.VersionNo, &b.ContractAmount, &b.Notes, &approvedAt, &b.CreatedAt); err != nil {
		return models.ProjectBudget{}, err
	}
	b.ApprovedAt = approvedAt
	return b, nil
}

func (db *DB) fillBudgetTotals(ctx context.Context, b *models.ProjectBudget) error {
	return db.Pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(estimate_amount),0), COALESCE(SUM(budget_amount),0),
			COALESCE(SUM(committed_amount),0), COALESCE(SUM(actual_amount),0)
		FROM budget_line_items WHERE budget_id=$1 AND org_id=$2`,
		b.ID, b.OrgID).Scan(&b.TotalEstimate, &b.TotalBudget, &b.TotalCommitted, &b.TotalActual)
}

func (db *DB) ListBudgetLineItems(ctx context.Context, orgID, budgetID string) ([]models.BudgetLineItem, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, org_id, budget_id, category_code, category_name, wbs_code, description,
			estimate_amount, budget_amount, committed_amount, actual_amount, sort_order, created_at
		FROM budget_line_items
		WHERE org_id=$1 AND budget_id=$2
		ORDER BY sort_order, created_at`, orgID, budgetID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.BudgetLineItem
	for rows.Next() {
		item, err := scanBudgetLineItem(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func scanBudgetLineItem(rows pgx.Rows) (models.BudgetLineItem, error) {
	var item models.BudgetLineItem
	if err := rows.Scan(&item.ID, &item.OrgID, &item.BudgetID, &item.CategoryCode, &item.CategoryName,
		&item.WbsCode, &item.Description, &item.EstimateAmount, &item.BudgetAmount,
		&item.CommittedAmount, &item.ActualAmount, &item.SortOrder, &item.CreatedAt); err != nil {
		return models.BudgetLineItem{}, err
	}
	item.VarianceAmount = item.BudgetAmount - item.ActualAmount
	if item.BudgetAmount > 0 {
		item.VariancePct = item.VarianceAmount / item.BudgetAmount * 100
	}
	return item, nil
}

func (db *DB) ListCostEntries(ctx context.Context, orgID, projectID, lineItemID string) ([]models.CostEntry, error) {
	q := `
		SELECT c.id, c.org_id, c.project_id, p.name, COALESCE(c.line_item_id,''),
			COALESCE(l.category_name || ' ' || l.description, ''), c.entry_type, c.vendor_name,
			c.description, c.amount, c.entry_date, c.invoice_no, c.recorded_by, c.created_at
		FROM cost_entries c
		JOIN construction_projects p ON p.id = c.project_id
		LEFT JOIN budget_line_items l ON l.id = c.line_item_id
		WHERE c.org_id = $1 AND c.project_id = $2`
	args := []any{orgID, projectID}
	if lineItemID != "" {
		q += ` AND c.line_item_id = $3`
		args = append(args, lineItemID)
	}
	q += ` ORDER BY c.entry_date DESC, c.created_at DESC`
	rows, err := db.Pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.CostEntry
	for rows.Next() {
		var c models.CostEntry
		if err := rows.Scan(&c.ID, &c.OrgID, &c.ProjectID, &c.ProjectName, &c.LineItemID,
			&c.LineItemName, &c.EntryType, &c.VendorName, &c.Description, &c.Amount,
			&c.EntryDate, &c.InvoiceNo, &c.RecordedBy, &c.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func (db *DB) BudgetDashboard(ctx context.Context, orgID, projectID string) (models.BudgetDashboard, error) {
	var dash models.BudgetDashboard
	dash.ProjectID = projectID
	dash.GeneratedAt = time.Now()

	err := db.Pool.QueryRow(ctx, `
		SELECT name FROM construction_projects WHERE id=$1 AND org_id=$2`, projectID, orgID).Scan(&dash.ProjectName)
	if err != nil {
		return models.BudgetDashboard{}, err
	}

	var budgetID string
	err = db.Pool.QueryRow(ctx, `
		SELECT id, contract_amount FROM project_budgets
		WHERE org_id=$1 AND project_id=$2 AND budget_type='EXECUTION_BUDGET'
		ORDER BY version_no DESC, created_at DESC LIMIT 1`, orgID, projectID).Scan(&budgetID, &dash.ContractAmount)
	if err == pgx.ErrNoRows {
		return dash, nil
	}
	if err != nil {
		return models.BudgetDashboard{}, err
	}

	lineItems, err := db.ListBudgetLineItems(ctx, orgID, budgetID)
	if err != nil {
		return models.BudgetDashboard{}, err
	}
	dash.LineItems = lineItems

	catMap := map[string]*models.BudgetCategorySummary{}
	for _, item := range lineItems {
		dash.TotalEstimate += item.EstimateAmount
		dash.TotalBudget += item.BudgetAmount
		dash.TotalCommitted += item.CommittedAmount
		dash.TotalActual += item.ActualAmount
		cs, ok := catMap[item.CategoryCode]
		if !ok {
			cs = &models.BudgetCategorySummary{
				CategoryCode: item.CategoryCode,
				CategoryName: item.CategoryName,
			}
			catMap[item.CategoryCode] = cs
		}
		cs.BudgetAmount += item.BudgetAmount
		cs.ActualAmount += item.ActualAmount
	}
	for _, cs := range catMap {
		cs.VarianceAmount = cs.BudgetAmount - cs.ActualAmount
		dash.CategorySummary = append(dash.CategorySummary, *cs)
	}

	dash.TotalForecast = dash.TotalActual + (dash.TotalBudget - dash.TotalCommitted)
	dash.VarianceAmount = dash.TotalBudget - dash.TotalActual
	if dash.TotalBudget > 0 {
		dash.VariancePct = dash.VarianceAmount / dash.TotalBudget * 100
		dash.CompletionPct = dash.TotalActual / dash.TotalBudget * 100
	}
	if dash.ContractAmount > 0 {
		dash.GrossMarginPct = (dash.ContractAmount - dash.TotalBudget) / dash.ContractAmount * 100
	}

	_ = db.Pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(bli.budget_amount), 0) FROM budget_line_items bli
		WHERE bli.org_id=$1 AND bli.budget_id = (
			SELECT id FROM project_budgets
			WHERE org_id=$1 AND project_id=$2 AND budget_type='ESTIMATE'
			ORDER BY version_no DESC LIMIT 1
		)`, orgID, projectID).Scan(&dash.EstimateBudgetTotal)

	var inquiryTotal *float64
	_ = db.Pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0) FROM project_module_records
		WHERE org_id=$1 AND project_id=$2 AND module_code='INQUIRY_PROFIT'`, orgID, projectID).Scan(&inquiryTotal)
	if inquiryTotal != nil {
		dash.InquiryProfitTotal = *inquiryTotal
	}

	var billingTotal *float64
	_ = db.Pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0) FROM project_module_records
		WHERE org_id=$1 AND project_id=$2 AND module_code='BILLING'`, orgID, projectID).Scan(&billingTotal)
	if billingTotal != nil {
		dash.BillingTotal = *billingTotal
	}
	dash.BillingBalance = dash.BillingTotal - dash.TotalActual

	monthly, err := db.monthlyCostMetrics(ctx, orgID, projectID, 6)
	if err != nil {
		return models.BudgetDashboard{}, err
	}
	dash.MonthlyCosts = monthly

	recon, err := db.billingReconciliation(ctx, orgID, projectID)
	if err != nil {
		return models.BudgetDashboard{}, err
	}
	dash.Reconciliation = recon

	costs, err := db.ListCostEntries(ctx, orgID, projectID, "")
	if err != nil {
		return models.BudgetDashboard{}, err
	}
	if len(costs) > 10 {
		dash.RecentCosts = costs[:10]
	} else {
		dash.RecentCosts = costs
	}
	return dash, nil
}

func (db *DB) CreateProjectBudget(ctx context.Context, orgID string, in models.ProjectBudgetInput) (models.ProjectBudget, error) {
	id := "bud_" + randomID()
	status := in.Status
	if status == "" {
		status = models.BudgetStatusDraft
	}
	budgetType := in.BudgetType
	if budgetType == "" {
		budgetType = models.BudgetTypeExecutionBudget
	}
	versionNo := in.VersionNo
	if versionNo <= 0 {
		versionNo = 1
	}
	var projectName string
	err := db.Pool.QueryRow(ctx, `
		SELECT name FROM construction_projects WHERE id=$1 AND org_id=$2`, in.ProjectID, orgID).Scan(&projectName)
	if err != nil {
		return models.ProjectBudget{}, err
	}
	_, err = db.Pool.Exec(ctx, `
		INSERT INTO project_budgets (id, org_id, project_id, name, budget_type, status, version_no, contract_amount, notes)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		id, orgID, in.ProjectID, in.Name, string(budgetType), string(status), versionNo, in.ContractAmount, in.Notes)
	if err != nil {
		return models.ProjectBudget{}, err
	}
	return models.ProjectBudget{
		ID: id, OrgID: orgID, ProjectID: in.ProjectID, ProjectName: projectName,
		Name: in.Name, BudgetType: budgetType, Status: status, VersionNo: versionNo,
		ContractAmount: in.ContractAmount, Notes: in.Notes, CreatedAt: time.Now(),
	}, nil
}

func (db *DB) CreateBudgetLineItem(ctx context.Context, orgID string, in models.BudgetLineItemInput) (models.BudgetLineItem, error) {
	id := "bli_" + randomID()
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO budget_line_items (id, org_id, budget_id, category_code, category_name, wbs_code,
			description, estimate_amount, budget_amount, committed_amount, sort_order)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
		id, orgID, in.BudgetID, in.CategoryCode, in.CategoryName, in.WbsCode, in.Description,
		in.EstimateAmount, in.BudgetAmount, in.CommittedAmount, in.SortOrder)
	if err != nil {
		return models.BudgetLineItem{}, err
	}
	item := models.BudgetLineItem{
		ID: id, OrgID: orgID, BudgetID: in.BudgetID, CategoryCode: in.CategoryCode,
		CategoryName: in.CategoryName, WbsCode: in.WbsCode, Description: in.Description,
		EstimateAmount: in.EstimateAmount, BudgetAmount: in.BudgetAmount,
		CommittedAmount: in.CommittedAmount, SortOrder: in.SortOrder, CreatedAt: time.Now(),
	}
	item.VarianceAmount = item.BudgetAmount - item.ActualAmount
	if item.BudgetAmount > 0 {
		item.VariancePct = item.VarianceAmount / item.BudgetAmount * 100
	}
	return item, nil
}

func (db *DB) CreateCostEntry(ctx context.Context, orgID string, in models.CostEntryInput) (models.CostEntry, error) {
	id := "cost_" + randomID()
	entryType := in.EntryType
	if entryType == "" {
		entryType = models.CostEntryOther
	}
	entryDate := time.Now()
	if in.EntryDate != nil {
		entryDate = *in.EntryDate
	}
	var projectName string
	err := db.Pool.QueryRow(ctx, `
		SELECT name FROM construction_projects WHERE id=$1 AND org_id=$2`, in.ProjectID, orgID).Scan(&projectName)
	if err != nil {
		return models.CostEntry{}, err
	}
	var lineItemID *string
	if in.LineItemID != "" {
		lineItemID = &in.LineItemID
	}
	_, err = db.Pool.Exec(ctx, `
		INSERT INTO cost_entries (id, org_id, project_id, line_item_id, entry_type, vendor_name,
			description, amount, entry_date, invoice_no, recorded_by)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
		id, orgID, in.ProjectID, lineItemID, string(entryType), in.VendorName,
		in.Description, in.Amount, entryDate, in.InvoiceNo, in.RecordedBy)
	if err != nil {
		return models.CostEntry{}, err
	}
	if in.LineItemID != "" {
		_, _ = db.Pool.Exec(ctx, `
			UPDATE budget_line_items SET actual_amount = actual_amount + $3
			WHERE id=$1 AND org_id=$2`, in.LineItemID, orgID, in.Amount)
	}
	var lineItemName string
	if in.LineItemID != "" {
		_ = db.Pool.QueryRow(ctx, `
			SELECT category_name || ' ' || description FROM budget_line_items WHERE id=$1`, in.LineItemID).
			Scan(&lineItemName)
	}
	return models.CostEntry{
		ID: id, OrgID: orgID, ProjectID: in.ProjectID, ProjectName: projectName,
		LineItemID: in.LineItemID, LineItemName: lineItemName, EntryType: entryType,
		VendorName: in.VendorName, Description: in.Description, Amount: in.Amount,
		EntryDate: entryDate, InvoiceNo: in.InvoiceNo, RecordedBy: in.RecordedBy,
		CreatedAt: time.Now(),
	}, nil
}

func (db *DB) ApproveProjectBudget(ctx context.Context, orgID, id string) (models.ProjectBudget, error) {
	now := time.Now()
	tag, err := db.Pool.Exec(ctx, `
		UPDATE project_budgets SET status='APPROVED', approved_at=$3
		WHERE id=$1 AND org_id=$2`, id, orgID, now)
	if err != nil {
		return models.ProjectBudget{}, err
	}
	if tag.RowsAffected() == 0 {
		return models.ProjectBudget{}, pgx.ErrNoRows
	}
	var b models.ProjectBudget
	var approvedAt *time.Time
	err = db.Pool.QueryRow(ctx, `
		SELECT b.id, b.org_id, b.project_id, p.name, b.name, b.budget_type, b.status, b.version_no,
			b.contract_amount, b.notes, b.approved_at, b.created_at
		FROM project_budgets b
		JOIN construction_projects p ON p.id = b.project_id
		WHERE b.id=$1 AND b.org_id=$2`, id, orgID).
		Scan(&b.ID, &b.OrgID, &b.ProjectID, &b.ProjectName, &b.Name, &b.BudgetType,
			&b.Status, &b.VersionNo, &b.ContractAmount, &b.Notes, &approvedAt, &b.CreatedAt)
	if err != nil {
		return models.ProjectBudget{}, err
	}
	b.ApprovedAt = approvedAt
	_ = db.fillBudgetTotals(ctx, &b)
	return b, nil
}

func (db *DB) monthlyCostMetrics(ctx context.Context, orgID, projectID string, months int) ([]models.MonthlyCostMetric, error) {
	if months <= 0 {
		months = 6
	}
	since := time.Now().AddDate(0, -(months - 1), -time.Now().Day()+1)
	rows, err := db.Pool.Query(ctx, `
		SELECT to_char(date_trunc('month', entry_date), 'YYYY-MM') AS month,
			COALESCE(SUM(amount), 0)
		FROM cost_entries
		WHERE org_id=$1 AND project_id=$2 AND entry_date >= $3
		GROUP BY 1 ORDER BY 1`, orgID, projectID, since)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	byMonth := map[string]float64{}
	for rows.Next() {
		var month string
		var amount float64
		if err := rows.Scan(&month, &amount); err != nil {
			return nil, err
		}
		byMonth[month] = amount
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	now := time.Now()
	out := make([]models.MonthlyCostMetric, months)
	for i := 0; i < months; i++ {
		t := now.AddDate(0, -(months - 1 - i), 0)
		key := t.Format("2006-01")
		out[i] = models.MonthlyCostMetric{Month: key, Amount: byMonth[key]}
	}
	return out, nil
}

func (db *DB) orgMonthlyCostMetrics(ctx context.Context, orgID string, months int) ([]models.MonthlyCostMetric, error) {
	if months <= 0 {
		months = 6
	}
	since := time.Now().AddDate(0, -(months - 1), -time.Now().Day()+1)
	rows, err := db.Pool.Query(ctx, `
		SELECT to_char(date_trunc('month', entry_date), 'YYYY-MM') AS month,
			COALESCE(SUM(amount), 0)
		FROM cost_entries
		WHERE org_id=$1 AND entry_date >= $2
		GROUP BY 1 ORDER BY 1`, orgID, since)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	byMonth := map[string]float64{}
	for rows.Next() {
		var month string
		var amount float64
		if err := rows.Scan(&month, &amount); err != nil {
			return nil, err
		}
		byMonth[month] = amount
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	now := time.Now()
	out := make([]models.MonthlyCostMetric, months)
	for i := 0; i < months; i++ {
		t := now.AddDate(0, -(months - 1 - i), 0)
		key := t.Format("2006-01")
		out[i] = models.MonthlyCostMetric{Month: key, Amount: byMonth[key]}
	}
	return out, nil
}

func (db *DB) billingReconciliation(ctx context.Context, orgID, projectID string) ([]models.BillingReconciliationItem, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, title, COALESCE(amount, 0), record_date
		FROM project_module_records
		WHERE org_id=$1 AND project_id=$2 AND module_code='BILLING'
		ORDER BY record_date DESC NULLS LAST, created_at DESC`, orgID, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	costByMonth := map[string]float64{}
	costRows, err := db.Pool.Query(ctx, `
		SELECT to_char(date_trunc('month', entry_date), 'YYYY-MM'), COALESCE(SUM(amount), 0)
		FROM cost_entries WHERE org_id=$1 AND project_id=$2
		GROUP BY 1`, orgID, projectID)
	if err == nil {
		defer costRows.Close()
		for costRows.Next() {
			var month string
			var amt float64
			if costRows.Scan(&month, &amt) == nil {
				costByMonth[month] = amt
			}
		}
	}

	var out []models.BillingReconciliationItem
	for rows.Next() {
		var item models.BillingReconciliationItem
		var recordDate *time.Time
		if err := rows.Scan(&item.BillingRecordID, &item.Title, &item.BillingAmount, &recordDate); err != nil {
			return nil, err
		}
		monthKey := ""
		if recordDate != nil {
			item.BillingDate = recordDate.Format("2006-01-02")
			monthKey = recordDate.Format("2006-01")
		}
		item.CostAmount = costByMonth[monthKey]
		item.VarianceAmount = item.BillingAmount - item.CostAmount
		switch {
		case item.BillingAmount == 0:
			item.Status = "NONE"
		case item.CostAmount == 0:
			item.Status = "UNMATCHED"
		case absPct(item.VarianceAmount, item.BillingAmount) <= 5:
			item.Status = "MATCHED"
		case item.VarianceAmount > 0:
			item.Status = "UNDER"
		default:
			item.Status = "OVER"
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func absPct(diff, base float64) float64 {
	if base == 0 {
		return 0
	}
	if diff < 0 {
		diff = -diff
	}
	return diff / base * 100
}

func (db *DB) ListProjectBudgetSummaries(ctx context.Context, orgID string) ([]models.ProjectBudgetSummary, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT p.id, p.name, p.status,
			COALESCE(MAX(b.contract_amount), 0),
			COALESCE(SUM(li.budget_amount), 0),
			COALESCE(SUM(li.actual_amount), 0)
		FROM construction_projects p
		LEFT JOIN project_budgets b ON b.project_id = p.id AND b.org_id = p.org_id
			AND b.budget_type = 'EXECUTION_BUDGET' AND b.status = 'APPROVED'
		LEFT JOIN budget_line_items li ON li.budget_id = b.id
		WHERE p.org_id = $1
		GROUP BY p.id, p.name, p.status
		ORDER BY p.name`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.ProjectBudgetSummary
	for rows.Next() {
		var s models.ProjectBudgetSummary
		if err := rows.Scan(&s.ProjectID, &s.ProjectName, &s.Status,
			&s.ContractAmount, &s.TotalBudget, &s.TotalActual); err != nil {
			return nil, err
		}
		if s.TotalBudget > 0 {
			s.VariancePct = (s.TotalBudget - s.TotalActual) / s.TotalBudget * 100
		}
		_ = db.Pool.QueryRow(ctx, `
			SELECT COALESCE(SUM(amount), 0) FROM project_module_records
			WHERE org_id=$1 AND project_id=$2 AND module_code='BILLING'`, orgID, s.ProjectID).
			Scan(&s.BillingTotal)
		out = append(out, s)
	}
	return out, rows.Err()
}

func (db *DB) CreateCostFromBilling(ctx context.Context, orgID, billingRecordID, projectID string) (models.CostEntry, error) {
	var title, detail string
	var amount float64
	var recordDate *time.Time
	err := db.Pool.QueryRow(ctx, `
		SELECT title, detail, COALESCE(amount, 0), record_date
		FROM project_module_records
		WHERE id=$1 AND org_id=$2 AND project_id=$3 AND module_code='BILLING'`,
		billingRecordID, orgID, projectID).
		Scan(&title, &detail, &amount, &recordDate)
	if err != nil {
		return models.CostEntry{}, err
	}
	desc := title
	if detail != "" {
		desc = title + " — " + detail
	}
	in := models.CostEntryInput{
		ProjectID: projectID, Description: desc, Amount: amount,
		EntryType: models.CostEntryOther, VendorName: "請求連携",
		InvoiceNo: "BILL-" + billingRecordID,
	}
	if recordDate != nil {
		in.EntryDate = recordDate
	}
	return db.CreateCostEntry(ctx, orgID, in)
}
