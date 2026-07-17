"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  resendPasswordResetAction,
  verifyResetOtpAction,
  type AuthActionState,
} from "@/features/auth/actions";

const initialAuthState: AuthActionState = {
  status: "idle",
  message: "",
};

type VerifyResetFormProps = {
  email: string;
};

function maskEmail(email: string) {
  if (!email.includes("@")) {
    return "email Anda";
  }

  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 3))}@${domain}`;
}

export function VerifyResetForm({ email }: VerifyResetFormProps) {
  const [verifyState, verifyAction, isVerifyPending] = useActionState(
    verifyResetOtpAction,
    initialAuthState,
  );
  const [resendState, resendAction, isResendPending] = useActionState(
    resendPasswordResetAction,
    initialAuthState,
  );
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(299);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpCode = otp.join("");
  const isComplete = otpCode.length === 6;
  const statusState =
    verifyState.status !== "idle" ? verifyState : resendState;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resetOtpEntry = () => {
    setTimeLeft(299);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-4 md:p-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-emerald-950/5 border border-[#e6eee9] flex-col md:flex-row min-h-[640px]">
        <div className="relative hidden md:flex md:w-1/2 bg-[#f4f8f5] items-center justify-center border-r border-[#e6eee9]">
          <Image
            src="/auth/login-bg.png"
            alt="Verifikasi Kode Reset"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center bg-white p-8 md:w-1/2 md:p-12">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="space-y-3 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#10231d] md:text-3xl">
                Verifikasi Kode Reset
              </h1>
              <p className="text-sm text-[#6b7b75] leading-relaxed">
                Kami telah mengirimkan instruksi reset ke{" "}
                <span className="font-semibold text-[#10231d]">
                  {maskEmail(email)}
                </span>
                . Masukkan kode 6 digit jika email Anda berisi kode, atau buka
                tautan reset dari email.
              </p>
            </div>

            {!email && (
              <p
                role="alert"
                className="rounded-2xl border border-[#f7c8d3] bg-[#fce8ed] px-4 py-3 text-center text-xs font-semibold text-[#921932]"
              >
                Email tidak ditemukan. Silakan masukkan email ulang.
              </p>
            )}

            <form action={verifyAction} className="space-y-5">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="token" value={otpCode} />

              <div className="space-y-3">
                <div className="flex justify-between gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      required
                      value={digit}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      onChange={(event) => handleChange(event.target.value, index)}
                      onKeyDown={(event) => handleKeyDown(event, index)}
                      className="w-full aspect-square max-w-[56px] h-14 text-center text-2xl font-bold rounded-2xl border-2 border-[#d6e4dc] bg-white text-[#10231d] outline-none transition-all focus:border-[#145c46] focus:ring-4 focus:ring-[#145c46]/8 placeholder:text-[#e6eee9]"
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-[#91a79d]">
                  Masukkan kode 6 digit yang dikirim ke email Anda.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#f8faf7] border border-[#e6eee9] text-xs font-semibold text-[#145c46]">
                <span>
                  {timeLeft > 0
                    ? `Kode akan kedaluwarsa dalam ${formatTime(timeLeft)}`
                    : "Kode telah kedaluwarsa"}
                </span>
              </div>

              {statusState.status !== "idle" && (
                <p
                  role={statusState.status === "error" ? "alert" : "status"}
                  className={`rounded-2xl border px-4 py-3 text-center text-xs font-semibold ${
                    statusState.status === "error"
                      ? "border-[#f7c8d3] bg-[#fce8ed] text-[#921932]"
                      : "border-[#c3e6d0] bg-[#eef8f2] text-[#145c46]"
                  }`}
                >
                  {statusState.message}
                </p>
              )}

              <button
                type="submit"
                disabled={!email || !isComplete || isVerifyPending}
                className={`w-full h-12 rounded-2xl font-semibold text-sm shadow-md transition-all duration-150 cursor-pointer ${
                  email && isComplete && !isVerifyPending
                    ? "bg-[#145c46] text-white shadow-emerald-950/20 hover:bg-[#104a38] active:scale-[0.99]"
                    : "bg-[#d6e4dc] text-[#6b7b75] cursor-not-allowed shadow-none"
                }`}
              >
                {isVerifyPending ? "Memverifikasi..." : "Lanjutkan"}
              </button>
            </form>

            <div className="text-center space-y-1.5">
              <form action={resendAction} onSubmit={resetOtpEntry}>
                <input type="hidden" name="email" value={email} />
                <p className="text-xs text-[#91a79d]">
                  Belum menerima instruksi?{" "}
                  <button
                    type="submit"
                    disabled={!email || isResendPending}
                    className="text-[#299a45] hover:text-[#217c37] font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isResendPending ? "Mengirim..." : "Kirim ulang"}
                  </button>
                </p>
              </form>
              <p className="text-xs text-[#91a79d]">
                <Link
                  href="/forgot-password"
                  className="text-[#6b7b75] hover:text-[#10231d] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Gunakan email lain
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
