import Image from "next/image";
import { redirect } from "next/navigation";
import {
  BriefcaseBusiness,
  CircleHelp,
  ClipboardList,
  History,
  Home,
  Package,
  Settings,
  ShieldCheck,
  Star,
  Store,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { getDashboardData } from "@/features/dashboard/data/get-dashboard-data";
import { ProfileMenu } from "./profile-menu";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Pool Patungan", icon: UsersRound },
  { label: "Papan Loker", icon: BriefcaseBusiness },
  { label: "Profil Bisnis", icon: Store },
  { label: "Trust Score", icon: ShieldCheck },
  { label: "Riwayat Transaksi", icon: History },
];

const SIDEBAR_SUPPORT_ITEMS = [
  { label: "Bantuan", icon: CircleHelp },
  { label: "Pengaturan", icon: Settings },
];

const OVERVIEW_STATS = [
  {
    label: "Produk Aktif",
    value: "24",
    detail: "+4 minggu ini",
    icon: Package,
  },
  {
    label: "Peluang Masuk",
    value: "12",
    detail: "5 butuh respons",
    icon: ClipboardList,
  },
  {
    label: "Pertumbuhan",
    value: "18%",
    detail: "bulan berjalan",
    icon: TrendingUp,
  },
];

const ACTIVITIES = [
  "Profil bisnis dilihat 36 kali hari ini.",
  "Ada notifikasi kolaborasi yang perlu dicek.",
  "Trust Score naik setelah profil dilengkapi.",
];

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback = "",
) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : fallback;
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
  const savedBusinessName = readMetadataString(metadata, "business_name");
  const savedCategory = readMetadataString(metadata, "headline");
  const phone = readMetadataString(metadata, "phone");
  const ownerName = savedOwnerName || "Budi Santoso";
  const businessName = savedBusinessName || "Bisnis Anda";
  const category = savedCategory || "UMKM";
  const contact = phone || "-";
  const initials = getInitials(ownerName) || "PU";

  return (
    <main className="min-h-screen bg-[#f6faf7] text-[#10231d]">
      <div className="grid min-h-screen lg:grid-cols-[224px_minmax(0,1fr)]">
        <aside className="bg-gradient-to-b from-[#00613f] via-[#005235] to-[#003f29] p-3 text-white lg:min-h-screen lg:p-5">
          <div className="flex h-full flex-col px-1 py-2 lg:px-0 lg:py-3">
            <div className="flex items-center gap-3 px-2">
              <Image
                src="/Logo(Pull).svg"
                alt="Pull"
                className="h-10 w-10 rounded-lg"
                width={40}
                height={40}
                priority
              />
              <span className="text-2xl font-extrabold tracking-normal">
                Pull
              </span>
            </div>

            <nav
              className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-7 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0"
              aria-label="Navigasi dashboard UMKM"
            >
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href="#"
                    className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors ${
                      item.active
                        ? "bg-[#0e9855] text-white shadow-lg shadow-emerald-950/20"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </a>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-white/10 pt-3 lg:mt-6">
              <nav
                className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
                aria-label="Bantuan dan pengaturan"
              >
                {SIDEBAR_SUPPORT_ITEMS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href="#"
                      className="flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/90 transition-colors hover:bg-white/10"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

          </div>
        </aside>

        <section className="min-w-0 bg-[#f6faf7]">
          <header className="flex flex-col gap-4 border-b border-[#e2ece6] bg-white px-4 py-5 shadow-sm shadow-emerald-950/5 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-normal text-[#10231d]">
                Dashboard Overview
              </h1>
              <p className="mt-2 max-w-[430px] text-sm font-medium leading-relaxed text-[#6b7b75]">
                Ringkasan utama bisnis Anda, aktivitas terbaru, dan notifikasi
                penting.
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto xl:flex-nowrap">
              <div className="flex h-16 w-full items-center gap-3 rounded-2xl border border-[#e1e9e4] bg-white px-4 shadow-sm shadow-emerald-950/5 sm:w-[220px]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1]">
                  <Image
                    src="/TrustScore.svg"
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                    className="h-6 w-6"
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-none text-[#4b5b56]">
                    Trust Score
                  </p>
                  <p className="mt-2 flex items-end gap-2 whitespace-nowrap">
                    <span className="text-2xl font-extrabold leading-none text-[#05080f]">
                      85
                    </span>
                    <span className="pb-0.5 text-sm font-extrabold leading-none text-[#0c8c45]">
                      Sangat Baik
                    </span>
                  </p>
                </div>
              </div>

              <ProfileMenu initials={initials} ownerName={ownerName} />
            </div>
          </header>

          <div className="grid gap-5 px-4 py-5 sm:px-6 lg:px-8">
            <section className="relative min-h-[148px] overflow-hidden rounded-2xl border border-[#e1ede6] bg-white shadow-sm">
              <div className="absolute inset-y-0 right-0 hidden w-[45%] bg-gradient-to-l from-[#f1f8f3] to-transparent sm:block" />
              <div className="relative z-10 flex min-h-[148px] flex-col justify-center px-7 py-5">
                <h2 className="max-w-md text-2xl font-extrabold leading-tight tracking-normal text-[#10231d]">
                  Selamat datang kembali,
                  <br />
                  {ownerName}! <span aria-hidden="true">👋</span>
                </h2>
                <p className="mt-4 max-w-md text-sm font-semibold leading-snug text-[#526a60]">
                  Kelola {businessName} dan temukan peluang terbaik hari ini.
                </p>
                {role !== "umkm" && (
                  <p className="mt-3 inline-flex rounded-full bg-[#fff7dd] px-3 py-1 text-xs font-extrabold text-[#8a6100]">
                    Tampilan dashboard UMKM
                  </p>
                )}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {OVERVIEW_STATS.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-[#e1ede6] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f1] text-[#05723c]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <Star className="h-4 w-4 fill-[#f4b72a] text-[#f4b72a]" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-[#6b7b75]">
                      {stat.label}
                    </p>
                    <div className="mt-1 flex items-end justify-between gap-3">
                      <p className="text-3xl font-extrabold leading-none text-[#10231d]">
                        {stat.value}
                      </p>
                      <p className="text-xs font-bold text-[#0c8c45]">
                        {stat.detail}
                      </p>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
              <article className="rounded-2xl border border-[#e1ede6] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-normal text-[#10231d]">
                      Aktivitas Terbaru
                    </h2>
                    <p className="mt-1 text-sm font-medium text-[#6b7b75]">
                      Ringkasan yang perlu Anda pantau hari ini.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#edf8f1] px-3 py-1 text-xs font-extrabold text-[#05723c]">
                    Hari ini
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {ACTIVITIES.map((activity) => (
                    <div
                      key={activity}
                      className="flex items-start gap-3 rounded-xl border border-[#edf3ef] bg-[#fbfdfb] p-3"
                    >
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#11944f]" />
                      <p className="text-sm font-semibold leading-relaxed text-[#36544a]">
                        {activity}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article
                id="profil-bisnis"
                className="scroll-mt-24 rounded-2xl border border-[#e1ede6] bg-white p-5 shadow-sm"
              >
                <h2 className="text-lg font-extrabold tracking-normal text-[#10231d]">
                  Profil Bisnis
                </h2>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-[#fbfdfb] px-3 py-3">
                    <span className="font-bold text-[#6b7b75]">Nama Bisnis</span>
                    <span className="text-right font-extrabold text-[#10231d]">
                      {businessName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-[#fbfdfb] px-3 py-3">
                    <span className="font-bold text-[#6b7b75]">Kategori</span>
                    <span className="text-right font-extrabold text-[#10231d]">
                      {category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-[#fbfdfb] px-3 py-3">
                    <span className="font-bold text-[#6b7b75]">Kontak</span>
                    <span className="text-right font-extrabold text-[#10231d]">
                      {contact}
                    </span>
                  </div>
                </div>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
