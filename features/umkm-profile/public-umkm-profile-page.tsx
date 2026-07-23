"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Eye,
  Link2,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Star,
  Store,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { FaWhatsapp } from "react-icons/fa";

type PublicBusinessInfo = {
  banner: string;
  logo: string;
  name: string;
  category: string;
  scale: string;
  businessType: string;
  description: string;
  paymentMethods: string[];
  foundedYear: string;
  whatsappContact: string;
};

type PublicProduct = {
  id: string;
  name: string;
  image: string;
  imagePosition: string;
};

type PublicProfileSnapshot = {
  slug: string;
  ownerName: string;
  info: PublicBusinessInfo;
  products: PublicProduct[];
  verified: boolean;
  reputation: {
    rating: number;
    reviewCount: number;
    label: string;
  };
  statistics: {
    profileViews: number;
    contactCount: number;
  };
};

const PUBLIC_PROFILE_PREVIEW_KEY = "pull:umkm-public-profile-preview";

const DEFAULT_PROFILE: PublicProfileSnapshot = {
  slug: "batik-laweyan-bu-sari",
  ownerName: "Sari Wulandari",
  info: {
    banner: "/auth/slides/01-belanja-bareng.webp",
    logo: "/illustrations/batik-laweyan-logo.svg",
    name: "Batik Laweyan Bu Sari",
    category: "Batik / Tekstil",
    scale: "Kecil",
    businessType: "Produksi",
    description:
      "Memproduksi batik tulis & cap untuk fashion dan home decor. Melayani pesanan custom motif.",
    paymentMethods: ["Transfer Bank", "Tunai", "QRIS"],
    foundedYear: "2010",
    whatsappContact: "628123456790",
  },
  products: [
    { id: "product-parang", name: "Batik Tulis Motif Parang", image: "/auth/slides/01-belanja-bareng.webp", imagePosition: "50% 72%" },
    { id: "product-kawung-cap", name: "Batik Cap Kawung", image: "/auth/slides/03-dari-lapak-ke-layar.webp", imagePosition: "50% 70%" },
    { id: "product-kawung-tulis", name: "Batik Tulis Kawung", image: "/auth/slides/04-reputasi-terjaga.webp", imagePosition: "50% 72%" },
    { id: "product-sarung-bantal", name: "Sarung Bantal Batik", image: "/auth/slides/02-tenaga-lokal.webp", imagePosition: "50% 72%" },
  ],
  verified: true,
  reputation: { rating: 4.8, reviewCount: 23, label: "Sangat dipercaya" },
  statistics: { profileViews: 142, contactCount: 18 },
};

