"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  MapPin,
  Store,
  Tag,
  User,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { FormFeedback, FormHelper, FormLabel } from "@/components/form-ui";

import { SkillPicker } from "@/components/skill-picker";
import { WORKER_JOB_FIELDS } from "@/lib/worker-profile-options";
import {
  saveProfileAction,
  type OnboardingActionState,
} from "@/features/onboarding/actions";

const initialOnboardingState: OnboardingActionState = {
  status: "idle",
  message: "",
};

const BUSINESS_CATEGORIES = [
  "Makanan dan Minuman",
  "Fashion",
  "Kerajinan",
  "Jasa",
  "Retail",
  "Lainnya",
];



const SUPPLIER_PRODUCT_CATEGORIES = [
  "Bahan Baku Makanan",
  "Produk Pertanian",
  "Tekstil & Kain",
  "Kemasan",
  "Peralatan Usaha",
  "Kerajinan",
  "Bahan Bangunan",
  "Lainnya",
];

type CompleteProfileFormProps = {
  defaultDisplayName?: string;
  defaultBusinessName?: string;
  defaultHeadline?: string;
  defaultDeliveryArea?: string;
  defaultPhone?: string;
  defaultSkills?: string[];
  role?: string;
};

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

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="form-field-icon mt-6" aria-hidden="true">
      {children}
    </div>
  );
}

function ensureString(value: string | undefined) {
  return typeof value === "string" ? value : "";
}

