import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Store,
  Tag,
  User,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import successIllustration from "@/public/Profile(Selesai).png";
import { createClient } from "@/lib/supabase/server";
import {
  getMvpSession,
  isMvpAuthEnabled,
  mvpSessionToUser,
} from "@/lib/auth/mvp-session";

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback = "",
) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readSearchString(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return typeof value === "string" ? value : "";
}

function createProfileParams({
  role,
  displayName,
  businessName,
  headline,
  deliveryArea,
  phone,
}: {
  role: string;
  displayName: string;
  businessName: string;
  headline: string;
  deliveryArea: string;
  phone: string;
}) {
  const params = new URLSearchParams({
    role,
    displayName,
    businessName,
    headline,
    deliveryArea,
    phone,
  });

  return params.toString();
}

function roleLabel(role: string) {
  if (role === "pekerja") {
    return "Pekerja";
  }

  if (role === "supplier") {
    return "Supplier";
  }

  if (role === "admin") return "Admin / Panitia";
  return "Pemilik UMKM";
}

function StepDots() {
  return (
    <div className="flex items-center justify-center gap-5" aria-hidden="true">
      {[1, 2, 3, 4].map((step) => (
        <span
          key={step}
          className={`h-3 w-3 rounded-full transition-colors ${
            step === 4 ? "bg-[#11944f]" : "bg-[#dfeee4]"
          }`}
        />
      ))}
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[20px_minmax(68px,0.68fr)_1fr] items-center gap-2 py-0.5 sm:gap-2.5">
      <div className="flex h-5 w-5 items-center justify-center text-[#05723c]">
        {icon}
      </div>
      <p className="text-xs font-bold text-[#36544a]">{label}</p>
      <p className="min-w-0 text-xs font-semibold leading-snug text-[#10231d]">
        {value || "-"}
      </p>
    </div>
  );
}

type OnboardingSuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OnboardingSuccessPage({
  searchParams,
}: OnboardingSuccessPageProps) {
  const params = await searchParams;
  const mvpSession = isMvpAuthEnabled() ? await getMvpSession() : null;
  const user = mvpSession
    ? mvpSessionToUser(mvpSession)
    : (await (await createClient()).auth.getUser()).data.user;
  const metadata = user?.user_metadata ?? {};
  const queryDisplayName = readSearchString(params, "displayName");
  const queryBusinessName = readSearchString(params, "businessName");
  const queryHeadline = readSearchString(params, "headline");
  const queryDeliveryArea = readSearchString(params, "deliveryArea");
  const queryPhone = readSearchString(params, "phone");
  const queryRole = readSearchString(params, "role");
  const displayName = readMetadataString(
    metadata,
    "display_name",
    readMetadataString(metadata, "full_name", queryDisplayName),
  );
  const businessName = readMetadataString(
    metadata,
    "business_name",
    queryBusinessName,
  );
  const headline = readMetadataString(metadata, "headline", queryHeadline);
  const deliveryArea = readMetadataString(
    metadata,
    "delivery_area",
    queryDeliveryArea,
  );
  const phone = readMetadataString(metadata, "phone", queryPhone);
  const role = readMetadataString(metadata, "role", queryRole || "umkm");
  const isWorker = role === "pekerja";
  const isSupplier = role === "supplier";
  const dashboardHref = isWorker
    ? "/worker/dashboard"
    : isSupplier
      ? "/supplier"
      : role === "admin"
        ? "/admin"
        : "/dashboard";
  const profileParams = createProfileParams({
    role,
    displayName,
    businessName,
    headline,
    deliveryArea,
    phone,
  });
  const editHref = `/onboarding/lengkapi-profil?${profileParams}`;

  if (!displayName || !businessName || !headline || !phone || (isSupplier && !deliveryArea)) {
    redirect(`/onboarding/lengkapi-profil?role=${role}`);
  }

  const summaryItems = [
    {
      label: "Nama",
      value: displayName,
      icon: <User className="h-4 w-4" />,
    },
    {
      label: "Peran",
      value: roleLabel(role),
      icon: <BadgeCheck className="h-4 w-4" />,
    },
    {
      label: isWorker ? "Keahlian" : isSupplier ? "Produk" : "Kategori",
      value: headline,
      icon: <Tag className="h-4 w-4" />,
    },
  ];

  if (!isWorker) {
    summaryItems.splice(2, 0, {
      label: isSupplier ? "Perusahaan" : "Bisnis",
      value: businessName,
      icon: <Store className="h-4 w-4" />,
    });
  }

  if (isSupplier) {
    summaryItems.push({
      label: "Area",
      value: deliveryArea,
      icon: <MapPin className="h-4 w-4" />,
    });
  }

  if (phone) {
    summaryItems.push({
      label: isSupplier ? "Kontak" : "WhatsApp",
      value: phone,
      icon: <FaWhatsapp className="h-4 w-4" />,
    });
  }

  return (
    <main className="flex min-h-screen min-h-dvh flex-col items-center overflow-y-auto bg-[#f8faf7] px-2 py-3 sm:px-5 sm:py-4 lg:py-5">
      <section className="my-auto w-full max-w-[390px] shrink-0 overflow-hidden rounded-[1.5rem] border border-[#dbe6df] bg-white shadow-xl shadow-emerald-950/10 sm:rounded-[1.75rem] lg:max-w-[420px]">
        <div className="success-scale relative h-28 w-full bg-white sm:h-32 sm:bg-[#f4f8f5] lg:h-36">
          <Image
            src={successIllustration}
            alt="Profil berhasil dilengkapi"
            fill
            priority
            sizes="430px"
            className="object-cover"
          />
        </div>

        <div className="px-4 pb-3 pt-2.5 sm:px-5 sm:pb-4 sm:pt-3 lg:px-6 lg:pb-5 lg:pt-4">
          <div className="text-center">
            <h1 className="text-lg font-extrabold leading-normal tracking-normal text-[#145c46] sm:text-[1.1875rem] lg:text-xl">
              Profil Anda Lengkap!
            </h1>
            <p className="mx-auto mt-1 max-w-xs text-[11px] font-semibold leading-normal text-[#526a60] sm:text-[11px] lg:mt-1.5 lg:text-xs">
              Terima kasih telah melengkapi profil Anda. Anda sekarang siap
              menjelajahi Pull.
            </p>
          </div>

          <div className="success-fade-up mt-2.5 rounded-xl border border-[#dce9e1] bg-[#fbfdfb] p-3 sm:mt-3 lg:mt-4 lg:p-4">
            <div className="mb-2 flex items-center justify-between gap-4 lg:mb-3">
              <h2 className="text-sm font-extrabold text-[#145c46]">
                Ringkasan Profil
              </h2>
              <Link
                href={editHref}
                className="text-xs font-extrabold text-[#05723c] transition-colors hover:text-[#045f32]"
              >
                Ubah
              </Link>
            </div>

            <div className="space-y-0.5">
              {summaryItems.map((item) => (
                <SummaryRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>
          </div>

          <Link
            href={dashboardHref}
            aria-label={`Masuk ke Dashboard untuk role ${role}`}
            className="success-fade mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#079640] px-5 text-sm font-extrabold text-white shadow-md shadow-emerald-950/20 transition-all duration-150 hover:bg-[#057c35] active:scale-[0.99] sm:mt-3 lg:mt-4 lg:h-11"
          >
            Masuk ke Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-2.5 sm:mt-3 lg:mt-4">
            <StepDots />
          </div>
        </div>
      </section>
    </main>
  );
}
