import { CircleAlert } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";

export default function AccountSuspendedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8f5] px-4 py-10">
      <section className="w-full max-w-lg rounded-[28px] border border-[#efd7c7] bg-white p-7 text-center shadow-[0_24px_70px_rgba(51,35,20,.10)] sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff0e5] text-[#bf5f1d]">
          <CircleAlert className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9b6a47]">
          Akses dibatasi
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#183a2d]">
          Akun sedang ditangguhkan
        </h1>
        <p className="mt-4 text-sm font-medium leading-7 text-[#66786f]">
          Anda tidak dapat membuka dashboard untuk sementara. Hubungi tim Pull
          bila Anda membutuhkan penjelasan atau peninjauan ulang.
        </p>
        <form action={signOutAction} className="mt-7">
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#145c46] px-5 text-sm font-extrabold text-white transition hover:bg-[#0f4938]"
          >
            Keluar dari akun
          </button>
        </form>
      </section>
    </main>
  );
}
