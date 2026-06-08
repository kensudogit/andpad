-- Document RAG is ready for production; ensure every org has it enabled.
INSERT INTO org_modules (org_id, module_code, enabled)
SELECT o.id, 'DOC_RAG', TRUE
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM org_modules om WHERE om.org_id = o.id AND om.module_code = 'DOC_RAG'
);

UPDATE org_modules SET enabled = TRUE WHERE module_code = 'DOC_RAG';
