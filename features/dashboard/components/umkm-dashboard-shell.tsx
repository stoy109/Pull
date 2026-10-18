"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CircleHelp,
  Clock3,
  Grid2X2,
  Home,
  Settings,
  ShieldCheck,
  Store,
  UsersRound,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { ProfileMenu } from "@/app/(protected)/dashboard/profile-menu";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Terbitkan Lowongan", icon: BriefcaseBusiness, href: "/dashboard/publish" },
  { label: "Pool Patungan", icon: UsersRound, href: "/dashboard/pools" },
  { label: "Papan Loker", icon: BriefcaseBusiness, href: "/dashboard/jobs" },
  { label: "Notifikasi", icon: Bell, href: "/dashboard/notifications" },
  { label: "Profil Bisnis", icon: Store, href: "/dashboard/profile" },
  { label: "Trust Score", icon: ShieldCheck, href: "/dashboard/trust" },
];

const MOBILE_NAV_ITEMS = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Lowongan", icon: BriefcaseBusiness, href: "/dashboard/publish" },
  { label: "Menu", icon: Grid2X2, href: "" },
  { label: "Papan Loker", icon: BriefcaseBusiness, href: "/dashboard/jobs" },
  { label: "Profil", icon: Store, href: "/dashboard/profile" },
];

const UMKM_FAQS = [
  {
    question: "Bagaimana cara membuat Pool Patungan?",
    answer:
      "Buka menu Pool Patungan, pilih Buat Pool, lalu pilih bahan baku dari katalog supplier dan isi target, kecamatan, serta hub pengambilan bila perlu. Pool dimulai dengan batas waktu satu jam yang diperbarui saat pengguna baru pertama kali bergabung.",
  },
  {
    question: "Bagaimana cara meninjau dan menerima pelamar?",
    answer:
      "Buka Papan Loker untuk melihat pelamar, periksa profil dan Trust Score mereka, lalu hubungi kandidat yang sesuai melalui WhatsApp dan perbarui status lamarannya.",
  },
  {
    question: "Kapan Trust Score usaha diperbarui?",
    answer:
      "Trust Score diperbarui setelah pekerjaan selesai dikonfirmasi oleh UMKM dan pekerja. Penilaian dari transaksi yang terverifikasi akan ikut membangun reputasi usaha Anda.",
  },
  {
    question: "Apakah profil bisnis harus dilengkapi?",
    answer:
      "Anda tetap dapat menjelajahi fitur Pull, tetapi profil bisnis yang lengkap membuat usaha lebih dipercaya, membantu kandidat memahami kebutuhan Anda, dan meningkatkan kualitas interaksi.",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function MobileBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="Pull dashboard">
      <span
        className="h-10 w-[52px] shrink-0 bg-[#08783f]"
        style={{
          WebkitMask: 'url("/pull-icon.svg") center / contain no-repeat',
          mask: 'url("/pull-icon.svg") center / contain no-repeat',
        }}
        aria-hidden="true"
      />
      <div>
        <p className="font-[family-name:var(--font-worker-display)] text-[22px] font-bold leading-none tracking-normal text-[#08783f]">Pull</p>
        <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#08783f]">UMKM space</p>
      </div>
    </Link>
  );
}

