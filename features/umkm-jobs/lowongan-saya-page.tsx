"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownAZ,
  ArrowLeft,
  ArrowUpAZ,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleX,
  Copy,
  MapPin,
  MoreVertical,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Shirt,
  Star,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";
import { CATEGORY_OPTIONS, DISTRICT_OPTIONS, INITIAL_APPLICATIONS, INITIAL_JOBS } from "./recruitment-data";
import {
  buildApplicantWhatsAppUrl,
  deriveOpenJobStatus,
  getApplicantSummary,
  updateApplicationStatus,
  validateJobForm,
} from "./recruitment-logic";
import type {
  ApplicationStatus,
  Job,
  JobApplication,
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

const APPLICANT_FILTERS: ApplicantFilter[] = ["Semua", "Menunggu Respons", "Diterima", "Ditolak"];

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
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${styles[status]}`}>
      {status}
    </span>
  );
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

function ModalFrame({ title, titleId, description, onClose, children }: {
  title: string;
  titleId: string;
  description?: string;
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
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="flex max-h-[94vh] w-full max-w-[820px] flex-col overflow-hidden rounded-t-[24px] border border-[#dfe5e1] bg-white shadow-[0_30px_90px_rgba(7,29,21,.28)] sm:rounded-[20px]">
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

function ApplicantCard({ application, onContact, onReject, onViewProfile, onRequestAccept }: {
  application: JobApplication;
  onContact: (application: JobApplication) => void;
  onReject: (application: JobApplication) => void;
  onViewProfile: (application: JobApplication) => void;
  onRequestAccept: (application: JobApplication) => void;
}) {
  const { applicant } = application;
  const canDecide = application.status === "Menunggu Respons";

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
        <button type="button" disabled={!canDecide} onClick={() => onReject(application)} className="h-10 rounded-xl border border-[#df8c9b] px-3 text-[10px] font-extrabold text-[#b52d46] transition hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:border-[#e1e5e3] disabled:text-[#a1aaa5] disabled:hover:bg-white sm:px-4">Tolak</button>
        <button
          type="button"
          disabled={!canDecide}
          onClick={() => onRequestAccept(application)}
          title={!canDecide ? `Status pelamar: ${application.status}` : undefined}
          className="h-10 rounded-xl bg-[#08783f] px-3 text-[10px] font-extrabold text-white transition hover:bg-[#066b36] disabled:cursor-not-allowed disabled:bg-[#dfe5e1] disabled:text-[#89958f] sm:px-4"
        >
          {application.status === "Diterima" ? "Sudah Diterima" : "Terima Pekerja"}
        </button>
      </div>
    </article>
  );
}

function ApplicantsView({ job, applications, onBack, onContact, onReject, onViewProfile, onRequestAccept }: {
  job: Job;
  applications: JobApplication[];
  onBack: () => void;
  onContact: (application: JobApplication) => void;
  onReject: (application: JobApplication) => void;
  onViewProfile: (application: JobApplication) => void;
  onRequestAccept: (application: JobApplication) => void;
}) {
  const [filter, setFilter] = useState<ApplicantFilter>("Semua");
  const summary = getApplicantSummary(applications, job.workerQuota);
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

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e1e8e4] p-4"><p className="text-[10px] font-bold text-[#718078]">Dibutuhkan</p><p className="mt-1 text-xl font-extrabold text-[#10231d]">{job.workerQuota}</p><p className="text-[9px] text-[#718078]">pekerja</p></div>
          <div className="rounded-2xl border border-[#e1e8e4] p-4"><p className="text-[10px] font-bold text-[#718078]">Total Pelamar</p><p className="mt-1 text-xl font-extrabold text-[#10231d]">{summary.total}</p><p className="text-[9px] text-[#718078]">pelamar</p></div>
          <div className="rounded-2xl border border-[#e1e8e4] p-4"><p className="text-[10px] font-bold text-[#718078]">Sudah Diterima</p><p className="mt-1 text-xl font-extrabold text-[#10231d]">{summary.accepted} dari {job.workerQuota}</p><p className="text-[9px] text-[#718078]">pekerja</p></div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-4 text-[10px] font-extrabold text-[#315b4c]"><span>{summary.accepted} dari {job.workerQuota} posisi telah terisi</span><span>{summary.progress}%</span></div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e8edea]"><div className="h-full rounded-full bg-[#16864c] transition-[width]" style={{ width: `${summary.progress}%` }} /></div>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#f6faf7] px-3 py-2.5 text-[10px] font-semibold leading-5 text-[#547065]"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#16864c]" /> Menghubungi melalui WhatsApp tidak mengubah status lamaran. Status hanya berubah melalui tindakan rekrutmen di Pull.</p>
      </section>

      <div className="mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-[#dfe7e2] bg-white p-1.5">
        {APPLICANT_FILTERS.map((item) => {
          const count = item === "Semua" ? applications.length : applications.filter((application) => application.status === item).length;
          return <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-10 shrink-0 rounded-xl px-4 text-[10px] font-extrabold transition ${filter === item ? "bg-[#08783f] text-white" : "text-[#4d665b] hover:bg-[#f0f6f2]"}`}>{item} ({count})</button>;
        })}
      </div>

      <div className="mt-4 space-y-3">
        {visibleApplications.map((application) => (
          <ApplicantCard key={application.id} application={application} onContact={onContact} onReject={onReject} onViewProfile={onViewProfile} onRequestAccept={onRequestAccept} />
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
  const [activeTab, setActiveTab] = useState<ActiveTab>("Semua");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
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

  const counts = useMemo(() => Object.fromEntries(TABS.map((tab) => [tab, tab === "Semua" ? jobs.length : jobs.filter((job) => job.status === tab).length])) as Record<ActiveTab, number>, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("id-ID");
    return jobs
      .filter((job) => activeTab === "Semua" || job.status === activeTab)
      .filter((job) => !query || `${job.title} ${job.category} ${job.district}`.toLocaleLowerCase("id-ID").includes(query))
      .filter((job) => categoryFilter === "Semua kategori" || job.category === categoryFilter)
      .filter((job) => districtFilter === "Semua kecamatan" || job.district === districtFilter)
      .filter((job) => !dateFilter || job.startDate === dateFilter)
      .sort((first, second) => {
        const comparison = first.title.localeCompare(second.title, "id-ID");
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [activeTab, categoryFilter, dateFilter, districtFilter, jobs, searchQuery, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / rowsPerPage));
  const safePage = Math.min(currentPage, pageCount);
  const firstIndex = (safePage - 1) * rowsPerPage;
  const visibleJobs = filteredJobs.slice(firstIndex, firstIndex + rowsPerPage);
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;
  const editingJob = jobs.find((job) => job.id === editingJobId) ?? null;
  const selectedApplications = selectedJob ? applicationsByJob[selectedJob.id] ?? [] : [];
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
    if (!exists) setApplicationsByJob((current) => ({ ...current, [nextJob.id]: [] }));
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

  function renderJobActions(job: Job, mobile = false, dropdownUp = false) {
    return (
      <div className={`relative flex items-center ${mobile ? "w-full gap-2" : "gap-1.5"}`}>
        <button type="button" onClick={() => { setSelectedJobId(job.id); setOpenMenuId(null); }} className={`flex items-center justify-center whitespace-nowrap rounded-lg border border-[#cfd8d3] font-extrabold text-[#26372f] transition hover:bg-[#f5f8f6] ${mobile ? "h-10 flex-1 gap-2 px-3 text-[11px]" : "h-9 gap-1.5 px-2 text-[9px] xl:px-2.5 xl:text-[10px]"}`}>
          <UsersRound className="h-3.5 w-3.5" /> <span className={mobile ? "" : "hidden xl:inline"}>Lihat</span> Pelamar
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
        {selectedJob ? (
          <ApplicantsView
            job={selectedJob}
            applications={selectedApplications}
            onBack={() => setSelectedJobId(null)}
            onContact={contactApplicant}
            onReject={rejectApplicant}
            onViewProfile={(application) => setToast(`Detail profil ${application.applicant.name} akan tersedia pada Batch 2.`)}
            onRequestAccept={(application) => setToast(`Konfirmasi penerimaan ${application.applicant.name} akan tersedia pada Batch 2.`)}
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

              <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="overflow-x-auto rounded-[15px] border border-[#dfe5e1] bg-white p-1">
                  <div className="flex min-w-max">
                    {TABS.map((tab) => <button key={tab} type="button" onClick={() => { setActiveTab(tab); setCurrentPage(1); }} className={`min-h-10 rounded-xl px-3 text-[9px] font-extrabold transition ${activeTab === tab ? "bg-[#145c46] text-white shadow-sm" : "text-[#315b4c] hover:bg-[#eef5f1]"}`}>{tab} ({counts[tab]})</button>)}
                  </div>
                </div>
                <button type="button" onClick={() => openPostModal()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-6 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(8,120,63,.16)] transition hover:bg-[#066b36]"><Plus className="h-4 w-4" /> Posting Lowongan</button>
              </div>
            </section>

            <p className="mt-5 text-[11px] font-bold text-[#507f63]">Menampilkan <strong className="text-[#17392c]">{filteredJobs.length}</strong> lowongan di Solo Raya</p>

            <div className="mt-4">
              {filteredJobs.length ? (
                <section className="overflow-visible rounded-2xl border border-[#dfe5e1] bg-white shadow-[0_8px_28px_rgba(18,59,48,.025)]">
                  <div className="space-y-3 p-3 md:hidden">
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

                  <div className="hidden md:block">
                    <table className="w-full table-fixed border-collapse text-left">
                      <colgroup><col className="w-[22%]" /><col className="w-[11%]" /><col className="w-[7%]" /><col className="w-[14%]" /><col className="w-[11%]" /><col className="w-[9%]" /><col className="w-[13%]" /><col className="w-[13%]" /></colgroup>
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
                          <td className="px-2 py-3.5">{renderJobActions(job, false, index >= visibleJobs.length - 2)}</td>
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
      {toast ? <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-[110] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0c261c] px-4 py-3 text-xs font-bold text-white shadow-[0_16px_45px_rgba(7,29,21,.28)]"><ShieldCheck className="h-4 w-4 shrink-0" />{toast}</div> : null}
    </>
  );
}
