"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import {
  FormFeedback,
  FormLabel,
  RequiredIndicator,
} from "@/components/form-ui";
import { signUpAction, type AuthActionState } from "@/features/auth/actions";

const initialAuthState: AuthActionState = {
  status: "idle",
  message: "",
};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialAuthState,
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

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

        {/* Right Side: White Register Form */}
        <div className="form-panel flex flex-col justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="form-content mx-auto w-full max-w-sm space-y-5 lg:space-y-6">

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="form-title form-title--brand text-3xl font-bold tracking-tight text-[#145c46]">
                Daftar Akun
              </h1>
              <p className="form-description text-sm font-medium text-[#36544a]">
                Isi data diri Anda untuk membuat akun Pull
              </p>
            </div>

            {/* Register Form */}
            <form
              action={formAction}
              className="space-y-4"
              data-lpignore="true"
              data-form-type="other"
            >

              {/* Nama Lengkap Field */}
              <div className="form-field space-y-1.5">
                <FormLabel htmlFor="register-name" required>Nama Lengkap</FormLabel>
                <div className="form-control-wrap">
                  <User className="form-leading-icon" aria-hidden="true" />
                  <input
                    id="register-name"
                    name="fullName"
                    autoComplete="name"
                    data-lpignore="true"
                    data-form-type="other"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="form-control form-control--leading"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="form-field space-y-1.5">
                <FormLabel htmlFor="register-email" required>Email</FormLabel>
                <div className="form-control-wrap">
                  <Mail className="form-leading-icon" aria-hidden="true" />
                  <input
                    id="register-email"
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
              </div>

              {/* Kata Sandi Field */}
              <div className="form-field space-y-1.5">
                <FormLabel htmlFor="register-password" required>Kata Sandi</FormLabel>
                <div className="form-control-wrap">
                  <Lock className="form-leading-icon" aria-hidden="true" />
                  <input
                    id="register-password"
                    name="password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda"
                    className="form-control form-control--leading form-control--trailing"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="form-icon-button"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="form-checkbox-label">
                  <input
                    name="agreeTerms"
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>
                    Saya setuju dengan{" "}
                    <Link href="/terms" className="form-link text-[#299a45] hover:text-[#217c37] transition-colors">
                      Syarat & Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link href="/privacy" className="form-link text-[#299a45] hover:text-[#217c37] transition-colors">
                      Kebijakan Privasi
                    </Link>
                    <RequiredIndicator />
                  </span>
                </label>
              </div>

              {state.status === "error" && (
                <FormFeedback status="error">{state.message}</FormFeedback>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="form-button form-button--primary mt-1 w-full"
              >
                {isPending ? "Mendaftarkan..." : "Daftar"}
              </button>

            </form>

            {/* Footer Links */}
            <div className="pt-1 text-center text-xs font-semibold text-[#36544a]">
              Sudah punya akun?{" "}
              <Link
                href="/"
                className="form-link text-[#299a45] hover:text-[#217c37] transition-colors"
              >
                Masuk di sini
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
