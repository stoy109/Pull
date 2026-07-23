import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Eye,
  ExternalLink,
  Globe2,
  ImageIcon,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import { formatCurrency, formatDate, formatNumber } from "../format";
import type { PublicUmkmProfile } from "../types";

function background(url: string | null) {
  return url ? { backgroundImage: `url(${JSON.stringify(url)})` } : undefined;
}

export function PublicProfileError({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f7f4] p-5 font-(family-name:--font-worker-sans)">
      <section className="w-full max-w-xl rounded-3xl border border-[#dce7e1] bg-white p-8 text-center shadow-sm">
        <ShieldCheck className="mx-auto h-10 w-10 text-[#087447]" />
        <h1 className="mt-4 text-xl font-extrabold text-[#10231d]">Profil belum dapat ditampilkan</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-[#6b7b75]">{message}</p>
        <Link className="mt-5 inline-flex h-11 items-center rounded-xl bg-[#087447] px-5 text-xs font-extrabold text-white" href="/">Kembali ke Pull</Link>
      </section>
    </main>
  );
}

export function PublicProfilePageView({
  contactStatus,
  profile,
}: {
  contactStatus?: string;
  profile: PublicUmkmProfile;
}) {
  const location = [profile.address, profile.district].filter(Boolean).join(", ");
  const verified = profile.verificationLevel > 0;
  const whatsappHref = `/contact/umkm/${profile.slug}?channel=whatsapp`;
  const websiteHref = `/contact/umkm/${profile.slug}?channel=website`;

  return (
    <div className="min-h-screen bg-[#f4f7f4] font-(family-name:--font-worker-sans) text-pull-950">
      <header className="sticky top-0 z-30 border-b border-[#dfe9e3] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-310 items-center justify-between px-4 sm:px-6">
          <Link className="flex items-center gap-2.5" href="/" aria-label="Beranda Pull">
            <Image className="h-9.5 w-9.5 rounded-lg" height={38} priority src="/Logo(Pull).svg" width={38} alt="Pull" />
            <span className="text-xl font-extrabold text-[#0c4f36]">Pull</span>
          </Link>
          <Link className="inline-flex h-10 items-center rounded-xl border border-[#cfe0d6] px-4 text-xs font-extrabold text-[#315b4c] hover:bg-[#f0f7f3]" href="/">Kembali ke Pull</Link>
        </div>
      </header>

      <main className="mx-auto max-w-310 px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
        {contactStatus ? (
          <p className="mb-5 rounded-2xl border border-[#ecd8aa] bg-[#fff8e8] px-4 py-3 text-xs font-bold text-[#76581c]">
            {contactStatus === "setup" ? "Fitur kontak belum siap karena migration inti belum diterapkan." : "Tujuan kontak tidak tersedia atau belum terverifikasi."}
          </p>
        ) : null}

        <section className="overflow-hidden rounded-3xl border border-[#dce7e1] bg-white shadow-[0_18px_50px_rgba(12,38,28,.08)]">
          <div
            className={`relative h-55 bg-cover bg-center sm:h-80 ${profile.coverUrl ? "bg-[#dce9e1]" : "bg-[linear-gradient(120deg,#075c3a,#0b8650_60%,#a4cc63)]"}`}
            role={profile.coverUrl ? "img" : undefined}
            aria-label={profile.coverUrl ? `Cover ${profile.businessName}` : undefined}
            style={background(profile.coverUrl)}
          >
            <div className="absolute inset-0 bg-linear-to-t from-[#082d20]/75 via-[#082d20]/5 to-[#082d20]/15" />
            {verified ? <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#082d20]/70 px-3 py-2 text-xs font-extrabold text-white backdrop-blur-sm"><BadgeCheck className="h-4 w-4" />Verifikasi level {profile.verificationLevel}</span> : null}
          </div>

          <div className="relative px-5 pb-7 pt-18.5 sm:px-8 sm:pb-8 sm:pl-52.5 sm:pt-7">
            <div
              className="absolute -top-16.5 left-5 grid h-33 w-33 place-items-center overflow-hidden rounded-full border-[6px] border-white bg-[#e5f1e8] bg-cover bg-center text-[#087447] shadow-[0_12px_28px_rgba(12,38,28,.16)] sm:left-9"
              role={profile.logoUrl ? "img" : undefined}
              aria-label={profile.logoUrl ? `Logo ${profile.businessName}` : undefined}
              style={background(profile.logoUrl)}
            >
              {!profile.logoUrl ? <Store className="h-12 w-12" /> : null}
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-pull-950 sm:text-[34px]">{profile.businessName}</h1>
                  {verified ? <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7ed] px-2.5 py-1 text-[11px] font-extrabold text-[#07843f]"><BadgeCheck className="h-3.5 w-3.5" />Terverifikasi</span> : null}
                </div>
                {profile.headline ? <p className="mt-2 text-sm font-extrabold text-[#315b4c]">{profile.headline}</p> : null}
                {profile.description ? <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-[#64766e]">{profile.description}</p> : null}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#64766e]">
                  {profile.category ? <span className="inline-flex items-center gap-1.5"><Store className="h-4 w-4 text-[#16864c]" />{profile.category}</span> : null}
                  {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#16864c]" />{location}</span> : null}
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#16864c]" />Trust score {formatNumber(profile.trustScore)}/100</span>
                  <span className="inline-flex items-center gap-1.5 text-[#8a641d]"><Star className="h-4 w-4 fill-[#f7bd38] text-[#f7bd38]" />{profile.ratingCount} rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-[20px] border border-[#dce7e1] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-extrabold">Produk</h2><p className="mt-1 text-xs font-medium text-[#78877f]">Produk aktif yang dipublikasikan usaha ini.</p></div><span className="text-xs font-extrabold text-[#16864c]">{profile.products.length}</span></div>
              {profile.products.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {profile.products.map((product) => (
                    <article className="overflow-hidden rounded-2xl border border-[#dfe9e3] bg-[#fbfcfb]" key={product.id}>
                      {product.imageUrl ? (
                        <div className="aspect-4/3 bg-[#edf3ef] bg-cover bg-center" role="img" aria-label={`Gambar ${product.name}`} style={background(product.imageUrl)} />
                      ) : (
                        <div className="grid aspect-4/3 place-items-center bg-[#edf3ef] text-[#78a08d]"><ImageIcon className="h-8 w-8" /></div>
                      )}
                      <div className="p-4"><p className="text-[9px] font-extrabold uppercase tracking-wide text-[#718078]">{product.category}</p><h3 className="mt-1 text-sm font-extrabold leading-snug text-[#244b3c]">{product.name}</h3><p className="mt-2 text-sm font-extrabold text-[#087447]">{formatCurrency(product.price)} <span className="text-[9px] font-semibold text-[#718078]">/ {product.unit}</span></p>{product.description ? <p className="mt-2 text-[10px] leading-5 text-[#64746c]">{product.description}</p> : null}</div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-[#cbdcd2] bg-[#f8fbf9] p-8 text-center text-sm font-semibold text-[#718078]">Belum ada produk aktif yang ditampilkan.</p>
              )}
            </section>

            <section className="rounded-[20px] border border-[#dce7e1] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-extrabold">Ulasan transaksi</h2><p className="mt-1 text-xs font-medium text-[#78877f]">Ulasan tertulis dari transaksi yang telah selesai.</p></div><span className="text-xs font-extrabold text-[#16864c]">{profile.reviews.length}</span></div>
              {profile.reviews.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {profile.reviews.map((review, index) => (
                    <article className="rounded-2xl border border-[#e1e9e4] p-4" key={`${review.createdAt}-${index}`}>
                      <p className="text-sm font-extrabold text-[#9a670f]">{"★".repeat(review.score)}<span className="text-[#ded9ca]">{"★".repeat(5 - review.score)}</span></p>
                      <p className="mt-3 text-xs font-medium leading-5 text-[#52645b]">“{review.review}”</p>
                      <time className="mt-3 block text-[9px] font-semibold text-[#89958f]">{formatDate(review.createdAt)}</time>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-[#cbdcd2] p-8 text-center text-sm font-semibold text-[#718078]">Belum ada ulasan tertulis.</p>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[20px] border border-[#dce7e1] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-[#17231e]">Hubungi usaha</h2>
              <p className="mt-2 text-[10px] font-medium leading-5 text-[#78877f]">Tujuan kontak diproses server dan tidak ditampilkan di halaman ini.</p>
              <div className="mt-4 space-y-2">
                {profile.whatsappAvailable ? <a className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07843f] px-4 text-sm font-extrabold text-white hover:bg-[#066f36]" href={whatsappHref}><MessageCircle className="h-5 w-5" />Chat WhatsApp</a> : null}
                {profile.websiteAvailable ? <a className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#9fc3ae] px-4 text-sm font-extrabold text-[#087447] hover:bg-[#f0f7f3]" href={websiteHref}><Globe2 className="h-5 w-5" />Buka website <ExternalLink className="h-4 w-4" /></a> : null}
                {!profile.whatsappAvailable && !profile.websiteAvailable ? <p className="rounded-xl bg-[#f3f6f4] px-3 py-3 text-center text-[10px] font-bold text-[#718078]">Belum ada kanal kontak terverifikasi.</p> : null}
              </div>
            </section>

            <section className="rounded-[20px] border border-[#dce7e1] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-[#17231e]">Reputasi publik</h2>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[#f4f8f5] p-3"><dt className="inline-flex items-center gap-2 text-[10px] font-bold text-[#718078]"><ShieldCheck className="h-4 w-4 text-[#087447]" />Trust score</dt><dd className="text-sm font-extrabold text-[#087447]">{formatNumber(profile.trustScore)}/100</dd></div>
                <div className="flex items-center justify-between rounded-xl bg-[#fff9ec] p-3"><dt className="inline-flex items-center gap-2 text-[10px] font-bold text-[#806d43]"><Star className="h-4 w-4 fill-[#f7bd38] text-[#f7bd38]" />Rating diterima</dt><dd className="text-sm font-extrabold text-[#9a670f]">{formatNumber(profile.ratingCount)}</dd></div>
                <div className="flex items-center justify-between rounded-xl bg-[#f4f8f5] p-3"><dt className="inline-flex items-center gap-2 text-[10px] font-bold text-[#718078]"><Eye className="h-4 w-4 text-[#64756d]" />Dilihat</dt><dd className="text-sm font-extrabold text-[#315b4c]">{formatNumber(profile.profileViews)}</dd></div>
              </dl>
            </section>
          </aside>
        </div>
      </main>

      <footer className="border-t border-[#dfe9e3] bg-white py-7"><p className="text-center text-xs font-semibold text-[#78877f]">Profil usaha ini ditampilkan melalui Pull.</p></footer>
    </div>
  );
}
