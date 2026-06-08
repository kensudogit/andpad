-- ANDPAD: demo organization branding (construction PM)
UPDATE organizations
SET name = 'サンプル建設株式会社',
    slug = 'sample-construction'
WHERE id = 'org_demo'
   OR slug IN ('sakura-dental', 'sakura-dental-demo');
