import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f5] px-5 py-12 text-center">
      <section className="w-full max-w-md rounded-[24px] border border-[#dfe9e3] bg-white p-8 shadow-[0_18px_55px_rgba(12,38,28,.08)]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff0e8] text-[#b65324]">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#10231d]">Akses tidak diizinkan</h1>
        <p className="mt-3 text-sm font-medium leading-7 text-[#6b7b75]">
          Peran akun Anda tidak memiliki izin untuk membuka halaman ini.
        </p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#08783f] px-5 text-sm font-extrabold text-white transition hover:bg-[#066b36]">
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
