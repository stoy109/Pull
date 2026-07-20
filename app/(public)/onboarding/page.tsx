import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBasket,
  Briefcase,
  Store,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: <ShoppingBasket className="w-5 h-5 text-[#145c46]" />,
    title: "Pool Patungan Bahan Baku",
    desc: "Gabung atau buat pool untuk beli bahan baku lebih hemat dan efisien.",
  },
  {
    icon: <Briefcase className="w-5 h-5 text-[#145c46]" />,
    title: "Papan Loker",
    desc: "Cari pekerja atau peluang kerja yang sesuai dengan kebutuhanmu.",
  },
  {
    icon: <Store className="w-5 h-5 text-[#145c46]" />,
    title: "Profil UMKM",
    desc: "Tampilkan profil usahamu secara profesional kepada komunitas Pull.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#145c46]" />,
    title: "Trust Score",
    desc: "Bangun kepercayaan dan reputasi melalui transaksi yang transparan.",
  },
];

function StepDots({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-5" aria-hidden="true">
      {[1, 2, 3, 4].map((step) => (
        <span
          key={step}
          className={`h-3 w-3 rounded-full transition-colors ${step === currentStep ? "bg-[#11944f]" : "bg-[#dfeee4]"
            }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="form-page flex min-h-screen items-center justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      <div className="form-shell flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#e6eee9] bg-white shadow-xl shadow-emerald-950/5 sm:rounded-[2.25rem] lg:flex-row lg:min-h-[560px]">
        <div className="form-visual relative hidden items-center justify-center border-r border-[#e6eee9] bg-[#f4f8f5] lg:flex lg:w-1/2">
          <Image
            src="/auth/login-bg.png"
            alt="Selamat Datang di Pull"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="form-panel flex flex-col justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="form-content mx-auto flex w-full max-w-sm flex-col gap-5 lg:gap-6">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tight text-[#10231d]">
                Selamat Datang di <span className="text-[#145c46]">Pull!</span> 🎉
              </h1>
              <p className="text-sm text-[#6b7b75] leading-relaxed">
                Platform kolaboratif untuk UMKM dan pekerja.
                <br />
                Temukan peluang, bangun reputasi, dan tumbuh bersama.
              </p>
            </div>

            <ul className="space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="flex items-start gap-3.5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#eef8f2] border border-[#c3e6d0] flex items-center justify-center mt-0.5">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#10231d] leading-snug">
                      {feature.title}
                    </p>
                    <p className="text-xs text-[#6b7b75] leading-relaxed mt-0.5">
                      {feature.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/onboarding/pilih-peran"
              className="form-button form-button--primary w-full"
            >
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>

            <StepDots currentStep={1} />
          </div>
        </div>
      </div>
    </div>
  );
}
