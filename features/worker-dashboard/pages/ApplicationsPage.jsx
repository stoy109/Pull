import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Wallet,
  XCircle,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useWorkspace } from '../context/WorkspaceContext'
import { EmptyState, PageHeader } from '../components/UI'

const applicationAges = {
  'app-1': 1,
  'app-2': 3,
  'app-3': 4,
  'app-4': 5,
  'app-5': 7,
  'app-6': 36,
  'app-7': 77,
  'app-8': 91,
  'app-9': 2,
}

function tabFromStage(stage) {
  if (stage === 'Diterima') return 'accepted'
  if (stage === 'Ditolak') return 'rejected'
  if (stage === 'Selesai') return 'done'
  if (stage === 'Interview') return 'confirmation'
  if (stage === 'Dilamar' || stage === 'Ditinjau') return 'waiting'
  return 'all'
}

export default function ApplicationsPage() {
  const { applications, openDialog, handleModalEvent } = useWorkspace()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('view') || tabFromStage(searchParams.get('stage')))
  const [category, setCategory] = useState('Semua kategori')
  const [period, setPeriod] = useState('Semua waktu')
  const [query, setQuery] = useState('')

  const allApplications = useMemo(() => Object.entries(applications).flatMap(([stage, items]) => items.map((application) => ({ ...application, stage }))), [applications])
  const tabs = [
    { id: 'all', label: 'Semua', count: allApplications.length },
    { id: 'waiting', label: 'Menunggu respons', count: allApplications.filter((item) => matchesTab(item, 'waiting')).length },
    { id: 'accepted', label: 'Diterima', count: allApplications.filter((item) => matchesTab(item, 'accepted')).length },
    { id: 'confirmation', label: 'Perlu konfirmasi', count: allApplications.filter((item) => matchesTab(item, 'confirmation')).length },
    { id: 'done', label: 'Selesai', count: allApplications.filter((item) => matchesTab(item, 'done')).length },
    { id: 'rejected', label: 'Ditolak', count: allApplications.filter((item) => matchesTab(item, 'rejected')).length },
  ]

  const visibleApplications = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return allApplications
      .filter((item) => matchesTab(item, activeTab))
      .filter((item) => category === 'Semua kategori' || applicationCategory(item) === category)
      .filter((item) => period === 'Semua waktu' || applicationAge(item.id) <= (period === '7 hari terakhir' ? 7 : 30))
      .filter((item) => !normalized || `${item.company} ${item.role} ${item.location || ''}`.toLowerCase().includes(normalized))
      .sort((first, second) => applicationPriority(first) - applicationPriority(second))
  }, [allApplications, activeTab, category, period, query])

  const selectTab = (tab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'all' ? {} : { view: tab }, { replace: true })
  }

  return (
    <>
      <PageHeader
        eyebrow="Perjalanan kerja"
        title="Lamaran Saya"
        description="Pantau status semua lamaran kerja, jadwal, dan konfirmasi selesai."
        actions={<Link to="/jobs" className="secondary-button h-11 border-pull-300 px-5 text-pull-800">Cari loker baru <ArrowRight size={15} /></Link>}
      />

      <nav className="hide-scrollbar flex overflow-x-auto border-b border-pull-100" aria-label="Filter status lamaran">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab.id)}
            className={`relative flex min-h-14 shrink-0 items-center gap-2 px-4 text-[10px] font-extrabold transition sm:px-5 ${activeTab === tab.id ? 'text-[#08783f]' : 'text-pull-500 hover:text-pull-800'}`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
            <span className={`grid min-w-6 place-items-center rounded-full px-1.5 py-1 text-[8px] ${activeTab === tab.id ? 'bg-[#08783f] text-white' : tab.id === 'confirmation' && tab.count ? 'bg-[#f47b0c] text-white' : tab.id === 'rejected' && tab.count ? 'bg-[#d43d3d] text-white' : 'bg-pull-100 text-pull-500'}`}>{tab.count}</span>
            {activeTab === tab.id ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#08783f]" /> : null}
          </button>
        ))}
      </nav>

      <section className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,.8fr)_minmax(0,.8fr)_minmax(0,1.4fr)]">
        <FilterSelect label="Kategori" value={category} onChange={setCategory} options={['Semua kategori', 'F&B', 'Retail', 'Produksi', 'Administrasi']} />
        <FilterSelect label="Waktu" value={period} onChange={setPeriod} options={['Semua waktu', '7 hari terakhir', '30 hari terakhir']} />
        <label className="flex min-h-18 items-center gap-3 rounded-[16px] border border-pull-100 bg-white px-4 transition focus-within:border-pull-300 focus-within:ring-4 focus-within:ring-pull-100/45"><Search size={20} className="text-pull-400" /><span className="sr-only">Cari lamaran</span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Cari nama UMKM atau jenis pekerjaan..." className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold text-pull-800 outline-none placeholder:text-pull-400" /></label>
      </section>

      <p className="mt-5 text-[11px] font-bold text-pull-500">Menampilkan <strong className="text-[#08783f]">{visibleApplications.length}</strong> lamaran</p>

      <section className="mt-4 space-y-3">
        {visibleApplications.length ? visibleApplications.map((application) => (
          <ApplicationRow key={application.id} application={application} onWhatsApp={() => handleModalEvent('contact-employer', { application })} onConfirm={() => openDialog('work-confirmation', { appId: application.id, stage: 'Selesai' })} />
        )) : (
          <EmptyState title="Belum ada lamaran di kategori ini" description="Ubah filter atau cari peluang kerja baru di Papan Loker." action={<Link to="/jobs" className="primary-button">Cari loker</Link>} />
        )}
      </section>
    </>
  )
}

