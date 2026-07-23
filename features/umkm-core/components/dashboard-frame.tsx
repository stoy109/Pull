import { AlertCircle, CheckCircle2, DatabaseZap } from "lucide-react";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";
import type { DashboardIdentity } from "../types";

export const inputClass =
  "h-11 w-full rounded-xl border border-[#d8e4dd] bg-white px-3.5 text-sm font-medium text-[#17362a] outline-none transition placeholder:text-[#96a49e] focus:border-[#16864c] focus:ring-4 focus:ring-[#16864c]/10";

export const textareaClass = `${inputClass} min-h-24 resize-y py-3 leading-6`;

export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-[#087447] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#06663e] focus:outline-none focus:ring-4 focus:ring-[#087447]/20 disabled:cursor-not-allowed disabled:bg-[#9ab4a6]";

export const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-xl border border-[#b8cec1] bg-white px-4 text-xs font-extrabold text-[#236044] transition hover:bg-[#f0f7f3] focus:outline-none focus:ring-4 focus:ring-[#087447]/10";

export function DashboardFrame({
  children,
  identity,
}: {
  children: React.ReactNode;
  identity: DashboardIdentity;
}) {
  return (
    <UmkmDashboardShell
      businessName={identity.businessName}
      ownerName={identity.ownerName}
      profileCompletion={identity.profileCompletion}
    >
      {children}
    </UmkmDashboardShell>
  );
}

export function DataErrorPanel({ message }: { message: string }) {
  const setup = message.includes("202607230009_proposal_core_flows.sql");
  return (
    <section className="rounded-[22px] border border-[#d9e5de] bg-white p-7 text-center shadow-sm sm:p-10">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#edf6f0] text-[#087447]">
        {setup ? <DatabaseZap className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
      </span>
      <h2 className="mt-4 text-lg font-extrabold text-[#16382b]">
        {setup ? "Database fitur inti belum disiapkan" : "Data belum dapat dimuat"}
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-6 text-[#6b7b75]">{message}</p>
    </section>
  );
}

const successMessages: Record<string, string> = {
  "application-accepted": "Pelamar diterima.",
  "application-rejected": "Pelamar ditolak.",
  "completion-recorded": "Konfirmasi penyelesaian pekerjaan tercatat.",
  "job-created": "Lowongan berhasil disimpan.",
  "order-created": "Pesanan supplier berhasil dibuat.",
  "order-updated": "Status pesanan berhasil diperbarui.",
  "pool-created": "Pool baru berhasil dibuat.",
  "pool-joined": "Keikutsertaan pool berhasil dicatat.",
  "product-saved": "Produk berhasil disimpan.",
  "profile-saved": "Profil publik berhasil disimpan.",
  "rating-saved": "Rating pekerja berhasil dikirim.",
};

const errorMessages: Record<string, string> = {
  duplicate: "Data ini sudah pernah dicatat.",
  save: "Perubahan ditolak atau data sudah berubah. Periksa kondisi terbaru lalu coba lagi.",
  setup: "Fitur inti UMKM belum siap. Terapkan migrations 202607230009_proposal_core_flows.sql dan 202607230015_pool_catalog_hour_window.sql di Supabase terlebih dahulu.",
  validation: "Periksa kembali isian wajib, format, dan batas nilainya.",
};

export function ActionNotice({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  const isSuccess = Boolean(success);
  const message = isSuccess
    ? successMessages[success ?? ""] ?? "Perubahan berhasil disimpan."
    : errorMessages[error ?? ""] ?? "Perubahan belum dapat disimpan.";

  return (
    <p
      role="status"
      className={`mb-5 flex items-start gap-2 rounded-2xl border px-4 py-3 text-xs font-bold leading-5 ${
        isSuccess
          ? "border-[#c8e2d1] bg-[#eef8f1] text-[#17683a]"
          : "border-[#efcfd4] bg-[#fff4f5] text-[#a72e43]"
      }`}
    >
      {isSuccess ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      {message}
    </p>
  );
}

export function Field({
  children,
  className = "",
  hint,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  hint?: string;
  label: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-[11px] font-extrabold text-[#29483d]">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-[10px] font-medium leading-4 text-[#7b8a83]">{hint}</span> : null}
    </label>
  );
}
