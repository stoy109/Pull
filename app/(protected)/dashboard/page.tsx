import Image from "next/image";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,

  FileText,
  ShieldCheck,
  TrendingUp,

  UsersRound,
} from "lucide-react";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";
import { requireRole } from "@/lib/auth/require-role";
import {
  getRecentActivities,
  getUmkmOverviewStats,
  type ActivityLog,
} from "@/lib/activity/queries";

function activityPresentation(activity: ActivityLog) {
  if (activity.action === "pool.create") {
    return { title: "Pool baru dibuat", icon: UsersRound };
  }
  if (activity.action === "pool.join") {
    return { title: "Bergabung ke pool", icon: CheckCircle2 };
  }
  if (activity.action === "job.post") {
    return { title: "Lowongan berhasil diposting", icon: BriefcaseBusiness };
  }
  if (activity.action === "profile.update") {
    return { title: "Profil bisnis diperbarui", icon: CheckCircle2 };
  }
  return { title: activity.action.replaceAll(".", " · "), icon: CheckCircle2 };
}

function relativeTime(value: string) {
  const elapsed = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 60_000) return "Baru saja";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)} menit`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)} jam`;
  return `${Math.floor(elapsed / 86_400_000)} hari`;
}

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback = "",
) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readProfileCompletion(metadata: Record<string, unknown>) {
  const value = metadata.profile_completion;

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return Math.min(100, Math.max(0, parsed));
  }

  return 84;
}

