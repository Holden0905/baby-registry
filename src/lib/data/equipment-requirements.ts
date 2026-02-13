import { createServerSupabase } from "@/lib/supabase/server";

/** Ensure equipment_requirement exists - required for tasks to show in the view */
export async function ensureEquipmentRequirement(
  equipment_id: string,
  requirement_id: string
) {
  const supabase = createServerSupabase();

  const { data: existing } = await supabase
    .from("equipment_requirements")
    .select("id")
    .eq("equipment_id", equipment_id)
    .eq("requirement_id", requirement_id)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("equipment_requirements").insert({
    equipment_id,
    requirement_id,
    applicability: "applicable",
  });

  if (error) throw error;
}
