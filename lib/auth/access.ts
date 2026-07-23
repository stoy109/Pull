import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

import {
  dashboardPathForRole,
  isRoleAllowed,
  resolveUserRole,
  type AppRole,
} from "@/lib/auth/roles";

export type AccountStatus = "active" | "suspended";

type ProfileAccessRow = {
  account_status: string | null;
  role: string | null;
};

export type CurrentAccess = {
  accountStatus: AccountStatus;
  role: AppRole | null;
  user: User;
};

function parseAccountStatus(value: unknown): AccountStatus {
  return value === "suspended" ? "suspended" : "active";
}

export const getCurrentAccess = cache(async (): Promise<CurrentAccess | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const profileResult = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .maybeSingle<ProfileAccessRow>();

  if (profileResult.error) {
    throw new Error("Profil akses belum dapat diverifikasi.");
  }

  const profile = profileResult.data;

  return {
    accountStatus: parseAccountStatus(profile?.account_status),
    role: resolveUserRole({
      appMetadataRole: user.app_metadata?.role,
      hasProfile: Boolean(profile),
      profileRole: profile?.role,
      userMetadataRole: user.user_metadata?.role,
    }),
    user,
  };
});

export async function requireUser() {
  const access = await getCurrentAccess();

  if (!access) {
    redirect("/");
  }

  if (access.accountStatus === "suspended") {
    redirect("/account-suspended");
  }

  return access;
}

export async function requireRole(allowedRoles: readonly AppRole[]) {
  const access = await requireUser();

  if (!access.role) {
    redirect("/onboarding");
  }

  if (!isRoleAllowed(access.role, allowedRoles)) {
    const [requiredRole] = allowedRoles;

    if (requiredRole) {
      const supabase = await createClient();
      await supabase.rpc("record_access_denied", {
        required_role: requiredRole,
      });
    }

    redirect(dashboardPathForRole(access.role));
  }

  return { ...access, role: access.role };
}

export async function redirectToRoleDashboard(): Promise<never> {
  const access = await requireUser();

  if (!access.role) {
    redirect("/onboarding");
  }

  redirect(dashboardPathForRole(access.role));
}
