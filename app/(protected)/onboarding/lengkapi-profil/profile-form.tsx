"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, MapPin, Sparkles, User } from "lucide-react";
import {
  saveProfileAction,
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

type CompleteProfileFormProps = {
  defaultDisplayName: string;
  defaultPhone: string;
  role: string;
};

export function CompleteProfileForm({
  defaultDisplayName,
  defaultPhone,
  role,
}: CompleteProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveProfileAction,
    initialOnboardingState,
  );
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [location, setLocation] = useState("");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const currentStep = 3;
  const isWorker = role === "pekerja";

  return (
    <div className="min-h-screen bg-[#f8faf7] flex flex-col items-center justify-center p-6 md:p-10">
      <form
        action={formAction}
        className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-xl shadow-emerald-950/5 border border-[#e6eee9] p-8 md:p-12 flex flex-col gap-8"
      >
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((step, index) => {
            const isDone = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5 w-24">
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

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#10231d]">
            Lengkapi <span className="text-[#145c46]">Profil</span>
          </h1>
          <p className="text-sm text-[#6b7b75] leading-relaxed">
            {isWorker
              ? "Tulis ringkasan singkat agar UMKM bisa mengenali keahlian Anda."
              : "Tulis ringkasan singkat agar komunitas bisa mengenali usaha Anda."}
          </p>
        </div>

        <div className="grid gap-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#36544a]">
              {isWorker ? "Nama Tampilan" : "Nama Usaha / Nama Tampilan"}
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-4 w-5 h-5 text-[#91a79d]" />
              <input
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={isWorker ? "contoh: Budi Santoso" : "contoh: Kopi Maju Jaya"}
                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[#d6e4dc] bg-white text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#36544a]">
              Lokasi
            </label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-4 w-5 h-5 text-[#91a79d]" />
              <input
                name="location"
                type="text"
                required
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="contoh: Bandung, Jawa Barat"
                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[#d6e4dc] bg-white text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#36544a]">
              {isWorker ? "Keahlian Utama" : "Kategori Usaha"}
            </label>
            <div className="relative flex items-center">
              <Sparkles className="absolute left-4 w-5 h-5 text-[#91a79d]" />
              <input
                name="headline"
                type="text"
                required
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder={isWorker ? "contoh: Barista, kasir, operasional" : "contoh: Makanan dan minuman"}
                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[#d6e4dc] bg-white text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#36544a]">
              Tentang Singkat
            </label>
            <textarea
              name="about"
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              placeholder={
                isWorker
                  ? "Ceritakan pengalaman dan jenis peluang kerja yang Anda cari."
                  : "Ceritakan produk, kebutuhan, atau peluang kolaborasi usaha Anda."
              }
              className="min-h-28 w-full resize-none rounded-2xl border border-[#d6e4dc] bg-white px-4 py-3 text-sm text-[#10231d] placeholder:text-[#91a79d] outline-none transition-all focus:border-[#145c46] focus:ring-2 focus:ring-[#145c46]/10"
            />
          </div>

          {defaultPhone && (
            <p className="rounded-2xl border border-[#e6eee9] bg-[#f8faf7] px-4 py-3 text-xs font-semibold text-[#6b7b75]">
              Nomor WhatsApp tersimpan: +{defaultPhone}
            </p>
          )}
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
            href="/onboarding/pilih-peran"
            className="inline-flex items-center gap-2 h-[48px] px-6 rounded-2xl border-2 border-[#d6e4dc] bg-white text-sm font-semibold text-[#36544a] hover:bg-[#f4f8f5] transition-all duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 h-[48px] px-8 rounded-2xl bg-[#145c46] text-white text-sm font-semibold shadow-md shadow-emerald-950/20 hover:bg-[#104a38] active:scale-[0.99] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Menyimpan..." : "Selesai"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
