"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export default function ResetSuccessPage() {
  const [iconVisible, setIconVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const iconTimer = setTimeout(() => setIconVisible(true), 100);
    const contentTimer = setTimeout(() => setContentVisible(true), 350);

    return () => {
      clearTimeout(iconTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      <div
        className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#e6eee9] bg-white sm:rounded-[2.25rem] lg:flex-row lg:min-h-[520px]"
        style={{
          boxShadow:
            "0 24px 60px rgba(20,92,70,0.10), 0 4px 16px rgba(20,92,70,0.05)",
        }}
      >
        <div
          className="relative hidden items-center justify-center border-r border-[#e6eee9] bg-gradient-to-br from-[#f0f9f4] to-[#e4f2e9] lg:flex lg:w-1/2"
          style={{ boxShadow: "inset -1px 0 0 #e6eee9" }}
        >
          <Image
            src="/auth/login-bg.png"
            alt="Kata sandi berhasil diperbarui"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            style={{ filter: "drop-shadow(0 8px 24px rgba(20,92,70,0.12))" }}
          />
        </div>

        <div className="flex flex-col items-center justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="flex w-full max-w-[320px] flex-col items-center gap-6 text-center">
            <div
              className={`relative flex items-center justify-center transition-all duration-700 ease-out ${
                iconVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
            >
              <div
                className="absolute w-28 h-28 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(41,154,69,0.15) 0%, rgba(41,154,69,0) 70%)",
                }}
              />

              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle at 40% 35%, #eef8f2, #d4edda)",
                }}
              >
                <div
                  className="w-[60px] h-[60px] rounded-full bg-[#145c46] flex items-center justify-center shadow-lg"
                  style={{ boxShadow: "0 8px 24px rgba(20,92,70,0.35)" }}
                >
                  <Check className="w-7 h-7 text-white stroke-[3px]" />
                </div>
              </div>
            </div>

            <div
              className={`space-y-3 transition-all duration-600 delay-100 ease-out ${
                contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <h1 className="text-[2rem] font-bold text-[#10231d] tracking-tight leading-none">
                Berhasil!
              </h1>
              <p className="text-sm text-[#36544a] leading-relaxed font-medium">
                Kata sandi Anda telah berhasil diperbarui. Anda sekarang dapat masuk dengan kata sandi baru.
              </p>
            </div>

            <div
              className={`w-full transition-all duration-600 delay-300 ease-out ${
                contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Link
                href="/"
                className="group flex h-12 w-full items-center justify-center gap-2.5 rounded-[14px] bg-[#145c46] text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:bg-[#0f4a37] active:scale-[0.98] lg:h-11"
                style={{ boxShadow: "0 8px 24px rgba(20,92,70,0.25)" }}
              >
                Masuk ke Akun
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
