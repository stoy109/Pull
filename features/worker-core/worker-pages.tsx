import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Coins,
  Database,
  ExternalLink,
  FileBadge,
  FileCheck2,
  Filter,
  FolderOpen,
  IdCard,
  LogOut,
  Mail,
  MapPin,
  Medal,
  Phone,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  WalletCards,
} from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import {
  confirmCompletionAction,
  markNotificationReadAction,
  saveWorkerPreferencesAction,
  submitJobApplicationAction,
  submitKycRecordAction,
  submitRatingAction,
  withdrawApplicationAction,
} from "./actions";
import type {
  WorkerApplication,
  WorkerFilters,
  WorkerJob,
  WorkerPage,
  WorkerWorkspace,
} from "./types";
import { WorkerJobMap } from "./worker-job-map";

const cardClass = "rounded-[18px] border border-[#dce7e0] bg-white shadow-[0_8px_28px_rgba(18,59,48,.035)]";
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const noticeCopy: Record<string, { message: string; tone: "success" | "error" | "warning" }> = {
  "application-sent": { message: "Lamaran tersimpan. Kontak WhatsApp pemilik lowongan belum tersedia.", tone: "success" },
  "application-duplicate": { message: "Lowongan ini sudah pernah Anda lamar.", tone: "warning" },
  "application-validation": { message: "Pesan lamaran harus berisi 5–300 karakter.", tone: "error" },
  "application-save": { message: "Lamaran belum dapat disimpan. Pastikan lowongan masih diterbitkan.", tone: "error" },
  withdrawn: { message: "Lamaran berhasil ditarik.", tone: "success" },
  "withdraw-failed": { message: "Hanya lamaran berstatus terkirim yang dapat ditarik.", tone: "error" },
  "completion-confirmed": { message: "Penyelesaian kerja dikonfirmasi. Status selesai aktif setelah kedua pihak mengonfirmasi.", tone: "success" },
  "completion-failed": { message: "Konfirmasi hanya tersedia untuk pekerjaan yang sudah diterima.", tone: "error" },
  "rating-sent": { message: "Rating tersimpan untuk transaksi pekerjaan ini.", tone: "success" },
  "rating-validation": { message: "Pilih rating 1–5. Ulasan opsional harus berisi 3–1000 karakter.", tone: "error" },
  "rating-failed": { message: "Rating hanya dapat dikirim sekali setelah pekerjaan selesai.", tone: "error" },
  "notification-read": { message: "Notifikasi ditandai sudah dibaca.", tone: "success" },
  "notification-failed": { message: "Notifikasi belum dapat diperbarui.", tone: "error" },
  "kyc-sent": { message: "Dokumen tersimpan di bucket privat dan masuk antrean peninjauan.", tone: "success" },
  "kyc-pending": { message: "Dokumen dengan jenis yang sama masih menunggu peninjauan.", tone: "warning" },
  "kyc-validation": { message: "Pilih jenis dokumen identitas yang tersedia.", tone: "error" },
  "kyc-file-size": { message: "Pilih satu dokumen berukuran maksimal 850 KB.", tone: "error" },
  "kyc-file-type": { message: "Format dokumen harus PDF, JPG, atau PNG.", tone: "error" },
  "kyc-storage": { message: "Penyimpanan KYC belum siap. Terapkan migration 202607230011_identity_storage_worker_reads.sql.", tone: "error" },
  "kyc-save": { message: "Dokumen terunggah tetapi catatan KYC belum dapat disimpan. Silakan coba lagi.", tone: "error" },
  "preferences-saved": { message: "Preferensi matching tersimpan.", tone: "success" },
  "preferences-validation": { message: "Periksa status kerja, upah minimum, kategori, dan radius.", tone: "error" },
  "preferences-save": { message: "Preferensi belum dapat disimpan.", tone: "error" },
  setup: { message: "Fungsi worker belum lengkap. Terapkan migration 009–014 pada Supabase.", tone: "error" },
  invalid: { message: "Permintaan tidak valid dan tidak dijalankan.", tone: "error" },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Belum ditentukan";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Tanggal tidak tersedia" : dateFormatter.format(date);
}

function formatWage(job: WorkerJob) {
  return job.wageAmount === null
    ? "Upah belum dicantumkan"
    : `${currencyFormatter.format(job.wageAmount)}${job.wageUnit ? ` / ${job.wageUnit}` : ""}`;
}

function safeUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: "Diterima",
    approved: "Disetujui",
    completed: "Selesai",
    not_submitted: "Belum diajukan",
    pending: "Menunggu tinjauan",
    rejected: "Ditolak",
    submitted: "Terkirim",
    verified: "Terverifikasi",
    withdrawn: "Ditarik",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "completed" || status === "verified" || status === "approved"
      ? "bg-[#e4f5e9] text-[#08783f]"
      : status === "accepted" || status === "pending" || status === "submitted"
        ? "bg-[#fff1df] text-[#ae621e]"
        : status === "rejected" || status === "withdrawn"
          ? "bg-[#fff0f0] text-[#b43e48]"
          : "bg-[#eef2ef] text-[#60736a]";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-extrabold capitalize ${tone}`}>{statusLabel(status)}</span>;
}

function Notice({ notice }: { notice?: string }) {
  const content = notice ? noticeCopy[notice] : null;
  if (!content) return null;
  const tone =
    content.tone === "success"
      ? "border-[#bfe2cb] bg-[#eaf7ee] text-[#08783f]"
      : content.tone === "warning"
        ? "border-[#f1d4ae] bg-[#fff7eb] text-[#9a581e]"
        : "border-[#efc9cd] bg-[#fff4f4] text-[#a63a45]";
  return (
    <p role="status" aria-live="polite" className={`mb-5 rounded-xl border px-4 py-3 text-xs font-bold leading-5 ${tone}`}>
      {content.message}
    </p>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#4f8063]">{eyebrow}</p>
        <h1 className="mt-2 font-[family-name:var(--font-worker-display)] text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#0c261c] sm:text-[36px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-xs font-medium leading-6 text-[#668074] sm:text-[13px]">{description}</p>
      </div>
      {action}
    </header>
  );
}

function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e7f4eb] text-[#08783f]">{icon}</span>
        <h2 className="mt-4 font-[family-name:var(--font-worker-display)] text-lg font-semibold tracking-[-0.03em] text-[#0c261c]">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-6 text-[#6e8177]">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

function SetupState({ data }: { data: WorkerWorkspace }) {
  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="border-l-[6px] border-[#e87513] p-6 sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0df] text-[#b9681d]"><Database className="h-5 w-5" /></span>
        <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#8d704f]">{data.setupIssue ? "Setup database diperlukan" : "Data tidak tersedia"}</p>
        <h1 className="mt-2 font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-0.04em] text-[#0c261c]">
          {data.setupIssue ? "Worker core belum siap digunakan" : "Ruang kerja belum dapat dibuka"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#63786e]">{data.loadIssue}</p>
        {data.setupIssue ? (
          <div className="mt-6 rounded-xl border border-[#ead9c3] bg-[#fffaf3] p-4 text-xs leading-6 text-[#71583c]">
            Jalankan migration <code className="rounded bg-white px-1.5 py-1 font-mono text-[10px] font-bold">202607230009</code> sampai <code className="rounded bg-white px-1.5 py-1 font-mono text-[10px] font-bold">202607230014</code> secara berurutan. Halaman ini tidak menggunakan data mock sebagai pengganti.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string | number; detail: string }) {
  return (
    <article className={`${cardClass} flex min-h-36 flex-col p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold text-[#52705f]">{label}</p>
          <strong className="mt-2 block font-[family-name:var(--font-worker-display)] text-[32px] font-semibold leading-none tracking-[-0.05em] text-[#0c261c]">{value}</strong>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7f4eb] text-[#08783f]">{icon}</span>
      </div>
      <p className="mt-auto pt-4 text-[9px] font-semibold leading-4 text-[#799087]">{detail}</p>
    </article>
  );
}

