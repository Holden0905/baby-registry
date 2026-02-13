/**
 * Database types matching Supabase Postgres schema.
 * Use exact column names from DB.
 */

export interface Site {
  id: string;
  name: string;
  client_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Equipment {
  id: string;
  asset_tag: string;
  description: string;
  equipment_site_id: string;
  regulation_name?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

export interface Requirement {
  id: string;
  citation: string;
  regulation_name?: string;
  requirement_summary: string;
  requirement_text: string;
  site_id: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface EquipmentRequirement {
  id: string;
  equipment_id: string;
  requirement_id: string;
  applicability: string;
  pollutant: string | null;
  notes: string | null;
  mapped_by_user_id: string | null;
  mapped_at: string | null;
  [key: string]: unknown;
}

export interface TaskTemplate {
  id: string;
  requirement_id: string;
  task_name: string;
  task_description: string;
  frequency: string;
  active: boolean;
  [key: string]: unknown;
}

export interface Task {
  id: string;
  task_template_id: string;
  equipment_id: string;
  due_date: string;
  status: string;
  assigned_to_user_id: string | null;
  submitted_at: string | null;
  approved_by_user_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  site_id: string | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Read view: site_equipment_requirements_tasks_v
 * Primary read source for UI lists - join of sites, equipment, requirements, tasks.
 */
export interface SiteEquipmentRequirementsTasksRow {
  site_id: string;
  site_name: string;
  client_name: string;
  equipment_id: string;
  asset_tag: string;
  equipment_description: string;
  equipment_site_id: string;
  requirement_id: string;
  citation: string;
  requirement_summary: string;
  task_id: string | null;
  task_template_id: string | null;
  task_name: string | null;
  task_status: string | null;
  due_date: string | null;
  assigned_to_user_id: string | null;
  open_task_count?: number;
  [key: string]: unknown;
}

export interface Database {
  public: {
    Tables: {
      sites: { Row: Site };
      equipment: { Row: Equipment };
      requirements: { Row: Requirement };
      equipment_requirements: { Row: EquipmentRequirement };
      task_templates: { Row: TaskTemplate };
      tasks: { Row: Task };
      users: { Row: User };
      site_equipment_requirements_tasks_v: { Row: SiteEquipmentRequirementsTasksRow };
    };
  };
}
