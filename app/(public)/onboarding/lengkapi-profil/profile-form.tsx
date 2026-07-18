"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  MapPin,
  Store,
  Tag,
  User,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  saveProfileAction,
  type OnboardingActionState,
} from "@/features/onboarding/actions";

const initialOnboardingState: OnboardingActionState = {
  status: "idle",
  message: "",
};

const STEPS = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Choose Role" },
  { id: 3, label: "Complete Profile" },
];

const BUSINESS_CATEGORIES = [
  "Makanan dan Minuman",
  "Fashion",
  "Kerajinan",
  "Jasa",
  "Retail",
  "Lainnya",
];

type CompleteProfileFormProps = {
  defaultDisplayName: string;
  defaultPhone: string;
  role: string;
};

function Stepper() {
  const currentStep = 3;

  return (
    <div className="mx-auto flex w-full max-w-4xl items-center justify-center gap-1 md:gap-2">
      {STEPS.map((step, index) => {
        const isDone = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div key={step.id} className="flex min-w-0 flex-1 items-center last:flex-none">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${isDone
                    ? "bg-[#6abd45] text-white"
                    : isActive
                      ? "bg-[#05723c] text-white"
                      : "bg-[#e8f4e9] text-[#65a46e]"
                  }`}
              >
                {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : step.id}
              </div>
              <span
                className={`hidden truncate text-xs font-semibold md:block ${isActive ? "text-[#10231d]" : "text-[#6b7b75]"
                  }`}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div className="mx-3 h-px flex-1 border-t border-dashed border-[#d6e4dc]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef8f2] text-[#05723c]">
      {children}
    </div>
  );
}

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
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const isWorker = role === "pekerja";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      <form
        action={formAction}
        className="w-full max-w-6xl rounded-[1.75rem] border border-[#e6eee9] bg-white px-5 py-6 shadow-xl shadow-emerald-950/5 sm:px-7 sm:py-7 lg:px-10 lg:py-6"
      >
        <input type="hidden" name="role" value={role} />

        <Stepper />

        <div className="mt-4 text-center lg:mt-3">
          <h1 className="text-xl font-extrabold leading-tight tracking-normal text-[#10231d] sm:text-2xl lg:text-xl">
            Complete <span className="text-[#05723c]">Profile</span>
          </h1>
          <p className="mx-auto mt-1 max-w-sm text-[11px] font-medium leading-relaxed text-[#6b7b75] sm:text-xs lg:text-[11px]">
            Lengkapi informasi profil Anda agar pengalaman menggunakan Pull lebih optimal.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className="flex justify-center lg:justify-start">
            <div className="flex min-h-[280px] w-full max-w-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#5bbf82] bg-white px-6 text-center lg:min-h-[384px]">
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#eaf6e8] lg:h-24 lg:w-24">
                  <Image
                    src="/onboarding/Profile(UMKM).png"
                    alt="Placeholder foto profil usaha"
                    width={120}
                    height={120}
                    className="h-24 w-24 object-contain lg:h-20 lg:w-20"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#05723c] text-white shadow-lg shadow-emerald-950/20 lg:h-10 lg:w-10">
                  <Camera className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm font-bold text-[#10231d]">
                Foto Profil Usaha
              </p>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-[#6b7b75]">
                JPG, PNG maks. 2MB
              </p>
              <p className="mt-3 text-xs font-medium leading-relaxed text-[#6b7b75]">
                Klik ikon kamera untuk upload foto profil usaha Anda
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3">
              <div className="grid grid-cols-[36px_1fr] items-end gap-3">
                <FieldIcon>
                  <User className="h-5 w-5" />
                </FieldIcon>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-[#10231d]">
                    Nama Lengkap
                  </span>
                  <input
                    name="displayName"
                    type="text"
                    required
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="h-12 w-full rounded-xl border border-[#d6e4dc] bg-white px-4 text-sm text-[#10231d] outline-none transition-all placeholder:text-[#91a79d] focus:border-[#05723c] focus:ring-2 focus:ring-[#05723c]/10 lg:h-11"
                  />
                </label>
              </div>

              <div className="grid grid-cols-[36px_1fr] items-end gap-3">
                <FieldIcon>
                  <Store className="h-5 w-5" />
                </FieldIcon>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-[#10231d]">
                    {isWorker ? "Nama Tampilan" : "Nama Usaha"}
                  </span>
                  <input
                    name="businessName"
                    type="text"
                    required
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder={
                      isWorker
                        ? "Masukkan nama tampilan Anda"
                        : "Masukkan nama usaha Anda"
                    }
                    className="h-12 w-full rounded-xl border border-[#d6e4dc] bg-white px-4 text-sm text-[#10231d] outline-none transition-all placeholder:text-[#91a79d] focus:border-[#05723c] focus:ring-2 focus:ring-[#05723c]/10 lg:h-11"
                  />
                </label>
              </div>

              <div className="grid grid-cols-[36px_1fr] items-end gap-3">
                <FieldIcon>
                  <Tag className="h-5 w-5" />
                </FieldIcon>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-[#10231d]">
                    {isWorker ? "Keahlian Utama" : "Kategori Usaha"}
                  </span>
                  <div className="relative">
                    <select
                      name="headline"
                      required
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-[#d6e4dc] bg-white px-4 pr-11 text-sm text-[#10231d] outline-none transition-all focus:border-[#05723c] focus:ring-2 focus:ring-[#05723c]/10 lg:h-11"
                    >
                      <option value="">
                        {isWorker
                          ? "Pilih keahlian utama Anda"
                          : "Pilih kategori usaha Anda"}
                      </option>
                      {BUSINESS_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#10231d]" />
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-[36px_1fr] items-end gap-3">
                <FieldIcon>
                  <MapPin className="h-5 w-5" />
                </FieldIcon>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-[#10231d]">
                    {isWorker ? "Lokasi" : "Lokasi Usaha"}
                  </span>
                  <input
                    name="location"
                    type="text"
                    required
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder={
                      isWorker
                        ? "Masukkan lokasi Anda"
                        : "Masukkan lokasi usaha Anda"
                    }
                    className="h-12 w-full rounded-xl border border-[#d6e4dc] bg-white px-4 text-sm text-[#10231d] outline-none transition-all placeholder:text-[#91a79d] focus:border-[#05723c] focus:ring-2 focus:ring-[#05723c]/10 lg:h-11"
                  />
                </label>
              </div>

              <div className="grid grid-cols-[36px_1fr] items-end gap-3">
                <FieldIcon>
                  <FaWhatsapp className="h-5 w-5" />
                </FieldIcon>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-[#10231d]">
                    Nomor WhatsApp
                  </span>
                  <div className="grid grid-cols-[92px_1fr] gap-3">
                    <select
                      name="phoneCountry"
                      defaultValue="+62"
                      className="h-12 rounded-xl border border-[#d6e4dc] bg-white px-3 text-sm font-semibold text-[#10231d] outline-none transition-all focus:border-[#05723c] focus:ring-2 focus:ring-[#05723c]/10 lg:h-11"
                    >
                      <option value="+62">+62</option>
                    </select>
                    <input
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Masukkan nomor WhatsApp Anda"
                      className="h-12 min-w-0 rounded-xl border border-[#d6e4dc] bg-white px-4 text-sm text-[#10231d] outline-none transition-all placeholder:text-[#91a79d] focus:border-[#05723c] focus:ring-2 focus:ring-[#05723c]/10 lg:h-11"
                    />
                  </div>
                </label>
              </div>
            </div>

            {state.status === "error" && (
              <p
                role="alert"
                className="rounded-2xl border border-[#f7c8d3] bg-[#fce8ed] px-4 py-3 text-center text-xs font-semibold text-[#921932]"
              >
                {state.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <Link
            href="/onboarding/pilih-peran"
            className="inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-[#d6e4dc] bg-white px-5 text-sm font-semibold text-[#36544a] transition-all hover:bg-[#f4f8f5] lg:h-11"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#05723c] px-6 text-sm font-semibold text-white shadow-md shadow-emerald-950/20 transition-all hover:bg-[#045f32] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 lg:h-11"
          >
            {isPending ? "Menyimpan..." : "Lanjutkan"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