export function UmkmDashboardShell({
  ownerName,
  profileCompletion,
  children,
}: {
  ownerName: string;
  businessName: string;
  profileCompletion: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const initials = getInitials(ownerName) || "PU";
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerContent = pathname.startsWith("/dashboard/profile")
    ? {
        title: "Profil Bisnis",
        description: "Kelola informasi usaha dan produk yang tampil pada profil publik Anda.",
      }
    : pathname.startsWith("/dashboard/trust")
      ? {
          title: "Trust Score",
          description: "Pantau reputasi bisnis dari aktivitas, verifikasi, dan riwayat kerja yang sudah selesai.",
        }
      : pathname.startsWith("/dashboard/activity")
        ? {
            title: "Aktivitas",
            description: "Lihat jejak perubahan profil, transaksi, lowongan, dan verifikasi usaha Anda.",
          }
        : pathname.startsWith("/dashboard/settings")
          ? {
              title: "Pengaturan",
              description: "Kelola data akun, verifikasi, notifikasi, dan preferensi operasional UMKM.",
            }
      : pathname.startsWith("/dashboard/jobs")
    ? {
        title: "Papan Loker",
        description: "Kelola lowongan, pantau pelamar, dan temukan tenaga kerja yang tepat untuk bisnis Anda.",
      }
    : pathname.startsWith("/dashboard/pools")
      ? {
          title: "Pool Patungan Bahan Baku",
          description: "Gabung patungan atau buat pool baru untuk menghemat belanja bahan baku usaha.",
        }
      : pathname.startsWith("/dashboard/publish")
        ? {
            title: "Terbitkan Lowongan",
            description: "Susun detail lowongan, simpan sebagai draft, lalu terbitkan untuk pekerja terdekat.",
          }
      : pathname.startsWith("/dashboard/notifications")
        ? {
            title: "Notifikasi",
            description: "Kotak masuk usaha Anda: lamaran masuk, pool patungan, dan pembaruan sistem.",
          }
      : {
          title: "Dashboard Overview",
          description: "Ringkasan utama profil bisnis Anda, aktivitas terbaru, dan notifikasi penting.",
        };

  useEffect(() => {
    if (!isHelpOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsHelpOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isHelpOpen]);

  return (
    <div className="min-h-screen bg-[#f6f8f5] font-[family-name:var(--font-worker-sans)] text-[#0c261c]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 bg-gradient-to-b from-[#00613f] via-[#005235] to-[#003f29] text-white lg:block">
        <div className="flex h-full flex-col px-5 py-8">
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <Image src="/Logo(Pull).svg" alt="Pull" className="h-10 w-10 rounded-lg" width={40} height={40} priority />
            <span className="text-2xl font-extrabold">Pull</span>
          </Link>

          <nav className="mt-7 flex-1 space-y-2" aria-label="Navigasi utama UMKM">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-[#0e9855] text-white shadow-lg shadow-emerald-950/20"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <nav className="mt-6 space-y-2 border-t border-white/10 pt-3" aria-label="Bantuan dan pengaturan">
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-white/90 transition-colors hover:bg-white/10"
            >
              <CircleHelp className="h-4 w-4 shrink-0" />
              <span>Bantuan</span>
            </button>
            <Link href="/dashboard/settings/profile" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/90 transition-colors hover:bg-white/10">
              <Settings className="h-4 w-4 shrink-0" />
              <span>Pengaturan</span>
            </Link>
          </nav>
        </div>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-[#e2ece6] bg-white px-4 py-5 shadow-sm shadow-emerald-950/5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="md:hidden"><MobileBrand /></div>
            <div className="hidden min-w-0 md:block">
            <h1 className="text-3xl font-extrabold leading-tight tracking-normal text-[#10231d]">{headerContent.title}</h1>
            <p className="mt-2 max-w-[620px] text-sm font-medium leading-relaxed text-[#6b7b75]">{headerContent.description}</p>
            </div>
          </div>
          <div className="hidden md:block">
            <ProfileMenu initials={initials} ownerName={ownerName} profileCompletion={profileCompletion} />
          </div>
        </header>

        <main className="mx-auto max-w-[1540px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:pb-16 xl:px-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid min-h-[72px] grid-cols-5 border-t border-[#dfeae2] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(12,38,28,.07)] backdrop-blur-xl lg:hidden" aria-label="Navigasi mobile UMKM">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isMenu = item.label === "Menu";
          const isActive = isMenu
            ? isMobileMenuOpen || pathname.startsWith("/dashboard/pools") || pathname.startsWith("/dashboard/trust") || pathname.startsWith("/dashboard/activity") || pathname.startsWith("/dashboard/notifications") || pathname.startsWith("/dashboard/settings")
            : item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return isMenu ? (
            <button key={item.label} type="button" onClick={() => setIsMobileMenuOpen(true)} className={`relative flex flex-col items-center justify-end pb-1.5 text-[8px] font-extrabold ${isActive ? "text-[#08783f]" : "text-[#6e9b7d]"}`} aria-label="Buka menu UMKM">
              <span className="absolute bottom-7 grid size-14 place-items-center rounded-full bg-[#08783f] text-white shadow-[0_8px_20px_rgba(8,120,63,.3)] ring-[6px] ring-[#f6f8f5]"><Icon className="size-6" /></span>
              <span className="relative z-10">Menu</span>
            </button>
          ) : (
            <Link key={item.label} href={item.href} className={`flex flex-col items-center justify-center gap-1 px-0.5 text-center text-[8px] font-extrabold ${isActive ? "text-[#08783f]" : "text-[#6e9b7d]"}`}>
              <Icon className="size-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-[#0c261c]/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} aria-label="Tutup menu UMKM" />
          <section role="dialog" aria-modal="true" aria-labelledby="umkm-mobile-menu-title" className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-[0_-24px_70px_rgba(12,38,28,.2)]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#bfd5c5]" />
            <div className="mb-4 flex items-center justify-between">
              <div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#507f63]">Navigasi UMKM</p><h2 id="umkm-mobile-menu-title" className="mt-1 text-xl font-extrabold text-[#0c261c]">Menu lainnya</h2></div>
              <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="grid size-10 place-items-center rounded-xl border border-[#dfeae2] text-[#38694e]" aria-label="Tutup menu"><X className="size-[18px]" /></button>
            </div>
            <nav className="grid grid-cols-2 gap-2" aria-label="Semua fitur UMKM">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                return <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex min-h-14 items-center gap-3 rounded-2xl border p-3 text-[10px] font-extrabold ${isActive ? "border-[#94b9a1] bg-[#f0f5f1] text-[#17392c]" : "border-[#dfeae2] text-[#38694e]"}`}><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#f0f5f1]"><Icon className="size-4" /></span><span>{item.label}</span></Link>;
              })}
              <Link href="/dashboard/activity" onClick={() => setIsMobileMenuOpen(false)} className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#dfeae2] p-3 text-[10px] font-extrabold text-[#38694e]"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#f0f5f1]"><Clock3 className="size-4" /></span><span>Aktivitas</span></Link>
              <Link href="/dashboard/settings/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#dfeae2] p-3 text-[10px] font-extrabold text-[#38694e]"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#f0f5f1]"><Settings className="size-4" /></span><span>Pengaturan</span></Link>
              <button type="button" onClick={() => { setIsMobileMenuOpen(false); setIsHelpOpen(true); }} className="col-span-2 flex min-h-14 items-center gap-3 rounded-2xl border border-[#dfeae2] p-3 text-left text-[10px] font-extrabold text-[#38694e]"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#f0f5f1]"><CircleHelp className="size-4" /></span><span>Bantuan</span></button>
            </nav>
          </section>
        </div>
      ) : null}

      {isHelpOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-[#052b20]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsHelpOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="umkm-help-title"
            className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[26px] border border-[#e2ece6] bg-white shadow-[0_28px_80px_rgba(12,38,28,.24)] sm:max-w-[560px] sm:rounded-[26px]"
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e2ece6] px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4f7a68]">Bantuan Pull</p>
                <h2 id="umkm-help-title" className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em] text-[#0c261c] sm:text-2xl">Pusat bantuan</h2>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#6b7b75]">Jawaban singkat untuk aktivitas UMKM yang paling sering ditanyakan.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                aria-label="Tutup pusat bantuan"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#dce7e1] text-[#315b4c] transition-colors hover:bg-[#f0f7f3]"
              >
                <X className="h-[17px] w-[17px]" />
              </button>
            </header>

            <div className="overflow-y-auto px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
              <div className="space-y-2">
                {UMKM_FAQS.map((faq) => (
                  <details key={faq.question} className="rounded-xl border border-[#e2ece6] p-3">
                    <summary className="cursor-pointer text-[11px] font-extrabold text-[#244b3c]">{faq.question}</summary>
                    <p className="mt-2 text-[9px] leading-relaxed text-[#75857e]">{faq.answer}</p>
                  </details>
                ))}
              </div>

              <a
                href="https://web.whatsapp.com/send?text=Halo%20CS%20Pull%2C%20saya%20membutuhkan%20bantuan%20untuk%20akun%20UMKM."
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-[14px] bg-[#07843f] px-4 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(7,132,63,.18)] transition hover:bg-[#066f36]"
              >
                <FaWhatsapp className="h-[27px] w-[27px]" />
                Hubungi CS via WhatsApp
              </a>
              <p className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-[#7b8490]">
                <Clock3 className="h-[18px] w-[18px]" />
                Respon biasanya dalam 1×24 jam
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
