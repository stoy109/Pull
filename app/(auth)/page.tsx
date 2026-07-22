"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AuthSlideshow } from "@/components/auth-slideshow";
import { FormFeedback, FormLabel } from "@/components/form-ui";
import { useClientMounted } from "@/components/use-client-mounted";
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
  const isMounted = useClientMounted();

  return (
    <div className="form-page flex min-h-screen items-center justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      {/* Outer Card Container */}
      <div className="form-shell flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#e6eee9] bg-white shadow-xl shadow-emerald-950/5 sm:rounded-[2.25rem] lg:flex-row lg:min-h-[560px]">

        {/* Left Side: Illustration Image */}
        <div className="form-visual relative hidden items-center justify-center border-r border-[#e6eee9] bg-[#f4f8f5] lg:flex lg:w-1/2">
          <AuthSlideshow />
        </div>

        {/* Right Side: White Login Form */}
        <div className="form-panel flex flex-col justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="form-content mx-auto w-full max-w-sm space-y-5 lg:space-y-6">

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="form-title form-title--brand text-3xl font-bold tracking-tight text-[#145c46]">
                Masuk
              </h1>
              <p className="form-description text-sm font-medium text-[#36544a]">
                Silakan masukkan data Anda untuk masuk ke akun.
              </p>
            </div>

            {/* Login Form */}
            {isMounted ? (
              <form
                action={formAction}
                className="space-y-4"
                data-lpignore="true"
                data-form-type="other"
              >

              {/* Email Field */}
              <div className="form-field space-y-1.5">
                <FormLabel htmlFor="login-email" required>Email</FormLabel>
                <div className="form-control-wrap">
                  <Mail className="form-leading-icon" aria-hidden="true" />
                  <input
                    id="login-email"
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

              {/* Password Field */}
              <div className="form-field space-y-1.5">
                <FormLabel htmlFor="login-password" required>Kata Sandi</FormLabel>
                <div className="form-control-wrap">
                  <Lock className="form-leading-icon" aria-hidden="true" />
                  <input
                    id="login-password"
                    name="password"
                    autoComplete="current-password"
                    data-lpignore="true"
                    data-form-type="other"
                    type={showPassword ? "text" : "password"}
                    required
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

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="form-checkbox-label">
                  <input
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Ingat saya</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="form-link text-[#299a45] hover:text-[#217c37] transition-colors"
                >
                  Lupa kata sandi?
                </Link>
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
                {isPending ? "Memproses..." : "Masuk"}
              </button>

              </form>
            ) : (
              <div className="space-y-4" aria-hidden="true">
                <div className="h-[74px]" />
                <div className="h-[74px]" />
                <div className="h-5" />
                <div className="h-12" />
              </div>
            )}

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
                  className="form-button form-button--secondary w-full"
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
                className="form-link text-[#299a45] hover:text-[#217c37] transition-colors"
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
