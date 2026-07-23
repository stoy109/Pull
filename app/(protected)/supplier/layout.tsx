import Image from "next/image";
import Link from "next/link";
import { CircleUserRound, Layers3, PackageSearch, Sparkles } from "lucide-react";

const MENU = [
  { label: "Demand Insight", href: "/supplier#insight", icon: PackageSearch },
  { label: "Pool Aktif yang Butuh Supplier", href: "/supplier#pool-aktif", icon: Layers3 },
  { label: "Profil", href: "/supplier#profil", icon: CircleUserRound },
];

export default function SupplierLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#f6f7fb] font-[family-name:var(--font-worker-sans)] text-[#17182d]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] overflow-hidden bg-[#292451] text-white lg:flex lg:flex-col">
        <div className="absolute -left-20 bottom-28 h-64 w-64 rounded-full bg-[#28c9ad]/10 blur-3xl" />
        <Link href="/supplier" className="relative flex items-center gap-3 px-7 py-7">
          <Image src="/Logo(Pull).svg" alt="Pull" width={40} height={40} priority className="rounded-xl" />
          <div>
            <span className="block text-xl font-extrabold leading-none">Pull Supply</span>
            <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.19em] text-[#89e8d8]">Demand workspace</span>
          </div>
        </Link>

        <div className="mx-5 h-px bg-white/10" />
        <nav className="relative flex-1 space-y-2 px-4 py-7" aria-label="Navigasi supplier">
          <p className="px-3 pb-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/35">Workspace</p>
          {MENU.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[13px] font-bold leading-5 transition-colors ${
                  index === 0 ? "bg-[#3a3568] text-[#9af0e1]" : "text-white/68 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative m-5 rounded-2xl bg-[#201c43] p-4 ring-1 ring-white/8">
          <Sparkles className="h-5 w-5 text-[#6ee1ce]" />
          <p className="mt-3 text-xs font-extrabold">Peluang diperbarui otomatis</p>
          <p className="mt-1.5 text-[10px] leading-5 text-white/45">Pantau pool terbaru untuk merespons kebutuhan UMKM lebih cepat.</p>
        </div>
      </aside>

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 border-b border-[#e1e2ec] bg-[#fbfbfd]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-9">
          <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#6b6299]">Supplier workspace</p>
              <h1 className="mt-1 font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-0.04em] text-[#252048]">Demand Insight</h1>
            </div>
            <span id="profil" className="grid h-10 w-10 place-items-center rounded-full bg-[#2d2856] text-xs font-extrabold text-white ring-4 ring-[#e6e3f3]" aria-label="Profil supplier">SP</span>
          </div>
          <nav className="mx-auto mt-4 flex max-w-[1450px] gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Navigasi supplier seluler">
            {MENU.map((item) => (
              <Link key={item.label} href={item.href} className="whitespace-nowrap rounded-full border border-[#dedbea] bg-white px-4 py-2 text-xs font-bold text-[#4a446f]">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-9 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
