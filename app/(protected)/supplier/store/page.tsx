import Link from "next/link";
import { BadgeCheck, Building2, CheckCircle2, FileCheck2, Mail, MapPin, Phone, ShieldCheck, Upload, UserRound } from "lucide-react";
import { submitKycRecordAction } from "@/features/supplier/actions";
import { getSupplierKycSubmissions, getSupplierWorkspace } from "@/features/supplier/data";
import { getSupplierProfile } from "@/features/supplier/profile";
import {
  ActionNotice,
  cardClass,
  DataState,
  inputClass,
  primaryButtonClass,
  EmptyState,
  formatDate,
  formatNumber,
  SectionHeading,
  StatusBadge,
} from "@/features/supplier/components/supplier-ui";
import { requireRole } from "@/lib/auth/require-role";

const KYC_LABELS: Record<string, string> = {
  not_submitted: "Belum diajukan",
  pending: "Sedang ditinjau",
  verified: "Terverifikasi",
  rejected: "Perlu diajukan ulang",
};

export default async function SupplierStorePage({ searchParams }: { searchParams: Promise<{ result?: string | string[] }> }) {
  const [{ user }, workspaceResult, kycResult, params] = await Promise.all([
    requireRole(["supplier"]),
    getSupplierWorkspace(),
    getSupplierKycSubmissions(),
    searchParams,
  ]);
  if (workspaceResult.status !== "ready") return <DataState status={workspaceResult.status} />;
  const { workspace } = workspaceResult;
  const profile = getSupplierProfile(user.user_metadata ?? {}, user.email ?? "");
  const details = [
    { label: "Penanggung jawab", value: profile.displayName, icon: UserRound },
    { label: "Nama usaha", value: workspace.profile.businessName || profile.businessName, icon: Building2 },
    { label: "Produk utama", value: profile.category, icon: BadgeCheck },
    { label: "Area pengiriman", value: profile.deliveryArea, icon: MapPin },
    { label: "Telepon / WhatsApp", value: profile.phone, icon: Phone },
    { label: "Email akun", value: profile.email, icon: Mail },
  ];

  return (
    <>
      <ActionNotice result={params.result} />
      <section className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
        <div className="overflow-hidden rounded-[20px] bg-[#0c4d34] p-6 text-white shadow-[0_18px_42px_rgba(12,77,52,.17)] sm:p-7">
          <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#a8d7b7]">Trust overview</p>
          <div className="mt-5 flex items-end gap-3"><strong className="font-[family-name:var(--font-worker-display)] text-6xl font-semibold tracking-[-.06em]">{formatNumber(workspace.profile.trustScore, 1)}</strong><span className="pb-2 text-sm font-bold text-white/50">/ 100</span></div>
          <p className="mt-3 text-xs font-medium leading-6 text-white/60">Skor kepercayaan berasal dari rating transaksi di database, bukan penilaian buatan halaman.</p>
          <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/[.06] p-4"><p className="text-[9px] font-bold text-white/50">Jumlah rating</p><p className="mt-2 text-xl font-extrabold">{workspace.profile.ratingCount}</p></div><div className="rounded-xl border border-white/10 bg-white/[.06] p-4"><p className="text-[9px] font-bold text-white/50">Level verifikasi</p><p className="mt-2 text-xl font-extrabold">{workspace.profile.verificationLevel} / 2</p></div></div>
          <Link href="/onboarding/lengkapi-profil?role=supplier" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-white px-5 text-xs font-extrabold text-[#08783f]">Perbarui profil</Link>
        </div>

        <section className={`${cardClass} p-5 sm:p-6`}>
          <SectionHeading eyebrow="Identitas supplier" title="Informasi usaha" description="Data identitas menggunakan profil akun dan workspace supplier yang tersimpan." />
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">{details.map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-2xl border border-[#e3ece6] bg-[#fbfdfc] p-4"><dt className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[.08em] text-[#6b7b75]"><Icon className="h-3.5 w-3.5" />{item.label}</dt><dd className={`mt-2 text-xs font-extrabold ${item.value ? "text-[#163c2b]" : "text-[#b35e16]"}`}>{item.value || "Belum dilengkapi"}</dd></div>; })}</dl>
        </section>
      </section>

      <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#e8f5ec] text-[#08783f]"><ShieldCheck className="h-5 w-5" /></span><div><p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#507f63]">Verifikasi usaha</p><h2 className="mt-1.5 text-lg font-extrabold text-[#163c2b]">KYC {KYC_LABELS[workspace.profile.kycStatus]}</h2><div className="mt-2"><StatusBadge status={workspace.profile.kycStatus} /></div></div></div>
          <p className="max-w-xl rounded-xl border border-[#cfe3d6] bg-[#f4faf6] p-4 text-[10px] font-medium leading-5 text-[#315b4c]">Dokumen disimpan di bucket privat. Hanya pemilik dan administrator aktif yang dapat membacanya.</p>
        </div>

        {workspace.profile.kycStatus !== "verified" ? (
          <form action={submitKycRecordAction} className="mt-6 grid gap-4 rounded-2xl border border-[#e1e9e4] bg-[#fbfdfc] p-4 sm:grid-cols-[180px_1fr_auto] sm:items-end" encType="multipart/form-data">
            <label className="grid gap-2 text-[10px] font-extrabold text-[#315b4c]">Jenis dokumen<select className={inputClass} name="documentType" required><option value="NIB">NIB</option><option value="SIUP">SIUP</option></select></label>
            <label className="grid gap-2 text-[10px] font-extrabold text-[#315b4c]">Dokumen privat<input className={`${inputClass} py-2`} name="document" type="file" accept="application/pdf,image/jpeg,image/png" required /></label>
            <button className={primaryButtonClass} type="submit"><Upload className="h-4 w-4" />Kirim verifikasi</button>
            <p className="text-[9px] font-medium text-[#6b7b75] sm:col-span-3">PDF, JPG, atau PNG. Maksimum 850 KB.</p>
          </form>
        ) : null}

        {kycResult.status !== "ready" ? <div className="mt-5 rounded-xl bg-[#fff5f1] p-4 text-xs font-bold text-[#a7462d]">Riwayat KYC belum dapat dimuat.</div> : kycResult.submissions.length ? (
          <div className="mt-6 divide-y divide-[#e3ece6] border-t border-[#e3ece6]">{kycResult.submissions.map((submission) => (
            <article key={submission.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf8f0] text-[#08783f]">{submission.status === "approved" ? <CheckCircle2 className="h-4 w-4" /> : <FileCheck2 className="h-4 w-4" />}</span><div><p className="text-xs font-extrabold text-[#163c2b]">{submission.documentType}</p><p className="mt-1 text-[9px] font-semibold text-[#6b7b75]">Diajukan {formatDate(submission.createdAt, true)}</p>{submission.rejectionReason ? <p className="mt-1 text-[9px] font-semibold text-[#a7462d]">{submission.rejectionReason}</p> : null}</div></div><StatusBadge status={submission.status} /></article>
          ))}</div>
        ) : <EmptyState title="Belum ada pengajuan KYC" description="Riwayat akan muncul setelah dokumen storage yang valid didaftarkan untuk peninjauan." />}
      </section>
    </>
  );
}
