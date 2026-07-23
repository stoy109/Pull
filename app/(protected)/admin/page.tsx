import { Activity, Clock3, Filter, RadioTower, UserRoundCheck, UsersRound } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { getActiveUsersCount, getActivityStats, getRecentActivities } from "@/lib/activity/queries";

const ROLES = ["all", "umkm", "pekerja", "supplier", "admin"] as const;
const MONITORED_ROLES = ["umkm", "pekerja", "supplier", "admin"] as const;
const RANGES = ["24h", "7d", "30d"] as const;

type RoleFilter = (typeof ROLES)[number];

const ROLE_LABELS: Record<RoleFilter, string> = {
  all: "Semua role",
  umkm: "UMKM",
  pekerja: "Pekerja",
  supplier: "Supplier",
  admin: "Admin",
};

const ROLE_TONES: Record<string, string> = {
  umkm: "bg-[#e4f5ed] text-[#167a4e]",
  pekerja: "bg-[#e5eefb] text-[#28669c]",
  supplier: "bg-[#eee9fa] text-[#67549a]",
  admin: "bg-[#fff0d9] text-[#a05b14]",
};

function readOption<T extends readonly string[]>(value: string | string[] | undefined, options: T, fallback: T[number]) {
  return typeof value === "string" && options.includes(value) ? (value as T[number]) : fallback;
}

function formatDate(value: string | Date) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function roleTone(role: string) {
  return ROLE_TONES[role.toLowerCase()] ?? "bg-[#edf1f5] text-[#546579]";
}



