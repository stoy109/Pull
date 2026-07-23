import { Boxes, ChevronDown, Package, PackagePlus, TriangleAlert } from "lucide-react";
import { upsertSupplierProductAction } from "@/features/supplier/actions";
import { getSupplierWorkspace } from "@/features/supplier/data";
import {
  ActionNotice,
  cardClass,
  DataState,
  EmptyState,
  formatCurrency,
  formatNumber,
  inputClass,
  primaryButtonClass,
  SectionHeading,
  StatCard,
  StatusBadge,
  textareaClass,
} from "@/features/supplier/components/supplier-ui";
import type { SupplierProduct } from "@/features/supplier/workspace";

function ProductFields({ product }: { product?: SupplierProduct }) {
  return (
    <>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Nama produk<input className={inputClass} name="itemName" required minLength={3} maxLength={100} defaultValue={product?.itemName} placeholder="Contoh: Kain katun 30s" /></label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Kategori<input className={inputClass} name="category" required minLength={2} maxLength={80} defaultValue={product?.category} placeholder="Bahan baku tekstil" /></label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Satuan<input className={inputClass} name="unit" required maxLength={30} defaultValue={product?.unit} placeholder="kg, pcs, meter" /></label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Harga satuan<input className={inputClass} name="unitPrice" type="number" inputMode="decimal" required min="0.01" step="0.01" defaultValue={product?.unitPrice} /></label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Stok tersedia<input className={inputClass} name="stockQuantity" type="number" inputMode="decimal" required min="0" step="0.001" defaultValue={product?.stockQuantity ?? 0} /></label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Minimum pemesanan (MOQ)<input className={inputClass} name="minOrderQuantity" type="number" inputMode="decimal" required min="0.001" step="0.001" defaultValue={product?.minOrderQuantity ?? 1} /></label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e] sm:col-span-2">Status<select className={inputClass} name="status" defaultValue={product?.status ?? "active"}><option value="active">Aktif dijual</option><option value="inactive">Nonaktif</option></select></label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e] sm:col-span-2">Deskripsi<textarea className={textareaClass} name="description" maxLength={1000} defaultValue={product?.description} placeholder="Spesifikasi, kualitas, atau catatan pengiriman" /></label>
      </div>
      <button type="submit" className={`${primaryButtonClass} mt-5 w-full sm:w-auto`}>{product ? "Simpan perubahan" : "Tambahkan produk"}</button>
    </>
  );
}

export default async function SupplierProductsPage({ searchParams }: { searchParams: Promise<{ result?: string | string[] }> }) {
  const [{ status, workspace }, params] = await Promise.all([getSupplierWorkspace(), searchParams]);
  if (status !== "ready") return <DataState status={status} />;
  const active = workspace.products.filter((product) => product.status === "active");
  const stockTotal = workspace.products.reduce((sum, product) => sum + product.stockQuantity, 0);
  const warnings = active.filter((product) => product.stockQuantity <= product.minOrderQuantity);
  const verified = workspace.profile.verificationLevel >= 2 && workspace.profile.kycStatus === "verified";

  return (
    <>
      <ActionNotice result={params.result} />
      {!verified ? <p className="mb-5 rounded-xl border border-[#efd8ad] bg-[#fff8e9] px-4 py-3 text-xs font-bold text-[#76581c]">Katalog tetap dapat dikelola. Verifikasi KYC diperlukan untuk mengirim penawaran dan memproses pesanan. <a href="/supplier/store" className="font-extrabold text-[#087447] underline">Buka verifikasi</a>.</p> : null}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total katalog" value={formatNumber(workspace.products.length)} detail="Produk milik akun supplier" icon={Package} />
        <StatCard label="Produk aktif" value={formatNumber(active.length)} detail="Saat ini dapat dipilih untuk order" icon={Boxes} />
        <StatCard label="Peringatan stok" value={formatNumber(warnings.length)} detail="Stok berada pada atau di bawah MOQ" icon={TriangleAlert} tone={warnings.length ? "orange" : "green"} />
      </section>

      <details className={`${cardClass} group mt-5 p-5 sm:p-6`}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#08783f]">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#e8f5ec] text-[#08783f]"><PackagePlus className="h-5 w-5" /></span><div><p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#507f63]">Katalog</p><h2 className="mt-1 text-lg font-extrabold text-[#163c2b]">Tambah produk</h2></div></div>
          <ChevronDown className="h-5 w-5 text-[#507f63] transition group-open:rotate-180" />
        </summary>
        <form action={upsertSupplierProductAction} className="mt-6 border-t border-[#e3ece6] pt-5"><ProductFields /></form>
      </details>

      <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <SectionHeading eyebrow="Katalog supplier" title="Produk tersimpan" description={`Total stok tercatat ${formatNumber(stockTotal)} dalam satuan produk masing-masing.`} />
        {workspace.products.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {workspace.products.map((product) => {
              const warning = product.status === "active" && product.stockQuantity <= product.minOrderQuantity;
              return (
                <article key={product.id} className="rounded-2xl border border-[#dfeae2] bg-[#fcfdfc] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-[.1em] text-[#6b7b75]">{product.category || "Tanpa kategori"}</p><h3 className="mt-1.5 truncate text-base font-extrabold text-[#163c2b]">{product.itemName}</h3></div><StatusBadge status={product.status} /></div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white p-3"><dt className="text-[9px] font-bold text-[#6b7b75]">Harga</dt><dd className="mt-1 text-xs font-extrabold text-[#163c2b]">{formatCurrency(product.unitPrice)}</dd></div><div className={`rounded-xl p-3 ${warning ? "bg-[#fff0df]" : "bg-white"}`}><dt className="text-[9px] font-bold text-[#6b7b75]">Stok</dt><dd className={`mt-1 text-xs font-extrabold ${warning ? "text-[#b35e16]" : "text-[#163c2b]"}`}>{formatNumber(product.stockQuantity)} {product.unit}</dd></div><div className="rounded-xl bg-white p-3"><dt className="text-[9px] font-bold text-[#6b7b75]">MOQ</dt><dd className="mt-1 text-xs font-extrabold text-[#163c2b]">{formatNumber(product.minOrderQuantity)} {product.unit}</dd></div></dl>
                  {product.description ? <p className="mt-4 text-[10px] font-medium leading-5 text-[#6b7b75]">{product.description}</p> : null}
                  <details className="group/edit mt-4 border-t border-[#e3ece6] pt-4"><summary className="flex cursor-pointer list-none items-center justify-between text-xs font-extrabold text-[#08783f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f]">Edit produk <ChevronDown className="h-4 w-4 transition group-open/edit:rotate-180" /></summary><form action={upsertSupplierProductAction} className="mt-5"><ProductFields product={product} /></form></details>
                </article>
              );
            })}
          </div>
        ) : <EmptyState title="Katalog masih kosong" description="Tambahkan produk pertama untuk mencatat harga, stok, dan minimum pemesanan." />}
      </section>
    </>
  );
}
