import Link from "next/link";
import {
  Activity,
  Search,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { UserStatusAction } from "@/features/admin/components/user-status-action";
import {
  getAdminUsers,
  normalizeAdminUserFilters,
} from "@/features/admin/data/get-admin-users";
import { APP_ROLES, roleLabel } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/access";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return "Belum aktif";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Belum aktif" : `${dateTimeFormatter.format(date)} WIB`;
}

function isRecentlyActive(value: string | null) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && Date.now() - timestamp <= 15 * 60 * 1000;
}

export default async function AdminUsersPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    q?: string | string[];
    role?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
}>) {
  const [{ user }, rawFilters] = await Promise.all([
    requireRole(["admin"]),
    searchParams,
  ]);
  const filters = normalizeAdminUserFilters(rawFilters);
  const data = await getAdminUsers(filters);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/admin/users?${query}` : "/admin/users";
  }

  return (
    <AdminShell activePath="/admin/users">
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#42806a]">Manajemen pengguna</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em]">Akun dan akses platform</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#687a73]">
              Cari pengguna, periksa role dan aktivitas terakhir, lalu lakukan moderasi akun secara tercatat.
            </p>
          </div>
          <Link href="/admin/activity" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#cddbd4] bg-white px-4 text-xs font-extrabold text-[#315b4c]">
            <Activity className="h-4 w-4" /> Buka log aktivitas
          </Link>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[20px] border border-[#dce6e0] bg-white p-5">
            <UsersRound className="h-5 w-5 text-[#087447]" />
            <p className="mt-4 text-xs font-bold text-[#718079]">Hasil filter</p>
            <p className="mt-1 text-3xl font-extrabold">{data.total}</p>
          </div>
          <div className="rounded-[20px] border border-[#dce6e0] bg-white p-5">
            <UserRoundCheck className="h-5 w-5 text-[#315f9a]" />
            <p className="mt-4 text-xs font-bold text-[#718079]">Aktif sekarang di halaman ini</p>
            <p className="mt-1 text-3xl font-extrabold">{data.users.filter((item) => isRecentlyActive(item.lastActiveAt)).length}</p>
          </div>
          <div className="rounded-[20px] border border-[#dce6e0] bg-white p-5">
            <ShieldCheck className="h-5 w-5 text-[#7654a1]" />
            <p className="mt-4 text-xs font-bold text-[#718079]">Role terfilter</p>
            <p className="mt-2 text-lg font-extrabold">{filters.role ? roleLabel(filters.role) : "Semua role"}</p>
          </div>
        </section>

        <form method="get" className="mt-5 grid gap-3 rounded-[20px] border border-[#dce6e0] bg-white p-4 md:grid-cols-[minmax(220px,1.5fr)_1fr_1fr_auto] md:items-end">
          <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
            Nama atau email
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789087]" />
              <input name="q" defaultValue={filters.query} placeholder="Cari pengguna..." className="h-11 w-full rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] pl-10 pr-3 text-xs font-bold normal-case tracking-normal outline-none focus:border-[#25875c]" />
            </span>
          </label>
          <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
            Role
            <select name="role" defaultValue={filters.role ?? ""} className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal outline-none focus:border-[#25875c]">
              <option value="">Semua role</option>
              {APP_ROLES.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
            Status akun
            <select name="status" defaultValue={filters.status ?? ""} className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal outline-none focus:border-[#25875c]">
              <option value="">Semua status</option>
              <option value="active">Aktif</option>
              <option value="suspended">Ditangguhkan</option>
            </select>
          </label>
          <button type="submit" className="h-11 rounded-xl bg-[#0b7449] px-5 text-xs font-extrabold text-white">Terapkan</button>
        </form>

        <section className="mt-5 overflow-hidden rounded-[22px] border border-[#dce6e0] bg-white shadow-[0_8px_24px_rgba(23,58,44,.04)]">
          {data.users.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead className="bg-[#f3f7f5] text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#6d8078]">
                  <tr>
                    <th className="px-5 py-4">Pengguna</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Aktif terakhir</th>
                    <th className="px-4 py-4">Aktivitas hari ini</th>
                    <th className="px-4 py-4">Bergabung</th>
                    <th className="px-5 py-4 text-right">Moderasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ede9]">
                  {data.users.map((account) => {
                    const displayName = account.displayName ?? account.businessName ?? "Pengguna Pull";
                    const online = isRecentlyActive(account.lastActiveAt);
                    return (
                      <tr key={account.id} className="text-xs text-[#273f36]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eaf4ef] text-[11px] font-black text-[#256248]">{displayName.slice(0, 2).toUpperCase()}</span>
                            <div className="min-w-0">
                              <p className="max-w-56 truncate font-extrabold">{displayName}</p>
                              <p className="mt-1 max-w-56 truncate text-[9px] font-semibold text-[#809089]">{account.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-extrabold">{account.role ? roleLabel(account.role) : "Belum dipilih"}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-lg px-2.5 py-1 text-[9px] font-extrabold ${account.accountStatus === "active" ? "bg-[#e8f6ee] text-[#087447]" : "bg-[#fff0f0] text-[#b33e48]"}`}>
                            {account.accountStatus === "active" ? "Aktif" : "Ditangguhkan"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold">{online ? "Online" : formatDateTime(account.lastActiveAt)}</p>
                          {online ? <p className="mt-1 text-[9px] font-bold text-[#0b8a50]">15 menit terakhir</p> : null}
                        </td>
                        <td className="px-4 py-4 font-extrabold">{account.activitiesToday}</td>
                        <td className="px-4 py-4 font-bold text-[#62746d]">{formatDate(account.createdAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <UserStatusAction userId={account.id} currentStatus={account.accountStatus} disabled={account.id === user.id || account.role === "admin"} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <UsersRound className="mx-auto h-8 w-8 text-[#6d8b7f]" />
              <h2 className="mt-4 text-sm font-extrabold">Pengguna tidak ditemukan</h2>
              <p className="mt-2 text-xs font-medium text-[#7a8a83]">Ubah kata kunci atau filter yang digunakan.</p>
            </div>
          )}
        </section>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-[#73847d]">Halaman {Math.min(data.page, totalPages)} dari {totalPages}</p>
          <div className="flex gap-2">
            <Link aria-disabled={data.page <= 1} href={pageHref(Math.max(1, data.page - 1))} className={`inline-flex h-9 items-center rounded-xl border border-[#d2dfd8] bg-white px-4 text-[10px] font-extrabold text-[#315b4c] ${data.page <= 1 ? "pointer-events-none opacity-40" : ""}`}>Sebelumnya</Link>
            <Link aria-disabled={data.page >= totalPages} href={pageHref(Math.min(totalPages, data.page + 1))} className={`inline-flex h-9 items-center rounded-xl border border-[#d2dfd8] bg-white px-4 text-[10px] font-extrabold text-[#315b4c] ${data.page >= totalPages ? "pointer-events-none opacity-40" : ""}`}>Berikutnya</Link>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}
