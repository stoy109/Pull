"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Marks one of the caller's own notifications as read.
 * `mark_notification_read` is scoped to `auth.uid()`, so a forged id belonging
 * to another account simply affects zero rows.
 */
export async function markUmkmNotificationReadAction(formData: FormData) {
  await requireRole("umkm");

  const notificationId = field(formData, "notificationId");
  if (!UUID_PATTERN.test(notificationId)) {
    redirect("/dashboard/notifications?result=validation");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_notification_read", {
    target_notification_id: notificationId,
  });

  redirect(`/dashboard/notifications?result=${error ? "save" : "saved"}`);
}
