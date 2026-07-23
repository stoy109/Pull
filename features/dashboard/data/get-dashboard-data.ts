import { requireRole } from "@/lib/auth/access";
import type { AppRole } from "@/lib/auth/roles";

export async function getDashboardData(allowedRoles: readonly AppRole[]) {
  const access = await requireRole(allowedRoles);

  return { role: access.role, user: access.user };
}
