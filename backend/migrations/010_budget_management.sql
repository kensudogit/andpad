-- Budget / estimate / cost management for large construction projects

CREATE TABLE project_budgets (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    budget_type TEXT NOT NULL DEFAULT 'EXECUTION_BUDGET',
    status TEXT NOT NULL DEFAULT 'DRAFT',
    version_no INT NOT NULL DEFAULT 1,
    contract_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_project_budgets_org ON project_budgets(org_id);
CREATE INDEX idx_project_budgets_project ON project_budgets(project_id);

CREATE TABLE budget_line_items (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    budget_id TEXT NOT NULL REFERENCES project_budgets(id) ON DELETE CASCADE,
    category_code TEXT NOT NULL,
    category_name TEXT NOT NULL,
    wbs_code TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    estimate_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
    budget_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
    committed_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
    actual_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_budget_line_items_budget ON budget_line_items(budget_id);
CREATE INDEX idx_budget_line_items_org ON budget_line_items(org_id);

CREATE TABLE cost_entries (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    line_item_id TEXT REFERENCES budget_line_items(id) ON DELETE SET NULL,
    entry_type TEXT NOT NULL DEFAULT 'OTHER',
    vendor_name TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    amount NUMERIC(16,2) NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_no TEXT NOT NULL DEFAULT '',
    recorded_by TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cost_entries_org ON cost_entries(org_id);
CREATE INDEX idx_cost_entries_project ON cost_entries(project_id);
CREATE INDEX idx_cost_entries_line ON cost_entries(line_item_id);

INSERT INTO saas_modules (code, name, description) VALUES
    ('BUDGET_MGMT', '予算・原価管理', '見積・実行予算・原価実績・予算差異の一元管理')
ON CONFLICT (code) DO NOTHING;

INSERT INTO org_modules (org_id, module_code, enabled)
SELECT o.id, 'BUDGET_MGMT', TRUE
FROM organizations o
ON CONFLICT DO NOTHING;
