import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { RefreshButton } from "@/features/admin/components/refresh-button";
import { activityEventLabel } from "@/lib/activity/events";
import type { MonitoringData, MonitoringFilters } from "@/lib/activity/monitoring";
import { APP_ROLES, roleLabel, type AppRole } from "@/lib/auth/roles";

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "#315f9a",
  umkm: "#0d8a52",
  pekerja: "#d88827",
  supplier: "#7759a6",
};

const ROLE_SURFACES: Record<AppRole, string> = {
  admin: "bg-[#eaf1fb] text-[#315f9a]",
  umkm: "bg-[#e8f6ee] text-[#087447]",
  pekerja: "bg-[#fff2df] text-[#a66013]",
  supplier: "bg-[#f0ebf8] text-[#684b96]",
};

const STATUS_STYLES = {
  success: {
    label: "Berhasil",
    classes: "bg-[#e8f6ee] text-[#087447]",
    icon: CheckCircle2,
  },
  failed: {
    label: "Gagal",
    classes: "bg-[#fff0f0] text-[#b93b45]",
    icon: AlertTriangle,
  },
  denied: {
    label: "Ditolak",
    classes: "bg-[#fff2df] text-[#a66013]",
    icon: ShieldAlert,
  },
} as const;

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

const trendDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Waktu tidak tersedia" : dateTimeFormatter.format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--:--" : timeFormatter.format(date);
}

function formatTrendDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? value : trendDateFormatter.format(date);
}

