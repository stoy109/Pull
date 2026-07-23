"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  Info,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";

const scoreHistory = [
  { month: "Feb", score: 76, x: 45, y: 146 },
  { month: "Mar", score: 78, x: 145, y: 130 },
  { month: "Apr", score: 80, x: 245, y: 112 },
  { month: "Mei", score: 82, x: 345, y: 96 },
  { month: "Jun", score: 84, x: 445, y: 78 },
  { month: "Jul", score: 86, x: 545, y: 58 },
];

const assessments = [
  {
    icon: Star,
    tone: "gold",
    title: "Rating rata-rata dari pekerja dan mitra pool",
    description: "Ulasan terverifikasi dari pekerjaan selesai dan transaksi bahan baku bersama.",
    value: "4,8 / 5,0",
    percent: 96,
    badge: "Bobot terbesar",
  },
  {
    icon: ClipboardCheck,
    title: "Completion rate pekerjaan",
    description: "Persentase lowongan yang selesai dengan confirmation loop dua pihak.",
    value: "18/19 selesai",
    percent: 95,
  },
  {
    icon: RefreshCw,
    title: "Kepatuhan konfirmasi",
    description: "Ketepatan waktu UMKM saat menerima pekerja, menyelesaikan tugas, dan memberi rating.",
    value: "97% tepat waktu",
    percent: 97,
  },
  {
    icon: BadgeCheck,
    title: "Kelengkapan dan verifikasi usaha",
    description: "Profil publik, WhatsApp usaha, dokumen legal, dan jejak transaksi yang dapat dicek.",
    value: "3 dari 4 selesai",
    percent: 82,
  },
] satisfies Array<{
  icon: LucideIcon;
  tone?: "green" | "gold";
  title: string;
  description: string;
  value: string;
  percent: number;
  badge?: string;
}>;

function ScoreOverview({ businessName }: { businessName: string }) {
  return (
    <section className="rounded-[20px] border border-[#d9e8de] bg-gradient-to-br from-[#f4fbf6] via-white to-[#edf8f1] p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-7">
      <div className="grid items-center gap-7 md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="mx-auto grid h-[270px] w-[270px] place-items-center rounded-full bg-[conic-gradient(from_0deg,#22a833_0_20%,#08783f_20%_86%,#dcece1_86%_100%)] p-[22px] shadow-[0_12px_35px_rgba(8,120,63,.08)] sm:h-[290px] sm:w-[290px]">
          <div className="grid h-full w-full place-items-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(8,120,63,.08)]">
            <span className="text-center">
              <strong className="block font-[family-name:var(--font-worker-display)] text-[76px] font-semibold leading-none tracking-[-0.06em] text-[#006934]">86</strong>
              <span className="mt-1 block text-2xl font-semibold text-[#263b32]">/100</span>
            </span>
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#dff2e5] px-5 py-3 text-lg font-extrabold text-[#08783f]">
            <ShieldCheck className="h-[25px] w-[25px]" /> Sangat Baik
          </span>
          <p className="mt-5 max-w-md text-sm font-semibold leading-7 text-[#40534a]">
            Reputasi {businessName} dibangun dari lowongan selesai, konfirmasi pembayaran kerja, transaksi pool, dan profil usaha terverifikasi.
          </p>
          <p className="mt-8 flex items-center gap-2 text-xs font-semibold text-[#64756e]">
            <CalendarDays className="h-[18px] w-[18px]" /> Terakhir diperbarui: 23 Juli 2026
          </p>
        </div>
      </div>

      <div className="mt-7 flex gap-3 rounded-[16px] border border-[#dce9e1] bg-[#edf7f1]/80 p-4 text-xs font-medium leading-6 text-[#40534a] sm:px-5">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#08783f]" />
        <p>Trust Score UMKM hanya berubah dari aktivitas terverifikasi di Pull, sehingga pekerja dan mitra bisa menilai rekam jejak usaha secara lebih adil.</p>
      </div>
    </section>
  );
}

function SummaryMetrics() {
  return (
    <section className="grid grid-cols-3 divide-x divide-[#e0e7e3] rounded-[20px] border border-[#dce5e0] bg-white px-2 py-6 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:px-4">
      <Metric icon={BriefcaseBusiness} value="19" label="Pekerjaan Terkonfirmasi" />
      <Metric icon={Star} value="4,8" label="Rating Rata-rata" gold />
      <Metric icon={UsersRound} value="8" label="Pool Selesai" />
    </section>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
  gold = false,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  gold?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center px-2 text-center sm:flex-row sm:items-start sm:justify-center sm:gap-3 sm:text-left">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${gold ? "bg-[#fff6d9] text-[#eca900]" : "bg-[#edf7f1] text-[#08783f]"}`}>
        <Icon className="h-[22px] w-[22px]" fill={gold ? "currentColor" : "none"} />
      </span>
      <span className="mt-2 min-w-0 sm:mt-0">
        <strong className={`block font-[family-name:var(--font-worker-display)] text-2xl font-semibold leading-none ${gold ? "text-[#b66300]" : "text-[#08783f]"}`}>{value}</strong>
        <span className="mt-2 block text-[9px] font-bold leading-4 text-[#596b63]">{label}</span>
      </span>
    </div>
  );
}

function ScoreChart() {
  const linePath = `M ${scoreHistory.map((point) => `${point.x} ${point.y}`).join(" L ")}`;
  const areaPath = `${linePath} L 545 180 L 45 180 Z`;

  return (
    <section className="rounded-[20px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-6">
      <h2 className="text-base font-extrabold text-[#17251f]">Perkembangan Trust Score</h2>
      <svg viewBox="0 0 590 220" className="mt-4 h-auto w-full" role="img" aria-label="Trust Score UMKM meningkat dari 76 pada Februari menjadi 86 pada Juli">
        <defs>
          <linearGradient id="umkm-trust-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#79c98f" stopOpacity=".38" />
            <stop offset="100%" stopColor="#dff2e5" stopOpacity=".35" />
          </linearGradient>
        </defs>
        {[60, 100, 140, 180].map((y) => <line key={y} x1="20" y1={y} x2="570" y2={y} stroke="#e5ebe7" strokeWidth="1" />)}
        <path d={areaPath} fill="url(#umkm-trust-area)" />
        <path d={linePath} fill="none" stroke="#16923f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {scoreHistory.map((point, index) => (
          <g key={point.month}>
            <circle cx={point.x} cy={point.y} r={index === scoreHistory.length - 1 ? 7 : 6} fill="#20ad37" stroke="white" strokeWidth="2" />
            <text x={point.x} y={point.y - 16} textAnchor="middle" fontSize="14" fontWeight="800" fill="#263b32">{point.score}</text>
            <text x={point.x} y="207" textAnchor="middle" fontSize="12" fontWeight="700" fill="#687a72">{point.month}</text>
          </g>
        ))}
        <g transform="translate(522 15)">
          <rect width="46" height="30" rx="7" fill="#08783f" />
          <text x="23" y="20" textAnchor="middle" fontSize="14" fontWeight="800" fill="white">86</text>
        </g>
      </svg>
      <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#edf7f1] px-4 py-3 text-[10px] font-extrabold text-[#08783f]">
        <TrendingUp className="h-[17px] w-[17px]" /> Naik 10 poin dalam 6 bulan terakhir
      </div>
    </section>
  );
}

