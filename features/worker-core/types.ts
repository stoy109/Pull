export type WorkerPage =
  | "dashboard"
  | "jobs"
  | "applications"
  | "profile"
  | "trust"
  | "notifications"
  | "help"
  | "settings";

export type WorkerFilters = {
  query: string;
  category: string;
  district: string;
  minWage?: number;
  view: "list" | "map";
};

export type WorkerProfile = {
  displayName: string | null;
  email: string | null;
  headline: string | null;
  deliveryArea: string | null;
  district: string | null;
  phone: string | null;
  skills: string[];
  verificationLevel: number;
  kycStatus: string;
  trustScore: number;
  ratingCount: number;
  whatsappVerified: boolean;
};

export type WorkerJob = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  district: string | null;
  wageAmount: number | null;
  wageUnit: string | null;
  durationDays: number | null;
  startDate: string | null;
  endDate: string | null;
  hoursPerDay: number | null;
  quota: number;
  requirements: string | null;
  createdAt: string;
  ownerName: string | null;
  ownerVerified: boolean;
  latitude: number | null;
  longitude: number | null;
  matchScore: number;
  matchReasons: string[];
};

export type WorkerPreferences = {
  availability: "available" | "limited" | "unavailable";
  preferredCategories: string[];
  minimumWage: number | null;
  radiusKm: 3 | 5 | 10 | 20 | 50;
};

export type WorkerApplication = {
  id: string;
  jobId: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  ownerConfirmedAt: string | null;
  workerConfirmedAt: string | null;
  completedAt: string | null;
  job: WorkerJob | null;
};

export type WorkerRating = {
  id: string;
  applicationId: string | null;
  score: number;
  review: string | null;
  createdAt: string;
};

export type WorkerPoint = {
  id: string;
  points: number;
  reason: string;
  applicationId: string | null;
  createdAt: string;
};

export type WorkerNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type WorkerKycSubmission = {
  id: string;
  documentType: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
};

export type WorkerCertificate = {
  id: string;
  applicationId: string;
  name: string;
  issuer: string;
  issuedAt: string;
  credentialUrl: string | null;
};

export type WorkerPortfolioItem = {
  id: string;
  applicationId: string;
  title: string;
  description: string | null;
  mediaUrls: string[];
  createdAt: string;
};

export type WorkerWorkspace = {
  applications: WorkerApplication[];
  certificates: WorkerCertificate[];
  jobs: WorkerJob[];
  kycSubmissions: WorkerKycSubmission[];
  loadIssue: string | null;
  notifications: WorkerNotification[];
  points: WorkerPoint[];
  portfolio: WorkerPortfolioItem[];
  preferences: WorkerPreferences;
  profile: WorkerProfile | null;
  ratingsGiven: WorkerRating[];
  ratingsReceived: WorkerRating[];
  setupIssue: boolean;
};
