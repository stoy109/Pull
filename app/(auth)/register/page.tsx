"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
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
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

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

        {/* Right Side: White Register Form */}
        <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-sm space-y-5 lg:space-y-6">

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-[#145c46]">
                Daftar Akun
              </h1>
              <p className="text-sm font-medium text-[#36544a]">
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#36544a]">
                  Nama Lengkap
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-5 h-5 text-[#91a79d]" />
                  <input
                    name="fullName"
                    autoComplete="name"
                    data-lpignore="true"
                    data-form-type="other"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="contoh: Budi Santoso"
                    className="h-12 w-full rounded-2xl border border-[#d6e4dc] bg-white pl-12 pr-4 text-sm text-[#10231d] outline-none transition-all placeholder:text-[#91a79d] focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10 lg:h-11"
                  />
                </div>
              </div>

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

              {/* Nomor Whatsapp Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#36544a]">
                  Nomor Whatsapp
                </label>
                <div className="flex h-12 w-full items-center overflow-hidden rounded-2xl border border-[#d6e4dc] bg-white transition-all focus-within:border-[#145c46] focus-within:ring-2 focus-within:ring-[#145c46]/10 lg:h-11">
                  <div className="flex items-center gap-1.5 px-3 h-full bg-[#f8faf7] border-r border-[#d6e4dc] select-none text-sm font-semibold text-[#10231d]">
                    <span>ID</span>
                    <span>+62</span>
                  </div>
                  <div className="relative flex items-center flex-1 h-full">
                    <FaWhatsapp className="absolute left-3.5 h-4.5 w-4.5 text-[#91a79d]" />
                    <input
                      name="phone"
                      autoComplete="tel"
                      data-lpignore="true"
                      data-form-type="other"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="81234567890"
                      className="w-full h-full pl-11 pr-3 bg-transparent text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none border-none"
                    />
                  </div>
                </div>
              </div>

              {/* Kata Sandi Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#36544a]">
                  Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-[#91a79d]" />
                  <input
                    name="password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
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

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-[#36544a] font-medium leading-tight">
                  <input
                    name="agreeTerms"
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[#d6e4dc] text-[#145c46] focus:ring-[#145c46]/20 accent-[#145c46] cursor-pointer"
                  />
                  <span>
                    Saya setuju dengan{" "}
                    <Link href="/terms" className="text-[#299a45] hover:text-[#217c37] transition-colors">
                      Syarat & Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link href="/privacy" className="text-[#299a45] hover:text-[#217c37] transition-colors">
                      Kebijakan Privasi
                    </Link>
                  </span>
                </label>
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
                className="mt-1 h-12 w-full rounded-2xl bg-[#145c46] text-sm font-semibold text-white shadow-md shadow-emerald-950/20 transition-all duration-150 hover:bg-[#104a38] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 lg:h-11"
              >
                {isPending ? "Mendaftarkan..." : "Daftar"}
              </button>

            </form>

            {/* Footer Links */}
            <div className="pt-1 text-center text-xs font-semibold text-[#36544a]">
              Sudah punya akun?{" "}
              <Link
                href="/"
                className="text-[#299a45] hover:text-[#217c37] transition-colors"
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
