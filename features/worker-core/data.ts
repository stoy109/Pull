import "server-only";

import { requireRole } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";
import { filterWorkerJobs, scoreWorkerJobMatches } from "./filters";
import type {
  WorkerApplication,
  WorkerCertificate,
  WorkerFilters,
  WorkerJob,
  WorkerKycSubmission,
  WorkerNotification,
  WorkerPoint,
  WorkerPortfolioItem,
  WorkerPreferences,
  WorkerRating,
  WorkerWorkspace,
} from "./types";

type QueryError = { code?: string; message?: string } | null;
type OwnerRow = { business_name: string | null; display_name: string | null };
type RawNotification = {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type RawJob = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  district: string | null;
  wage_amount: number | string | null;
  wage_unit: string | null;
  duration_days: number | null;
  start_date: string | null;
  end_date: string | null;
  hours_per_day: number | string | null;
  quota: number;
  requirements: string | null;
  created_at: string;
  owner?: OwnerRow | OwnerRow[] | null;
  owner_name?: string | null;
  owner_verified?: boolean;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type RawApplication = {
  id: string;
  job_id: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner_confirmed_at: string | null;
  worker_confirmed_at: string | null;
  completed_at: string | null;
  job: RawJob | RawJob[] | null;
};

const SETUP_ERROR_CODES = new Set([
  "42P01",
  "42703",
  "42883",
  "PGRST200",
  "PGRST202",
  "PGRST204",
]);
const DEFAULT_PREFERENCES: WorkerPreferences = {
  availability: "available",
  preferredCategories: [],
  minimumWage: null,
  radiusKm: 10,
};
const AVAILABILITY = new Set<WorkerPreferences["availability"]>([
  "available",
  "limited",
  "unavailable",
]);
const RADII = new Set<WorkerPreferences["radiusKm"]>([3, 5, 10, 20, 50]);


function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function numberOrNull(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function ownerName(row: RawJob) {
  if (row.owner_name?.trim()) return row.owner_name.trim();
  const owner = one(row.owner);
  return owner?.business_name?.trim() || owner?.display_name?.trim() || null;
}

function toJob(row: RawJob): WorkerJob {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    district: row.district,
    wageAmount: numberOrNull(row.wage_amount),
    wageUnit: row.wage_unit,
    durationDays: row.duration_days,
    startDate: row.start_date,
    endDate: row.end_date,
    hoursPerDay: numberOrNull(row.hours_per_day),
    quota: row.quota,
    requirements: row.requirements,
    createdAt: row.created_at,
    ownerName: ownerName(row),
    ownerVerified: Boolean(row.owner_verified),
    latitude: numberOrNull(row.latitude),
    longitude: numberOrNull(row.longitude),
    matchScore: 0,
    matchReasons: [],
  };
}

function metadataStrings(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];
}

function isSetupError(error: QueryError) {
  if (!error) return false;
  return (
    SETUP_ERROR_CODES.has(error.code ?? "") ||
    /schema cache|does not exist|could not find the function|relationship/i.test(error.message ?? "")
  );
}

function emptyWorkspace(issue: { setup: boolean; message: string }): WorkerWorkspace {
  return {
    applications: [],
    certificates: [],
    jobs: [],
    kycSubmissions: [],
    loadIssue: issue.message,
    notifications: [],
    points: [],
    portfolio: [],
    preferences: DEFAULT_PREFERENCES,
    profile: null,
    ratingsGiven: [],
    ratingsReceived: [],
    setupIssue: issue.setup,
  };
}

