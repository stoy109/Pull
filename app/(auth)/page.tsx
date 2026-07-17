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
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-4 md:p-8">
      {/* Outer Card Container */}
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-emerald-950/5 border border-[#e6eee9] flex-col md:flex-row min-h-[640px]">

        {/* Left Side: Illustration Image */}
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

        {/* Right Side: White Login Form */}
        <div className="flex flex-col justify-center bg-white p-8 md:w-1/2 md:p-12">
          <div className="w-full max-w-sm mx-auto space-y-8">

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
              className="space-y-5"
              data-lpignore="true"
              data-form-type="other"
            >

              {/* Email Field */}
              <div className="space-y-2">
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
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[#d6e4dc] bg-white text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
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
                    className="w-full h-12 pl-12 pr-12 rounded-2xl border border-[#d6e4dc] bg-white text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
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
                className="w-full h-12 rounded-2xl bg-[#145c46] text-white font-semibold text-sm shadow-md shadow-emerald-950/20 hover:bg-[#104a38] active:scale-[0.99] transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Memproses..." : "Masuk"}
              </button>

            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
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
                  className="flex items-center justify-center gap-2.5 w-full h-12 rounded-2xl border border-[#d6e4dc] bg-white text-sm font-semibold text-[#10231d] hover:bg-[#f8faf7] transition-colors cursor-pointer"
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
