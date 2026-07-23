"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";
import type { RoleActivityItem } from "@/features/dashboard/data/get-role-dashboard-data";

type ActivityCategory = RoleActivityItem["category"] | "Semua";

const filters: ActivityCategory[] = ["Semua", "Lowongan", "Profil", "Keamanan", "Akun"];

const iconByName: Record<RoleActivityItem["icon"], LucideIcon> = {
  badge: BadgeCheck,
  briefcase: BriefcaseBusiness,
  check: CheckCircle2,
  shield: ShieldCheck,
  user: UserRound,
};

const toneClasses: Record<RoleActivityItem["tone"], string> = {
  brand: "bg-[#e8f5eb] text-[#08783f]",
  muted: "bg-[#e9f2ff] text-[#315f9f]",
  warm: "bg-[#fff0df] text-[#c06d26]",
};

function EmptyState() {
  return (
    <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-[#cbdcd2] bg-[#f8fbf9] px-6 py-12 text-center">
      <div>
        <ClipboardCheck className="mx-auto h-10 w-10 text-[#74a28d]" />
        <h2 className="mt-4 text-base font-extrabold text-[#244b3c]">Belum ada aktivitas</h2>
        <p className="mx-auto mt-2 max-w-sm text-xs font-medium leading-5 text-[#718078]">Aktivitas database akan muncul setelah usaha memakai fitur Pull.</p>
      </div>
    </div>
  );
}

export function UmkmActivityPage({
  ownerName,
  businessName,
  profileCompletion,
  activities,
}: {
  ownerName: string;
  businessName: string;
  profileCompletion: number;
  activities: RoleActivityItem[];
}) {
  const [activeFilter, setActiveFilter] = useState<ActivityCategory>("Semua");
  const filteredActivities = useMemo(
    () => activities.filter((activity) => activeFilter === "Semua" || activity.category === activeFilter),
    [activeFilter, activities],
  );

  return (
    <UmkmDashboardShell ownerName={ownerName} businessName={businessName} profileCompletion={profileCompletion}>
      <section className="rounded-[20px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-7">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            const Icon = filter === "Lowongan" ? BriefcaseBusiness : filter === "Profil" ? UserRound : filter === "Keamanan" ? ShieldCheck : filter === "Akun" ? CheckCircle2 : Filter;
            return (
              <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[11px] font-extrabold transition ${isActive ? "bg-[#08783f] text-white shadow-sm" : "border border-[#dce5e0] bg-white text-[#52645c] hover:bg-[#f7faf8] hover:text-[#08783f]"}`}>
                <Icon className="h-3.5 w-3.5" /> {filter}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          {filteredActivities.length ? filteredActivities.map((activity) => {
            const Icon = iconByName[activity.icon];
            return (
              <article key={activity.id} className="flex gap-4 border-b border-[#e7eee9] py-4 last:border-0">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${toneClasses[activity.tone]}`}><Icon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3"><h2 className="text-xs font-extrabold text-[#17251f]">{activity.title}</h2><span className="shrink-0 text-[9px] font-bold text-[#6e8176]">{activity.time}</span></div>
                  <p className="mt-1 text-[10px] leading-5 text-[#63746d]">{activity.detail}</p>
                  <span className="mt-2 inline-flex rounded-full bg-[#f1f5f2] px-2 py-0.5 text-[8px] font-extrabold text-[#52645c]">{activity.category}</span>
                </div>
              </article>
            );
          }) : <EmptyState />}
        </div>
      </section>
    </UmkmDashboardShell>
  );
}
