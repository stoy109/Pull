import Link from "next/link";
import { Bell, BriefcaseBusiness, PackageOpen, ReceiptText, Settings, Star } from "lucide-react";
import { setNotificationPreferencesAction } from "@/features/supplier/actions";
import { getSupplierNotificationPreferences } from "@/features/supplier/data";
import {
  ActionNotice,
  cardClass,
  DataState,
  primaryButtonClass,
  SectionHeading,
} from "@/features/supplier/components/supplier-ui";

export default async function SupplierSettingsPage({ searchParams }: { searchParams: Promise<{ result?: string | string[] }> }) {
  const [preferenceResult, params] = await Promise.all([getSupplierNotificationPreferences(), searchParams]);
  if (preferenceResult.status !== "ready") return <DataState status={preferenceResult.status} />;
  const { preferences } = preferenceResult;
  const settings = [
    { name: "inApp", title: "Notifikasi dalam aplikasi", description: "Sakelar utama untuk notifikasi Pull.", enabled: preferences.inApp, icon: Bell },
    { name: "pools", title: "Pool dan demand", description: "Perubahan dan peluang pada pool permintaan.", enabled: preferences.pools, icon: PackageOpen },
    { name: "orders", title: "Pesanan supplier", description: "Order baru dan perubahan status transaksi.", enabled: preferences.orders, icon: ReceiptText },
    { name: "ratings", title: "Rating transaksi", description: "Ulasan baru dari pihak transaksi.", enabled: preferences.ratings, icon: Star },
    { name: "jobs", title: "Informasi jaringan kerja", description: "Notifikasi lowongan pada ekosistem Pull.", enabled: preferences.jobs, icon: BriefcaseBusiness },
  ];

  return (
    <>
      <ActionNotice result={params.result} />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <section className={`${cardClass} p-5 sm:p-6`}>
          <SectionHeading eyebrow="Preferensi akun" title="Jenis notifikasi" description="Pilihan disimpan ke notification_preferences untuk akun yang sedang masuk." />
          <form action={setNotificationPreferencesAction} className="mt-5">
            <div className="divide-y divide-[#e3ece6]">{settings.map((setting) => { const Icon = setting.icon; return (
              <label key={setting.name} className="flex cursor-pointer items-center gap-4 py-4 first:pt-0">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#e8f5ec] text-[#08783f]"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-extrabold text-[#163c2b]">{setting.title}</span><span className="mt-1 block text-[10px] font-medium leading-5 text-[#6b7b75]">{setting.description}</span></span>
                <input type="checkbox" name={setting.name} defaultChecked={setting.enabled} className="peer sr-only" />
                <span aria-hidden="true" className="relative h-7 w-12 shrink-0 rounded-full bg-[#dfe7e2] transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:bg-[#08783f] peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#08783f]" />
              </label>
            ); })}</div>
            <button type="submit" className={`${primaryButtonClass} mt-5 w-full sm:w-auto`}><Settings className="h-4 w-4" />Simpan pengaturan</button>
          </form>
        </section>

        <aside className="rounded-[18px] bg-[#0c4d34] p-6 text-white shadow-[0_18px_42px_rgba(12,77,52,.16)]">
          <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#a8d7b7]">Dampak pengaturan</p>
          <h2 className="mt-3 font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-.03em]">Tetap fokus pada perubahan penting.</h2>
          <p className="mt-4 text-xs font-medium leading-6 text-white/65">Jika notifikasi dalam aplikasi dimatikan, kategori lain tetap tersimpan tetapi tidak menghasilkan notifikasi baru sampai sakelar utama diaktifkan kembali.</p>
          <Link href="/supplier/notifications" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/15 bg-white/[.06] px-4 text-xs font-extrabold text-white hover:bg-white/10">Buka kotak notifikasi</Link>
        </aside>
      </div>
    </>
  );
}
