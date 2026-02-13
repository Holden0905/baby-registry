"use server";

import { revalidatePath } from "next/cache";
import { updateTaskAssignment } from "@/lib/data/tasks";

export async function assignTaskAction(taskId: string, userId: string | null) {
  await updateTaskAssignment(taskId, userId);
  revalidatePath("/tasks");
  revalidatePath("/users");
  revalidatePath("/sites");
}