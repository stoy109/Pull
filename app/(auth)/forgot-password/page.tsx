"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import {
  requestPasswordResetAction,
  type AuthActionState,
} from "@/features/auth/actions";

const initialAuthState: AuthActionState = {
  status: "idle",
  message: "",
};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialAuthState,
  );
  const [email, setEmail] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      {/* Outer Card Container */}
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#e6eee9] bg-white shadow-xl shadow-emerald-950/5 sm:rounded-[2.25rem] lg:flex-row lg:min-h-[560px]">

        {/* Left Side: Illustration Image (reusing the same image) */}
        <div className="relative hidden items-center justify-center border-r border-[#e6eee9] bg-[#f4f8f5] lg:flex lg:w-1/2">
          <Image
            src="/auth/login-bg.png"
            alt="Satu Platform, Bersama UMKM Maju"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* Right Side: White Forgot Password Form */}
        <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-sm space-y-5 lg:space-y-6">

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
            <form
              action={formAction}
              className="space-y-4"
              data-lpignore="true"
              data-form-type="other"
            >

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#36544a]">
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-[#91a79d]" />
                  <input
                    name="email"
                    autoComplete="email"
                    data-lpignore="true"
                    data-form-type="other"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="h-12 w-full rounded-2xl border border-[#d6e4dc] bg-white pl-12 pr-4 text-sm text-[#10231d] outline-none transition-all placeholder:text-[#91a79d] focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10 lg:h-11"
                  />
                </div>

                {/* Helper text */}
                <p className="text-xs text-[#91a79d]">
                  *Anda akan menerima kode verifikasi 6 digit di email Anda.
                </p>
              </div>

              {state.status === "error" && (
                <p
                  role="alert"
                  className="rounded-2xl border border-[#f7c8d3] bg-[#fce8ed] px-4 py-3 text-xs font-semibold text-[#921932]"
                >
                  {state.message}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="h-12 w-full rounded-2xl bg-[#145c46] text-sm font-semibold text-white shadow-md shadow-emerald-950/20 transition-all duration-150 hover:bg-[#104a38] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 lg:h-11"
              >
                {isPending ? "Mengirim..." : "Kirim Kode Reset"}
              </button>

            </form>

            {/* Back to Login (Light Ghost Link) */}
            <div className="pt-1 text-center">
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
