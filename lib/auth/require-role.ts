import "server-only";

import { redirect } from "next/navigation";
import { isRole, type Role } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  getMvpSession,
  isMvpAuthEnabled,
  mvpSessionToUser,
} from "@/lib/auth/mvp-session";

export async function requireRole(allowed: Role | readonly Role[]) {
  const allowedRoles = typeof allowed === "string" ? [allowed] : allowed;

  if (isMvpAuthEnabled()) {
    const session = await getMvpSession();
    if (!session) redirect("/");
    if (!session.role || !allowedRoles.includes(session.role)) redirect("/unauthorized");
    return { user: mvpSessionToUser(session), role: session.role };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const role = user.user_metadata?.role;
  if (!isRole(role)) redirect("/unauthorized");

  if (role === "admin") {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (error || profile?.is_admin !== true) redirect("/unauthorized");
  }

  if (!allowedRoles.includes(role)) redirect("/unauthorized");

  return { user, role };
}
