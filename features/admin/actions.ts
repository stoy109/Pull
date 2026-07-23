"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

export type UserStatusActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type ImpactActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function setUserStatusAction(
  _state: UserStatusActionState,
  formData: FormData,
): Promise<UserStatusActionState> {
  await requireRole(["admin"]);

  const userId = formData.get("userId");
  const requestedStatus = formData.get("status");

  if (typeof userId !== "string" || !UUID_PATTERN.test(userId)) {
    return { status: "error", message: "ID pengguna tidak valid." };
  }

  if (requestedStatus !== "active" && requestedStatus !== "suspended") {
    return { status: "error", message: "Status akun tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_account_status", {
    target_user_id: userId,
    requested_status: requestedStatus,
  });

  if (error) {
    return {
      status: "error",
      message: error.message.includes("own account")
        ? "Administrator tidak dapat mengubah status akunnya sendiri."
        : "Status pengguna belum dapat diperbarui.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/activity");

  return {
    status: "success",
    message: requestedStatus === "suspended"
      ? "Akun berhasil ditangguhkan."
      : "Akun berhasil diaktifkan kembali.",
  };
}

export async function recordImpactAction(
  _state: ImpactActionState,
  formData: FormData,
): Promise<ImpactActionState> {
  await requireRole(["admin"]);

  const itemType = formData.get("itemType");
  const itemId = formData.get("itemId");
  const actionType = formData.get("actionType");
  const note = formData.get("note");

  if (
    itemType !== "job_posting" &&
    itemType !== "job_application" &&
    itemType !== "supplier_offer"
  ) {
    return { status: "error", message: "Jenis item tidak valid." };
  }

  if (typeof itemId !== "string" || !UUID_PATTERN.test(itemId)) {
    return { status: "error", message: "ID item tidak valid." };
  }

  if (actionType !== "followed_up" && actionType !== "dismissed") {
    return { status: "error", message: "Aksi tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_impact_action", {
    target_item_type: itemType,
    target_item_id: itemId,
    requested_action: actionType,
    action_note: typeof note === "string" ? note.trim().slice(0, 300) || null : null,
  });

  if (error) {
    return { status: "error", message: "Tindakan belum dapat dicatat." };
  }

  revalidatePath("/admin/impact");

  return {
    status: "success",
    message: actionType === "followed_up"
      ? "Ditandai sudah ditindaklanjuti."
      : "Rekomendasi diabaikan.",
  };
}
