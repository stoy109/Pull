"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  Home,
  PackageSearch,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ProfileMenu } from "@/app/(protected)/dashboard/profile-menu";
import { supplierInitials } from "@/features/supplier/profile";

const MENU = [
  { label: "Dashboard", mobileLabel: "Beranda", href: "/supplier", icon: Home },
  { label: "Peluang Permintaan", mobileLabel: "Peluang", href: "/supplier/demands", icon: PackageSearch },
  { label: "Buat Penawaran", mobileLabel: "Penawaran", href: "/supplier/offers", icon: Send },
  { label: "Profil Supplier", mobileLabel: "Profil", href: "/supplier/profile", icon: ShieldCheck },
];

function pageHeader(pathname: string) {
  if (pathname.startsWith("/supplier/demands")) {
    return {
      title: "Peluang Permintaan",
      description: "Tinjau pool aktif berdasarkan komoditas, volume, lokasi, dan tenggat pengadaan.",
    };
  }
  if (pathname.startsWith("/supplier/offers")) {
    return {
      title: "Penawaran Supplier",
      description: "Catat harga dan kemampuan pasok agar mudah dicocokkan dengan kebutuhan UMKM.",
    };
  }
  if (pathname.startsWith("/supplier/profile")) {
    return {
      title: "Profil Supplier",
      description: "Periksa identitas usaha, cakupan pengiriman, kontak, dan kesiapan akun supplier.",
    };
  }
  return {
    title: "Dashboard Overview",
    description: "Pantau kebutuhan UMKM, prioritaskan pool, dan kirim penawaran dari satu tempat.",
  };
}

export function SupplierShell({
  ownerName,
  profileCompletion,
  children,
}: Readonly<{
  ownerName: string;
  profileCompletion: number;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const header = pageHeader(pathname);
  const isActive = (href: string) => href === "/supplier"
    ? pathname === href
    : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#f6f8f5] font-[family-name:var(--font-worker-sans)] text-[#0c261c]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 bg-gradient-to-b from-[#00613f] via-[#005235] to-[#003f29] text-white lg:block">
        <div className="flex h-full flex-col px-5 py-8">
          <Link href="/supplier" className="flex items-center gap-3 px-2">
            <Image src="/Logo(Pull).svg" alt="Pull" width={40} height={40} priority className="h-10 w-10 rounded-lg" />
            <span>
              <span className="block text-2xl font-extrabold leading-none">Pull</span>
              <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/45">Supplier space</span>
            </span>
          </Link>

          <nav className="mt-7 flex-1 space-y-2" aria-label="Navigasi utama Supplier">
            {MENU.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors ${
                    active
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

          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <Sparkles className="h-5 w-5 text-[#b9dfc8]" />
            <p className="mt-3 text-xs font-extrabold">Demand diperbarui otomatis</p>
            <p className="mt-1.5 text-[10px] font-medium leading-5 text-white/55">Respons pool lebih awal agar peluang pasok tidak terlewat.</p>
          </div>

          <a
            href="https://wa.me/?text=Halo%20CS%20Pull%2C%20saya%20membutuhkan%20bantuan%20untuk%20akun%20supplier."
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center gap-3 border-t border-white/10 px-3 pt-4 text-sm font-bold text-white/90 transition-colors hover:text-white"
          >
            <CircleHelp className="h-4 w-4 shrink-0" />
            <span>Bantuan</span>
          </a>
        </div>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-[#e2ece6] bg-white px-4 py-5 shadow-sm shadow-emerald-950/5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-[#10231d]">{header.title}</h1>
            <p className="mt-2 max-w-[620px] text-sm font-medium leading-relaxed text-[#6b7b75]">{header.description}</p>
          </div>
          <ProfileMenu
            initials={supplierInitials(ownerName)}
            ownerName={ownerName}
            profileCompletion={profileCompletion}
            profileHref="/supplier/profile"
            activityHref="/supplier/demands"
            activityLabel="Peluang permintaan"
            completionLabel="profil supplier"
          />
        </header>

        <main className="mx-auto max-w-[1540px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:pb-16 xl:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[72px] grid-cols-4 border-t border-[#dfeae2] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(12,38,28,.07)] backdrop-blur-xl lg:hidden" aria-label="Navigasi Supplier seluler">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} className={`flex flex-col items-center justify-center gap-1 text-[9px] font-extrabold ${active ? "text-[#08783f]" : "text-[#6e9b7d]"}`}>
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