function AssessmentRow({
  icon: Icon,
  tone = "green",
  title,
  description,
  value,
  percent,
  badge,
}: {
  icon: LucideIcon;
  tone?: "green" | "gold";
  title: string;
  description: string;
  value: string;
  percent: number;
  badge?: string;
}) {
  return (
    <article className="rounded-[16px] border border-[#dce5e0] p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${tone === "gold" ? "bg-[#fff6d9] text-[#eca900]" : "bg-[#e8f5eb] text-[#08783f]"}`}>
          <Icon className="h-6 w-6" fill={tone === "gold" ? "currentColor" : "none"} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xs font-extrabold text-[#273830]">
              {title} {badge ? <span className="ml-2 inline-flex rounded-full bg-[#fff1cf] px-2.5 py-1 text-[8px] text-[#9b6500]">{badge}</span> : null}
            </h3>
            <strong className="whitespace-nowrap text-xs font-extrabold text-[#17251f]">{value}</strong>
          </div>
          <p className="mt-1 text-[10px] font-medium leading-5 text-[#718079]">{description}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#e8eeea]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#14a349] to-[#08783f]" style={{ width: `${percent}%` }} />
            </div>
            <span className="w-9 text-right text-[10px] font-extrabold text-[#64756e]">{percent}%</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function UmkmTrustScorePage({
  ownerName,
  businessName,
  profileCompletion,
}: {
  ownerName: string;
  businessName: string;
  profileCompletion: number;
}) {
  return (
    <UmkmDashboardShell ownerName={ownerName} businessName={businessName} profileCompletion={profileCompletion}>
      <div className="grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
        <ScoreOverview businessName={businessName} />
        <div className="grid gap-5">
          <SummaryMetrics />
          <ScoreChart />
        </div>
      </div>

      <section className="mt-5 rounded-[20px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:p-7">
        <h2 className="text-xl font-extrabold text-[#17251f]">Rincian Penilaian</h2>
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {assessments.map((item) => <AssessmentRow key={item.title} {...item} />)}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-center gap-4 rounded-[16px] border border-[#f1dca7] bg-gradient-to-r from-[#fff8df] to-[#fff4ce] p-4 sm:px-5">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#ffedaa] text-[#e9a900]">
              <Trophy className="h-[26px] w-[26px]" fill="currentColor" />
              <Sparkles className="absolute -right-1 -top-1 h-[13px] w-[13px]" fill="currentColor" />
            </span>
            <div>
              <h3 className="text-xs font-extrabold text-[#5a4214]">Pertahankan reputasi usaha Anda</h3>
              <p className="mt-1 text-[10px] font-medium leading-5 text-[#786638]">Konfirmasi pekerjaan tepat waktu dan lengkapi verifikasi usaha untuk membuat calon pekerja lebih yakin.</p>
            </div>
          </div>
          <Link href="/dashboard/settings/verification" className="inline-flex h-11 items-center justify-center gap-2 px-4 text-xs font-extrabold text-[#08783f] transition hover:text-[#05652f]">
            Lengkapi verifikasi usaha <ArrowRight className="h-[17px] w-[17px]" />
          </Link>
        </div>
      </section>

    </UmkmDashboardShell>
  );
}
