import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PhoneVerificationForm } from "@/components/phone-verification-form";
import { requireUser } from "@/lib/auth/access";
import { isPhoneVerificationEnabled } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Verifikasi Nomor | Pull",
  description: "Verifikasi nomor seluler untuk mengaktifkan status anggota Pull.",
};

export default async function VerifyPhonePage() {
  const access = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("phone,whatsapp_verified_at,verification_level")
    .eq("id", access.user.id)
    .maybeSingle();

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f7f4] px-4 py-10 font-[family-name:var(--font-worker-sans)] text-[#0c261c]">
      <section className="w-full max-w-lg rounded-[24px] border border-[#dce7e1] bg-white p-6 shadow-[0_20px_60px_rgba(12,38,28,.1)] sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f5ec] text-[#087447]"><ShieldCheck className="h-5 w-5" /></span>
        <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#507f63]">Verifikasi level 1</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-.03em]">Verifikasi nomor seluler</h1>
        <p className="mt-3 text-sm font-medium leading-7 text-[#6b7b75]">Kode dikirim melalui provider SMS yang dikonfigurasi di Supabase. Pull tidak menerima kode statis atau melewati verifikasi provider.</p>
        <div className="mt-6">
          {!isPhoneVerificationEnabled() ? (
            <div className="rounded-2xl border border-[#efd8ad] bg-[#fff8e9] p-5 text-sm font-medium leading-7 text-[#76581c]">
              Verifikasi nomor seluler belum tersedia karena provider SMS belum dikonfigurasi. Nomor Anda tetap tersimpan dan dapat diverifikasi kapan saja setelah provider aktif.
            </div>
          ) : profile?.whatsapp_verified_at && Number(profile.verification_level) >= 1 ? (
            <div className="rounded-2xl border border-[#bfe0cb] bg-[#edf8f1] p-5 text-center text-sm font-extrabold text-[#087447]">Nomor akun sudah terverifikasi.</div>
          ) : <PhoneVerificationForm initialPhone={profile?.phone ?? ""} />}
        </div>
      </section>
    </main>
  );
}
