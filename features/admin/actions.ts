"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/access";
import { isMvpAuthEnabled } from "@/lib/auth/mvp-session";
import { createClient } from "@/lib/supabase/server";

export type UserStatusActionState = {
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

  if (isMvpAuthEnabled()) {
    return {
      status: "success",
      message: requestedStatus === "suspended"
        ? "Simulasi MVP: akun ditangguhkan."
        : "Simulasi MVP: akun diaktifkan.",
    };
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
