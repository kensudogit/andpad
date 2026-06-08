-- Document RAG is opt-in; AI chatbot stays enabled by default.
UPDATE org_modules SET enabled = FALSE WHERE module_code = 'DOC_RAG';
