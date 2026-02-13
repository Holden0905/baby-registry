import { createServerSupabase } from "@/lib/supabase/server";

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