export default async function DashboardPage() {
  const { user } = await requireRole(["umkm"]);
  const [overview, recentActivities] = await Promise.all([
    getUmkmOverviewStats(user.id),
    getRecentActivities({ userIdFilter: user.id, roleFilter: "umkm", limit: 5 }),
  ]);
  const metadata = user.user_metadata ?? {};
  const overviewStats = [
    { label: "Total Pool Aktif", value: overview.activePools, icon: UsersRound, tone: "bg-[#e7f4df] text-[#07833f]" },
    { label: "Lowongan Aktif", value: overview.activeJobs, icon: BriefcaseBusiness, tone: "bg-[#e7f4df] text-[#07833f]" },
    { label: "Lamaran Masuk", value: overview.applications, icon: FileText, tone: "bg-[#e9f2ff] text-[#0868d7]" },
  ];

  const savedOwnerName =
    readMetadataString(metadata, "display_name") ||
    readMetadataString(metadata, "full_name");
  const ownerName = savedOwnerName || "Sari Wulandari";
  const businessName =
    readMetadataString(metadata, "business_name") || "Dapur Sari";
  const profileCompletion = readProfileCompletion(metadata);
  const firstName = ownerName.split(" ")[0];

  return (
    <UmkmDashboardShell ownerName={ownerName} businessName={businessName} profileCompletion={profileCompletion}>
      <section
        id="ringkasan"
        className="relative z-20 mb-5 overflow-hidden rounded-[20px] border border-[#dfeae2] bg-[#fffefa] shadow-[0_8px_30px_rgba(18,59,48,.035)] sm:min-h-[260px]"
      >
        <div className="relative z-10 px-5 py-7 sm:min-h-[260px] sm:max-w-[52%] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <h2 className="mt-4 font-[family-name:var(--font-worker-display)] text-[27px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0c261c] sm:text-[32px]">
            Selamat datang kembali, {firstName}! <span aria-hidden="true">👋</span>
          </h2>
          <p className="mt-5 max-w-[430px] text-sm font-medium leading-7 text-[#38694e] sm:text-[15px]">
            Kelola usahamu, temukan pekerja tepercaya, dan tumbuh bersama komunitas Pull.
          </p>
        </div>
        <div className="relative h-52 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[62%]">
          <Image
            src="/illustrations/umkm-dashboard-welcome-v4.png"
            alt="Pemilik UMKM mengelola pesanan dari toko lokalnya"
            fill
            priority
            sizes="(min-width: 640px) 62vw, 100vw"
            className="object-cover object-right sm:object-right-center"
          />
        </div>
      </section>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 flex h-full flex-col gap-5 xl:col-span-9 xl:min-h-[270px]">
          <section className="flex min-h-[124px] flex-col gap-4 rounded-[18px] border border-[#f5c38e] bg-[linear-gradient(100deg,#fffaf3_0%,#fff3e5_100%)] p-5 shadow-[0_8px_28px_rgba(197,104,28,.055)] sm:flex-row sm:items-center sm:gap-5 sm:p-6">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f47b0c] text-white shadow-[0_8px_18px_rgba(244,123,12,.22)]">
              <CircleAlert className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold text-[#0c261c]">{overview.applications} pelamar tercatat</h2>
              <p className="mt-1.5 text-xs font-medium leading-5 text-[#507f63] sm:text-[13px]">
                Tinjau kandidat lebih awal agar kebutuhan tim {businessName} cepat terpenuhi.
              </p>
            </div>
            <a href="/dashboard/jobs" className="inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#07964d] px-6 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(7,150,77,.18)] transition hover:bg-[#087d44]">
              Tinjau pelamar <ArrowRight className="h-4 w-4" />
            </a>
          </section>

          <section id="peluang" className="grid flex-1 auto-rows-fr items-stretch gap-4 md:grid-cols-3">
            {overviewStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article key={stat.label} className="grid h-full min-h-[126px] grid-cols-[48px_minmax(0,1fr)] items-center gap-4 rounded-[18px] border border-[#dfeae2] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(18,59,48,.025)] md:h-[126px] xl:px-4 2xl:px-5">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[13px] ${stat.tone}`}>
                    <Icon className="h-[22px] w-[22px]" />
                  </span>
                  <div className="grid min-w-0 grid-rows-[16px_32px_16px] content-center gap-y-1">
                    <p className="truncate text-[11px] font-bold leading-4 text-[#3d5f4c]">{stat.label}</p>
                    <strong className="block font-[family-name:var(--font-worker-display)] text-[30px] font-semibold leading-8 tracking-[-0.04em] text-[#0c261c]">{stat.value}</strong>
                    <p className="flex items-center gap-x-1 whitespace-nowrap text-[10px] font-semibold leading-4 text-[#6e8176]">
                      <span className="inline-flex items-center gap-1 font-extrabold text-[#07964d]">
                        <TrendingUp className="h-3.5 w-3.5" /> Data live
                      </span>
                      <span>dari aktivitas</span>
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        </div>

        <section id="trust-score" className="col-span-12 flex min-h-[270px] flex-col rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.035)] xl:col-span-3">
          <h2 className="flex items-center gap-2 font-[family-name:var(--font-worker-display)] text-lg font-semibold tracking-[-0.025em] text-[#0c261c]">
            <ShieldCheck className="h-5 w-5 fill-[#087a41] text-white" /> Trust Score
          </h2>
          <div className="relative mx-auto mt-3 h-32 w-32" role="img" aria-label="Trust Score bisnis 4,7 dari 5, sangat baik">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <linearGradient id="umkm-trust-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#05723c" />
                  <stop offset="1" stopColor="#84bf2f" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#edf1ee" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="url(#umkm-trust-gradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray="326.73" strokeDashoffset="19.6" />
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center">
              <strong className="font-[family-name:var(--font-worker-display)] text-[40px] font-semibold tracking-[-0.06em] text-[#0c261c]">4,7</strong>
              <span className="mt-0.5 text-[10px] font-extrabold text-[#28543e]">Sangat baik</span>
            </div>
          </div>
          <a href="#aktivitas" className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#b9dcc8] bg-white text-[11px] font-extrabold text-[#087a41] transition hover:border-[#78b994] hover:bg-[#f5fbf7]">
            Lihat detail
          </a>
        </section>

        <section id="aktivitas" className="col-span-12 min-h-[358px] rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.03)] sm:p-6">
          <div className="flex items-center gap-4 border-b border-[#dfeae2] pb-5">
            <div className="flex items-center gap-2.5">
              <h2 className="font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]">Aktivitas terbaru</h2>
              <span className="rounded-md bg-[#e7f5eb] px-2.5 py-1 text-[10px] font-extrabold text-[#18804a]">Hari ini</span>
            </div>
          </div>
          <div className="divide-y divide-[#edf3ef]">
            {recentActivities.map((activity) => {
              const presentation = activityPresentation(activity);
              const Icon = presentation.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 py-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e8f5ec] text-[#08783f]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold leading-5 text-[#1d4634]">{presentation.title}</p>
                    <p className="mt-1 text-[10px] font-medium leading-4 text-[#6e9b7d]">{activity.detail || "Aktivitas berhasil tercatat di Pull."}</p>
                  </div>
                  <span className="shrink-0 pt-1 text-[10px] font-semibold text-[#6e9b7d]">{relativeTime(activity.created_at)}</span>
                </div>
              );
            })}
            {!recentActivities.length ? <p className="py-10 text-center text-xs font-semibold text-[#6e9b7d]">Belum ada aktivitas tercatat.</p> : null}
          </div>
        </section>

      </div>

      <footer className="mt-8 flex flex-col gap-2 border-t border-[#dfeae2] pt-5 text-[9px] font-semibold text-[#6e9b7d] sm:flex-row sm:items-center sm:justify-between">
        <p>Pull UMKM Space · Membantu usaha lokal tumbuh bersama</p>
        <p>Data dashboard menyesuaikan profil bisnis Anda</p>
      </footer>
    </UmkmDashboardShell>
  );
}
