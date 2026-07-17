"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP inputs
  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return; // only allow numbers

    const newOtp = [...otp];
    // Keep only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    // Reset timer to 5 minutes on resend
    setTimeLeft(300);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      // Simulate verification and redirect to dashboard
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-4 md:p-8">
      {/* Outer Card Container */}
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-emerald-950/5 border border-[#e6eee9] flex-col md:flex-row min-h-[640px]">

        {/* Left Side: Illustration Image (reusing the same image) */}
        <div className="relative hidden md:flex md:w-1/2 bg-[#f4f8f5] items-center justify-center border-r border-[#e6eee9]">
          <img
            src="/login-bg.png"
            alt="Satu Platform, Bersama UMKM Maju"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side: White OTP Form */}
        <div className="flex flex-col justify-center bg-white p-8 md:w-1/2 md:p-12">
          <div className="w-full max-w-sm mx-auto space-y-8">

            {/* Top Mail Checkmark Badge */}
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#f4f8f5] border border-[#d6e4dc] text-[#145c46]">
                <Mail className="w-7 h-7" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#145c46] md:text-3xl">
                Verifikasi Email
              </h1>
              <p className="text-sm text-[#6b7b75] leading-relaxed">
                Masukkan 6 digit kode verifikasi yang telah kami kirimkan ke email Anda.
              </p>
            </div>

            {/* OTP Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* 6 Digit Inputs */}
              <div className="flex justify-between gap-2">
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
                    className="w-12 h-12 text-center text-xl font-bold rounded-xl border border-[#d6e4dc] bg-white text-[#10231d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
                  />
                ))}
              </div>

              {/* Countdown Timer Alert Box */}
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#f8faf7] border border-[#e6eee9] text-xs font-semibold text-[#145c46]">
                <span>
                  {timeLeft > 0
                    ? `Kode akan kedaluwarsa dalam ${formatTime(timeLeft)}`
                    : "Kode telah kedaluwarsa"}
                </span>
              </div>

              {/* Resend Code (Secondary Action) */}
              <div className="text-center text-xs font-medium text-[#36544a]">
                Tidak menerima kode?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-[#299a45] hover:text-[#217c37] font-bold transition-colors cursor-pointer ml-1"
                >
                  Kirim ulang kode
                </button>
              </div>

              {/* Submit Verification Button (Primary Action) */}
              <button
                type="submit"
                disabled={otp.join("").length < 6}
                className="w-full h-12 rounded-2xl bg-[#145c46] text-white font-semibold text-sm shadow-md shadow-emerald-950/20 hover:bg-[#104a38] active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
              >
                Verifikasi Email
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