function actionLabel(action: string) {
  return action.replaceAll(".", " · ");
}

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const role = readOption(params.role, ROLES, "all");
  const range = readOption(params.range, RANGES, "24h");

  const [activeUsers, stats, latestActivities, recentActivities] = await Promise.all([
    getActiveUsersCount(),
    getActivityStats(),
    getRecentActivities({ limit: 5 }),
    getRecentActivities({ limit: 100, role: role === "all" ? null : role, range }),
  ]);
  const roleStats = MONITORED_ROLES.map((roleName) => ({
    role: roleName,
    count: stats.byRole[roleName],
  }));
  const maxRoleCount = Math.max(1, ...roleStats.map((item) => item.count));

  return (
    <>
      <section id="monitoring" className="grid gap-4 xl:grid-cols-12">
        <article className="relative overflow-hidden rounded-[22px] bg-[#0f2338] p-6 text-white shadow-[0_16px_35px_rgba(11,23,41,.13)] xl:col-span-3">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[20px] border-[#42d7e8]/10" />
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#193a53] text-[#72e5f2]"><UsersRound className="h-5 w-5" /></span>
          <p className="mt-7 text-xs font-bold text-white/55">Pengguna aktif · 24 jam</p>
          <strong className="mt-2 block font-[family-name:var(--font-worker-display)] text-[42px] font-semibold leading-none tracking-[-0.06em]">{new Intl.NumberFormat("id-ID").format(activeUsers)}</strong>
          <p className="mt-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#73d9e5]"><RadioTower className="h-3.5 w-3.5" /> Aktivitas terverifikasi</p>
        </article>

        <article className="rounded-[22px] border border-[#dbe4ed] bg-white p-6 shadow-[0_10px_28px_rgba(27,53,79,.04)] xl:col-span-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e5f6ef] text-[#17815a]"><Activity className="h-5 w-5" /></span>
          <p className="mt-7 text-xs font-bold text-[#64768a]">Aktivitas hari ini</p>
          <strong className="mt-2 block font-[family-name:var(--font-worker-display)] text-[42px] font-semibold leading-none tracking-[-0.06em] text-[#0e2135]">{new Intl.NumberFormat("id-ID").format(stats.totalToday)}</strong>
          <p className="mt-4 text-[10px] font-semibold text-[#8a99a8]">Sejak pukul 00.00 WIB</p>
        </article>

        <article className="rounded-[22px] border border-[#dbe4ed] bg-white p-5 shadow-[0_10px_28px_rgba(27,53,79,.04)] sm:p-6 xl:col-span-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.17em] text-[#16849a]">Latest signal</p>
              <h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em] text-[#0e2135]">5 aktivitas terakhir</h2>
            </div>
            <Clock3 className="h-5 w-5 text-[#8fa0b1]" />
          </div>
          {latestActivities.length ? (
            <ol className="mt-4 divide-y divide-[#edf1f5]">
              {latestActivities.map((activity) => (
                <li key={activity.id} className="grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-[#22a6bc]" />
                  <p className="truncate text-xs font-bold text-[#31475e]"><span className="text-[#6b7d90]">{activity.actorName}</span> · {actionLabel(activity.action)}</p>
                  <time className="font-mono text-[9px] text-[#8999a9]">{formatDate(activity.createdAt)}</time>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-4 rounded-xl bg-[#f4f7fa] px-4 py-7 text-center text-xs font-semibold text-[#718295]">Belum ada aktivitas yang tercatat.</div>
          )}
        </article>

        <article id="pengguna" className="rounded-[22px] border border-[#dbe4ed] bg-white p-5 shadow-[0_10px_28px_rgba(27,53,79,.04)] sm:p-6 xl:col-span-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.17em] text-[#16849a]">Role telemetry</p>
              <h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em] text-[#0e2135]">Distribusi aktivitas per role</h2>
            </div>
            <p className="text-[10px] font-semibold text-[#8191a1]">Jumlah aktivitas pada periode statistik</p>
          </div>

          {roleStats.some((item) => item.count > 0) ? (
            <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
              {roleStats.map((item) => (
                <div key={item.role}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <span className="font-extrabold text-[#344a60]">{ROLE_LABELS[item.role]}</span>
                    <span className="font-mono text-[10px] font-bold text-[#64768a]">{new Intl.NumberFormat("id-ID").format(item.count)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2f6]" role="img" aria-label={`${item.role}: ${item.count} aktivitas`}>
                    <div className="h-full min-w-1 rounded-full bg-[linear-gradient(90deg,#1a8398,#45cad8)]" style={{ width: `${(item.count / maxRoleCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-[#f4f7fa] px-4 py-8 text-center text-xs font-semibold text-[#718295]">Distribusi role belum tersedia.</div>
          )}
        </article>
      </section>

      <section id="aktivitas" className="mt-5 overflow-hidden rounded-[22px] border border-[#d8e2eb] bg-white shadow-[0_12px_32px_rgba(27,53,79,.05)]">
        <header className="flex flex-col gap-5 border-b border-[#e5ebf0] px-5 py-5 sm:px-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.17em] text-[#16849a]">Audit stream</p>
            <h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em] text-[#0e2135]">Aktivitas terbaru</h2>
            <p className="mt-1.5 text-xs font-medium text-[#7a8b9c]">Filter diterapkan langsung pada pengambilan data.</p>
          </div>

          <form action="/admin" method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="grid gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#66798c]">
              Role
              <select name="role" defaultValue={role} className="h-10 min-w-40 rounded-xl border border-[#cfdae4] bg-white px-3 pr-8 text-xs font-bold normal-case tracking-normal text-[#2f465d] outline-none focus:border-[#2694a8] focus:ring-2 focus:ring-[#2694a8]/15">
                {ROLES.map((option) => <option key={option} value={option}>{ROLE_LABELS[option]}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#66798c]">
              Rentang waktu
              <select name="range" defaultValue={range} className="h-10 min-w-32 rounded-xl border border-[#cfdae4] bg-white px-3 pr-8 text-xs font-bold normal-case tracking-normal text-[#2f465d] outline-none focus:border-[#2694a8] focus:ring-2 focus:ring-[#2694a8]/15">
                <option value="24h">24 jam</option>
                <option value="7d">7 hari</option>
                <option value="30d">30 hari</option>
              </select>
            </label>
            <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#12314b] px-4 text-xs font-extrabold text-white transition hover:bg-[#19415f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168fa5]"><Filter className="h-3.5 w-3.5" /> Terapkan</button>
          </form>
        </header>

        {recentActivities.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead><tr className="bg-[#f7f9fb] font-mono text-[9px] uppercase tracking-[0.12em] text-[#758698]"><th className="px-6 py-4">Waktu</th><th className="px-4 py-4">Pengguna</th><th className="px-4 py-4">Role</th><th className="px-4 py-4">Aktivitas</th><th className="px-6 py-4">Detail</th></tr></thead>
              <tbody className="divide-y divide-[#edf1f4]">
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="transition-colors hover:bg-[#f9fbfc]">
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-[10px] font-semibold text-[#718295]">{formatDate(activity.createdAt)}</td>
                    <td className="px-4 py-4 text-xs font-extrabold text-[#2d445a]">{activity.actorName}</td>
                    <td className="px-4 py-4"><span className={`inline-flex rounded-lg px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] ${roleTone(activity.actorRole)}`}>{activity.actorRole}</span></td>
                    <td className="px-4 py-4 text-xs font-bold text-[#3f566c]">{actionLabel(activity.action)}</td>
                    <td className="max-w-md px-6 py-4 text-xs font-medium leading-5 text-[#718295]">{activity.detail || "Tidak ada detail tambahan"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf1f5] text-[#3b7182]"><UserRoundCheck className="h-6 w-6" /></span>
              <h3 className="mt-4 text-sm font-extrabold text-[#20384e]">Tidak ada aktivitas untuk filter ini</h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-[#78899a]">Pilih role atau rentang waktu lain untuk melihat rekaman aktivitas.</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
