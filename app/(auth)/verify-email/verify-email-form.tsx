"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-4 md:p-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-emerald-950/5 border border-[#e6eee9] flex-col md:flex-row min-h-[640px]">
        <div className="relative hidden md:flex md:w-1/2 bg-[#f4f8f5] items-center justify-center border-r border-[#e6eee9]">
          <Image
            src="/auth/login-bg.png"
            alt="Satu Platform, Bersama UMKM Maju"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center bg-white p-8 md:w-1/2 md:p-12">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#f4f8f5] border border-[#d6e4dc] text-[#145c46]">
                <Mail className="w-7 h-7" />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#145c46] md:text-3xl">
                Verifikasi Email
              </h1>
              <p className="text-sm text-[#6b7b75] leading-relaxed">
                Masukkan 6 digit kode verifikasi yang telah kami kirimkan ke{" "}
                <span className="font-semibold text-[#10231d]">
                  {email || "email Anda"}
                </span>
                .
              </p>
            </div>

            {!email && (
              <p
                role="alert"
                className="rounded-2xl border border-[#f7c8d3] bg-[#fce8ed] px-4 py-3 text-center text-xs font-semibold text-[#921932]"
              >
                Email tidak ditemukan. Silakan daftar ulang dari halaman
                registrasi.
              </p>
            )}

            <form action={verifyAction} className="space-y-6">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="token" value={otpCode} />

              <div className="flex justify-between gap-2">
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
                    className="w-12 h-12 text-center text-xl font-bold rounded-xl border border-[#d6e4dc] bg-white text-[#10231d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
                  />
                ))}
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
                disabled={!email || otpCode.length < 6 || isVerifyPending}
                className="w-full h-12 rounded-2xl bg-[#145c46] text-white font-semibold text-sm shadow-md shadow-emerald-950/20 hover:bg-[#104a38] active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
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
                className="text-[#299a45] hover:text-[#217c37] font-bold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResendPending ? "Mengirim..." : "Kirim ulang kode"}
              </button>
            </form>

            <div className="text-center text-xs font-semibold text-[#36544a]">
              Salah email?{" "}
              <Link
                href="/register"
                className="text-[#299a45] hover:text-[#217c37] transition-colors"
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
