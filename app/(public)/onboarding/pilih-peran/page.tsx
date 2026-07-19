"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  saveRoleAction,
  type OnboardingActionState,
} from "@/features/onboarding/actions";

const initialOnboardingState: OnboardingActionState = {
  status: "idle",
  message: "",
};

const STEPS = [
  { id: 1, label: "Selamat Datang" },
  { id: 2, label: "Pilih Peran" },
  { id: 3, label: "Lengkapi Profil" },
];

const ROLES = [
  {
    id: "umkm",
    label: "UMKM",
    desc: "Saya pemilik usaha kecil atau menengah dan ingin berkembang bersama komunitas.",
    image: "/onboarding/roles/umkm.png",
  },
  {
    id: "pekerja",
    label: "Pekerja",
    desc: "Saya mencari peluang kerja atau ingin terhubung dengan pelaku usaha.",
    image: "/onboarding/roles/pekerja.png",
  },
];

export default function PilihPeranPage() {
  const [state, formAction, isPending] = useActionState(
    saveRoleAction,
    initialOnboardingState,
  );
  const [selectedRole, setSelectedRole] = useState("umkm");
  const currentStep = 2;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8faf7] p-4 sm:p-6 lg:p-5">
      <form
        action={formAction}
        className="flex w-full max-w-3xl flex-col gap-5 rounded-[2rem] border border-[#e6eee9] bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8 lg:gap-6 lg:px-10 lg:py-7"
      >
        <input type="hidden" name="role" value={selectedRole} />

        <div className="flex items-center justify-center gap-0">
          {STEPS.map((step, index) => {
            const isDone = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
                <div key={step.id} className="flex items-center">
                <div className="flex w-20 flex-col items-center gap-1.5 sm:w-24">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                      isDone
                        ? "bg-[#A7C840] border-[#A7C840] text-white"
                        : isActive
                          ? "bg-[#145c46] border-[#145c46] text-white"
                          : "bg-white border-[#d6e4dc] text-[#91a79d]"
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold text-center leading-tight transition-colors duration-300 ${
                      isActive
                        ? "text-[#145c46]"
                        : isDone
                          ? "text-[#A7C840]"
                          : "text-[#91a79d]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="h-[2px] w-8 shrink-0 -mt-5 overflow-hidden rounded-full bg-[#e6eee9] sm:w-12">
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

        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#10231d] sm:text-3xl">
            Pilih <span className="text-[#145c46]">Peran</span> Anda
          </h1>
          <p className="text-sm text-[#6b7b75] leading-relaxed">
            Pilih peran yang paling sesuai dengan kebutuhan Anda
            <br className="hidden md:block" />
            untuk pengalaman terbaik di Pull.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:px-4">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`relative flex flex-col items-center gap-4 rounded-[24px] border bg-white p-5 transition-all duration-300 ${
                  isSelected
                    ? "border-[#299a45] shadow-lg shadow-emerald-950/5 ring-1 ring-[#299a45]"
                    : "border-[#e6eee9] hover:border-[#a7c840] hover:shadow-md"
                }`}
              >
                <div className="absolute top-5 right-5">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected ? "border-[#145c46]" : "border-[#d6e4dc]"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#145c46]" />
                    )}
                  </div>
                </div>

                <div className="flex h-36 w-full items-end justify-center overflow-hidden lg:h-32">
                  <Image
                    src={role.image}
                    alt={role.label}
                    width={220}
                    height={144}
                    sizes="(min-width: 1024px) 220px, 70vw"
                    className="max-w-full max-h-full object-contain"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>

                <div className="w-full space-y-1.5 text-center">
                  <h3 className="text-xl font-bold tracking-tight text-[#10231d] sm:text-2xl">
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

        {state.status === "error" && (
          <p
            role="alert"
            className="rounded-2xl border border-[#f7c8d3] bg-[#fce8ed] px-4 py-3 text-center text-xs font-semibold text-[#921932]"
          >
            {state.message}
          </p>
        )}

        <div className="flex items-center justify-between gap-4">
          <Link
            href="/onboarding"
            className="inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-[#d6e4dc] bg-white px-5 text-sm font-semibold text-[#36544a] transition-all duration-150 hover:bg-[#f4f8f5] lg:h-11"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <button
            type="submit"
            disabled={!selectedRole || isPending}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#145c46] px-6 text-sm font-semibold text-white shadow-md shadow-emerald-950/20 transition-all duration-150 hover:bg-[#104a38] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 lg:h-11"
          >
            {isPending ? "Menyimpan..." : "Lanjutkan"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