function DashboardPage({ data, notice }: { data: WorkerWorkspace; notice?: string }) {
  const profile = data.profile!;
  const firstName = profile.displayName?.split(/\s+/)[0] || "Pekerja";
  const totalPoints = data.points.reduce((total, entry) => total + entry.points, 0);
  const activeApplications = data.applications.filter((item) => item.status === "submitted" || item.status === "accepted").length;
  const unread = data.notifications.filter((item) => !item.readAt).length;
  const assignments = data.applications.filter((item) => item.status === "accepted").slice(0, 3);

  return (
    <>
      <Notice notice={notice} />
      <section className="relative overflow-hidden rounded-[22px] border border-[#cfe3d5] bg-[#eaf5ed] shadow-[0_12px_36px_rgba(18,59,48,.045)]">
        <div className="relative z-10 px-5 py-8 sm:max-w-[68%] sm:px-8 sm:py-10 lg:px-10">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#4d8060]">Buku kerja aktif</p>
          <h1 className="mt-3 font-[family-name:var(--font-worker-display)] text-[30px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#0b2a1e] sm:text-[38px]">Selamat datang, {firstName}.</h1>
          <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-[#3b674f]">Pantau lamaran, konfirmasi pekerjaan, dan bangun riwayat kerja dari data yang tersimpan di Pull.</p>
          <Link href="/worker/jobs" className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white transition hover:bg-[#006a37] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9cd0ad]">
            Cari pekerjaan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="absolute -bottom-20 -right-12 h-64 w-64 rounded-full border-[38px] border-[#bfdcc7]/60" aria-hidden="true" />
        <div className="absolute bottom-8 right-8 hidden w-44 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur sm:block" aria-hidden="true">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#5a7b67]">Status hari ini</p>
          <p className="mt-2 font-[family-name:var(--font-worker-display)] text-2xl font-semibold text-[#0b2a1e]">{assignments.length ? `${assignments.length} tugas` : "Siap melamar"}</p>
        </div>
      </section>

      <section aria-label="Ringkasan akun" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<WalletCards className="h-5 w-5" />} label="Lamaran aktif" value={activeApplications} detail={`${data.applications.length} total lamaran tersimpan`} />
        <Metric icon={<CheckCircle2 className="h-5 w-5" />} label="Pekerjaan selesai" value={data.applications.filter((item) => item.status === "completed").length} detail="Selesai setelah konfirmasi kedua pihak" />
        <Metric icon={<Coins className="h-5 w-5" />} label="Poin nyata" value={totalPoints} detail={`${data.points.length} catatan di points ledger`} />
        <Metric icon={<Bell className="h-5 w-5" />} label="Belum dibaca" value={unread} detail={`${data.notifications.length} notifikasi tersimpan`} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className={`${cardClass} overflow-hidden`}>
          <header className="flex items-end justify-between gap-4 border-b border-[#e2ebe5] px-5 py-5 sm:px-6">
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#507f63]">Pekerjaan berikutnya</p><h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Tugas yang sudah diterima</h2></div>
            <Link href="/worker/applications" className="text-[10px] font-extrabold text-[#08783f]">Semua lamaran</Link>
          </header>
          {assignments.length ? (
            <div className="divide-y divide-[#e5ede8] px-5 sm:px-6">
              {assignments.map((application) => (
                <article key={application.id} className="flex items-center gap-4 py-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e7f4eb] text-[#08783f]"><BriefcaseBusiness className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1"><h3 className="truncate text-xs font-extrabold text-[#1d4634]">{application.job?.title || "Detail lowongan tidak tersedia"}</h3><p className="mt-1 flex items-center gap-1.5 text-[9px] font-semibold text-[#75897f]"><CalendarDays className="h-3 w-3" /> {formatDate(application.job?.startDate)}</p></div>
                  <Link href="/worker/applications" aria-label="Buka detail lamaran" className="grid h-9 w-9 place-items-center rounded-xl border border-[#dce7e0] text-[#4f6d5e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08783f]"><ChevronRight className="h-4 w-4" /></Link>
                </article>
              ))}
            </div>
          ) : <EmptyState icon={<Clock3 className="h-6 w-6" />} title="Belum ada tugas aktif" description="Pekerjaan yang diterima akan muncul di sini untuk dikonfirmasi saat selesai." />}
        </div>

        <aside className={`${cardClass} p-5 sm:p-6`}>
          <div className="flex items-center justify-between"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#507f63]">Kepercayaan</p><h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Jejak kerja Anda</h2></div><ShieldCheck className="h-7 w-7 text-[#08783f]" /></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#f0f7f2] p-4"><p className="text-[9px] font-bold text-[#668074]">Trust score</p><p className="mt-2 font-[family-name:var(--font-worker-display)] text-3xl font-semibold tracking-[-0.05em]">{profile.trustScore}</p><p className="mt-1 text-[9px] font-semibold text-[#789087]">dari 100</p></div>
            <div className="rounded-2xl bg-[#f0f7f2] p-4"><p className="text-[9px] font-bold text-[#668074]">Rating masuk</p><p className="mt-2 font-[family-name:var(--font-worker-display)] text-3xl font-semibold tracking-[-0.05em]">{profile.ratingCount}</p><p className="mt-1 text-[9px] font-semibold text-[#789087]">transaksi</p></div>
          </div>
          <Link href="/worker/trust" className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#bddac7] text-[10px] font-extrabold text-[#08783f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08783f]">Lihat bukti kerja</Link>
        </aside>
      </section>
    </>
  );
}

function OwnerName({ value }: { value: string | null }) {
  return value ? <span>{value}</span> : <span className="text-[#9a6b3d]">Nama usaha dibatasi oleh kebijakan profil</span>;
}

function workerJobsHref(filters: WorkerFilters, view: WorkerFilters["view"]) {
  const params = new URLSearchParams({ view });
  if (filters.query) params.set("q", filters.query);
  if (filters.category) params.set("category", filters.category);
  if (filters.district) params.set("district", filters.district);
  if (filters.minWage !== undefined) params.set("minWage", String(filters.minWage));
  return `/worker/jobs?${params.toString()}`;
}

function JobBoardPage({ data, filters, notice }: { data: WorkerWorkspace; filters: WorkerFilters; notice?: string }) {
  const applicationsByJob = new Map(data.applications.map((application) => [application.jobId, application]));
  const filtered = Boolean(filters.query || filters.category || filters.district || filters.minWage !== undefined);

  return (
    <>
      <PageHeader eyebrow="Peluang tersimpan" title="Cari pekerjaan" description="Lowongan nyata diurutkan berdasarkan preferensi, keahlian, wilayah, upah, dan verifikasi UMKM." />
      <Notice notice={notice} />

      <form action="/worker/jobs" method="get" className={`${cardClass} grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[1.2fr_1fr_1fr_.75fr_auto] xl:items-end`}>
        <input type="hidden" name="view" value={filters.view} />
        <label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Cari lowongan<input name="q" type="search" defaultValue={filters.query} maxLength={80} placeholder="Posisi, UMKM, atau lokasi" className="h-11 rounded-xl border border-[#d6e3db] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none transition focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]" /></label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Kabupaten / kota<input name="district" defaultValue={filters.district} maxLength={80} placeholder="Contoh: Surakarta" className="h-11 rounded-xl border border-[#d6e3db] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none transition focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]" /></label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Kategori<input name="category" defaultValue={filters.category} maxLength={80} placeholder="Contoh: Produksi" className="h-11 rounded-xl border border-[#d6e3db] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none transition focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]" /></label>
        <label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Upah minimum<input name="minWage" defaultValue={filters.minWage} type="number" min="0" max="1000000000" step="1000" inputMode="numeric" placeholder="100000" className="h-11 rounded-xl border border-[#d6e3db] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none transition focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]" /></label>
        <div className="flex gap-2"><button className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white transition hover:bg-[#006a37] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9cd0ad]"><Filter className="h-4 w-4" /> Terapkan</button>{filtered ? <Link href={`/worker/jobs?view=${filters.view}`} className="inline-flex h-11 items-center justify-center rounded-xl border border-[#d6e3db] px-4 text-[10px] font-extrabold text-[#526c5e]">Hapus</Link> : null}</div>
      </form>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] font-bold text-[#688074]">{data.jobs.length} lowongan ditemukan · data langsung dari Supabase</p>
        <div className="inline-flex self-start rounded-xl border border-[#d6e3db] bg-white p-1" aria-label="Tampilan papan loker">
          <Link href={workerJobsHref(filters, "list")} aria-current={filters.view === "list" ? "page" : undefined} className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[9px] font-extrabold ${filters.view === "list" ? "bg-[#08783f] text-white" : "text-[#526c5e]"}`}><BriefcaseBusiness className="h-3.5 w-3.5" /> Daftar</Link>
          <Link href={workerJobsHref(filters, "map")} aria-current={filters.view === "map" ? "page" : undefined} className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[9px] font-extrabold ${filters.view === "map" ? "bg-[#08783f] text-white" : "text-[#526c5e]"}`}><MapPin className="h-3.5 w-3.5" /> Peta</Link>
        </div>
      </div>
      {data.jobs.length && filters.view === "map" ? (
        <WorkerJobMap jobs={data.jobs} radiusKm={data.preferences.radiusKm} />
      ) : data.jobs.length ? (
        <section aria-label="Daftar lowongan" className="mt-3 grid gap-4 lg:grid-cols-2">
          {data.jobs.map((job) => {
            const application = applicationsByJob.get(job.id);
            return (
              <article id={`worker-job-${job.id}`} key={job.id} className={`${cardClass} relative scroll-mt-24 overflow-hidden border-l-[5px] border-l-[#08783f] p-5 sm:p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#5e826d]">{job.category || "Kategori belum diisi"}</p><h2 className="mt-2 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.035em] text-[#0c261c]">{job.title}</h2><p className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#54705f]"><OwnerName value={job.ownerName} />{job.ownerVerified ? <span className="inline-flex items-center gap-1 text-[#08783f]"><BadgeCheck className="h-3 w-3" /> Terverifikasi</span> : null}</p></div>
                  {application ? <StatusBadge status={application.status} /> : <span className="rounded-full bg-[#e7f4eb] px-2.5 py-1 text-[9px] font-extrabold text-[#08783f]">Terbuka</span>}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-[#6d8277]"><span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#08783f]" />{job.district || "Wilayah belum diisi"}</span><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-[#08783f]" />{formatDate(job.startDate)}</span>{job.durationDays ? <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-[#08783f]" />{job.durationDays} hari</span> : null}</div>
                <p className="mt-4 text-xs font-medium leading-6 text-[#5f7469]">{job.description}</p>
                {job.matchScore > 0 ? <div className="mt-4 rounded-xl border border-[#cfe1d5] bg-[#f1f8f3] p-3.5"><p className="text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#08783f]">Kecocokan {job.matchScore}%</p><p className="mt-1.5 text-[10px] font-medium leading-5 text-[#5f7469]">{job.matchReasons.join(" · ")}</p></div> : null}
                {job.requirements ? <div className="mt-4 rounded-xl bg-[#f6f9f7] p-3.5"><p className="text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#668074]">Persyaratan</p><p className="mt-1.5 whitespace-pre-line text-[10px] font-medium leading-5 text-[#5f7469]">{job.requirements}</p></div> : null}
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-dashed border-[#cadbd0] pt-4"><div><p className="text-[9px] font-bold text-[#789087]">Upah</p><p className="mt-1 text-xs font-extrabold text-[#17643d]">{formatWage(job)}</p></div><p className="text-right text-[9px] font-semibold text-[#789087]">{job.hoursPerDay ? `${job.hoursPerDay} jam/hari` : "Jam belum diisi"}<br />Kuota {job.quota}</p></div>
                {application ? <Link href="/worker/applications" className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#bddac7] text-[10px] font-extrabold text-[#08783f]">Lihat lamaran <ArrowRight className="h-3.5 w-3.5" /></Link> : (
                  <details className="mt-5 rounded-xl border border-[#cfe0d6] bg-[#fbfdfc] open:bg-white">
                    <summary className="flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-xl text-xs font-extrabold text-[#08783f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e0f2e6]"><Sparkles className="h-4 w-4" /> Lamar lowongan</summary>
                    <form action={submitJobApplicationAction} className="border-t border-[#e1ebe5] p-4"><input type="hidden" name="jobId" value={job.id} /><label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Pesan untuk pemilik lowongan<textarea name="message" required minLength={5} maxLength={300} rows={4} placeholder="Jelaskan kesiapan dan pengalaman yang relevan." className="resize-y rounded-xl border border-[#d6e3db] bg-white p-3 text-xs font-medium leading-5 outline-none focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]" /></label><button className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#08783f] px-3 text-xs font-extrabold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9cd0ad]">Simpan lamaran & buka WhatsApp</button></form>
                  </details>
                )}
              </article>
            );
          })}
        </section>
      ) : <section className={`${cardClass} mt-4`}><EmptyState icon={<Search className="h-6 w-6" />} title={filtered ? "Tidak ada lowongan yang cocok" : "Belum ada lowongan diterbitkan"} description={filtered ? "Ubah atau hapus filter untuk melihat lebih banyak pekerjaan." : "Lowongan baru akan tampil setelah UMKM menerbitkannya."} action={filtered ? <Link href="/worker/jobs" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white">Hapus filter</Link> : undefined} /></section>}
    </>
  );
}

function ApplicationActions({ application, rating }: { application: WorkerApplication; rating: WorkerWorkspace["ratingsGiven"][number] | undefined }) {
  return (
    <div className="mt-5 space-y-3 border-t border-[#e2ebe5] pt-4">
      {application.status === "submitted" ? <form action={withdrawApplicationAction}><input type="hidden" name="applicationId" value={application.id} /><button className="inline-flex h-10 items-center justify-center rounded-xl border border-[#efc7ca] px-4 text-[10px] font-extrabold text-[#ad3c47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d75b66]">Tarik lamaran</button></form> : null}
      {application.status === "accepted" && !application.workerConfirmedAt ? <form action={confirmCompletionAction} className="rounded-xl border border-[#cce1d3] bg-[#f3f9f5] p-4"><p className="text-[10px] font-medium leading-5 text-[#587064]">Konfirmasi hanya setelah pekerjaan benar-benar selesai. Status berubah menjadi selesai setelah pemilik usaha juga mengonfirmasi.</p><input type="hidden" name="applicationId" value={application.id} /><button className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-4 text-[10px] font-extrabold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9cd0ad]"><CheckCircle2 className="h-4 w-4" /> Konfirmasi pekerjaan selesai</button></form> : null}
      {application.status === "accepted" && application.workerConfirmedAt ? <p className="flex items-center gap-2 rounded-xl bg-[#fff7eb] px-4 py-3 text-[10px] font-bold text-[#9a621f]"><Clock3 className="h-4 w-4" /> Menunggu konfirmasi penyelesaian dari pemilik usaha.</p> : null}
      {application.status === "completed" && !rating ? <form action={submitRatingAction} className="rounded-xl border border-[#dce7e0] bg-[#fbfdfc] p-4"><input type="hidden" name="applicationId" value={application.id} /><div className="grid gap-3 sm:grid-cols-[140px_1fr]"><label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Rating<select name="score" required defaultValue="" className="h-10 rounded-xl border border-[#d6e3db] bg-white px-3 text-xs font-semibold outline-none focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]"><option value="" disabled>Pilih 1–5</option>{[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} bintang</option>)}</select></label><label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Ulasan (opsional)<textarea name="review" minLength={3} maxLength={1000} rows={3} placeholder="Ceritakan pengalaman bekerja dengan UMKM ini." className="resize-y rounded-xl border border-[#d6e3db] bg-white p-3 text-xs font-medium outline-none focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]" /></label></div><button className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-4 text-[10px] font-extrabold text-white"><Star className="h-4 w-4" /> Kirim rating</button></form> : null}
      {rating ? <div className="rounded-xl bg-[#f1f7f3] p-4"><p className="flex items-center gap-1 text-[#d58a13]" aria-label={`Rating yang diberikan ${rating.score} dari 5`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < rating.score ? "fill-current" : "text-[#cbd7cf]"}`} />)}</p><p className="mt-2 text-[10px] font-bold text-[#597064]">Rating Anda sudah tersimpan.</p>{rating.review ? <p className="mt-1 text-[10px] font-medium leading-5 text-[#70837a]">“{rating.review}”</p> : null}</div> : null}
    </div>
  );
}

function ApplicationsPage({ data, notice }: { data: WorkerWorkspace; notice?: string }) {
  const ratingByApplication = new Map(data.ratingsGiven.filter((rating) => rating.applicationId).map((rating) => [rating.applicationId!, rating]));
  return (
    <>
      <PageHeader eyebrow="Riwayat rekrutmen" title="Lamaran saya" description="Status, konfirmasi penyelesaian, dan rating di bawah berasal dari transaksi pekerjaan yang tersimpan." action={<Link href="/worker/jobs" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-4 text-[10px] font-extrabold text-white">Cari kerja <ArrowRight className="h-3.5 w-3.5" /></Link>} />
      <Notice notice={notice} />
      {data.applications.length ? <section aria-label="Daftar lamaran" className="grid gap-4 xl:grid-cols-2">{data.applications.map((application) => (
        <article key={application.id} className={`${cardClass} p-5 sm:p-6`}>
          <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#64806f]">Dilamar {formatDate(application.createdAt)}</p><h2 className="mt-2 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.035em]">{application.job?.title || "Detail lowongan tidak lagi dapat dibaca"}</h2><p className="mt-1.5 text-[10px] font-bold text-[#5d7567]">{application.job ? <OwnerName value={application.job.ownerName} /> : "Kebijakan lowongan membatasi detail ini"}</p></div><StatusBadge status={application.status} /></div>
          {application.job ? <div className="mt-4 flex flex-wrap gap-3 text-[9px] font-semibold text-[#72867b]"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{application.job.district || "Wilayah belum diisi"}</span><span className="inline-flex items-center gap-1"><Coins className="h-3.5 w-3.5" />{formatWage(application.job)}</span></div> : null}
          <blockquote className="mt-4 rounded-xl bg-[#f6f9f7] p-4 text-[10px] font-medium leading-5 text-[#60756a]">“{application.message}”</blockquote>
          {application.status === "accepted" || application.status === "completed" ? <dl className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl border border-[#e0e9e3] p-3"><dt className="text-[9px] font-bold text-[#778a80]">Konfirmasi pekerja</dt><dd className="mt-1 text-[10px] font-extrabold text-[#315b45]">{application.workerConfirmedAt ? formatDate(application.workerConfirmedAt) : "Belum"}</dd></div><div className="rounded-xl border border-[#e0e9e3] p-3"><dt className="text-[9px] font-bold text-[#778a80]">Konfirmasi UMKM</dt><dd className="mt-1 text-[10px] font-extrabold text-[#315b45]">{application.ownerConfirmedAt ? formatDate(application.ownerConfirmedAt) : "Belum"}</dd></div></dl> : null}
          <ApplicationActions application={application} rating={ratingByApplication.get(application.id)} />
        </article>
      ))}</section> : <section className={cardClass}><EmptyState icon={<WalletCards className="h-6 w-6" />} title="Belum ada lamaran" description="Temukan lowongan yang sesuai lalu kirim pesan lamaran. Semua proses akan tersimpan di halaman ini." action={<Link href="/worker/jobs" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white">Lihat lowongan</Link>} /></section>}
    </>
  );
}

function ProfilePage({ data, notice }: { data: WorkerWorkspace; notice?: string }) {
  const profile = data.profile!;
  const hasPendingKyc = data.kycSubmissions.some((item) => item.status === "pending");
  const canSubmitKyc = profile.kycStatus !== "verified" && !hasPendingKyc;
  const details = [
    { label: "Email", value: profile.email, icon: Mail },
    { label: "Nomor telepon", value: profile.phone, icon: Phone },
    { label: "Bidang kerja", value: profile.headline, icon: BriefcaseBusiness },
    { label: "Area kerja", value: profile.district || profile.deliveryArea, icon: MapPin },
  ];

  return (
    <>
      <PageHeader eyebrow="Identitas tersimpan" title="Profil pekerja" description="Informasi utama berasal dari profil onboarding. Tidak ada perubahan profil yang disimpan di browser." action={<Link href="/onboarding/lengkapi-profil?role=pekerja" className="inline-flex h-10 items-center justify-center rounded-xl border border-[#bddac7] bg-white px-4 text-[10px] font-extrabold text-[#08783f]">Perbarui onboarding</Link>} />
      <Notice notice={notice} />
      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className={`${cardClass} p-5 sm:p-6`}>
          <div className="flex flex-col gap-4 border-b border-[#e2ebe5] pb-5 sm:flex-row sm:items-center"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#0b2a1e] font-[family-name:var(--font-worker-display)] text-2xl font-semibold uppercase text-white">{profile.displayName?.slice(0, 1) || "?"}</span><div><h2 className="font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-0.04em]">{profile.displayName || "Nama belum diisi"}</h2><p className="mt-1 text-xs font-semibold text-[#668074]">{profile.headline || "Bidang kerja belum diisi"}</p><div className="mt-2 flex flex-wrap gap-2"><StatusBadge status={profile.kycStatus} />{profile.whatsappVerified ? <span className="inline-flex items-center gap-1 rounded-full bg-[#e4f5e9] px-2.5 py-1 text-[9px] font-extrabold text-[#08783f]"><BadgeCheck className="h-3 w-3" /> WhatsApp terverifikasi</span> : null}</div></div></div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">{details.map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-[15px] border border-[#e1ebe5] bg-[#fbfdfc] p-4"><dt className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#71857a]"><Icon className="h-3.5 w-3.5" />{item.label}</dt><dd className={`mt-2 text-xs font-extrabold ${item.value ? "text-[#244d38]" : "text-[#a4672f]"}`}>{item.value || "Belum diisi"}</dd></div>; })}</dl>
          <div className="mt-5"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#71857a]">Keahlian onboarding</p>{profile.skills.length ? <ul className="mt-3 flex flex-wrap gap-2">{profile.skills.map((skill) => <li key={skill} className="rounded-full border border-[#cfe0d6] bg-[#f2f8f4] px-3 py-1.5 text-[10px] font-bold text-[#315b45]">{skill}</li>)}</ul> : <p className="mt-2 text-xs font-semibold text-[#9a6b3d]">Belum ada keahlian tersimpan.</p>}</div>
        </div>

        <aside className="rounded-[18px] bg-[#0b2a1e] p-5 text-white shadow-[0_16px_38px_rgba(12,38,28,.14)] sm:p-6">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#95b6a2]">Status kepercayaan</p><h2 className="mt-2 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Verifikasi profil</h2>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/[0.055] p-4"><p className="text-[9px] font-bold text-white/50">Level</p><p className="mt-2 text-2xl font-extrabold">{profile.verificationLevel}/2</p></div><div className="rounded-xl border border-white/10 bg-white/[0.055] p-4"><p className="text-[9px] font-bold text-white/50">KYC</p><p className="mt-2 text-xs font-extrabold text-[#b7d74a]">{statusLabel(profile.kycStatus)}</p></div></div>
          <p className="mt-5 text-[10px] font-medium leading-5 text-white/55">KYC Level 2 opsional dan tidak membatasi pencarian, lamaran, konfirmasi, atau rating. Status hanya berubah melalui peninjauan dokumen.</p>
        </aside>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <div className={`${cardClass} p-5 sm:p-6`}>
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e7f4eb] text-[#08783f]"><IdCard className="h-5 w-5" /></span><div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#64806f]">KYC privat</p><h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Ajukan dokumen</h2></div></div>
          {canSubmitKyc ? <form action={submitKycRecordAction} className="mt-5 space-y-4"><label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Jenis dokumen<select name="documentType" required defaultValue="" className="h-11 rounded-xl border border-[#d6e3db] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]"><option value="" disabled>Pilih dokumen</option><option value="KTP">KTP</option><option value="SIM">SIM</option><option value="PASPOR">Paspor</option></select></label><label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">File dokumen<input name="document" type="file" required accept="application/pdf,image/jpeg,image/png" className="block w-full rounded-xl border border-[#d6e3db] bg-[#fbfdfc] p-2 text-[10px] font-semibold file:mr-3 file:rounded-lg file:border-0 file:bg-[#e7f4eb] file:px-3 file:py-2 file:text-[10px] file:font-extrabold file:text-[#08783f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e8f5ec]" /></label><p className="text-[9px] font-medium leading-5 text-[#71857a]">PDF, JPG, atau PNG; maksimal 850 KB. Upload memerlukan bucket privat <code className="font-mono">kyc-documents</code> dengan kebijakan path per pengguna.</p><button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#08783f] text-xs font-extrabold text-white"><FileCheck2 className="h-4 w-4" /> Kirim untuk ditinjau</button></form> : <div className="mt-5 rounded-xl bg-[#f2f8f4] p-4"><p className="flex items-center gap-2 text-xs font-extrabold text-[#315b45]">{profile.kycStatus === "verified" ? <BadgeCheck className="h-4 w-4 text-[#08783f]" /> : <Clock3 className="h-4 w-4 text-[#b9681d]" />}{profile.kycStatus === "verified" ? "Identitas sudah terverifikasi" : "Dokumen sedang ditinjau"}</p><p className="mt-2 text-[10px] font-medium leading-5 text-[#70837a]">{profile.kycStatus === "verified" ? "Tidak perlu mengirim dokumen baru." : "Tunggu hasil peninjauan sebelum mengirim jenis dokumen yang sama."}</p></div>}
        </div>

        <div className={`${cardClass} overflow-hidden`}><header className="border-b border-[#e2ebe5] px-5 py-5 sm:px-6"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#64806f]">Riwayat nyata</p><h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Pengajuan KYC</h2></header>{data.kycSubmissions.length ? <div className="divide-y divide-[#e5ede8] px-5 sm:px-6">{data.kycSubmissions.map((submission) => <article key={submission.id} className="flex items-start gap-4 py-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f1f7f3] text-[#08783f]"><FileBadge className="h-4.5 w-4.5" /></span><div className="min-w-0 flex-1"><h3 className="text-xs font-extrabold text-[#315b45]">{submission.documentType}</h3><p className="mt-1 text-[9px] font-semibold text-[#7b8d84]">Diajukan {formatDate(submission.createdAt)}</p>{submission.rejectionReason ? <p className="mt-2 text-[10px] font-medium leading-5 text-[#a3434c]">{submission.rejectionReason}</p> : null}</div><StatusBadge status={submission.status} /></article>)}</div> : <EmptyState icon={<FolderOpen className="h-6 w-6" />} title="Belum ada pengajuan" description="Riwayat dokumen akan tampil setelah file berhasil tersimpan dan RPC KYC selesai." />}</div>
      </section>
    </>
  );
}

function HelpPage() {
  const faqs = [
    { question: "Bagaimana cara melamar pekerjaan?", answer: "Buka Papan Loker, pilih lowongan yang sesuai, lalu kirim pesan lamaran. Status lamaran tersimpan di menu Lamaran Saya." },
    { question: "Bagaimana lowongan direkomendasikan?", answer: "Pull mengurutkan lowongan nyata berdasarkan kategori, keahlian, upah minimum, wilayah, dan status verifikasi UMKM." },
    { question: "Kapan Trust Score diperbarui?", answer: "Trust Score diperbarui dari transaksi pekerjaan, rating, poin, dan verifikasi yang benar-benar tersimpan." },
    { question: "Bagaimana memperbarui profil atau KYC?", answer: "Buka Portofolio untuk memperbarui onboarding, melihat profil, dan mengirim dokumen KYC privat." },
  ];

  return (
    <>
      <PageHeader eyebrow="Pusat dukungan" title="Bantuan" description="Panduan singkat untuk penggunaan akun pekerja Pull." />
      <section className={`${cardClass} overflow-hidden`}>
        <header className="flex items-center gap-3 border-b border-[#e2ebe5] px-5 py-5 sm:px-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e7f4eb] text-[#08783f]"><CircleHelp className="h-5 w-5" /></span>
          <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#64806f]">Pertanyaan umum</p><h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Yang sering ditanyakan</h2></div>
        </header>
        <div className="space-y-3 p-5 sm:p-6">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-xl border border-[#e0e9e3] bg-[#fbfdfc] p-4">
              <summary className="cursor-pointer text-xs font-extrabold text-[#315b45]">{faq.question}</summary>
              <p className="mt-3 text-[10px] font-medium leading-5 text-[#667b70]">{faq.answer}</p>
            </details>
          ))}
          <a href="https://web.whatsapp.com/send?text=Halo%20CS%20Pull%2C%20saya%20membutuhkan%20bantuan%20untuk%20akun%20pekerja." target="_blank" rel="noreferrer" className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white sm:w-auto">Hubungi CS via WhatsApp</a>
        </div>
      </section>
    </>
  );
}

function SettingsPage({ data, notice }: { data: WorkerWorkspace; notice?: string }) {
  return (
    <>
      <PageHeader eyebrow="Preferensi akun" title="Pengaturan" description="Atur smart matching dan keamanan akun pekerja Anda." />
      <Notice notice={notice} />
      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e7f4eb] text-[#08783f]"><Settings2 className="h-5 w-5" /></span>
          <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#64806f]">Smart matching</p><h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Preferensi pekerjaan</h2></div>
        </div>
        <form action={saveWorkerPreferencesAction} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Status kerja<select name="availability" defaultValue={data.preferences.availability} className="h-11 rounded-xl border border-[#d6e3db] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]"><option value="available">Siap bekerja</option><option value="limited">Terbatas</option><option value="unavailable">Belum tersedia</option></select></label>
          <label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Kategori pilihan<input name="preferredCategories" defaultValue={data.preferences.preferredCategories.join(", ")} maxLength={620} placeholder="Produksi, kasir, pengemasan" className="h-11 rounded-xl border border-[#d6e3db] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]" /></label>
          <label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Upah minimum<input name="minimumWage" defaultValue={data.preferences.minimumWage ?? ""} type="number" min="0" max="1000000000" step="1000" inputMode="numeric" placeholder="100000" className="h-11 rounded-xl border border-[#d6e3db] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]" /></label>
          <label className="grid gap-2 text-[10px] font-extrabold text-[#315b45]">Radius peta<select name="radiusKm" defaultValue={String(data.preferences.radiusKm)} className="h-11 rounded-xl border border-[#d6e3db] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]">{[3, 5, 10, 20, 50].map((radius) => <option key={radius} value={radius}>{radius} km</option>)}</select></label>
          <div className="md:col-span-2 xl:col-span-4"><p className="text-[9px] font-medium leading-5 text-[#71857a]">Pisahkan kategori dengan koma. Preferensi hanya mengurutkan lowongan nyata; tidak membuat lowongan atau lokasi palsu.</p><button className="mt-3 inline-flex h-11 items-center justify-center rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9cd0ad]">Simpan preferensi</button></div>
        </form>
      </section>

      <section className={`${cardClass} mt-5 border-[#efcfd4] p-5 sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#a45a64]">Keamanan akun</p><h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Keluar dari akun</h2><p className="mt-2 text-[10px] font-medium leading-5 text-[#71857a]">Akhiri sesi Pull pada perangkat ini. Data akun tetap tersimpan.</p></div>
          <form action={signOutAction}>
            <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e3a8b2] bg-[#fff7f7] px-5 text-xs font-extrabold text-[#a72e43] hover:bg-[#fff0f2] sm:w-auto"><LogOut className="h-4 w-4" />Keluar dari akun</button>
          </form>
        </div>
      </section>
    </>
  );
}

function TrustPage({ data, notice }: { data: WorkerWorkspace; notice?: string }) {
  const profile = data.profile!;
  const totalPoints = data.points.reduce((total, point) => total + point.points, 0);
  const averageRating = data.ratingsReceived.length
    ? data.ratingsReceived.reduce((total, rating) => total + rating.score, 0) / data.ratingsReceived.length
    : 0;

  return (
    <>
      <PageHeader eyebrow="Bukti, bukan klaim" title="Kepercayaan & hasil kerja" description="Poin, rating, sertifikat, dan portofolio di halaman ini hanya ditampilkan jika benar-benar tersimpan." />
      <Notice notice={notice} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<ShieldCheck className="h-5 w-5" />} label="Trust score" value={`${profile.trustScore}/100`} detail="Agregat rating pada profil" />
        <Metric icon={<Star className="h-5 w-5" />} label="Rata-rata terbaca" value={averageRating ? averageRating.toFixed(1) : "—"} detail={`${profile.ratingCount} total rating pada profil`} />
        <Metric icon={<Coins className="h-5 w-5" />} label="Total poin" value={totalPoints} detail={`${data.points.length} entri ledger terbaca`} />
        <Metric icon={<BadgeCheck className="h-5 w-5" />} label="Level verifikasi" value={`${profile.verificationLevel}/2`} detail={`KYC: ${statusLabel(profile.kycStatus)}`} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <div className={`${cardClass} overflow-hidden`}><header className="border-b border-[#e2ebe5] px-5 py-5 sm:px-6"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#64806f]">Points ledger</p><h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Perolehan poin</h2></header>{data.points.length ? <div className="divide-y divide-[#e5ede8] px-5 sm:px-6">{data.points.map((point) => <article key={point.id} className="flex items-center gap-4 py-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-[family-name:var(--font-worker-display)] text-sm font-semibold ${point.points > 0 ? "bg-[#e7f4eb] text-[#08783f]" : "bg-[#fff0f0] text-[#b43e48]"}`}>{point.points > 0 ? "+" : ""}{point.points}</span><div className="min-w-0"><h3 className="text-[11px] font-extrabold text-[#315b45]">{point.reason}</h3><p className="mt-1 text-[9px] font-semibold text-[#7b8d84]">{formatDate(point.createdAt)}</p></div></article>)}</div> : <EmptyState icon={<Coins className="h-6 w-6" />} title="Belum ada poin" description="Poin dicatat oleh alur transaksi, misalnya setelah pekerjaan selesai." />}</div>

        <div className={`${cardClass} overflow-hidden`}><header className="border-b border-[#e2ebe5] px-5 py-5 sm:px-6"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#64806f]">Rating diterima</p><h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Ulasan transaksi</h2></header>{data.ratingsReceived.length ? <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">{data.ratingsReceived.map((rating) => <article key={rating.id} className="rounded-[15px] border border-[#e0e9e3] bg-[#fbfdfc] p-4"><p className="flex gap-1 text-[#d58a13]" aria-label={`${rating.score} dari 5 bintang`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < rating.score ? "fill-current" : "text-[#d3ddd7]"}`} />)}</p><p className="mt-3 text-[10px] font-medium leading-5 text-[#5f7469]">{rating.review ? `“${rating.review}”` : "Rating diberikan tanpa ulasan tertulis."}</p><p className="mt-3 text-[9px] font-semibold text-[#84958c]">{formatDate(rating.createdAt)}</p></article>)}</div> : <EmptyState icon={<Star className="h-6 w-6" />} title="Belum ada rating" description="Rating dari pihak transaksi akan tampil setelah pekerjaan selesai." />}</div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className={`${cardClass} overflow-hidden`}><header className="flex items-center gap-3 border-b border-[#e2ebe5] px-5 py-5 sm:px-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7f4eb] text-[#08783f]"><Award className="h-5 w-5" /></span><div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#64806f]">Kredensial</p><h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Sertifikat pekerjaan</h2></div></header>{data.certificates.length ? <div className="divide-y divide-[#e5ede8] px-5 sm:px-6">{data.certificates.map((certificate) => { const credentialUrl = safeUrl(certificate.credentialUrl); return <article key={certificate.id} className="flex items-start gap-4 py-4"><Medal className="mt-0.5 h-5 w-5 shrink-0 text-[#b58024]" /><div className="min-w-0 flex-1"><h3 className="text-xs font-extrabold text-[#315b45]">{certificate.name}</h3><p className="mt-1 text-[10px] font-semibold text-[#71857a]">{certificate.issuer} · {formatDate(certificate.issuedAt)}</p></div>{credentialUrl ? <a href={credentialUrl} target="_blank" rel="noreferrer" aria-label={`Buka kredensial ${certificate.name}`} className="grid h-9 w-9 place-items-center rounded-xl border border-[#d6e3db] text-[#08783f]"><ExternalLink className="h-4 w-4" /></a> : null}</article>; })}</div> : <EmptyState icon={<Award className="h-6 w-6" />} title="Belum ada sertifikat" description="Sertifikat dari pekerjaan selesai akan muncul saat sudah diterbitkan." />}</div>

        <div className={`${cardClass} overflow-hidden`}><header className="flex items-center gap-3 border-b border-[#e2ebe5] px-5 py-5 sm:px-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7f4eb] text-[#08783f]"><FolderOpen className="h-5 w-5" /></span><div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#64806f]">Hasil selesai</p><h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em]">Portofolio</h2></div></header>{data.portfolio.length ? <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">{data.portfolio.map((item) => { const media = item.mediaUrls.map(safeUrl).filter((url): url is string => Boolean(url)); return <article key={item.id} className="rounded-[15px] border border-[#e0e9e3] p-4"><h3 className="text-xs font-extrabold text-[#315b45]">{item.title}</h3>{item.description ? <p className="mt-2 text-[10px] font-medium leading-5 text-[#667b70]">{item.description}</p> : null}<div className="mt-3 flex items-center justify-between"><p className="text-[9px] font-semibold text-[#84958c]">{formatDate(item.createdAt)}</p>{media.length ? <a href={media[0]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#08783f]">Buka media <ExternalLink className="h-3 w-3" /></a> : null}</div></article>; })}</div> : <EmptyState icon={<FolderOpen className="h-6 w-6" />} title="Belum ada portofolio" description="Hasil kerja yang diterbitkan dari aplikasi selesai akan tampil di sini." />}</div>
      </section>
    </>
  );
}

function NotificationsPage({ data, notice }: { data: WorkerWorkspace; notice?: string }) {
  const unread = data.notifications.filter((item) => !item.readAt).length;
  return (
    <>
      <PageHeader eyebrow="Kotak masuk" title="Notifikasi" description="Pembaruan status pekerjaan, rating, dan sistem untuk akun Anda." action={unread > 0 ? <span className="inline-flex h-9 items-center rounded-full bg-[#e7f4eb] px-4 text-[10px] font-extrabold text-[#08783f]">{unread} belum dibaca</span> : undefined} />
      <Notice notice={notice} />
      <section className={`${cardClass} overflow-hidden`}>
        {data.notifications.length ? <div className="divide-y divide-[#e3ece6]">{data.notifications.map((notification) => (
          <article key={notification.id} className={`relative flex gap-4 px-5 py-5 sm:px-6 ${notification.readAt ? "bg-white" : "bg-[#f4faf6]"}`}>
            {!notification.readAt ? <span className="absolute inset-y-0 left-0 w-1 bg-[#08783f]" aria-hidden="true" /> : null}
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${notification.readAt ? "bg-[#f0f3f1] text-[#6e8177]" : "bg-[#dff1e5] text-[#08783f]"}`}><Bell className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#64806f]">{notification.type}</span><time className="text-[9px] font-semibold text-[#84958c]">{formatDate(notification.createdAt)}</time></div><h2 className="mt-2 text-xs font-extrabold text-[#244d38]">{notification.title}</h2><p className="mt-1 text-[10px] font-medium leading-5 text-[#667b70]">{notification.body}</p></div>
            {!notification.readAt ? <form action={markNotificationReadAction} className="shrink-0 self-center"><input type="hidden" name="notificationId" value={notification.id} /><button aria-label={`Tandai ${notification.title} sudah dibaca`} className="inline-flex h-9 items-center justify-center rounded-xl border border-[#bddac7] px-3 text-[9px] font-extrabold text-[#08783f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08783f]">Tandai dibaca</button></form> : <CheckCircle2 aria-label="Sudah dibaca" className="h-4 w-4 shrink-0 self-center text-[#9aaba2]" />}
          </article>
        ))}</div> : <EmptyState icon={<Bell className="h-6 w-6" />} title="Belum ada notifikasi" description="Pembaruan transaksi dan sistem untuk akun Anda akan tampil di sini." />}
      </section>
    </>
  );
}

export function WorkerPageContent({ page, data, filters, notice }: { page: WorkerPage; data: WorkerWorkspace; filters: WorkerFilters; notice?: string }) {
  if (page === "help") return <HelpPage />;
  if (page === "settings") return <SettingsPage data={data} notice={notice} />;
  if (data.loadIssue || !data.profile) return <SetupState data={data} />;
  if (page === "jobs") return <JobBoardPage data={data} filters={filters} notice={notice} />;
  if (page === "applications") return <ApplicationsPage data={data} notice={notice} />;
  if (page === "profile") return <ProfilePage data={data} notice={notice} />;
  if (page === "trust") return <TrustPage data={data} notice={notice} />;
  if (page === "notifications") return <NotificationsPage data={data} notice={notice} />;
  return <DashboardPage data={data} notice={notice} />;
}
