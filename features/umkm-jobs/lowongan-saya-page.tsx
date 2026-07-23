"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  ArrowDownAZ,
  ArrowLeft,
  ArrowUpAZ,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleX,
  ClipboardCheck,
  Clock3,
  Copy,
  FileBadge2,
  Gauge,
  Handshake,
  Languages,
  MapPin,
  MessageSquareText,
  MoreVertical,
  Palette,
  Pencil,
  Plus,
  Send,
  RotateCcw,
  Search,
  ShieldCheck,
  Shirt,
  Star,
  Trash2,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";
import { CATEGORY_OPTIONS, DISTRICT_OPTIONS, INITIAL_APPLICATIONS, INITIAL_ASSIGNMENTS, INITIAL_JOBS } from "./recruitment-data";
import {
  acceptJobApplication,
  buildApplicantWhatsAppUrl,
  cancelAcceptedJobApplication,
  canCancelAcceptedApplication,
  cancelJobAssignment,
  confirmAssignmentByEmployer,
  createJobAssignment,
  deriveAssignmentStatus,
  deriveJobStatusFromAssignments,
  deriveOpenJobStatus,
  getApplicantSummary,
  submitAssignmentRating,
  updateApplicationStatus,
  validateJobForm,
} from "./recruitment-logic";
import type {
  ApplicationStatus,
  AssignmentRating,
  AssignmentStatus,
  Job,
  JobApplication,
  JobAssignment,
  JobFormErrors,
  JobFormValues,
  JobStatus,
  SubmissionIntent,
} from "./recruitment-types";

type ActiveTab = "Semua" | JobStatus;
type ApplicantFilter = "Semua" | ApplicationStatus;
type SortDirection = "asc" | "desc";

const TABS: ActiveTab[] = [
  "Semua",
  "Draf",
  "Terbuka",
  "Hampir Penuh",
  "Kuota Penuh",
  "Akan Dimulai",
  "Sedang Berlangsung",
  "Perlu Konfirmasi",
  "Selesai",
  "Dibatalkan",
];

const TAB_ACTIVE_STYLES: Record<ActiveTab, string> = {
  Semua: "bg-[#145c46] text-white shadow-sm",
  Draf: "bg-[#66737b] text-white shadow-sm",
  Terbuka: "bg-[#16864c] text-white shadow-sm",
  "Hampir Penuh": "bg-[#e77b20] text-white shadow-sm",
  "Kuota Penuh": "bg-[#c9344f] text-white shadow-sm",
  "Akan Dimulai": "bg-[#3976b9] text-white shadow-sm",
  "Sedang Berlangsung": "bg-[#4268b0] text-white shadow-sm",
  "Perlu Konfirmasi": "bg-[#7950ad] text-white shadow-sm",
  Selesai: "bg-[#3f984f] text-white shadow-sm",
  Dibatalkan: "bg-[#a9364c] text-white shadow-sm",
};

const APPLICANT_FILTERS: ApplicantFilter[] = ["Semua", "Menunggu Respons", "Diterima", "Ditolak", "Dibatalkan"];

const EMPTY_FORM: JobFormValues = {
  title: "",
  category: "",
  district: "",
  wage: "",
  duration: "",
  startDate: "",
  endDate: "",
  workerQuota: "",
  workHours: "",
  description: "",
  requirements: "",
  whatsappContact: "",
};

const rupiah = new Intl.NumberFormat("id-ID");
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string) {
  if (!value) return "Belum diatur";
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) return startDate ? formatDate(startDate) : "Belum diatur";
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
  if (sameMonth) return `${start.getUTCDate()}–${formatDate(endDate)}`;
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function jobToForm(job: Job | null): JobFormValues {
  if (!job) return EMPTY_FORM;
  return {
    title: job.title,
    category: job.category,
    district: job.district,
    wage: job.wage ? String(job.wage) : "",
    duration: job.duration ? String(job.duration) : "",
    startDate: job.startDate,
    endDate: job.endDate,
    workerQuota: job.workerQuota ? String(job.workerQuota) : "",
    workHours: job.workHours,
    description: job.description,
    requirements: job.requirements,
    whatsappContact: job.whatsappContact,
  };
}

function JobIcon({ job, compact = false }: { job: Job; compact?: boolean }) {
  const Icon = job.tone === "orange" ? Palette : job.tone === "green" ? BriefcaseBusiness : Shirt;
  const tone = job.tone === "orange"
    ? "bg-[#fff0df] text-[#ee7615]"
    : job.tone === "green"
      ? "bg-[#e4f2e7] text-[#21834a]"
      : "bg-[#ece7ff] text-[#7461df]";

  return (
    <span className={`grid shrink-0 place-items-center rounded-full ${compact ? "h-9 w-9" : "h-11 w-11"} ${tone}`}>
      <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
    </span>
  );
}

function JobStatusBadge({ status }: { status: JobStatus }) {
  const styles: Record<JobStatus, string> = {
    Draf: "bg-[#eef0f2] text-[#647079] before:bg-[#8a959d]",
    Terbuka: "bg-[#e8f4e9] text-[#26723c] before:bg-[#299a45]",
    "Hampir Penuh": "bg-[#fff1e4] text-[#db690d] before:bg-[#ec8e3b]",
    "Kuota Penuh": "bg-[#fae9ed] text-[#a9233e] before:bg-[#d93654]",
    "Akan Dimulai": "bg-[#e9f2ff] text-[#315f9f] before:bg-[#4c82c7]",
    "Sedang Berlangsung": "bg-[#e9efff] text-[#385da2] before:bg-[#5278c6]",
    "Perlu Konfirmasi": "bg-[#f1eaff] text-[#7249a5] before:bg-[#8b61c2]",
    Selesai: "bg-[#e7f6e8] text-[#23713a] before:bg-[#45a858]",
    Dibatalkan: "bg-[#fbe9ec] text-[#a72b43] before:bg-[#c73e58]",
  };

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-extrabold before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${styles[status]}`}>
      {status}
    </span>
  );
}

function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    "Menunggu Respons": "bg-[#eef4ff] text-[#355f9e] before:bg-[#4d7ec1]",
    Diterima: "bg-[#e7f6e9] text-[#23713a] before:bg-[#35a34f]",
    Ditolak: "bg-[#fbe9ec] text-[#a72b43] before:bg-[#cb3f58]",
    Dibatalkan: "bg-[#f3f0f1] text-[#705f65] before:bg-[#8e7b82]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${styles[status]}`}>
      {status}
    </span>
  );
}

