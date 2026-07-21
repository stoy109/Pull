import Image from 'next/image'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  FileText,
  IdCard,
  MessageCircle,
  Search,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import { jobs } from '../data/mockData'
import { useWorkspace } from '../context/WorkspaceContext'
import { ActivityIcon, JobCard, SectionHeading } from '../components/UI'
import AvailabilityDropdown from '../components/AvailabilityDropdown'

function CommandCenter() {
  const navigate = useNavigate()
  const { profile, applications, unreadCount, activeApplicationCount } = useWorkspace()
  const pendingInterview = applications.Interview.find((application) => application.urgent)
  const routeSteps = [
    { label: 'Profil', value: `${profile.completion}%`, state: 'done' },
    { label: 'Verifikasi', value: profile.ktpStatus === 'verified' ? 'Level 2' : 'Level 1', state: 'done' },
    { label: 'Lamaran', value: `${activeApplicationCount} aktif`, state: 'current' },
    { label: 'Kerja', value: 'Tujuanmu', state: 'next' },
  ]

  return (
    <section className="command-card" aria-labelledby="command-title">
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2.5"><span className="live-dot"><span /></span><p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-white/65">Rute siap kerja · diperbarui langsung</p></div><span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] font-bold text-white/70">18 Juli — 25 Juli</span></div>
        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(250px,.75fr)]">
          <div><p className="mb-2 text-xs font-bold text-[#9dd5b7]">Langkah terbaik berikutnya</p><h2 id="command-title" className="max-w-[660px] font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.035em] text-white sm:text-[34px]">{pendingInterview ? 'Konfirmasi interviewmu sebelum pukul 11.30.' : 'Profilmu siap. Peluang baru menantimu.'}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/62">{pendingInterview ? `${pendingInterview.company} mengundangmu untuk posisi ${pendingInterview.role} hari ini.` : 'Smart matching sudah memperbarui rekomendasi berdasarkan skill dan jarakmu.'}</p><div className="mt-5 flex flex-wrap gap-2.5"><button onClick={() => navigate(pendingInterview ? `/applications/${pendingInterview.id}` : '/jobs')} className="command-primary">{pendingInterview ? 'Konfirmasi sekarang' : 'Lihat rekomendasi'} <ArrowRight size={16} /></button><button onClick={() => navigate('/settings')} className="command-secondary">Atur preferensi</button></div></div>
          <div className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/48">Kesiapan profil</p><span className="text-sm font-extrabold text-[#bce5ce]">{profile.completion}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#87caa5]" style={{ width: `${profile.completion}%` }} /></div><div className="mt-4 grid grid-cols-3 gap-2"><MiniMetric label="Trust" value="4,8" change="12 ulasan" /><MiniMetric label="Lamaran" value={String(activeApplicationCount)} change="aktif" /><MiniMetric label="Update" value={String(unreadCount)} change="baru" /></div></div>
        </div>
        <div className="route-track mt-8">{routeSteps.map((step, index) => <div key={step.label} className={`route-step route-${step.state}`}><div className="route-node">{step.state === 'done' ? <Check size={11} strokeWidth={3} /> : index + 1}</div><div><p>{step.label}</p><strong>{step.value}</strong></div></div>)}</div>
      </div>
    </section>
  )
}

function MiniMetric({ label, value, change }) {
  return <div className="rounded-xl bg-black/10 px-2.5 py-2.5"><p className="text-[9px] font-bold text-white/45">{label}</p><div className="mt-1 flex items-end gap-1"><strong className="text-base font-extrabold text-white">{value}</strong><span className="mb-0.5 text-[8px] font-extrabold text-[#9dd5b7]">{change}</span></div></div>
}

