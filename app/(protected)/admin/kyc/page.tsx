import Link from "next/link";
import {
  BadgeCheck,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileWarning,
  ShieldCheck,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  getAdminKyc,
  normalizeAdminKycFilters,
  type AdminKycSubmission,
} from "@/features/admin/data/get-admin-kyc";
import { reviewKycAction } from "@/features/admin/kyc-actions";
import { requireRole } from "@/lib/auth/access";
import { roleLabel } from "@/lib/auth/roles";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const STATUS_PRESENTATION = {
  pending: { label: "Menunggu review", classes: "bg-[#fff2df] text-[#a66013]" },
  approved: { label: "Disetujui", classes: "bg-[#e8f6ee] text-[#087447]" },
  rejected: { label: "Ditolak", classes: "bg-[#fff0f0] text-[#b33e48]" },
} as const;

const RESULT_MESSAGES: Record<string, { message: string; classes: string }> = {
  approved: { message: "KYC disetujui dan profil ditandai terverifikasi.", classes: "border-[#bcdcc9] bg-[#edf8f1] text-[#087447]" },
  rejected: { message: "KYC ditolak. Catatan tersimpan dan pengguna telah diberi notifikasi.", classes: "border-[#efc9cb] bg-[#fff3f3] text-[#a63c46]" },
  invalid: { message: "Keputusan atau catatan review tidak valid.", classes: "border-[#efc9cb] bg-[#fff3f3] text-[#a63c46]" },
  stale: { message: "Pengajuan tersebut sudah direview oleh administrator lain.", classes: "border-[#ecd4ae] bg-[#fff8ed] text-[#98601e]" },
  error: { message: "Review belum dapat disimpan. Silakan coba lagi.", classes: "border-[#efc9cb] bg-[#fff3f3] text-[#a63c46]" },
};

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : `${dateTimeFormatter.format(date)} WIB`;
}

function formatFileSize(value: number | null) {
  if (value === null) return null;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function ReviewForms({ submission, status, page }: Readonly<{
  submission: AdminKycSubmission;
  status: string;
  page: number;
}>) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <form action={reviewKycAction} className="rounded-2xl border border-[#cce2d5] bg-[#f4fbf7] p-4">
        <input type="hidden" name="submissionId" value={submission.id} />
        <input type="hidden" name="decision" value="approve" />
        <input type="hidden" name="returnStatus" value={status} />
        <input type="hidden" name="returnPage" value={page} />
        <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#477563]">
          Catatan persetujuan (opsional)
          <textarea name="note" maxLength={500} rows={2} className="resize-none rounded-xl border border-[#c7ddd0] bg-white p-3 text-xs font-medium normal-case tracking-normal outline-none focus:border-[#25875c]" />
        </label>
        <button type="submit" className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0b7449] px-4 text-[10px] font-extrabold text-white">
          <BadgeCheck className="h-4 w-4" /> Setujui & tandai terverifikasi
        </button>
      </form>
      <form action={reviewKycAction} className="rounded-2xl border border-[#ecd0d2] bg-[#fff7f7] p-4">
        <input type="hidden" name="submissionId" value={submission.id} />
        <input type="hidden" name="decision" value="reject" />
        <input type="hidden" name="returnStatus" value={status} />
        <input type="hidden" name="returnPage" value={page} />
        <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#90565b]">
          Alasan penolakan
          <textarea name="note" required maxLength={500} rows={2} className="resize-none rounded-xl border border-[#e4c5c8] bg-white p-3 text-xs font-medium normal-case tracking-normal outline-none focus:border-[#ba6269]" />
        </label>
        <button type="submit" className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#dcaeb2] bg-white px-4 text-[10px] font-extrabold text-[#a63c46]">
          <FileWarning className="h-4 w-4" /> Tolak pengajuan
        </button>
      </form>
    </div>
  );
}

