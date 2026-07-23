import Link from "next/link";
import {
  ExternalLink,
  ImageIcon,
  MapPin,
  PackagePlus,
  ShieldCheck,
  Store,
} from "lucide-react";
import {
  upsertBusinessProductAction,
  upsertBusinessProfileAction,
} from "../actions";
import { formatCurrency, formatDate } from "../format";
import type { BusinessProduct, ProfileWorkspace } from "../types";
import {
  ActionNotice,
  DashboardFrame,
  DataErrorPanel,
  Field,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "./dashboard-frame";

function ProductFields({ product }: { product?: BusinessProduct }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {product ? <input type="hidden" name="productId" value={product.id} /> : null}
      <Field label="Nama produk *"><input className={inputClass} defaultValue={product?.name} maxLength={120} minLength={2} name="name" required /></Field>
      <Field label="Kategori *"><input className={inputClass} defaultValue={product?.category} maxLength={80} minLength={2} name="category" required /></Field>
      <Field label="Satuan *"><input className={inputClass} defaultValue={product?.unit} maxLength={30} name="unit" placeholder="pcs, kg, paket" required /></Field>
      <Field label="Harga *"><input className={inputClass} defaultValue={product?.price} min="0" name="price" required step="0.01" type="number" /></Field>
      <Field className="sm:col-span-2" label="URL gambar" hint="Gunakan URL HTTP atau HTTPS yang dapat diakses publik."><input className={inputClass} defaultValue={product?.imageUrl ?? ""} name="imageUrl" type="url" /></Field>
      <Field className="sm:col-span-2" label="Deskripsi"><textarea className={textareaClass} defaultValue={product?.description ?? ""} maxLength={1000} name="description" /></Field>
      <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#dce7e1] bg-[#f8fbf9] p-3 text-xs font-bold text-[#315b4c]">
        <input className="h-4 w-4 accent-[#087447]" defaultChecked={product?.isActive ?? true} name="isActive" type="checkbox" />
        Tampilkan produk di storefront publik
      </label>
    </div>
  );
}

