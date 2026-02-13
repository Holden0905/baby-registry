"use server";

import { revalidatePath } from "next/cache";
import {
  createTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
} from "@/lib/data/task-templates";

export async function createTaskTemplateAction(input: {
  requirement_id: string;
  task_name: string;
  task_description: string;
  frequency: string;
  active: boolean;
}): Promise<{ error?: string }> {
  try {
    if (!input.task_name?.trim()) return { error: "Task name is required" };
    if (!input.frequency?.trim()) return { error: "Frequency is required" };
    if (!input.requirement_id?.trim()) return { error: "Requirement is required" };

    await createTaskTemplate({
      requirement_id: input.requirement_id,
      task_name: input.task_name.trim(),
      task_description: (input.task_description ?? "").trim(),
      frequency: input.frequency.trim(),
      active: input.active ?? true,
    });
    revalidatePath("/task-templates");
    revalidatePath("/tasks");
    revalidatePath("/tasks/new");
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[createTaskTemplateAction] error:", err);
    return { error: message };
  }
}

export async function updateTaskTemplateAction(
  id: string,
  input: Partial<{
    requirement_id: string;
    task_name: string;
    task_description: string;
    frequency: string;
    active: boolean;
  }>
): Promise<{ error?: string }> {
  try {
    if (input.task_name !== undefined && !input.task_name?.trim())
      return { error: "Task name is required" };
    if (input.frequency !== undefined && !input.frequency?.trim())
      return { error: "Frequency is required" };

    await updateTaskTemplate(id, input);
    revalidatePath("/task-templates");
    revalidatePath("/tasks");
    revalidatePath("/tasks/new");
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[updateTaskTemplateAction] error:", err);
    return { error: message };
  }
}

export async function deleteTaskTemplateAction(id: string): Promise<{ error?: string }> {
  try {
    await deleteTaskTemplate(id);
    revalidatePath("/task-templates");
    revalidatePath("/tasks");
    revalidatePath("/tasks/new");
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[deleteTaskTemplateAction] error:", err);
    return { error: message };
  }
}
