package postgres

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/rag"
)

func (db *DB) ListOrgModules(ctx context.Context, orgID string) ([]models.SaasModule, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT m.code, m.name, m.description, COALESCE(om.enabled, FALSE)
		FROM saas_modules m
		LEFT JOIN org_modules om ON om.module_code = m.code AND om.org_id = $1
		ORDER BY m.code`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.SaasModule
	for rows.Next() {
		var m models.SaasModule
		if err := rows.Scan(&m.Code, &m.Name, &m.Description, &m.Enabled); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

func (db *DB) IsModuleEnabled(ctx context.Context, orgID string, code models.SaasModuleCode) (bool, error) {
	var enabled bool
	err := db.Pool.QueryRow(ctx, `
		SELECT enabled FROM org_modules WHERE org_id=$1 AND module_code=$2`, orgID, string(code)).Scan(&enabled)
	if err == pgx.ErrNoRows {
		return false, nil
	}
	return enabled, err
}

func (db *DB) EnsureOrgModules(ctx context.Context, orgID string) error {
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO org_modules (org_id, module_code, enabled)
		SELECT $1, code, TRUE FROM saas_modules
		ON CONFLICT DO NOTHING`, orgID)
	return err
}

func (db *DB) SetOrgModuleEnabled(ctx context.Context, orgID string, code models.SaasModuleCode, enabled bool) (models.SaasModule, error) {
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO org_modules (org_id, module_code, enabled)
		VALUES ($1, $2, $3)
		ON CONFLICT (org_id, module_code) DO UPDATE SET enabled = EXCLUDED.enabled`, orgID, string(code), enabled)
	if err != nil {
		return models.SaasModule{}, err
	}
	var m models.SaasModule
	err = db.Pool.QueryRow(ctx, `
		SELECT m.code, m.name, m.description, om.enabled
		FROM saas_modules m
		JOIN org_modules om ON om.module_code = m.code AND om.org_id = $1
		WHERE m.code = $2`, orgID, string(code)).
		Scan(&m.Code, &m.Name, &m.Description, &m.Enabled)
	return m, err
}

func (db *DB) ListDxInitiatives(ctx context.Context, orgID string) ([]models.DxInitiative, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT i.id, i.org_id, i.title, i.description, i.status, i.progress_pct, i.owner_name, i.due_date, i.created_at,
			COUNT(t.id)::int, COUNT(t.id) FILTER (WHERE t.done)::int
		FROM dx_initiatives i
		LEFT JOIN dx_tasks t ON t.initiative_id = i.id
		WHERE i.org_id = $1
		GROUP BY i.id
		ORDER BY i.created_at DESC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanDxInitiatives(rows)
}

func scanDxInitiatives(rows pgx.Rows) ([]models.DxInitiative, error) {
	var out []models.DxInitiative
	for rows.Next() {
		var i models.DxInitiative
		var due *time.Time
		if err := rows.Scan(&i.ID, &i.OrgID, &i.Title, &i.Description, &i.Status, &i.ProgressPct,
			&i.OwnerName, &due, &i.CreatedAt, &i.TaskCount, &i.TasksDone); err != nil {
			return nil, err
		}
		i.DueDate = due
		out = append(out, i)
	}
	return out, rows.Err()
}

func (db *DB) CreateDxInitiative(ctx context.Context, orgID string, in models.DxInitiativeInput) (models.DxInitiative, error) {
	id := "dxi_" + randomID()
	status := in.Status
	if status == "" {
		status = "PLANNED"
	}
	var due *time.Time = in.DueDate
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO dx_initiatives (id, org_id, title, description, status, progress_pct, owner_name, due_date)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		id, orgID, in.Title, in.Description, status, in.ProgressPct, in.OwnerName, due)
	if err != nil {
		return models.DxInitiative{}, err
	}
	return models.DxInitiative{
		ID: id, OrgID: orgID, Title: in.Title, Description: in.Description,
		Status: status, ProgressPct: in.ProgressPct, OwnerName: in.OwnerName, DueDate: due,
		CreatedAt: time.Now(),
	}, nil
}

func (db *DB) ListCrmContacts(ctx context.Context, orgID string) ([]models.CrmContact, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, org_id, name, email, phone, company, stage, notes, created_at
		FROM crm_contacts WHERE org_id=$1 ORDER BY created_at DESC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.CrmContact
	for rows.Next() {
		var c models.CrmContact
		if err := rows.Scan(&c.ID, &c.OrgID, &c.Name, &c.Email, &c.Phone, &c.Company, &c.Stage, &c.Notes, &c.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func (db *DB) CreateCrmContact(ctx context.Context, orgID string, in models.CrmContactInput) (models.CrmContact, error) {
	id := "crm_" + randomID()
	stage := in.Stage
	if stage == "" {
		stage = "LEAD"
	}
	c := models.CrmContact{
		ID: id, OrgID: orgID, Name: in.Name, Email: in.Email, Phone: in.Phone,
		Company: in.Company, Stage: stage, Notes: in.Notes, CreatedAt: time.Now(),
	}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO crm_contacts (id, org_id, name, email, phone, company, stage, notes)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		c.ID, c.OrgID, c.Name, c.Email, c.Phone, c.Company, c.Stage, c.Notes)
	return c, err
}

func (db *DB) CreateCrmInteraction(ctx context.Context, orgID, contactID, kind, summary string) (models.CrmInteraction, error) {
	id := "cri_" + randomID()
	if kind == "" {
		kind = "NOTE"
	}
	i := models.CrmInteraction{ID: id, ContactID: contactID, Kind: kind, Summary: summary, OccurredAt: time.Now()}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO crm_interactions (id, org_id, contact_id, kind, summary)
		VALUES ($1,$2,$3,$4,$5)`, id, orgID, contactID, kind, summary)
	return i, err
}

