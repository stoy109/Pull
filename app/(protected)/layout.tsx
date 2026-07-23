import { redirect } from "next/navigation";
import { isRole } from "@/lib/auth/roles";
import { RoleProvider } from "@/lib/auth/role-context";
import { createClient } from "@/lib/supabase/server";
import {
  getMvpSession,
  isMvpAuthEnabled,
} from "@/lib/auth/mvp-session";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (isMvpAuthEnabled()) {
    const session = await getMvpSession();
    if (!session) redirect("/");
    if (!session.role) redirect("/onboarding/pilih-peran");
    return <RoleProvider role={session.role}>{children}</RoleProvider>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const role = user.user_metadata?.role;
  if (!isRole(role)) redirect("/onboarding/pilih-peran");

  return <RoleProvider role={role}>{children}</RoleProvider>;
}
