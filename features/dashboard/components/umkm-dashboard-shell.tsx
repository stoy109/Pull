"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CircleHelp,
  Clock3,
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
  { label: "Pool Patungan", icon: UsersRound, href: "/dashboard/pools" },
  { label: "Papan Loker", icon: BriefcaseBusiness, href: "/dashboard/jobs" },
  { label: "Profil Bisnis", icon: Store, href: "/dashboard/profile" },
  { label: "Trust Score", icon: ShieldCheck, href: "/dashboard/trust" },
];

const UMKM_FAQS = [
  {
    question: "Bagaimana cara membuat Pool Patungan?",
    answer:
      "Buka menu Pool Patungan, pilih Buat Pool, lalu lengkapi bahan baku, harga normal supplier per satuan, diskon maksimum supplier, target volume, satuan, batas waktu, dan deskripsinya. Estimasi diskon anggota akan menyesuaikan jumlah pesanannya terhadap target pool.",
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
          <div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-normal text-[#10231d]">{headerContent.title}</h1>
            <p className="mt-2 max-w-[620px] text-sm font-medium leading-relaxed text-[#6b7b75]">{headerContent.description}</p>
          </div>
          <ProfileMenu initials={initials} ownerName={ownerName} profileCompletion={profileCompletion} />
        </header>

        <main className="mx-auto max-w-[1540px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7 xl:px-8">
          {children}
        </main>
      </div>

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
                href="https://wa.me/?text=Halo%20CS%20Pull%2C%20saya%20membutuhkan%20bantuan%20untuk%20akun%20UMKM."
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
