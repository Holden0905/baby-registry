import type { Requirement } from "@/types/database";
import { createServerSupabase } from "@/lib/supabase/server";

export type RequirementOption = {
  id: string;
  citation: string;
  requirement_summary: string;
  site_id: string;
};

export type RequirementWithSite = Requirement & {
  site_name: string;
};

/** Get unique regulation names from requirements (for equipment dropdown) */
export async function getUniqueRegulationNames(): Promise<string[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("requirements")
    .select("regulation_name")
    .not("regulation_name", "is", null);
  if (error) throw error;
  const names = (data ?? [])
    .map((r: { regulation_name: string }) => r.regulation_name?.trim())
    .filter((n): n is string => !!n);
  return [...new Set(names)].sort();
}

/** Get all requirements (for dropdowns, etc.) */
export async function getAllRequirements(siteId?: string): Promise<RequirementOption[]> {
  const supabase = createServerSupabase();
  let query = supabase
    .from("requirements")
    .select("id, citation, requirement_summary, site_id")
    .order("citation");

  if (siteId) {
    query = query.eq("site_id", siteId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as RequirementOption[];
}

/** Get all requirements with site name (for management page) */
export async function getRequirementsWithSites(): Promise<RequirementWithSite[]> {
  const supabase = createServerSupabase();
  const { data: requirements, error: reqError } = await supabase
    .from("requirements")
    .select("id, citation, regulation_name, requirement_summary, requirement_text, site_id, is_active")
    .order("citation");
  if (reqError) throw reqError;

  const siteIds = [...new Set((requirements ?? []).map((r) => r.site_id))];
  if (siteIds.length === 0) return [];

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name")
    .in("id", siteIds);
  const siteMap = new Map((sites ?? []).map((s: { id: string; name: string }) => [s.id, s.name]));

  return (requirements ?? []).map((r) => ({
    ...r,
    site_name: siteMap.get(r.site_id) ?? "—",
  })) as RequirementWithSite[];
}

export async function createRequirement(input: {
  citation: string;
  regulation_name: string;
  requirement_summary: string;
  requirement_text: string;
  site_id: string;
  is_active: boolean;
}): Promise<Requirement> {
  const supabase = createServerSupabase();
  const payload: Record<string, unknown> = {
    citation: input.citation.trim(),
    requirement_summary: input.requirement_summary.trim(),
    requirement_text: (input.requirement_text ?? "").trim() || null,
    site_id: input.site_id,
    is_active: input.is_active ?? true,
  };
  if (input.regulation_name?.trim()) {
    payload.regulation_name = input.regulation_name.trim();
  }
  const { data, error } = await supabase
    .from("requirements")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Requirement;
}

export async function updateRequirement(
  id: string,
  input: Partial<{
    citation: string;
    regulation_name: string;
    requirement_summary: string;
    requirement_text: string;
    site_id: string;
    is_active: boolean;
  }>
): Promise<Requirement> {
  const supabase = createServerSupabase();
  const payload: Record<string, unknown> = {};
  if (input.citation !== undefined) payload.citation = input.citation.trim();
  if (input.regulation_name !== undefined) payload.regulation_name = input.regulation_name?.trim() || null;
  if (input.requirement_summary !== undefined) payload.requirement_summary = input.requirement_summary.trim();
  if (input.requirement_text !== undefined) payload.requirement_text = input.requirement_text?.trim() || null;
  if (input.site_id !== undefined) payload.site_id = input.site_id;
  if (input.is_active !== undefined) payload.is_active = input.is_active;

  const { data, error } = await supabase
    .from("requirements")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Requirement;
}

export async function deleteRequirement(id: string): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase.from("requirements").delete().eq("id", id);
  if (error) throw error;
}
