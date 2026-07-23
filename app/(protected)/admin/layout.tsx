import Image from "next/image";
import Link from "next/link";
import { Activity, RadioTower, ShieldCheck, UsersRound } from "lucide-react";

const MENU = [
  { label: "Monitoring", href: "/admin#monitoring", icon: RadioTower },
  { label: "Aktivitas", href: "/admin#aktivitas", icon: Activity },
  { label: "Pengguna", href: "/admin#pengguna", icon: UsersRound },
];

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#f2f6fa] font-[family-name:var(--font-worker-sans)] text-[#102033]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 overflow-hidden bg-[#0b1729] text-white lg:flex lg:flex-col">
        <div className="absolute -right-24 top-16 h-52 w-52 rounded-full bg-[#12b8d4]/10 blur-3xl" />
        <Link href="/admin" className="relative flex items-center gap-3 border-b border-white/10 px-7 py-7">
          <Image src="/Logo(Pull).svg" alt="Pull" width={38} height={38} priority className="rounded-xl" />
          <div>
            <span className="block text-lg font-extrabold leading-none">Pull Control</span>
            <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.22em] text-[#6ee7f5]">Admin console</span>
          </div>
        </Link>

        <nav className="relative flex-1 space-y-2 px-4 py-7" aria-label="Navigasi admin">
          <p className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Ruang kendali</p>
          {MENU.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-bold transition-colors ${
                  index === 0 ? "bg-[#15314b] text-[#71e6f4]" : "text-white/70 hover:bg-white/7 hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative m-4 rounded-2xl border border-[#66d9e8]/15 bg-[#10243a] p-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <ShieldCheck className="h-4 w-4 text-[#71e6f4]" /> Akses terbatas
          </div>
          <p className="mt-2 text-[10px] leading-5 text-white/50">Aktivitas pada konsol ini tercatat untuk audit keamanan.</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-[#d9e3ed] bg-[#f8fbfd]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-9">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#15849a]">System overview</p>
              <h1 className="mt-1 font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-0.04em] text-[#0b1729]">Pusat Monitoring</h1>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#b9dce3] bg-white px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#23677a]">
              <span className="h-2 w-2 rounded-full bg-[#12a86b] shadow-[0_0_0_4px_rgba(18,168,107,.12)]" /> Live
            </span>
          </div>
          <nav className="mx-auto mt-4 flex max-w-[1500px] gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Navigasi admin seluler">
            {MENU.map((item) => (
              <Link key={item.label} href={item.href} className="whitespace-nowrap rounded-full border border-[#d5e1eb] bg-white px-4 py-2 text-xs font-bold text-[#29445e]">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-9 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