function ApplicationRow({ application, onWhatsApp, onConfirm }) {
  const state = applicationState(application)
  const StatusIcon = state.icon
  const trustScore = applicationTrust(application)
  const category = applicationCategory(application)

  return (
    <article className={`relative overflow-hidden rounded-[18px] border bg-white p-4 shadow-[0_8px_24px_rgba(18,59,48,.025)] ${state.border}`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${state.accent}`} />
      <div className="grid gap-4 pl-1 lg:grid-cols-[minmax(220px,.8fr)_minmax(320px,1.35fr)_minmax(190px,.65fr)] lg:items-center">
        <div className="flex items-center gap-3">
          <div className={`grid size-14 shrink-0 place-items-center rounded-full text-sm font-black ${companyTone(application.company)}`}>{companyInitials(application.company)}</div>
          <div className="min-w-0"><div className="flex items-center gap-1.5"><p className="truncate text-xs font-extrabold text-pull-950">{application.company}</p><ShieldCheck size={14} className="shrink-0 text-[#0e9855]" fill="currentColor" /></div><p className="mt-1 flex items-center gap-1 text-[9px] font-bold text-pull-500"><ShieldCheck size={11} /> {trustScore} · {trustScore >= 80 ? 'Sangat baik' : 'Baik'}</p></div>
        </div>

        <div>
          <Link to={`/applications/${application.id}`} className="font-display text-lg font-semibold tracking-[-0.025em] text-pull-950 hover:text-pull-600">{application.role}</Link>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] font-semibold text-pull-500">
            <span className="flex items-center gap-1"><MapPin size={12} /> {application.location || 'Solo Raya'}</span>
            <span className="flex items-center gap-1"><CalendarDays size={12} /> {applicationDuration(application)}</span>
            <span className="flex items-center gap-1"><Wallet size={12} /> {application.pay || 'Upah sesuai loker'}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] text-pull-400"><span>Dilamar: {application.appliedDate || application.time}</span><span className="rounded-lg bg-pull-50 px-2 py-1 font-extrabold text-pull-600">{category}</span>{application.rated ? <span className="font-extrabold text-[#d69208]">★★★★★ Rating diberikan</span> : null}</div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-stretch">
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-extrabold ${state.badge}`}><StatusIcon size={13} /> {state.label}</span>
          <ApplicationAction application={application} state={state} onWhatsApp={onWhatsApp} onConfirm={onConfirm} />
        </div>
      </div>
    </article>
  )
}

function ApplicationAction({ application, state, onWhatsApp, onConfirm }) {
  if (state.action === 'whatsapp') return <button type="button" onClick={onWhatsApp} className="whatsapp-button w-full"><FaWhatsapp size={16} /> Hubungi via WhatsApp</button>
  if (state.action === 'jobs') return <Link to="/jobs" className="secondary-button w-full justify-center border-pull-300 text-pull-800">Cari loker lain</Link>
  if (state.action === 'confirm') return <button type="button" onClick={onConfirm} className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#ed7600] px-4 text-[10px] font-extrabold text-white shadow-sm hover:bg-[#d96c00]">Konfirmasi selesai</button>
  const label = state.action === 'interview' ? 'Atur interview' : state.action === 'certificate' ? 'Lihat hasil kerja' : 'Lihat detail'
  return <Link to={`/applications/${application.id}`} className="secondary-button w-full justify-center">{label}</Link>
}

