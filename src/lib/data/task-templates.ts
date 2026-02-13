import type { TaskTemplate } from "@/types/database";
import { createServerSupabase } from "@/lib/supabase/server";

export type TaskTemplateWithRequirement = TaskTemplate & {
  citation: string;
  requirement_summary: string;
};

export type TaskTemplateOption = {
  id: string;
  task_name: string;
  requirement_id: string;
  citation: string;
};

/** Get task templates for a site (from requirements at that site) */
export async function getTaskTemplatesForSite(siteId: string): Promise<TaskTemplateOption[]> {
  const supabase = createServerSupabase();

  const { data: reqs, error: reqError } = await supabase
    .from("requirements")
    .select("id")
    .eq("site_id", siteId)
    .eq("is_active", true);
  if (reqError) throw reqError;

  const reqIds = (reqs ?? []).map((r) => r.id);
  if (reqIds.length === 0) return [];

  const { data: templates, error } = await supabase
    .from("task_templates")
    .select("id, task_name, requirement_id")
    .in("requirement_id", reqIds)
    .eq("active", true)
    .order("task_name");
  if (error) throw error;

  const { data: reqDetails } = await supabase
    .from("requirements")
    .select("id, citation")
    .in("id", reqIds);
  const citationMap = new Map((reqDetails ?? []).map((r: { id: string; citation: string }) => [r.id, r.citation]));

  return (templates ?? []).map((t: { id: string; task_name: string; requirement_id: string }) => ({
    id: t.id,
    task_name: t.task_name,
    requirement_id: t.requirement_id,
    citation: citationMap.get(t.requirement_id) ?? "",
  }));
}

export type TaskTemplateWithSite = TaskTemplateOption & { site_id: string };

/** Get all task templates with their requirement's site_id (for Add Task form) */
export async function getTaskTemplatesWithSite(): Promise<TaskTemplateWithSite[]> {
  const supabase = createServerSupabase();
  const { data: templates, error } = await supabase
    .from("task_templates")
    .select("id, task_name, requirement_id")
    .eq("active", true)
    .order("task_name");
  if (error) throw error;

  const reqIds = [...new Set((templates ?? []).map((t) => t.requirement_id))];
  if (reqIds.length === 0) return [];

  const { data: reqs } = await supabase
    .from("requirements")
    .select("id, citation, site_id")
    .in("id", reqIds);
  const reqMap = new Map((reqs ?? []).map((r: { id: string; citation: string; site_id: string }) => [r.id, r]));

  return (templates ?? []).map((t) => {
    const req = reqMap.get(t.requirement_id);
    return {
      id: t.id,
      task_name: t.task_name,
      requirement_id: t.requirement_id,
      citation: req?.citation ?? "",
      site_id: req?.site_id ?? "",
    };
  });
}

/** Get all task templates with requirement details (for management page) */
export async function getAllTaskTemplates(): Promise<TaskTemplateWithRequirement[]> {
  const supabase = createServerSupabase();
  const { data: templates, error } = await supabase
    .from("task_templates")
    .select("id, requirement_id, task_name, task_description, frequency, active")
    .order("requirement_id")
    .order("task_name");
  if (error) throw error;

  const reqIds = [...new Set((templates ?? []).map((t) => t.requirement_id))];
  if (reqIds.length === 0) return [];

  const { data: reqs } = await supabase
    .from("requirements")
    .select("id, citation, requirement_summary")
    .in("id", reqIds);
  const reqMap = new Map(
    (reqs ?? []).map((r: { id: string; citation: string; requirement_summary: string }) => [r.id, r])
  );

  return (templates ?? []).map((t) => {
    const req = reqMap.get(t.requirement_id);
    return {
      ...t,
      citation: req?.citation ?? "",
      requirement_summary: req?.requirement_summary ?? "",
    } as TaskTemplateWithRequirement;
  });
}

export async function createTaskTemplate(input: {
  requirement_id: string;
  task_name: string;
  task_description: string;
  frequency: string;
  active: boolean;
}): Promise<TaskTemplate> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("task_templates")
    .insert({
      requirement_id: input.requirement_id,
      task_name: input.task_name,
      task_description: input.task_description,
      frequency: input.frequency,
      active: input.active,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TaskTemplate;
}

export async function updateTaskTemplate(
  id: string,
  input: Partial<{
    requirement_id: string;
    task_name: string;
    task_description: string;
    frequency: string;
    active: boolean;
  }>
): Promise<TaskTemplate> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("task_templates")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as TaskTemplate;
}

export async function deleteTaskTemplate(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("task_templates").delete().eq("id", id);
  if (error) throw error;
}
