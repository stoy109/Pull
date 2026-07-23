"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Eye,
  Filter,
  PackageCheck,
  ShieldCheck,
  Store,
  UserRoundCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";

type ActivityCategory = "Semua" | "Lowongan" | "Pool" | "Profil" | "Verifikasi";
type ActivityTone = "green" | "orange" | "blue" | "purple" | "red";
type ActivityItem = {
  id: string;
  category: Exclude<ActivityCategory, "Semua">;
  title: string;
  detail: string;
  time: string;
  icon: LucideIcon;
  tone: ActivityTone;
  unread?: boolean;
};

const filters: ActivityCategory[] = ["Semua", "Lowongan", "Pool", "Profil", "Verifikasi"];

const activities: ActivityItem[] = [
  {
    id: "act-1",
    category: "Lowongan",
    title: "Pekerjaan Staf Packing Harian selesai",
    detail: "Confirmation loop dengan Rina sudah lengkap. Rating pekerja ikut memperbarui Trust Score usaha.",
    time: "8 menit",
    icon: CheckCircle2,
    tone: "green",
    unread: true,
  },
  {
    id: "act-2",
    category: "Profil",
    title: "Profil bisnis dilihat 36 kali",
    detail: "Mayoritas pengunjung datang dari tautan QR profil publik dan papan loker.",
    time: "42 menit",
    icon: Eye,
    tone: "blue",
    unread: true,
  },
  {
    id: "act-3",
    category: "Lowongan",
    title: "Pelamar baru masuk",
    detail: "Agus melamar lowongan Operator Jahit Sementara dan menunggu tinjauan Anda.",
    time: "2 jam",
    icon: UserRoundCheck,
    tone: "purple",
  },
  {
    id: "act-4",
    category: "Pool",
    title: "Pool Kain Katun Combed mencapai 70%",
    detail: "8 UMKM sudah bergabung. Estimasi diskon Anda saat ini berada di 15,4%.",
    time: "3 jam",
    icon: UsersRound,
    tone: "green",
  },
  {
    id: "act-5",
    category: "Verifikasi",
    title: "WhatsApp usaha terverifikasi",
    detail: "Nomor kontak bisnis sudah bisa dipakai untuk komunikasi kandidat dan mitra pool.",
    time: "Kemarin",
    icon: ShieldCheck,
    tone: "green",
  },
  {
    id: "act-6",
    category: "Profil",
    title: "Info produk diperbarui",
    detail: "Produk Batik Tulis Motif Parang ditambahkan ke profil publik usaha.",
    time: "Kemarin",
    icon: Store,
    tone: "blue",
  },
  {
    id: "act-7",
    category: "Lowongan",
    title: "Lowongan hampir penuh",
    detail: "Staf Packing Harian menyisakan satu posisi sebelum tanggal mulai kerja.",
    time: "2 hari",
    icon: CircleAlert,
    tone: "orange",
  },
  {
    id: "act-8",
    category: "Pool",
    title: "Transaksi pool selesai",
    detail: "Pesanan Pewarna Batik Sintetis selesai diproses dan tercatat sebagai transaksi terverifikasi.",
    time: "3 hari",
    icon: PackageCheck,
    tone: "green",
  },
  {
    id: "act-9",
    category: "Verifikasi",
    title: "Dokumen NIB masih perlu ditinjau",
    detail: "Lengkapi unggahan dokumen agar label usaha terverifikasi bisa tampil di profil publik.",
    time: "4 hari",
    icon: BadgeCheck,
    tone: "orange",
  },
];

const toneClasses: Record<ActivityTone, string> = {
  green: "bg-[#e8f5eb] text-[#08783f]",
  orange: "bg-[#fff0df] text-[#c06d26]",
  blue: "bg-[#e9f2ff] text-[#315f9f]",
  purple: "bg-[#f1eaff] text-[#7249a5]",
  red: "bg-[#fbe9ec] text-[#a72b43]",
};

function ActivityIcon({
  icon: Icon,
  tone,
}: {
  icon: LucideIcon;
  tone: ActivityTone;
}) {
  return (
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${toneClasses[tone]}`}>
      <Icon className="h-4 w-4" />
    </span>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-[#cbdcd2] bg-[#f8fbf9] px-6 py-12 text-center">
      <div>
        <ClipboardCheck className="mx-auto h-10 w-10 text-[#74a28d]" />
        <h2 className="mt-4 text-base font-extrabold text-[#244b3c]">Belum ada aktivitas</h2>
        <p className="mx-auto mt-2 max-w-sm text-xs font-medium leading-5 text-[#718078]">Aktivitas untuk filter ini akan muncul setelah usaha memakai fitur Pull.</p>
      </div>
    </div>
  );
}

export function UmkmActivityPage({
  ownerName,
  businessName,
  profileCompletion,
}: {
  ownerName: string;
  businessName: string;
  profileCompletion: number;
}) {
  const [activeFilter, setActiveFilter] = useState<ActivityCategory>("Semua");
  const filteredActivities = useMemo(
    () => activities.filter((activity) => activeFilter === "Semua" || activity.category === activeFilter),
    [activeFilter],
  );

  return (
    <UmkmDashboardShell ownerName={ownerName} businessName={businessName} profileCompletion={profileCompletion}>
      <div className="grid gap-5">
        <section className="rounded-[20px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-7">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              const Icon = filter === "Lowongan"
                ? BriefcaseBusiness
                : filter === "Pool"
                  ? UsersRound
                  : filter === "Profil"
                    ? Store
                    : filter === "Verifikasi"
                      ? ShieldCheck
                      : Filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[11px] font-extrabold transition ${isActive ? "bg-[#08783f] text-white shadow-sm" : "border border-[#dce5e0] bg-white text-[#52645c] hover:bg-[#f7faf8] hover:text-[#08783f]"}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {filter}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            {filteredActivities.length ? (
              filteredActivities.map((activity, index) => (
                <article key={activity.id} className="relative flex gap-4 border-b border-[#e7eee9] py-4 last:border-0">
                  <ActivityIcon icon={activity.icon} tone={activity.tone} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xs font-extrabold text-[#17251f]">{activity.title}</h2>
                      <span className="shrink-0 text-[9px] font-bold text-[#6e8176]">{activity.time}</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-5 text-[#63746d]">{activity.detail}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f1f5f2] px-2 py-0.5 text-[8px] font-extrabold text-[#52645c]">{activity.category}</span>
                      {activity.unread ? <span className="rounded-full bg-[#fae5da] px-2 py-0.5 text-[8px] font-extrabold text-[#af5b3d]">Baru</span> : null}
                    </div>
                  </div>
                  {index < filteredActivities.length - 1 ? <span className="absolute bottom-0 left-[17px] top-[52px] w-px bg-[#e7eee9]" /> : null}
                </article>
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </section>

      </div>
    </UmkmDashboardShell>
  );
}
