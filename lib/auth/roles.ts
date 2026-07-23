export const APP_ROLES = ["admin", "umkm", "pekerja", "supplier"] as const;

export const ONBOARDING_ROLES = ["umkm", "pekerja", "supplier"] as const;

export type AppRole = (typeof APP_ROLES)[number];
export type OnboardingRole = (typeof ONBOARDING_ROLES)[number];

const ROLE_DASHBOARDS: Record<AppRole, string> = {
  admin: "/admin",
  umkm: "/dashboard",
  pekerja: "/worker/dashboard",
  supplier: "/supplier",
};

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrator",
  umkm: "UMKM",
  pekerja: "Pekerja",
  supplier: "Supplier",
};

export function parseAppRole(value: unknown): AppRole | null {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole)
    ? (value as AppRole)
    : null;
}

export function parseOnboardingRole(value: unknown): OnboardingRole | null {
  return typeof value === "string" && ONBOARDING_ROLES.includes(value as OnboardingRole)
    ? (value as OnboardingRole)
    : null;
}

export function dashboardPathForRole(role: AppRole) {
  return ROLE_DASHBOARDS[role];
}

export function roleLabel(role: AppRole) {
  return ROLE_LABELS[role];
}

export function isRoleAllowed(role: AppRole, allowedRoles: readonly AppRole[]) {
  return allowedRoles.includes(role);
}

export function resolveUserRole({
  appMetadataRole,
  hasProfile,
  profileRole,
  userMetadataRole,
}: {
  appMetadataRole: unknown;
  hasProfile: boolean;
  profileRole: unknown;
  userMetadataRole: unknown;
}): AppRole | null {
  const trustedAppRole = parseAppRole(appMetadataRole);

  // Supabase app_metadata cannot be changed by an ordinary user. It is the
  // emergency source of truth for provisioning the first Administrator.
  if (trustedAppRole === "admin") {
    return trustedAppRole;
  }

  const storedProfileRole = parseAppRole(profileRole);

  // Once the RBAC profile exists, never fall back to editable user_metadata.
  if (hasProfile) {
    return storedProfileRole;
  }

  if (trustedAppRole) {
    return trustedAppRole;
  }

  // Compatibility for an environment where the migration has not been
  // applied yet. Administrator is intentionally excluded from this fallback.
  return parseOnboardingRole(userMetadataRole);
}
