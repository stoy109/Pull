"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  CircleHelp,
  HandCoins,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Search,
  Settings,
  Store,
  X,
} from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { supplierInitials } from "@/features/supplier/profile";

const MENU = [
  { label: "Hari ini", mobileLabel: "Hari ini", href: "/supplier", icon: LayoutDashboard, primary: true },
  { label: "Produk", mobileLabel: "Produk", href: "/supplier/products", icon: Package, primary: true },
  { label: "Peluang demand", mobileLabel: "Demand", href: "/supplier/demands", icon: Search, primary: true },
  { label: "Penawaran", mobileLabel: "Penawaran", href: "/supplier/offers", icon: HandCoins, primary: false },
  { label: "Transaksi", mobileLabel: "Transaksi", href: "/supplier/transactions", icon: ReceiptText, primary: true },
  { label: "Insight", mobileLabel: "Insight", href: "/supplier/insights", icon: BarChart3, primary: false },
  { label: "Toko & verifikasi", mobileLabel: "Toko", href: "/supplier/store", icon: Store, primary: false },
  { label: "Keuangan", mobileLabel: "Keuangan", href: "/supplier/finance", icon: Landmark, primary: false },
  { label: "Notifikasi", mobileLabel: "Notifikasi", href: "/supplier/notifications", icon: Bell, primary: false },
  { label: "Pengaturan", mobileLabel: "Pengaturan", href: "/supplier/settings", icon: Settings, primary: false },
] as const;

