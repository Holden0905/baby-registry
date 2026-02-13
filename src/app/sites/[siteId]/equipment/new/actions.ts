"use server";

import { revalidatePath } from "next/cache";
import { createEquipment } from "@/lib/data/equipment";
import { createTask } from "@/lib/data/tasks";
import { ensureEquipmentRequirement } from "@/lib/data/equipment-requirements";

export async function createEquipmentAction(input: {
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
  task_template_id?: string;
  requirement_id?: string;
  due_date?: string;
}): Promise<{ error?: string }> {
  try {
    const equipment = await createEquipment({
      asset_tag: input.asset_tag,
      description: input.description,
      equipment_site_id: input.equipment_site_id,
      sap_equipment_number: input.sap_equipment_number,
      sort_field: input.sort_field,
      functional_loc: input.functional_loc,
      location_description: input.location_description,
      equipment_type: input.equipment_type,
      equipment_subtype: input.equipment_subtype,
      process_unit: input.process_unit,
      area_location: input.area_location,
    });

    if (input.task_template_id && input.requirement_id && input.due_date) {
      await ensureEquipmentRequirement(equipment.id, input.requirement_id);
      await createTask({
      task_template_id: input.task_template_id,
      equipment_id: equipment.id,
      due_date: input.due_date,
        status: "open",
      });
    }

    revalidatePath(`/sites/${input.equipment_site_id}/equipment`);
    revalidatePath(`/sites/${input.equipment_site_id}`);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[createEquipmentAction] error:", err);
    return { error: message };
  }
}