function ProductCard({ product }: { product: BusinessProduct }) {
  return (
    <article className="overflow-hidden rounded-[20px] border border-[#dce7e1] bg-white shadow-[0_7px_22px_rgba(18,59,48,.04)]">
      {product.imageUrl ? (
        <div className="aspect-video bg-[#eaf1ed] bg-cover bg-center" role="img" aria-label={`Gambar ${product.name}`} style={{ backgroundImage: `url(${JSON.stringify(product.imageUrl)})` }} />
      ) : (
        <div className="grid aspect-video place-items-center bg-[#edf4f0] text-[#78a08d]"><ImageIcon className="h-9 w-9" /></div>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div><h3 className="text-sm font-extrabold text-[#17362a]">{product.name}</h3><p className="mt-1 text-[10px] font-bold text-[#718078]">{product.category}</p></div>
          <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${product.isActive ? "bg-[#e7f5eb] text-[#17683a]" : "bg-[#eef0ef] text-[#68756f]"}`}>{product.isActive ? "Tampil" : "Disembunyikan"}</span>
        </div>
        <p className="mt-3 text-base font-extrabold text-[#087447]">{formatCurrency(product.price)} <span className="text-[10px] font-semibold text-[#718078]">/ {product.unit}</span></p>
        {product.description ? <p className="mt-2 text-[10px] font-medium leading-5 text-[#64746c]">{product.description}</p> : null}
        <p className="mt-3 text-[9px] font-semibold text-[#89958f]">Diperbarui {formatDate(product.updatedAt)}</p>
        <details className="group mt-4 rounded-xl border border-[#dce7e1]">
          <summary className="cursor-pointer list-none px-3 py-2.5 text-center text-[10px] font-extrabold text-[#087447]">Edit produk</summary>
          <form action={upsertBusinessProductAction} className="border-t border-[#e3ebe6] p-3">
            <ProductFields product={product} />
            <button className={`${primaryButtonClass} mt-4 w-full`}>Simpan produk</button>
          </form>
        </details>
      </div>
    </article>
  );
}

export function ProfilePageView({
  error,
  identity,
  notice,
  workspace,
}: {
  error: string | null;
  identity: Parameters<typeof DashboardFrame>[0]["identity"];
  notice: { error?: string; success?: string };
  workspace: ProfileWorkspace | null;
}) {
  return (
    <DashboardFrame identity={identity}>
      <ActionNotice {...notice} />
      {error || !workspace ? (
        <DataErrorPanel message={error ?? "Profil bisnis belum tersedia."} />
      ) : (
        <div className="space-y-5">
          <section className="overflow-hidden rounded-[22px] border border-[#dce7e1] bg-white shadow-sm">
            <div className="h-28 bg-[linear-gradient(115deg,#075f3b,#0d8a50_55%,#9bc85b)] sm:h-36" />
            <div className="relative p-5 pt-14 sm:p-6 sm:pt-6 sm:pl-40">
              <span className="absolute -top-10 left-5 grid h-20 w-20 place-items-center rounded-2xl border-4 border-white bg-[#e6f2e9] text-[#087447] shadow-lg sm:-top-12 sm:left-7 sm:h-24 sm:w-24">
                <Store className="h-10 w-10" />
              </span>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-[#10231d]">{workspace.profile.businessName}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${workspace.profile.storefrontEnabled ? "bg-[#e7f5eb] text-[#17683a]" : "bg-[#fff2dd] text-[#94620d]"}`}>{workspace.profile.storefrontEnabled ? "Storefront aktif" : "Storefront nonaktif"}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-[#718078]">
                    {workspace.profile.category ? <span>{workspace.profile.category}</span> : null}
                    {workspace.profile.district ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{workspace.profile.district}</span> : null}
                    <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />WhatsApp {workspace.profile.whatsappVerified ? "terverifikasi" : "belum terverifikasi"}</span>
                  </div>
                </div>
                {workspace.profile.storefrontEnabled ? (
                  <Link className={secondaryButtonClass} href={`/umkm/${workspace.profile.publicSlug}`} target="_blank">Lihat profil publik <ExternalLink className="ml-2 h-4 w-4" /></Link>
                ) : (
                  <p className="rounded-xl bg-[#fff7e8] px-3 py-2 text-[10px] font-bold text-[#76581c]">Aktifkan storefront agar profil publik dapat dibuka.</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[22px] border border-[#dce7e1] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-extrabold text-[#10231d]">Informasi storefront</h2>
            <p className="mt-1 text-xs font-medium leading-5 text-[#718078]">Nomor WhatsApp hanya dipakai oleh redirect aman dan tidak ditampilkan pada profil publik.</p>
            <form action={upsertBusinessProfileAction} className="mt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Slug publik *" hint="Huruf kecil, angka, dan tanda hubung. Contoh: kopi-makmur"><input className={inputClass} defaultValue={workspace.profile.publicSlug} maxLength={80} minLength={3} name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></Field>
                <Field label="Nama usaha *"><input className={inputClass} defaultValue={workspace.profile.businessName} maxLength={120} minLength={2} name="businessName" required /></Field>
                <Field label="Kategori"><input className={inputClass} defaultValue={workspace.profile.category ?? ""} maxLength={80} name="category" /></Field>
                <Field label="Kecamatan"><input className={inputClass} defaultValue={workspace.profile.district ?? ""} maxLength={120} name="district" /></Field>
                <Field className="sm:col-span-2" label="Alamat"><input className={inputClass} defaultValue={workspace.profile.address ?? ""} maxLength={300} name="address" /></Field>
                <Field className="sm:col-span-2" label="Deskripsi"><textarea className={textareaClass} defaultValue={workspace.profile.description ?? ""} maxLength={1500} name="description" /></Field>
                <Field label="Nomor WhatsApp" hint="Perubahan nomor menghapus status verifikasi sampai diverifikasi kembali."><input className={inputClass} defaultValue={workspace.profile.whatsapp ?? ""} inputMode="tel" name="whatsapp" type="tel" /></Field>
                <Field label="Website HTTPS"><input className={inputClass} defaultValue={workspace.profile.websiteUrl ?? ""} name="websiteUrl" type="url" /></Field>
                <Field label="URL logo"><input className={inputClass} defaultValue={workspace.profile.logoUrl ?? ""} name="logoUrl" type="url" /></Field>
                <Field label="URL cover"><input className={inputClass} defaultValue={workspace.profile.coverUrl ?? ""} name="coverUrl" type="url" /></Field>
                <Field label="Latitude"><input className={inputClass} defaultValue={workspace.profile.latitude ?? ""} max="90" min="-90" name="latitude" step="0.000001" type="number" /></Field>
                <Field label="Longitude"><input className={inputClass} defaultValue={workspace.profile.longitude ?? ""} max="180" min="-180" name="longitude" step="0.000001" type="number" /></Field>
                <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#dce7e1] bg-[#f8fbf9] p-3 text-xs font-bold text-[#315b4c]">
                  <input className="h-4 w-4 accent-[#087447]" defaultChecked={workspace.profile.storefrontEnabled} name="storefrontEnabled" type="checkbox" />
                  Aktifkan storefront publik
                </label>
              </div>
              <button className={`${primaryButtonClass} mt-5 w-full sm:w-auto`}>Simpan profil</button>
            </form>
          </section>

          <section className="rounded-[22px] border border-[#dce7e1] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div><h2 className="text-lg font-extrabold text-[#10231d]">Produk storefront</h2><p className="mt-1 text-xs font-medium text-[#718078]">{workspace.products.length} produk tersimpan, termasuk produk yang disembunyikan.</p></div>
            </div>
            <details className="group mt-5 rounded-2xl border border-[#bcd3c5] bg-[#f8fbf9]">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-xs font-extrabold text-[#087447]"><PackagePlus className="h-4 w-4" />Tambah produk</summary>
              <form action={upsertBusinessProductAction} className="border-t border-[#dce7e1] bg-white p-4">
                <ProductFields />
                <button className={`${primaryButtonClass} mt-4 w-full sm:w-auto`}>Simpan produk baru</button>
              </form>
            </details>
            {workspace.products.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{workspace.products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-[#cbdad2] p-8 text-center text-sm font-semibold text-[#718078]">Belum ada produk. Tambahkan produk pertama untuk storefront publik.</p>
            )}
          </section>
        </div>
      )}
    </DashboardFrame>
  );
}
