import type { Equipment } from "@/types/database";
import { createServerSupabase } from "@/lib/supabase/server";
import { getViewData } from "./view";

/** Get equipment from view for a site - returns unique equipment with aggregated counts */
export async function getEquipmentForSite(siteId: string) {
  let rows: Awaited<ReturnType<typeof getViewData>> = [];
  try {
    rows = await getViewData({ site_id: siteId });
  } catch (e) {
    console.error("[getEquipmentForSite] View failed, falling back to equipment table:", e);
    return getEquipmentForSiteFromTable(siteId);
  }
  const byEquip = new Map<
    string,
    {
      equipment_id: string;
      asset_tag: string;
      equipment_description: string;
      equipment_type: string | null;
      process_unit: string | null;
      requirements: string[];
      open_task_count: number;
    }
  >();
  for (const r of rows ?? []) {
    const key = r.equipment_id;
    if (!key) continue;
    const existing = byEquip.get(key);
    const isOpen =
      r.task_status && !["closed", "approved", "rejected"].includes(r.task_status);
    const citation = r.citation ?? "";
    if (existing) {
      if (isOpen) existing.open_task_count++;
      if (citation && !existing.requirements.includes(citation)) {
        existing.requirements.push(citation);
      }
    } else {
      byEquip.set(key, {
        equipment_id: r.equipment_id,
        asset_tag: r.asset_tag ?? "",
        equipment_description: r.equipment_description ?? "",
        equipment_type: null,
        process_unit: null,
        requirements: citation ? [citation] : [],
        open_task_count: isOpen ? 1 : 0,
      });
    }
  }
  const result = Array.from(byEquip.values()).sort((a, b) =>
    a.asset_tag.localeCompare(b.asset_tag)
  );
  if (result.length === 0) {
    return getEquipmentForSiteFromTable(siteId);
  }
  const equipmentData = await fetchEquipmentTypesAndProcessUnits(
    result.map((e) => e.equipment_id)
  );
  for (const eq of result) {
    const extra = equipmentData.get(eq.equipment_id);
    if (extra) {
      eq.equipment_type = extra.equipment_type;
      eq.process_unit = extra.process_unit;
      if (extra.requirements?.length) eq.requirements = extra.requirements;
    }
  }
  return result;
}

/** Fetch equipment_type, process_unit, and requirements for given equipment ids */
async function fetchEquipmentTypesAndProcessUnits(equipmentIds: string[]) {
  if (equipmentIds.length === 0) return new Map();
  const supabase = createServerSupabase();
  const { data: equipData } = await supabase
    .from("equipment")
    .select("id, equipment_type, process_unit")
    .in("id", equipmentIds);
  const { data: erData } = await supabase
    .from("equipment_requirements")
    .select("equipment_id, requirements(citation)")
    .in("equipment_id", equipmentIds);
  const map = new Map<
    string,
    { equipment_type: string | null; process_unit: string | null; requirements: string[] }
  >();
  for (const e of equipData ?? []) {
    map.set(e.id, {
      equipment_type: e.equipment_type ?? null,
      process_unit: e.process_unit ?? null,
      requirements: [],
    });
  }
  for (const er of erData ?? []) {
    const row = er as { equipment_id: string; requirements: { citation: string } | { citation: string }[] | null };
    const entry = map.get(row.equipment_id);
    const req = row.requirements;
    const citation = Array.isArray(req) ? req[0]?.citation : req?.citation;
    if (entry && citation && !entry.requirements.includes(citation)) {
      entry.requirements.push(citation);
    }
  }
  return map;
}

/** Fetch only requirements for equipment ids (when equipment_type/process_unit already from main query) */
async function getRequirementsForEquipment(equipmentIds: string[]) {
  if (equipmentIds.length === 0) return new Map<string, string[]>();
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("equipment_requirements")
    .select("equipment_id, requirements(citation)")
    .in("equipment_id", equipmentIds);
  const map = new Map<string, string[]>();
  for (const er of data ?? []) {
    const row = er as { equipment_id: string; requirements: { citation: string } | { citation: string }[] | null };
    const citations = map.get(row.equipment_id) ?? [];
    const req = row.requirements;
    const citation = Array.isArray(req) ? req[0]?.citation : req?.citation;
    if (citation && !citations.includes(citation)) citations.push(citation);
    map.set(row.equipment_id, citations);
  }
  return map;
}

