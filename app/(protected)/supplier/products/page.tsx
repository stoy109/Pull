import { BadgePercent, Package, Save } from "lucide-react";
import { upsertSupplierProductAction } from "@/features/supplier/actions";
import { getSupplierWorkspace } from "@/features/supplier/data";
import {
  ActionNotice,
  cardClass,
  DataState,
  inputClass,
  primaryButtonClass,
} from "@/features/supplier/components/supplier-ui";
import type { SupplierProduct } from "@/features/supplier/workspace";

function ProductFields({ product }: { product?: SupplierProduct }) {
  return (
    <form action={upsertSupplierProductAction} className="mt-6 border-t border-[#e3ece6] pt-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">
          Nama bahan baku
          <input className={inputClass} name="itemName" required minLength={3} maxLength={100} defaultValue={product?.itemName} placeholder="Contoh: Kain katun 30s" />
        </label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">
          Satuan
          <input className={inputClass} name="unit" required maxLength={30} defaultValue={product?.unit} placeholder="kg, liter, pcs" />
        </label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">
          Harga per satuan
          <input className={inputClass} name="unitPrice" type="number" inputMode="decimal" required min="0.01" step="0.01" defaultValue={product?.unitPrice} placeholder="0" />
        </label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">
          Jumlah tersedia
          <input className={inputClass} name="stockQuantity" type="number" inputMode="decimal" required min="0" step="0.001" defaultValue={product?.stockQuantity ?? 0} />
        </label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">
          Diskon supplier
          <span className="relative">
            <input className={`${inputClass} pr-10`} name="targetDiscount" type="number" inputMode="decimal" required min="0" max="99" step="0.1" defaultValue={product?.targetDiscount ?? 0} />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-extrabold text-[#507f63]">%</span>
          </span>
          <span className="text-[9px] font-medium leading-4 text-[#718078]">Persentase diskon setelah ambang jumlah tercapai.</span>
        </label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">
          Minimum jumlah untuk diskon
          <input className={inputClass} name="minimumDiscountQuantity" type="number" inputMode="decimal" required min="0.001" step="0.001" defaultValue={product?.minOrderQuantity ?? 1} />
          <span className="text-[9px] font-medium leading-4 text-[#718078]">Total item yang harus terkumpul dalam satu pool agar harga diskon berlaku.</span>
        </label>
      </div>
      <button type="submit" className={`${primaryButtonClass} mt-6 w-full sm:w-auto`}>
        <Save className="h-4 w-4" /> {product ? "Simpan perubahan" : "Simpan bahan baku"}
      </button>
    </form>
  );
}

export default async function SupplierProductsPage({ searchParams }: { searchParams: Promise<{ result?: string | string[] }> }) {
  const [{ status, workspace }, params] = await Promise.all([getSupplierWorkspace(), searchParams]);
  if (status !== "ready") return <DataState status={status} />;
  const product = workspace.products[0];
  const verified = workspace.profile.verificationLevel >= 2 && workspace.profile.kycStatus === "verified";

  return (
    <>
      <ActionNotice result={params.result} />
      {!verified ? <p className="mb-5 rounded-xl border border-[#efd8ad] bg-[#fff8e9] px-4 py-3 text-xs font-bold text-[#76581c]">Katalog bahan baku tetap dapat dikelola. Verifikasi KYC diperlukan untuk memproses pesanan. <a href="/supplier/store" className="font-extrabold text-[#087447] underline">Buka verifikasi</a>.</p> : null}
      <section className={`${cardClass} p-5 sm:p-7`}>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#e8f5ec] text-[#08783f]"><Package className="h-5 w-5" /></span>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#507f63]">Katalog tunggal</p>
              <h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-.03em] text-[#10231d]">{product ? "Edit bahan baku" : "Tambahkan bahan baku"}</h2>
              <p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-[#6b7b75]">Setiap akun supplier hanya dapat menyimpan satu bahan baku. Setelah tersimpan, form ini akan memperbarui item yang sama—bukan menambah katalog baru.</p>
            </div>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full px-3 py-2 text-[10px] font-extrabold ${product ? "bg-[#e8f5ec] text-[#08783f]" : "bg-[#f1f4f2] text-[#607069]"}`}>
            <BadgePercent className="h-3.5 w-3.5" /> {product ? "1 dari 1 terisi" : "0 dari 1 terisi"}
          </span>
        </header>
        <ProductFields product={product} />
      </section>
    </>
  );
}
