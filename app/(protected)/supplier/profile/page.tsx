import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Building2,
  CheckCircle2,
  CircleAlert,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getSupplierProfile } from "@/features/supplier/profile";
import { requireRole } from "@/lib/auth/require-role";

export default async function SupplierProfilePage() {
  const { user } = await requireRole(["supplier"]);
  const profile = getSupplierProfile(user.user_metadata ?? {}, user.email ?? "");
  const details = [
    { label: "Penanggung jawab", value: profile.displayName, icon: UserRound },
    { label: "Nama perusahaan", value: profile.businessName, icon: Building2 },
    { label: "Produk utama", value: profile.category, icon: Boxes },
    { label: "Area pengiriman", value: profile.deliveryArea, icon: MapPin },
    { label: "Telepon / WhatsApp", value: profile.phone, icon: Phone },
    { label: "Email akun", value: profile.email, icon: Mail },
  ];
  const checklist = details.slice(0, 5);

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
        <section className="flex min-h-[390px] flex-col rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.035)] sm:p-6">
          <h2 className="flex items-center gap-2 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]"><ShieldCheck className="h-5 w-5 fill-[#087a41] text-white" /> Kesiapan Supplier</h2>
          <div className="relative mx-auto mt-6 grid h-48 w-48 place-items-center rounded-full" style={{ background: `conic-gradient(#07833f 0 ${profile.profileCompletion}%, #edf1ee ${profile.profileCompletion}% 100%)` }} role="img" aria-label={`Profil supplier ${profile.profileCompletion} persen lengkap`}><div className="grid h-[152px] w-[152px] place-content-center rounded-full bg-white text-center"><strong className="font-[family-name:var(--font-worker-display)] text-[48px] font-semibold tracking-[-0.06em] text-[#0c261c]">{profile.profileCompletion}%</strong><span className="mt-1 text-[10px] font-extrabold text-[#28543e]">Profil siap</span></div></div>
          <p className="mt-5 text-center text-[10px] font-medium leading-5 text-[#6e9b7d]">Informasi yang lengkap membantu UMKM menilai kecocokan pasokan dan area layananmu.</p>
          <Link href="/onboarding/lengkapi-profil?role=supplier" className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white transition hover:bg-[#00613f]">Perbarui profil <ArrowRight className="h-4 w-4" /></Link>
        </section>

        <section className="rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.03)] sm:p-6">
          <div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#507f63]">Identitas usaha</p><h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em]">Informasi supplier</h2><p className="mt-2 text-[10px] font-medium leading-5 text-[#6e9b7d]">Data ini berasal dari profil onboarding dan digunakan saat mencocokkan penawaran.</p></div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">{details.map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-[16px] border border-[#e3ece6] bg-[#fbfdfc] p-4"><dt className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#6e9b7d]"><Icon className="h-3.5 w-3.5" />{item.label}</dt><dd className={`mt-2 text-xs font-extrabold ${item.value ? "text-[#1d4634]" : "text-[#b9681d]"}`}>{item.value || "Belum dilengkapi"}</dd></div>; })}</dl>
        </section>
      </div>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.03)] sm:p-6">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#507f63]">Checklist profil</p><h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em]">Kelengkapan data utama</h2>
          <div className="mt-5 space-y-3">{checklist.map((item) => { const complete = Boolean(item.value); return <div key={item.label} className="flex items-center gap-3 rounded-xl border border-[#e3ece6] p-3.5"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${complete ? "bg-[#e8f5ec] text-[#08783f]" : "bg-[#fff0df] text-[#b9681d]"}`}>{complete ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><strong className="block text-[11px] font-extrabold text-[#1d4634]">{item.label}</strong><span className="mt-0.5 block text-[9px] font-medium text-[#6e9b7d]">{complete ? "Sudah dilengkapi" : "Perlu dilengkapi"}</span></span></div>; })}</div>
        </div>

        <aside className="rounded-[18px] bg-[#0c261c] p-5 text-white shadow-[0_16px_38px_rgba(12,38,28,.14)] sm:p-6"><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#94b9a1]">Verifikasi usaha</p><h2 className="mt-2 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em]">Bangun kepercayaan UMKM</h2><div className="mt-5 space-y-3"><div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3"><CheckCircle2 className="h-4 w-4 text-[#8ec9a6]" /><span><strong className="block text-[10px] font-extrabold">Kontak aktif</strong><span className="mt-0.5 block text-[9px] text-white/50">Siap digunakan untuk komunikasi pool</span></span></div><div className="flex items-center gap-3 rounded-xl border border-[#a96b36]/40 bg-[#7a4c28]/20 p-3"><CircleAlert className="h-4 w-4 text-[#f1b46f]" /><span><strong className="block text-[10px] font-extrabold">NIB perlu diverifikasi</strong><span className="mt-0.5 block text-[9px] text-white/50">Aktifkan saat alur verifikasi produksi tersedia</span></span></div></div></aside>
      </section>

      <footer className="mt-8 flex flex-col gap-2 border-t border-[#dfeae2] pt-5 text-[9px] font-semibold text-[#6e9b7d] sm:flex-row sm:items-center sm:justify-between"><p>Pull Supplier Space · Profil</p><p>Informasi profil tersimpan bersama akun supplier</p></footer>
    </>
  );
}
