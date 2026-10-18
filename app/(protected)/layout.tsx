import Link from "next/link";
import { PresenceHeartbeat } from "@/components/presence-heartbeat";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { requireUser } from "@/lib/auth/access";
import { isPhoneVerificationEnabled } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await requireUser();
  const supabase = await createClient();
  const { data: verification } = await supabase
    .from("profiles")
    .select("verification_level,whatsapp_verified_at")
    .eq("id", access.user.id)
    .maybeSingle();
  const needsPhoneVerification = isPhoneVerificationEnabled() && access.role !== "admin" && verification &&
    (Number(verification.verification_level) < 1 || !verification.whatsapp_verified_at);

  return (
    <>
      <PresenceHeartbeat />
      <RealtimeRefresh />
      {needsPhoneVerification ? (
        <div className="relative z-[120] flex flex-col gap-2 border-b border-[#efd8ad] bg-[#fff8e9] px-4 py-3 text-center text-xs font-bold text-[#76581c] sm:flex-row sm:items-center sm:justify-center">
          <span>Verifikasi nomor seluler untuk mengaktifkan status anggota Pull.</span>
          <Link href="/verify-phone" className="font-extrabold text-[#087447] underline underline-offset-2">Verifikasi sekarang</Link>
        </div>
      ) : null}
      {children}
    </>
  );
}
