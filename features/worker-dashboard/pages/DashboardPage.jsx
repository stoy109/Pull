import Image from 'next/image'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Star,
  TrendingUp,
} from 'lucide-react'
import { jobs } from '../data/mockData'
import { useWorkspace } from '../context/WorkspaceContext'
import { ActivityIcon, JobCard, SectionHeading } from '../components/UI'
import AvailabilityDropdown from '../components/AvailabilityDropdown'

const metricTones = {
  green: 'bg-[#e8f5ec] text-[#08783f]',
  orange: 'bg-[#fff0df] text-[#e87513]',
  mint: 'bg-[#e8f5ec] text-[#18844b]',
  gold: 'bg-[#fff6d9] text-[#d69208]',
}

function CompletionAlert({ application, onConfirm }) {
  if (!application) {
    return (
      <section className="flex min-h-24 items-center gap-4 rounded-[20px] border border-pull-100 bg-white p-4 shadow-[0_10px_30px_rgba(18,59,48,.035)] sm:p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-pull-100 text-pull-700"><CheckCircle2 size={22} /></span>
        <div><h2 className="text-sm font-extrabold text-pull-950">Semua konfirmasi sudah selesai</h2><p className="mt-1 text-[10px] font-semibold text-pull-500">Tidak ada pekerjaan yang menunggu tindakanmu.</p></div>
      </section>
    )
  }

  return (
    <section className="flex min-h-24 flex-col gap-4 rounded-[20px] border border-[#f2c79e] bg-[linear-gradient(100deg,#fff8ef_0%,#fff4e6_100%)] p-4 shadow-[0_10px_30px_rgba(197,104,28,.06)] sm:flex-row sm:items-center sm:p-5">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#f47b0c] text-white shadow-[0_8px_18px_rgba(244,123,12,.22)]"><CircleAlert size={24} /></span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-extrabold text-pull-950">1 pekerjaan menunggu konfirmasi selesai</h2>
        <p className="mt-1 text-[10px] font-semibold leading-5 text-pull-500">Konfirmasi selesai kerja untuk membuka rating, sertifikat, dan PullPoints.</p>
      </div>
      <button type="button" onClick={onConfirm} className="primary-button h-11 shrink-0 px-5">Konfirmasi sekarang <ArrowRight size={15} /></button>
    </section>
  )
}

function DashboardMetric({ icon: Icon, label, value, detail, tone = 'green', trend = false }) {
  return (
    <article className="flex min-h-40 flex-col rounded-[18px] border border-pull-100 bg-white p-4 shadow-[0_8px_24px_rgba(18,59,48,.025)]">
      <div className="flex items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${metricTones[tone]}`}><Icon size={18} /></span>
        <div className="min-w-0"><p className="text-[9px] font-extrabold text-pull-600">{label}</p><strong className="mt-1 block font-display text-[28px] font-semibold leading-none tracking-[-0.04em] text-pull-950">{value}</strong></div>
      </div>
      <p className={`mt-auto flex items-center gap-1 pt-4 text-[9px] font-bold ${trend ? 'text-[#0e8a49]' : 'text-pull-400'}`}>{trend ? <TrendingUp size={12} /> : null}{detail}</p>
    </article>
  )
}

function TrustGauge() {
  const circumference = 326.73
  const progress = 0.96

  return (
    <section className="card flex h-full min-h-72 flex-col">
      <div><p className="eyebrow">Reputasi kerja</p><h2 className="section-title">Trust Score</h2></div>
      <div className="relative mx-auto mt-4 size-44" role="img" aria-label="Trust Score 4,8 dari 5, sangat baik">
        <svg className="size-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <defs><linearGradient id="worker-trust-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#05723c" /><stop offset="1" stopColor="#84bf2f" /></linearGradient></defs>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#edf1ee" strokeWidth="10" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="url(#worker-trust-gradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center"><strong className="font-display text-5xl font-semibold tracking-[-0.06em] text-pull-950">4,8</strong><span className="mt-1 text-[10px] font-extrabold text-pull-600">Sangat baik</span></div>
      </div>
      <Link to="/trust" className="secondary-button mt-auto w-full justify-center">Lihat detail</Link>
    </section>
  )
}

