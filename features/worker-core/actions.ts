"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KYC_BUCKET = "kyc-documents";
const MAX_KYC_FILE_BYTES = 850_000;
const KYC_FILE_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};
const KYC_DOCUMENT_TYPES = new Set(["KTP", "SIM", "PASPOR"]);
const SETUP_ERROR_CODES = new Set(["42P01", "42703", "42883", "PGRST202", "PGRST204"]);

type ActionError = { code?: string; message?: string };

function textField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function isSetupError(error: ActionError) {
  return (
    SETUP_ERROR_CODES.has(error.code ?? "") ||
    /schema cache|does not exist|could not find the function/i.test(error.message ?? "")
  );
}

function refreshWorker() {
  revalidatePath("/worker");
  revalidatePath("/worker/jobs");
  revalidatePath("/worker/applications");
  revalidatePath("/worker/profile");
  revalidatePath("/worker/trust");
  revalidatePath("/worker/notifications");
}

export async function submitJobApplicationAction(formData: FormData) {
  await requireRole(["pekerja"]);
  const jobId = textField(formData, "jobId");
  const message = textField(formData, "message");

  if (!validUuid(jobId) || message.length < 5 || message.length > 300) {
    redirect("/worker/jobs?notice=application-validation");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_job_application", {
    target_job_id: jobId,
    application_message: message,
  });

  if (error) {
    if (isSetupError(error)) redirect("/worker/jobs?notice=setup");
    redirect(`/worker/jobs?notice=${error.code === "23505" ? "application-duplicate" : "application-save"}`);
  }

  refreshWorker();
  revalidatePath("/dashboard/jobs");
  revalidatePath("/admin");
  redirect("/worker/applications?notice=application-sent");
}

export async function withdrawApplicationAction(formData: FormData) {
  await requireRole(["pekerja"]);
  const applicationId = textField(formData, "applicationId");
  if (!validUuid(applicationId)) redirect("/worker/applications?notice=invalid");

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_application_status", {
    target_application_id: applicationId,
    requested_status: "withdrawn",
  });

  if (error) {
    redirect(`/worker/applications?notice=${isSetupError(error) ? "setup" : "withdraw-failed"}`);
  }

  refreshWorker();
  redirect("/worker/applications?notice=withdrawn");
}

export async function confirmCompletionAction(formData: FormData) {
  await requireRole(["pekerja"]);
  const applicationId = textField(formData, "applicationId");
  if (!validUuid(applicationId)) redirect("/worker/applications?notice=invalid");

  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_job_completion", {
    target_application_id: applicationId,
  });

  if (error) {
    redirect(`/worker/applications?notice=${isSetupError(error) ? "setup" : "completion-failed"}`);
  }

  refreshWorker();
  revalidatePath("/dashboard/jobs");
  redirect("/worker/applications?notice=completion-confirmed");
}

export async function submitRatingAction(formData: FormData) {
  await requireRole(["pekerja"]);
  const applicationId = textField(formData, "applicationId");
  const review = textField(formData, "review");
  const score = Number(textField(formData, "score"));

  if (
    !validUuid(applicationId) ||
    !Number.isInteger(score) ||
    score < 1 ||
    score > 5 ||
    (review.length > 0 && review.length < 3) ||
    review.length > 1000
  ) {
    redirect("/worker/applications?notice=rating-validation");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_transaction_rating", {
    transaction_type: "job_application",
    transaction_id: applicationId,
    rating_score: score,
    rating_review: review || null,
  });

  if (error) {
    redirect(`/worker/applications?notice=${isSetupError(error) ? "setup" : "rating-failed"}`);
  }

  refreshWorker();
  revalidatePath("/dashboard/trust");
  redirect("/worker/applications?notice=rating-sent");
}

export async function markNotificationReadAction(formData: FormData) {
  await requireRole(["pekerja"]);
  const notificationId = textField(formData, "notificationId");
  if (!validUuid(notificationId)) redirect("/worker/notifications?notice=invalid");

  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_notification_read", {
    target_notification_id: notificationId,
  });

  if (error) {
    redirect(`/worker/notifications?notice=${isSetupError(error) ? "setup" : "notification-failed"}`);
  }

  refreshWorker();
  redirect("/worker/notifications?notice=notification-read");
}

export async function submitKycRecordAction(formData: FormData) {
  const { user } = await requireRole(["pekerja"]);
  const documentType = textField(formData, "documentType").toUpperCase();
  const document = formData.get("document");

  if (!KYC_DOCUMENT_TYPES.has(documentType)) {
    redirect("/worker/profile?notice=kyc-validation");
  }
  if (!(document instanceof File) || document.size < 1 || document.size > MAX_KYC_FILE_BYTES) {
    redirect("/worker/profile?notice=kyc-file-size");
  }

  const extension = KYC_FILE_TYPES[document.type];
  if (!extension) redirect("/worker/profile?notice=kyc-file-type");

  const supabase = await createClient();
  const { data: pending, error: pendingError } = await supabase
    .from("kyc_submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("document_type", documentType)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingError) {
    redirect(`/worker/profile?notice=${isSetupError(pendingError) ? "setup" : "kyc-save"}`);
  }
  if (pending) redirect("/worker/profile?notice=kyc-pending");

  const storagePath = `${user.id}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(KYC_BUCKET).upload(storagePath, document, {
    cacheControl: "3600",
    contentType: document.type,
    upsert: false,
  });

  if (uploadError) redirect("/worker/profile?notice=kyc-storage");

  const safeOriginalName = document.name.replace(/[^a-zA-Z0-9._ -]/g, "").slice(0, 120);
  const { error } = await supabase.rpc("submit_kyc_record", {
    kyc_document_type: documentType,
    kyc_storage_path: storagePath,
    kyc_metadata: {
      content_type: document.type,
      original_name: safeOriginalName,
      size: document.size,
    },
  });

  if (error) {
    await supabase.storage.from(KYC_BUCKET).remove([storagePath]);
    const notice = error.code === "23505" ? "kyc-pending" : isSetupError(error) ? "setup" : "kyc-save";
    redirect(`/worker/profile?notice=${notice}`);
  }

  refreshWorker();
  redirect("/worker/profile?notice=kyc-sent");
}
