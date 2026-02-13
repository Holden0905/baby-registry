"use server";

import { revalidatePath } from "next/cache";
import { createUser } from "@/lib/data/users";

export async function createUserAction(input: {
  name: string;
  email: string;
  role: string;
  site_id?: string | null;
}): Promise<{ error?: string }> {
  try {
    await createUser(input);
    revalidatePath("/users");
    revalidatePath("/tasks");
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[createUserAction] error:", err);
    return { error: message };
  }
}