function ActivityPanel({ activities }) {
  return (
    <section className="card h-full">
      <div className="mb-2 flex items-center justify-between gap-4 border-b border-pull-100 pb-4">
        <div className="flex items-center gap-2"><h2 className="section-title">Aktivitas terbaru</h2><span className="rounded-full bg-pull-50 px-2 py-1 text-[8px] font-extrabold text-pull-600">Hari ini</span></div>
        <Link to="/activity" className="text-button">Lihat semua</Link>
      </div>
      <div>
        {activities.slice(0, 4).map((activity) => (
          <Link key={activity.id} to={activityPath(activity)} className="flex items-center gap-3 border-b border-pull-100 py-3.5 last:border-0">
            <ActivityIcon name={activity.icon} tone={activity.tone} />
            <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-extrabold text-pull-800">{activity.title}</p><p className="mt-0.5 truncate text-[9px] text-pull-400">{activity.detail}</p></div>
            {activity.action ? <span className="hidden rounded-lg bg-pull-50 px-2 py-1 text-[8px] font-extrabold text-pull-600 sm:block">{activity.action}</span> : null}
            <span className="shrink-0 text-[8px] font-bold text-pull-400">{activity.time}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function NotificationPanel({ activities }) {
  const notifications = activities.filter((activity) => !activity.read).slice(0, 4)

  return (
    <section className="card h-full">
      <div className="mb-2 flex items-center justify-between gap-4 border-b border-pull-100 pb-4">
        <div className="flex items-center gap-2"><h2 className="section-title">Notifikasi baru</h2><span className="grid size-5 place-items-center rounded-full bg-[#e8f5ec] text-[8px] font-black text-[#08783f]">{notifications.length}</span></div>
        <Link to="/notifications" className="text-button">Lihat semua</Link>
      </div>
      <div>
        {notifications.map((activity) => (
          <Link key={activity.id} to={activityPath(activity)} className="flex items-start gap-3 border-b border-pull-100 py-4 last:border-0">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#0e9855]" />
            <div className="min-w-0 flex-1"><p className="text-[10px] font-extrabold leading-5 text-pull-800">{activity.title}</p><p className="mt-0.5 text-[9px] leading-4 text-pull-400">{activity.detail}</p></div>
            <span className="shrink-0 pt-1 text-[8px] font-bold text-pull-400">{activity.time}</span>
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
  const { profile, applications, activities, certificates, availability, unreadCount, activeApplicationCount, openDialog, handleModalEvent } = useWorkspace()
  const stageEntries = Object.entries(applications)
  const pendingCompletion = applications.Selesai.find((application) => application.confirmable && application.employerConfirmed && !application.workerConfirmed)
  const pendingCompletionCount = applications.Selesai.filter((application) => application.confirmable && application.employerConfirmed && !application.workerConfirmed).length

  return (
    <>
      <header className="relative z-20 mb-7 overflow-visible">
        <div className="relative z-10 py-3 sm:min-h-60 sm:max-w-[58%] sm:py-6 lg:max-w-[54%] lg:py-8">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-pull-500">Sabtu, 18 Juli 2026 · Solo</p>
          <h1 className="mt-3 font-display text-[27px] font-semibold leading-[1.08] tracking-[-0.04em] text-pull-950 sm:text-[36px]">Selamat datang kembali,<span className="mt-1 block">{profile.name} <span aria-hidden="true">👋</span></span></h1>
          <p className="mt-3 max-w-lg text-xs font-medium leading-6 text-pull-500 sm:text-sm">Terus tingkatkan profilmu untuk membuka lebih banyak peluang kerja terbaik di Solo Raya.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3"><AvailabilityDropdown compact value={availability} onChange={(nextValue) => handleModalEvent('set-availability', { availability: nextValue })} /><span className="text-[9px] font-bold text-pull-400">{applications.Interview.filter((item) => item.urgent).length} interview · {unreadCount} update baru</span></div>
        </div>
        <div className="relative h-40 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[48%]"><Image src="/illustrations/worker-dashboard.webp" alt="" fill priority sizes="(min-width: 640px) 48vw, 100vw" className="object-contain object-bottom sm:object-right-bottom" /></div>
      </header>

      <div className="grid grid-cols-12 gap-4 2xl:gap-5">
        <div className="col-span-12 space-y-4 xl:col-span-9">
          <CompletionAlert application={pendingCompletion} onConfirm={() => openDialog('work-confirmation', { appId: pendingCompletion.id, stage: 'Selesai' })} />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardMetric icon={ClipboardList} label="Lamaran aktif" value={String(activeApplicationCount)} detail="+1 dari minggu lalu" trend />
            <DashboardMetric icon={CheckCircle2} label="Perlu konfirmasi" value={String(pendingCompletionCount)} detail="Segera konfirmasi selesai" tone="orange" />
            <DashboardMetric icon={Award} label="Sertifikat dimiliki" value={String(certificates.length)} detail="Terakhir: 3 hari lalu" tone="mint" />
            <DashboardMetric icon={Star} label="PullPoints" value="12 pts" detail="+1 dari konfirmasi terakhir" tone="gold" trend />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-3"><TrustGauge /></div>

        <div className="col-span-12 xl:col-span-6"><ActivityPanel activities={activities} /></div>
        <div className="col-span-12 xl:col-span-6"><NotificationPanel activities={activities} /></div>

        <section className="card col-span-12 xl:col-span-8">
          <SectionHeading eyebrow="Smart matching" title="Peluang teratas untukmu" description="Tiga rekomendasi terbaik hari ini." action={<Link to="/jobs" className="text-button">Lihat semua <ArrowRight size={14} /></Link>} />
          <div className="space-y-3">{jobs.slice(0, 3).map((job) => <JobCard key={job.id} job={job} compact />)}</div>
        </section>
        <section className="card col-span-12 xl:col-span-4">
          <SectionHeading eyebrow="Lamaran saya" title="Ringkasan pipeline" description="Status seluruh proses aktif." action={<Link to="/applications" className="text-button">Kelola <ArrowRight size={14} /></Link>} />
          <div className="space-y-2">{stageEntries.map(([stage, items]) => <Link key={stage} to={`/applications?stage=${stage}`} className="flex items-center gap-3 rounded-xl border border-pull-100 p-3 transition hover:bg-pull-50"><span className="grid size-8 place-items-center rounded-lg bg-pull-50 text-[10px] font-black text-pull-700">{items.length}</span><span className="flex-1 text-[11px] font-extrabold text-pull-800">{stage}</span><ArrowRight size={14} className="text-pull-300" /></Link>)}</div>
        </section>
      </div>
    </>
  )
}
