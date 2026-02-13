"use server";

import { revalidatePath } from "next/cache";
import { createTask } from "@/lib/data/tasks";
import { ensureEquipmentRequirement } from "@/lib/data/equipment-requirements";

export async function createTaskAction(input: {
  task_template_id: string;
  requirement_id: string;
  equipment_id: string;
  due_date: string;
  status?: string;
  assigned_to_user_id?: string;
}): Promise<{ error?: string }> {
  try {
    await ensureEquipmentRequirement(input.equipment_id, input.requirement_id);
    await createTask({
      task_template_id: input.task_template_id,
      equipment_id: input.equipment_id,
      due_date: input.due_date,
      status: input.status ?? "open",
      assigned_to_user_id: input.assigned_to_user_id,
    });
    revalidatePath("/tasks");
    revalidatePath("/sites");
    revalidatePath("/equipment");
    revalidatePath("/users");
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[createTaskAction] error:", err);
    return { error: message };
  }
}
