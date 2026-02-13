"use server";

import { revalidatePath } from "next/cache";
import {
  createRequirement,
  updateRequirement,
  deleteRequirement,
} from "@/lib/data/requirements";

export async function createRequirementAction(input: {
  citation: string;
  regulation_name: string;
  requirement_summary: string;
  requirement_text: string;
  site_id: string;
  is_active: boolean;
}): Promise<{ error?: string; success?: boolean }> {
  try {
    if (!input.citation?.trim()) return { error: "Citation is required" };
    if (!input.regulation_name?.trim()) return { error: "Regulation name is required" };
    if (!input.requirement_summary?.trim()) return { error: "Requirement summary is required" };
    if (!input.site_id?.trim()) return { error: "Site is required" };

    await createRequirement({
      citation: input.citation.trim(),
      regulation_name: input.regulation_name.trim(),
      requirement_summary: input.requirement_summary.trim(),
      requirement_text: input.requirement_text?.trim() ?? "",
      site_id: input.site_id,
      is_active: input.is_active ?? true,
    });
    revalidatePath("/requirements");
    revalidatePath("/task-templates");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[createRequirementAction] error:", err);
    return { error: message };
  }
}

export async function updateRequirementAction(
  id: string,
  input: Partial<{
    citation: string;
    regulation_name: string;
    requirement_summary: string;
    requirement_text: string;
    site_id: string;
    is_active: boolean;
  }>
): Promise<{ error?: string; success?: boolean }> {
  try {
    if (input.citation !== undefined && !input.citation?.trim())
      return { error: "Citation is required" };
    if (input.regulation_name !== undefined && !input.regulation_name?.trim())
      return { error: "Regulation name is required" };
    if (input.requirement_summary !== undefined && !input.requirement_summary?.trim())
      return { error: "Requirement summary is required" };
    if (input.site_id !== undefined && !input.site_id?.trim())
      return { error: "Site is required" };

    await updateRequirement(id, input);
    revalidatePath("/requirements");
    revalidatePath("/task-templates");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[updateRequirementAction] error:", err);
    return { error: message };
  }
}

export async function deleteRequirementAction(id: string): Promise<{ error?: string; success?: boolean }> {
  try {
    await deleteRequirement(id);
    revalidatePath("/requirements");
    revalidatePath("/task-templates");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[deleteRequirementAction] error:", err);
    return { error: message };
  }
}