func (db *DB) ListCrmInteractions(ctx context.Context, orgID, contactID string) ([]models.CrmInteraction, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, contact_id, kind, summary, occurred_at
		FROM crm_interactions WHERE org_id=$1 AND contact_id=$2 ORDER BY occurred_at DESC`, orgID, contactID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.CrmInteraction
	for rows.Next() {
		var i models.CrmInteraction
		if err := rows.Scan(&i.ID, &i.ContactID, &i.Kind, &i.Summary, &i.OccurredAt); err != nil {
			return nil, err
		}
		out = append(out, i)
	}
	return out, rows.Err()
}

func (db *DB) ListAttendanceRecords(ctx context.Context, orgID, userID string, limit int) ([]models.AttendanceRecord, error) {
	if limit <= 0 {
		limit = 30
	}
	q := `
		SELECT a.id, a.org_id, a.user_id, COALESCE(u.name,''), a.clock_in, a.clock_out, a.note
		FROM attendance_records a
		LEFT JOIN users u ON u.id = a.user_id
		WHERE a.org_id = $1`
	args := []any{orgID}
	if userID != "" {
		q += ` AND a.user_id = $2`
		args = append(args, userID)
	}
	q += ` ORDER BY a.clock_in DESC LIMIT ` + fmt.Sprint(limit)
	rows, err := db.Pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.AttendanceRecord
	for rows.Next() {
		var r models.AttendanceRecord
		if err := rows.Scan(&r.ID, &r.OrgID, &r.UserID, &r.UserName, &r.ClockIn, &r.ClockOut, &r.Note); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

func (db *DB) OpenAttendanceClock(ctx context.Context, orgID, userID string) (models.AttendanceRecord, bool, error) {
	var r models.AttendanceRecord
	err := db.Pool.QueryRow(ctx, `
		SELECT a.id, a.org_id, a.user_id, COALESCE(u.name,''), a.clock_in, a.clock_out, a.note
		FROM attendance_records a LEFT JOIN users u ON u.id = a.user_id
		WHERE a.org_id=$1 AND a.user_id=$2 AND a.clock_out IS NULL
		ORDER BY a.clock_in DESC LIMIT 1`, orgID, userID).
		Scan(&r.ID, &r.OrgID, &r.UserID, &r.UserName, &r.ClockIn, &r.ClockOut, &r.Note)
	if err == pgx.ErrNoRows {
		return r, false, nil
	}
	return r, err == nil, err
}

func (db *DB) ClockIn(ctx context.Context, orgID, userID, note string) (models.AttendanceRecord, error) {
	id := "att_" + randomID()
	now := time.Now()
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO attendance_records (id, org_id, user_id, clock_in, note) VALUES ($1,$2,$3,$4,$5)`,
		id, orgID, userID, now, note)
	if err != nil {
		return models.AttendanceRecord{}, err
	}
	name, _ := db.userName(ctx, userID)
	return models.AttendanceRecord{ID: id, OrgID: orgID, UserID: userID, UserName: name, ClockIn: now, Note: note}, nil
}

