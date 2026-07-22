import type {
  ApplicationStatus,
  JobApplication,
  JobFormErrors,
  JobFormValues,
  JobStatus,
  SubmissionIntent,
} from "./recruitment-types";

const REQUIRED_PUBLISH_FIELDS: Array<keyof JobFormValues> = [
  "title",
  "category",
  "district",
  "wage",
  "duration",
  "startDate",
  "endDate",
  "workerQuota",
  "workHours",
  "description",
  "requirements",
  "whatsappContact",
];

const FIELD_LABELS: Record<keyof JobFormValues, string> = {
  title: "Judul pekerjaan",
  category: "Kategori pekerjaan",
  district: "Lokasi pekerjaan",
  wage: "Upah per hari",
  duration: "Durasi pekerjaan",
  startDate: "Tanggal mulai",
  endDate: "Tanggal selesai",
  workerQuota: "Jumlah pekerja",
  workHours: "Jam kerja",
  description: "Deskripsi pekerjaan",
  requirements: "Persyaratan atau keahlian",
  whatsappContact: "Nomor WhatsApp",
};

export function validateJobForm(values: JobFormValues, intent: SubmissionIntent) {
  const errors: JobFormErrors = {};
  const fields = intent === "draft" ? (["title"] as Array<keyof JobFormValues>) : REQUIRED_PUBLISH_FIELDS;

  for (const field of fields) {
    if (!values[field].trim()) errors[field] = `${FIELD_LABELS[field]} wajib diisi.`;
  }

  const wage = Number(values.wage);
  if (values.wage && (!Number.isFinite(wage) || wage < 10000)) {
    errors.wage = "Upah minimal Rp10.000 per hari.";
  }

  const duration = Number(values.duration);
  if (values.duration && (!Number.isInteger(duration) || duration < 1 || duration > 30)) {
    errors.duration = "Durasi harus antara 1–30 hari.";
  }

  const workerQuota = Number(values.workerQuota);
  if (values.workerQuota && (!Number.isInteger(workerQuota) || workerQuota < 1 || workerQuota > 50)) {
    errors.workerQuota = "Jumlah pekerja harus antara 1–50 orang.";
  }

  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    errors.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
  }

  if (values.whatsappContact) {
    const digits = values.whatsappContact.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      errors.whatsappContact = "Masukkan nomor WhatsApp aktif 10–15 digit.";
    }
  }

  if (values.description.length > 300) errors.description = "Deskripsi maksimal 300 karakter.";
  if (values.requirements.length > 240) errors.requirements = "Persyaratan maksimal 240 karakter.";

  return errors;
}

export function normalizeWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return `62${digits}`;
}

export function buildApplicantWhatsAppUrl({
  phone,
  applicantName,
  ownerName,
  businessName,
  jobTitle,
}: {
  phone: string;
  applicantName: string;
  ownerName: string;
  businessName: string;
  jobTitle: string;
}) {
  const message = `Halo ${applicantName}, saya ${ownerName} dari ${businessName}. Saya ingin membahas lamaran Anda untuk pekerjaan ${jobTitle} di Pull.`;
  return `https://wa.me/${normalizeWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
}

export function updateApplicationStatus(
  applications: JobApplication[],
  applicationId: string,
  status: ApplicationStatus,
) {
  return applications.map((application) =>
    application.id === applicationId ? { ...application, status } : application,
  );
}

export function getApplicantSummary(applications: JobApplication[], workerQuota: number) {
  const accepted = applications.filter((application) => application.status === "Diterima").length;
  const safeQuota = Math.max(1, workerQuota);
  return {
    total: applications.length,
    accepted,
    remaining: Math.max(0, safeQuota - accepted),
    progress: Math.min(100, Math.round((accepted / safeQuota) * 100)),
  };
}

export function deriveOpenJobStatus(currentStatus: JobStatus, acceptedCount: number, workerQuota: number): JobStatus {
  if (!["Terbuka", "Hampir Penuh", "Kuota Penuh"].includes(currentStatus)) return currentStatus;
  if (acceptedCount >= workerQuota) return "Kuota Penuh";
  if (acceptedCount > 0 && acceptedCount / workerQuota >= 0.7) return "Hampir Penuh";
  return "Terbuka";
}
