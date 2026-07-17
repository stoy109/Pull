"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

// ─── Step config (shared across onboarding) ───────────────────────────────────
const STEPS = [
  { id: 1, label: "Selamat Datang" },
  { id: 2, label: "Pilih Peran" },
  { id: 3, label: "Lengkapi Profil" },
];

// ─── Role options ─────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "umkm",
    label: "UMKM",
    desc: "Saya pemilik usaha kecil atau menengah dan ingin berkembang bersama komunitas.",
    image: "/landing/UMKM(Role).png",
  },
  {
    id: "pekerja",
    label: "Pekerja",
    desc: "Saya mencari peluang kerja atau ingin terhubung dengan pelaku usaha.",
    image: "/landing/Pekerja(Role).png",
  },
];

export default function PilihPeranPage() {
  const [selectedRole, setSelectedRole] = useState<string>("umkm");
  const router = useRouter();
  const currentStep = 2;

  return (
    <div className="min-h-screen bg-[#f8faf7] flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-xl shadow-emerald-950/5 border border-[#e6eee9] p-8 md:p-12 flex flex-col gap-8">

        {/* ── Step Indicator ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((step, index) => {
            const isDone = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step node */}
                <div className="flex flex-col items-center gap-1.5 w-24">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${isDone
                      ? "bg-[#A7C840] border-[#A7C840] text-white"
                      : isActive
                        ? "bg-[#145c46] border-[#145c46] text-white"
                        : "bg-white border-[#d6e4dc] text-[#91a79d]"
                      }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <span>{step.id}</span>}
                  </div>
                  <span
                    className={`text-[11px] font-semibold text-center leading-tight transition-colors duration-300 ${isActive ? "text-[#145c46]" : isDone ? "text-[#A7C840]" : "text-[#91a79d]"
                      }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div className="w-12 h-[2px] -mt-5 flex-shrink-0 rounded-full overflow-hidden bg-[#e6eee9]">
                    <div
                      className="h-full bg-[#A7C840] transition-all duration-500"
                      style={{ width: step.id < currentStep ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#10231d]">
            Pilih <span className="text-[#145c46]">Peran</span> Anda
          </h1>
          <p className="text-sm text-[#6b7b75] leading-relaxed">
            Pilih peran yang paling sesuai dengan kebutuhan Anda<br className="hidden md:block" />
            untuk pengalaman terbaik di Pull.
          </p>
        </div>

        {/* ── Role Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-8">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`relative flex flex-col items-center gap-6 p-7 rounded-[28px] border bg-white transition-all duration-300 cursor-pointer ${isSelected
                  ? "border-[#299a45] shadow-lg shadow-emerald-950/5 ring-1 ring-[#299a45]"
                  : "border-[#e6eee9] hover:border-[#a7c840] hover:shadow-md"
                  }`}
              >
                {/* Radio indicator (top-right) */}
                <div className="absolute top-5 right-5">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                      ? "border-[#145c46]"
                      : "border-[#d6e4dc]"
                      }`}
                  >
                    {isSelected && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#145c46]" />
                    )}
                  </div>
                </div>

                {/* Illustration Image (No background borders, natural fit) */}
                <div className="w-full h-[180px] flex items-end justify-center overflow-hidden">
                  <img
                    src={role.image}
                    alt={role.label}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Label & Desc */}
                <div className="w-full text-center space-y-2">
                  <h3 className="font-bold text-2xl text-[#10231d] tracking-tight">
                    {role.label}
                  </h3>
                  <p className="text-xs text-[#6b7b75] leading-relaxed px-2 font-medium">
                    {role.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Navigation Buttons ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="inline-flex items-center gap-2 h-[48px] px-6 rounded-2xl border-2 border-[#d6e4dc] bg-white text-sm font-semibold text-[#36544a] hover:bg-[#f4f8f5] transition-all duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

          {/* Next button */}
          <button
            type="button"
            onClick={() => router.push("/onboarding/lengkapi-profil")}
            disabled={!selectedRole}
            className="inline-flex items-center gap-2 h-[48px] px-8 rounded-2xl bg-[#145c46] text-white text-sm font-semibold shadow-md shadow-emerald-950/20 hover:bg-[#104a38] active:scale-[0.99] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lanjutkan
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
