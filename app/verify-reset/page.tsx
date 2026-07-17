"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Masked email for display
const MASKED_EMAIL = "budi.sa*****@email.com";

export default function VerifyResetPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(299);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setTimeLeft(299);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length === 6) {
      window.location.href = "/reset-password";
    }
  };

  const isComplete = otp.join("").length === 6;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-4 md:p-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-emerald-950/5 border border-[#e6eee9] flex-col md:flex-row min-h-[640px]">

        {/* Left Side: Illustration */}
        <div className="relative hidden md:flex md:w-1/2 bg-[#f4f8f5] items-center justify-center border-r border-[#e6eee9]">
          <img
            src="/login-bg.png"
            alt="Verifikasi Kode Reset"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side: OTP Form */}
        <div className="flex flex-col justify-center bg-white p-8 md:w-1/2 md:p-12">
          <div className="w-full max-w-sm mx-auto space-y-8">

            {/* Title & Subtitle */}
            <div className="space-y-3 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#10231d] md:text-3xl">
                Verifikasi Kode Reset
              </h1>
              <p className="text-sm text-[#6b7b75] leading-relaxed">
                Kami telah mengirimkan kode verifikasi 6 digit ke{" "}
                <span className="font-semibold text-[#10231d]">{MASKED_EMAIL}</span>.{" "}
                Masukkan kode untuk melanjutkan proses reset kata sandi.
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* 6 Digit OTP Inputs */}
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
                      ref={(el) => { inputRefs.current[index] = el; }}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-full aspect-square max-w-[56px] h-14 text-center text-2xl font-bold rounded-2xl border-2 border-[#d6e4dc] bg-white text-[#10231d] outline-none transition-all focus:border-[#145c46] focus:ring-4 focus:ring-[#145c46]/8 placeholder:text-[#e6eee9]"
                    />
                  ))}
                </div>
                {/* OTP Helper Text */}
                <p className="text-center text-xs text-[#91a79d]">
                  Masukkan kode 6 digit yang dikirim ke email Anda.
                </p>
              </div>

              {/* Countdown Timer Alert Box */}
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#f8faf7] border border-[#e6eee9] text-xs font-semibold text-[#145c46]">
                <span>
                  {timeLeft > 0
                    ? `Kode akan kedaluwarsa dalam ${formatTime(timeLeft)}`
                    : "Kode telah kedaluwarsa"}
                </span>
              </div>

              {/* Resend + Change Email as text-only actions */}
              <div className="text-center space-y-1.5">
                <p className="text-xs text-[#91a79d]">
                  Belum menerima kode?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[#299a45] hover:text-[#217c37] font-semibold transition-colors cursor-pointer"
                  >
                    Kirim ulang kode
                  </button>
                </p>
                <p className="text-xs text-[#91a79d]">
                  <Link
                    href="/forgot-password"
                    className="text-[#6b7b75] hover:text-[#10231d] transition-colors inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Gunakan email lain
                  </Link>
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={!isComplete}
                className={`w-full h-12 rounded-2xl font-semibold text-sm shadow-md transition-all duration-150 cursor-pointer ${isComplete
                  ? "bg-[#145c46] text-white shadow-emerald-950/20 hover:bg-[#104a38] active:scale-[0.99]"
                  : "bg-[#d6e4dc] text-[#6b7b75] cursor-not-allowed shadow-none"
                  }`}
              >
                Lanjutkan
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
