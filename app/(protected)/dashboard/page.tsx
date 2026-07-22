import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  ClipboardList,
  Eye,
  History,
  Home,
  PackageCheck,
  Settings,
  ShieldCheck,
  Store,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { getDashboardData } from "@/features/dashboard/data/get-dashboard-data";
import { ProfileMenu } from "./profile-menu";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: Home, href: "#ringkasan", active: true },
  { label: "Pool Patungan", icon: UsersRound, href: "/dashboard/pools" },
  { label: "Papan Loker", icon: BriefcaseBusiness, href: "#peluang" },
  { label: "Profil Bisnis", icon: Store, href: "#profil-bisnis" },
  { label: "Trust Score", icon: ShieldCheck, href: "#trust-score" },
  { label: "Riwayat Transaksi", icon: History, href: "#aktivitas" },
];

const SIDEBAR_SUPPORT_ITEMS = [
  { label: "Bantuan", icon: CircleHelp },
  { label: "Pengaturan", icon: Settings },
];

const OVERVIEW_STATS = [
  {
    label: "Lowongan aktif",
    value: "4",
    detail: "+1 dari minggu lalu",
    icon: BriefcaseBusiness,
    tone: "bg-[#e8f5ec] text-[#08783f]",
  },
  {
    label: "Pelamar baru",
    value: "12",
    detail: "5 perlu ditinjau",
    icon: ClipboardList,
    tone: "bg-[#fff0df] text-[#d96c10]",
  },
  {
    label: "Pekerja aktif",
    value: "6",
    detail: "2 mulai minggu ini",
    icon: UserRoundCheck,
    tone: "bg-[#e8f5ec] text-[#18844b]",
  },
  {
    label: "Pesanan selesai",
    value: "28",
    detail: "+18% bulan ini",
    icon: PackageCheck,
    tone: "bg-[#fff6d9] text-[#b97a00]",
  },
];

const ACTIVITIES = [
  {
    title: "Profil bisnis Anda dilihat",
    detail: "36 calon mitra melihat profil usaha hari ini.",
    time: "8 menit",
    icon: Eye,
  },
  {
    title: "Pelamar baru masuk",
    detail: "Rina melamar lowongan Staf Packing Harian.",
    time: "42 menit",
    icon: UserRoundCheck,
  },
  {
    title: "Pesanan patungan selesai",
    detail: "Pembelian bahan baku bersama berhasil diproses.",
    time: "3 jam",
    icon: CheckCircle2,
  },
];

