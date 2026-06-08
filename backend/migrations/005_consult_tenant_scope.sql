-- Consultation threads: tenant + user lookup index for scoped listing
CREATE INDEX IF NOT EXISTS idx_consult_org_user ON consultation_threads(org_id, user_id);
