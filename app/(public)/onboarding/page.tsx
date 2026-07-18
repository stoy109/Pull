import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBasket,
  Briefcase,
  Store,
  ShieldCheck,
  ArrowRight,
  Check,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Selamat Datang" },
  { id: 2, label: "Pilih Peran" },
  { id: 3, label: "Lengkapi Profil" },
];

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

export default function OnboardingPage() {
  const currentStep = 1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-3 sm:p-4 lg:p-5">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#e6eee9] bg-white shadow-xl shadow-emerald-950/5 sm:rounded-[2.25rem] lg:flex-row lg:min-h-[560px]">
        <div className="relative hidden items-center justify-center border-r border-[#e6eee9] bg-[#f4f8f5] lg:flex lg:w-1/2">
          <Image
            src="/auth/login-bg.png"
            alt="Selamat Datang di Pull"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:w-1/2 lg:px-10 lg:py-8">
          <div className="mx-auto flex w-full max-w-sm flex-col gap-5 lg:gap-6">
            <div className="flex items-center gap-0">
              {STEPS.map((step, index) => {
                const isDone = step.id < currentStep;
                const isActive = step.id === currentStep;

                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
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
                        className={`text-[11px] font-semibold whitespace-nowrap transition-colors duration-300 ${
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
                      <div className="flex-1 h-[2px] mx-2 mb-5 rounded-full overflow-hidden bg-[#e6eee9]">
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

            <div className="space-y-1.5 -mt-3">
              <h1 className="text-3xl font-bold tracking-tight text-[#10231d]">
                Selamat Datang di <span className="text-[#145c46]">Pull</span>
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
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#145c46] text-sm font-semibold tracking-wide text-white shadow-md shadow-emerald-950/20 transition-all duration-150 hover:bg-[#104a38] active:scale-[0.99] lg:h-11"
            >
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
