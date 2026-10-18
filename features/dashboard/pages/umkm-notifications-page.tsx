"use client";

import {
  Bell,
  BellRing,
  Check,
  CircleAlert,
  Database,
  Inbox,
  PackageOpen,
  ReceiptText,
  Star,
  type LucideIcon,
} from "lucide-react";
import { markUmkmNotificationReadAction } from "@/features/dashboard/actions";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";
import type {
  UmkmNotification,
  UmkmNotificationStatus,
  UmkmNotificationType,
} from "@/features/dashboard/data/get-umkm-notifications";

const cardClass =
  "rounded-[18px] border border-[#dfeae2] bg-white shadow-[0_8px_28px_rgba(18,59,48,.035)]";

const notificationMeta: Record<UmkmNotificationType, { label: string; icon: LucideIcon }> = {
  jobs: { label: "Jaringan kerja", icon: Bell },
  pools: { label: "Pool", icon: PackageOpen },
  orders: { label: "Pesanan", icon: ReceiptText },
  ratings: { label: "Rating", icon: Star },
  system: { label: "Sistem", icon: BellRing },
};

function formatDate(value: string, includeTime = false) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function ActionNotice({ result }: { result?: string }) {
  if (!result) return null;
  const success = result === "saved";
  const message = success
    ? "Notifikasi ditandai sudah dibaca."
    : result === "validation"
      ? "Notifikasi yang dipilih tidak valid."
      : "Notifikasi belum dapat diperbarui. Coba lagi.";
  return (
    <p
      role="status"
      className={`mb-5 rounded-xl border px-4 py-3 text-xs font-bold ${
        success
          ? "border-[#cbe5d4] bg-[#edf8f0] text-[#08783f]"
          : "border-[#f0d1c4] bg-[#fff5f1] text-[#a7462d]"
      }`}
    >
      {message}
    </p>
  );
}

function DataState({ status }: { status: UmkmNotificationStatus }) {
  const setup = status === "setup-required";
  return (
    <section className={`${cardClass} grid min-h-72 place-items-center p-8 text-center`}>
      <div className="max-w-lg">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f5ec] text-[#08783f]">
          {setup ? <Database className="h-6 w-6" /> : <CircleAlert className="h-6 w-6" />}
        </span>
        <h2 className="mt-5 text-xl font-extrabold text-[#10231d]">
          {setup ? "Notifikasi belum disiapkan" : "Notifikasi belum dapat dimuat"}
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[#6b7b75]">
          {setup
            ? "Terapkan migration 202607230009 agar fungsi notifikasi tersedia."
            : "Koneksi data sedang bermasalah. Muat ulang halaman atau coba beberapa saat lagi."}
        </p>
      </div>
    </section>
  );
}

export function UmkmNotificationsPage({
  ownerName,
  businessName,
  profileCompletion,
  notifications,
  status,
  result,
}: {
  ownerName: string;
  businessName: string;
  profileCompletion: number;
  notifications: UmkmNotification[];
  status: UmkmNotificationStatus;
  result?: string;
}) {
  const unread = notifications.filter((notification) => !notification.readAt).length;

  return (
    <UmkmDashboardShell
      ownerName={ownerName}
      businessName={businessName}
      profileCompletion={profileCompletion}
    >
      <ActionNotice result={result} />

      {status !== "ready" ? (
        <DataState status={status} />
      ) : (
        <section className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-[#dfeae2] p-5 sm:p-6">
            <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#507f63]">
              Kotak masuk
            </p>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-[-.02em] text-[#0c261c]">
              Notifikasi usaha
            </h2>
            <p className="mt-2 text-xs font-medium leading-6 text-[#6b7b75]">
              {notifications.length
                ? `${unread} belum dibaca dari ${notifications.length} notifikasi terbaru.`
                : "Belum ada notifikasi untuk usaha Anda."}
            </p>
          </div>

          {notifications.length ? (
            <div className="divide-y divide-[#e3ece6]">
              {notifications.map((notification) => {
                const meta = notificationMeta[notification.type];
                const Icon = meta.icon;
                return (
                  <article
                    key={notification.id}
                    className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-start ${
                      notification.readAt ? "bg-white" : "bg-[#f4faf6]"
                    }`}
                  >
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] ${
                        notification.readAt
                          ? "bg-[#f0f4f2] text-[#6b7b75]"
                          : "bg-[#dff2e5] text-[#08783f]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-[.1em] text-[#507f63]">
                          {meta.label}
                        </span>
                        {!notification.readAt ? (
                          <span
                            className="h-2 w-2 rounded-full bg-[#e0672f]"
                            aria-label="Belum dibaca"
                          />
                        ) : null}
                      </div>
                      <h3 className="mt-1.5 text-sm font-extrabold text-[#163c2b]">
                        {notification.title}
                      </h3>
                      <p className="mt-2 text-xs font-medium leading-6 text-[#6b7b75]">
                        {notification.body}
                      </p>
                      <time className="mt-2 block text-[9px] font-semibold text-[#87968f]">
                        {formatDate(notification.createdAt, true)}
                      </time>
                    </div>

                    {notification.readAt ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#87968f]">
                        <Check className="h-3.5 w-3.5" />
                        Sudah dibaca
                      </span>
                    ) : (
                      <form action={markUmkmNotificationReadAction}>
                        <input type="hidden" name="notificationId" value={notification.id} />
                        <button
                          type="submit"
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#b9dcc8] bg-white px-4 text-xs font-extrabold text-[#08783f] transition hover:bg-[#edf8f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f]"
                        >
                          <Check className="h-4 w-4" />
                          Tandai dibaca
                        </button>
                      </form>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
              <div>
                <Inbox className="mx-auto h-10 w-10 text-[#74a28d]" />
                <h3 className="mt-4 text-base font-extrabold text-[#244b3c]">
                  Belum ada notifikasi
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-xs font-medium leading-5 text-[#718078]">
                  Perubahan pool, lamaran, dan aktivitas lowongan akan tampil di sini.
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </UmkmDashboardShell>
  );
}