const HEADERS: Record<string, { title: string; description: string }> = {
  "/supplier/products": { title: "Produk", description: "Kelola katalog, harga, stok, minimum pemesanan, dan status jual." },
  "/supplier/demands": { title: "Peluang demand", description: "Tinjau pool nyata berdasarkan tier harga, kuantitas, lokasi, dan tenggat." },
  "/supplier/offers": { title: "Penawaran", description: "Pantau penawaran yang sudah dikirim terhadap pool permintaan." },
  "/supplier/transactions": { title: "Transaksi", description: "Terima pesanan dan perbarui proses pemenuhan sampai barang dikirim." },
  "/supplier/insights": { title: "Insight demand", description: "Baca tren demand 7 dan 30 hari dari riwayat pool yang tersedia." },
  "/supplier/store": { title: "Toko & profil", description: "Periksa identitas supplier, status KYC, dan indikator kepercayaan usaha." },
  "/supplier/profile": { title: "Toko & profil", description: "Periksa identitas supplier, status KYC, dan indikator kepercayaan usaha." },
  "/supplier/finance": { title: "Keuangan", description: "Pantau total pesanan selesai, nilai tertunda, dan riwayat order." },
  "/supplier/notifications": { title: "Notifikasi", description: "Tindak lanjuti perubahan pool, pesanan, rating, dan informasi sistem." },
  "/supplier/settings": { title: "Pengaturan", description: "Atur jenis notifikasi yang ingin diterima akun supplier." },
  "/supplier": { title: "Bisnis hari ini", description: "Prioritaskan stok, peluang demand, dan pesanan yang perlu tindakan." },
};

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
  const [moreOpen, setMoreOpen] = useState(false);
  const header = HEADERS[pathname] ?? HEADERS["/supplier"];
  const primaryItems = MENU.filter((item) => item.primary);
  const moreItems = MENU.filter((item) => !item.primary);
  const isActive = (href: string) => href === "/supplier" ? pathname === href : pathname.startsWith(href);
  const moreActive = moreItems.some((item) => isActive(item.href));

  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f8f5] font-[family-name:var(--font-worker-sans)] text-[#0c261c]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-gradient-to-b from-[#00613f] via-[#005235] to-[#003f29] text-white lg:block">
        <div className="flex h-full flex-col px-5 py-7">
          <Link href="/supplier" className="flex items-center gap-3 px-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <Image src="/Logo(Pull).svg" alt="Pull" width={40} height={40} priority className="h-10 w-10 rounded-lg" />
            <span>
              <span className="block text-2xl font-extrabold leading-none">Pull</span>
              <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-[.16em] text-white/50">Supplier space</span>
            </span>
          </Link>

          <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Navigasi utama supplier">
            {MENU.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white ${active ? "bg-[#0e9855] text-white shadow-lg shadow-emerald-950/20" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <a href="https://wa.me/?text=Halo%20CS%20Pull%2C%20saya%20membutuhkan%20bantuan%20untuk%20akun%20supplier." target="_blank" rel="noreferrer" className="mt-4 flex min-h-11 items-center gap-3 border-t border-white/10 px-3 pt-4 text-xs font-bold text-white/80 hover:text-white">
            <CircleHelp className="h-4 w-4" /> Bantuan
          </a>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-[#e2ece6] bg-white/95 px-4 py-4 shadow-sm shadow-emerald-950/5 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold leading-tight text-[#10231d] sm:text-3xl">{header.title}</h1>
              <p className="mt-1 hidden max-w-[680px] text-xs font-medium leading-relaxed text-[#6b7b75] sm:block">{header.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/supplier/notifications" aria-label="Buka notifikasi" className="grid h-11 w-11 place-items-center rounded-full border border-[#dce6e0] bg-white text-[#426657] transition hover:border-[#9fc9b0] hover:text-[#08783f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f]"><Bell className="h-4.5 w-4.5" /></Link>
              <Link href="/supplier/store" aria-label={`Buka profil ${ownerName}`} className="flex h-11 items-center gap-2 rounded-full border border-[#dce6e0] bg-white p-1 pr-3 transition hover:border-[#9fc9b0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f]">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#08783f] text-xs font-extrabold text-white">{supplierInitials(ownerName)}</span>
                <span className="hidden max-w-32 truncate text-xs font-extrabold text-[#163c2b] md:block">{ownerName}</span>
                <span className="sr-only">Profil {profileCompletion}% lengkap</span>
              </Link>
              <form action={signOutAction} className="hidden sm:block">
                <button type="submit" aria-label="Keluar" className="grid h-11 w-11 place-items-center rounded-full border border-[#dce6e0] bg-white text-[#7a5248] transition hover:border-[#e0b6aa] hover:text-[#a7462d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7462d]"><LogOut className="h-4 w-4" /></button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1540px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:pb-16 xl:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[72px] grid-cols-5 border-t border-[#dfeae2] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(12,38,28,.07)] backdrop-blur-xl lg:hidden" aria-label="Navigasi supplier seluler">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex flex-col items-center justify-center gap-1 text-[9px] font-extrabold focus-visible:outline-2 focus-visible:outline-[#08783f] ${active ? "text-[#08783f]" : "text-[#6e9b7d]"}`}><Icon className="h-[18px] w-[18px]" /><span>{item.mobileLabel}</span></Link>;
        })}
        <button type="button" aria-haspopup="dialog" aria-expanded={moreOpen} aria-controls="supplier-more-menu" onClick={() => setMoreOpen(true)} className={`flex flex-col items-center justify-center gap-1 text-[9px] font-extrabold focus-visible:outline-2 focus-visible:outline-[#08783f] ${moreActive ? "text-[#08783f]" : "text-[#6e9b7d]"}`}><Menu className="h-[18px] w-[18px]" /><span>Lainnya</span></button>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Tutup menu lainnya" onClick={() => setMoreOpen(false)} className="absolute inset-0 bg-[#0c261c]/45 backdrop-blur-[2px]" />
          <section id="supplier-more-menu" role="dialog" aria-modal="true" aria-labelledby="supplier-more-title" className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[24px] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-24px_60px_rgba(12,38,28,.22)]">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#dce6e0]" />
            <div className="flex items-center justify-between">
              <div><p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#507f63]">Supplier space</p><h2 id="supplier-more-title" className="mt-1 text-lg font-extrabold text-[#10231d]">Menu lainnya</h2></div>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Tutup" className="grid h-10 w-10 place-items-center rounded-full bg-[#f0f5f2] text-[#426657] focus-visible:outline-2 focus-visible:outline-[#08783f]"><X className="h-5 w-5" /></button>
            </div>
            <nav className="mt-5 grid grid-cols-2 gap-3" aria-label="Menu supplier lainnya">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} aria-current={active ? "page" : undefined} className={`flex min-h-24 flex-col justify-between rounded-2xl border p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f] ${active ? "border-[#8bc3a1] bg-[#edf8f0] text-[#08783f]" : "border-[#dfeae2] bg-[#fbfdfc] text-[#315b48]"}`}><Icon className="h-5 w-5" /><span className="text-xs font-extrabold">{item.label}</span></Link>;
              })}
              <form action={signOutAction} className="col-span-2"><button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#efd6ce] bg-[#fff7f4] text-xs font-extrabold text-[#a7462d]"><LogOut className="h-4 w-4" />Keluar</button></form>
            </nav>
          </section>
        </div>
      ) : null}
    </div>
  );
}
