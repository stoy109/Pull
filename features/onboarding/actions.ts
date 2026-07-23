"use server";

import { redirect } from "next/navigation";
import { logActivity } from "@/lib/activity/log-activity";
import { dashboardPathForRole, parseOnboardingRole, type OnboardingRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type OnboardingActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

type ProfileDraft = {
  role: OnboardingRole;
  displayName: string;
  businessName: string;
  headline: string;
  deliveryArea: string;
  phone: string;
  skills: string[];
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

function readMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : "";
}

function readMetadataStrings(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, 10)
    : [];
}

function profileError(profile: ProfileDraft) {
  if (profile.role === "pekerja" && (!profile.displayName || !profile.headline || !profile.phone || !profile.skills.length)) {
    return "Nama, bidang kerja, keahlian, dan nomor WhatsApp wajib diisi.";
  }
  if (profile.role === "supplier" && (!profile.displayName || !profile.businessName || !profile.headline || !profile.deliveryArea || !profile.phone)) {
    return "Nama penanggung jawab, nama perusahaan, kategori produk, area pengiriman, dan nomor telepon wajib diisi.";
  }
  if (profile.role === "umkm" && (!profile.displayName || !profile.businessName || !profile.headline || !profile.phone)) {
    return "Nama lengkap, nama usaha, kategori, dan nomor WhatsApp wajib diisi.";
  }
  return null;
}

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { supabase, user: error ? null : user };
}

export async function saveRoleAction(
  _state: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const role = parseOnboardingRole(readFormString(formData, "role"));
  if (!role) return { status: "error", message: "Pilih peran yang tersedia." };

  const { user } = await getCurrentUser();
  if (!user) redirect("/register");

  redirect(`/onboarding/lengkapi-profil?role=${role}`);
}

export async function saveProfileAction(
  _state: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const role = parseOnboardingRole(readFormString(formData, "role")) ?? "umkm";
  const displayName = readFormString(formData, "displayName");
  const submittedBusinessName = readFormString(formData, "businessName");
  const profile: ProfileDraft = {
    role,
    displayName,
    businessName: role === "pekerja" ? displayName : submittedBusinessName,
    headline: readFormString(formData, "headline"),
    deliveryArea: readFormString(formData, "deliveryArea"),
    phone: readFormString(formData, "phone"),
    skills: readFormStrings(formData, "skills"),
  };
  const validationError = profileError(profile);
  if (validationError) return { status: "error", message: validationError };

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/register");

  const metadata = { ...(user.user_metadata ?? {}) };
  delete metadata.role;
  const { error } = await supabase.auth.updateUser({
    data: {
      ...metadata,
      display_name: profile.displayName,
      business_name: profile.businessName,
      headline: profile.headline,
      delivery_area: profile.deliveryArea,
      skills: profile.role === "pekerja" ? profile.skills : [],
      phone: profile.phone,
      pending_role: profile.role,
      onboarding_step: "review",
    },
  });

  if (error) return { status: "error", message: error.message };
  redirect(`/onboarding/berhasil?role=${role}`);
}

export async function completeOnboardingAction(formData: FormData): Promise<never> {
  const submittedRole = parseOnboardingRole(readFormString(formData, "role"));
  if (!submittedRole) redirect("/onboarding/pilih-peran");

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/register");

  const metadata = user.user_metadata ?? {};
  const role = parseOnboardingRole(readMetadataString(metadata, "pending_role"));
  if (!role || role !== submittedRole) redirect("/onboarding/pilih-peran");
  const profile: ProfileDraft = {
    role,
    displayName: readMetadataString(metadata, "display_name") || readMetadataString(metadata, "full_name"),
    businessName: readMetadataString(metadata, "business_name"),
    headline: readMetadataString(metadata, "headline"),
    deliveryArea: readMetadataString(metadata, "delivery_area"),
    phone: readMetadataString(metadata, "phone"),
    skills: readMetadataStrings(metadata, "skills"),
  };

  if (profileError(profile)) redirect(`/onboarding/lengkapi-profil?role=${role}`);

  const { error: roleError } = await supabase.rpc("set_own_role", {
    requested_role: role,
  });
  if (roleError) redirect(`/onboarding/berhasil?role=${role}&error=role`);

  const completedMetadata = { ...metadata };
  delete completedMetadata.pending_role;
  const { error: metadataError } = await supabase.auth.updateUser({
    data: { ...completedMetadata, role, onboarding_step: "complete" },
  });
  if (metadataError) redirect(`/onboarding/berhasil?role=${role}&error=save`);

  await Promise.all([
    logActivity({
      userId: user.id,
      role,
      action: "role.set",
      entityType: "user",
      entityId: user.id,
      metadata: { selected_role: role, detail: `Peran akun diatur sebagai ${role}.` },
    }),
    logActivity({
      userId: user.id,
      role,
      action: "profile.update",
      entityType: "profile",
      entityId: user.id,
      metadata: {
        display_name: profile.displayName,
        business_name: profile.businessName,
        detail: "Profil onboarding berhasil disimpan.",
      },
    }),
  ]);

  redirect(dashboardPathForRole(role));
}
