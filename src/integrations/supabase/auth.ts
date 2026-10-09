import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface CurrentUserSession {
  user: {
    id: string;
    email?: string;
  };
  role: AppRole;
  isStaff: boolean;
  isAdmin: boolean;
}

/**
 * Sign in with email and password
 */
export async function signIn(
  supabase: SupabaseClient<Database>,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out current session
 */
export async function signOut(supabase: SupabaseClient<Database>) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current authenticated user, their role, and convenience flags
 */
export async function getCurrentUserRole(
  supabase: SupabaseClient<Database>
): Promise<CurrentUserSession | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (error) throw error;

  // Default to sales_rep if no specific elevated role found
  const role: AppRole = (roles?.[0]?.role as AppRole) ?? "sales_rep";
  const isAdmin = role === "admin";
  const isStaff = role === "admin" || role === "manager";

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    role,
    isAdmin,
    isStaff,
  };
}
