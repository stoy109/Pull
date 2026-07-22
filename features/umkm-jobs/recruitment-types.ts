export const JOB_STATUSES = [
  "Draf",
  "Terbuka",
  "Hampir Penuh",
  "Kuota Penuh",
  "Akan Dimulai",
  "Sedang Berlangsung",
  "Perlu Konfirmasi",
  "Selesai",
  "Dibatalkan",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STATUSES = ["Menunggu Respons", "Diterima", "Ditolak"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type SubmissionIntent = "draft" | "publish";
export type JobTone = "violet" | "orange" | "green";

export type Job = {
  id: string;
  title: string;
  category: string;
  district: string;
  wage: number;
  duration: number;
  startDate: string;
  endDate: string;
  workHours: string;
  status: JobStatus;
  acceptedCount: number;
  workerQuota: number;
  applicantCount: number;
  description: string;
  requirements: string;
  whatsappContact: string;
  tone: JobTone;
};

export type Applicant = {
  id: string;
  name: string;
  initials: string;
  trustScore: number;
  trustLabel: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  location: string;
  skills: string[];
  phone: string;
  tone: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  applicant: Applicant;
  appliedAt: string;
  status: ApplicationStatus;
};

export type JobFormValues = {
  title: string;
  category: string;
  district: string;
  wage: string;
  duration: string;
  startDate: string;
  endDate: string;
  workerQuota: string;
  workHours: string;
  description: string;
  requirements: string;
  whatsappContact: string;
};

export type JobFormErrors = Partial<Record<keyof JobFormValues, string>>;
