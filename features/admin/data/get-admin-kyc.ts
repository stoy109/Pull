import "server-only";

import { parseAppRole, type AppRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type KycQueueStatus = "pending" | "approved" | "rejected" | "all";

export type AdminKycFilters = {
  status: KycQueueStatus;
  page: number;
};

export type AdminKycSubmission = {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  businessName: string | null;
  role: AppRole | null;
  profileKycStatus: "not_submitted" | "pending" | "verified" | "rejected";
  verificationLevel: number;
  documentType: string;
  storagePath: string | null;
  documentUrl: string | null;
  metadata: {
    fileName: string | null;
    mimeType: string | null;
    fileSize: number | null;
  };
  status: Exclude<KycQueueStatus, "all">;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
};

export type AdminKycData = {
  total: number;
  pendingCount: number;
  page: number;
  pageSize: number;
  submissions: AdminKycSubmission[];
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function asCount(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function readFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeAdminKycFilters(input: {
  status?: string | string[];
  page?: string | string[];
}): AdminKycFilters {
  const requestedStatus = readFirst(input.status);
  const parsedPage = Number.parseInt(readFirst(input.page) ?? "1", 10);

  return {
    status: requestedStatus === "approved" || requestedStatus === "rejected" || requestedStatus === "all"
      ? requestedStatus
      : "pending",
    page: Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), 999) : 1,
  };
}

export async function getAdminKyc(filters: AdminKycFilters): Promise<AdminKycData> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_kyc_queue", {
    status_filter: filters.status === "all" ? null : filters.status,
    page_number: filters.page,
  });

  if (error) {
    console.error("Unable to load administrator KYC queue", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Antrean KYC belum dapat dimuat.");
  }

  const root = asRecord(data);
  const submissions = Array.isArray(root.submissions) ? root.submissions : [];

  const parsedSubmissions: AdminKycSubmission[] = submissions.map((value) => {
    const submission = asRecord(value);
    const metadata = asRecord(submission.metadata);
    const profileStatus = submission.profile_kyc_status;
    const status = submission.status;
    const fileSize = Number(metadata.file_size);

    return {
      id: asString(submission.id),
      userId: asString(submission.user_id),
      email: asString(submission.email, "Email tidak tersedia"),
      displayName: asNullableString(submission.display_name),
      businessName: asNullableString(submission.business_name),
      role: parseAppRole(submission.role),
      profileKycStatus: profileStatus === "pending" || profileStatus === "verified" || profileStatus === "rejected"
        ? profileStatus
        : "not_submitted",
      verificationLevel: Math.min(asCount(submission.verification_level), 2),
      documentType: asString(submission.document_type, "Dokumen KYC"),
      storagePath: asNullableString(submission.storage_path),
      documentUrl: null,
      metadata: {
        fileName: asNullableString(metadata.file_name),
        mimeType: asNullableString(metadata.mime_type),
        fileSize: Number.isFinite(fileSize) && fileSize >= 0 ? fileSize : null,
      },
      status: status === "approved" || status === "rejected" ? status : "pending",
      reviewedBy: asNullableString(submission.reviewed_by),
      reviewedAt: asNullableString(submission.reviewed_at),
      reviewNote: asNullableString(submission.review_note),
      rejectionReason: asNullableString(submission.rejection_reason),
      createdAt: asString(submission.created_at, new Date(0).toISOString()),
    };
  });
  const signedSubmissions = await Promise.all(parsedSubmissions.map(async (submission) => {
    if (!submission.storagePath) return submission;
    const { data: signed } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(submission.storagePath, 300);
    return { ...submission, documentUrl: signed?.signedUrl ?? null };
  }));

  return {
    total: asCount(root.total),
    pendingCount: asCount(root.pending_count),
    page: Math.max(asCount(root.page), 1),
    pageSize: Math.max(asCount(root.page_size), 1),
    submissions: signedSubmissions,
  };
}