/** Fallback: get equipment directly from table when view fails or returns empty */
async function getEquipmentForSiteFromTable(siteId: string) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("equipment")
    .select("id, asset_tag, description, equipment_type, process_unit")
    .eq("equipment_site_id", siteId)
    .eq("is_active", true)
    .order("asset_tag");
  if (error) throw error;
  const ids = (data ?? []).map((e) => e.id);
  const extraMap = await fetchEquipmentTypesAndProcessUnits(ids);
  return (data ?? []).map((e) => {
    const extra = extraMap.get(e.id);
    return {
      equipment_id: e.id,
      asset_tag: e.asset_tag ?? "",
      equipment_description: e.description ?? "",
      equipment_type: e.equipment_type ?? extra?.equipment_type ?? null,
      process_unit: e.process_unit ?? extra?.process_unit ?? null,
      requirements: extra?.requirements ?? [],
      open_task_count: 0,
    };
  });
}

/** Get equipment across all sites or filtered by site */
export async function getAllEquipment(siteId?: string) {
  const supabase = createServerSupabase();
  let query = supabase
    .from("equipment")
    .select("id, asset_tag, description, equipment_site_id, equipment_type, process_unit")
    .eq("is_active", true)
    .order("asset_tag");

  if (siteId) {
    query = query.eq("equipment_site_id", siteId);
  }

  const { data: equipData, error } = await query;
  if (error) throw error;

  const ids = (equipData ?? []).map((e) => e.id);
  const requirementsMap = ids.length > 0 ? await getRequirementsForEquipment(ids) : new Map<string, string[]>();

  const items = (equipData ?? []).map((e: {
    id: string;
    asset_tag: string | null;
    description: string | null;
    equipment_site_id: string;
    equipment_type?: string | null;
    process_unit?: string | null;
  }) => {
    return {
      equipment_id: e.id,
      asset_tag: e.asset_tag ?? "",
      equipment_description: e.description ?? "",
      equipment_site_id: e.equipment_site_id,
      equipment_type: e.equipment_type ?? null,
      process_unit: e.process_unit ?? null,
      requirements: requirementsMap.get(e.id) ?? [],
    };
  });

  return items;
}

/** Get equipment detail from view - requirements + tasks for one equipment */
export async function getEquipmentDetail(equipmentId: string) {
  try {
    return await getViewData({ equipment_id: equipmentId });
  } catch (e) {
    console.error("[getEquipmentDetail] View failed:", e);
    return [];
  }
}

export async function getEquipmentById(equipmentId: string): Promise<Equipment | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", equipmentId)
    .single();
  if (error) throw error;
  return data as Equipment | null;
}

export type CreateEquipmentInput = {
  asset_tag: string;
  description: string;
  equipment_site_id: string;
  sap_equipment_number?: string | null;
  sort_field?: string | null;
  functional_loc?: string | null;
  location_description?: string | null;
  equipment_type?: string | null;
  equipment_subtype?: string | null;
  process_unit?: string | null;
  area_location?: string | null;
  is_active?: boolean;
};

export async function createEquipment(input: CreateEquipmentInput) {
  const supabase = createServerSupabase();
  const payload: Record<string, unknown> = {
    asset_tag: input.asset_tag,
    description: input.description ?? "",
    equipment_site_id: input.equipment_site_id,
    is_active: input.is_active ?? true,
  };
  const optionalFields = [
    "sap_equipment_number",
    "sort_field",
    "functional_loc",
    "location_description",
    "equipment_type",
    "equipment_subtype",
    "process_unit",
    "area_location",
  ] as const;
  for (const key of optionalFields) {
    const val = input[key];
    if (val !== undefined && val !== null && val !== "") {
      payload[key] = val;
    }
  }
  const { data, error } = await supabase.from("equipment").insert(payload).select().single();
  if (error) throw error;
  return data as Equipment;
}

const EQUIPMENT_UPDATE_FIELDS = [
  "asset_tag",
  "description",
  "sap_equipment_number",
  "sort_field",
  "functional_loc",
  "location_description",
  "equipment_type",
  "equipment_subtype",
  "process_unit",
  "area_location",
  "is_active",
] as const;

export async function updateEquipment(
  equipmentId: string,
  input: Partial<CreateEquipmentInput> & { is_active?: boolean }
) {
  const supabase = createServerSupabase();
  const payload: Record<string, unknown> = {};
  for (const key of EQUIPMENT_UPDATE_FIELDS) {
    const val = input[key];
    if (val !== undefined) {
      payload[key] = val === "" ? null : val;
    }
  }
  if (Object.keys(payload).length === 0) return getEquipmentById(equipmentId);
  const { data, error } = await supabase
    .from("equipment")
    .update(payload)
    .eq("id", equipmentId)
    .select()
    .single();
  if (error) throw error;
  return data as Equipment;
}
