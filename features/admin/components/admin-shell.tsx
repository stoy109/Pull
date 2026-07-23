import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  LayoutDashboard,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { signOutAction } from "@/features/auth/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Monitoring", icon: LayoutDashboard },
  { href: "/admin/impact", label: "Smart Impact", icon: Sparkles },
  { href: "/admin/users", label: "Pengguna", icon: UsersRound },
  { href: "/admin/activity", label: "Log Aktivitas", icon: Activity },
] as const;

export function AdminShell({
  activePath = "/admin",
  children,
}: Readonly<{
  activePath?: "/admin" | "/admin/impact" | "/admin/users" | "/admin/activity";
  children: React.ReactNode;
}>) {
  const isImpactPage = activePath === "/admin/impact";

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#10231d]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-[#092d23] px-5 py-7 text-white lg:block">
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <Image
            src="/Logo(Pull).svg"
            alt="Pull"
            width={42}
            height={42}
            className="rounded-xl"
            priority
          />
          <div>
            <p className="text-xl font-extrabold">Pull</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
              Administrator
            </p>
          </div>
        </Link>

        <nav className="mt-9 space-y-2" aria-label="Navigasi Administrator">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-extrabold transition ${
                activePath === href
                  ? "bg-[#168552] text-white"
                  : "text-white/65 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#dce6e0] bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link href="/admin" className="flex items-center gap-3 lg:hidden">
              <Image src="/Logo(Pull).svg" alt="Pull" width={38} height={38} className="rounded-xl" />
              <div>
                <p className="text-sm font-extrabold">Pull Admin</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#5a796d]">
                  {isImpactPage ? "Smart Impact" : "Monitoring"}
                </p>
              </div>
            </Link>
            <div className="hidden lg:block">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#42806a]">
                {isImpactPage ? "Challenge 2" : "Challenge 1"}
              </p>
              <p className="mt-1 text-sm font-extrabold">
                {isImpactPage ? "Smart Impact Dashboard" : "Pusat Monitoring Platform"}
              </p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="h-10 rounded-xl border border-[#cddbd4] px-4 text-xs font-extrabold text-[#315b4c] transition hover:bg-[#f4f8f5]"
              >
                Keluar
              </button>
            </form>
          </div>
        </header>

        <nav
          className="border-b border-[#dce6e0] bg-white px-5 py-3 lg:hidden"
          aria-label="Navigasi Administrator seluler"
        >
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-[11px] font-extrabold ${
                  activePath === href ? "bg-[#0c7047] text-white" : "bg-[#edf4f0] text-[#315b4c]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </Link>
            ))}
          </div>
        </nav>

        {children}
      </div>
    </div>
  );
}
