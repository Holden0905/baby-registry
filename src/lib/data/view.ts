/**
 * Data from read view: site_equipment_requirements_tasks_v
 * Used for lists (site dashboard, equipment list, requirement list, task list).
 */
import type { SiteEquipmentRequirementsTasksRow } from "@/types/database";
import { createServerSupabase } from "@/lib/supabase/server";

export async function getViewData(filters?: {
  site_id?: string;
  equipment_id?: string;
  task_status?: string;
  assigned_to_user_id?: string;
}): Promise<SiteEquipmentRequirementsTasksRow[]> {
  const supabase = createServerSupabase();
  let query = supabase.from("site_equipment_requirements_tasks_v").select("*");

  if (filters?.site_id) {
    query = query.eq("site_id", filters.site_id);
  }
  if (filters?.equipment_id) {
    query = query.eq("equipment_id", filters.equipment_id);
  }
  if (filters?.task_status) {
    query = query.eq("task_status", filters.task_status);
  }
  if (filters?.assigned_to_user_id) {
    query = query.eq("assigned_to_user_id", filters.assigned_to_user_id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getViewData] Supabase error querying site_equipment_requirements_tasks_v:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      fullError: JSON.stringify(error, null, 2),
    });
    throw error;
  }
  return (data ?? []) as SiteEquipmentRequirementsTasksRow[];
}
