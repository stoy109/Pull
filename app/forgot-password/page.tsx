"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending reset code, then redirect to OTP verification for reset
    window.location.href = "/verify-reset";
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

        {/* Right Side: White Forgot Password Form */}
        <div className="flex flex-col justify-center bg-white p-8 md:w-1/2 md:p-12">
          <div className="w-full max-w-sm mx-auto space-y-8">

            {/* Title & Subtitle */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#145c46] md:text-3xl">
                Lupa Kata Sandi?
              </h1>
              <p className="text-sm text-[#6b7b75] leading-relaxed">
                Jangan khawatir! Masukkan email Anda dan kami akan mengirimkan kode untuk mereset kata sandi Anda.
              </p>
            </div>

            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#36544a]">
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-[#91a79d]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[#d6e4dc] bg-white text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
                  />
                </div>

                {/* Helper text */}
                <p className="text-xs text-[#91a79d]">
                  *Anda akan menerima kode verifikasi 6 digit di email Anda.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#145c46] text-white font-semibold text-sm shadow-md shadow-emerald-950/20 hover:bg-[#104a38] active:scale-[0.99] transition-all duration-150 cursor-pointer"
              >
                Kirim Kode Reset
              </button>

            </form>

            {/* Back to Login (Light Ghost Link) */}
            <div className="text-center pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6b7b75] hover:text-[#10231d] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Login
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
