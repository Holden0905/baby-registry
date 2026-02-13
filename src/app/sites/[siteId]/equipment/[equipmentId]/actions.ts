"use server";

import { revalidatePath } from "next/cache";
import { createTask } from "@/lib/data/tasks";
import { updateEquipment } from "@/lib/data/equipment";
import { ensureEquipmentRequirement } from "@/lib/data/equipment-requirements";

export async function updateEquipmentAction(input: {
  equipment_id: string;
  asset_tag: string;
  description: string;
  sap_equipment_number?: string | null;
  sort_field?: string | null;
  functional_loc?: string | null;
  location_description?: string | null;
  equipment_type?: string | null;
  equipment_subtype?: string | null;
  process_unit?: string | null;
  area_location?: string | null;
  is_active?: boolean;
}): Promise<{ error?: string }> {
  try {
    await updateEquipment(input.equipment_id, {
      asset_tag: input.asset_tag,
      description: input.description,
      sap_equipment_number: input.sap_equipment_number,
      sort_field: input.sort_field,
      functional_loc: input.functional_loc,
      location_description: input.location_description,
      equipment_type: input.equipment_type,
      equipment_subtype: input.equipment_subtype,
      process_unit: input.process_unit,
      area_location: input.area_location,
      is_active: input.is_active,
    });
    revalidatePath("/equipment");
    revalidatePath("/sites");
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[updateEquipmentAction] error:", err);
    return { error: message };
  }
}

export async function createTaskAction(input: {
  task_template_id: string;
  equipment_id: string;
  requirement_id: string;
  due_date: string;
}): Promise<{ error?: string }> {
  try {
    console.log("[createTaskAction] input:", input);
    await ensureEquipmentRequirement(input.equipment_id, input.requirement_id);
    console.log("[createTaskAction] equipment_requirement ensured");
    await createTask({
      task_template_id: input.task_template_id,
      equipment_id: input.equipment_id,
      due_date: input.due_date,
    });
    console.log("[createTaskAction] task created");
    revalidatePath("/tasks");
    revalidatePath("/sites");
    revalidatePath("/users");
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[createTaskAction] error:", err);
    return { error: message };
  }
}
