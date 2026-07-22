import Image from 'next/image'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  ShieldCheck,
  Star,
  TrendingUp,
} from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { ActivityIcon } from '../components/UI'

const metricTones = {
  green: 'bg-[#e8f5ec] text-[#08783f]',
  orange: 'bg-[#fff0df] text-[#e87513]',
  mint: 'bg-[#e8f5ec] text-[#18844b]',
  gold: 'bg-[#fff6d9] text-[#d69208]',
}

function CompletionAlert({ application, onConfirm }) {
  if (!application) {
    return (
      <section className="flex min-h-[124px] items-center gap-4 rounded-[18px] border border-pull-100 bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.035)] sm:gap-5 sm:p-6">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-pull-100 text-pull-700"><CheckCircle2 size={25} /></span>
        <div><h2 className="text-base font-extrabold text-pull-950">Semua konfirmasi sudah selesai</h2><p className="mt-1.5 text-xs font-medium text-pull-500 sm:text-[13px]">Tidak ada pekerjaan yang menunggu tindakanmu.</p></div>
      </section>
    )
  }

  return (
    <section className="flex min-h-[124px] flex-col gap-4 rounded-[18px] border border-[#f5c38e] bg-[linear-gradient(100deg,#fffaf3_0%,#fff3e5_100%)] p-5 shadow-[0_8px_28px_rgba(197,104,28,.055)] sm:flex-row sm:items-center sm:gap-5 sm:p-6">
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#f47b0c] text-white shadow-[0_8px_18px_rgba(244,123,12,.22)]"><CircleAlert size={27} /></span>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-extrabold text-pull-950">1 pekerjaan menunggu konfirmasi selesai</h2>
        <p className="mt-1.5 text-xs font-medium leading-5 text-pull-500 sm:text-[13px]">Konfirmasi selesai kerja untuk mendapatkan sertifikat dan PullPoints.</p>
      </div>
      <button type="button" onClick={onConfirm} className="inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#07964d] px-6 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(7,150,77,.18)] transition duration-200 hover:bg-[#087d44]">Konfirmasi sekarang <ArrowRight size={17} /></button>
    </section>
  )
}

function DashboardMetric({ icon: Icon, label, value, detail, tone = 'green', trend = false }) {
  return (
    <article className="flex min-h-[204px] flex-col rounded-[18px] border border-pull-100 bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.025)] sm:p-6 xl:p-5 2xl:p-6">
      <div className="flex items-start gap-3.5">
        <span className={`grid size-12 shrink-0 place-items-center rounded-[13px] ${metricTones[tone]}`}><Icon size={22} strokeWidth={2.2} /></span>
        <div className="min-w-0 pt-0.5"><p className="text-[11px] font-extrabold leading-4 text-pull-700 2xl:text-xs">{label}</p><strong className="mt-2 block font-display text-[32px] font-semibold leading-none tracking-[-0.04em] text-pull-950 2xl:text-[36px]">{value}</strong></div>
      </div>
      <p className={`mt-auto flex items-center gap-1.5 pt-5 text-[11px] font-semibold leading-5 ${trend ? 'text-[#0e8a49]' : 'text-pull-400'}`}>{trend ? <TrendingUp size={15} strokeWidth={2.5} /> : null}{detail}</p>
    </article>
  )
}

function TrustGauge() {
  const circumference = 326.73
  const progress = 0.96

  return (
    <section className="flex h-full min-h-[348px] flex-col rounded-[18px] border border-pull-100 bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.035)] sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-0.025em] text-pull-950"><ShieldCheck size={19} className="fill-[#087a41] text-white" strokeWidth={2.2} /> Trust Score</h2>
      <div className="relative mx-auto mt-5 size-48 xl:size-44 2xl:size-48" role="img" aria-label="Trust Score 4,8 dari 5, sangat baik">
        <svg className="size-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <defs><linearGradient id="worker-trust-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#05723c" /><stop offset="1" stopColor="#84bf2f" /></linearGradient></defs>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#edf1ee" strokeWidth="10" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="url(#worker-trust-gradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center"><strong className="font-display text-[52px] font-semibold tracking-[-0.06em] text-pull-950">4,8</strong><span className="mt-1 text-xs font-extrabold text-pull-700">Sangat baik</span></div>
      </div>
      <Link to="/trust" className="mt-auto inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#b9dcc8] bg-white text-xs font-extrabold text-[#087a41] transition hover:border-[#78b994] hover:bg-[#f5fbf7]">Lihat detail</Link>
    </section>
  )
}

