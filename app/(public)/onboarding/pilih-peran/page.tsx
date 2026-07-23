"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FormFeedback } from "@/components/form-ui";
import pekerjaImage from "@/public/onboarding/roles/pekerja.png";
import supplierImage from "@/public/onboarding/roles/supplier.png";
import umkmImage from "@/public/onboarding/roles/umkm.png";
import {
  saveRoleAction,
  type OnboardingActionState,
} from "@/features/onboarding/actions";

const initialOnboardingState: OnboardingActionState = {
  status: "idle",
  message: "",
};

const ROLES = [
  {
    id: "umkm",
    label: "UMKM",
    desc: "Saya pemilik usaha kecil atau menengah dan ingin berkembang bersama komunitas.",
    image: umkmImage,
  },
  {
    id: "pekerja",
    label: "Pekerja",
    desc: "Saya mencari peluang kerja atau ingin terhubung dengan pelaku usaha.",
    image: pekerjaImage,
  },
  {
    id: "supplier",
    label: "Supplier",
    desc: "Saya menyediakan bahan baku atau produk dan ingin terhubung dengan pelaku usaha.",
    image: supplierImage,
  },

];

function StepDots({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-5" aria-hidden="true">
      {[1, 2, 3, 4].map((step) => (
        <span
          key={step}
          className={`h-3 w-3 rounded-full transition-colors ${
            step === currentStep ? "bg-[#11944f]" : "bg-[#dfeee4]"
          }`}
        />
      ))}
    </div>
  );
}

export default function PilihPeranPage() {
  const [state, formAction, isPending] = useActionState(
    saveRoleAction,
    initialOnboardingState,
  );
  const [selectedRole, setSelectedRole] = useState("umkm");

  return (
    <div className="form-page flex min-h-screen flex-col items-center justify-center bg-[#f8faf7] p-4 sm:p-6 lg:p-5">
      <form
        action={formAction}
        className="flex w-full max-w-4xl flex-col gap-5 rounded-[2rem] border border-[#e6eee9] bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8 lg:gap-6 lg:px-10 lg:py-7"
      >
        <input type="hidden" name="role" value={selectedRole} />

        <div className="space-y-1.5 text-center">
          <h1 className="form-title text-2xl font-bold tracking-tight text-[#10231d] sm:text-3xl">
            Pilih <span className="text-[#145c46]">Peran</span> Anda
          </h1>
          <p className="form-description text-sm text-[#6b7b75] leading-relaxed">
            Pilih peran yang paling sesuai dengan kebutuhan Anda
            <br className="hidden md:block" />
            untuk pengalaman terbaik di Pull.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:px-4" role="group" aria-label="Pilih peran Anda">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                aria-pressed={isSelected}
                className={`form-option relative grid min-h-28 grid-cols-[72px_minmax(0,1fr)_24px] items-center gap-3 rounded-2xl border bg-white p-3 text-left cursor-pointer transition-all duration-300 md:flex md:min-h-0 md:flex-col md:items-center md:gap-4 md:rounded-[24px] md:p-5 ${isSelected
                  ? "border-[#299a45] shadow-lg shadow-emerald-950/5 ring-1 ring-[#299a45]"
                  : "border-[#e6eee9] hover:border-[#a7c840] hover:shadow-md"
                  }`}
              >
                <div className="col-start-3 row-start-1 flex items-center justify-center md:absolute md:right-5 md:top-5">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${isSelected ? "border-[#145c46]" : "border-[#d6e4dc]"
                      }`}
                  >
                    {isSelected && (
                      <div className="h-3.5 w-3.5 rounded-full bg-[#145c46]" />
                    )}
                  </div>
                </div>

                <div className="relative col-start-1 row-start-1 h-20 w-[72px] overflow-hidden md:h-36 md:w-full lg:h-32">
                  <Image
                    src={role.image}
                    alt={role.label}
                    fill
                    sizes="(min-width: 1024px) 220px, (min-width: 768px) 30vw, 72px"
                    className="object-contain object-center md:object-bottom"
                    priority
                  />
                </div>

                <div className="col-start-2 row-start-1 min-w-0 space-y-1 text-left md:w-full md:space-y-1.5 md:text-center">
                  <h3 className="text-base font-bold leading-tight text-[#10231d] md:text-xl">
                    {role.label}
                  </h3>
                  <p className="text-xs font-medium leading-relaxed text-[#6b7b75] md:px-2">
                    {role.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {state.status === "error" && (
          <FormFeedback status="error" centered>
            {state.message}
          </FormFeedback>
        )}

        <div className="form-action-row flex items-center justify-between gap-4">
          <Link
            href="/onboarding"
            className="form-button form-button--secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <button
            type="submit"
            disabled={!selectedRole || isPending}
            className="form-button form-button--primary"
          >
            {isPending ? "Melanjutkan..." : "Lanjutkan"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <StepDots currentStep={2} />
      </form>
    </div>
  );
}
