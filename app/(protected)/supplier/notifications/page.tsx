import { Bell, BellRing, Check, PackageOpen, ReceiptText, Star } from "lucide-react";
import { markNotificationReadAction } from "@/features/supplier/actions";
import { getSupplierNotifications } from "@/features/supplier/data";
import {
  ActionNotice,
  cardClass,
  DataState,
  EmptyState,
  formatDate,
  SectionHeading,
} from "@/features/supplier/components/supplier-ui";

const notificationMeta = {
  jobs: { label: "Jaringan kerja", icon: Bell },
  pools: { label: "Pool", icon: PackageOpen },
  orders: { label: "Pesanan", icon: ReceiptText },
  ratings: { label: "Rating", icon: Star },
  system: { label: "Sistem", icon: BellRing },
} as const;

export default async function SupplierNotificationsPage({ searchParams }: { searchParams: Promise<{ result?: string | string[] }> }) {
  const [notificationResult, params] = await Promise.all([getSupplierNotifications(100), searchParams]);
  if (notificationResult.status !== "ready") return <DataState status={notificationResult.status} />;
  const unread = notificationResult.notifications.filter((notification) => !notification.readAt).length;

  return (
    <>
      <ActionNotice result={params.result} />
      <section className={`${cardClass} overflow-hidden`}>
        <div className="border-b border-[#dfeae2] p-5 sm:p-6"><SectionHeading eyebrow="Kotak masuk" title="Notifikasi supplier" description={`${unread} belum dibaca dari ${notificationResult.notifications.length} notifikasi terbaru.`} /></div>
        {notificationResult.notifications.length ? (
          <div className="divide-y divide-[#e3ece6]">
            {notificationResult.notifications.map((notification) => {
              const meta = notificationMeta[notification.type];
              const Icon = meta.icon;
              return (
                <article key={notification.id} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-start ${notification.readAt ? "bg-white" : "bg-[#f4faf6]"}`}>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] ${notification.readAt ? "bg-[#f0f4f2] text-[#6b7b75]" : "bg-[#dff2e5] text-[#08783f]"}`}><Icon className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[9px] font-extrabold uppercase tracking-[.1em] text-[#507f63]">{meta.label}</span>{!notification.readAt ? <span className="h-2 w-2 rounded-full bg-[#e0672f]" aria-label="Belum dibaca" /> : null}</div><h2 className="mt-1.5 text-sm font-extrabold text-[#163c2b]">{notification.title}</h2><p className="mt-2 text-xs font-medium leading-6 text-[#6b7b75]">{notification.body}</p><time className="mt-2 block text-[9px] font-semibold text-[#87968f]">{formatDate(notification.createdAt, true)}</time></div>
                  {!notification.readAt ? <form action={markNotificationReadAction}><input type="hidden" name="notificationId" value={notification.id} /><button type="submit" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#b9dcc8] bg-white px-4 text-xs font-extrabold text-[#08783f] hover:bg-[#edf8f0]"><Check className="h-4 w-4" />Tandai dibaca</button></form> : <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#87968f]"><Check className="h-3.5 w-3.5" />Sudah dibaca</span>}
                </article>
              );
            })}
          </div>
        ) : <EmptyState title="Belum ada notifikasi" description="Perubahan pool, pesanan, rating, dan sistem akan tampil di sini." />}
      </section>
    </>
  );
}
