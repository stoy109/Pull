"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormFeedback, FormHelper } from "@/components/form-ui";
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
  const [otpCode, setOtpCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(299);
  const isComplete = otpCode.length >= 6;
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

  const resetOtpEntry = () => {
    setTimeLeft(299);
    setOtpCode("");
  };

  return (
    <div className="form-page flex min-h-screen items-center justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      <div className="form-shell flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#e6eee9] bg-white shadow-xl shadow-emerald-950/5 sm:rounded-[2.25rem] lg:flex-row lg:min-h-[560px]">
        <div className="form-visual relative hidden items-center justify-center border-r border-[#e6eee9] bg-[#f4f8f5] lg:flex lg:w-1/2">
          <Image
            src="/auth/login-bg.png"
            alt="Verifikasi Kode Reset"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="form-panel flex flex-col justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="form-content mx-auto w-full max-w-sm space-y-5 lg:space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="form-title text-2xl font-bold tracking-tight text-[#10231d] md:text-3xl">
                Verifikasi Kode Reset
              </h1>
              <p className="form-description text-sm text-[#6b7b75] leading-relaxed">
                Kami telah mengirimkan instruksi reset ke{" "}
                <span className="font-semibold text-[#10231d]">
                  {maskEmail(email)}
                </span>
                . Masukkan kode 6–8 digit jika email Anda berisi kode, atau buka
                tautan reset dari email.
              </p>
            </div>

            {!email && (
              <FormFeedback status="error" centered>
                Email tidak ditemukan. Silakan masukkan email ulang.
              </FormFeedback>
            )}

            <form action={verifyAction} className="space-y-4">
              <input type="hidden" name="email" value={email} />
              <div className="space-y-2">
                <input
                  name="token"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  minLength={6}
                  maxLength={8}
                  required
                  aria-label="Kode reset"
                  aria-describedby="reset-code-helper"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="Masukkan kode reset"
                  className="form-control text-center text-lg font-extrabold tracking-[0.3em]"
                />
                <FormHelper id="reset-code-helper">
                  Masukkan kode 6–8 digit yang dikirim ke email Anda.
                </FormHelper>
              </div>

              <div className="form-note">
                <span>
                  {timeLeft > 0
                    ? `Kode akan kedaluwarsa dalam ${formatTime(timeLeft)}`
                    : "Kode telah kedaluwarsa"}
                </span>
              </div>

              {statusState.status !== "idle" && (
                <FormFeedback status={statusState.status} centered>
                  {statusState.message}
                </FormFeedback>
              )}

              <button
                type="submit"
                disabled={!email || !isComplete || isVerifyPending}
                className="form-button form-button--primary form-button--disabled-solid w-full"
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
                    className="form-link"
                  >
                    {isResendPending ? "Mengirim..." : "Kirim ulang"}
                  </button>
                </p>
              </form>
              <p className="text-xs text-[#91a79d]">
                <Link
                  href="/forgot-password"
                  className="form-link text-[#6b7b75] hover:text-[#10231d] transition-colors inline-flex items-center gap-1.5"
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