export function CompleteProfileForm({
  defaultDisplayName,
  defaultBusinessName,
  defaultHeadline,
  defaultDeliveryArea,
  defaultPhone,
  defaultSkills = [],
  role,
}: CompleteProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveProfileAction,
    initialOnboardingState,
  );
  const normalizedRole = role ?? "umkm";
  const isWorker = normalizedRole === "pekerja";
  const isSupplier = normalizedRole === "supplier";
  const [displayName, setDisplayName] = useState(() =>
    ensureString(defaultDisplayName),
  );
  const [businessName, setBusinessName] = useState(() =>
    ensureString(defaultBusinessName),
  );
  const [category, setCategory] = useState(() => ensureString(defaultHeadline));
  const [deliveryArea, setDeliveryArea] = useState(() =>
    ensureString(defaultDeliveryArea),
  );
  const [skills, setSkills] = useState(() => defaultSkills);
  const [phone, setPhone] = useState(() =>
    ensureString(defaultPhone).replace(/^\+?62\s?/, "").replace(/\D/g, ""),
  );
  const phoneDigits = phone.replace(/^0+/, "").replace(/\D/g, "");
  const phoneValue = phoneDigits ? `+62${phoneDigits}` : "";
  const categoryOptions = isWorker
    ? WORKER_JOB_FIELDS
    : isSupplier
      ? SUPPLIER_PRODUCT_CATEGORIES
      : BUSINESS_CATEGORIES;

  return (
    <div className="form-page profile-form-page flex min-h-screen justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      <form
        action={formAction}
        className="profile-form-card w-full max-w-2xl rounded-[1.75rem] border border-[#e6eee9] bg-white px-5 py-5 shadow-xl shadow-emerald-950/5 sm:px-6 sm:py-6 lg:px-7 lg:py-5"
      >
        <input type="hidden" name="role" value={normalizedRole} />
        {isWorker && <input type="hidden" name="businessName" value={displayName} />}
        {!isSupplier && <input type="hidden" name="deliveryArea" value="" />}
        <input type="hidden" name="phone" value={phoneValue} />

        <div className="text-center">
          <h1 className="form-title text-xl font-extrabold leading-tight tracking-normal text-[#10231d] sm:text-2xl lg:text-xl">
            Lengkapi <span className="text-[#05723c]">Profil</span>
          </h1>
          <p className="form-description mx-auto mt-1 max-w-sm text-[11px] font-medium leading-relaxed text-[#6b7b75] sm:text-xs lg:text-[11px]">
            Lengkapi informasi profil Anda agar pengalaman menggunakan Pull lebih optimal.
          </p>
        </div>

        <div className="profile-form-content mx-auto mt-5 w-full max-w-xl">
          <div className="grid gap-3">
            <div className="profile-form-fields grid gap-3.5">
              <div className="grid grid-cols-[36px_1fr] items-start gap-3">
                <FieldIcon>
                  <User className="h-5 w-5" />
                </FieldIcon>
                <div className="form-field">
                  <FormLabel htmlFor="profile-display-name" required>
                    {isWorker
                      ? "Nama Lengkap"
                      : isSupplier
                        ? "Nama Penanggung Jawab"
                        : "Nama Pemilik"}
                  </FormLabel>
                  <input
                    id="profile-display-name"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    required
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder={
                      isSupplier
                        ? "Masukkan nama penanggung jawab"
                        : "Masukkan nama lengkap Anda"
                    }
                    aria-describedby={isWorker ? "profile-name-helper" : undefined}
                    className="form-control"
                  />
                  {isWorker && (
                    <FormHelper id="profile-name-helper">
                      Nama yang akan tampil di profil dan sertifikat kerja.
                    </FormHelper>
                  )}
                </div>
              </div>

              {!isWorker && (
                <div className="grid grid-cols-[36px_1fr] items-start gap-3">
                  <FieldIcon>
                    <Store className="h-5 w-5" />
                  </FieldIcon>
                  <div className="form-field">
                    <FormLabel htmlFor="profile-business-name" required>
                      {isSupplier ? "Nama Perusahaan / Toko" : "Nama Usaha"}
                    </FormLabel>
                    <input
                      id="profile-business-name"
                      name="businessName"
                      type="text"
                      autoComplete="organization"
                      required
                      value={businessName}
                      onChange={(event) => setBusinessName(event.target.value)}
                      placeholder={
                        isSupplier
                          ? "Masukkan nama perusahaan atau toko"
                          : "Masukkan nama usaha Anda"
                      }
                      className="form-control"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-[36px_1fr] items-start gap-3">
                <FieldIcon>
                  <Tag className="h-5 w-5" />
                </FieldIcon>
                <div className="form-field">
                  <FormLabel htmlFor="profile-category" required>
                    {isWorker
                      ? "Bidang Pekerjaan Utama"
                      : isSupplier
                        ? "Kategori Produk yang Disuplai"
                        : "Kategori Usaha"}
                  </FormLabel>
                  <div className="relative">
                    <select
                      id="profile-category"
                      name="headline"
                      required
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="form-control form-control--trailing appearance-none"
                    >
                      <option value="">
                        {isWorker
                          ? "Pilih bidang keahlian Anda"
                          : isSupplier
                            ? "Pilih kategori produk"
                            : "Pilih kategori usaha Anda"}
                      </option>
                      {categoryOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#10231d]" />
                  </div>
                </div>
              </div>

              {isWorker && (
                <div className="grid grid-cols-[36px_1fr] items-start gap-3">
                  <FieldIcon><Tag className="h-5 w-5" /></FieldIcon>
                  <div className="form-field">
                    <p className="mb-2 text-[11px] font-extrabold text-[#10231d]">Keahlian Spesifik <span className="text-[#b61f3e]">*</span></p>
                    <SkillPicker name="skills" value={skills} onChangeAction={setSkills} />
                  </div>
                </div>
              )}



              {isSupplier && (
                <div className="grid grid-cols-[36px_1fr] items-start gap-3">
                  <FieldIcon>
                    <MapPin className="h-5 w-5" />
                  </FieldIcon>
                  <div className="form-field">
                    <FormLabel htmlFor="profile-delivery-area" required>
                      Area Jangkauan Pengiriman
                    </FormLabel>
                    <input
                      id="profile-delivery-area"
                      name="deliveryArea"
                      type="text"
                      autoComplete="address-level2"
                      required
                      value={deliveryArea}
                      onChange={(event) => setDeliveryArea(event.target.value)}
                      placeholder="Masukkan kota atau kabupaten"
                      className="form-control"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-[36px_1fr] items-start gap-3">
                <FieldIcon>
                  <FaWhatsapp className="h-5 w-5" />
                </FieldIcon>
                <div className="form-field">
                  <FormLabel htmlFor="profile-phone" required>
                    {isSupplier ? "Nomor WhatsApp / Telepon" : "Nomor WhatsApp"}
                  </FormLabel>
                  <div className="form-prefix-control">
                    <span className="form-prefix">+62</span>
                    <input
                      id="profile-phone"
                      name="phoneDigits"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Contoh: 81234567890"
                      aria-describedby={isWorker ? "profile-phone-helper" : undefined}
                      className="form-prefix-input"
                    />
                  </div>
                  {isWorker && (
                    <FormHelper id="profile-phone-helper">
                      Nomor ini tidak ditampilkan publik.
                    </FormHelper>
                  )}
                </div>
              </div>
            </div>

            {state.status === "error" && (
              <FormFeedback status="error" centered>
                {state.message}
              </FormFeedback>
            )}
          </div>
        </div>

        <div className="form-action-row profile-form-actions mx-auto mt-5 flex w-full max-w-xl items-center justify-between gap-4">
          <Link
            href="/onboarding/pilih-peran"
            className="form-button form-button--secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="form-button form-button--primary"
          >
            {isPending ? "Menyiapkan..." : "Tinjau Profil"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="profile-form-dots mt-4">
          <StepDots currentStep={3} />
        </div>
      </form>
    </div>
  );
}