export async function getWorkerWorkspace(filters: WorkerFilters): Promise<WorkerWorkspace> {
  const access = await requireRole(["pekerja"]);
  const supabase = await createClient();

  const jobsQuery = supabase.rpc("get_worker_job_board", {
    district_filter: filters.district || null,
    category_filter: filters.category || null,
    minimum_wage: filters.minWage ?? null,
  });

  const [
    profileResult,
    jobsResult,
    applicationsResult,
    givenRatingsResult,
    receivedRatingsResult,
    pointsResult,
    notificationsResult,
    kycResult,
    certificatesResult,
    portfolioResult,
    preferencesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "email,display_name,headline,delivery_area,phone,district,verification_level,kyc_status,trust_score,rating_count,whatsapp_verified_at",
      )
      .eq("id", access.user.id)
      .maybeSingle(),
    jobsQuery,
    supabase.rpc("get_my_worker_applications"),
    supabase
      .from("ratings")
      .select("id,job_application_id,score,review,created_at")
      .eq("rater_id", access.user.id)
      .not("job_application_id", "is", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("ratings")
      .select("id,job_application_id,score,review,created_at")
      .eq("rated_profile_id", access.user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("points_ledger")
      .select("id,points,reason,job_application_id,created_at")
      .eq("profile_id", access.user.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.rpc("get_my_notifications", {
      notification_limit: 50,
      before_created_at: null,
    }),
    supabase
      .from("kyc_submissions")
      .select("id,document_type,status,rejection_reason,created_at")
      .eq("user_id", access.user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("worker_certificates")
      .select("id,application_id,certificate_name,issuer,issued_at,credential_url")
      .eq("worker_id", access.user.id)
      .order("issued_at", { ascending: false }),
    supabase
      .from("worker_portfolio")
      .select("id,application_id,title,description,media_urls,created_at")
      .eq("worker_id", access.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("worker_preferences")
      .select("availability,preferred_categories,minimum_wage,radius_km")
      .eq("user_id", access.user.id)
      .maybeSingle(),
  ]);

  const errors: QueryError[] = [
    profileResult.error,
    jobsResult.error,
    applicationsResult.error,
    givenRatingsResult.error,
    receivedRatingsResult.error,
    pointsResult.error,
    notificationsResult.error,
    kycResult.error,
    certificatesResult.error,
    portfolioResult.error,
    preferencesResult.error,
  ];
  const firstError = errors.find(Boolean) ?? null;

  if (firstError) {
    const setup = errors.some(isSetupError);
    return emptyWorkspace({
      setup,
      message: setup
        ? "Skema worker belum lengkap. Terapkan migration 202607230009–202607230014 secara berurutan lalu muat ulang halaman."
        : `Data pekerja belum dapat dimuat${firstError.code ? ` (${firstError.code})` : ""}.`,
    });
  }

  const profileRow = profileResult.data;
  if (!profileRow) {
    return emptyWorkspace({ setup: false, message: "Profil pekerja tidak ditemukan untuk akun ini." });
  }

  const rawJobs = (jobsResult.data ?? []) as unknown as RawJob[];
  const rawApplications = (applicationsResult.data ?? []) as unknown as RawApplication[];
  const ratingRows = (rows: typeof givenRatingsResult.data): WorkerRating[] =>
    (rows ?? []).map((row) => ({
      id: row.id,
      applicationId: row.job_application_id,
      score: row.score,
      review: row.review,
      createdAt: row.created_at,
    }));

  const applications: WorkerApplication[] = rawApplications.map((row) => {
    const job = one(row.job);
    return {
      id: row.id,
      jobId: row.job_id,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ownerConfirmedAt: row.owner_confirmed_at,
      workerConfirmedAt: row.worker_confirmed_at,
      completedAt: row.completed_at,
      job: job ? toJob(job) : null,
    };
  });

  const points: WorkerPoint[] = (pointsResult.data ?? []).map((row) => ({
    id: row.id,
    points: row.points,
    reason: row.reason,
    applicationId: row.job_application_id,
    createdAt: row.created_at,
  }));
  const notificationRows = (notificationsResult.data ?? []) as RawNotification[];
  const notifications: WorkerNotification[] = notificationRows.map((row: RawNotification) => ({
    id: row.id,
    type: row.notification_type,
    title: row.title,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
  }));
  const kycSubmissions: WorkerKycSubmission[] = (kycResult.data ?? []).map((row) => ({
    id: row.id,
    documentType: row.document_type,
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
  }));
  const certificates: WorkerCertificate[] = (certificatesResult.data ?? []).map((row) => ({
    id: row.id,
    applicationId: row.application_id,
    name: row.certificate_name,
    issuer: row.issuer,
    issuedAt: row.issued_at,
    credentialUrl: row.credential_url,
  }));
  const portfolio: WorkerPortfolioItem[] = (portfolioResult.data ?? []).map((row) => ({
    id: row.id,
    applicationId: row.application_id,
    title: row.title,
    description: row.description,
    mediaUrls: Array.isArray(row.media_urls)
      ? row.media_urls.filter((item): item is string => typeof item === "string")
      : [],
    createdAt: row.created_at,
  }));
  const metadata = access.user.user_metadata ?? {};
  const profile = {
    displayName: profileRow.display_name,
    email: profileRow.email ?? access.user.email ?? null,
    headline: profileRow.headline,
    deliveryArea: profileRow.delivery_area,
    district: profileRow.district,
    phone: profileRow.phone,
    skills: metadataStrings(metadata, "skills"),
    verificationLevel: profileRow.verification_level,
    kycStatus: profileRow.kyc_status,
    trustScore: Number(profileRow.trust_score) || 0,
    ratingCount: profileRow.rating_count,
    whatsappVerified: Boolean(profileRow.whatsapp_verified_at),
  };
  const rawPreferences = preferencesResult.data as {
    availability?: string;
    preferred_categories?: unknown;
    minimum_wage?: number | string | null;
    radius_km?: number;
  } | null;
  const availability = rawPreferences?.availability as WorkerPreferences["availability"] | undefined;
  const radius = Number(rawPreferences?.radius_km) as WorkerPreferences["radiusKm"];
  const preferences: WorkerPreferences = {
    availability: availability && AVAILABILITY.has(availability) ? availability : DEFAULT_PREFERENCES.availability,
    preferredCategories: Array.isArray(rawPreferences?.preferred_categories)
      ? rawPreferences.preferred_categories
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 10)
      : [],
    minimumWage: numberOrNull(rawPreferences?.minimum_wage),
    radiusKm: RADII.has(radius) ? radius : DEFAULT_PREFERENCES.radiusKm,
  };
  const rankedJobs = scoreWorkerJobMatches(rawJobs.map(toJob), preferences, profile);

  return {
    applications,
    certificates,
    jobs: filterWorkerJobs(rankedJobs, filters.query),
    kycSubmissions,
    loadIssue: null,
    notifications,
    points,
    portfolio,
    preferences,
    profile,
    ratingsGiven: ratingRows(givenRatingsResult.data),
    ratingsReceived: ratingRows(receivedRatingsResult.data),
    setupIssue: false,
  };
}
