import type { Site } from "@/types/database";
import { createServerSupabase } from "@/lib/supabase/server";

export async function getSites(): Promise<Pick<Site, "id" | "name" | "client_name" | "is_active">[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("sites")
    .select("id, name, client_name, is_active")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as Pick<Site, "id" | "name" | "client_name" | "is_active">[];
}

export async function getSiteById(siteId: string): Promise<Site | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .single();
  if (error) throw error;
  return data as Site | null;
}
