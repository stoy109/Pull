import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  BriefcaseBusiness,
  CircleUserRound,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import type { WorkerPage, WorkerProfile } from "./types";

const navigation = [
  { page: "dashboard" as const, href: "/worker", label: "Ringkasan", mobileLabel: "Beranda", icon: LayoutDashboard },
  { page: "jobs" as const, href: "/worker/jobs", label: "Cari kerja", mobileLabel: "Kerja", icon: BriefcaseBusiness },
  { page: "applications" as const, href: "/worker/applications", label: "Lamaran", mobileLabel: "Lamaran", icon: ClipboardList },
  { page: "trust" as const, href: "/worker/trust", label: "Kepercayaan", mobileLabel: "Trust", icon: ShieldCheck },
  { page: "notifications" as const, href: "/worker/notifications", label: "Notifikasi", mobileLabel: "Notif", icon: Bell },
  { page: "profile" as const, href: "/worker/profile", label: "Profil saya", mobileLabel: "Profil", icon: CircleUserRound },
];

export function WorkerShell({
  children,
  currentPage,
  profile,
  unreadCount,
}: {
  children: ReactNode;
  currentPage: WorkerPage;
  profile: WorkerProfile | null;
  unreadCount: number;
}) {
  const displayName = profile?.displayName || "Nama belum diisi";

  return (
    <div className="min-h-screen bg-[#f4f7f4] font-[family-name:var(--font-worker-sans)] text-[#10231d] lg:grid lg:grid-cols-[244px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/10 bg-[#0b2a1e] px-4 py-5 text-white lg:flex">
        <Link href="/worker" className="flex items-center gap-3 rounded-xl px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9bd1ad]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7f5eb] font-[family-name:var(--font-worker-display)] text-xl font-bold text-[#08783f]">P</span>
          <span>
            <strong className="block font-[family-name:var(--font-worker-display)] text-lg font-semibold tracking-[-0.03em]">Pull</strong>
            <span className="block text-[9px] font-bold uppercase tracking-[0.17em] text-white/45">Ruang pekerja</span>
          </span>
        </Link>

        <nav aria-label="Navigasi pekerja" className="mt-9 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.page === currentPage;
            return (
              <Link
                key={item.page}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9bd1ad] ${
                  active ? "bg-white text-[#0b2a1e] shadow-sm" : "text-white/65 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? "text-[#08783f]" : "text-white/45"}`} />
                <span>{item.label}</span>
                {item.page === "notifications" && unreadCount > 0 ? (
                  <span className="ml-auto min-w-5 rounded-full bg-[#b7d74a] px-1.5 py-0.5 text-center text-[9px] font-black text-[#18351f]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.055] p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dff1e5] text-xs font-black uppercase text-[#08783f]">
              {displayName.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-extrabold">{displayName}</p>
              <p className="mt-0.5 truncate text-[9px] font-semibold text-white/45">{profile?.headline || "Bidang kerja belum diisi"}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] font-bold text-white/45">
            <span>Level verifikasi</span>
            <span className="text-[#b7d74a]">{profile?.verificationLevel ?? 0}/2</span>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dce7e0] bg-[#f4f7f4]/95 px-4 backdrop-blur lg:hidden">
          <Link href="/worker" className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08783f]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0b2a1e] font-[family-name:var(--font-worker-display)] text-lg font-bold text-white">P</span>
            <span className="font-[family-name:var(--font-worker-display)] text-lg font-semibold tracking-[-0.03em]">Pull Kerja</span>
          </Link>
          <Link
            href="/worker/notifications"
            aria-label={unreadCount ? `${unreadCount} notifikasi belum dibaca` : "Notifikasi"}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#d5e4db] bg-white text-[#24503b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08783f]"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e87513] ring-2 ring-white" /> : null}
          </Link>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
          {children}
        </main>
      </div>

      <nav aria-label="Navigasi pekerja seluler" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-[#d2e1d8] bg-white/95 px-1 pb-[max(.45rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(12,38,28,.08)] backdrop-blur lg:hidden">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.page === currentPage;
          return (
            <Link
              key={item.page}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-0 flex-col items-center gap-1 rounded-lg px-0.5 py-1.5 text-[8px] font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08783f] ${active ? "text-[#08783f]" : "text-[#789084]"}`}
            >
              <Icon className={`h-[18px] w-[18px] ${active ? "stroke-[2.5]" : ""}`} />
              <span className="truncate">{item.mobileLabel}</span>
              {item.page === "notifications" && unreadCount > 0 ? <span className="absolute right-[24%] top-1 h-2 w-2 rounded-full bg-[#e87513] ring-2 ring-white" /> : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
