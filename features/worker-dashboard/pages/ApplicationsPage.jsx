import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  LayoutGrid,
  MapPin,
  Search,
  Star,
  Wallet,
  XCircle,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { applicationTabCounts } from '../data/mockData'
import { useWorkspace } from '../context/WorkspaceContext'
import { VerifiedUmkmIcon } from '../components/UI'

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

const tabStyles = {
  all: { icon: LayoutGrid, shortLabel: 'Semua', tone: 'plain' },
  waiting: { icon: Clock3, shortLabel: 'Menunggu', tone: 'orange' },
  confirmation: { icon: CircleAlert, shortLabel: 'Konfirmasi', tone: 'orange' },
  accepted: { icon: BadgeCheck, shortLabel: 'Diterima', tone: 'green' },
  done: { icon: CheckCircle2, shortLabel: 'Selesai', tone: 'green' },
  rejected: { icon: XCircle, shortLabel: 'Ditolak', tone: 'gray' },
}

const referenceApplicationOrder = ['app-7', 'app-6', 'app-8', 'app-3', 'app-9']
const referenceApplicationContent = {
  'app-7': { company: 'Batik Laweyan Bu Sari', role: 'Buruh Cuci Kain Batik', location: 'Laweyan, Solo', duration: '3 hari', pay: 'Rp 120.000 / hari', totalPay: 'Rp 360.000', workPeriod: '25–27 Juli 2026', appliedDate: '20 Juli 2026', trustScore: 82, logoImage: '/illustrations/batik-laweyan-logo.svg' },
  'app-6': { company: 'Warung Makan Pak Joko', role: 'Asisten Dapur', location: 'Serengan, Solo', duration: '1 minggu', pay: 'Rp 80.000 / hari', appliedDate: '18 Juli 2026', trustScore: 74 },
  'app-8': { company: 'Tani Makmur Solo', role: 'Tenaga Panen Padi', location: 'Jebres, Solo', duration: '2 hari', pay: 'Rp 95.000 / hari', appliedDate: '14 Juli 2026', trustScore: 68 },
  'app-3': { company: 'Konveksi Maju Jaya', role: 'Tenaga Jahit Harian', location: 'Pasar Kliwon, Solo', duration: '5 hari', pay: 'Rp 110.000 / hari', appliedDate: '10 Juli 2026', trustScore: 79 },
  'app-9': { company: 'UD Karya Mandiri', role: 'Kuli Angkut Barang', location: 'Banjarsari, Solo', duration: '1 hari', pay: 'Rp 70.000 / hari', appliedDate: '5 Juli 2026', trustScore: 61 },
}

export default function ApplicationsPage() {
  const { applications, openDialog, handleModalEvent } = useWorkspace()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('view') || tabFromStage(searchParams.get('stage')))
  const [category, setCategory] = useState('Semua kategori')
  const [period, setPeriod] = useState('Semua waktu')
  const [query, setQuery] = useState('')

  const allApplications = useMemo(() => Object.entries(applications).flatMap(([stage, items]) => items.map((application) => ({ ...application, stage, ...referenceApplicationContent[application.id] }))), [applications])
  const tabs = [
    { id: 'all', label: 'Semua', count: applicationTabCounts.all },
    { id: 'waiting', label: 'Menunggu Respons', count: applicationTabCounts.waiting },
    { id: 'confirmation', label: 'Perlu Konfirmasi', count: applicationTabCounts.confirmation },
    { id: 'accepted', label: 'Diterima', count: applicationTabCounts.accepted },
    { id: 'done', label: 'Selesai', count: applicationTabCounts.done },
    { id: 'rejected', label: 'Ditolak', count: applicationTabCounts.rejected },
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

  const showingReferenceTotal = activeTab === 'all' && category === 'Semua kategori' && period === 'Semua waktu' && !query.trim()

  return (
    <>
      <nav className="grid grid-cols-6 border-b border-[#dfe7e2]" aria-label="Filter status lamaran">
        {tabs.map((tab) => (
          <ApplicationTab key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => selectTab(tab.id)} />
        ))}
      </nav>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,.78fr)_minmax(0,.78fr)_minmax(0,1.4fr)]">
        <FilterSelect label="Kategori" value={category} onChange={setCategory} options={['Semua kategori', 'F&B', 'Retail', 'Produksi', 'Administrasi']} />
        <FilterSelect label="Waktu" value={period} onChange={setPeriod} options={['Semua waktu', '7 hari terakhir', '30 hari terakhir']} />
        <label className="col-span-2 flex h-[70px] items-center gap-3 rounded-lg border border-[#dfe7e2] bg-white px-5 transition focus-within:border-pull-300 focus-within:ring-4 focus-within:ring-pull-100/45 lg:col-span-1"><Search size={22} className="shrink-0 text-[#70837b]" /><span className="sr-only">Cari lamaran</span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Cari nama UMKM atau jenis pekerjaan..." className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-pull-800 outline-none placeholder:text-[#98a59f]" /></label>
      </section>

      <p className="mt-5 text-xs font-semibold text-[#64766f]">Menampilkan <strong className="font-extrabold text-[#0b8a45]">{showingReferenceTotal ? applicationTabCounts.all : visibleApplications.length}</strong> lamaran</p>

      <section className="mt-5 space-y-2.5">
        {visibleApplications.map((application) => (
          <ApplicationRow key={application.id} application={application} onWhatsApp={() => handleModalEvent('contact-employer', { application })} onConfirm={() => openDialog('work-confirmation', { appId: application.id, stage: 'Selesai', application })} onRating={() => openDialog('work-rating', { appId: application.id, stage: 'Selesai', application })} />
        ))}
      </section>
    </>
  )
}

