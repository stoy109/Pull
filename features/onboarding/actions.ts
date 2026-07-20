"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

const validRoles = new Set(["umkm", "pekerja", "supplier"]);

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function createProfileSuccessPath({
  role,
  displayName,
  businessName,
  headline,
  deliveryArea,
  phone,
}: {
  role: string;
  displayName: string;
  businessName: string;
  headline: string;
  deliveryArea: string;
  phone: string;
}) {
  const params = new URLSearchParams({
    role,
    displayName,
    businessName,
    headline,
    deliveryArea,
    phone,
  });

  return `/onboarding/berhasil?${params.toString()}`;
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
    redirect(`/onboarding/lengkapi-profil?role=${role}`);
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
  const businessName = readFormString(formData, "businessName");
  const headline = readFormString(formData, "headline");
  const deliveryArea = readFormString(formData, "deliveryArea");
  const phone = readFormString(formData, "phone");
  const formRole = readFormString(formData, "role");
  const role = validRoles.has(formRole) ? formRole : "umkm";
  const profileName = role === "pekerja" ? displayName : businessName;

  if (role === "pekerja" && (!displayName || !headline || !phone)) {
    return {
      status: "error",
      message: "Nama lengkap, bidang keahlian, dan nomor WhatsApp wajib diisi.",
    };
  }

  if (role === "supplier" && (!displayName || !businessName || !headline || !deliveryArea || !phone)) {
    return {
      status: "error",
      message:
        "Nama penanggung jawab, nama perusahaan, kategori produk, area pengiriman, dan nomor telepon wajib diisi.",
    };
  }

  if (role === "umkm" && (!displayName || !businessName || !headline || !phone)) {
    return {
      status: "error",
      message: "Nama lengkap, nama usaha, kategori, dan nomor WhatsApp wajib diisi.",
    };
  }

  const { supabase, user } = await getCurrentUser();

  if (!user) {
    redirect(
      createProfileSuccessPath({
        role,
        displayName,
        businessName: profileName,
        headline,
        deliveryArea,
        phone,
      }),
    );
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      display_name: displayName,
      business_name: profileName,
      headline,
      delivery_area: deliveryArea,
      phone,
      role,
      onboarding_step: "complete",
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  redirect(
    createProfileSuccessPath({
      role,
      displayName,
      businessName: profileName,
      headline,
      deliveryArea,
      phone,
    }),
  );
}
