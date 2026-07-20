"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { FormFeedback, FormHelper, FormLabel } from "@/components/form-ui";
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
    <div className="form-page flex min-h-screen items-center justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      {/* Outer Card Container */}
      <div className="form-shell flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#e6eee9] bg-white shadow-xl shadow-emerald-950/5 sm:rounded-[2.25rem] lg:flex-row lg:min-h-[560px]">

        {/* Left Side: Illustration Image (reusing the same image) */}
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

        {/* Right Side: White Forgot Password Form */}
        <div className="form-panel flex flex-col justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="form-content mx-auto w-full max-w-sm space-y-5 lg:space-y-6">

            {/* Title & Subtitle */}
            <div className="space-y-2 text-center">
              <h1 className="form-title form-title--brand text-2xl font-bold tracking-tight text-[#145c46] md:text-3xl">
                Lupa Kata Sandi?
              </h1>
              <p className="form-description text-sm text-[#6b7b75] leading-relaxed">
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
              <div className="form-field space-y-1.5">
                <FormLabel htmlFor="forgot-email" required>Email</FormLabel>
                <div className="form-control-wrap">
                  <Mail className="form-leading-icon" aria-hidden="true" />
                  <input
                    id="forgot-email"
                    name="email"
                    autoComplete="email"
                    data-lpignore="true"
                    data-form-type="other"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan alamat email Anda"
                    className="form-control form-control--leading"
                  />
                </div>

                {/* Helper text */}
                <FormHelper>
                  Anda akan menerima kode verifikasi 6 digit melalui email.
                </FormHelper>
              </div>

              {state.status === "error" && (
                <FormFeedback status="error">{state.message}</FormFeedback>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="form-button form-button--primary w-full"
              >
                {isPending ? "Mengirim..." : "Kirim Kode Reset"}
              </button>

            </form>

            {/* Back to Login (Light Ghost Link) */}
            <div className="pt-1 text-center">
              <Link
                href="/"
                className="form-link inline-flex items-center gap-1.5 text-xs font-bold text-[#6b7b75] hover:text-[#10231d] transition-colors"
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
