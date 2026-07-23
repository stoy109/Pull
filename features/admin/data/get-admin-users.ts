import "server-only";

import { isMvpAuthEnabled } from "@/lib/auth/mvp-session";
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
  if (isMvpAuthEnabled()) {
    const now = Date.now();
    const demoUsers: AdminUserRow[] = [
      { id: "00000000-0000-4000-8000-000000000001", email: "admin@pull.demo", displayName: "Admin Pull", businessName: null, role: "admin", accountStatus: "active", lastActiveAt: new Date(now - 2 * 60_000).toISOString(), activitiesToday: 2, createdAt: new Date(now - 120 * 86_400_000).toISOString() },
      { id: "00000000-0000-4000-8000-000000000002", email: "dapur@pull.demo", displayName: "Sari Wulandari", businessName: "Dapur Sari", role: "umkm", accountStatus: "active", lastActiveAt: new Date(now - 8 * 60_000).toISOString(), activitiesToday: 1, createdAt: new Date(now - 90 * 86_400_000).toISOString() },
      { id: "00000000-0000-4000-8000-000000000003", email: "batik@pull.demo", displayName: "Ayu Lestari", businessName: "Batik Laweyan", role: "umkm", accountStatus: "active", lastActiveAt: new Date(now - 65 * 60_000).toISOString(), activitiesToday: 1, createdAt: new Date(now - 75 * 86_400_000).toISOString() },
      { id: "00000000-0000-4000-8000-000000000004", email: "dimas@pull.demo", displayName: "Dimas Pratama", businessName: null, role: "pekerja", accountStatus: "active", lastActiveAt: new Date(now - 18 * 60_000).toISOString(), activitiesToday: 1, createdAt: new Date(now - 40 * 86_400_000).toISOString() },
      { id: "00000000-0000-4000-8000-000000000005", email: "rina@pull.demo", displayName: "Rina Puspita", businessName: null, role: "pekerja", accountStatus: "active", lastActiveAt: new Date(now - 95 * 60_000).toISOString(), activitiesToday: 1, createdAt: new Date(now - 32 * 86_400_000).toISOString() },
      { id: "00000000-0000-4000-8000-000000000006", email: "solo-supply@pull.demo", displayName: "Budi Santoso", businessName: "Solo Supply", role: "supplier", accountStatus: "active", lastActiveAt: new Date(now - 27 * 60_000).toISOString(), activitiesToday: 1, createdAt: new Date(now - 60 * 86_400_000).toISOString() },
      { id: "00000000-0000-4000-8000-000000000007", email: "mitra-bahan@pull.demo", displayName: "Nina Kartika", businessName: "Mitra Bahan Solo", role: "supplier", accountStatus: "active", lastActiveAt: new Date(now - 210 * 60_000).toISOString(), activitiesToday: 1, createdAt: new Date(now - 28 * 86_400_000).toISOString() },
      { id: "00000000-0000-4000-8000-000000000008", email: "review@pull.demo", displayName: "Akun Review", businessName: "UMKM Review", role: "umkm", accountStatus: "suspended", lastActiveAt: new Date(now - 14 * 86_400_000).toISOString(), activitiesToday: 0, createdAt: new Date(now - 20 * 86_400_000).toISOString() },
    ];
    const query = filters.query.toLowerCase();
    const filtered = demoUsers.filter((user) =>
      (!filters.role || user.role === filters.role) &&
      (!filters.status || user.accountStatus === filters.status) &&
      (!query || [user.email, user.displayName, user.businessName]
        .some((value) => value?.toLowerCase().includes(query)))
    );
    const pageSize = 10;
    const offset = (filters.page - 1) * pageSize;

    return {
      total: filtered.length,
      page: filters.page,
      pageSize,
      users: filtered.slice(offset, offset + pageSize),
    };
  }

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
