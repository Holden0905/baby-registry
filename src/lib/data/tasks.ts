import { createServerSupabase } from "@/lib/supabase/server";
import { getViewData } from "./view";

/** Get task list from read view (for UI lists) */
export async function getTasksFromView(filters?: {
  site_id?: string;
  equipment_id?: string;
  task_status?: string;
  assigned_to_user_id?: string;
}) {
  return getViewData({
    site_id: filters?.site_id,
    equipment_id: filters?.equipment_id,
    task_status: filters?.task_status,
    assigned_to_user_id: filters?.assigned_to_user_id,
  });
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  extra?: { rejection_reason?: string; assigned_to_user_id?: string }
) {
  const supabase = createServerSupabase();
  const payload: Record<string, unknown> = { status };
  if (extra?.rejection_reason !== undefined)
    payload.rejection_reason = extra.rejection_reason;
  if (extra?.assigned_to_user_id !== undefined)
    payload.assigned_to_user_id = extra.assigned_to_user_id;

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function assignTask(taskId: string, assigned_to_user_id: string) {
  return updateTaskStatus(taskId, "assigned", { assigned_to_user_id });
}

export async function updateTaskAssignment(
  taskId: string,
  assigned_to_user_id: string | null
) {
  const status = assigned_to_user_id ? "assigned" : "open";
  return updateTaskStatus(taskId, status, { assigned_to_user_id });
}

export async function createTask(insert: {
  task_template_id: string;
  equipment_id: string;
  due_date: string;
  status?: string;
  assigned_to_user_id?: string | null;
}) {
  const supabase = createServerSupabase();
  const payload: Record<string, unknown> = {
    task_template_id: insert.task_template_id,
    equipment_id: insert.equipment_id,
    due_date: insert.due_date,
    status: insert.status ?? "open",
  };
  if (insert.assigned_to_user_id) {
    payload.assigned_to_user_id = insert.assigned_to_user_id;
  }
  const { data, error } = await supabase.from("tasks").insert(payload).select().single();
  if (error) throw error;
  return data;
}
