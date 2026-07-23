"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageSquareText, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  return `+62${digits}`;
}

export function PhoneVerificationForm({ initialPhone = "" }: { initialPhone?: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function sendOtp(event: FormEvent) {
    event.preventDefault();
    const normalized = normalizePhone(phone);
    if (!/^\+62\d{8,13}$/.test(normalized)) {
      setMessage("Masukkan nomor Indonesia yang valid.");
      return;
    }

    setBusy(true);
    setMessage("");
    const { error } = await createClient().auth.updateUser({ phone: normalized });
    setBusy(false);
    if (error) {
      setMessage(`OTP belum dapat dikirim: ${error.message}`);
      return;
    }
    setVerifiedPhone(normalized);
    setStep("otp");
    setMessage("Kode OTP dikirim oleh provider SMS Supabase.");
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{4,8}$/.test(token)) {
      setMessage("Masukkan kode OTP 4–8 digit.");
      return;
    }

    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const verification = await supabase.auth.verifyOtp({
      phone: verifiedPhone,
      token,
      type: "phone_change",
    });
    if (verification.error) {
      setBusy(false);
      setMessage(`Kode belum terverifikasi: ${verification.error.message}`);
      return;
    }

    const { error } = await supabase.rpc("mark_current_phone_verified");
    setBusy(false);
    if (error) {
      setMessage(`Status profil belum dapat diperbarui: ${error.message}`);
      return;
    }

    setStep("done");
    setMessage("Nomor berhasil diverifikasi.");
    router.refresh();
  }

  if (step === "done") {
    return (
      <div className="rounded-2xl border border-[#bfe0cb] bg-[#edf8f1] p-5 text-center text-[#087447]">
        <CheckCircle2 className="mx-auto h-8 w-8" />
        <p className="mt-3 text-sm font-extrabold">WhatsApp/nomor seluler terverifikasi</p>
        <button type="button" onClick={() => router.replace("/auth/redirect")} className="mt-4 h-11 rounded-xl bg-[#087447] px-5 text-xs font-extrabold text-white">Kembali ke dashboard</button>
      </div>
    );
  }

  return (
    <div>
      {message ? <p role="status" className="mb-4 rounded-xl bg-[#f5f8f6] px-4 py-3 text-xs font-bold text-[#426457]">{message}</p> : null}
      {step === "phone" ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <label className="grid gap-2 text-xs font-extrabold text-[#315b4c]">Nomor WhatsApp / seluler
            <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" className="h-12 rounded-xl border border-[#d4e2da] px-4 text-sm outline-none focus:border-[#087447] focus:ring-4 focus:ring-[#e8f5ec]" required />
          </label>
          <button disabled={busy} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087447] text-sm font-extrabold text-white disabled:opacity-50"><Send className="h-4 w-4" />{busy ? "Mengirim…" : "Kirim OTP"}</button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-4">
          <label className="grid gap-2 text-xs font-extrabold text-[#315b4c]">Kode verifikasi
            <input value={token} onChange={(event) => setToken(event.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" autoComplete="one-time-code" placeholder="Kode OTP" className="h-12 rounded-xl border border-[#d4e2da] px-4 text-center text-lg font-extrabold tracking-[.2em] outline-none focus:border-[#087447] focus:ring-4 focus:ring-[#e8f5ec]" required />
          </label>
          <button disabled={busy} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087447] text-sm font-extrabold text-white disabled:opacity-50"><MessageSquareText className="h-4 w-4" />{busy ? "Memeriksa…" : "Verifikasi kode"}</button>
          <button type="button" onClick={() => { setStep("phone"); setToken(""); setMessage(""); }} className="h-10 w-full text-xs font-extrabold text-pull-500">Ganti nomor</button>
        </form>
      )}
    </div>
  );
}
