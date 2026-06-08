-- Construction project management modules (ANDPAD-style)

CREATE TABLE construction_projects (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    site_address TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'PLANNING',
    manager_name TEXT NOT NULL DEFAULT '',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_construction_projects_org ON construction_projects(org_id);

CREATE TABLE project_module_records (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    module_code TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN',
    detail TEXT NOT NULL DEFAULT '',
    amount NUMERIC(14,2),
    person_name TEXT NOT NULL DEFAULT '',
    record_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_project_module_records_org ON project_module_records(org_id);
CREATE INDEX idx_project_module_records_project ON project_module_records(project_id);
CREATE INDEX idx_project_module_records_module ON project_module_records(org_id, module_code);

INSERT INTO saas_modules (code, name, description) VALUES
    ('CONSTRUCTION_MGMT', '施工管理', '工程表・タスク・進捗の一元管理'),
    ('DRAWINGS', '図面', '図面の版管理・現場共有'),
    ('BLACKBOARD', '黒板', '黒板付き写真・現場記録'),
    ('INSPECTION', '検査', '品質検査・チェックリスト'),
    ('PROJECT_BOARD', 'ボード', '案件カンバン・掲示板'),
    ('INQUIRY_PROFIT', '引合粗利管理', '見積・粗利シミュレーション'),
    ('ORDERS', '受発注', '発注・受注・資材管理'),
    ('REMOTE_SITE', '遠隔臨場', 'リモート現場確認・記録'),
    ('DOC_APPROVAL', '資料承認', '資料の承認ワークフロー'),
    ('SCAN_3D', '3Dスキャン', '3Dスキャンデータ・BIM連携'),
    ('BILLING', '請求管理', '請求書・入金管理'),
    ('WORK_RATE', '歩掛管理', '歩掛・歩掛率の管理'),
    ('SITE_ACCESS', '入退場管理', '現場入退場・ゲート管理')
ON CONFLICT (code) DO NOTHING;

INSERT INTO org_modules (org_id, module_code, enabled)
SELECT o.id, m.code, TRUE
FROM organizations o
CROSS JOIN saas_modules m
WHERE m.code IN (
    'CONSTRUCTION_MGMT', 'DRAWINGS', 'BLACKBOARD', 'INSPECTION', 'PROJECT_BOARD',
    'INQUIRY_PROFIT', 'ORDERS', 'REMOTE_SITE', 'DOC_APPROVAL', 'SCAN_3D',
    'BILLING', 'WORK_RATE', 'SITE_ACCESS'
)
ON CONFLICT DO NOTHING;