const NOTIFICATIONS = [
  "Tinjau 5 pelamar baru sebelum besok.",
  "Konfirmasi pekerjaan Rina agar Trust Score tetap terjaga.",
  "Lengkapi jam operasional untuk meningkatkan visibilitas profil.",
];

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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function DashboardPage() {
  const { user } = await getDashboardData();

  if (!user && process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  const metadata = user?.user_metadata ?? {};
  const role = readMetadataString(metadata, "role", "umkm");

  if (role === "pekerja") {
    redirect("/worker/dashboard");
  }

  const savedOwnerName =
    readMetadataString(metadata, "display_name") ||
    readMetadataString(metadata, "full_name");
  const ownerName = savedOwnerName || "Sari Wulandari";
  const businessName =
    readMetadataString(metadata, "business_name") || "Dapur Sari";
  const category = readMetadataString(metadata, "headline", "Kuliner & Oleh-oleh");
  const contact = readMetadataString(metadata, "phone", "+62 812-3456-7890");
  const profileCompletion = readProfileCompletion(metadata);
  const initials = getInitials(ownerName) || "SW";
  const firstName = ownerName.split(" ")[0];

  return (
    <main className="min-h-screen bg-[#f6f8f5] font-[family-name:var(--font-worker-sans)] text-[#0c261c]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 bg-gradient-to-b from-[#00613f] via-[#005235] to-[#003f29] text-white lg:block">
        <div className="flex h-full flex-col px-5 py-8">
          <div className="flex items-center gap-3 px-2">
            <Image
              src="/Logo(Pull).svg"
              alt="Pull"
              className="h-10 w-10 rounded-lg"
              width={40}
              height={40}
              priority
            />
            <span className="text-2xl font-extrabold">Pull</span>
          </div>

          <nav className="mt-7 flex-1 space-y-2" aria-label="Navigasi utama UMKM">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors ${
                    item.active
                      ? "bg-[#0e9855] text-white shadow-lg shadow-emerald-950/20"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <nav className="mt-6 space-y-2 border-t border-white/10 pt-3" aria-label="Bantuan dan pengaturan">
            {SIDEBAR_SUPPORT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href="#"
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/90 transition-colors hover:bg-white/10"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-[#e2ece6] bg-white px-4 py-5 shadow-sm shadow-emerald-950/5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-normal text-[#10231d]">
              Dashboard Overview
            </h1>
            <p className="mt-2 max-w-[520px] text-sm font-medium leading-relaxed text-[#6b7b75]">
              Ringkasan utama profil bisnis Anda, aktivitas terbaru, dan notifikasi penting.
            </p>
          </div>

          <ProfileMenu
            initials={initials}
            ownerName={ownerName}
            businessName={businessName}
            profileCompletion={profileCompletion}
          />
        </header>

        <div className="mx-auto max-w-[1540px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7 xl:px-8">
          <section
            id="ringkasan"
            className="relative z-20 mb-5 overflow-hidden rounded-[20px] border border-[#dfeae2] bg-[#fffefa] shadow-[0_8px_30px_rgba(18,59,48,.035)] sm:min-h-[260px]"
          >
            <div className="relative z-10 px-5 py-7 sm:min-h-[260px] sm:max-w-[52%] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <span className="inline-flex rounded-full bg-[#e7f5eb] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#18804a]">
                Ruang Usaha {businessName}
              </span>
              <h2 className="mt-4 font-[family-name:var(--font-worker-display)] text-[27px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0c261c] sm:text-[32px]">
                Selamat datang kembali, {firstName}! <span aria-hidden="true">👋</span>
              </h2>
              <p className="mt-5 max-w-[430px] text-sm font-medium leading-7 text-[#38694e] sm:text-[15px]">
                Kelola usahamu, temukan pekerja tepercaya, dan tumbuh bersama komunitas Pull.
              </p>
            </div>
            <div className="relative h-52 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[62%]">
              <Image
                src="/illustrations/umkm-dashboard-welcome.png"
                alt="Pemilik UMKM mengelola pesanan dari toko lokalnya"
                fill
                priority
                sizes="(min-width: 640px) 62vw, 100vw"
                className="object-cover object-right sm:object-right-center"
              />
            </div>
          </section>

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 space-y-5 xl:col-span-9">
              <section className="flex min-h-[124px] flex-col gap-4 rounded-[18px] border border-[#f5c38e] bg-[linear-gradient(100deg,#fffaf3_0%,#fff3e5_100%)] p-5 shadow-[0_8px_28px_rgba(197,104,28,.055)] sm:flex-row sm:items-center sm:gap-5 sm:p-6">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f47b0c] text-white shadow-[0_8px_18px_rgba(244,123,12,.22)]">
                  <CircleAlert className="h-7 w-7" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-extrabold text-[#0c261c]">5 pelamar menunggu ditinjau</h2>
                  <p className="mt-1.5 text-xs font-medium leading-5 text-[#507f63] sm:text-[13px]">
                    Tinjau kandidat lebih awal agar kebutuhan tim {businessName} cepat terpenuhi.
                  </p>
                </div>
                <a href="#peluang" className="inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#07964d] px-6 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(7,150,77,.18)] transition hover:bg-[#087d44]">
                  Tinjau pelamar <ArrowRight className="h-4 w-4" />
                </a>
              </section>

              <section id="peluang" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {OVERVIEW_STATS.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <article key={stat.label} className="flex min-h-[204px] flex-col rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.025)]">
                      <div className="flex items-start gap-3.5">
                        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[13px] ${stat.tone}`}>
                          <Icon className="h-[22px] w-[22px]" />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-xs font-extrabold leading-4 text-[#28543e]">{stat.label}</p>
                          <strong className="mt-2 block font-[family-name:var(--font-worker-display)] text-[34px] font-semibold leading-none tracking-[-0.04em] text-[#0c261c]">{stat.value}</strong>
                        </div>
                      </div>
                      <p className="mt-auto flex items-center gap-1.5 pt-5 text-[11px] font-semibold leading-5 text-[#507f63]">
                        <TrendingUp className="h-4 w-4" /> {stat.detail}
                      </p>
                    </article>
                  );
                })}
              </section>
            </div>

            <section id="trust-score" className="col-span-12 flex min-h-[348px] flex-col rounded-[18px] border border-[#dfeae2] bg-white p-6 shadow-[0_8px_28px_rgba(18,59,48,.035)] xl:col-span-3">
              <h2 className="flex items-center gap-2 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]">
                <ShieldCheck className="h-5 w-5 fill-[#087a41] text-white" /> Trust Score
              </h2>
              <div className="relative mx-auto mt-5 h-48 w-48" role="img" aria-label="Trust Score bisnis 4,7 dari 5, sangat baik">
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
                  <strong className="font-[family-name:var(--font-worker-display)] text-[52px] font-semibold tracking-[-0.06em] text-[#0c261c]">4,7</strong>
                  <span className="mt-1 text-xs font-extrabold text-[#28543e]">Sangat baik</span>
                </div>
              </div>
              <a href="#aktivitas" className="mt-auto inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#b9dcc8] bg-white text-xs font-extrabold text-[#087a41] transition hover:border-[#78b994] hover:bg-[#f5fbf7]">
                Lihat detail
              </a>
            </section>

            <section id="aktivitas" className="col-span-12 min-h-[358px] rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.03)] sm:p-6 xl:col-span-6">
              <div className="flex items-center justify-between gap-4 border-b border-[#dfeae2] pb-5">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]">Aktivitas terbaru</h2>
                  <span className="rounded-md bg-[#e7f5eb] px-2.5 py-1 text-[10px] font-extrabold text-[#18804a]">Hari ini</span>
                </div>
                <a href="#" className="text-[10px] font-extrabold text-[#38694e]">Lihat semua</a>
              </div>
              <div className="divide-y divide-[#edf3ef]">
                {ACTIVITIES.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.title} className="flex items-start gap-3 py-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e8f5ec] text-[#08783f]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold leading-5 text-[#1d4634]">{activity.title}</p>
                        <p className="mt-1 text-[10px] font-medium leading-4 text-[#6e9b7d]">{activity.detail}</p>
                      </div>
                      <span className="shrink-0 pt-1 text-[10px] font-semibold text-[#6e9b7d]">{activity.time}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="profil-bisnis" className="col-span-12 min-h-[358px] rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.03)] sm:p-6 xl:col-span-6">
              <div className="flex items-center justify-between gap-4 border-b border-[#dfeae2] pb-5">
                <div>
                  <h2 className="font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]">Profil bisnis</h2>
                  <p className="mt-1 text-[10px] font-medium text-[#6e9b7d]">Identitas usaha dan hal penting yang perlu dilengkapi.</p>
                </div>
                <span className="rounded-full bg-[#e7f5eb] px-3 py-1 text-[10px] font-extrabold text-[#18804a]">{profileCompletion}% lengkap</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f7faf8] p-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#6e9b7d]">Nama usaha</p>
                  <p className="mt-1.5 text-xs font-extrabold text-[#0c261c]">{businessName}</p>
                </div>
                <div className="rounded-xl bg-[#f7faf8] p-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#6e9b7d]">Pemilik</p>
                  <p className="mt-1.5 text-xs font-extrabold text-[#0c261c]">{ownerName}</p>
                </div>
                <div className="rounded-xl bg-[#f7faf8] p-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#6e9b7d]">Kategori</p>
                  <p className="mt-1.5 text-xs font-extrabold text-[#0c261c]">{category}</p>
                </div>
                <div className="rounded-xl bg-[#f7faf8] p-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#6e9b7d]">Kontak</p>
                  <p className="mt-1.5 text-xs font-extrabold text-[#0c261c]">{contact}</p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {NOTIFICATIONS.map((notification) => (
                  <div key={notification} className="flex items-start gap-3 rounded-xl border border-[#edf3ef] px-3 py-2.5">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[#d96c10]" />
                    <p className="text-[10px] font-semibold leading-4 text-[#38694e]">{notification}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <footer className="mt-8 flex flex-col gap-2 border-t border-[#dfeae2] pt-5 text-[9px] font-semibold text-[#6e9b7d] sm:flex-row sm:items-center sm:justify-between">
            <p>Pull UMKM Space · Membantu usaha lokal tumbuh bersama</p>
            <p>Data dashboard menyesuaikan profil bisnis Anda</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