export function AdminMonitoringPage({
  data,
  filters,
}: Readonly<{
  data: MonitoringData;
  filters: MonitoringFilters;
}>) {
  const selectedRoleLabel = filters.role ? roleLabel(filters.role) : "Semua role";
  const maxTrend = Math.max(1, ...data.trend.map((point) => point.count));
  const maxRoleActivity = Math.max(
    1,
    ...APP_ROLES.map((role) => data.activityDistribution[role]),
  );
  const totalRoleActivity = APP_ROLES.reduce(
    (total, role) => total + data.activityDistribution[role],
    0,
  );

  const metricCards = [
    {
      label: "Pengguna aktif",
      value: data.metrics.activeUsers,
      detail: "Aktif dalam 15 menit terakhir",
      icon: UserRoundCheck,
      tone: "bg-[#e6f6ed] text-[#087447]",
    },
    {
      label: "Aktivitas hari ini",
      value: data.metrics.activitiesToday,
      detail: "Sejak 00.00 WIB",
      icon: Activity,
      tone: "bg-[#eaf1fb] text-[#315f9a]",
    },
    {
      label: "Total pengguna",
      value: data.metrics.totalUsers,
      detail: selectedRoleLabel,
      icon: UsersRound,
      tone: "bg-[#f0ebf8] text-[#684b96]",
    },
    {
      label: "Perlu perhatian",
      value: data.metrics.attention,
      detail: "Akses gagal/ditolak dan akun ditangguhkan",
      icon: ShieldAlert,
      tone: "bg-[#fff2df] text-[#a66013]",
    },
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe3d7] bg-[#eaf6ee] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#087447]">
            <span className="h-2 w-2 rounded-full bg-[#16a060] shadow-[0_0_0_4px_rgba(22,160,96,.12)]" />
            Data aktivitas terbaru
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
            Ringkasan aktivitas platform
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#62746d]">
            Pantau pengguna aktif, jejak aktivitas, dan distribusi peran dari event yang dicatat sistem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-[#dce6e0] bg-white px-4 py-2.5">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7a8b84]">
              Terakhir diperbarui
            </p>
            <p className="mt-1 text-xs font-extrabold text-[#28493e]">
              {formatDateTime(data.generatedAt)} WIB
            </p>
          </div>
          <RefreshButton />
        </div>
      </section>

      <form
        method="get"
        className="mt-7 grid gap-3 rounded-[20px] border border-[#dce6e0] bg-white p-4 shadow-[0_8px_24px_rgba(23,58,44,.04)] sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
          Periode aktivitas
          <select
            name="range"
            defaultValue={String(filters.days)}
            className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal text-[#203c32] outline-none focus:border-[#25875c]"
          >
            <option value="7">7 hari terakhir</option>
            <option value="30">30 hari terakhir</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
          Role aktor
          <select
            name="role"
            defaultValue={filters.role ?? ""}
            className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal text-[#203c32] outline-none focus:border-[#25875c]"
          >
            <option value="">Semua role</option>
            {APP_ROLES.map((role) => (
              <option key={role} value={role}>{roleLabel(role)}</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b7449] px-5 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(11,116,73,.17)] transition hover:bg-[#096740]"
        >
          Terapkan filter <ArrowUpRight className="h-4 w-4" />
        </button>
      </form>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Metrik monitoring">
        {metricCards.map(({ label, value, detail, icon: Icon, tone }) => (
          <article
            key={label}
            className="rounded-[20px] border border-[#dce6e0] bg-white p-5 shadow-[0_8px_24px_rgba(23,58,44,.04)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#6b7b75]">{label}</p>
                <p className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">{value.toLocaleString("id-ID")}</p>
              </div>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 min-h-8 text-[10px] font-semibold leading-4 text-[#8a9893]">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.8fr)]">
        <article className="rounded-[22px] border border-[#dce6e0] bg-white p-5 shadow-[0_8px_24px_rgba(23,58,44,.04)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#42806a]">Tren aktivitas</p>
              <h2 className="mt-1 text-lg font-extrabold">{filters.days} hari terakhir</h2>
            </div>
            <span className="rounded-lg bg-[#edf5f1] px-3 py-1.5 text-[10px] font-extrabold text-[#3f6c5b]">
              {selectedRoleLabel}
            </span>
          </div>

          <div className="mt-7 flex h-56 items-end gap-1.5 border-b border-[#dfe8e3] sm:gap-2" aria-label="Grafik tren aktivitas">
            {data.trend.map((point, index) => {
              const height = point.count === 0 ? 3 : Math.max(12, (point.count / maxTrend) * 100);
              const shouldShowLabel = data.trend.length <= 7 || index % 5 === 0 || index === data.trend.length - 1;

              return (
                <div key={point.date} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
                  <div className="relative flex flex-1 items-end">
                    <span className="pointer-events-none absolute bottom-[calc(var(--bar-height)+8px)] left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#153d30] px-2 py-1 text-[9px] font-bold text-white group-hover:block">
                      {point.count} aktivitas
                    </span>
                    <div
                      className="w-full rounded-t-md bg-[linear-gradient(180deg,#25a567_0%,#0d774a_100%)] opacity-90 transition group-hover:opacity-100"
                      style={{
                        height: `${height}%`,
                        "--bar-height": `${height}%`,
                      } as React.CSSProperties}
                    />
                  </div>
                  <span className="mt-2 h-4 truncate text-center text-[8px] font-bold text-[#87958f]">
                    {shouldShowLabel ? formatTrendDate(point.date) : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        <article id="distribusi" className="scroll-mt-28 rounded-[22px] border border-[#dce6e0] bg-white p-5 shadow-[0_8px_24px_rgba(23,58,44,.04)] sm:p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#42806a]">Distribusi aktivitas</p>
          <h2 className="mt-1 text-lg font-extrabold">Berdasarkan role</h2>
          <p className="mt-2 text-xs font-medium text-[#7b8984]">{totalRoleActivity} event pada periode terpilih</p>
          <div className="mt-6 space-y-5">
            {APP_ROLES.map((role) => {
              const value = data.activityDistribution[role];
              return (
                <div key={role}>
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="font-extrabold">{roleLabel(role)}</span>
                    <span className="font-extrabold text-[#587068]">{value}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf2ef]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${value === 0 ? 0 : Math.max(6, (value / maxRoleActivity) * 100)}%`,
                        backgroundColor: ROLE_COLORS[role],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.8fr)]">
        <article id="aktivitas" className="scroll-mt-28 overflow-hidden rounded-[22px] border border-[#dce6e0] bg-white shadow-[0_8px_24px_rgba(23,58,44,.04)]">
          <div className="flex items-start justify-between gap-4 border-b border-[#e3ebe6] px-5 py-5 sm:px-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#42806a]">Log aktual</p>
              <h2 className="mt-1 text-lg font-extrabold">Aktivitas terbaru</h2>
            </div>
            <Activity className="h-5 w-5 text-[#43806a]" />
          </div>

          {data.recentActivities.length ? (
            <div className="divide-y divide-[#e8eeea]">
              {data.recentActivities.map((activity) => {
                const status = STATUS_STYLES[activity.status];
                const StatusIcon = status.icon;

                return (
                  <div key={activity.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
                    <div className="flex min-w-0 gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf5f1] text-xs font-black text-[#29644d]">
                        {activity.actorName.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-xs font-extrabold">{activity.actorName}</p>
                          {activity.actorRole ? (
                            <span className={`rounded-md px-2 py-0.5 text-[8px] font-extrabold uppercase ${ROLE_SURFACES[activity.actorRole]}`}>
                              {roleLabel(activity.actorRole)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[11px] font-semibold text-[#60736b]">
                          {activityEventLabel(activity.eventType)} · {activity.description}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-[#93a09b]">
                          <Clock3 className="h-3 w-3" /> {formatDateTime(activity.createdAt)} WIB
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-extrabold ${status.classes}`}>
                      <StatusIcon className="h-3.5 w-3.5" /> {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#edf5f1] text-[#39725c]">
                <Activity className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-extrabold">Belum ada aktivitas pada filter ini</h3>
              <p className="mx-auto mt-2 max-w-sm text-xs font-medium leading-5 text-[#7b8b84]">
                Event akan muncul setelah pengguna login, memperbarui profil, atau melakukan aksi bisnis yang terintegrasi.
              </p>
            </div>
          )}
        </article>

        <article id="pengguna" className="scroll-mt-28 rounded-[22px] border border-[#dce6e0] bg-white p-5 shadow-[0_8px_24px_rgba(23,58,44,.04)] sm:p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#42806a]">Basis pengguna</p>
          <h2 className="mt-1 text-lg font-extrabold">Pengguna per role</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {APP_ROLES.map((role) => (
              <div key={role} className="rounded-2xl border border-[#e2e9e5] bg-[#fbfdfc] p-4">
                <span className="block h-2 w-8 rounded-full" style={{ backgroundColor: ROLE_COLORS[role] }} />
                <p className="mt-3 text-[10px] font-bold text-[#708079]">{roleLabel(role)}</p>
                <p className="mt-1 text-2xl font-extrabold">{data.userDistribution[role]}</p>
              </div>
            ))}
          </div>
          {data.userDistribution.unassigned > 0 ? (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[#fff7e9] px-4 py-3 text-[10px] font-extrabold text-[#946324]">
              <span>Belum memilih role</span>
              <span>{data.userDistribution.unassigned}</span>
            </div>
          ) : null}
          <div className="mt-5 rounded-2xl bg-[#0b4333] p-4 text-white">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/50">Status monitoring</p>
            <p className="mt-2 text-sm font-extrabold">Ringkasan aktivitas platform</p>
            <p className="mt-2 text-[10px] font-medium leading-5 text-white/60">
              Metrik mengikuti sumber data aktif pada konfigurasi aplikasi.
            </p>
          </div>
        </article>
      </section>

      <p className="mt-5 text-right text-[9px] font-semibold text-[#899790]">
        Zona waktu monitoring: Asia/Jakarta · pembaruan {formatTime(data.generatedAt)} WIB
      </p>
    </main>
  );
}