function PriorityCard() {
  const { applications, profile, certificates, openDialog } = useWorkspace()
  const interview = applications.Interview.find((application) => application.urgent)
  const priorities = [
    { id: 'interview', icon: MessageCircle, title: interview ? 'Konfirmasi interview hari ini' : 'Interview sudah dikonfirmasi', detail: interview ? 'Warung Mapan menunggu jawaban sebelum 11.30.' : 'Tidak ada undangan mendesak.', action: interview ? 'Buka' : 'Selesai', done: !interview, path: interview ? `/applications/${interview.id}` : '/applications' },
    { id: 'identity', icon: IdCard, title: profile.ktpStatus === 'not_started' ? 'Ajukan verifikasi KTP' : 'KTP sedang diperiksa', detail: 'Opsional. Badge membantu profil tampil lebih tinggi.', action: profile.ktpStatus === 'not_started' ? 'Mulai' : 'Diperiksa', done: profile.ktpStatus !== 'not_started', modal: 'kyc' },
    { id: 'certificate', icon: Award, title: 'Buktikan skill Kasir digital', detail: 'Skill ini muncul di 14 lowongan cocok.', action: 'Upload', done: certificates.some((item) => item.name.includes('Kasir Digital')), modal: 'certificate' },
  ]
  return <section className="card h-full"><SectionHeading eyebrow="Prioritas" title="Perlu diselesaikan" description="Tiga langkah paling berdampak hari ini." /><div className="space-y-2.5">{priorities.map((item) => { const Icon = item.icon; const content = <><div className="priority-icon">{item.done ? <CheckCircle2 size={18} /> : <Icon size={18} />}</div><div className="min-w-0 flex-1"><p className="text-xs font-extrabold leading-5 text-pull-950">{item.title}</p><p className="mt-0.5 text-[10px] leading-[1.55] text-pull-500">{item.detail}</p></div><span className="text-[10px] font-extrabold text-pull-700">{item.action}</span></>; return item.path ? <Link key={item.id} to={item.path} className={`priority-item priority-${item.id === 'interview' ? 'urgent' : item.id === 'identity' ? 'brand' : 'warm'} ${item.done ? 'opacity-60' : ''}`}>{content}</Link> : <button key={item.id} disabled={item.done} onClick={() => openDialog(item.modal)} className={`priority-item w-full text-left priority-${item.id === 'identity' ? 'brand' : 'warm'} ${item.done ? 'opacity-60' : ''}`}>{content}</button> })}</div></section>
}

function QuickActions() {
  const { openDialog } = useWorkspace()
  const items = [
    { label: 'Lengkapi Profil', icon: UserRound, modal: 'profile' },
    { label: 'Cari Loker', icon: Search, path: '/jobs', primary: true },
    { label: 'Upload Sertifikat', icon: Award, modal: 'certificate' },
    { label: 'Tambah Portofolio', icon: Camera, modal: 'portfolio' },
    { label: 'Kontak Employer', icon: MessageCircle, modal: 'messages' },
    { label: 'Lihat Interview', icon: CalendarDays, path: '/applications' },
    { label: 'Generate CV', icon: FileText, modal: 'cv' },
  ]
  return <section><div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-extrabold text-pull-900">Aksi cepat</h2><span className="text-[10px] font-bold text-pull-400">Yang sering kamu butuhkan</span></div><div className="quick-actions-grid">{items.map((item) => { const Icon = item.icon; const className = `quick-action ${item.primary ? 'quick-action-primary' : ''}`; const content = <><Icon size={17} /><span>{item.label}</span></>; return item.path ? <Link key={item.label} to={item.path} className={className}>{content}</Link> : <button key={item.label} onClick={() => openDialog(item.modal)} className={className}>{content}</button> })}</div></section>
}

