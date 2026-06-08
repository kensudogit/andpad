-- SaaS business modules: DX, CRM, Attendance, E-contract, Chatbot, Document RAG

CREATE TABLE saas_modules (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT ''
);

INSERT INTO saas_modules (code, name, description) VALUES
    ('DX', 'DX推進支援', 'デジタル化ロードマップ・タスク管理'),
    ('CRM', '顧客管理', '患者・取引先の接触履歴管理'),
    ('ATTENDANCE', '勤怠管理', '出退勤・休暇申請'),
    ('ECONTRACT', '電子契約', '契約書テンプレート・署名フロー'),
    ('CHATBOT', 'AIチャットボット', '歯科臨床・運営相談アシスタント'),
    ('DOC_RAG', '文書検索RAG', '院内文書の検索・AI回答');

CREATE TABLE org_modules (
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    module_code TEXT NOT NULL REFERENCES saas_modules(code),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    config JSONB NOT NULL DEFAULT '{}',
    enabled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (org_id, module_code)
);

-- Enable all modules for existing tenants
INSERT INTO org_modules (org_id, module_code, enabled)
SELECT o.id, m.code, TRUE
FROM organizations o
CROSS JOIN saas_modules m
ON CONFLICT DO NOTHING;

-- DX
CREATE TABLE dx_initiatives (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'PLANNED',
    progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
    owner_name TEXT NOT NULL DEFAULT '',
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dx_init_org ON dx_initiatives(org_id);

CREATE TABLE dx_tasks (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    initiative_id TEXT NOT NULL REFERENCES dx_initiatives(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dx_task_init ON dx_tasks(initiative_id);

-- CRM
CREATE TABLE crm_contacts (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    stage TEXT NOT NULL DEFAULT 'LEAD',
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_crm_contact_org ON crm_contacts(org_id);

CREATE TABLE crm_interactions (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id TEXT NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
    kind TEXT NOT NULL DEFAULT 'NOTE',
    summary TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_crm_interaction_contact ON crm_interactions(contact_id);

-- Attendance
CREATE TABLE attendance_records (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_attendance_org_user ON attendance_records(org_id, user_id);

CREATE TABLE leave_requests (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leave_org ON leave_requests(org_id);

-- E-contract
CREATE TABLE contract_templates (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contracts (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id TEXT REFERENCES contract_templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    party_name TEXT NOT NULL,
    party_email TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    signed_at TIMESTAMPTZ
);
CREATE INDEX idx_contract_org ON contracts(org_id);

-- Document RAG
CREATE TABLE rag_documents (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_rag_doc_org ON rag_documents(org_id);
CREATE INDEX idx_rag_doc_search ON rag_documents USING gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, '')));
