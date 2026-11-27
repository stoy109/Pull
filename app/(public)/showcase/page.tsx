import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ExternalLink } from "lucide-react";
import storefront from "@/public/Dashboard(UMKM).png";
import worker from "@/public/illustrations/worker-dashboard.webp";
import reputation from "@/public/Profile(Selesai).png";

const title = "Pull — Platform Kolaborasi UMKM";
const description = "Kenali Pull: platform yang membantu UMKM belanja bersama, merekrut pekerja lokal, dan membangun reputasi usaha.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website", locale: "id_ID", siteName: "Pull" },
};

const features = [
  {
    title: "Belanja bersama",
    description: "UMKM menggabungkan kebutuhan bahan dalam satu pool. Target jumlah membantu mereka mengejar diskon kuantitas dari supplier.",
    image: storefront,
    alt: "Ilustrasi sebuah toko usaha lokal dengan etalase hasil panen",
  },
  {
    title: "Rekrutmen lokal",
    description: "UMKM menerbitkan lowongan, sementara pekerja menelusuri peluang berdasarkan kategori, lokasi, atau upah, lalu mengirim lamaran.",
    image: worker,
    alt: "Ilustrasi pekerja menggunakan laptop untuk mengakses peluang dan notifikasi",
  },
  {
    title: "Profil dan reputasi",
    description: "Profil publik memperkenalkan usaha kepada calon pelanggan. Konfirmasi pekerjaan dan rating membantu kedua pihak membangun reputasi.",
    image: reputation,
    alt: "Ilustrasi tanda centang hijau yang melambangkan penyelesaian proses",
  },
];

const steps = [
  { title: "UMKM menerbitkan lowongan", description: "Misalnya, toko membutuhkan dua orang untuk membantu pengemasan pesanan. Pemilik mencantumkan lokasi, tanggal, dan upah." },
  { title: "Pekerja mencari dan melamar", description: "Pekerja menyaring lowongan di wilayahnya, membaca detail pekerjaan, lalu mengirim pesan lamaran." },
  { title: "Kedua pihak mengonfirmasi pekerjaan", description: "Setelah UMKM menerima pekerja dan pekerjaan selesai, kedua pihak dapat mengonfirmasi penyelesaian dan memberikan rating." },
];

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="border-b border-border bg-surface">
        <nav aria-label="Navigasi showcase" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <span className="font-(family-name:--font-worker-display) text-2xl font-bold tracking-tight text-primary">Pull</span>
          <Link href="/" prefetch={false} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-primary transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            Masuk ke aplikasi <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-20">
        <section className="rounded-b-3xl bg-primary-50 px-5 py-12 sm:px-10 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Showcase proyek · UMKM Indonesia</p>
          <h1 className="mt-4 max-w-3xl font-(family-name:--font-worker-display) text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Satu platform, bersama UMKM maju.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">Mencari bahan dengan harga yang sesuai dan menemukan pekerja lokal sering jadi dua pekerjaan terpisah. Pull menghubungkan UMKM, pekerja, dan supplier dalam satu platform, dari pembelian kolektif sampai rekrutmen dan ulasan.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#alur" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              Lihat contoh alur <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </a>
            <a href="https://github.com/stoy109/Pull" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary-200 bg-white px-5 text-sm font-bold text-primary transition hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              Repositori GitHub <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section aria-labelledby="fitur" className="mt-12 sm:mt-16">
          <h2 id="fitur" className="font-(family-name:--font-worker-display) text-3xl font-bold tracking-tight">Yang bisa dilakukan dengan Pull</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">Tiga fitur utama, ditampilkan dengan ilustrasi dari aplikasi.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="relative aspect-video bg-surface-muted">
                  <Image src={feature.image} alt={feature.alt} fill sizes="(min-width: 72rem) 22rem, (min-width: 48rem) 31vw, 100vw" className="object-contain" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="alur" aria-labelledby="judul-alur" className="mt-12 scroll-mt-6 rounded-3xl border border-border bg-surface px-5 py-7 sm:mt-16 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Contoh skenario</p>
          <h2 id="judul-alur" className="mt-2 font-(family-name:--font-worker-display) text-3xl font-bold tracking-tight">Dari lowongan hingga pekerjaan selesai</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-xl bg-surface-muted p-5">
                <span aria-hidden="true" className="inline-grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-white">{index + 1}</span>
                <h3 className="mt-4 font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="teknologi" className="mt-12 border-t border-border pt-6 sm:mt-16">
          <h2 id="teknologi" className="text-lg font-bold">Teknologi</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "Leaflet"].map((tech) => (
              <li key={tech} className="rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium text-text-secondary">{tech}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
