export const ROLES = ["umkm", "pekerja", "supplier", "admin"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.some((role) => role === value);
}
