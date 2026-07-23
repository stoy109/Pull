import "server-only";

import { parseAppRole, type AppRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type AdminUserFilters = {
  query: string;
  role: AppRole | null;
  status: "active" | "suspended" | null;
  page: number;
};

export type AdminUserRow = {
  id: string;
  email: string;
  displayName: string | null;
  businessName: string | null;
  role: AppRole | null;
  accountStatus: "active" | "suspended";
  lastActiveAt: string | null;
  activitiesToday: number;
  createdAt: string;
};

export type AdminUsersData = {
  total: number;
  page: number;
  pageSize: number;
  users: AdminUserRow[];
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function asCount(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

export function normalizeAdminUserFilters(input: {
  q?: string | string[];
  role?: string | string[];
  status?: string | string[];
  page?: string | string[];
}): AdminUserFilters {
  const readFirst = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;
  const status = readFirst(input.status);
  const parsedPage = Number.parseInt(readFirst(input.page) ?? "1", 10);

  return {
    query: (readFirst(input.q) ?? "").trim().slice(0, 80),
    role: parseAppRole(readFirst(input.role)),
    status: status === "active" || status === "suspended" ? status : null,
    page: Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), 999) : 1,
  };
}

export async function getAdminUsers(filters: AdminUserFilters): Promise<AdminUsersData> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_users", {
    search_query: filters.query || null,
    role_filter: filters.role,
    status_filter: filters.status,
    page_number: filters.page,
    page_size: 10,
    app_timezone: "Asia/Jakarta",
  });

  if (error) {
    console.error("Unable to load administrator users", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Daftar pengguna belum dapat dimuat.");
  }

  const root = asRecord(data);
  const users = Array.isArray(root.users) ? root.users : [];

  return {
    total: asCount(root.total),
    page: Math.max(asCount(root.page), 1),
    pageSize: Math.max(asCount(root.page_size), 1),
    users: users.map((value) => {
      const user = asRecord(value);
      return {
        id: asString(user.id),
        email: asString(user.email, "Email tidak tersedia"),
        displayName: asNullableString(user.display_name),
        businessName: asNullableString(user.business_name),
        role: parseAppRole(user.role),
        accountStatus: user.account_status === "suspended" ? "suspended" : "active",
        lastActiveAt: asNullableString(user.last_active_at),
        activitiesToday: asCount(user.activities_today),
        createdAt: asString(user.created_at, new Date(0).toISOString()),
      };
    }),
  };
}
