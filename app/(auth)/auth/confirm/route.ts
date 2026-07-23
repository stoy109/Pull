import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity/log-activity";
import { isRole, type Role } from "@/lib/auth/roles";
import { isMvpAuthEnabled } from "@/lib/auth/mvp-session";

const allowedNextPaths = new Set([
  "/dashboard",
  "/onboarding",
  "/reset-password",
]);

function dashboardForRole(role: Role) {
  if (role === "pekerja") return "/worker/dashboard";
  if (role === "supplier") return "/supplier";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

async function resolveLoginDestination(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requestedPath: string,
) {
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;
  if (!user || !isRole(role)) return requestedPath === "/dashboard" ? "/onboarding/pilih-peran" : requestedPath;

  await logActivity({
    userId: user.id,
    role,
    action: "auth.login",
    entityType: "user",
    entityId: user.id,
    metadata: { method: "oauth_or_otp", detail: "Pengguna berhasil masuk." },
  });

  return requestedPath === "/dashboard" ? dashboardForRole(role) : requestedPath;
}

function getSafeNextPath(value: string | null) {
  if (!value || !allowedNextPaths.has(value)) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  if (isMvpAuthEnabled()) {
    return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
  }
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination = await resolveLoginDestination(supabase, next);
      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      const destination = await resolveLoginDestination(supabase, next);
      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/?auth_error=confirm", requestUrl.origin));
}
