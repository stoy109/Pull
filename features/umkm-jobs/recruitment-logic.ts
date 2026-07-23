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

export type ApplicationTransitionResult = {
  applications: JobApplication[];
  acceptedCount: number;
  changed: boolean;
  reason?: "not-found" | "invalid-status" | "quota-full";
};

export function acceptJobApplication(
  applications: JobApplication[],
  applicationId: string,
  workerQuota: number,
  acceptedAt: string,
): ApplicationTransitionResult {
  const acceptedCount = applications.filter((application) => application.status === "Diterima").length;
  const target = applications.find((application) => application.id === applicationId);

  if (!target) return { applications, acceptedCount, changed: false, reason: "not-found" };
  if (target.status !== "Menunggu Respons") {
    return { applications, acceptedCount, changed: false, reason: "invalid-status" };
  }
  if (acceptedCount >= Math.max(1, workerQuota)) {
    return { applications, acceptedCount, changed: false, reason: "quota-full" };
  }

  return {
    applications: applications.map((application) => application.id === applicationId
      ? { ...application, status: "Diterima", acceptedAt, cancelledAt: undefined }
      : application),
    acceptedCount: acceptedCount + 1,
    changed: true,
  };
}

export function cancelAcceptedJobApplication(
  applications: JobApplication[],
  applicationId: string,
  cancelledAt: string,
): ApplicationTransitionResult {
  const acceptedCount = applications.filter((application) => application.status === "Diterima").length;
  const target = applications.find((application) => application.id === applicationId);

  if (!target) return { applications, acceptedCount, changed: false, reason: "not-found" };
  if (target.status !== "Diterima") {
    return { applications, acceptedCount, changed: false, reason: "invalid-status" };
  }

  return {
    applications: applications.map((application) => application.id === applicationId
      ? { ...application, status: "Dibatalkan", cancelledAt }
      : application),
    acceptedCount: Math.max(0, acceptedCount - 1),
    changed: true,
  };
}

export function canCancelAcceptedApplication(startDate: string, currentDate: string) {
  return Boolean(startDate && currentDate && currentDate < startDate);
}

export function createJobAssignment(jobId: string, application: JobApplication, acceptedAt: string): JobAssignment {
  return {
    id: `${jobId}-assignment-${application.applicant.id}`,
    jobId,
    applicationId: application.id,
    workerId: application.applicant.id,
    acceptedAt,
  };
}

export function cancelJobAssignment(assignment: JobAssignment, cancelledAt: string) {
  if (assignment.cancelledAt) return assignment;
  return { ...assignment, cancelledAt };
}

export function deriveAssignmentStatus(assignment: JobAssignment, job: Job, currentDate: string): AssignmentStatus {
  if (assignment.cancelledAt) return "Dibatalkan";
  if (assignment.employerConfirmedAt && assignment.workerConfirmedAt) return "Selesai";
  if (currentDate < job.startDate) return "Akan Dimulai";
  if (currentDate <= job.endDate) return "Sedang Berlangsung";
  if (assignment.employerConfirmedAt && !assignment.workerConfirmedAt) return "Menunggu Konfirmasi Pekerja";
  return "Perlu Konfirmasi";
}

type ConfirmationResult = {
  assignment: JobAssignment;
  changed: boolean;
  completed: boolean;
  reason?: "too-early" | "already-confirmed" | "cancelled";
};

function completeAssignmentIfReady(assignment: JobAssignment, confirmedAt: string) {
  if (!assignment.employerConfirmedAt || !assignment.workerConfirmedAt) return assignment;
  return {
    ...assignment,
    completedAt: assignment.completedAt ?? confirmedAt,
    certificateIssuedAt: assignment.certificateIssuedAt ?? confirmedAt,
    rewardsProcessedAt: assignment.rewardsProcessedAt ?? confirmedAt,
  };
}

export function confirmAssignmentByEmployer(assignment: JobAssignment, job: Job, confirmedAt: string): ConfirmationResult {
  if (assignment.cancelledAt) return { assignment, changed: false, completed: false, reason: "cancelled" };
  if (confirmedAt <= job.endDate) return { assignment, changed: false, completed: false, reason: "too-early" };
  if (assignment.employerConfirmedAt) {
    return { assignment, changed: false, completed: Boolean(assignment.completedAt), reason: "already-confirmed" };
  }

  const updated = completeAssignmentIfReady({ ...assignment, employerConfirmedAt: confirmedAt }, confirmedAt);
  return { assignment: updated, changed: true, completed: Boolean(updated.completedAt) };
}

export function confirmAssignmentByWorker(assignment: JobAssignment, job: Job, confirmedAt: string): ConfirmationResult {
  if (assignment.cancelledAt) return { assignment, changed: false, completed: false, reason: "cancelled" };
  if (confirmedAt <= job.endDate) return { assignment, changed: false, completed: false, reason: "too-early" };
  if (assignment.workerConfirmedAt) {
    return { assignment, changed: false, completed: Boolean(assignment.completedAt), reason: "already-confirmed" };
  }

  const updated = completeAssignmentIfReady({ ...assignment, workerConfirmedAt: confirmedAt }, confirmedAt);
  return { assignment: updated, changed: true, completed: Boolean(updated.completedAt) };
}

export function deriveJobStatusFromAssignments(job: Job, assignments: JobAssignment[], currentDate: string): JobStatus {
  const activeAssignments = assignments.filter((assignment) => !assignment.cancelledAt);
  const openBaseStatus: JobStatus = job.status === "Draf" || job.status === "Dibatalkan" ? job.status : "Terbuka";
  if (!activeAssignments.length) return deriveOpenJobStatus(openBaseStatus, 0, job.workerQuota);
  if (activeAssignments.every((assignment) => assignment.completedAt)) return "Selesai";
  if (currentDate > job.endDate) return "Perlu Konfirmasi";
  if (currentDate >= job.startDate) return "Sedang Berlangsung";
  if (activeAssignments.length >= job.workerQuota) return "Akan Dimulai";
  return deriveOpenJobStatus(openBaseStatus, activeAssignments.length, job.workerQuota);
}

export type RatingSubmissionResult = {
  ratings: AssignmentRating[];
  rating?: AssignmentRating;
  changed: boolean;
  reason?: "not-completed" | "already-rated" | "invalid-stars";
};

export function submitAssignmentRating(
  ratings: AssignmentRating[],
  assignment: JobAssignment,
  input: { stars: number; tags: string[]; review: string; createdAt: string },
): RatingSubmissionResult {
  if (!assignment.completedAt || !assignment.employerConfirmedAt || !assignment.workerConfirmedAt) {
    return { ratings, changed: false, reason: "not-completed" };
  }
  if (ratings.some((rating) => rating.assignmentId === assignment.id)) {
    return { ratings, changed: false, reason: "already-rated" };
  }
  if (!Number.isInteger(input.stars) || input.stars < 1 || input.stars > 5) {
    return { ratings, changed: false, reason: "invalid-stars" };
  }

  const rating: AssignmentRating = {
    id: `rating-${assignment.id}`,
    assignmentId: assignment.id,
    stars: input.stars,
    tags: [...new Set(input.tags)],
    review: input.review.trim(),
    createdAt: input.createdAt,
  };
  return { ratings: [...ratings, rating], rating, changed: true };
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
  const safeQuota = Math.max(1, workerQuota);
  if (acceptedCount >= safeQuota) return "Kuota Penuh";
  if (acceptedCount > 0 && acceptedCount / safeQuota >= 0.7) return "Hampir Penuh";
  return "Terbuka";
}
