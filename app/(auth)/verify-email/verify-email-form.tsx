"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { FormFeedback } from "@/components/form-ui";
import {
  resendEmailOtpAction,
  verifyEmailOtpAction,
  type AuthActionState,
} from "@/features/auth/actions";

const initialAuthState: AuthActionState = {
  status: "idle",
  message: "",
};

type VerifyEmailFormProps = {
  email: string;
};

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [verifyState, verifyAction, isVerifyPending] = useActionState(
    verifyEmailOtpAction,
    initialAuthState,
  );
  const [resendState, resendAction, isResendPending] = useActionState(
    resendEmailOtpAction,
    initialAuthState,
  );
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpCode = otp.join("");
  const statusState =
    verifyState.status !== "idle" ? verifyState : resendState;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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
    setTimeLeft(300);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="form-page flex min-h-screen items-center justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      <div className="form-shell flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#e6eee9] bg-white shadow-xl shadow-emerald-950/5 sm:rounded-[2.25rem] lg:flex-row lg:min-h-[560px]">
        <div className="form-visual relative hidden items-center justify-center border-r border-[#e6eee9] bg-[#f4f8f5] lg:flex lg:w-1/2">
          <Image
            src="/auth/login-bg.png"
            alt="Satu Platform, Bersama UMKM Maju"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="form-panel flex flex-col justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="form-content mx-auto w-full max-w-sm space-y-5 lg:space-y-6">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d6e4dc] bg-[#f4f8f5] text-[#145c46] lg:h-12 lg:w-12">
                <Mail className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h1 className="form-title form-title--brand text-2xl font-bold tracking-tight text-[#145c46] md:text-3xl">
                Verifikasi Email
              </h1>
              <p className="form-description text-sm text-[#6b7b75] leading-relaxed">
                Masukkan 6 digit kode verifikasi yang telah kami kirimkan ke{" "}
                <span className="font-semibold text-[#10231d]">
                  {email || "email Anda"}
                </span>
                .
              </p>
            </div>

            {!email && (
              <FormFeedback status="error" centered>
                Email tidak ditemukan. Silakan daftar ulang dari halaman
                registrasi.
              </FormFeedback>
            )}

            <form action={verifyAction} className="space-y-4">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="token" value={otpCode} />

              <div className="form-otp-grid" role="group" aria-label="Kode verifikasi 6 digit">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    required
                    aria-label={`Digit kode ${index + 1}`}
                    value={digit}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    onChange={(event) => handleChange(event.target.value, index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    className="form-otp-input"
                  />
                ))}
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
                disabled={!email || otpCode.length < 6 || isVerifyPending}
                className="form-button form-button--primary w-full"
              >
                {isVerifyPending ? "Memverifikasi..." : "Verifikasi Email"}
              </button>
            </form>

            <form
              action={resendAction}
              onSubmit={resetOtpEntry}
              className="text-center text-xs font-medium text-[#36544a]"
            >
              <input type="hidden" name="email" value={email} />
              Tidak menerima kode?{" "}
              <button
                type="submit"
                disabled={!email || isResendPending}
                className="form-link"
              >
                {isResendPending ? "Mengirim..." : "Kirim ulang kode"}
              </button>
            </form>

            <div className="text-center text-xs font-semibold text-[#36544a]">
              Salah email?{" "}
              <Link
                href="/register"
                className="form-link text-[#299a45] hover:text-[#217c37] transition-colors"
              >
                Daftar ulang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