function subscribeToProfilePreview(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getProfilePreviewSnapshot() {
  return sessionStorage.getItem(PUBLIC_PROFILE_PREVIEW_KEY) ?? "";
}

function getServerProfilePreviewSnapshot() {
  return "";
}

function parseProfileSnapshot(rawValue: string, slug: string): PublicProfileSnapshot {
  if (!rawValue) return { ...DEFAULT_PROFILE, slug };

  try {
    const value = JSON.parse(rawValue) as Partial<PublicProfileSnapshot>;
    if (
      value.slug !== slug ||
      !value.info ||
      typeof value.info.name !== "string" ||
      !Array.isArray(value.products)
    ) {
      return { ...DEFAULT_PROFILE, slug };
    }

    return {
      slug,
      ownerName: typeof value.ownerName === "string" ? value.ownerName : DEFAULT_PROFILE.ownerName,
      info: { ...DEFAULT_PROFILE.info, ...value.info },
      products: value.products,
      verified: typeof value.verified === "boolean" ? value.verified : DEFAULT_PROFILE.verified,
      reputation: { ...DEFAULT_PROFILE.reputation, ...value.reputation },
      statistics: { ...DEFAULT_PROFILE.statistics, ...value.statistics },
    };
  } catch {
    return { ...DEFAULT_PROFILE, slug };
  }
}

function ProfileImage({
  src,
  alt,
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  objectPosition?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={src.startsWith("data:")}
      sizes="(max-width: 768px) 100vw, 900px"
      className="object-cover"
      style={{ objectPosition }}
    />
  );
}

export function PublicUmkmProfilePage({ slug }: { slug: string }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const serializedProfile = useSyncExternalStore(
    subscribeToProfilePreview,
    getProfilePreviewSnapshot,
    getServerProfilePreviewSnapshot,
  );
  const profile = useMemo(() => parseProfileSnapshot(serializedProfile, slug), [serializedProfile, slug]);
  const { info, products } = profile;
  const whatsappDigits = info.whatsappContact.replace(/\D/g, "");
  const whatsappNumber = whatsappDigits.startsWith("62")
    ? whatsappDigits
    : whatsappDigits.startsWith("0")
      ? `62${whatsappDigits.slice(1)}`
      : `62${whatsappDigits}`;
  const whatsappMessage = `Halo ${info.name}, saya tertarik dengan produk Anda di Pull. Saya ingin menanyakan informasi produk, pesanan custom, atau peluang kerja sama.`;
  const whatsappUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  async function copyProfileLink() {
    const profileUrl = window.location.href;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(profileUrl);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = profileUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setToastMessage("Link profil berhasil disalin.");
  }

  async function shareProfile() {
    const profileUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Profil ${info.name} di Pull`,
          text: `Lihat profil usaha ${info.name} di Pull.`,
          url: profileUrl,
        });
        setToastMessage("Profil berhasil dibagikan.");
      } else {
        await copyProfileLink();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setToastMessage("Profil belum dapat dibagikan. Silakan coba lagi.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f7f4] font-[family-name:var(--font-worker-sans)] text-[#0c261c]">
      <header className="sticky top-0 z-30 border-b border-[#dfe9e3] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Beranda Pull">
            <Image src="/Logo(Pull).svg" alt="Pull" width={38} height={38} className="h-[38px] w-[38px] rounded-lg" priority />
            <span className="text-xl font-extrabold text-[#0c4f36]">Pull</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="inline-flex h-10 items-center rounded-xl border border-[#cfe0d6] bg-white px-4 text-xs font-extrabold text-[#315b4c] transition hover:bg-[#f0f7f3] sm:text-sm">Kembali ke Pull</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
        <section className="overflow-hidden rounded-[24px] border border-[#dce7e1] bg-white shadow-[0_18px_50px_rgba(12,38,28,.08)]">
          <div className="relative h-[220px] overflow-hidden sm:h-[320px]">
            <ProfileImage src={info.banner} alt={`Banner ${info.name}`} objectPosition="50% 68%" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#082d20]/75 via-[#082d20]/5 to-[#082d20]/15" />
            {profile.verified ? <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#082d20]/70 px-3 py-2 text-xs font-extrabold text-white backdrop-blur-sm"><BadgeCheck className="h-4 w-4" /> Profil UMKM Terverifikasi</span> : null}
          </div>

          <div className="relative px-5 pb-7 pt-[74px] sm:px-8 sm:pb-8 sm:pl-[210px] sm:pt-7">
            <div className="absolute -top-[66px] left-5 h-[132px] w-[132px] overflow-hidden rounded-full border-[6px] border-white bg-[#f2eee8] shadow-[0_12px_28px_rgba(12,38,28,.16)] sm:left-9">
              <ProfileImage src={info.logo} alt={`Logo ${info.name}`} />
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-[family-name:var(--font-worker-display)] text-[28px] font-semibold tracking-[-0.045em] text-[#0c261c] sm:text-[34px]">{info.name}</h1>
                  {profile.verified ? <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7ed] px-2.5 py-1 text-[11px] font-extrabold text-[#07843f]"><CheckCircle2 className="h-3.5 w-3.5" /> Terverifikasi</span> : null}
                </div>
                <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-[#64766e]">{info.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#64766e]">
                  <span className="inline-flex items-center gap-1.5"><Store className="h-4 w-4 text-[#16864c]" />{info.category}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#16864c]" />Laweyan, Solo</span>
                  <span className="inline-flex items-center gap-1.5 text-[#8a641d]"><Star className="h-4 w-4 fill-[#f7bd38] text-[#f7bd38]" />{profile.reputation.rating.toLocaleString("id-ID", { minimumFractionDigits: 1 })} <span className="text-[#64766e]">({profile.reputation.reviewCount} ulasan)</span></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-[20px] border border-[#dce7e1] bg-white p-5 shadow-[0_8px_26px_rgba(12,38,28,.045)] sm:p-6">
              <h2 className="font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em]">Tentang Usaha</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: CalendarDays, label: "Tahun berdiri", value: info.foundedYear },
                  { icon: Store, label: "Skala usaha", value: info.scale },
                  { icon: BadgeCheck, label: "Jenis usaha", value: info.businessType },
                  { icon: WalletCards, label: "Metode pembayaran", value: info.paymentMethods.join(", ") || "Belum diatur" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 rounded-2xl bg-[#f6f9f7] p-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e4f3e8] text-[#07843f]"><Icon className="h-5 w-5" /></span>
                      <div><dt className="text-[11px] font-bold text-[#78877f]">{item.label}</dt><dd className="mt-1 text-sm font-extrabold text-[#244b3c]">{item.value}</dd></div>
                    </div>
                  );
                })}
              </dl>
            </section>

            <section className="rounded-[20px] border border-[#dce7e1] bg-white p-5 shadow-[0_8px_26px_rgba(12,38,28,.045)] sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em]">Produk Unggulan</h2>
                  <p className="mt-1 text-xs font-medium text-[#78877f]">Pilihan produk dari {info.name}.</p>
                </div>
                <span className="text-xs font-extrabold text-[#16864c]">{products.length} produk</span>
              </div>
              {products.length ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <article key={product.id} className="overflow-hidden rounded-2xl border border-[#dfe9e3] bg-[#fbfcfb] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(12,38,28,.1)]">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#edf3ef]">
                        <ProfileImage src={product.image} alt={product.name} objectPosition={product.imagePosition} />
                      </div>
                      <h3 className="min-h-[58px] px-4 py-3 text-sm font-extrabold leading-snug text-[#244b3c]">{product.name}</h3>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-[#cbdcd2] bg-[#f8fbf9] p-8 text-center text-sm font-semibold text-[#718078]">Belum ada produk yang ditampilkan.</div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[20px] border border-[#dce7e1] bg-white p-5 shadow-[0_8px_26px_rgba(12,38,28,.055)]">
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07843f] px-4 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(7,132,63,.18)] transition hover:bg-[#066f36]"><FaWhatsapp className="h-5 w-5" /> Chat via WhatsApp</a>
              <p className="mt-3 flex items-center justify-center gap-2 text-center text-[10px] font-semibold text-[#78877f]"><ShieldCheck className="h-3.5 w-3.5 text-[#16864c]" /> Nomor WhatsApp disamarkan untuk keamanan.</p>
            </section>

            <section className="rounded-[20px] border border-[#dce7e1] bg-white p-5 shadow-[0_8px_26px_rgba(12,38,28,.055)]">
              <h2 className="text-sm font-extrabold text-[#17231e]">Bagikan Profil Ini</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button type="button" onClick={shareProfile} className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#dfe7e2] bg-white text-xs font-extrabold text-[#26372f] transition hover:border-[#9fc2ae] hover:bg-[#f5faf7]"><Share2 className="h-6 w-6 text-[#315b4c]" /> Share</button>
                <button type="button" onClick={copyProfileLink} className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#dfe7e2] bg-white text-xs font-extrabold text-[#26372f] transition hover:border-[#9fc2ae] hover:bg-[#f5faf7]"><Link2 className="h-6 w-6 text-[#315b4c]" /> Copy Link</button>
              </div>

              {profile.verified ? (
              <div className="mt-5 rounded-[18px] border border-[#dcebe1] bg-gradient-to-br from-[#f4faf6] to-[#edf7f0] p-4">
                <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e0f2e6] text-[#299a5a]"><ShieldCheck className="h-5 w-5 fill-[#299a5a] text-white" /></span><div><h2 className="text-xs font-extrabold text-[#26372f]">Profil ini Terverifikasi</h2><p className="mt-1 text-[10px] leading-5 text-[#718078]">Identitas usaha telah diverifikasi oleh tim Pull.</p></div></div>
              </div>
              ) : null}

              <div className="mt-4 rounded-[18px] border border-[#f0e5c9] bg-gradient-to-br from-[#fffdf7] to-[#fff7e8] p-4">
                <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff3ce] text-[#f2b51d]"><Star className="h-5 w-5 fill-current" /></span><div><h2 className="text-xs font-extrabold text-[#26372f]">Reputasi Usaha</h2><p className="mt-1 text-[10px] text-[#718078]">{profile.reputation.label}</p><p className="mt-2 text-sm font-extrabold text-[#17231e]">{profile.reputation.rating.toLocaleString("id-ID", { minimumFractionDigits: 1 })}/5 <span className="text-[10px] font-semibold text-[#718078]">dari {profile.reputation.reviewCount} ulasan</span></p></div></div>
              </div>

              <div className="mt-4 grid grid-cols-2 rounded-[18px] border border-[#dce7e1] bg-white p-4">
                <div className="flex items-center justify-center gap-3 border-r border-[#e5ebe7] px-2"><Eye className="h-5 w-5 text-[#64756d]" /><div><p className="text-base font-extrabold text-[#17231e]">{profile.statistics.profileViews}</p><p className="text-[9px] text-[#78877f]">kali dilihat</p></div></div>
                <div className="flex items-center justify-center gap-3 px-2"><MessageCircle className="h-5 w-5 text-[#64756d]" /><div><p className="text-base font-extrabold text-[#17231e]">{profile.statistics.contactCount}</p><p className="text-[9px] text-[#78877f]">kali dihubungi</p></div></div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <footer className="border-t border-[#dfe9e3] bg-white py-7">
        <p className="text-center text-xs font-semibold text-[#78877f]">Profil usaha ini ditampilkan melalui Pull.</p>
      </footer>

      {toastMessage ? <div role="status" aria-live="polite" className="fixed bottom-5 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-[#b9ddc6] bg-[#eff9f1] px-4 py-3 text-sm font-extrabold text-[#176b39] shadow-[0_16px_40px_rgba(12,38,28,.18)] sm:right-6 sm:min-w-80"><CheckCircle2 className="h-5 w-5 shrink-0" /><span className="flex-1">{toastMessage}</span><button type="button" onClick={() => setToastMessage(null)} aria-label="Tutup notifikasi" className="grid h-7 w-7 place-items-center rounded-lg hover:bg-[#dcefe1]"><X className="h-4 w-4" /></button></div> : null}
    </div>
  );
}