func (db *DB) ClockOut(ctx context.Context, orgID, recordID string) (models.AttendanceRecord, error) {
	now := time.Now()
	_, err := db.Pool.Exec(ctx, `
		UPDATE attendance_records SET clock_out=$1 WHERE org_id=$2 AND id=$3 AND clock_out IS NULL`,
		now, orgID, recordID)
	if err != nil {
		return models.AttendanceRecord{}, err
	}
	var r models.AttendanceRecord
	err = db.Pool.QueryRow(ctx, `
		SELECT a.id, a.org_id, a.user_id, COALESCE(u.name,''), a.clock_in, a.clock_out, a.note
		FROM attendance_records a LEFT JOIN users u ON u.id = a.user_id
		WHERE a.org_id=$1 AND a.id=$2`, orgID, recordID).
		Scan(&r.ID, &r.OrgID, &r.UserID, &r.UserName, &r.ClockIn, &r.ClockOut, &r.Note)
	return r, err
}

func (db *DB) ListLeaveRequests(ctx context.Context, orgID string) ([]models.LeaveRequest, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT l.id, l.org_id, l.user_id, COALESCE(u.name,''), l.start_date, l.end_date, l.reason, l.status, l.created_at
		FROM leave_requests l LEFT JOIN users u ON u.id = l.user_id
		WHERE l.org_id=$1 ORDER BY l.created_at DESC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.LeaveRequest
	for rows.Next() {
		var l models.LeaveRequest
		if err := rows.Scan(&l.ID, &l.OrgID, &l.UserID, &l.UserName, &l.StartDate, &l.EndDate, &l.Reason, &l.Status, &l.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, l)
	}
	return out, rows.Err()
}

func (db *DB) CreateLeaveRequest(ctx context.Context, orgID, userID string, start, end time.Time, reason string) (models.LeaveRequest, error) {
	id := "lv_" + randomID()
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO leave_requests (id, org_id, user_id, start_date, end_date, reason)
		VALUES ($1,$2,$3,$4,$5,$6)`, id, orgID, userID, start, end, reason)
	if err != nil {
		return models.LeaveRequest{}, err
	}
	name, _ := db.userName(ctx, userID)
	return models.LeaveRequest{
		ID: id, OrgID: orgID, UserID: userID, UserName: name,
		StartDate: start, EndDate: end, Reason: reason, Status: "PENDING", CreatedAt: time.Now(),
	}, nil
}

func (db *DB) UpdateLeaveStatus(ctx context.Context, orgID, id, status string) (models.LeaveRequest, error) {
	_, err := db.Pool.Exec(ctx, `UPDATE leave_requests SET status=$1 WHERE org_id=$2 AND id=$3`, status, orgID, id)
	if err != nil {
		return models.LeaveRequest{}, err
	}
	var l models.LeaveRequest
	err = db.Pool.QueryRow(ctx, `
		SELECT l.id, l.org_id, l.user_id, COALESCE(u.name,''), l.start_date, l.end_date, l.reason, l.status, l.created_at
		FROM leave_requests l LEFT JOIN users u ON u.id = l.user_id
		WHERE l.org_id=$1 AND l.id=$2`, orgID, id).
		Scan(&l.ID, &l.OrgID, &l.UserID, &l.UserName, &l.StartDate, &l.EndDate, &l.Reason, &l.Status, &l.CreatedAt)
	return l, err
}

func (db *DB) ListContractTemplates(ctx context.Context, orgID string) ([]models.ContractTemplate, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, org_id, name, body, created_at FROM contract_templates WHERE org_id=$1 ORDER BY created_at DESC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.ContractTemplate
	for rows.Next() {
		var t models.ContractTemplate
		if err := rows.Scan(&t.ID, &t.OrgID, &t.Name, &t.Body, &t.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}

func (db *DB) CreateContractTemplate(ctx context.Context, orgID, name, body string) (models.ContractTemplate, error) {
	id := "ctpl_" + randomID()
	t := models.ContractTemplate{ID: id, OrgID: orgID, Name: name, Body: body, CreatedAt: time.Now()}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO contract_templates (id, org_id, name, body) VALUES ($1,$2,$3,$4)`, id, orgID, name, body)
	return t, err
}

