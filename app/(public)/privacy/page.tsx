import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const policies = [
  "Pull menyimpan data akun seperti nama, email, nomor WhatsApp, role, dan profil yang Anda isi.",
  "Data digunakan untuk autentikasi, personalisasi onboarding, dan menampilkan profil komunitas.",
  "Kami tidak membagikan data kontak pribadi ke pihak lain tanpa kebutuhan fitur atau persetujuan yang jelas.",
  "Anda dapat memperbarui data profil melalui fitur akun saat halaman pengaturan tersedia.",
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8faf7] px-4 py-10 text-[#10231d] md:px-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <Link
          href="/register"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#36544a] transition-colors hover:text-[#10231d]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>

        <div className="space-y-3">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#299a45]">
            Pull
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#145c46]">
            Kebijakan Privasi
          </h1>
          <p className="text-sm leading-relaxed text-[#36544a]">
            Ringkasan awal bagaimana Pull menangani data pengguna. Dokumen ini
            perlu diperinci sebelum fitur produksi dipakai luas.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#e6eee9] bg-white p-6 shadow-xl shadow-emerald-950/5 md:p-8">
          <ol className="space-y-4">
            {policies.map((policy, index) => (
              <li key={policy} className="flex gap-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#eef8f2] text-sm font-bold text-[#145c46]">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-[#36544a]">
                  {policy}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