function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const styles: Record<AssignmentStatus, string> = {
    "Akan Dimulai": "bg-[#e9f2ff] text-[#315f9f] before:bg-[#4c82c7]",
    "Sedang Berlangsung": "bg-[#e9efff] text-[#385da2] before:bg-[#5278c6]",
    "Perlu Konfirmasi": "bg-[#f1eaff] text-[#7249a5] before:bg-[#8b61c2]",
    "Menunggu Konfirmasi Pekerja": "bg-[#fff1e4] text-[#a85d1d] before:bg-[#ec8e3b]",
    Selesai: "bg-[#e7f6e8] text-[#23713a] before:bg-[#45a858]",
    Dibatalkan: "bg-[#f3f0f1] text-[#705f65] before:bg-[#8e7b82]",
  };
  return <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-extrabold before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${styles[status]}`}>{status}</span>;
}

function EmptyJobs({ hasJobs, onCreate, onReset }: { hasJobs: boolean; onCreate: () => void; onReset: () => void }) {
  return (
    <section className="grid min-h-[390px] place-items-center rounded-2xl border border-[#e1e7e3] bg-white px-6 py-12 text-center shadow-[0_8px_28px_rgba(18,59,48,.025)]">
      <div>
        <div className="relative mx-auto grid h-24 w-32 place-items-center rounded-[46%] bg-[#f0f5ef] text-[#4f5b61]">
          <BriefcaseBusiness className="h-16 w-16" strokeWidth={1.45} />
          <span className="absolute bottom-1 right-2 grid h-9 w-9 place-items-center rounded-full border-4 border-white bg-[#777f89] text-white"><X className="h-4 w-4" /></span>
        </div>
        <h2 className="mt-6 text-lg font-extrabold text-[#111827]">{hasJobs ? "Lowongan tidak ditemukan" : "Anda belum memposting lowongan"}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-[#6b7280]">
          {hasJobs ? "Ubah pencarian atau reset filter untuk melihat lowongan lainnya." : "Posting lowongan pertama untuk mencari tenaga kerja harian di sekitar Anda."}
        </p>
        <button type="button" onClick={hasJobs ? onReset : onCreate} className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-6 text-xs font-extrabold text-white transition hover:bg-[#066b36]">
          {hasJobs ? <><RotateCcw className="h-4 w-4" /> Reset Filter</> : <><Plus className="h-4 w-4" /> Posting Lowongan</>}
        </button>
      </div>
    </section>
  );
}

function ModalFrame({ title, titleId, description, compact = false, onClose, children }: {
  title: string;
  titleId: string;
  description?: string;
  compact?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    const focusableSelector = "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]";
    const focusable = dialog?.querySelectorAll<HTMLElement>(focusableSelector);
    focusable?.[0]?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[#071d15]/45 backdrop-blur-[2px] sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-[24px] border border-[#dfe5e1] bg-white shadow-[0_30px_90px_rgba(7,29,21,.28)] sm:rounded-[20px] ${compact ? "max-w-[520px]" : "max-w-[820px]"}`}>
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-base font-extrabold text-[#111827]">{title}</h2>
            {description ? <p className="mt-1 text-[11px] font-medium text-[#6c7a73]">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#25342e] transition hover:bg-[#f0f4f1]" aria-label={`Tutup ${title}`}><X className="h-5 w-5" /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

function FormField({ id, label, error, required = true, full = false, children }: {
  id: keyof JobFormValues;
  label: string;
  error?: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={`job-${id}`} className="mb-2 block text-[11px] font-extrabold text-[#27372f]">
        {label}{required ? <span className="text-[#c52f48]"> *</span> : null}
      </label>
      {children}
      {error ? <p id={`job-${id}-error`} role="alert" className="mt-1.5 text-[10px] font-bold text-[#b4233b]">{error}</p> : null}
    </div>
  );
}

function PostJobModal({ job, onClose, onSave }: {
  job: Job | null;
  onClose: () => void;
  onSave: (values: JobFormValues, intent: SubmissionIntent, existingJob: Job | null) => void;
}) {
  const [values, setValues] = useState<JobFormValues>(() => jobToForm(job));
  const [errors, setErrors] = useState<JobFormErrors>({});
  const intentRef = useRef<SubmissionIntent>("publish");

  function updateField(field: keyof JobFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const intent = intentRef.current;
    const nextErrors = validateJobForm(values, intent);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      window.requestAnimationFrame(() => event.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    onSave(values, intent, job);
  }

  const inputClass = (field: keyof JobFormValues) => `h-11 w-full rounded-xl border bg-white px-3 text-xs font-semibold text-[#26372f] outline-none transition placeholder:text-[#98a29d] focus:ring-4 ${errors[field] ? "border-[#d85a70] focus:border-[#c52f48] focus:ring-[#fdecef]" : "border-[#dce3df] focus:border-[#71a987] focus:ring-[#e7f3eb]"}`;
  const fieldA11y = (field: keyof JobFormValues) => ({
    id: `job-${field}`,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `job-${field}-error` : undefined,
  });

  return (
    <ModalFrame
      title={job ? "Edit Lowongan" : "Posting Lowongan Baru"}
      titleId="post-job-title"
      description="Lengkapi detail pekerjaan. Draft dapat disimpan hanya dengan judul."
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {Object.keys(errors).length ? (
            <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-[#f0c7cf] bg-[#fff3f5] p-3 text-[11px] font-semibold leading-5 text-[#9e2940]">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> Periksa kembali field yang ditandai sebelum memposting lowongan.
            </div>
          ) : null}
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <FormField id="title" label="Judul Pekerjaan" error={errors.title}>
              <input {...fieldA11y("title")} value={values.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Contoh: Buruh Cuci Kain Batik" className={inputClass("title")} />
            </FormField>
            <FormField id="category" label="Kategori Pekerjaan" error={errors.category}>
              <select {...fieldA11y("category")} value={values.category} onChange={(event) => updateField("category", event.target.value)} className={inputClass("category")}>
                <option value="">Pilih kategori</option>{CATEGORY_OPTIONS.map((category) => <option key={category}>{category}</option>)}
              </select>
            </FormField>
            <FormField id="district" label="Lokasi Pekerjaan" error={errors.district}>
              <select {...fieldA11y("district")} value={values.district} onChange={(event) => updateField("district", event.target.value)} className={inputClass("district")}>
                <option value="">Pilih lokasi</option>{DISTRICT_OPTIONS.map((district) => <option key={district}>{district}</option>)}
              </select>
            </FormField>
            <FormField id="wage" label="Upah per Hari (Rp)" error={errors.wage}>
              <input {...fieldA11y("wage")} type="number" min="10000" inputMode="numeric" value={values.wage} onChange={(event) => updateField("wage", event.target.value)} placeholder="Contoh: 120000" className={inputClass("wage")} />
            </FormField>
            <FormField id="duration" label="Durasi Pekerjaan (hari)" error={errors.duration}>
              <input {...fieldA11y("duration")} type="number" min="1" max="30" inputMode="numeric" value={values.duration} onChange={(event) => updateField("duration", event.target.value)} placeholder="Contoh: 3" className={inputClass("duration")} />
            </FormField>
            <FormField id="workerQuota" label="Jumlah Pekerja Dibutuhkan" error={errors.workerQuota}>
              <input {...fieldA11y("workerQuota")} type="number" min="1" max="50" inputMode="numeric" value={values.workerQuota} onChange={(event) => updateField("workerQuota", event.target.value)} placeholder="Contoh: 2" className={inputClass("workerQuota")} />
            </FormField>
            <FormField id="startDate" label="Tanggal Mulai" error={errors.startDate}>
              <input {...fieldA11y("startDate")} type="date" value={values.startDate} onChange={(event) => updateField("startDate", event.target.value)} className={inputClass("startDate")} />
            </FormField>
            <FormField id="endDate" label="Tanggal Selesai" error={errors.endDate}>
              <input {...fieldA11y("endDate")} type="date" min={values.startDate || undefined} value={values.endDate} onChange={(event) => updateField("endDate", event.target.value)} className={inputClass("endDate")} />
            </FormField>
            <FormField id="workHours" label="Jam Kerja" error={errors.workHours} full>
              <input {...fieldA11y("workHours")} value={values.workHours} onChange={(event) => updateField("workHours", event.target.value)} placeholder="Contoh: 08.00–17.00" className={inputClass("workHours")} />
            </FormField>
            <FormField id="whatsappContact" label="Kontak WhatsApp" error={errors.whatsappContact} full>
              <div className="flex">
                <span className="grid h-11 place-items-center rounded-l-xl border border-r-0 border-[#dce3df] bg-[#f7faf8] px-3 text-xs font-extrabold text-[#527063]">+62</span>
                <input {...fieldA11y("whatsappContact")} type="tel" inputMode="tel" value={values.whatsappContact} onChange={(event) => updateField("whatsappContact", event.target.value)} placeholder="812-3456-7890" className={`${inputClass("whatsappContact")} rounded-l-none`} />
              </div>
            </FormField>
            <FormField id="description" label="Deskripsi Pekerjaan" error={errors.description} full>
              <div className="relative">
                <textarea {...fieldA11y("description")} maxLength={300} value={values.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Jelaskan tugas dan tanggung jawab pekerjaan..." className={`${inputClass("description")} min-h-28 resize-none py-3 pr-14`} />
                <span className="absolute bottom-3 right-3 text-[9px] font-semibold text-[#7b8781]">{values.description.length}/300</span>
              </div>
            </FormField>
            <FormField id="requirements" label="Persyaratan atau Keahlian" error={errors.requirements} full>
              <div className="relative">
                <textarea {...fieldA11y("requirements")} maxLength={240} value={values.requirements} onChange={(event) => updateField("requirements", event.target.value)} placeholder="Contoh: Teliti, cekatan, dan mampu bekerja dalam tim..." className={`${inputClass("requirements")} min-h-24 resize-none py-3 pr-14`} />
                <span className="absolute bottom-3 right-3 text-[9px] font-semibold text-[#7b8781]">{values.requirements.length}/240</span>
              </div>
            </FormField>
          </div>
        </div>
        <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-[#e5e7eb] bg-white px-5 py-4 sm:flex sm:items-center sm:justify-between sm:px-6">
          <button type="button" onClick={onClose} className="hidden h-11 rounded-xl border border-[#c7d2cc] px-5 text-xs font-extrabold text-[#35443d] transition hover:bg-[#f5f7f6] sm:block">Batal</button>
          <div className="contents sm:flex sm:gap-3">
            <button type="submit" onClick={() => { intentRef.current = "draft"; }} className="h-11 rounded-xl border border-[#16864c] bg-white px-3 text-[11px] font-extrabold text-[#08783f] transition hover:bg-[#eff8f2] sm:px-5 sm:text-xs">Simpan sebagai Draft</button>
            <button type="submit" onClick={() => { intentRef.current = "publish"; }} className="h-11 rounded-xl bg-[#08783f] px-3 text-[11px] font-extrabold text-white transition hover:bg-[#066b36] sm:px-6 sm:text-xs">{job && job.status !== "Draf" ? "Simpan Perubahan" : "Posting Lowongan"}</button>
          </div>
        </footer>
      </form>
    </ModalFrame>
  );
}

function AcceptWorkerModal({ job, application, acceptedCount, onClose, onConfirm }: {
  job: Job;
  application: JobApplication;
  acceptedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const positionAfterAcceptance = Math.min(job.workerQuota, acceptedCount + 1);

  return (
    <ModalFrame
      compact
      title={`Terima ${application.applicant.name}?`}
      titleId="accept-worker-title"
      description="Pastikan pilihan pekerja dan detail pekerjaan sudah sesuai."
      onClose={onClose}
    >
      <div className="overflow-y-auto p-5 sm:p-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#e8f5eb] text-[#16864c]">
          <UserRoundCheck className="h-8 w-8" />
        </div>
        <p className="mx-auto mt-4 max-w-sm text-center text-xs font-medium leading-6 text-[#66766e]">
          {application.applicant.name} akan mengisi satu posisi untuk pekerjaan <strong className="text-[#26372f]">{job.title}</strong>.
        </p>

        <div className="mt-5 rounded-2xl border border-[#dfe7e2] bg-[#f8fbf9] p-4">
          <div className="grid gap-3 text-[11px] sm:grid-cols-2">
            <div><p className="font-bold text-[#718078]">Tanggal kerja</p><p className="mt-1 font-extrabold text-[#26372f]">{formatDateRange(job.startDate, job.endDate)}</p></div>
            <div><p className="font-bold text-[#718078]">Durasi</p><p className="mt-1 font-extrabold text-[#26372f]">{job.duration} hari</p></div>
            <div><p className="font-bold text-[#718078]">Upah per hari</p><p className="mt-1 font-extrabold text-[#26372f]">Rp {rupiah.format(job.wage)}</p></div>
            <div><p className="font-bold text-[#718078]">Estimasi total upah</p><p className="mt-1 font-extrabold text-[#26372f]">Rp {rupiah.format(job.wage * job.duration)}</p></div>
          </div>
          <div className="mt-4 grid grid-cols-2 divide-x divide-[#e5ebe7] rounded-xl bg-white px-3 py-3 text-[11px]">
            <div className="pr-3"><p className="font-bold text-[#63746b]">Posisi saat ini</p><p className="mt-1 font-extrabold text-[#26372f]">{acceptedCount} dari {job.workerQuota} terisi</p></div>
            <div className="pl-3"><p className="font-bold text-[#63746b]">Setelah diterima</p><p className="mt-1 font-extrabold text-[#08783f]">{positionAfterAcceptance} dari {job.workerQuota} terisi</p></div>
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#fff8e9] px-3 py-2.5 text-[10px] font-semibold leading-5 text-[#72551f]">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#d18a14]" />
          Pastikan Anda sudah berdiskusi mengenai detail pekerjaan melalui WhatsApp sebelum menerima pekerja.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-[#cbd5cf] text-xs font-extrabold text-[#42534b] transition hover:bg-[#f5f8f6]">Batal</button>
          <button type="button" onClick={onConfirm} className="h-11 rounded-xl bg-[#08783f] px-3 text-xs font-extrabold text-white transition hover:bg-[#066b36]">Ya, Terima Pekerja</button>
        </div>
      </div>
    </ModalFrame>
  );
}

function CancelAcceptanceModal({ job, application, onClose, onConfirm }: {
  job: Job;
  application: JobApplication;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalFrame
      compact
      title="Batalkan penerimaan pekerja?"
      titleId="cancel-acceptance-title"
      description="Posisi akan tersedia kembali setelah pembatalan."
      onClose={onClose}
    >
      <div className="p-5 sm:p-6">
        <div className="rounded-2xl border border-[#efd9dd] bg-[#fff7f8] p-4">
          <div className="flex items-start gap-3">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-xs font-black ${application.applicant.tone}`}>{application.applicant.initials}</span>
            <div><p className="text-sm font-extrabold text-[#26372f]">{application.applicant.name}</p><p className="mt-1 text-[10px] font-semibold text-[#718078]">{job.title} · mulai {formatDate(job.startDate)}</p></div>
          </div>
        </div>
        <p className="mt-4 text-xs font-medium leading-6 text-[#66766e]">Status pelamar akan menjadi <strong>Dibatalkan</strong>. Tindakan ini hanya tersedia sebelum pekerjaan dimulai.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-[#cbd5cf] text-xs font-extrabold text-[#42534b] transition hover:bg-[#f5f8f6]">Kembali</button>
          <button type="button" onClick={onConfirm} className="h-11 rounded-xl bg-[#b52d46] px-3 text-xs font-extrabold text-white transition hover:bg-[#98243a]">Ya, Batalkan</button>
        </div>
      </div>
    </ModalFrame>
  );
}

type ApplicantProfileTab = "Ringkasan" | "Riwayat Pekerjaan" | "Ulasan & Rating" | "Sertifikat & Portofolio";
const APPLICANT_PROFILE_TABS: ApplicantProfileTab[] = ["Ringkasan", "Riwayat Pekerjaan", "Ulasan & Rating", "Sertifikat & Portofolio"];

function ApplicantProfileView({ job, application, quotaFull, acceptanceClosed, canCancelAcceptance, hasAssignment, onBack, onContact, onReject, onRequestAccept, onRequestCancelAcceptance, onManageAssignment }: {
  job: Job;
  application: JobApplication;
  quotaFull: boolean;
  acceptanceClosed: boolean;
  canCancelAcceptance: boolean;
  hasAssignment: boolean;
  onBack: () => void;
  onContact: () => void;
  onReject: () => void;
  onRequestAccept: () => void;
  onRequestCancelAcceptance: () => void;
  onManageAssignment: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ApplicantProfileTab>("Ringkasan");
  const { applicant } = application;
  const isWaiting = application.status === "Menunggu Respons";
  const isAccepted = application.status === "Diterima";

  return (
    <div className="mx-auto max-w-[1240px]">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-extrabold text-[#315b4c] transition hover:text-[#08783f]"><ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Pelamar</button>

      <section className="mt-4 overflow-hidden rounded-[22px] border border-[#dfe7e2] bg-white shadow-[0_10px_30px_rgba(18,59,48,.045)]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className={`grid h-20 w-20 shrink-0 place-items-center rounded-full text-xl font-black ring-4 ring-[#f0f5f2] ${applicant.tone}`}>{applicant.initials}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-0.035em] text-[#10231d]">{applicant.name}</h2>
                  <ApplicationStatusBadge status={application.status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold text-[#68756f]">
                  <span className="inline-flex items-center gap-1.5 text-[#16804b]"><ShieldCheck className="h-4 w-4 fill-[#16804b] text-white" /> Trust Score {applicant.trustScore} · {applicant.trustLabel}</span>
                  <span className="inline-flex items-center gap-1 text-[#9b6b16]"><Star className="h-3.5 w-3.5 fill-[#f4b83e] text-[#f4b83e]" /> {applicant.rating.toLocaleString("id-ID", { minimumFractionDigits: 1 })} ({applicant.reviewCount} ulasan)</span>
                  <span>{applicant.completedJobs} pekerjaan selesai</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-[#68756f]">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#4c7862]" /> {applicant.location}</span>
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-[#4c7862]" /> Bergabung {formatDate(applicant.joinedAt)}</span>
                  <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-3.5 w-3.5 text-[#4c7862]" /> Melamar untuk {job.title}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:max-w-[460px] xl:justify-end">
              <button type="button" onClick={onContact} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#70ad87] bg-[#f1f9f3] px-3 text-[10px] font-extrabold text-[#08783f] transition hover:bg-[#e5f4e9] sm:px-4"><FaWhatsapp className="h-4 w-4" /> WhatsApp</button>
              <button type="button" disabled={!isWaiting} onClick={onReject} className="h-10 rounded-xl border border-[#df8c9b] px-3 text-[10px] font-extrabold text-[#b52d46] transition hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:border-[#e1e5e3] disabled:text-[#a1aaa5] sm:px-4">Tolak</button>
              {isAccepted ? (
                <>
                  <button type="button" disabled={!hasAssignment} onClick={onManageAssignment} className="col-span-2 h-10 rounded-xl bg-[#08783f] px-3 text-[10px] font-extrabold text-white transition hover:bg-[#066b36] disabled:cursor-not-allowed disabled:bg-[#dfe5e1] disabled:text-[#89958f] sm:col-span-1 sm:px-4">Kelola Pekerjaan</button>
                  <button type="button" disabled={!canCancelAcceptance} onClick={onRequestCancelAcceptance} title={!canCancelAcceptance ? "Penerimaan hanya dapat dibatalkan sebelum pekerjaan dimulai." : undefined} className="col-span-2 h-10 rounded-xl border border-[#df8c9b] px-3 text-[10px] font-extrabold text-[#b52d46] transition hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:border-[#e1e5e3] disabled:text-[#a1aaa5] sm:col-span-1 sm:px-4">Batalkan Penerimaan</button>
                </>
              ) : (
                <button type="button" disabled={!isWaiting || quotaFull || acceptanceClosed} onClick={onRequestAccept} title={quotaFull && isWaiting ? "Semua posisi sudah terisi." : acceptanceClosed && isWaiting ? "Penerimaan ditutup karena pekerjaan sudah dimulai." : undefined} className="col-span-2 h-10 rounded-xl bg-[#08783f] px-3 text-[10px] font-extrabold text-white transition hover:bg-[#066b36] disabled:cursor-not-allowed disabled:bg-[#dfe5e1] disabled:text-[#89958f] sm:col-span-1 sm:px-4">{quotaFull && isWaiting ? "Kuota Penuh" : acceptanceClosed && isWaiting ? "Penerimaan Ditutup" : "Terima Pekerja"}</button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-[#e5ebe7] px-3 sm:px-5">
          <div className="flex min-w-max">
            {APPLICANT_PROFILE_TABS.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`border-b-2 px-3 py-3 text-[10px] font-extrabold transition sm:px-4 ${activeTab === tab ? "border-[#16864c] text-[#08783f]" : "border-transparent text-[#68756f] hover:text-[#315b4c]"}`}>{tab}</button>)}
          </div>
        </div>
      </section>

      {quotaFull && isWaiting ? <p className="mt-4 flex items-start gap-2 rounded-2xl border border-[#f0e0c4] bg-[#fff9ed] p-4 text-[11px] font-semibold leading-5 text-[#72551f]"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#d18a14]" /> Semua posisi sudah terisi. Anda tetap dapat melihat profil, menghubungi, atau menolak pelamar ini.</p> : null}

      <div className="mt-5">
        {activeTab === "Ringkasan" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-[20px] border border-[#dfe7e2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.035)]">
              <h3 className="text-sm font-extrabold text-[#17201c]">Tentang Pekerja</h3>
              <div className="mt-4"><p className="text-[10px] font-bold text-[#718078]">Keahlian utama</p><div className="mt-2 flex flex-wrap gap-2">{applicant.skills.map((skill) => <span key={skill} className="rounded-lg bg-[#f0f5f2] px-2.5 py-1.5 text-[9px] font-extrabold text-[#315b4c]">{skill}</span>)}</div></div>
              <div className="mt-4"><p className="text-[10px] font-bold text-[#718078]">Deskripsi</p><p className="mt-2 text-xs font-medium leading-6 text-[#43554c]">{applicant.bio}</p></div>
              <dl className="mt-5 space-y-3 text-[10px]"><div className="flex justify-between gap-4"><dt className="font-bold text-[#718078]">Domisili</dt><dd className="text-right font-extrabold text-[#26372f]">{applicant.location}</dd></div><div className="flex justify-between gap-4"><dt className="inline-flex items-center gap-1.5 font-bold text-[#718078]"><Languages className="h-3.5 w-3.5" /> Bahasa</dt><dd className="text-right font-extrabold text-[#26372f]">{applicant.languages.join(", ")}</dd></div></dl>
            </section>
            <section className="rounded-[20px] border border-[#dfe7e2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.035)]">
              <h3 className="text-sm font-extrabold text-[#17201c]">Ringkasan Performa</h3>
              <dl className="mt-4 divide-y divide-[#edf1ef] text-[11px]"><div className="flex items-center justify-between py-3"><dt className="flex items-center gap-2 font-bold text-[#68756f]"><ClipboardCheck className="h-4 w-4 text-[#4f8067]" /> Pekerjaan selesai</dt><dd className="font-extrabold text-[#26372f]">{applicant.completedJobs} pekerjaan</dd></div><div className="flex items-center justify-between py-3"><dt className="flex items-center gap-2 font-bold text-[#68756f]"><Star className="h-4 w-4 text-[#d79b20]" /> Rata-rata rating</dt><dd className="font-extrabold text-[#26372f]">{applicant.rating.toLocaleString("id-ID", { minimumFractionDigits: 1 })}</dd></div><div className="flex items-center justify-between py-3"><dt className="flex items-center gap-2 font-bold text-[#68756f]"><Gauge className="h-4 w-4 text-[#4f8067]" /> Penyelesaian</dt><dd className="font-extrabold text-[#26372f]">{applicant.completionRate}%</dd></div><div className="flex items-center justify-between py-3"><dt className="flex items-center gap-2 font-bold text-[#68756f]"><CircleX className="h-4 w-4 text-[#8b6971]" /> Pembatalan</dt><dd className="font-extrabold text-[#26372f]">{applicant.cancellationRate}%</dd></div></dl>
            </section>
            <section className="rounded-[20px] border border-[#dfe7e2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.035)] lg:col-span-2">
              <h3 className="text-sm font-extrabold text-[#17201c]">Rekam Jejak Terbaru</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">{applicant.workHistory.slice(0, 3).map((history) => <article key={history.id} className="rounded-xl border border-[#e5ebe7] p-3"><p className="text-[11px] font-extrabold text-[#26372f]">{history.title}</p><p className="mt-1 text-[9px] font-semibold text-[#718078]">{history.businessName}</p><div className="mt-3 flex items-center justify-between text-[9px]"><span className="rounded-md bg-[#e7f6e9] px-2 py-1 font-bold text-[#23713a]">Selesai</span><span className="inline-flex items-center gap-1 font-bold text-[#9b6b16]"><Star className="h-3 w-3 fill-[#f4b83e] text-[#f4b83e]" /> {history.rating.toLocaleString("id-ID", { minimumFractionDigits: 1 })}</span></div></article>)}</div>
            </section>
          </div>
        ) : null}

        {activeTab === "Riwayat Pekerjaan" ? <section className="rounded-[20px] border border-[#dfe7e2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.035)]"><h3 className="text-sm font-extrabold text-[#17201c]">Riwayat Pekerjaan</h3><div className="mt-4 space-y-3">{applicant.workHistory.map((history) => <article key={history.id} className="flex flex-col gap-3 rounded-xl border border-[#e5ebe7] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-extrabold text-[#26372f]">{history.title}</p><p className="mt-1 text-[10px] font-semibold text-[#718078]">{history.businessName} · selesai {formatDate(history.completedAt)}</p></div><span className="inline-flex items-center gap-1 self-start text-[10px] font-extrabold text-[#9b6b16]"><Star className="h-3.5 w-3.5 fill-[#f4b83e] text-[#f4b83e]" /> {history.rating.toLocaleString("id-ID", { minimumFractionDigits: 1 })}</span></article>)}</div></section> : null}

        {activeTab === "Ulasan & Rating" ? <section className="rounded-[20px] border border-[#dfe7e2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.035)]"><h3 className="text-sm font-extrabold text-[#17201c]">Ulasan dari UMKM</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{applicant.reviews.map((review) => <article key={review.id} className="rounded-xl border border-[#e5ebe7] p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-extrabold text-[#26372f]">{review.businessName}</p><span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#9b6b16]"><Star className="h-3.5 w-3.5 fill-[#f4b83e] text-[#f4b83e]" /> {review.rating}</span></div><p className="mt-3 text-[11px] font-medium leading-5 text-[#52645b]">“{review.comment}”</p><p className="mt-3 text-[9px] font-semibold text-[#819087]">{formatDate(review.createdAt)}</p></article>)}</div></section> : null}

        {activeTab === "Sertifikat & Portofolio" ? <div className="grid gap-4 lg:grid-cols-2"><section className="rounded-[20px] border border-[#dfe7e2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.035)]"><h3 className="flex items-center gap-2 text-sm font-extrabold text-[#17201c]"><FileBadge2 className="h-5 w-5 text-[#16864c]" /> Sertifikat Kerja Digital</h3><div className="mt-4 space-y-3">{applicant.certificates.map((certificate) => <article key={certificate.id} className="flex items-start gap-3 rounded-xl border border-[#e5ebe7] bg-[#f8fbf9] p-4"><BadgeCheck className="h-6 w-6 shrink-0 text-[#16864c]" /><div><p className="text-[11px] font-extrabold text-[#26372f]">{certificate.title}</p><p className="mt-1 text-[9px] font-semibold text-[#718078]">Terbit {formatDate(certificate.issuedAt)}</p></div></article>)}</div></section><section className="rounded-[20px] border border-[#dfe7e2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.035)]"><h3 className="flex items-center gap-2 text-sm font-extrabold text-[#17201c]"><Award className="h-5 w-5 text-[#d79b20]" /> Portofolio Pekerjaan</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{applicant.portfolio.map((item) => <article key={item.id} className="rounded-xl border border-[#e5ebe7] p-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5f1] text-[#16864c]"><MessageSquareText className="h-5 w-5" /></div><p className="mt-3 text-[11px] font-extrabold text-[#26372f]">{item.title}</p><p className="mt-1 text-[9px] font-semibold text-[#718078]">{item.category}</p></article>)}</div></section></div> : null}
      </div>
    </div>
  );
}

const RATING_TAGS = [
  "Datang tepat waktu",
  "Komunikasi baik",
  "Bertanggung jawab",
  "Pekerjaan sesuai deskripsi",
  "Hasil kerja memuaskan",
  "Bersedia bekerja lagi",
];

function AssignmentDetailView({ job, application, assignment, rating, currentDate, ownerName, businessName, onBack, onContact, onViewProfile, onRequestCancel, onConfirmCompletion, onOpenRating }: {
  job: Job;
  application: JobApplication;
  assignment: JobAssignment;
  rating: AssignmentRating | null;
  currentDate: string;
  ownerName: string;
  businessName: string;
  onBack: () => void;
  onContact: () => void;
  onViewProfile: () => void;
  onRequestCancel: () => void;
  onConfirmCompletion: () => void;
  onOpenRating: () => void;
}) {
  const status = deriveAssignmentStatus(assignment, job, currentDate);
  const { applicant } = application;
  const canCancel = canCancelAcceptedApplication(job.startDate, currentDate) && !assignment.cancelledAt;
  const canConfirm = currentDate > job.endDate && !assignment.employerConfirmedAt && !assignment.cancelledAt;
  const timeline = ["Diterima", "Akan Dimulai", "Sedang Berlangsung", "Konfirmasi Dua Pihak", "Selesai"];
  const activeStep = status === "Akan Dimulai" ? 1 : status === "Sedang Berlangsung" ? 2 : status === "Selesai" ? 4 : status === "Dibatalkan" ? 0 : 3;

  if (status === "Selesai") {
    return (
      <div className="mx-auto max-w-[920px]">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-extrabold text-[#315b4c] transition hover:text-[#08783f]"><ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Pelamar</button>
        <section className="mt-4 rounded-[24px] border border-[#dce8e1] bg-white p-5 text-center shadow-[0_12px_36px_rgba(18,59,48,.05)] sm:p-8">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e5f5e9] text-[#16864c] ring-8 ring-[#f3faf5]"><CheckCircle2 className="h-11 w-11" /></div>
          <h2 className="mt-6 font-[family-name:var(--font-worker-display)] text-3xl font-semibold tracking-[-0.04em] text-[#10231d]">Pekerjaan Berhasil Diselesaikan!</h2>
          <p className="mt-2 text-sm font-semibold text-[#607168]">Konfirmasi Dua Pihak untuk {job.title} telah tercatat.</p>

          <div className="mx-auto mt-6 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-[#dfe7e2] bg-[#f8fbf9] p-4"><p className="text-[10px] font-bold text-[#718078]">Periode</p><p className="mt-1 text-xs font-extrabold text-[#26372f]">{formatDateRange(job.startDate, job.endDate)} · {job.duration} hari</p></div>
            <div className="rounded-2xl border border-[#dfe7e2] bg-[#f8fbf9] p-4"><p className="text-[10px] font-bold text-[#718078]">Total upah</p><p className="mt-1 text-xs font-extrabold text-[#26372f]">Rp {rupiah.format(job.wage * job.duration)}</p></div>
            <div className="rounded-2xl border border-[#dfe7e2] bg-[#f8fbf9] p-4 sm:col-span-2"><p className="text-[10px] font-bold text-[#718078]">Pekerja</p><div className="mt-2 flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-full text-[10px] font-black ${applicant.tone}`}>{applicant.initials}</span><p className="text-xs font-extrabold text-[#26372f]">{applicant.name}</p></div></div>
          </div>

          <div className="mx-auto mt-5 grid max-w-2xl gap-2 text-left sm:grid-cols-2">
            {["Konfirmasi kedua pihak tercatat", "Sertifikat Kerja Digital diterbitkan", "Trust Score dan PullPoints diproses", "Riwayat pekerjaan tersimpan"].map((item) => <p key={item} className="flex items-start gap-2 rounded-xl bg-[#f1f8f3] px-3 py-2.5 text-[10px] font-bold text-[#315b4c]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16864c]" /> {item}</p>)}
          </div>

          {rating ? <p className="mx-auto mt-5 max-w-2xl rounded-xl border border-[#dcebe1] bg-[#f3faf5] px-4 py-3 text-xs font-extrabold text-[#23713a]">Rating {rating.stars}/5 telah dikirim untuk {applicant.name}.</p> : <p className="mx-auto mt-5 max-w-2xl rounded-xl border border-[#dbe5f3] bg-[#f4f8fd] px-4 py-3 text-xs font-semibold text-[#456282]">Rating sudah terbuka dan dapat membantu reputasi pekerja di Pull.</p>}

          <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
            <button type="button" onClick={onBack} className="h-11 rounded-xl border border-[#cbd5cf] text-xs font-extrabold text-[#42534b] transition hover:bg-[#f5f8f6]">Kembali ke Daftar Pelamar</button>
            <button type="button" disabled={Boolean(rating)} onClick={onOpenRating} className="h-11 rounded-xl bg-[#08783f] px-4 text-xs font-extrabold text-white transition hover:bg-[#066b36] disabled:cursor-not-allowed disabled:bg-[#dfe5e1] disabled:text-[#89958f]">{rating ? "Rating Telah Dikirim" : `Beri Rating untuk ${applicant.name.split(" ")[0]}`}</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px]">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-extrabold text-[#315b4c] transition hover:text-[#08783f]"><ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Pelamar</button>

      <section className="mt-4 rounded-[22px] border border-[#dfe7e2] bg-white p-5 shadow-[0_10px_30px_rgba(18,59,48,.045)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><div className="flex flex-wrap items-center gap-2.5"><h2 className="font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-0.035em] text-[#10231d]">{job.title}</h2><AssignmentStatusBadge status={status} /></div><p className="mt-2 text-xs font-semibold text-[#68756f]">{formatDateRange(job.startDate, job.endDate)} · {job.duration} hari kerja</p></div>
          <span className="inline-flex items-center gap-2 self-start rounded-xl bg-[#eff7f2] px-3 py-2 text-[10px] font-bold text-[#315b4c]"><MapPin className="h-3.5 w-3.5" /> {job.district}, Solo</span>
        </div>

        <div className="mt-5 rounded-2xl border border-[#dcebe1] bg-[#f5faf7] p-4">
          <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e1f2e6] text-[#16864c]"><UserRoundCheck className="h-6 w-6" /></span><div><p className="text-xs font-extrabold text-[#244b3c]">Pekerja diterima</p><p className="mt-1 text-[10px] font-medium text-[#63746b]">Status pekerjaan: {status}</p></div></div><p className="text-right text-[10px] font-extrabold text-[#315b4c]">{job.acceptedCount} dari {job.workerQuota}<span className="block font-medium text-[#718078]">posisi terisi</span></p></div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <ol className="flex min-w-[680px] items-start">
            {timeline.map((step, index) => <li key={step} className="relative flex flex-1 flex-col items-center px-2 text-center before:absolute before:left-0 before:top-3 before:h-0.5 before:w-full before:bg-[#dfe7e2] first:before:left-1/2 first:before:w-1/2 last:before:w-1/2"><span className={`relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 text-[9px] font-black ${index <= activeStep ? "border-[#16864c] bg-[#16864c] text-white" : "border-[#cbd8d1] bg-white text-[#87958d]"}`}>{index < activeStep ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className={`mt-2 text-[9px] font-extrabold ${index <= activeStep ? "text-[#315b4c]" : "text-[#8a9690]"}`}>{step}</span></li>)}
          </ol>
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_.86fr]">
        <section className="rounded-[20px] border border-[#dfe7e2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.035)]">
          <h3 className="text-sm font-extrabold text-[#17201c]">Detail Pekerjaan</h3>
          <dl className="mt-4 grid gap-4 text-[11px] sm:grid-cols-2"><div><dt className="font-bold text-[#718078]">Jam kerja</dt><dd className="mt-1 font-extrabold text-[#26372f]">{job.workHours}</dd></div><div><dt className="font-bold text-[#718078]">Upah per hari</dt><dd className="mt-1 font-extrabold text-[#26372f]">Rp {rupiah.format(job.wage)}</dd></div><div><dt className="font-bold text-[#718078]">Total upah</dt><dd className="mt-1 font-extrabold text-[#26372f]">Rp {rupiah.format(job.wage * job.duration)}</dd></div><div><dt className="font-bold text-[#718078]">Lokasi</dt><dd className="mt-1 font-extrabold text-[#26372f]">{job.district}, Solo</dd></div><div className="sm:col-span-2"><dt className="font-bold text-[#718078]">Deskripsi</dt><dd className="mt-1 font-medium leading-5 text-[#43554c]">{job.description}</dd></div></dl>
        </section>

        <section className="rounded-[20px] border border-[#dfe7e2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.035)]">
          <h3 className="text-sm font-extrabold text-[#17201c]">Pekerja Diterima</h3>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#e5ebe7] p-4"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-xs font-black ${applicant.tone}`}>{applicant.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-[#26372f]">{applicant.name}</p><p className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-[#16804b]"><ShieldCheck className="h-3.5 w-3.5 fill-[#16804b] text-white" /> Trust Score {applicant.trustScore} · {applicant.trustLabel}</p></div></div>
          <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={onViewProfile} className="h-10 rounded-xl border border-[#cbd5cf] text-[10px] font-extrabold text-[#42534b] transition hover:bg-[#f5f8f6]">Lihat Profil</button><button type="button" onClick={onContact} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#70ad87] bg-[#f1f9f3] text-[10px] font-extrabold text-[#08783f] transition hover:bg-[#e5f4e9]"><FaWhatsapp className="h-4 w-4" /> WhatsApp</button></div>
          {canCancel ? <button type="button" onClick={onRequestCancel} className="mt-2 h-10 w-full rounded-xl border border-[#df8c9b] text-[10px] font-extrabold text-[#b52d46] transition hover:bg-[#fff1f3]">Batalkan Penerimaan</button> : null}
        </section>
      </div>

      {currentDate > job.endDate ? (
        <section className="mt-5 rounded-[22px] border border-[#dfe7e2] bg-white p-5 shadow-[0_10px_30px_rgba(18,59,48,.045)] sm:p-6">
          <div className="flex items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#eef5f1] text-[#16864c]"><Handshake className="h-6 w-6" /></span><div><h3 className="text-base font-extrabold text-[#17201c]">Konfirmasi Dua Pihak</h3><p className="mt-1 max-w-2xl text-[11px] font-medium leading-5 text-[#68756f]">Kedua pihak harus mengonfirmasi bahwa pekerjaan telah selesai sebelum Sertifikat Kerja Digital dan fitur rating tersedia.</p></div></div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e1e8e4] p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#dff1e5] text-xs font-black text-[#315746]">{ownerName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div className="min-w-0 flex-1"><p className="text-[9px] font-bold text-[#718078]">UMKM (Anda)</p><p className="truncate text-xs font-extrabold text-[#26372f]">{businessName}</p></div>{assignment.employerConfirmedAt ? <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#23713a]"><CheckCircle2 className="h-4 w-4" /> Sudah konfirmasi</span> : <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#a85d1d]"><Clock3 className="h-4 w-4" /> Belum konfirmasi</span>}</div>{canConfirm ? <button type="button" onClick={onConfirmCompletion} className="mt-4 h-10 w-full rounded-xl bg-[#08783f] text-[10px] font-extrabold text-white transition hover:bg-[#066b36]">Konfirmasi Pekerjaan Selesai</button> : null}</div>
            <div className="rounded-2xl border border-[#e1e8e4] p-4"><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-full text-[10px] font-black ${applicant.tone}`}>{applicant.initials}</span><div className="min-w-0 flex-1"><p className="text-[9px] font-bold text-[#718078]">Pekerja</p><p className="truncate text-xs font-extrabold text-[#26372f]">{applicant.name}</p></div>{assignment.workerConfirmedAt ? <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#23713a]"><CheckCircle2 className="h-4 w-4" /> Sudah konfirmasi</span> : <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#a85d1d]"><Clock3 className="h-4 w-4" /> Belum konfirmasi</span>}</div><p className="mt-4 rounded-xl bg-[#f8faf8] px-3 py-2.5 text-[10px] font-medium leading-5 text-[#63746b]">Konfirmasi pekerja tercatat dari dashboard pekerja dan tidak dapat diubah oleh UMKM.</p></div>
          </div>
          {assignment.employerConfirmedAt && !assignment.workerConfirmedAt ? <p className="mt-4 rounded-xl border border-[#f0e0c4] bg-[#fff9ed] px-4 py-3 text-[10px] font-bold text-[#72551f]">Konfirmasi Anda telah tercatat. Menunggu konfirmasi dari {applicant.name}.</p> : null}
          {!assignment.employerConfirmedAt && assignment.workerConfirmedAt ? <p className="mt-4 rounded-xl border border-[#dbe5f3] bg-[#f4f8fd] px-4 py-3 text-[10px] font-bold text-[#456282]">{applicant.name} sudah mengonfirmasi. Silakan konfirmasi dari pihak UMKM untuk menyelesaikan pekerjaan.</p> : null}
        </section>
      ) : (
        <p className="mt-5 flex items-start gap-2 rounded-2xl border border-[#dbe5f3] bg-[#f4f8fd] p-4 text-[11px] font-semibold leading-5 text-[#456282]"><Clock3 className="mt-0.5 h-4 w-4 shrink-0" /> Konfirmasi Dua Pihak akan tersedia setelah tanggal pekerjaan selesai, yaitu setelah {formatDate(job.endDate)}.</p>
      )}
    </div>
  );
}

function CompletionSuccessModal({ job, application, onClose, onRate }: {
  job: Job;
  application: JobApplication;
  onClose: () => void;
  onRate: () => void;
}) {
  return <ModalFrame compact title="Pekerjaan Berhasil Diselesaikan!" titleId="completion-success-title" onClose={onClose}><div className="overflow-y-auto p-5 text-center sm:p-6"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e5f5e9] text-[#16864c] ring-8 ring-[#f3faf5]"><CheckCircle2 className="h-9 w-9" /></div><p className="mt-5 text-sm font-extrabold text-[#26372f]">{job.title}</p><p className="mt-2 text-xs font-medium leading-6 text-[#66766e]">Konfirmasi Anda dan {application.applicant.name} telah tercatat. Sertifikat, riwayat kerja, Trust Score, dan PullPoints kini diproses.</p><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={onClose} className="h-11 rounded-xl border border-[#cbd5cf] text-xs font-extrabold text-[#42534b] transition hover:bg-[#f5f8f6]">Nanti Saja</button><button type="button" onClick={onRate} className="h-11 rounded-xl bg-[#08783f] px-3 text-xs font-extrabold text-white transition hover:bg-[#066b36]">Beri Rating</button></div></div></ModalFrame>;
}

function RatingWorkerModal({ job, application, onClose, onSubmit }: {
  job: Job;
  application: JobApplication;
  onClose: () => void;
  onSubmit: (stars: number, tags: string[], review: string) => void;
}) {
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!stars) {
      setError("Pilih rating 1–5 bintang sebelum mengirim.");
      return;
    }
    onSubmit(stars, tags, review);
  }

  return (
    <ModalFrame title={`Beri Rating untuk ${application.applicant.name}`} titleId="rating-worker-title" description={`${job.title} · ${formatDateRange(job.startDate, job.endDate)}`} onClose={onClose}>
      <div className="overflow-y-auto p-5 sm:p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-[#e1e8e4] p-4"><span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-sm font-black ${application.applicant.tone}`}>{application.applicant.initials}</span><div><p className="text-sm font-extrabold text-[#26372f]">{application.applicant.name}</p><p className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-[#16804b]"><ShieldCheck className="h-3.5 w-3.5 fill-[#16804b] text-white" /> Trust Score {application.applicant.trustScore} · {application.applicant.trustLabel}</p></div></div>

        <fieldset className="mt-5"><legend className="text-xs font-extrabold text-[#26372f]">Rating keseluruhan <span className="text-[#b52d46]">*</span></legend><div className="mt-3 flex items-center gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => { setStars(value); setError(null); }} aria-label={`${value} bintang`} aria-pressed={stars === value} className="rounded-lg p-1 transition hover:bg-[#fff8e9]"><Star className={`h-8 w-8 ${value <= stars ? "fill-[#f4b83e] text-[#f4b83e]" : "text-[#cbd3cf]"}`} /></button>)}<span className="ml-2 text-xs font-extrabold text-[#52645b]">{stars ? `${stars}.0` : "Belum dipilih"}</span></div>{error ? <p role="alert" className="mt-2 text-[10px] font-bold text-[#b52d46]">{error}</p> : null}</fieldset>

        <fieldset className="mt-5"><legend className="text-xs font-extrabold text-[#26372f]">Tag penilaian <span className="font-semibold text-[#718078]">(opsional)</span></legend><div className="mt-3 flex flex-wrap gap-2">{RATING_TAGS.map((tag) => { const selected = tags.includes(tag); return <button key={tag} type="button" aria-pressed={selected} onClick={() => setTags((current) => selected ? current.filter((item) => item !== tag) : [...current, tag])} className={`rounded-full border px-3 py-2 text-[10px] font-extrabold transition ${selected ? "border-[#16864c] bg-[#eaf6ed] text-[#08783f]" : "border-[#dce5df] text-[#5f7067] hover:bg-[#f7faf8]"}`}>{selected ? "✓ " : "+ "}{tag}</button>; })}</div></fieldset>

        <label htmlFor="worker-rating-review" className="mt-5 block text-xs font-extrabold text-[#26372f]">Ulasan <span className="font-semibold text-[#718078]">(opsional)</span></label><textarea id="worker-rating-review" value={review} maxLength={300} onChange={(event) => setReview(event.target.value)} placeholder="Bagikan pengalaman Anda bekerja dengan pekerja ini..." className="mt-2 min-h-28 w-full resize-none rounded-xl border border-[#dfe5e1] p-3 text-xs text-[#26372f] outline-none transition focus:border-[#71a987] focus:ring-4 focus:ring-[#e7f3eb]" /><p className="mt-1 text-right text-[9px] font-semibold text-[#819087]">{review.length}/300</p>

        <div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={onClose} className="h-11 rounded-xl border border-[#cbd5cf] text-xs font-extrabold text-[#42534b] transition hover:bg-[#f5f8f6]">Lewati</button><button type="button" onClick={submit} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-3 text-xs font-extrabold text-white transition hover:bg-[#066b36]"><Send className="h-4 w-4" /> Kirim Rating</button></div>
      </div>
    </ModalFrame>
  );
}

function ApplicantCard({ application, quotaFull, acceptanceClosed, canCancelAcceptance, hasAssignment, onContact, onReject, onViewProfile, onRequestAccept, onRequestCancelAcceptance, onManageAssignment }: {
  application: JobApplication;
  quotaFull: boolean;
  acceptanceClosed: boolean;
  canCancelAcceptance: boolean;
  hasAssignment: boolean;
  onContact: (application: JobApplication) => void;
  onReject: (application: JobApplication) => void;
  onViewProfile: (application: JobApplication) => void;
  onRequestAccept: (application: JobApplication) => void;
  onRequestCancelAcceptance: (application: JobApplication) => void;
  onManageAssignment: (application: JobApplication) => void;
}) {
  const { applicant } = application;
  const canDecide = application.status === "Menunggu Respons";
  const canAccept = canDecide && !quotaFull && !acceptanceClosed;
  const isAccepted = application.status === "Diterima";

  return (
    <article className="rounded-2xl border border-[#dfe7e2] bg-white p-4 shadow-[0_7px_22px_rgba(18,59,48,.04)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-sm font-black ${applicant.tone}`}>{applicant.initials}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#17201c]">{applicant.name}</h3>
              <ApplicationStatusBadge status={application.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold text-[#68756f]">
              <span className="inline-flex items-center gap-1 text-[#9b6b16]"><Star className="h-3.5 w-3.5 fill-[#f4b83e] text-[#f4b83e]" /> {applicant.rating.toLocaleString("id-ID", { minimumFractionDigits: 1 })} ({applicant.reviewCount} ulasan)</span>
              <span>{applicant.completedJobs} pekerjaan selesai</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#f2f8f4] px-3 py-2">
          <ShieldCheck className="h-5 w-5 fill-[#16804b] text-white" />
          <div><p className="text-[8px] font-bold text-[#74847c]">Trust Score</p><p className="text-xs font-extrabold text-[#16804b]">{applicant.trustScore} · {applicant.trustLabel}</p></div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl bg-[#f8faf8] p-3 text-[10px] font-semibold text-[#5e6e66] sm:grid-cols-3">
        <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#4c7862]" />{applicant.location}</span>
        <span className="flex flex-wrap gap-1.5">{applicant.skills.map((skill) => <span key={skill} className="rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#315b4c]">{skill}</span>)}</span>
        <span className="inline-flex items-center gap-2 sm:justify-end"><CalendarDays className="h-3.5 w-3.5 text-[#4c7862]" />Melamar {formatDate(application.appliedAt)}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
        <button type="button" onClick={() => onViewProfile(application)} className="h-10 rounded-xl border border-[#cfd8d3] px-3 text-[10px] font-extrabold text-[#35443d] transition hover:bg-[#f5f8f6] sm:px-4">Lihat Profil</button>
        <button type="button" onClick={() => onContact(application)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#70ad87] bg-[#f1f9f3] px-3 text-[10px] font-extrabold text-[#08783f] transition hover:bg-[#e5f4e9] sm:px-4"><FaWhatsapp className="h-4 w-4" /> WhatsApp</button>
        {isAccepted ? (
          <>
            <button type="button" disabled={!hasAssignment} onClick={() => onManageAssignment(application)} className="h-10 rounded-xl bg-[#08783f] px-3 text-[10px] font-extrabold text-white transition hover:bg-[#066b36] disabled:cursor-not-allowed disabled:bg-[#dfe5e1] disabled:text-[#89958f] sm:px-4">Kelola Pekerjaan</button>
            <button type="button" disabled={!canCancelAcceptance} onClick={() => onRequestCancelAcceptance(application)} title={!canCancelAcceptance ? "Penerimaan hanya dapat dibatalkan sebelum pekerjaan dimulai." : undefined} className="h-10 rounded-xl border border-[#df8c9b] px-3 text-[10px] font-extrabold text-[#b52d46] transition hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:border-[#e1e5e3] disabled:text-[#a1aaa5] sm:px-4">Batalkan Penerimaan</button>
          </>
        ) : (
          <>
            <button type="button" disabled={!canDecide} onClick={() => onReject(application)} className="h-10 rounded-xl border border-[#df8c9b] px-3 text-[10px] font-extrabold text-[#b52d46] transition hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:border-[#e1e5e3] disabled:text-[#a1aaa5] disabled:hover:bg-white sm:px-4">Tolak</button>
            <button
              type="button"
              disabled={!canAccept}
              onClick={() => onRequestAccept(application)}
              title={quotaFull && canDecide ? "Semua posisi sudah terisi." : acceptanceClosed && canDecide ? "Penerimaan ditutup karena pekerjaan sudah dimulai." : !canDecide ? `Status pelamar: ${application.status}` : undefined}
              className="h-10 rounded-xl bg-[#08783f] px-3 text-[10px] font-extrabold text-white transition hover:bg-[#066b36] disabled:cursor-not-allowed disabled:bg-[#dfe5e1] disabled:text-[#89958f] sm:px-4"
            >
              {quotaFull && canDecide ? "Kuota Penuh" : acceptanceClosed && canDecide ? "Penerimaan Ditutup" : "Terima Pekerja"}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function ApplicantsView({ job, applications, assignments, onBack, onContact, onReject, onViewProfile, onRequestAccept, onRequestCancelAcceptance, onManageAssignment, onEditJob }: {
  job: Job;
  applications: JobApplication[];
  assignments: JobAssignment[];
  onBack: () => void;
  onContact: (application: JobApplication) => void;
  onReject: (application: JobApplication) => void;
  onViewProfile: (application: JobApplication) => void;
  onRequestAccept: (application: JobApplication) => void;
  onRequestCancelAcceptance: (application: JobApplication) => void;
  onManageAssignment: (application: JobApplication) => void;
  onEditJob: () => void;
}) {
  const [filter, setFilter] = useState<ApplicantFilter>("Semua");
  const summary = getApplicantSummary(applications, job.workerQuota);
  const quotaFull = summary.accepted >= job.workerQuota;
  const currentDate = new Date().toISOString().slice(0, 10);
  const acceptanceClosed = currentDate >= job.startDate;
  const canCancelAcceptance = canCancelAcceptedApplication(job.startDate, currentDate);
  const visibleApplications = filter === "Semua" ? applications : applications.filter((application) => application.status === filter);

  return (
    <div className="mx-auto max-w-[1240px]">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-extrabold text-[#315b4c] transition hover:text-[#08783f]"><ArrowLeft className="h-4 w-4" /> Kembali ke Lowongan Saya</button>

      <section className="mt-4 rounded-[22px] border border-[#dfe7e2] bg-white p-5 shadow-[0_10px_30px_rgba(18,59,48,.045)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-0.035em] text-[#10231d]">{job.title}</h2>
              <JobStatusBadge status={job.status} />
            </div>
            <p className="mt-2 text-xs font-medium text-[#6b7b75]">Kelola pelamar dan pantau keterisian posisi untuk lowongan ini.</p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-xl bg-[#eff7f2] px-3 py-2 text-[10px] font-bold text-[#315b4c]"><MapPin className="h-3.5 w-3.5" /> {job.district}, Solo</span>
        </div>

        <div className={`mt-5 grid gap-3 sm:grid-cols-2 ${quotaFull ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
          <div className="rounded-2xl border border-[#e1e8e4] p-4"><p className="text-[10px] font-bold text-[#718078]">Dibutuhkan</p><p className="mt-1 text-xl font-extrabold text-[#10231d]">{job.workerQuota}</p><p className="text-[9px] text-[#718078]">pekerja</p></div>
          <div className="rounded-2xl border border-[#e1e8e4] p-4"><p className="text-[10px] font-bold text-[#718078]">Total Pelamar</p><p className="mt-1 text-xl font-extrabold text-[#10231d]">{summary.total}</p><p className="text-[9px] text-[#718078]">pelamar</p></div>
          <div className="rounded-2xl border border-[#e1e8e4] p-4"><p className="text-[10px] font-bold text-[#718078]">Sudah Diterima</p><p className="mt-1 text-xl font-extrabold text-[#10231d]">{summary.accepted} dari {job.workerQuota}</p><p className="text-[9px] text-[#718078]">pekerja</p></div>
          {quotaFull ? <div className="rounded-2xl border border-[#efd9dd] bg-[#fff8f9] p-4"><p className="text-[10px] font-bold text-[#986071]">Status Lowongan</p><p className="mt-1 text-sm font-extrabold text-[#b52d46]">{acceptanceClosed ? job.status : "Kuota Penuh"}</p><p className="mt-1 text-[9px] text-[#8b6971]">semua posisi terisi</p></div> : null}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-4 text-[10px] font-extrabold text-[#315b4c]"><span>{summary.accepted} dari {job.workerQuota} posisi telah terisi</span><span>{summary.progress}%</span></div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e8edea]"><div className="h-full rounded-full bg-[#16864c] transition-[width]" style={{ width: `${summary.progress}%` }} /></div>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#f6faf7] px-3 py-2.5 text-[10px] font-semibold leading-5 text-[#547065]"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#16864c]" /> Menghubungi melalui WhatsApp tidak mengubah status lamaran. Status hanya berubah melalui tindakan rekrutmen di Pull.</p>

        {quotaFull ? (
          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#dcebe1] bg-[#f3faf5] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e1f2e6] text-[#16864c]"><CheckCircle2 className="h-6 w-6" /></span><div><p className="text-xs font-extrabold text-[#244b3c]">Semua posisi sudah terisi!</p><p className="mt-1 text-[10px] font-medium leading-5 text-[#63746b]">Anda tidak dapat menerima pekerja tambahan. Batalkan penerimaan sebelum tanggal mulai untuk membuka posisi kembali.</p></div></div>
            {!acceptanceClosed ? <button type="button" onClick={onEditJob} className="h-10 shrink-0 rounded-xl border border-[#70ad87] bg-white px-4 text-[10px] font-extrabold text-[#08783f] transition hover:bg-[#edf7f0]">Edit Lowongan</button> : null}
          </div>
        ) : null}
      </section>

      <div className="mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-[#dfe7e2] bg-white p-1.5">
        {APPLICANT_FILTERS.map((item) => {
          const count = item === "Semua" ? applications.length : applications.filter((application) => application.status === item).length;
          return <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-10 shrink-0 rounded-xl px-4 text-[10px] font-extrabold transition ${filter === item ? "bg-[#08783f] text-white" : "text-[#4d665b] hover:bg-[#f0f6f2]"}`}>{item} ({count})</button>;
        })}
      </div>

      <div className="mt-4 space-y-3">
        {visibleApplications.map((application) => (
          <ApplicantCard key={application.id} application={application} quotaFull={quotaFull} acceptanceClosed={acceptanceClosed} canCancelAcceptance={canCancelAcceptance} hasAssignment={assignments.some((assignment) => assignment.applicationId === application.id && !assignment.cancelledAt)} onContact={onContact} onReject={onReject} onViewProfile={onViewProfile} onRequestAccept={onRequestAccept} onRequestCancelAcceptance={onRequestCancelAcceptance} onManageAssignment={onManageAssignment} />
        ))}
        {!visibleApplications.length ? (
          <div className="rounded-2xl border border-dashed border-[#cbdad2] bg-white p-10 text-center"><UsersRound className="mx-auto h-9 w-9 text-[#78a08d]" /><p className="mt-3 text-sm font-extrabold text-[#315b4c]">Belum ada pelamar pada status ini</p><p className="mt-1 text-xs text-[#718078]">Pilih status lain untuk melihat daftar pelamar.</p></div>
        ) : null}
      </div>
    </div>
  );
}

export function LowonganSayaPage({ ownerName, businessName, profileCompletion }: {
  ownerName: string;
  businessName: string;
  profileCompletion: number;
}) {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [applicationsByJob, setApplicationsByJob] = useState<Record<string, JobApplication[]>>(INITIAL_APPLICATIONS);
  const [assignmentsByJob, setAssignmentsByJob] = useState<Record<string, JobAssignment[]>>(INITIAL_ASSIGNMENTS);
  const [ratings, setRatings] = useState<AssignmentRating[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [profileApplicationId, setProfileApplicationId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [completedAssignmentId, setCompletedAssignmentId] = useState<string | null>(null);
  const [ratingAssignmentId, setRatingAssignmentId] = useState<string | null>(null);
  const [pendingAcceptanceId, setPendingAcceptanceId] = useState<string | null>(null);
  const [pendingCancellationId, setPendingCancellationId] = useState<string | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("Semua kategori");
  const [districtFilter, setDistrictFilter] = useState("Semua kecamatan");
  const [dateFilter, setDateFilter] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const currentDate = new Date().toISOString().slice(0, 10);

  const displayJobs = useMemo(() => jobs.map((job) => {
    if (currentDate < job.startDate) return job;
    const status = deriveJobStatusFromAssignments(job, assignmentsByJob[job.id] ?? [], currentDate);
    return status === job.status ? job : { ...job, status };
  }), [assignmentsByJob, currentDate, jobs]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((tab) => [tab, tab === "Semua" ? displayJobs.length : displayJobs.filter((job) => job.status === tab).length])) as Record<ActiveTab, number>, [displayJobs]);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("id-ID");
    return displayJobs
      .filter((job) => activeTab === "Semua" || job.status === activeTab)
      .filter((job) => !query || `${job.title} ${job.category} ${job.district}`.toLocaleLowerCase("id-ID").includes(query))
      .filter((job) => categoryFilter === "Semua kategori" || job.category === categoryFilter)
      .filter((job) => districtFilter === "Semua kecamatan" || job.district === districtFilter)
      .filter((job) => !dateFilter || job.startDate === dateFilter)
      .sort((first, second) => {
        const comparison = first.title.localeCompare(second.title, "id-ID");
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [activeTab, categoryFilter, dateFilter, displayJobs, districtFilter, searchQuery, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / rowsPerPage));
  const safePage = Math.min(currentPage, pageCount);
  const firstIndex = (safePage - 1) * rowsPerPage;
  const visibleJobs = filteredJobs.slice(firstIndex, firstIndex + rowsPerPage);
  const selectedJob = displayJobs.find((job) => job.id === selectedJobId) ?? null;
  const editingJob = jobs.find((job) => job.id === editingJobId) ?? null;
  const selectedApplications = selectedJob ? applicationsByJob[selectedJob.id] ?? [] : [];
  const selectedAssignments = selectedJob ? assignmentsByJob[selectedJob.id] ?? [] : [];
  const profileApplication = selectedApplications.find((application) => application.id === profileApplicationId) ?? null;
  const selectedAssignment = selectedAssignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null;
  const selectedAssignmentApplication = selectedAssignment ? selectedApplications.find((application) => application.id === selectedAssignment.applicationId) ?? null : null;
  const completedAssignment = selectedAssignments.find((assignment) => assignment.id === completedAssignmentId) ?? null;
  const completedAssignmentApplication = completedAssignment ? selectedApplications.find((application) => application.id === completedAssignment.applicationId) ?? null : null;
  const ratingAssignment = selectedAssignments.find((assignment) => assignment.id === ratingAssignmentId) ?? null;
  const ratingAssignmentApplication = ratingAssignment ? selectedApplications.find((application) => application.id === ratingAssignment.applicationId) ?? null : null;
  const pendingAcceptance = selectedApplications.find((application) => application.id === pendingAcceptanceId) ?? null;
  const pendingCancellation = selectedApplications.find((application) => application.id === pendingCancellationId) ?? null;
  const hasFilters = Boolean(searchQuery || dateFilter || categoryFilter !== "Semua kategori" || districtFilter !== "Semua kecamatan" || activeTab !== "Semua");

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function resetFilters() {
    setSearchQuery("");
    setCategoryFilter("Semua kategori");
    setDistrictFilter("Semua kecamatan");
    setDateFilter("");
    setActiveTab("Semua");
    setCurrentPage(1);
  }

  function openPostModal(jobId: string | null = null) {
    setEditingJobId(jobId);
    setIsPostModalOpen(true);
    setOpenMenuId(null);
  }

  function saveJob(values: JobFormValues, intent: SubmissionIntent, existingJob: Job | null) {
    const workerQuota = Number(values.workerQuota) || existingJob?.workerQuota || 1;
    const acceptedCount = existingJob?.acceptedCount ?? 0;
    if (existingJob && workerQuota < acceptedCount) {
      setToast(`Jumlah pekerja tidak boleh kurang dari ${acceptedCount} pekerja yang sudah diterima.`);
      return;
    }
    const baseStatus: JobStatus = intent === "draft" ? "Draf" : "Terbuka";
    const nextJob: Job = {
      id: existingJob?.id ?? `job-${Date.now()}`,
      title: values.title.trim(),
      category: values.category,
      district: values.district,
      wage: Number(values.wage) || 0,
      duration: Number(values.duration) || 0,
      startDate: values.startDate,
      endDate: values.endDate,
      workerQuota,
      workHours: values.workHours.trim(),
      description: values.description.trim(),
      requirements: values.requirements.trim(),
      whatsappContact: values.whatsappContact.trim(),
      status: intent === "draft" ? "Draf" : deriveOpenJobStatus(baseStatus, acceptedCount, workerQuota),
      acceptedCount,
      applicantCount: existingJob?.applicantCount ?? 0,
      tone: existingJob?.tone ?? "green",
    };
    const exists = Boolean(existingJob);
    setJobs((current) => exists ? current.map((job) => job.id === nextJob.id ? nextJob : job) : [nextJob, ...current]);
    if (!exists) {
      setApplicationsByJob((current) => ({ ...current, [nextJob.id]: [] }));
      setAssignmentsByJob((current) => ({ ...current, [nextJob.id]: [] }));
    }
    setIsPostModalOpen(false);
    setEditingJobId(null);
    setActiveTab(intent === "draft" ? "Draf" : nextJob.status);
    setCurrentPage(1);
    setToast(intent === "draft" ? "Lowongan berhasil disimpan sebagai draft." : exists ? "Perubahan lowongan berhasil disimpan." : "Lowongan berhasil diposting.");
  }

  function duplicateJob(job: Job) {
    const duplicate = { ...job, id: `job-${Date.now()}`, title: `${job.title} (Salinan)`, acceptedCount: 0, applicantCount: 0, status: "Draf" as const };
    setJobs((current) => [duplicate, ...current]);
    setApplicationsByJob((current) => ({ ...current, [duplicate.id]: [] }));
    setAssignmentsByJob((current) => ({ ...current, [duplicate.id]: [] }));
    setOpenMenuId(null);
    setActiveTab("Draf");
    setCurrentPage(1);
    setToast("Lowongan berhasil diduplikat sebagai draft.");
  }

  function cancelJob(job: Job) {
    setJobs((current) => current.map((item) => item.id === job.id ? { ...item, status: "Dibatalkan" } : item));
    setOpenMenuId(null);
    setToast("Lowongan telah dibatalkan.");
  }

  function deleteJob(job: Job) {
    setJobs((current) => current.filter((item) => item.id !== job.id));
    setApplicationsByJob((current) => {
      const next = { ...current };
      delete next[job.id];
      return next;
    });
    setAssignmentsByJob((current) => {
      const next = { ...current };
      delete next[job.id];
      return next;
    });
    setOpenMenuId(null);
    setToast(`Lowongan ${job.title} dihapus.`);
  }

  function contactApplicant(application: JobApplication) {
    if (!selectedJob) return;
    const url = buildApplicantWhatsAppUrl({
      phone: application.applicant.phone,
      applicantName: application.applicant.name,
      ownerName,
      businessName,
      jobTitle: selectedJob.title,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function rejectApplicant(application: JobApplication) {
    if (!selectedJob || application.status !== "Menunggu Respons") return;
    setApplicationsByJob((current) => ({
      ...current,
      [selectedJob.id]: updateApplicationStatus(current[selectedJob.id] ?? [], application.id, "Ditolak"),
    }));
    setToast(`${application.applicant.name} telah ditolak.`);
  }

  function requestAcceptApplicant(application: JobApplication) {
    if (!selectedJob || application.status !== "Menunggu Respons") return;
    if (currentDate >= selectedJob.startDate) {
      setToast("Penerimaan ditutup karena pekerjaan sudah dimulai.");
      return;
    }
    const summary = getApplicantSummary(selectedApplications, selectedJob.workerQuota);
    if (summary.accepted >= selectedJob.workerQuota) {
      setToast("Semua posisi sudah terisi. Batalkan penerimaan pekerja lain untuk membuka posisi.");
      return;
    }
    setPendingAcceptanceId(application.id);
  }

  function confirmAcceptApplicant() {
    if (!selectedJob || !pendingAcceptance) return;
    const result = acceptJobApplication(
      selectedApplications,
      pendingAcceptance.id,
      selectedJob.workerQuota,
      new Date().toISOString().slice(0, 10),
    );

    if (!result.changed) {
      setPendingAcceptanceId(null);
      setToast(result.reason === "quota-full" ? "Semua posisi sudah terisi." : "Status pelamar sudah berubah. Muat ulang data pelamar.");
      return;
    }

    setApplicationsByJob((current) => ({ ...current, [selectedJob.id]: result.applications }));
    const acceptedApplication = result.applications.find((application) => application.id === pendingAcceptance.id);
    if (acceptedApplication) {
      const assignment = createJobAssignment(selectedJob.id, acceptedApplication, currentDate);
      setAssignmentsByJob((current) => ({ ...current, [selectedJob.id]: [...(current[selectedJob.id] ?? []), assignment] }));
    }
    setJobs((current) => current.map((job) => job.id === selectedJob.id ? {
      ...job,
      acceptedCount: result.acceptedCount,
      status: deriveOpenJobStatus(job.status, result.acceptedCount, job.workerQuota),
    } : job));
    setPendingAcceptanceId(null);
    setToast(`${pendingAcceptance.applicant.name} berhasil diterima.`);
  }

  function requestCancelAcceptance(application: JobApplication) {
    if (!selectedJob || application.status !== "Diterima") return;
    const currentDate = new Date().toISOString().slice(0, 10);
    if (!canCancelAcceptedApplication(selectedJob.startDate, currentDate)) {
      setToast("Penerimaan tidak dapat dibatalkan setelah pekerjaan dimulai.");
      return;
    }
    setPendingCancellationId(application.id);
  }

  function confirmCancelAcceptance() {
    if (!selectedJob || !pendingCancellation) return;
    const currentDate = new Date().toISOString().slice(0, 10);
    if (!canCancelAcceptedApplication(selectedJob.startDate, currentDate)) {
      setPendingCancellationId(null);
      setToast("Penerimaan tidak dapat dibatalkan setelah pekerjaan dimulai.");
      return;
    }

    const result = cancelAcceptedJobApplication(selectedApplications, pendingCancellation.id, currentDate);
    if (!result.changed) {
      setPendingCancellationId(null);
      setToast("Status pelamar sudah berubah. Muat ulang data pelamar.");
      return;
    }

    setApplicationsByJob((current) => ({ ...current, [selectedJob.id]: result.applications }));
    const assignmentToCancel = selectedAssignments.find((assignment) => assignment.applicationId === pendingCancellation.id && !assignment.cancelledAt);
    const updatedAssignments = assignmentToCancel
      ? selectedAssignments.map((assignment) => assignment.id === assignmentToCancel.id ? cancelJobAssignment(assignment, currentDate) : assignment)
      : selectedAssignments;
    setAssignmentsByJob((current) => ({ ...current, [selectedJob.id]: updatedAssignments }));
    setJobs((current) => current.map((job) => job.id === selectedJob.id ? {
      ...job,
      acceptedCount: result.acceptedCount,
      status: deriveJobStatusFromAssignments({ ...job, acceptedCount: result.acceptedCount }, updatedAssignments, currentDate),
    } : job));
    setSelectedAssignmentId(null);
    setPendingCancellationId(null);
    setToast(`Penerimaan ${pendingCancellation.applicant.name} dibatalkan. Satu posisi kembali tersedia.`);
  }

  function manageAssignment(application: JobApplication) {
    const assignment = selectedAssignments.find((item) => item.applicationId === application.id && !item.cancelledAt);
    if (!assignment) {
      setToast("Data pekerjaan untuk pelamar ini belum tersedia.");
      return;
    }
    setProfileApplicationId(null);
    setSelectedAssignmentId(assignment.id);
  }

  function confirmSelectedAssignmentCompletion() {
    if (!selectedJob || !selectedAssignment) return;
    const result = confirmAssignmentByEmployer(selectedAssignment, selectedJob, currentDate);
    if (!result.changed) {
      const message = result.reason === "too-early"
        ? "Konfirmasi baru tersedia setelah tanggal pekerjaan selesai."
        : result.reason === "already-confirmed"
          ? "Konfirmasi Anda sudah tercatat sebelumnya."
          : "Pekerjaan yang dibatalkan tidak dapat dikonfirmasi.";
      setToast(message);
      return;
    }

    const updatedAssignments = selectedAssignments.map((assignment) => assignment.id === result.assignment.id ? result.assignment : assignment);
    setAssignmentsByJob((current) => ({ ...current, [selectedJob.id]: updatedAssignments }));
    setJobs((current) => current.map((job) => job.id === selectedJob.id ? {
      ...job,
      status: deriveJobStatusFromAssignments(job, updatedAssignments, currentDate),
    } : job));
    setToast(result.completed ? "Konfirmasi Dua Pihak selesai. Pekerjaan dinyatakan selesai." : `Konfirmasi Anda tercatat. Menunggu konfirmasi dari ${selectedAssignmentApplication?.applicant.name ?? "pekerja"}.`);
    if (result.completed) setCompletedAssignmentId(result.assignment.id);
  }

  function openRating(assignmentId: string) {
    if (ratings.some((rating) => rating.assignmentId === assignmentId)) {
      setToast("Rating untuk pekerjaan ini sudah pernah dikirim.");
      return;
    }
    setRatingAssignmentId(assignmentId);
  }

  function submitRatingForAssignment(stars: number, tags: string[], review: string) {
    if (!ratingAssignment || !ratingAssignmentApplication) return;
    const result = submitAssignmentRating(ratings, ratingAssignment, { stars, tags, review, createdAt: currentDate });
    if (!result.changed) {
      setToast(result.reason === "already-rated" ? "Rating untuk pekerjaan ini sudah pernah dikirim." : "Rating belum dapat dikirim untuk pekerjaan ini.");
      return;
    }
    setRatings(result.ratings);
    setRatingAssignmentId(null);
    setToast("Rating berhasil dikirim. Trust Score pekerja diperbarui.");
  }

  function renderJobActions(job: Job, mobile = false, dropdownUp = false) {
    return (
      <div className={`relative flex items-center ${mobile ? "w-full gap-2" : "w-full gap-1"}`}>
        <button type="button" onClick={() => { setSelectedJobId(job.id); setProfileApplicationId(null); setSelectedAssignmentId(null); setOpenMenuId(null); }} className={`flex min-w-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#cfd8d3] font-extrabold text-[#26372f] transition hover:bg-[#f5f8f6] ${mobile ? "h-10 flex-1 gap-2 px-3 text-[11px]" : "h-9 flex-1 gap-1.5 px-1.5 text-[9px]"}`}>
          <UsersRound className="h-3.5 w-3.5 shrink-0" /> <span>{mobile ? "Lihat Pelamar" : <><span className="hidden 2xl:inline">Lihat </span>Pelamar</>}</span>
        </button>
        <button type="button" onClick={() => setOpenMenuId((current) => current === job.id ? null : job.id)} aria-label={`Menu ${job.title}`} aria-expanded={openMenuId === job.id} className={`grid shrink-0 place-items-center rounded-lg border border-[#dfe5e1] text-[#26372f] transition hover:bg-[#f5f8f6] ${mobile ? "h-10 w-10" : "h-9 w-8 xl:w-9"}`}><MoreVertical className="h-4 w-4" /></button>
        {openMenuId === job.id ? (
          <div className={`absolute right-0 z-30 w-48 rounded-xl border border-[#dfe5e1] bg-white p-1.5 shadow-[0_16px_42px_rgba(18,59,48,.16)] ${dropdownUp ? "bottom-12" : "top-12"}`}>
            <button type="button" onClick={() => openPostModal(job.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-bold text-[#34443d] hover:bg-[#f3f7f4]"><Pencil className="h-4 w-4" /> Edit</button>
            <button type="button" onClick={() => duplicateJob(job)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-bold text-[#34443d] hover:bg-[#f3f7f4]"><Copy className="h-4 w-4" /> Duplikat</button>
            <button type="button" disabled={job.status === "Dibatalkan"} onClick={() => cancelJob(job)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-bold text-[#8a631d] hover:bg-[#fff8e9] disabled:cursor-not-allowed disabled:opacity-45"><CircleX className="h-4 w-4" /> Batalkan</button>
            <button type="button" onClick={() => deleteJob(job)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-bold text-[#a52a43] hover:bg-[#fff1f3]"><Trash2 className="h-4 w-4" /> Hapus</button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <UmkmDashboardShell ownerName={ownerName} businessName={businessName} profileCompletion={profileCompletion}>
        {selectedJob && selectedAssignment && selectedAssignmentApplication ? (
          <AssignmentDetailView
            job={selectedJob}
            application={selectedAssignmentApplication}
            assignment={selectedAssignment}
            rating={ratings.find((rating) => rating.assignmentId === selectedAssignment.id) ?? null}
            currentDate={currentDate}
            ownerName={ownerName}
            businessName={businessName}
            onBack={() => setSelectedAssignmentId(null)}
            onContact={() => contactApplicant(selectedAssignmentApplication)}
            onViewProfile={() => { setSelectedAssignmentId(null); setProfileApplicationId(selectedAssignmentApplication.id); }}
            onRequestCancel={() => requestCancelAcceptance(selectedAssignmentApplication)}
            onConfirmCompletion={confirmSelectedAssignmentCompletion}
            onOpenRating={() => openRating(selectedAssignment.id)}
          />
        ) : selectedJob && profileApplication ? (
          <ApplicantProfileView
            job={selectedJob}
            application={profileApplication}
            quotaFull={getApplicantSummary(selectedApplications, selectedJob.workerQuota).accepted >= selectedJob.workerQuota}
            acceptanceClosed={currentDate >= selectedJob.startDate}
            canCancelAcceptance={canCancelAcceptedApplication(selectedJob.startDate, currentDate)}
            hasAssignment={selectedAssignments.some((assignment) => assignment.applicationId === profileApplication.id && !assignment.cancelledAt)}
            onBack={() => setProfileApplicationId(null)}
            onContact={() => contactApplicant(profileApplication)}
            onReject={() => rejectApplicant(profileApplication)}
            onRequestAccept={() => requestAcceptApplicant(profileApplication)}
            onRequestCancelAcceptance={() => requestCancelAcceptance(profileApplication)}
            onManageAssignment={() => manageAssignment(profileApplication)}
          />
        ) : selectedJob ? (
          <ApplicantsView
            job={selectedJob}
            applications={selectedApplications}
            assignments={selectedAssignments}
            onBack={() => { setSelectedJobId(null); setProfileApplicationId(null); setSelectedAssignmentId(null); }}
            onContact={contactApplicant}
            onReject={rejectApplicant}
            onViewProfile={(application) => setProfileApplicationId(application.id)}
            onRequestAccept={requestAcceptApplicant}
            onRequestCancelAcceptance={requestCancelAcceptance}
            onManageAssignment={manageAssignment}
            onEditJob={() => openPostModal(selectedJob.id)}
          />
        ) : (
          <div className="mx-auto max-w-[1240px]">
            <section className="rounded-[24px] border border-[#dfe8e1] bg-white p-4 shadow-[0_10px_35px_rgba(18,59,48,.035)] sm:p-5">
              <label htmlFor="job-search" className="flex h-14 items-center gap-3 rounded-[16px] border border-[#dfe5e1] bg-white px-4 text-[#5c8f70] transition focus-within:border-[#71a987] focus-within:ring-4 focus-within:ring-[#e7f3eb]">
                <Search className="h-5 w-5 shrink-0" />
                <input id="job-search" type="search" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }} placeholder="Cari judul pekerjaan, kategori, atau lokasi..." className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#31423b] outline-none placeholder:text-[#6d9b7e]" />
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
                <label className="flex h-[52px] min-w-0 flex-col justify-center rounded-[15px] border border-[#dfe5e1] px-3.5 py-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5c8f70]">Kategori</span>
                  <span className="relative mt-0.5 flex items-center"><select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setCurrentPage(1); }} className="w-full appearance-none bg-transparent pr-7 text-sm font-medium text-[#17392c] outline-none"><option>Semua kategori</option>{CATEGORY_OPTIONS.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#38694e]" /></span>
                </label>
                <label className="flex h-[52px] min-w-0 flex-col justify-center rounded-[15px] border border-[#dfe5e1] px-3.5 py-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5c8f70]">Lokasi</span>
                  <span className="relative mt-0.5 flex items-center"><select value={districtFilter} onChange={(event) => { setDistrictFilter(event.target.value); setCurrentPage(1); }} className="w-full appearance-none bg-transparent pr-7 text-sm font-medium text-[#17392c] outline-none"><option>Semua kecamatan</option>{DISTRICT_OPTIONS.map((district) => <option key={district}>{district}</option>)}</select><ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#38694e]" /></span>
                </label>
                <label className="flex h-[52px] min-w-0 flex-col justify-center rounded-[15px] border border-[#dfe5e1] px-3.5 py-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5c8f70]">Tanggal Mulai</span>
                  <input type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setCurrentPage(1); }} className="mt-0.5 bg-transparent text-sm font-medium text-[#17392c] outline-none" />
                </label>
                <button type="button" onClick={resetFilters} disabled={!hasFilters} className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[15px] border border-[#dfe5e1] px-4 text-[10px] font-extrabold text-[#4d665b] transition hover:bg-[#f4f8f5] disabled:cursor-not-allowed disabled:opacity-40"><RotateCcw className="h-4 w-4" /> Reset</button>
              </div>

              <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1 rounded-[15px] border border-[#dfe5e1] bg-white p-1">
                  <div className="flex flex-wrap gap-1">
                    {TABS.map((tab) => <button key={tab} type="button" onClick={() => { setActiveTab(tab); setCurrentPage(1); }} className={`min-h-10 whitespace-nowrap rounded-xl px-3 text-[9px] font-extrabold transition ${activeTab === tab ? TAB_ACTIVE_STYLES[tab] : "text-[#315b4c] hover:bg-[#eef5f1]"}`}>{tab} ({counts[tab]})</button>)}
                  </div>
                </div>
                <button type="button" onClick={() => openPostModal()} className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(8,120,63,.16)] transition hover:bg-[#066b36] xl:w-auto"><Plus className="h-4 w-4 shrink-0" /> Posting Lowongan</button>
              </div>
            </section>

            <p className="mt-5 text-[11px] font-bold text-[#507f63]">Menampilkan <strong className="text-[#17392c]">{filteredJobs.length}</strong> lowongan di Solo Raya</p>

            <div className="mt-4">
              {filteredJobs.length ? (
                <section className="overflow-visible rounded-2xl border border-[#dfe5e1] bg-white shadow-[0_8px_28px_rgba(18,59,48,.025)]">
                  <div className="space-y-3 p-3 xl:hidden">
                    {visibleJobs.map((job, index) => (
                      <article key={job.id} className="rounded-xl border border-[#e1e7e3] bg-white p-4 shadow-[0_5px_18px_rgba(18,59,48,.035)]">
                        <div className="flex items-start gap-3"><JobIcon job={job} /><div className="min-w-0 flex-1"><h3 className="text-[13px] font-extrabold leading-5 text-[#17201c]">{job.title}</h3><p className="mt-1 text-[10px] font-semibold text-[#68756f]">{job.category} · {job.district}</p></div><JobStatusBadge status={job.status} /></div>
                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-[#f7f9f7] p-3">
                          <div><p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Upah</p><p className="mt-1 text-[11px] font-extrabold text-[#26372f]">{job.wage ? `Rp ${rupiah.format(job.wage)}/hari` : "Belum diatur"}</p></div>
                          <div><p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Durasi</p><p className="mt-1 text-[11px] font-extrabold text-[#26372f]">{job.duration ? `${job.duration} hari` : "Belum diatur"}</p></div>
                          <div className="col-span-2"><p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Tanggal kerja</p><p className="mt-1 text-[11px] font-extrabold text-[#26372f]">{formatDateRange(job.startDate, job.endDate)}</p></div>
                          <div><p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Pelamar</p><p className="mt-1 text-[11px] font-extrabold text-[#26372f]">{job.applicantCount} pelamar</p></div>
                          <div><p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Posisi terisi</p><p className="mt-1 text-[11px] font-extrabold text-[#26372f]">{job.acceptedCount} dari {job.workerQuota} posisi</p></div>
                        </div>
                        <div className="mt-4">{renderJobActions(job, true, index >= visibleJobs.length - 2)}</div>
                      </article>
                    ))}
                  </div>

                  <div className="hidden xl:block">
                    <table className="w-full table-fixed border-collapse text-left">
                      <colgroup><col className="w-[22%]" /><col className="w-[11%]" /><col className="w-[7%]" /><col className="w-[13%]" /><col className="w-[11%]" /><col className="w-[8%]" /><col className="w-[12%]" /><col className="w-[16%]" /></colgroup>
                      <thead><tr className="border-b border-[#e5e7eb] text-[10px] font-extrabold text-[#1f2937]">
                        <th className="px-3 py-3.5"><button type="button" onClick={() => setSortDirection((current) => current === "asc" ? "desc" : "asc")} className="flex items-center gap-1.5">Judul Pekerjaan {sortDirection === "asc" ? <ArrowDownAZ className="h-3.5 w-3.5 text-[#68756f]" /> : <ArrowUpAZ className="h-3.5 w-3.5 text-[#68756f]" />}</button></th>
                        <th className="px-2 py-3.5">Upah/hari</th><th className="px-2 py-3.5">Durasi</th><th className="px-2 py-3.5">Tanggal kerja</th><th className="px-2 py-3.5">Status</th><th className="px-2 py-3.5">Pelamar</th><th className="px-2 py-3.5">Posisi terisi</th><th className="px-2 py-3.5">Aksi</th>
                      </tr></thead>
                      <tbody>{visibleJobs.map((job, index) => (
                        <tr key={job.id} className="border-b border-[#edf0ee] transition-colors last:border-b-0 hover:bg-[#f8fbf9]">
                          <td className="px-3 py-3.5"><div className="flex items-center gap-2.5"><JobIcon job={job} compact /><div className="min-w-0"><p className="line-clamp-2 text-[11px] font-extrabold leading-4 text-[#17201c]">{job.title}</p><p className="mt-1 truncate text-[9px] font-medium text-[#68756f]">{job.category} · {job.district}</p></div></div></td>
                          <td className="px-2 py-3.5 text-[10px] font-semibold text-[#334155]">{job.wage ? <>Rp {rupiah.format(job.wage)}<span className="block text-[8px] text-[#718078]">per hari</span></> : <span className="text-[#87928d]">Belum diatur</span>}</td>
                          <td className="px-2 py-3.5 text-[10px] font-semibold text-[#334155]">{job.duration ? `${job.duration} hari` : "—"}</td>
                          <td className="px-2 py-3.5 text-[9px] font-semibold leading-4 text-[#334155]">{formatDateRange(job.startDate, job.endDate)}</td>
                          <td className="px-2 py-3.5"><JobStatusBadge status={job.status} /></td>
                          <td className="px-2 py-3.5"><p className="text-[10px] font-extrabold text-[#17201c]">{job.applicantCount}</p><p className="mt-1 text-[8px] text-[#68756f]">pelamar</p></td>
                          <td className="px-2 py-3.5"><p className="text-[10px] font-extrabold text-[#17201c]">{job.acceptedCount} dari {job.workerQuota}</p><p className="mt-1 text-[8px] text-[#68756f]">posisi terisi</p></td>
                          <td className="px-1.5 py-3.5">{renderJobActions(job, false, index >= visibleJobs.length - 2)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                  <footer className="flex flex-col gap-4 border-t border-[#e5e7eb] px-5 py-4 text-[11px] font-medium text-[#65736c] sm:flex-row sm:items-center sm:justify-between">
                    <p>Menampilkan {firstIndex + 1}–{Math.min(firstIndex + rowsPerPage, filteredJobs.length)} dari {filteredJobs.length} lowongan</p>
                    <div className="flex items-center gap-2"><button type="button" aria-label="Halaman sebelumnya" disabled={safePage === 1} onClick={() => setCurrentPage((current) => Math.max(1, current - 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-[#dfe5e1] text-[#527063] disabled:opacity-35"><ChevronLeft className="h-4 w-4" /></button><span className="grid h-9 min-w-9 place-items-center rounded-lg bg-[#08783f] px-3 font-extrabold text-white">{safePage}</span><button type="button" aria-label="Halaman berikutnya" disabled={safePage === pageCount} onClick={() => setCurrentPage((current) => Math.min(pageCount, current + 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-[#dfe5e1] text-[#527063] disabled:opacity-35"><ChevronRight className="h-4 w-4" /></button></div>
                    <label className="flex items-center gap-3">Baris per halaman<select value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="h-9 rounded-lg border border-[#dfe5e1] bg-white px-3 font-semibold text-[#35443d]"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select></label>
                  </footer>
                </section>
              ) : <EmptyJobs hasJobs={jobs.length > 0} onCreate={() => openPostModal()} onReset={resetFilters} />}
            </div>
          </div>
        )}
      </UmkmDashboardShell>

      {isPostModalOpen ? <PostJobModal key={editingJob?.id ?? "new-job"} job={editingJob} onClose={() => { setIsPostModalOpen(false); setEditingJobId(null); }} onSave={saveJob} /> : null}
      {selectedJob && pendingAcceptance ? <AcceptWorkerModal job={selectedJob} application={pendingAcceptance} acceptedCount={getApplicantSummary(selectedApplications, selectedJob.workerQuota).accepted} onClose={() => setPendingAcceptanceId(null)} onConfirm={confirmAcceptApplicant} /> : null}
      {selectedJob && pendingCancellation ? <CancelAcceptanceModal job={selectedJob} application={pendingCancellation} onClose={() => setPendingCancellationId(null)} onConfirm={confirmCancelAcceptance} /> : null}
      {selectedJob && completedAssignment && completedAssignmentApplication ? <CompletionSuccessModal job={selectedJob} application={completedAssignmentApplication} onClose={() => setCompletedAssignmentId(null)} onRate={() => { setCompletedAssignmentId(null); openRating(completedAssignment.id); }} /> : null}
      {selectedJob && ratingAssignment && ratingAssignmentApplication ? <RatingWorkerModal job={selectedJob} application={ratingAssignmentApplication} onClose={() => setRatingAssignmentId(null)} onSubmit={submitRatingForAssignment} /> : null}
      {toast ? <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-[110] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0c261c] px-4 py-3 text-xs font-bold text-white shadow-[0_16px_45px_rgba(7,29,21,.28)]"><ShieldCheck className="h-4 w-4 shrink-0" />{toast}</div> : null}
    </>
  );
}