function ApplicationTab({ tab, active, onClick }) {
  const style = tabStyles[tab.id]
  const Icon = style.icon
  const plainCount = style.tone === 'plain'
  const tone = style.tone === 'orange' ? 'text-[#e86f00]' : style.tone === 'gray' || plainCount ? 'text-[#7d898f]' : 'text-[#08783f]'
  const countTone = style.tone === 'orange' ? 'bg-[#ef7300] text-white' : style.tone === 'gray' ? 'bg-[#89939a] text-white' : plainCount ? 'text-[#52645c]' : 'bg-[#08783f] text-white'

  return (
    <button type="button" onClick={onClick} className={`relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-3 text-[8px] font-extrabold transition lg:min-h-14 lg:flex-row lg:gap-1.5 lg:px-2 lg:text-[9px] ${active ? 'text-[#08783f]' : 'text-[#26362f] hover:text-[#08783f]'}`} aria-current={active ? 'page' : undefined}>
      <span className={`relative lg:hidden ${tone}`}><Icon size={18} strokeWidth={2.3} />{tab.count ? <span className={`absolute grid place-items-center text-[7px] ${plainCount ? '-right-3 -top-1 font-black' : '-right-2.5 -top-2 size-4 rounded-full'} ${countTone}`}>{tab.count}</span> : null}</span>
      <span className="max-w-full truncate lg:hidden">{style.shortLabel}</span>
      <span className="hidden min-w-0 truncate whitespace-nowrap lg:inline">{tab.label}</span>
      <span className={`hidden place-items-center px-1.5 py-1 text-[8px] lg:grid ${plainCount ? 'min-w-0 font-black' : 'min-w-6 rounded-full'} ${countTone}`}>{tab.count}</span>
      {tab.id === 'confirmation' ? <span className="hidden size-2 shrink-0 rounded-full bg-[#ff7a00] ring-4 ring-[#fff0df] lg:block" /> : null}
      {active ? <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#08783f]" /> : null}
    </button>
  )
}

function ApplicationRow({ application, onWhatsApp, onConfirm, onRating }) {
  const state = applicationState(application)
  const StatusIcon = state.icon
  const trustScore = applicationTrust(application)

  return (
    <article className={`relative overflow-hidden rounded-lg border shadow-[0_4px_14px_rgba(20,55,43,.035)] ${state.border} ${state.surface}`}>
      <span className={`absolute inset-y-0 left-0 w-[3px] ${state.accent}`} />
      <div className="grid gap-1.5 px-4 py-3.5 pl-5 lg:min-h-[82px] lg:grid-cols-[minmax(180px,.9fr)_minmax(270px,1.55fr)_minmax(190px,.65fr)] lg:items-center lg:gap-4 lg:px-5 lg:py-2.5">
        <div className="flex min-w-0 items-center gap-3 pr-24 lg:pr-0">
          <div className={`relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white text-[11px] font-black shadow-sm lg:size-12 ${companyTone(application.company)}`}>{application.logoImage ? <Image src={application.logoImage} alt={`Logo ${application.company}`} fill sizes="48px" className="object-cover" /> : companyInitials(application.company)}</div>
          <div className="min-w-0"><div className="flex items-center gap-1.5"><p className="truncate text-[11px] font-extrabold text-[#17251f]">{application.company}</p><VerifiedUmkmIcon className="size-[13px] shrink-0" /></div><p className="mt-1 hidden items-center gap-1 text-[9px] font-bold text-[#5d7068] lg:flex"><Star size={10} className="shrink-0 fill-[#e2a500] text-[#e2a500]" /> {trustScore} — {trustScore >= 80 ? 'Sangat Baik' : trustScore >= 70 ? 'Baik' : 'Cukup Baik'}</p></div>
        </div>

        <div className="ml-14 min-w-0 lg:m-0">
          <Link to={`/applications/${application.id}`} className="text-xs font-extrabold text-[#17251f] hover:text-pull-600 lg:text-sm">{application.role}</Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-y-1.5 text-[8px] font-semibold text-[#566a61] lg:text-[9px]">
            <span className="flex items-center gap-1.5 pr-3"><MapPin size={12} /> {application.location || 'Solo Raya'}</span>
            <span className="flex items-center gap-1.5 border-l border-[#d9e2dd] px-3"><CalendarDays size={12} /> {applicationDuration(application)}</span>
            <span className="flex items-center gap-1.5 border-l border-[#d9e2dd] pl-3"><Wallet size={12} /> {application.pay || 'Upah sesuai loker'}</span>
          </div>
          <ApplicationSupplement application={application} />
        </div>

        <div className="absolute right-3 top-3 flex flex-col items-end gap-2 lg:static lg:items-stretch">
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-[9px] font-extrabold lg:self-start ${state.badge}`}><StatusIcon size={12} /> {state.label}{state.attention ? <span className="size-1.5 rounded-full bg-[#ff7900] ring-2 ring-[#ffe3c7]" /> : null}</span>
          <div className="hidden lg:block"><ApplicationAction application={application} state={state} onWhatsApp={onWhatsApp} onConfirm={onConfirm} onRating={onRating} /></div>
        </div>
      </div>
    </article>
  )
}

function ApplicationSupplement({ application }) {
  if (application.rated) {
    return <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[8px] font-bold"><span className="text-[#e69a00]">★★★★★ <span className="ml-1 text-[#697a73]">Rating diberikan</span></span><span className="text-[#0b8a45]">+1 PullPoints diperoleh</span></div>
  }

  return <p className="mt-1.5 hidden text-[8px] font-medium text-[#77867f] lg:block">Dilamar: {application.appliedDate || application.time}</p>
}

function ApplicationAction({ application, state, onWhatsApp, onConfirm, onRating }) {
  if (state.action === 'whatsapp') return <button type="button" onClick={onWhatsApp} className="inline-flex h-8 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#07843f] px-3 text-[9px] font-extrabold text-white hover:bg-[#066f36]"><FaWhatsapp size={14} /> Hubungi via WhatsApp</button>
  if (state.action === 'jobs') return <Link to="/jobs" className="inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-md border border-[#4da171] bg-white px-3 text-[9px] font-extrabold text-[#08783f] hover:bg-[#f2faf5]">Cari Loker Lain</Link>
  if (state.action === 'confirm') return <button type="button" onClick={onConfirm} className="inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-md bg-[#ed7600] px-3 text-[9px] font-extrabold text-white shadow-sm hover:bg-[#d96c00]">Konfirmasi Selesai</button>
  if (state.action === 'rating') return <button type="button" onClick={onRating} className="inline-flex h-8 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#07843f] px-3 text-[9px] font-extrabold text-white hover:bg-[#066f36]"><Star size={13} fill="currentColor" /> Beri Rating</button>
  const label = state.action === 'interview' ? 'Atur Interview' : state.action === 'certificate' ? 'Lihat Sertifikat' : 'Lihat Detail'
  return <Link to={`/applications/${application.id}`} className="inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-md border border-[#4da171] bg-white px-3 text-[9px] font-extrabold text-[#08783f] hover:bg-[#f2faf5]">{label}</Link>
}

function FilterSelect({ label, value, onChange, options }) {
  return <label className="flex h-[70px] min-w-0 flex-col justify-center rounded-lg border border-[#dfe7e2] bg-white px-5"><span className="text-[9px] font-extrabold text-[#53665d]">{label}</span><span className="relative mt-1 flex min-w-0 items-center"><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent pr-8 text-xs font-extrabold text-[#17251f] outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-0 text-[#17251f]" /></span></label>
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
  if (application.stage === 'Ditolak') return { label: 'Tidak Diterima', badge: 'bg-[#fff0f0] text-[#df4141]', border: 'border-[#e7ece9]', accent: 'bg-[#ff5660]', surface: 'bg-white', icon: XCircle, action: 'jobs' }
  if (application.stage === 'Selesai' && application.confirmable && !application.workerConfirmed) return { label: 'Perlu Konfirmasi', badge: 'bg-[#fff2e5] text-[#e66e00]', border: 'border-[#ffc36f]', accent: 'bg-[#ff7900]', surface: 'bg-[#fffdfa]', icon: CircleAlert, action: 'confirm', attention: true }
  if (application.stage === 'Selesai' && application.confirmable && !application.employerConfirmed) return { label: 'Menunggu UMKM', badge: 'bg-[#fff4e8] text-[#d26b00]', border: 'border-[#e2e9e5]', accent: 'bg-transparent', surface: 'bg-white', icon: Clock3, action: 'detail' }
  if (application.stage === 'Interview' && application.urgent) return { label: 'Perlu Konfirmasi', badge: 'bg-[#fff2e5] text-[#e66e00]', border: 'border-[#ffc36f]', accent: 'bg-[#ff7900]', surface: 'bg-[#fffdfa]', icon: CircleAlert, action: 'interview', attention: true }
  if (application.stage === 'Diterima') return { label: 'Diterima', badge: 'bg-[#eaf6ee] text-[#08783f]', border: 'border-[#e2e9e5]', accent: 'bg-[#0e9855]', surface: 'bg-white', icon: CheckCircle2, action: 'whatsapp' }
  if (application.stage === 'Selesai') return { label: 'Selesai', badge: 'bg-[#edf0f3] text-[#7c8890]', border: 'border-[#e2e9e5]', accent: 'bg-transparent', surface: 'bg-white', icon: CheckCircle2, action: application.rated ? 'certificate' : 'rating' }
  return { label: 'Menunggu Respons', badge: 'bg-[#fff4e8] text-[#d26b00]', border: 'border-[#e2e9e5]', accent: 'bg-transparent', surface: 'bg-white', icon: Clock3, action: 'detail' }
}

function applicationCategory(application) {
  const value = `${application.role} ${application.company}`.toLowerCase()
  if (value.includes('admin')) return 'Administrasi'
  if (value.includes('packing') || value.includes('produksi')) return 'Produksi'
  if (value.includes('dapur') || value.includes('kasir') || value.includes('crew')) return 'F&B'
  return 'Retail'
}

function applicationDuration(application) {
  if (application.duration) return application.duration
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
  const referenceIndex = referenceApplicationOrder.indexOf(application.id)
  if (referenceIndex !== -1) return referenceIndex
  if (matchesTab(application, 'confirmation')) return 10
  if (application.stage === 'Diterima') return 11
  if (matchesTab(application, 'waiting')) return 12
  if (application.stage === 'Selesai') return 13
  return 14
}

function applicationTrust(application) {
  if (application.trustScore) return application.trustScore
  return 70 + application.company.split('').reduce((total, character) => total + character.charCodeAt(0), 0) % 25
}

function companyInitials(company) {
  return company.split(' ').slice(0, 2).map((word) => word[0]).join('')
}

function companyTone(company) {
  const tones = ['bg-[#e5efe8] text-[#285f45]', 'bg-[#eee5d5] text-[#785a20]', 'bg-[#e3ebef] text-[#42687a]', 'bg-[#ece6f2] text-[#635283]']
  return tones[company.length % tones.length]
}
