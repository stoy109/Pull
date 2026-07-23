import "server-only";

import { requireRole as requireAccessRole } from "@/lib/auth/access";
import type { Role } from "@/lib/auth/roles";

export async function requireRole(allowed: Role | readonly Role[]) {
  const allowedRoles = typeof allowed === "string" ? [allowed] : allowed;
  return requireAccessRole(allowedRoles);
}