export default async function AdminKycPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    status?: string | string[];
    page?: string | string[];
    result?: string | string[];
  }>;
}>) {
  const [, rawParams] = await Promise.all([requireRole(["admin"]), searchParams]);
  const filters = normalizeAdminKycFilters(rawParams);
  const data = await getAdminKyc(filters);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const rawResult = Array.isArray(rawParams.result) ? rawParams.result[0] : rawParams.result;
  const resultMessage = rawResult ? RESULT_MESSAGES[rawResult] : null;

  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (filters.status !== "pending") params.set("status", filters.status);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/admin/kyc?${query}` : "/admin/kyc";
  }

  return (
    <AdminShell activePath="/admin/kyc">
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        <section>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#42806a]">Verifikasi identitas</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em]">Review KYC</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-[#687a73]">
            Tinjau metadata dokumen yang telah disanitasi, catat keputusan, dan beri status terverifikasi hanya setelah persetujuan administrator.
          </p>
        </section>

        <section className="mt-6 flex gap-3 rounded-[20px] border border-[#d6e4dc] bg-[#f8fbf9] p-4 text-xs font-medium leading-6 text-[#426457]">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#087447]" />
          <p><strong className="font-extrabold">Supplier wajib mencapai verifikasi level 2.</strong> Produk, penawaran pool, dan pemrosesan pesanan aktif setelah NIB/SIUP disetujui administrator.</p>
        </section>

        {resultMessage ? <p role="status" className={`mt-5 rounded-2xl border px-4 py-3 text-xs font-bold ${resultMessage.classes}`}>{resultMessage.message}</p> : null}

        <section className="mt-5 grid gap-4 sm:grid-cols-2">
          <article className="rounded-[20px] border border-[#dce6e0] bg-white p-5">
            <Clock3 className="h-5 w-5 text-[#a66013]" />
            <p className="mt-4 text-xs font-bold text-[#718079]">Menunggu review</p>
            <p className="mt-1 text-3xl font-extrabold">{data.pendingCount}</p>
          </article>
          <article className="rounded-[20px] border border-[#dce6e0] bg-white p-5">
            <FileCheck2 className="h-5 w-5 text-[#315f9a]" />
            <p className="mt-4 text-xs font-bold text-[#718079]">Hasil pada filter</p>
            <p className="mt-1 text-3xl font-extrabold">{data.total}</p>
          </article>
        </section>

        <form method="get" className="mt-5 flex flex-col gap-3 rounded-[20px] border border-[#dce6e0] bg-white p-4 sm:flex-row sm:items-end">
          <label className="grid flex-1 gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
            Status pengajuan
            <select name="status" defaultValue={filters.status} className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal outline-none focus:border-[#25875c]">
              <option value="pending">Menunggu review</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="all">Semua status</option>
            </select>
          </label>
          <button type="submit" className="h-11 rounded-xl bg-[#0b7449] px-6 text-xs font-extrabold text-white">Terapkan filter</button>
        </form>

        <section className="mt-5 space-y-4" aria-label="Antrean review KYC">
          {data.submissions.length ? data.submissions.map((submission) => {
            const displayName = submission.businessName ?? submission.displayName ?? "Pengguna Pull";
            const presentation = STATUS_PRESENTATION[submission.status];
            const verified = submission.profileKycStatus === "verified" && submission.verificationLevel >= 2;
            const fileSize = formatFileSize(submission.metadata.fileSize);
            return (
              <article key={submission.id} className="rounded-[22px] border border-[#dce6e0] bg-white p-5 shadow-[0_8px_24px_rgba(23,58,44,.04)] sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-extrabold">{displayName}</h2>
                      <span className={`rounded-lg px-2.5 py-1 text-[9px] font-extrabold ${presentation.classes}`}>{presentation.label}</span>
                      <span className={`rounded-lg px-2.5 py-1 text-[9px] font-extrabold ${verified ? "bg-[#e8f6ee] text-[#087447]" : "bg-[#edf1ef] text-[#687a73]"}`}>
                        {verified ? "Profil terverifikasi" : "Belum terverifikasi"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-[#718079]">{submission.email} · {submission.role ? roleLabel(submission.role) : "Tanpa role"}</p>
                    {submission.role === "supplier" && !verified ? <p className="mt-2 text-[10px] font-bold text-[#8a672e]">Supplier tetap aktif, tetapi belum berstatus terverifikasi.</p> : null}
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#799087]">Diajukan</p>
                    <p className="mt-1 text-[10px] font-bold text-[#526b62]">{formatDateTime(submission.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-[#f5f8f6] p-4"><p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#779087]">Jenis dokumen</p><p className="mt-2 text-xs font-extrabold">{submission.documentType}</p></div>
                  <div className="rounded-2xl bg-[#f5f8f6] p-4"><p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#779087]">File aman</p><p className="mt-2 break-all text-xs font-extrabold">{submission.metadata.fileName ?? "Nama file tidak tersedia"}</p><p className="mt-1 text-[9px] font-semibold text-[#7b8984]">{[submission.metadata.mimeType, fileSize].filter(Boolean).join(" · ") || "Metadata file terbatas"}</p></div>
                  <div className="rounded-2xl bg-[#f5f8f6] p-4"><p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#779087]">Dokumen privat</p><code className="mt-2 block break-all text-[10px] font-bold text-[#315b4c]">{submission.storagePath ?? "Path tidak lolos validasi"}</code>{submission.documentUrl ? <a href={submission.documentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#087447]">Buka dokumen 5 menit <ExternalLink className="h-3.5 w-3.5" /></a> : null}</div>
                </div>

                {submission.status === "pending" ? <div className="mt-5"><ReviewForms submission={submission} status={filters.status} page={filters.page} /></div> : (
                  <div className="mt-5 rounded-2xl border border-[#e1e9e4] bg-[#fafcfb] p-4 text-xs text-[#526b62]">
                    <p className="font-extrabold">Direview {formatDateTime(submission.reviewedAt)}</p>
                    <p className="mt-2 font-medium leading-6">{submission.reviewNote ?? submission.rejectionReason ?? "Tidak ada catatan review."}</p>
                  </div>
                )}
              </article>
            );
          }) : (
            <div className="rounded-[22px] border border-[#dce6e0] bg-white px-6 py-16 text-center">
              <FileCheck2 className="mx-auto h-8 w-8 text-[#6d8b7f]" />
              <h2 className="mt-4 text-sm font-extrabold">Tidak ada pengajuan pada filter ini</h2>
              <p className="mt-2 text-xs font-medium text-[#7a8a83]">Pilih status lain atau tunggu pengajuan KYC baru.</p>
            </div>
          )}
        </section>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-[#73847d]">Halaman {Math.min(data.page, totalPages)} dari {totalPages}</p>
          <div className="flex gap-2">
            <Link aria-disabled={data.page <= 1} href={pageHref(Math.max(1, data.page - 1))} className={`inline-flex h-9 items-center rounded-xl border border-[#d2dfd8] bg-white px-4 text-[10px] font-extrabold text-[#315b4c] ${data.page <= 1 ? "pointer-events-none opacity-40" : ""}`}>Sebelumnya</Link>
            <Link aria-disabled={data.page >= totalPages} href={pageHref(Math.min(totalPages, data.page + 1))} className={`inline-flex h-9 items-center rounded-xl border border-[#d2dfd8] bg-white px-4 text-[10px] font-extrabold text-[#315b4c] ${data.page >= totalPages ? "pointer-events-none opacity-40" : ""}`}>Berikutnya</Link>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}
