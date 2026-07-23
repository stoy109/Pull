"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f7f5] px-5">
      <div className="w-full max-w-md rounded-[24px] border border-[#e0e8e3] bg-white p-7 text-center shadow-[0_20px_50px_rgba(23,58,44,.08)]">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#fff1e5] text-[#b36417]">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-[#19352b]">Monitoring belum dapat dimuat</h1>
        <p className="mt-3 text-xs font-medium leading-6 text-[#71817a]">
          Periksa koneksi Supabase atau migration activity monitoring, lalu coba lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b7449] px-5 text-xs font-extrabold text-white"
        >
          <RefreshCw className="h-4 w-4" /> Coba lagi
        </button>
      </div>
    </div>
  );
}
