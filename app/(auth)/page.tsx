"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import {
  signInAction,
  signInWithGoogleAction,
  type AuthActionState,
} from "@/features/auth/actions";

const initialAuthState: AuthActionState = {
  status: "idle",
  message: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialAuthState,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      {/* Outer Card Container */}
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#e6eee9] bg-white shadow-xl shadow-emerald-950/5 sm:rounded-[2.25rem] lg:flex-row lg:min-h-[560px]">

        {/* Left Side: Illustration Image */}
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

        {/* Right Side: White Login Form */}
        <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-sm space-y-5 lg:space-y-6">

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-[#145c46]">
                Masuk
              </h1>
              <p className="text-sm font-medium text-[#36544a]">
                Silahkan masukan data diri anda untuk masuk ke akun anda
              </p>
            </div>

            {/* Login Form */}
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
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#36544a]">
                  Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-[#91a79d]" />
                  <input
                    name="password"
                    autoComplete="current-password"
                    data-lpignore="true"
                    data-form-type="other"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="h-12 w-full rounded-2xl border border-[#d6e4dc] bg-white pl-12 pr-12 text-sm text-[#10231d] outline-none transition-all placeholder:text-[#91a79d] focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10 lg:h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#91a79d] hover:text-[#36544a] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer text-[#36544a]">
                  <input
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4.5 h-4.5 rounded-md border-[#d6e4dc] text-[#145c46] focus:ring-[#145c46]/20 accent-[#145c46] cursor-pointer"
                  />
                  <span>Ingat saya</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[#299a45] hover:text-[#217c37] transition-colors"
                >
                  Lupa kata sandi?
                </Link>
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
                {isPending ? "Memproses..." : "Masuk"}
              </button>

            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d6e4dc]"></div>
              </div>
              <span className="relative px-3 bg-white text-xs font-medium text-[#91a79d]">
                Atau Masuk Dengan
              </span>
            </div>

            {/* Social Logins */}
            <div className="space-y-3">
              {/* Google */}
              <form action={signInWithGoogleAction}>
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#d6e4dc] bg-white text-sm font-semibold text-[#10231d] transition-colors hover:bg-[#f8faf7] lg:h-11"
                >
                  <FcGoogle className="h-5 w-5" aria-hidden="true" />
                  Google
                </button>
              </form>
            </div>

            {/* Footer Links */}
            <div className="text-center text-xs font-semibold text-[#36544a]">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-[#299a45] hover:text-[#217c37] transition-colors"
              >
                Daftar sekarang
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
