"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { updatePasswordAction, type AuthActionState } from "@/features/auth/actions";

const initialAuthState: AuthActionState = {
  status: "idle",
  message: "",
};

const REQUIREMENTS = [
  { id: "length", label: "Minimal 8 karakter", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "Huruf besar (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "Huruf kecil (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "Angka (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { id: "special", label: "Karakter khusus (!@#$%)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH_MAP = [
  { label: "", color: "text-[#91a79d]", bar: "bg-[#e6eee9]", width: "0%" },
  { label: "Sangat Lemah", color: "text-[#B61F3E]", bar: "bg-[#B61F3E]", width: "16%" },
  { label: "Lemah", color: "text-[#EC8E3B]", bar: "bg-[#EC8E3B]", width: "32%" },
  { label: "Sedang", color: "text-[#EDC113]", bar: "bg-[#EDC113]", width: "56%" },
  { label: "Kuat", color: "text-[#299a45]", bar: "bg-[#299a45]", width: "80%" },
  { label: "Sangat Kuat", color: "text-[#145c46]", bar: "bg-[#145c46]", width: "100%" },
];

function getScore(password: string): number {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialAuthState,
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const score = useMemo(() => getScore(password), [password]);
  const strength = STRENGTH_MAP[score];
  const reqs = useMemo(
    () => REQUIREMENTS.map((requirement) => ({
      ...requirement,
      met: requirement.test(password),
    })),
    [password],
  );
  const allMet = reqs.every((requirement) => requirement.met);
  const isMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isReady = allMet && isMatch;
  const inputBase =
    "w-full h-[56px] pl-4 pr-12 rounded-[14px] border bg-white text-sm text-[#10231d] placeholder:text-[#b8ccc5] outline-none transition-all duration-200";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-4 md:p-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-emerald-950/8 border border-[#e6eee9] flex-col md:flex-row min-h-[640px]">
        <div className="relative hidden md:flex md:w-1/2 bg-gradient-to-br from-[#f0f9f4] to-[#e8f5ec] items-center justify-center border-r border-[#e6eee9]">
          <Image
            src="/auth/login-bg.png"
            alt="Buat Kata Sandi Baru"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover drop-shadow-sm"
          />
        </div>

        <div className="flex flex-col justify-center bg-white p-8 md:w-1/2 md:p-12">
          <div className="w-full max-w-sm mx-auto space-y-7">
            <div className="space-y-1.5">
              <h1 className="text-[1.75rem] font-bold tracking-tight text-[#10231d] leading-snug">
                Buat Kata Sandi Baru
              </h1>
              <p className="text-sm text-[#6b7b75] leading-relaxed">
                Masukkan kata sandi baru yang kuat dan aman untuk melindungi akun Anda.
              </p>
              <p className="text-xs text-[#91a79d]">
                Gunakan kata sandi yang belum pernah digunakan sebelumnya.
              </p>
            </div>

            <form
              action={formAction}
              className="space-y-5"
              data-lpignore="true"
              data-form-type="other"
            >
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-[#36544a]">
                  Kata Sandi Baru
                </label>

                <div className="relative">
                  <input
                    name="password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="**********"
                    aria-label="Kata sandi baru"
                    className={`${inputBase} ${
                      password.length > 0
                        ? allMet
                          ? "border-[#299a45] focus:border-[#299a45] focus:ring-2 focus:ring-[#299a45]/10"
                          : "border-[#d6e4dc] focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
                        : "border-[#d6e4dc] focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#91a79d] hover:text-[#36544a] transition-colors duration-150"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-[#e6eee9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${strength.bar}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="text-xs text-[#6b7b75]">
                      Kekuatan Kata Sandi:{" "}
                      <span className={`font-bold ${strength.color}`}>
                        {strength.label}
                      </span>
                    </p>
                  </div>
                )}

                {password.length > 0 && (
                  <ul className="grid grid-cols-1 gap-1 pt-1">
                    {reqs.map((requirement) => (
                      <li
                        key={requirement.id}
                        className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                          requirement.met ? "text-[#299a45]" : "text-[#91a79d]"
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                            requirement.met
                              ? "bg-[#299a45] text-white scale-100"
                              : "bg-[#e6eee9] text-[#b8ccc5] scale-90"
                          }`}
                        >
                          {requirement.met && <Check className="w-3 h-3" />}
                        </span>
                        {requirement.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#36544a]">
                  Konfirmasi Kata Sandi Baru
                </label>

                <div className="relative">
                  <input
                    name="confirmPassword"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="**********"
                    aria-label="Konfirmasi kata sandi"
                    className={`${inputBase} ${
                      confirmPassword.length > 0
                        ? isMatch
                          ? "border-[#299a45] focus:border-[#299a45] focus:ring-2 focus:ring-[#299a45]/10"
                          : "border-[#B61F3E] focus:border-[#B61F3E] focus:ring-2 focus:ring-[#B61F3E]/10"
                        : "border-[#d6e4dc] focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((value) => !value)}
                    aria-label={showConfirm ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#91a79d] hover:text-[#36544a] transition-colors duration-150"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <p
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-200 ${
                      isMatch ? "text-[#299a45]" : "text-[#B61F3E]"
                    }`}
                  >
                    {isMatch ? (
                      <Check className="w-4 h-4 text-[#299a45]" />
                    ) : (
                      <X className="w-4 h-4 text-[#B61F3E]" />
                    )}
                    {isMatch ? "Kata sandi cocok" : "Kata sandi tidak sama"}
                  </p>
                )}
              </div>

              {state.status === "error" && (
                <p
                  role="alert"
                  className="rounded-2xl border border-[#f7c8d3] bg-[#fce8ed] px-4 py-3 text-xs font-semibold text-[#921932]"
                >
                  {state.message}
                </p>
              )}

              <button
                type="submit"
                disabled={!isReady || isPending}
                className={`w-full h-[52px] rounded-[14px] font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer mt-1 ${
                  isReady && !isPending
                    ? "bg-[#145c46] text-white shadow-lg shadow-emerald-950/20 hover:bg-[#0f4a37] active:scale-[0.985] hover:shadow-xl hover:shadow-emerald-950/25"
                    : "bg-[#e6eee9] text-[#91a79d] cursor-not-allowed"
                }`}
              >
                {isPending ? "Memperbarui..." : "Perbarui Kata Sandi"}
              </button>
            </form>

            <p className="text-center text-xs text-[#91a79d]">
              Sudah ingat kata sandi?{" "}
              <Link
                href="/"
                className="text-[#299a45] hover:text-[#217c37] font-semibold transition-colors duration-150"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
