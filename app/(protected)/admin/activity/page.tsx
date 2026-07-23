import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Search,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  getAdminActivity,
  normalizeAdminActivityFilters,
} from "@/features/admin/data/get-admin-activity";
import { activityEventLabel } from "@/lib/activity/events";
import { APP_ROLES, roleLabel } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/access";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const CATEGORY_LABELS: Record<string, string> = {
  authentication: "Autentikasi",
  account: "Akun",
  recruitment: "Rekrutmen",
  pool: "Pool",
  supplier: "Supplier",
  system: "Sistem",
};

const STATUS_STYLES = {
  success: "bg-[#e8f6ee] text-[#087447]",
  failed: "bg-[#fff0f0] text-[#b33e48]",
  denied: "bg-[#fff2df] text-[#a66013]",
} as const;

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : `${dateTimeFormatter.format(date)} WIB`;
}

export default async function AdminActivityPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    range?: string | string[];
    role?: string | string[];
    status?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
}>) {
  const [, rawFilters] = await Promise.all([
    requireRole(["admin"]),
    searchParams,
  ]);
  const filters = normalizeAdminActivityFilters(rawFilters);
  const data = await getAdminActivity(filters);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (filters.days === 30) params.set("range", "30");
    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);
    if (filters.query) params.set("q", filters.query);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/admin/activity?${query}` : "/admin/activity";
  }

  const summaryCards = [
    { label: "Total event", value: data.total, icon: Activity, tone: "text-[#315f9a] bg-[#eaf1fb]" },
    { label: "Berhasil", value: data.successCount, icon: CheckCircle2, tone: "text-[#087447] bg-[#e8f6ee]" },
    { label: "Gagal/ditolak", value: data.attentionCount, icon: ShieldAlert, tone: "text-[#a66013] bg-[#fff2df]" },
    { label: "Aktor unik", value: data.uniqueActors, icon: UsersRound, tone: "text-[#684b96] bg-[#f0ebf8]" },
  ] as const;

  return (
    <AdminShell activePath="/admin/activity">
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#42806a]">Audit trail</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em]">Log aktivitas platform</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#687a73]">
              Telusuri event keamanan dan aktivitas pengguna berdasarkan periode, role, hasil, atau aktor.
            </p>
          </div>
          <Link href="/admin/users" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#cddbd4] bg-white px-4 text-xs font-extrabold text-[#315b4c]">
            <UsersRound className="h-4 w-4" /> Kelola pengguna
          </Link>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ label, value, icon: Icon, tone }) => (
            <article key={label} className="rounded-[20px] border border-[#dce6e0] bg-white p-5">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-4.5 w-4.5" /></span>
              <p className="mt-4 text-xs font-bold text-[#718079]">{label}</p>
              <p className="mt-1 text-3xl font-extrabold">{value}</p>
            </article>
          ))}
        </section>

        <form method="get" className="mt-5 grid gap-3 rounded-[20px] border border-[#dce6e0] bg-white p-4 lg:grid-cols-[1.4fr_.8fr_.8fr_.8fr_auto] lg:items-end">
          <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
            Aktor atau event
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789087]" />
              <input name="q" defaultValue={filters.query} placeholder="Cari log..." className="h-11 w-full rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] pl-10 pr-3 text-xs font-bold normal-case tracking-normal outline-none focus:border-[#25875c]" />
            </span>
          </label>
          <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
            Periode
            <select name="range" defaultValue={String(filters.days)} className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal outline-none">
              <option value="7">7 hari</option><option value="30">30 hari</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
            Role
            <select name="role" defaultValue={filters.role ?? ""} className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal outline-none">
              <option value="">Semua role</option>{APP_ROLES.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
            Hasil
            <select name="status" defaultValue={filters.status ?? ""} className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal outline-none">
              <option value="">Semua hasil</option><option value="success">Berhasil</option><option value="failed">Gagal</option><option value="denied">Ditolak</option>
            </select>
          </label>
          <button type="submit" className="h-11 rounded-xl bg-[#0b7449] px-5 text-xs font-extrabold text-white">Terapkan</button>
        </form>

        <section className="mt-5 overflow-hidden rounded-[22px] border border-[#dce6e0] bg-white shadow-[0_8px_24px_rgba(23,58,44,.04)]">
          {data.activities.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead className="bg-[#f3f7f5] text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#6d8078]">
                  <tr><th className="px-5 py-4">Waktu</th><th className="px-4 py-4">Aktor</th><th className="px-4 py-4">Aktivitas</th><th className="px-4 py-4">Target</th><th className="px-4 py-4">Kategori</th><th className="px-5 py-4">Hasil</th></tr>
                </thead>
                <tbody className="divide-y divide-[#e7ede9]">
                  {data.activities.map((activity) => (
                    <tr key={activity.id} className="text-xs text-[#273f36]">
                      <td className="whitespace-nowrap px-5 py-4 text-[10px] font-bold text-[#63766e]">{formatDateTime(activity.createdAt)}</td>
                      <td className="px-4 py-4"><p className="max-w-44 truncate font-extrabold">{activity.actorName}</p><p className="mt-1 max-w-44 truncate text-[9px] font-semibold text-[#819089]">{activity.actorRole ? roleLabel(activity.actorRole) : "Tanpa role"}</p></td>
                      <td className="px-4 py-4"><p className="font-extrabold">{activityEventLabel(activity.eventType)}</p><p className="mt-1 max-w-72 text-[9px] font-semibold leading-4 text-[#70827a]">{activity.description}</p></td>
                      <td className="px-4 py-4 text-[10px] font-bold text-[#61746c]">{activity.targetType ? `${activity.targetType}${activity.targetId ? ` · ${activity.targetId.slice(0, 12)}` : ""}` : "-"}</td>
                      <td className="px-4 py-4"><span className="rounded-lg bg-[#edf4f0] px-2.5 py-1 text-[9px] font-extrabold text-[#3d6958]">{CATEGORY_LABELS[activity.category] ?? activity.category}</span></td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded-lg px-2.5 py-1 text-[9px] font-extrabold ${STATUS_STYLES[activity.status]}`}>{activity.status === "success" ? "Berhasil" : activity.status === "failed" ? "Gagal" : "Ditolak"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center"><Activity className="mx-auto h-8 w-8 text-[#6d8b7f]" /><h2 className="mt-4 text-sm font-extrabold">Log tidak ditemukan</h2><p className="mt-2 text-xs font-medium text-[#7a8a83]">Ubah filter atau lakukan aktivitas baru pada aplikasi.</p></div>
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