function FilterSelect({ label, value, onChange, options }) {
  return <label className="rounded-[16px] border border-pull-100 bg-white px-4 py-3"><span className="block text-[8px] font-extrabold text-pull-500">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-8 w-full bg-transparent text-[10px] font-extrabold text-pull-800 outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function matchesTab(application, tab) {
  if (tab === 'all') return true
  if (tab === 'waiting') return application.stage === 'Dilamar' || application.stage === 'Ditinjau' || (application.stage === 'Interview' && !application.urgent)
  if (tab === 'accepted') return application.stage === 'Diterima'
  if (tab === 'confirmation') return (application.stage === 'Interview' && application.urgent) || (application.stage === 'Selesai' && application.confirmable && !application.workerConfirmed)
  if (tab === 'done') return application.stage === 'Selesai' && (!application.confirmable || application.workerConfirmed)
  if (tab === 'rejected') return application.stage === 'Ditolak'
  return true
}

function applicationState(application) {
  if (application.stage === 'Ditolak') return { label: 'Tidak diterima', badge: 'bg-[#feecec] text-[#c83e3e]', border: 'border-[#f1d6d6]', accent: 'bg-[#e55a5a]', icon: XCircle, action: 'jobs' }
  if (application.stage === 'Selesai' && application.confirmable && !application.workerConfirmed) return { label: 'Perlu konfirmasi', badge: 'bg-[#fff0e2] text-[#d96800]', border: 'border-[#f3cda8]', accent: 'bg-[#f47b0c]', icon: Clock3, action: 'confirm' }
  if (application.stage === 'Interview' && application.urgent) return { label: 'Perlu konfirmasi', badge: 'bg-[#fff0e2] text-[#d96800]', border: 'border-[#f3cda8]', accent: 'bg-[#f47b0c]', icon: Clock3, action: 'interview' }
  if (application.stage === 'Diterima') return { label: 'Diterima', badge: 'bg-[#eaf6ee] text-[#08783f]', border: 'border-pull-100', accent: 'bg-[#0e9855]', icon: CheckCircle2, action: 'whatsapp' }
  if (application.stage === 'Selesai') return { label: 'Selesai', badge: 'bg-[#edf0f3] text-[#65717a]', border: 'border-pull-100', accent: 'bg-[#aab3ba]', icon: CheckCircle2, action: 'certificate' }
  return { label: 'Menunggu respons', badge: 'bg-[#fff4e8] text-[#b86a24]', border: 'border-pull-100', accent: 'bg-[#e8aa65]', icon: Clock3, action: 'detail' }
}

function applicationCategory(application) {
  const value = `${application.role} ${application.company}`.toLowerCase()
  if (value.includes('admin')) return 'Administrasi'
  if (value.includes('packing') || value.includes('produksi')) return 'Produksi'
  if (value.includes('dapur') || value.includes('kasir') || value.includes('crew')) return 'F&B'
  return 'Retail'
}

function applicationDuration(application) {
  if (application.workSchedule?.time) return application.workSchedule.time
  if (application.stage === 'Selesai') return 'Pekerjaan selesai'
  if (application.stage === 'Interview') return 'Jadwal interview'
  return 'Proses aktif'
}

function applicationAge(id) {
  if (id.startsWith('job-application-')) return 0
  return applicationAges[id] ?? 30
}

function applicationPriority(application) {
  if (matchesTab(application, 'confirmation')) return 0
  if (application.stage === 'Diterima') return 1
  if (matchesTab(application, 'waiting')) return 2
  if (application.stage === 'Selesai') return 3
  return 4
}

function applicationTrust(application) {
  return 70 + application.company.split('').reduce((total, character) => total + character.charCodeAt(0), 0) % 25
}

function companyInitials(company) {
  return company.split(' ').slice(0, 2).map((word) => word[0]).join('')
}

function companyTone(company) {
  const tones = ['bg-[#e5efe8] text-[#285f45]', 'bg-[#eee5d5] text-[#785a20]', 'bg-[#e3ebef] text-[#42687a]', 'bg-[#ece6f2] text-[#635283]']
  return tones[company.length % tones.length]
}
