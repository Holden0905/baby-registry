-- Updated view: shows equipment with tasks from BOTH:
-- 1) equipment_requirements path (requirements mapped to equipment)
-- 2) direct tasks path (tasks linked to equipment - works even without equipment_requirement)
-- Run this in Supabase SQL Editor to replace the existing view.

CREATE OR REPLACE VIEW public.site_equipment_requirements_tasks_v AS
-- Path 1: Through equipment_requirements (original logic)
SELECT
  s.id AS site_id,
  s.name AS site_name,
  s.client_name,
  e.id AS equipment_id,
  e.asset_tag,
  e.description AS equipment_description,
  e.equipment_site_id,
  r.id AS requirement_id,
  r.citation,
  r.requirement_summary,
  t.id AS task_id,
  t.task_template_id,
  tt.task_name,
  t.status AS task_status,
  t.due_date,
  t.assigned_to_user_id
FROM sites s
JOIN equipment e ON e.equipment_site_id = s.id AND e.is_active = true
LEFT JOIN equipment_requirements er ON er.equipment_id = e.id
LEFT JOIN requirements r ON r.id = er.requirement_id AND r.is_active = true
LEFT JOIN task_templates tt ON tt.requirement_id = r.id AND tt.active = true
LEFT JOIN tasks t ON t.task_template_id = tt.id AND t.equipment_id = e.id
UNION
-- Path 2: Tasks directly on equipment (catches tasks added without equipment_requirement)
SELECT
  s.id AS site_id,
  s.name AS site_name,
  s.client_name,
  e.id AS equipment_id,
  e.asset_tag,
  e.description AS equipment_description,
  e.equipment_site_id,
  r.id AS requirement_id,
  r.citation,
  r.requirement_summary,
  t.id AS task_id,
  t.task_template_id,
  tt.task_name,
  t.status AS task_status,
  t.due_date,
  t.assigned_to_user_id
FROM sites s
JOIN equipment e ON e.equipment_site_id = s.id AND e.is_active = true
JOIN tasks t ON t.equipment_id = e.id
LEFT JOIN task_templates tt ON tt.id = t.task_template_id
LEFT JOIN requirements r ON r.id = tt.requirement_id AND r.site_id = s.id;
