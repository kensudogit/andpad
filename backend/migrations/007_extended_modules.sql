-- Extended modules: 電子納品, BM, Analytics, API連携, BIM

CREATE TABLE api_integrations (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT '',
    endpoint_url TEXT NOT NULL DEFAULT '',
    api_key_hint TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_api_integrations_org ON api_integrations(org_id);

CREATE TABLE bim_models (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'IFC',
    viewer_url TEXT NOT NULL DEFAULT '',
    file_size_mb FLOAT,
    status TEXT NOT NULL DEFAULT 'READY',
    uploaded_by TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bim_models_org ON bim_models(org_id);
CREATE INDEX idx_bim_models_project ON bim_models(project_id);

INSERT INTO saas_modules (code, name, description) VALUES
    ('E_DELIVERY', '電子納品', '竣工図書・検査資料の電子納品・提出管理'),
    ('BM', 'BM', 'ビルメンテナンス・設備点検・修繕履歴管理'),
    ('ANALYTICS', 'ANDPAD Analytics', '案件・コスト・進捗の経営分析ダッシュボード'),
    ('API_INTEGRATION', 'API連携', '外部システムとのAPI・Webhook連携'),
    ('BIM', 'BIM', 'クラウドBIMビューワー・モデル共有')
ON CONFLICT (code) DO NOTHING;

INSERT INTO org_modules (org_id, module_code, enabled)
SELECT o.id, m.code, TRUE
FROM organizations o
CROSS JOIN saas_modules m
WHERE m.code IN ('E_DELIVERY', 'BM', 'ANALYTICS', 'API_INTEGRATION', 'BIM')
ON CONFLICT DO NOTHING;
