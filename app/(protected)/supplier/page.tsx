import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  LayoutDashboard,
  PackageCheck,
  Settings,
  Store,
  Truck,
} from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { createSupplierOfferAction } from "@/features/collaboration/actions";
import { requireRole } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

const SUPPLIER_NAV_ITEMS = [
  { icon: Boxes, label: "Penawaran" },
  { icon: PackageCheck, label: "Pesanan Pool" },
  { icon: Truck, label: "Pengiriman" },
  { icon: Store, label: "Profil Supplier" },
];

function readMetadata(metadata: Record<string, unknown>, key: string, fallback: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export default async function SupplierDashboardPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const { user } = await requireRole(["supplier"]);
  const params = await searchParams;
  const supabase = await createClient();
  const { data: offers } = await supabase.from("supplier_offers").select("id,item_name,unit,unit_price,status").eq("supplier_id", user.id).order("created_at", { ascending: false }).limit(10);
  const metadata = user.user_metadata ?? {};
  const ownerName = readMetadata(metadata, "display_name", "Mitra Supplier");
  const businessName = readMetadata(metadata, "business_name", "Supplier Pull");

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#1f3029]">
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-[#43331e] px-5 py-7 text-white lg:block">
        <Link href="/supplier" className="flex items-center gap-3 px-2">
          <Image src="/Logo(Pull).svg" alt="Pull" width={40} height={40} className="rounded-xl" priority />
          <div>
            <p className="text-xl font-extrabold">Pull</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#f2d8a6]">Supplier Space</p>
          </div>
        </Link>
        <nav className="mt-9 space-y-2" aria-label="Navigasi Supplier">
          <Link href="/supplier" className="flex min-h-11 items-center gap-3 rounded-xl bg-[#d69238] px-3 text-sm font-extrabold">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          {SUPPLIER_NAV_ITEMS.map(({ icon: Icon, label }) => (
            <span key={label} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/50" aria-disabled="true">
              <Icon className="h-4 w-4" /> {label}
            </span>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-60">
        <header className="border-b border-[#e5dfd2] bg-white px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#9b6b2c]">Dashboard Supplier</p>
              <h1 className="mt-1 text-2xl font-extrabold">{businessName}</h1>
            </div>
            <form action={signOutAction}>
              <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dfd5c4] px-4 text-xs font-extrabold text-[#675237] transition hover:bg-[#faf7f1]">
                <Settings className="h-4 w-4" /> Keluar
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
          <section className="rounded-[24px] border border-[#ead7b9] bg-[linear-gradient(120deg,#fffaf0_0%,#f8ebd2_100%)] p-6 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#a26822]">Ruang kerja berbeda</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#3c2c19]">Halo, {ownerName}</h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#74644f]">
              Buat penawaran bahan nyata. Data tersimpan di Supabase dan aktivitasnya langsung terbaca Administrator.
            </p>
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
            <form action={createSupplierOfferAction} className="rounded-[20px] border border-[#e5dfd2] bg-white p-5 shadow-sm">
              <Boxes className="h-5 w-5 text-[#bd7828]" />
              <h2 className="mt-4 text-lg font-extrabold">Buat penawaran supplier</h2>
              {params.success ? <p className="mt-3 rounded-xl bg-[#eef8ed] p-3 text-xs font-bold text-[#47772f]">Penawaran berhasil disimpan.</p> : null}
              {params.error ? <p className="mt-3 rounded-xl bg-[#fff0f0] p-3 text-xs font-bold text-[#b43e48]">Periksa data penawaran.</p> : null}
              <input name="itemName" required minLength={3} maxLength={100} placeholder="Nama bahan, mis. Minyak Goreng" className="mt-4 h-11 w-full rounded-xl border border-[#e1d8ca] px-4 text-xs" />
              <div className="mt-3 grid grid-cols-2 gap-3"><input name="unit" required maxLength={30} placeholder="Satuan (karton)" className="h-11 rounded-xl border border-[#e1d8ca] px-4 text-xs" /><input name="unitPrice" required type="number" min="1" step="100" placeholder="Harga/satuan" className="h-11 rounded-xl border border-[#e1d8ca] px-4 text-xs" /></div>
              <button className="mt-4 h-11 w-full rounded-xl bg-[#b87427] text-xs font-extrabold text-white">Simpan penawaran</button>
            </form>
            <div className="rounded-[20px] border border-[#e5dfd2] bg-white p-5">
              <h2 className="text-lg font-extrabold">Penawaran aktif ({offers?.length ?? 0})</h2>
              <div className="mt-4 space-y-3">{offers?.length ? offers.map((offer) => <article key={offer.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#eee5d8] p-4"><div><p className="text-sm font-extrabold">{offer.item_name}</p><p className="mt-1 text-[10px] text-[#796954]">Per {offer.unit}</p></div><p className="text-sm font-extrabold text-[#a7651e]">Rp{Number(offer.unit_price).toLocaleString("id-ID")}</p></article>) : <p className="py-10 text-center text-xs text-[#7c6f5c]">Belum ada penawaran database.</p>}</div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