func (db *DB) ListContracts(ctx context.Context, orgID string) ([]models.Contract, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, org_id, COALESCE(template_id,''), title, party_name, party_email, body, status, created_at, signed_at
		FROM contracts WHERE org_id=$1 ORDER BY created_at DESC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Contract
	for rows.Next() {
		var c models.Contract
		if err := rows.Scan(&c.ID, &c.OrgID, &c.TemplateID, &c.Title, &c.PartyName, &c.PartyEmail,
			&c.Body, &c.Status, &c.CreatedAt, &c.SignedAt); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func (db *DB) CreateContract(ctx context.Context, orgID, templateID, title, partyName, partyEmail, body string) (models.Contract, error) {
	id := "ctr_" + randomID()
	if body == "" && templateID != "" {
		_ = db.Pool.QueryRow(ctx, `SELECT body FROM contract_templates WHERE org_id=$1 AND id=$2`, orgID, templateID).Scan(&body)
	}
	c := models.Contract{
		ID: id, OrgID: orgID, TemplateID: templateID, Title: title,
		PartyName: partyName, PartyEmail: partyEmail, Body: body, Status: "DRAFT", CreatedAt: time.Now(),
	}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO contracts (id, org_id, template_id, title, party_name, party_email, body, status)
		VALUES ($1,$2,NULLIF($3,''),$4,$5,$6,$7,'DRAFT')`,
		c.ID, c.OrgID, c.TemplateID, c.Title, c.PartyName, c.PartyEmail, c.Body)
	return c, err
}

func (db *DB) SignContract(ctx context.Context, orgID, id string) (models.Contract, error) {
	now := time.Now()
	_, err := db.Pool.Exec(ctx, `
		UPDATE contracts SET status='SIGNED', signed_at=$1 WHERE org_id=$2 AND id=$3`, now, orgID, id)
	if err != nil {
		return models.Contract{}, err
	}
	var c models.Contract
	err = db.Pool.QueryRow(ctx, `
		SELECT id, org_id, COALESCE(template_id,''), title, party_name, party_email, body, status, created_at, signed_at
		FROM contracts WHERE org_id=$1 AND id=$2`, orgID, id).
		Scan(&c.ID, &c.OrgID, &c.TemplateID, &c.Title, &c.PartyName, &c.PartyEmail, &c.Body, &c.Status, &c.CreatedAt, &c.SignedAt)
	return c, err
}

func (db *DB) ListRagDocuments(ctx context.Context, orgID string) ([]models.RagDocument, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, org_id, title, content, tags, created_at FROM rag_documents WHERE org_id=$1 ORDER BY created_at DESC`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.RagDocument
	for rows.Next() {
		var d models.RagDocument
		if err := rows.Scan(&d.ID, &d.OrgID, &d.Title, &d.Content, &d.Tags, &d.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	return out, rows.Err()
}

func (db *DB) CreateRagDocument(ctx context.Context, orgID string, in models.RagDocumentInput) (models.RagDocument, error) {
	id := "rag_" + randomID()
	tags := in.Tags
	if tags == nil {
		tags = []string{}
	}
	d := models.RagDocument{ID: id, OrgID: orgID, Title: in.Title, Content: in.Content, Tags: tags, CreatedAt: time.Now()}
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO rag_documents (id, org_id, title, content, tags) VALUES ($1,$2,$3,$4,$5)`,
		d.ID, d.OrgID, d.Title, d.Content, d.Tags)
	return d, err
}

func (db *DB) SearchRagDocuments(ctx context.Context, orgID, query string, limit int) ([]models.RagSearchHit, error) {
	if limit <= 0 {
		limit = 5
	}
	q := strings.TrimSpace(query)
	if q == "" {
		return nil, nil
	}
	rows, err := db.Pool.Query(ctx, `
		SELECT id, title, content,
			ts_rank(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,'')),
				plainto_tsquery('simple', $2)) AS score
		FROM rag_documents
		WHERE org_id = $1
		  AND to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,'')) @@ plainto_tsquery('simple', $2)
		ORDER BY score DESC
		LIMIT $3`, orgID, q, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.RagSearchHit
	for rows.Next() {
		var id, title, content string
		var score float64
		if err := rows.Scan(&id, &title, &content, &score); err != nil {
			return nil, err
		}
		out = append(out, models.RagSearchHit{
			DocumentID: id, Title: title, Snippet: rag.Snippet(content, q, 180), Score: score,
		})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(out) > 0 {
		return out, nil
	}
	// Japanese text: full-text 'simple' often misses CJK; fall back to substring match.
	like := "%" + q + "%"
	rows2, err := db.Pool.Query(ctx, `
		SELECT id, title, content
		FROM rag_documents
		WHERE org_id = $1
		  AND (title ILIKE $2 OR content ILIKE $2)
		ORDER BY created_at DESC
		LIMIT $3`, orgID, like, limit)
	if err != nil {
		return out, err
	}
	defer rows2.Close()
	for rows2.Next() {
		var id, title, content string
		if err := rows2.Scan(&id, &title, &content); err != nil {
			return nil, err
		}
		out = append(out, models.RagSearchHit{
			DocumentID: id, Title: title, Snippet: rag.Snippet(content, q, 180), Score: 0.6,
		})
	}
	return out, rows2.Err()
}

func (db *DB) userName(ctx context.Context, userID string) (string, error) {
	var name string
	err := db.Pool.QueryRow(ctx, `SELECT name FROM users WHERE id=$1`, userID).Scan(&name)
	return name, err
}
