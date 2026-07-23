import type { LucideIcon } from "lucide-react";
import { CircleAlert, Database, Inbox } from "lucide-react";
import type { SupplierDataStatus } from "@/features/supplier/data";
import type { SupplierOrderStatus } from "@/features/supplier/workspace";

export const cardClass = "rounded-[18px] border border-[#dfeae2] bg-white shadow-[0_8px_28px_rgba(18,59,48,.035)]";
export const inputClass = "h-11 w-full rounded-xl border border-[#d8e4dd] bg-[#fbfdfc] px-3 text-sm font-semibold text-[#163c2b] outline-none transition placeholder:text-[#91a39a] focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]";
export const textareaClass = `${inputClass} min-h-24 py-3`;
export const primaryButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(7,150,77,.15)] transition hover:bg-[#00613f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f] disabled:opacity-50";
export const secondaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#b9dcc8] bg-white px-4 text-xs font-extrabold text-[#08783f] transition hover:bg-[#f4faf6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f]";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits }).format(value);
}

export function formatDate(value: string, includeTime = false) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function shortId(value: string) {
  return value ? `#${value.slice(0, 8).toUpperCase()}` : "—";
}

export function ActionNotice({ result }: { result?: string | string[] }) {
  const value = Array.isArray(result) ? result[0] : result;
  if (!value) return null;
  const success = value === "saved";
  const message = success
    ? "Perubahan berhasil disimpan."
    : value === "validation"
      ? "Periksa kembali data yang dimasukkan."
      : value === "setup"
        ? "Fitur belum siap. Terapkan migration 009–018 secara berurutan."
        : value === "verification"
          ? "Verifikasi KYC level 2 wajib sebelum menjalankan aktivitas supplier."
          : "Perubahan belum dapat disimpan. Coba lagi.";
  return (
    <p aria-live="polite" className={`mb-5 rounded-xl border px-4 py-3 text-xs font-bold ${success ? "border-[#cbe5d4] bg-[#edf8f0] text-[#08783f]" : "border-[#f0d1c4] bg-[#fff5f1] text-[#a7462d]"}`}>
      {message}
    </p>
  );
}

export function DataState({ status }: { status: SupplierDataStatus }) {
  if (status === "ready") return null;
  const setup = status === "setup-required";
  return (
    <section className={`${cardClass} grid min-h-72 place-items-center p-8 text-center`}>
      <div className="max-w-lg">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f5ec] text-[#08783f]">
          {setup ? <Database className="h-6 w-6" /> : <CircleAlert className="h-6 w-6" />}
        </span>
        <h2 className="mt-5 text-xl font-extrabold text-[#10231d]">{setup ? "Workspace supplier belum disiapkan" : "Data belum dapat dimuat"}</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[#6b7b75]">
          {setup
            ? "Terapkan migration 202607230009–202607230018 secara berurutan untuk mengaktifkan katalog tunggal, ambang diskon, pesanan, notifikasi, dan verifikasi supplier."
            : "Koneksi data supplier sedang bermasalah. Muat ulang halaman atau coba beberapa saat lagi."}
        </p>
      </div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-48 place-items-center px-6 py-10 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f5ec] text-[#08783f]"><Inbox className="h-5 w-5" /></span>
        <h3 className="mt-4 text-sm font-extrabold text-[#163c2b]">{title}</h3>
        <p className="mt-2 text-xs font-medium leading-6 text-[#6b7b75]">{description}</p>
      </div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action }: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#507f63]">{eyebrow}</p> : null}
        <h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-.025em] text-[#10231d]">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-[#6b7b75]">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function StatCard({ label, value, detail, icon: Icon, tone = "green" }: {
  label: string;
  value: React.ReactNode;
  detail: string;
  icon: LucideIcon;
  tone?: "green" | "orange" | "blue";
}) {
  const colors = tone === "orange" ? "bg-[#fff0df] text-[#c76516]" : tone === "blue" ? "bg-[#e9f2ff] text-[#0868d7]" : "bg-[#e8f5ec] text-[#08783f]";
  return (
    <article className={`${cardClass} min-h-36 p-5`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] ${colors}`}><Icon className="h-5 w-5" /></span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[#6b7b75]">{label}</p>
          <strong className="mt-2 block font-[family-name:var(--font-worker-display)] text-3xl font-semibold tracking-[-.04em] text-[#10231d]">{value}</strong>
        </div>
      </div>
      <p className="mt-4 text-[10px] font-semibold leading-5 text-[#6b7b75]">{detail}</p>
    </article>
  );
}

export function StatusBadge({ status }: { status: SupplierOrderStatus | "active" | "inactive" | "approved" | "verified" | "not_submitted" }) {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    accepted: "Diterima",
    rejected: "Ditolak",
    processing: "Diproses",
    shipped: "Dikirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    active: "Aktif",
    inactive: "Nonaktif",
    approved: "Disetujui",
    verified: "Terverifikasi",
    not_submitted: "Belum diajukan",
    unknown: "Status tidak dikenal",
  };
  const tone = status === "active" || status === "completed" || status === "approved" || status === "verified"
    ? "bg-[#e8f5ec] text-[#08783f]"
    : status === "pending" || status === "accepted" || status === "processing" || status === "shipped"
      ? "bg-[#fff0df] text-[#a85c1c]"
      : "bg-[#f2f4f3] text-[#66736d]";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-extrabold ${tone}`}>{labels[status] ?? status}</span>;
}
