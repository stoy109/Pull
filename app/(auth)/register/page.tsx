"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-4 md:p-8">
      {/* Outer Card Container */}
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-emerald-950/5 border border-[#e6eee9] flex-col md:flex-row min-h-[640px]">

        {/* Left Side: Illustration Image (reusing the same image) */}
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

        {/* Right Side: White Register Form */}
        <div className="flex flex-col justify-center bg-white p-8 md:w-1/2 md:p-12">
          <div className="w-full max-w-sm mx-auto space-y-8">

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
                    className="w-full h-11 pl-12 pr-4 rounded-2xl border border-[#d6e4dc] bg-white text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
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
                    className="w-full h-11 pl-12 pr-4 rounded-2xl border border-[#d6e4dc] bg-white text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
                  />
                </div>
              </div>

              {/* Nomor Whatsapp Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#36544a]">
                  Nomor Whatsapp
                </label>
                <div className="flex items-center w-full h-11 rounded-2xl border border-[#d6e4dc] bg-white overflow-hidden transition-all focus-within:border-[#145c46] focus-within:ring-2 focus-within:ring-[#145c46]/10">
                  <div className="flex items-center gap-1.5 px-3 h-full bg-[#f8faf7] border-r border-[#d6e4dc] select-none text-sm font-semibold text-[#10231d]">
                    <span>ID</span>
                    <span>+62</span>
                  </div>
                  <div className="relative flex items-center flex-1 h-full">
                    <Phone className="absolute left-3.5 w-4.5 h-4.5 text-[#91a79d]" />
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
                    className="w-full h-11 pl-12 pr-12 rounded-2xl border border-[#d6e4dc] bg-white text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
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
                className="w-full h-12 mt-2 rounded-2xl bg-[#145c46] text-white font-semibold text-sm shadow-md shadow-emerald-950/20 hover:bg-[#104a38] active:scale-[0.99] transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Mendaftarkan..." : "Daftar"}
              </button>

            </form>

            {/* Footer Links */}
            <div className="text-center text-xs font-semibold text-[#36544a] pt-2">
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
