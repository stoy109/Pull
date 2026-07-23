"use server";

import { redirect } from "next/navigation";
import { parseOnboardingRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type OnboardingActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readFormStrings(formData: FormData, key: string) {
  const values = formData.getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().slice(0, 60))
    .filter(Boolean);
  return [...new Map(values.map((value) => [value.toLowerCase(), value])).values()].slice(0, 10);
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
  const role = parseOnboardingRole(readFormString(formData, "role"));

  if (!role) {
    return {
      status: "error",
      message: "Pilih peran yang tersedia.",
    };
  }

  const { supabase, user } = await getCurrentUser();

  if (!user) {
    redirect(`/onboarding/lengkapi-profil?role=${role}`);
  }

  const { error: roleError } = await supabase.rpc("set_own_role", {
    requested_role: role,
  });

  if (roleError) {
    return {
      status: "error",
      message:
        "Role belum dapat disimpan. Pastikan migration RBAC sudah diterapkan, lalu coba lagi.",
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
  const businessName = readFormString(formData, "businessName");
  const headline = readFormString(formData, "headline");
  const deliveryArea = readFormString(formData, "deliveryArea");
  const phone = readFormString(formData, "phone");
  const skills = readFormStrings(formData, "skills");
  const formRole = readFormString(formData, "role");
  const role = parseOnboardingRole(formRole) ?? "umkm";
  const profileName = role === "pekerja" ? displayName : businessName;

  if (role === "pekerja" && (!displayName || !headline || !phone || !skills.length)) {
    return {
      status: "error",
      message: "Nama, bidang kerja, keahlian, dan nomor WhatsApp wajib diisi.",
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
      ...(role === "pekerja" ? { skills } : {}),
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
