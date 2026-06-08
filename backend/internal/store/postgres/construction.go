package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
)

func (db *DB) ListConstructionProjects(ctx context.Context, orgID string) ([]models.ConstructionProject, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT p.id, p.org_id, p.name, p.site_address, p.status, p.manager_name,
			p.start_date, p.end_date, p.created_at,
			COUNT(r.id)::int
		FROM construction_projects p
		LEFT JOIN project_module_records r ON r.project_id = p.id
		WHERE p.org_id = $1
		GROUP BY p.id
		ORDER BY p.created_at DESC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.ConstructionProject
	for rows.Next() {
		var p models.ConstructionProject
		var start, end *time.Time
		if err := rows.Scan(&p.ID, &p.OrgID, &p.Name, &p.SiteAddress, &p.Status, &p.ManagerName,
			&start, &end, &p.CreatedAt, &p.RecordCount); err != nil {
			return nil, err
		}
		p.StartDate = start
		p.EndDate = end
		out = append(out, p)
	}
	return out, rows.Err()
}

func (db *DB) CreateConstructionProject(ctx context.Context, orgID string, in models.ConstructionProjectInput) (models.ConstructionProject, error) {
	id := "prj_" + randomID()
	status := in.Status
	if status == "" {
		status = models.ProjectPlanning
	}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO construction_projects (id, org_id, name, site_address, status, manager_name, start_date, end_date)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		id, orgID, in.Name, in.SiteAddress, string(status), in.ManagerName, in.StartDate, in.EndDate)
	if err != nil {
		return models.ConstructionProject{}, err
	}
	return models.ConstructionProject{
		ID: id, OrgID: orgID, Name: in.Name, SiteAddress: in.SiteAddress,
		Status: status, ManagerName: in.ManagerName, StartDate: in.StartDate, EndDate: in.EndDate,
		CreatedAt: time.Now(),
	}, nil
}

func (db *DB) ListProjectModuleRecords(ctx context.Context, orgID string, code models.SaasModuleCode, projectID string) ([]models.ProjectModuleRecord, error) {
	q := `
		SELECT r.id, r.org_id, r.project_id, p.name, r.module_code, r.title, r.status, r.detail,
			r.amount, r.person_name, r.record_date, r.created_at
		FROM project_module_records r
		JOIN construction_projects p ON p.id = r.project_id
		WHERE r.org_id = $1 AND r.module_code = $2`
	args := []any{orgID, string(code)}
	if projectID != "" {
		q += ` AND r.project_id = $3`
		args = append(args, projectID)
	}
	q += ` ORDER BY r.created_at DESC`
	rows, err := db.Pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanProjectModuleRecords(rows)
}

func scanProjectModuleRecords(rows pgx.Rows) ([]models.ProjectModuleRecord, error) {
	var out []models.ProjectModuleRecord
	for rows.Next() {
		var r models.ProjectModuleRecord
		var amount *float64
		var recordDate *time.Time
		if err := rows.Scan(&r.ID, &r.OrgID, &r.ProjectID, &r.ProjectName, &r.ModuleCode, &r.Title,
			&r.Status, &r.Detail, &amount, &r.PersonName, &recordDate, &r.CreatedAt); err != nil {
			return nil, err
		}
		r.Amount = amount
		r.RecordDate = recordDate
		out = append(out, r)
	}
	return out, rows.Err()
}

func (db *DB) CreateProjectModuleRecord(ctx context.Context, orgID string, in models.ProjectModuleRecordInput) (models.ProjectModuleRecord, error) {
	id := "rec_" + randomID()
	status := in.Status
	if status == "" {
		status = "OPEN"
	}
	var projectName string
	err := db.Pool.QueryRow(ctx, `
		SELECT name FROM construction_projects WHERE id=$1 AND org_id=$2`, in.ProjectID, orgID).Scan(&projectName)
	if err != nil {
		return models.ProjectModuleRecord{}, err
	}
	_, err = db.Pool.Exec(ctx, `
		INSERT INTO project_module_records (id, org_id, project_id, module_code, title, status, detail, amount, person_name, record_date)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
		id, orgID, in.ProjectID, string(in.ModuleCode), in.Title, status, in.Detail, in.Amount, in.PersonName, in.RecordDate)
	if err != nil {
		return models.ProjectModuleRecord{}, err
	}
	return models.ProjectModuleRecord{
		ID: id, OrgID: orgID, ProjectID: in.ProjectID, ProjectName: projectName,
		ModuleCode: in.ModuleCode, Title: in.Title, Status: status, Detail: in.Detail,
		Amount: in.Amount, PersonName: in.PersonName, RecordDate: in.RecordDate,
		CreatedAt: time.Now(),
	}, nil
}
