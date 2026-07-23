import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CalendarClock,
  CircleAlert,
  Clock3,
  MapPin,
  PackageOpen,
  ShieldCheck,
  Store,
  TrendingUp,
} from "lucide-react";
import { getSupplierProfile } from "@/features/supplier/profile";
import { requireRole } from "@/lib/auth/require-role";
import { getSupplierDashboardData } from "@/lib/activity/queries";
import supplierImage from "@/public/onboarding/roles/supplier.png";

function formatValue(value: string | number) {
  return typeof value === "number" ? new Intl.NumberFormat("id-ID").format(value) : value;
}

export default async function SupplierPage() {
  const { user } = await requireRole(["supplier"]);
  const data = await getSupplierDashboardData();
  const profile = getSupplierProfile(user.user_metadata ?? {}, user.email ?? "");
  const firstName = profile.displayName.split(" ")[0];
  const metrics = [
    { label: "Demand aktif", value: data.activeDemands, detail: "Kebutuhan masih terbuka", icon: PackageOpen, tone: "bg-[#e7f4df] text-[#07833f]" },
    { label: "UMKM membutuhkan pasokan", value: data.requestingUmkm, detail: "Calon mitra tersedia", icon: Store, tone: "bg-[#e7f4df] text-[#07833f]" },
    { label: "Kategori komoditas", value: data.categories, detail: "Ragam kebutuhan jaringan", icon: Boxes, tone: "bg-[#e9f2ff] text-[#0868d7]" },
    { label: "Menunggu respons", value: data.awaitingConfirmation, detail: "Perlu ditindaklanjuti", icon: Clock3, tone: "bg-[#fff0df] text-[#e87513]" },
  ];

  return (
    <>
      <section className="relative z-20 mb-5 overflow-hidden rounded-[20px] border border-[#dfeae2] bg-[#fffefa] shadow-[0_8px_30px_rgba(18,59,48,.035)] sm:min-h-[270px]">
        <div className="relative z-10 px-5 py-7 sm:min-h-[270px] sm:max-w-[56%] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#507f63]">Radar kebutuhan Solo Raya</p>
          <h2 className="mt-4 font-[family-name:var(--font-worker-display)] text-[27px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#0c261c] sm:text-[32px]">Selamat datang kembali, {firstName}! <span aria-hidden="true">👋</span></h2>
          <p className="mt-5 max-w-[450px] text-sm font-medium leading-7 text-[#38694e] sm:text-[15px]">Temukan kebutuhan yang cocok dengan stokmu dan respons sebelum tenggat pool berakhir.</p>
          <Link href="/supplier/demands" className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(7,150,77,.18)] transition hover:bg-[#00613f]">Lihat {data.awaitingConfirmation} peluang <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="relative h-56 sm:absolute sm:inset-y-0 sm:right-1 sm:h-auto sm:w-[48%]">
          <Image src={supplierImage} alt="Supplier memeriksa persediaan bahan baku" fill priority sizes="(min-width: 640px) 48vw, 100vw" className="object-contain object-bottom sm:object-right-bottom" />
        </div>
      </section>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 space-y-5 xl:col-span-9">
          <section className="flex min-h-[124px] flex-col gap-4 rounded-[18px] border border-[#f5c38e] bg-[linear-gradient(100deg,#fffaf3_0%,#fff3e5_100%)] p-5 shadow-[0_8px_28px_rgba(197,104,28,.055)] sm:flex-row sm:items-center sm:gap-5 sm:p-6">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f47b0c] text-white shadow-[0_8px_18px_rgba(244,123,12,.22)]"><CircleAlert className="h-7 w-7" /></span>
            <div className="min-w-0 flex-1"><h2 className="text-base font-extrabold text-[#0c261c]">{data.awaitingConfirmation} pool menunggu respons supplier</h2><p className="mt-1.5 text-xs font-medium leading-5 text-[#507f63] sm:text-[13px]">Prioritaskan kebutuhan dengan tenggat terdekat, lalu konfirmasi kemampuan pasokmu.</p></div>
            <Link href="/supplier/demands" className="inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#07964d] px-6 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(7,150,77,.18)] transition hover:bg-[#087d44]">Tinjau demand <ArrowRight className="h-4 w-4" /></Link>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan supplier">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return <article key={metric.label} className="flex min-h-[184px] flex-col rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.025)]"><div className="flex items-start gap-3.5"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[13px] ${metric.tone}`}><Icon className="h-[22px] w-[22px]" /></span><div className="min-w-0 pt-0.5"><p className="text-[11px] font-extrabold leading-4 text-[#28543e]">{metric.label}</p><strong className="mt-2 block font-[family-name:var(--font-worker-display)] text-[32px] font-semibold leading-none tracking-[-0.04em] text-[#0c261c]">{formatValue(metric.value)}</strong></div></div><p className="mt-auto flex items-center gap-1.5 pt-5 text-[10px] font-semibold leading-5 text-[#6e9b7d]"><TrendingUp className="h-3.5 w-3.5" /> {metric.detail}</p></article>;
            })}
          </section>
        </div>

        <section className="col-span-12 flex min-h-[348px] flex-col rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.035)] sm:p-6 xl:col-span-3">
          <h2 className="flex items-center gap-2 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]"><ShieldCheck className="h-5 w-5 fill-[#087a41] text-white" /> Kesiapan Supplier</h2>
          <div className="relative mx-auto mt-5 grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(#07833f 0 ${profile.profileCompletion}%, #edf1ee ${profile.profileCompletion}% 100%)` }} role="img" aria-label={`Profil supplier ${profile.profileCompletion} persen lengkap`}><div className="grid h-[138px] w-[138px] place-content-center rounded-full bg-white text-center"><strong className="font-[family-name:var(--font-worker-display)] text-[44px] font-semibold tracking-[-0.06em] text-[#0c261c]">{profile.profileCompletion}%</strong><span className="mt-1 text-[10px] font-extrabold text-[#28543e]">Profil siap</span></div></div>
          <p className="mt-5 text-center text-[10px] font-medium leading-5 text-[#6e9b7d]">Profil lengkap membantu UMKM menilai kesiapan dan jangkauan pasok {profile.businessName}.</p>
          <Link href="/supplier/profile" className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#b9dcc8] bg-white text-[11px] font-extrabold text-[#087a41] transition hover:border-[#78b994] hover:bg-[#f5fbf7]">Lihat profil supplier</Link>
        </section>
      </div>

      <section className="mt-5 rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.03)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#507f63]">Peluang terbaru</p><h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em]">Demand yang perlu ditinjau</h2></div><Link href="/supplier/demands" className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#08783f]">Lihat semua <ArrowRight className="h-3.5 w-3.5" /></Link></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {data.pools.slice(0, 3).map((pool) => <Link key={pool.id} href="/supplier/demands" className="group rounded-[16px] border border-[#dfeae2] p-4 transition hover:-translate-y-0.5 hover:border-[#b9d5c4] hover:shadow-sm"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f5ec] text-[#08783f]"><PackageOpen className="h-4.5 w-4.5" /></span><CalendarClock className="h-4 w-4 text-[#e87513]" /></div><h3 className="mt-4 text-sm font-extrabold text-[#1d4634] group-hover:text-[#08783f]">{pool.commodity}</h3><p className="mt-2 text-[10px] font-semibold text-[#6e9b7d]">{formatValue(pool.volume)} {pool.unit || "unit"}</p><p className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-[#507f63]"><MapPin className="h-3.5 w-3.5" />{pool.location || "Solo Raya"}</p></Link>)}
          {!data.pools.length ? <p className="col-span-full py-8 text-center text-xs font-semibold text-[#6e9b7d]">Belum ada demand yang perlu ditinjau.</p> : null}
        </div>
      </section>

      <footer className="mt-8 flex flex-col gap-2 border-t border-[#dfeae2] pt-5 text-[9px] font-semibold text-[#6e9b7d] sm:flex-row sm:items-center sm:justify-between"><p>Pull Supplier Space · Mempertemukan pasokan dengan kebutuhan usaha lokal</p><p>Data demand menyesuaikan pool aktif di jaringan Pull</p></footer>
    </>
  );
}
