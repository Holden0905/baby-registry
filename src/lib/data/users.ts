import type { User } from "@/types/database";
import { createServerSupabase } from "@/lib/supabase/server";

export async function getUsers(siteId?: string): Promise<User[]> {
  const supabase = createServerSupabase();
  let query = supabase
    .from("users")
    .select("id, name, email, role, site_id, is_active, created_at")
    .eq("is_active", true)
    .order("name");

  if (siteId) {
    query = query.eq("site_id", siteId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as User[];
}

export async function createUser(input: {
  name: string;
  email: string;
  role: string;
  site_id?: string | null;
}) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("users")
    .insert({
      name: input.name,
      email: input.email,
      role: input.role,
      site_id: input.site_id ?? null,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as User;
}