export default function DashboardPage() {
  const { profile, applications, activities, availability, unreadCount, handleModalEvent } = useWorkspace()
  const navigate = useNavigate()
  const stageEntries = Object.entries(applications)
  return (
    <>
      <header className="relative z-20 mb-7 overflow-visible">
        <div className="relative z-10 py-3 sm:min-h-60 sm:max-w-[58%] sm:py-6 lg:max-w-[54%] lg:py-8"><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-pull-500">Sabtu, 18 Juli 2026 · Solo</p><h1 className="mt-3 font-display text-[27px] font-semibold leading-[1.08] tracking-[-0.04em] text-pull-950 sm:text-[36px]">Selamat datang kembali,<span className="mt-1 block">{profile.name} <span aria-hidden="true">👋</span></span></h1><p className="mt-3 max-w-lg text-xs font-medium leading-6 text-pull-500 sm:text-sm">Terus tingkatkan profilmu untuk membuka lebih banyak peluang kerja terbaik di Solo Raya.</p><div className="mt-4 flex flex-wrap items-center gap-3"><AvailabilityDropdown compact value={availability} onChange={(nextValue) => handleModalEvent('set-availability', { availability: nextValue })} /><span className="text-[9px] font-bold text-pull-400">{applications.Interview.filter((item) => item.urgent).length} interview · {unreadCount} update baru</span></div></div>
        <div className="relative h-40 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[48%]"><Image src="/illustrations/worker-dashboard.webp" alt="" fill priority sizes="(min-width: 640px) 48vw, 100vw" className="object-contain object-bottom sm:object-right-bottom" /></div>
      </header>
      <div className="grid grid-cols-12 gap-4 2xl:gap-5"><div className="col-span-12 xl:col-span-8"><CommandCenter /></div><div className="col-span-12 xl:col-span-4"><PriorityCard /></div><div className="col-span-12 mt-1"><QuickActions /></div>
        <section className="card col-span-12 mt-2 xl:col-span-8"><SectionHeading eyebrow="Smart matching" title="Peluang teratas untukmu" description="Tiga rekomendasi terbaik hari ini." action={<Link to="/jobs" className="text-button">Lihat semua <ArrowRight size={14} /></Link>} /><div className="space-y-3">{jobs.slice(0, 3).map((job) => <JobCard key={job.id} job={job} compact />)}</div></section>
        <section className="card col-span-12 mt-2 xl:col-span-4"><SectionHeading eyebrow="Lamaran saya" title="Ringkasan pipeline" description="Status seluruh proses aktif." action={<Link to="/applications" className="text-button">Kelola <ArrowRight size={14} /></Link>} /><div className="space-y-2">{stageEntries.map(([stage, items]) => <Link key={stage} to={`/applications?stage=${stage}`} className="flex items-center gap-3 rounded-xl border border-pull-100 p-3 transition hover:bg-pull-50"><span className="grid size-8 place-items-center rounded-lg bg-pull-50 text-[10px] font-black text-pull-700">{items.length}</span><span className="flex-1 text-[11px] font-extrabold text-pull-800">{stage}</span><ArrowRight size={14} className="text-pull-300" /></Link>)}</div></section>
        <section className="card col-span-12 xl:col-span-5"><SectionHeading eyebrow="Reputasi" title="Trust Score 4,8" description="12 ulasan dari pekerjaan terkonfirmasi." action={<Link to="/trust" className="text-button">Rincian <ArrowRight size={14} /></Link>} /><div className="trust-score-panel"><div className="flex items-end gap-2"><strong className="font-display text-5xl font-semibold text-white">4,8</strong><span className="mb-1 text-xs font-bold text-white/40">/ 5</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[96%] rounded-full bg-[#91cdaa]" /></div><p className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#afe0c3]"><TrendingUp size={13} /> Naik 0,2 dalam enam minggu</p></div></section>
        <section className="card col-span-12 xl:col-span-7"><SectionHeading eyebrow="Realtime" title="Aktivitas terbaru" description="Perubahan penting dari employer dan Pull." action={<Link to="/activity" className="text-button">Lihat semua <ArrowRight size={14} /></Link>} /><div className="grid gap-2 md:grid-cols-3">{activities.slice(0, 3).map((activity) => <button key={activity.id} onClick={() => navigate(activity.title.includes('Interview') ? '/applications/app-4' : activity.title.includes('Sertifikat') ? '/certificates' : '/activity')} className="flex gap-3 rounded-[16px] border border-pull-100 p-3 text-left transition hover:bg-pull-50"><ActivityIcon name={activity.icon} tone={activity.tone} /><span><span className="block text-[10px] font-extrabold text-pull-800">{activity.title}</span><span className="mt-1 block text-[9px] leading-relaxed text-pull-400">{activity.time}</span></span></button>)}</div></section>
      </div>
    </>
  )
}