function ActivityPanel({ activities }) {
  return (
    <section className="h-full min-h-[358px] rounded-[18px] border border-pull-100 bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.03)] sm:p-6">
      <div className="mb-1 flex items-center justify-between gap-4 border-b border-pull-100 pb-5">
        <div className="flex items-center gap-2.5"><h2 className="font-display text-xl font-semibold tracking-[-0.025em] text-pull-950">Aktivitas terbaru</h2><span className="rounded-md bg-[#e7f5eb] px-2.5 py-1 text-[10px] font-extrabold text-[#18804a]">Hari ini</span></div>
        <Link to="/activity" className="text-button">Lihat semua</Link>
      </div>
      <div>
        {activities.slice(0, 4).map((activity) => (
          <Link key={activity.id} to={activityPath(activity)} className="group flex items-center gap-3.5 border-b border-pull-100 py-4 last:border-0">
            <ActivityIcon name={activity.icon} tone={activity.tone} />
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-pull-800 transition group-hover:text-pull-600">{activity.title}</p><p className="mt-1 truncate text-[10px] font-medium text-pull-400">{activity.detail}</p></div>
            {activity.action ? <span className="hidden rounded-md bg-pull-50 px-2.5 py-1 text-[9px] font-extrabold text-pull-600 sm:block">{activity.action}</span> : null}
            <span className="shrink-0 text-[10px] font-semibold text-pull-400">{activity.time}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}



function activityPath(activity) {
  if (activity.title.includes('Interview')) return '/applications/app-4'
  if (activity.title.includes('Sertifikat')) return '/certificates'
  if (activity.title.includes('Ulasan')) return '/trust'
  return '/activity'
}

export default function DashboardPage() {
  const { profile, applications, activities, certificates, activeApplicationCount, openDialog } = useWorkspace()
  const pendingCompletion = applications.Selesai.find((application) => application.confirmable && application.employerConfirmed && !application.workerConfirmed)
  const pendingCompletionCount = applications.Selesai.filter((application) => application.confirmable && application.employerConfirmed && !application.workerConfirmed).length

  return (
    <>
      <header className="dashboard-welcome relative z-20 mb-5 overflow-hidden rounded-[20px] border border-pull-100 bg-[#fffefa] shadow-[0_8px_30px_rgba(18,59,48,.035)] sm:min-h-[260px]">
        <div className="relative z-10 px-5 py-7 sm:min-h-[260px] sm:max-w-[54%] sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:max-w-[50%]">
          <h1 className="font-display text-[27px] font-semibold leading-[1.1] tracking-[-0.04em] text-pull-950 sm:text-[32px]">Selamat datang kembali, {profile.name.split(' ')[0]}! <span aria-hidden="true">👋</span></h1>
          <p className="mt-5 max-w-[430px] text-sm font-medium leading-7 text-pull-600 sm:text-[15px]">Temukan peluang kerja dan bangun reputasimu bersama Pull.</p>
        </div>
        <div className="relative h-48 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[58%]"><Image src="/illustrations/worker-dashboard.webp" alt="" fill priority sizes="(min-width: 640px) 58vw, 100vw" className="object-contain object-bottom sm:object-right-bottom" /></div>
      </header>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 space-y-5 xl:col-span-9">
          <CompletionAlert application={pendingCompletion} onConfirm={() => openDialog('work-confirmation', { appId: pendingCompletion.id, stage: 'Selesai' })} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardMetric icon={ClipboardList} label="Lamaran aktif" value={String(activeApplicationCount)} detail="+1 dari minggu lalu" trend />
            <DashboardMetric icon={CheckCircle2} label="Perlu konfirmasi" value={String(pendingCompletionCount)} detail="Segera konfirmasi selesai" tone="orange" />
            <DashboardMetric icon={Award} label="Sertifikat dimiliki" value={String(certificates.length)} detail="Terakhir: 3 hari lalu" tone="mint" />
            <DashboardMetric icon={Star} label="PullPoints" value="12 pts" detail="+1 dari konfirmasi terakhir" tone="gold" trend />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-3"><TrustGauge /></div>

        <div className="col-span-12"><ActivityPanel activities={activities} /></div>
      </div>
    </>
  )
}
