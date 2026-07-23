"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function authMessage(message?: string) {
  if (!message) {
    return "Terjadi kesalahan. Silakan coba lagi.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email atau kata sandi belum sesuai.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Email belum diverifikasi. Silakan cek kotak masuk Anda.";
  }

  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.";
  }

  if (
    normalized === "{}" ||
    normalized.includes("error sending confirmation email") ||
    normalized.includes("email address not authorized")
  ) {
    return "Email verifikasi gagal dikirim oleh Supabase. Periksa konfigurasi SMTP, sender, dan template Confirm signup.";
  }

  if (normalized.includes("database error saving new user")) {
    return "Supabase gagal menyimpan pengguna. Periksa trigger auth.users dan Postgres Logs.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "Batas pengiriman email tercapai. Tunggu beberapa saat atau gunakan custom SMTP.";
  }

  return message;
}

async function getSiteUrl() {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "localhost:3000";
  const protocol =
    headersList.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

export async function signInAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readFormString(formData, "email");
  const password = readFormString(formData, "password");

  if (!email || !password) {
    return {
      status: "error",
      message: "Email dan kata sandi wajib diisi.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      status: "error",
      message: authMessage(error.message),
    };
  }

  await supabase.rpc("record_current_login");
  redirect("/auth/redirect");
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/confirm?next=/auth/redirect`,
    },
  });

  if (error || !data.url) {
    redirect("/?auth_error=google");
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.rpc("record_current_logout");
  await supabase.auth.signOut();
  redirect("/");
}

export async function signUpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = readFormString(formData, "fullName");
  const email = readFormString(formData, "email");
  const password = readFormString(formData, "password");
  const agreeTerms = formData.get("agreeTerms") === "on";

  if (!fullName || !email || !password) {
    return {
      status: "error",
      message: "Nama, email, dan kata sandi wajib diisi.",
    };
  }

  if (!agreeTerms) {
    return {
      status: "error",
      message: "Anda perlu menyetujui syarat dan kebijakan privasi.",
    };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "Kata sandi minimal 8 karakter.",
    };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/onboarding`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error("Supabase sign-up failed", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    return {
      status: "error",
      message: authMessage(error.message),
    };
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function requestPasswordResetAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readFormString(formData, "email");

  if (!email) {
    return {
      status: "error",
      message: "Email wajib diisi.",
    };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    return {
      status: "error",
      message: authMessage(error.message),
    };
  }

  redirect(`/verify-reset?email=${encodeURIComponent(email)}`);
}

export async function verifyEmailOtpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readFormString(formData, "email");
  const token = readFormString(formData, "token");

  if (!email || token.length < 6 || token.length > 8) {
    return {
      status: "error",
      message: "Email dan kode verifikasi 6–8 digit wajib diisi.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    return {
      status: "error",
      message: authMessage(error.message),
    };
  }

  redirect("/onboarding");
}

export async function resendEmailOtpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readFormString(formData, "email");

  if (!email) {
    return {
      status: "error",
      message: "Email tidak ditemukan. Silakan daftar ulang.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    email,
    type: "signup",
  });

  if (error) {
    return {
      status: "error",
      message: authMessage(error.message),
    };
  }

  return {
    status: "success",
    message: "Kode verifikasi baru sudah dikirim.",
  };
}

export async function verifyResetOtpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readFormString(formData, "email");
  const token = readFormString(formData, "token");

  if (!email || token.length < 6 || token.length > 8) {
    return {
      status: "error",
      message: "Email dan kode reset 6–8 digit wajib diisi.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "recovery",
  });

  if (error) {
    return {
      status: "error",
      message: authMessage(error.message),
    };
  }

  redirect("/reset-password");
}

export async function resendPasswordResetAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readFormString(formData, "email");

  if (!email) {
    return {
      status: "error",
      message: "Email tidak ditemukan. Silakan masukkan email ulang.",
    };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    return {
      status: "error",
      message: authMessage(error.message),
    };
  }

  return {
    status: "success",
    message: "Instruksi reset kata sandi sudah dikirim ulang.",
  };
}

export async function updatePasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readFormString(formData, "password");
  const confirmPassword = readFormString(formData, "confirmPassword");

  if (password.length < 8) {
    return {
      status: "error",
      message: "Kata sandi minimal 8 karakter.",
    };
  }

  if (password !== confirmPassword) {
    return {
      status: "error",
      message: "Konfirmasi kata sandi belum sama.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      status: "error",
      message:
        "Sesi reset tidak valid atau sudah kedaluwarsa. Minta tautan reset baru.",
    };
  }

  redirect("/reset-success");
}
