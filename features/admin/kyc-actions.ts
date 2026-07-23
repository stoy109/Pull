"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function returnUrl(formData: FormData, result: "approved" | "rejected" | "invalid" | "stale" | "error") {
  const rawStatus = formData.get("returnStatus");
  const status = rawStatus === "approved" || rawStatus === "rejected" || rawStatus === "all"
    ? rawStatus
    : "pending";
  const rawPage = formData.get("returnPage");
  const parsedPage = typeof rawPage === "string" ? Number.parseInt(rawPage, 10) : 1;
  const page = Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), 999) : 1;
  const params = new URLSearchParams({ result });
  if (status !== "pending") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  return `/admin/kyc?${params.toString()}`;
}

export async function reviewKycAction(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const submissionId = formData.get("submissionId");
  const decision = formData.get("decision");
  const noteValue = formData.get("note");
  const note = typeof noteValue === "string" ? noteValue.trim().slice(0, 500) : "";

  if (
    typeof submissionId !== "string" ||
    !UUID_PATTERN.test(submissionId) ||
    (decision !== "approve" && decision !== "reject") ||
    (decision === "reject" && !note)
  ) {
    redirect(returnUrl(formData, "invalid"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_kyc_submission", {
    submission_id: submissionId,
    approved: decision === "approve",
    review_note: note || null,
  });

  if (error) {
    console.error("Unable to review KYC submission", {
      code: error.code,
      message: error.message,
      submissionId,
    });
    redirect(returnUrl(
      formData,
      error.message.includes("pending KYC submissions") ? "stale" : "error",
    ));
  }

  revalidatePath("/admin/kyc");
  revalidatePath("/admin/metrics");
  revalidatePath("/admin/activity");
  redirect(returnUrl(formData, decision === "approve" ? "approved" : "rejected"));
}
