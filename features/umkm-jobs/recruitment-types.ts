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

export const APPLICATION_STATUSES = ["Menunggu Respons", "Diterima", "Ditolak", "Dibatalkan"] as const;
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
  bio: string;
  joinedAt: string;
  completionRate: number;
  cancellationRate: number;
  languages: string[];
  workHistory: ApplicantWorkHistory[];
  reviews: ApplicantReview[];
  certificates: ApplicantCertificate[];
  portfolio: ApplicantPortfolio[];
};

export type ApplicantWorkHistory = {
  id: string;
  title: string;
  businessName: string;
  completedAt: string;
  rating: number;
};

export type ApplicantReview = {
  id: string;
  businessName: string;
  comment: string;
  rating: number;
  createdAt: string;
};

export type ApplicantCertificate = {
  id: string;
  title: string;
  issuedAt: string;
};

export type ApplicantPortfolio = {
  id: string;
  title: string;
  category: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  applicant: Applicant;
  appliedAt: string;
  status: ApplicationStatus;
  acceptedAt?: string;
  cancelledAt?: string;
};

export const ASSIGNMENT_STATUSES = [
  "Akan Dimulai",
  "Sedang Berlangsung",
  "Perlu Konfirmasi",
  "Menunggu Konfirmasi Pekerja",
  "Selesai",
  "Dibatalkan",
] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export type JobAssignment = {
  id: string;
  jobId: string;
  applicationId: string;
  workerId: string;
  acceptedAt: string;
  employerConfirmedAt?: string;
  workerConfirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  certificateIssuedAt?: string;
  rewardsProcessedAt?: string;
};

export type AssignmentRating = {
  id: string;
  assignmentId: string;
  stars: number;
  tags: string[];
  review: string;
  createdAt: string;
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
