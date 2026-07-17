"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

const validRoles = new Set(["umkm", "pekerja"]);

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

export async function saveRoleAction(
  _state: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const role = readFormString(formData, "role");

  if (!validRoles.has(role)) {
    return {
      status: "error",
      message: "Pilih peran yang tersedia.",
    };
  }

  const { supabase, user } = await getCurrentUser();

  if (!user) {
    return {
      status: "error",
      message: "Sesi Anda sudah berakhir. Silakan masuk ulang.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      role,
      onboarding_step: "profile",
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  redirect("/onboarding/lengkapi-profil");
}

export async function saveProfileAction(
  _state: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const displayName = readFormString(formData, "displayName");
  const location = readFormString(formData, "location");
  const headline = readFormString(formData, "headline");
  const about = readFormString(formData, "about");

  if (!displayName || !location || !headline) {
    return {
      status: "error",
      message: "Nama tampilan, lokasi, dan ringkasan wajib diisi.",
    };
  }

  const { supabase, user } = await getCurrentUser();

  if (!user) {
    return {
      status: "error",
      message: "Sesi Anda sudah berakhir. Silakan masuk ulang.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      display_name: displayName,
      location,
      headline,
      about,
      onboarding_step: "complete",
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  redirect("/dashboard");
}
