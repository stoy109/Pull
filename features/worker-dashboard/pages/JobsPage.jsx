import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  MoreHorizontal,
  Search,
  Star,
  Users,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { jobs } from '../data/mockData'
import { useWorkspace } from '../context/WorkspaceContext'
import { EmptyState, VerifiedUmkmIcon } from '../components/UI'
import JobsMap from '../components/JobsMap'

const pageSize = 3
const categories = ['Semua kategori', ...new Set(jobs.map((job) => job.category))]
const districts = ['Semua kecamatan', ...new Set(jobs.filter((job) => !job.remote).map((job) => job.district))]

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { appliedJobIds, openDialog, handleModalEvent } = useWorkspace()
  const [category, setCategory] = useState('Semua kategori')
  const [district, setDistrict] = useState('Semua kecamatan')
  const [payType, setPayType] = useState('Semua upah')
  const [duration, setDuration] = useState('Semua durasi')
  const [sort, setSort] = useState('Terbaru')
  const [view, setView] = useState('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [mapRadius, setMapRadius] = useState(5)
  const [focusRequest, setFocusRequest] = useState(0)
  const [selectedMapJob, setSelectedMapJob] = useState(null)
  const query = searchParams.get('q') || ''

  const setQuery = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
    setCurrentPage(1)
  }

  const filteredJobs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = jobs.filter((job) => {
      const matchesSearch = !normalized || `${job.role} ${job.company} ${job.location} ${job.category}`.toLowerCase().includes(normalized)
      const matchesCategory = category === 'Semua kategori' || job.category === category
      const matchesDistrict = district === 'Semua kecamatan' || job.district === district
      const matchesPay = payType === 'Semua upah' || (payType === 'Upah harian' ? job.daily : !job.daily)
      const matchesDuration = duration === 'Semua durasi' || (duration === 'Harian' ? job.daily : job.duration.toLowerCase().includes(duration.toLowerCase()))
      return matchesSearch && matchesCategory && matchesDistrict && matchesPay && matchesDuration
    })

    return filtered.sort((first, second) => {
      if (sort === 'Terdekat') return parseDistance(first.distance) - parseDistance(second.distance)
      return first.id - second.id
    })
  }, [query, category, district, payType, duration, sort])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedJobs = filteredJobs.slice((safePage - 1) * pageSize, safePage * pageSize)
  const mappableJobs = useMemo(() => filteredJobs.filter((job) => job.coordinates && parseDistance(job.distance) <= mapRadius), [filteredJobs, mapRadius])
  const activeMapJob = selectedMapJob && mappableJobs.some((job) => job.id === selectedMapJob.id) ? selectedMapJob : mappableJobs[0]

  const resetFilters = () => {
    setQuery('')
    setCategory('Semua kategori')
    setDistrict('Semua kecamatan')
    setPayType('Semua upah')
    setDuration('Semua durasi')
  }

  return (
    <>
      <section className="card">
        <label className="flex h-14 items-center gap-3 rounded-[16px] border border-pull-100 bg-white px-4 transition focus-within:border-pull-300 focus-within:ring-4 focus-within:ring-pull-100/45">
          <Search size={21} className="text-pull-500" />
          <span className="sr-only">Cari jenis pekerjaan</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Cari jenis pekerjaan, UMKM, atau lokasi..." className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-pull-900 outline-none placeholder:text-pull-400" />
        </label>

        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
          <FilterSelect label="Kategori" value={category} onChange={(value) => { setCategory(value); setCurrentPage(1) }} options={categories} />
          <FilterSelect label="Kecamatan" value={district} onChange={(value) => { setDistrict(value); setCurrentPage(1) }} options={districts} />
          <FilterSelect label="Upah" value={payType} onChange={(value) => { setPayType(value); setCurrentPage(1) }} options={['Semua upah', 'Upah harian', 'Upah bulanan']} />
          <FilterSelect label="Durasi" value={duration} onChange={(value) => { setDuration(value); setCurrentPage(1) }} options={['Semua durasi', 'Harian', 'Kontrak', 'Proyek']} />
          <div className="grid h-[52px] min-w-[190px] grid-cols-[1.18fr_0.82fr] items-center rounded-[15px] border border-pull-100 bg-white p-1 shadow-xs">
            <button type="button" onClick={() => setView('list')} className={`flex h-full min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-[11px] font-extrabold transition-all ${view === 'list' ? 'bg-[#08783f] text-white shadow-sm' : 'text-pull-600 hover:bg-pull-50 hover:text-pull-900'}`}><List size={14} className="shrink-0" /><span className="truncate">List View</span></button>
            <button type="button" onClick={() => setView('map')} className={`flex h-full min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-[11px] font-extrabold transition-all ${view === 'map' ? 'bg-[#08783f] text-white shadow-sm' : 'text-pull-600 hover:bg-pull-50 hover:text-pull-900'}`}><MapIcon size={14} className="shrink-0" /><span className="truncate">Map</span></button>
          </div>
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-bold text-pull-500">Menampilkan <strong className="text-pull-900">{filteredJobs.length}</strong> lowongan di Solo Raya</p>
        <label className="flex items-center gap-2 text-[10px] font-bold text-pull-500">Urutkan:<select value={sort} onChange={(event) => { setSort(event.target.value); setCurrentPage(1) }} className="h-10 rounded-xl border border-pull-100 bg-white px-3 font-extrabold text-pull-700 outline-none cursor-pointer"><option>Terbaru</option><option>Terdekat</option></select></label>
      </div>

      {view === 'list' ? (
        <>
          <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedJobs.length ? paginatedJobs.map((job) => (
              <JobBoardCard
                key={job.id}
                job={job}
                applied={appliedJobIds.includes(job.id)}
                onOpenDetail={() => openDialog('job-detail', { job })}
                onApply={() => handleModalEvent('contact-job', { job })}
              />
            )) : (
              <div className="md:col-span-2 xl:col-span-3"><EmptyState illustration="/illustrations/store-profile.webp" illustrationAlt="Ilustrasi profil UMKM lokal" title="Belum ada loker yang cocok" description="Ubah kata kunci atau longgarkan filter pencarian." action={<button onClick={resetFilters} className="secondary-button">Atur ulang pencarian</button>} /></div>
            )}
          </section>
          {filteredJobs.length ? <Pagination page={safePage} totalPages={totalPages} onChange={setCurrentPage} /> : null}
        </>
      ) : (
        <section className="relative isolate z-0 mt-4 min-h-[620px] overflow-hidden rounded-[24px] border border-pull-100 bg-pull-50 shadow-[0_18px_50px_rgba(18,59,48,.08)]">
          <JobsMap jobs={mappableJobs} radius={mapRadius} focusRequest={focusRequest} onSelectJob={setSelectedMapJob} />
          <label className="absolute right-4 top-4 z-[500] rounded-[16px] border border-pull-100 bg-white/95 p-3 shadow-lg backdrop-blur-md"><span className="block text-[9px] font-extrabold text-pull-500">Jarak maksimal</span><select value={mapRadius} onChange={(event) => setMapRadius(Number(event.target.value))} className="mt-1 h-9 bg-transparent text-sm font-extrabold text-pull-900 outline-none cursor-pointer"><option value={3}>3 km</option><option value={5}>5 km</option><option value={10}>10 km</option></select></label>
          <button type="button" onClick={() => setFocusRequest((value) => value + 1)} className="absolute bottom-40 right-4 z-[500] flex h-11 items-center gap-2 rounded-xl border border-pull-100 bg-white px-4 text-[10px] font-extrabold text-pull-700 shadow-lg hover:bg-pull-50 transition-colors"><LocateFixed size={16} /> Lokasi saya</button>
          {activeMapJob ? <MapJobCard job={activeMapJob} onDetail={() => openDialog('job-detail', { job: activeMapJob })} onApply={() => handleModalEvent('contact-job', { job: activeMapJob })} /> : null}
        </section>
      )}
    </>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex h-[52px] min-w-0 flex-col justify-center rounded-[15px] border border-pull-100 bg-white px-3.5 py-1.5 transition-colors hover:border-pull-200 focus-within:border-pull-300">
      <span className="block text-[9px] font-extrabold uppercase tracking-wider text-pull-400">{label}</span>
      <span className="relative mt-0.5 flex min-w-0 items-center">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent pr-7 text-xs font-bold leading-5 text-pull-900 outline-none">
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-0 shrink-0 text-pull-700" />
      </span>
    </label>
  )
}

function JobBoardCard({ job, applied, onOpenDetail, onApply }) {
  const trustScore = Math.round(job.employerTrust * 20)
  const nearlyFull = job.applicants >= 8

  return (
    <article className="flex min-h-[440px] flex-col rounded-[20px] border border-pull-100 bg-white p-4 shadow-[0_10px_28px_rgba(18,59,48,.035)] transition duration-200 hover:border-pull-200 hover:shadow-[0_18px_38px_rgba(18,59,48,.08)]">
      <div className="flex items-start gap-3">
        <div className={`relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-black ${job.tone}`}>{job.logoImage ? <Image src={job.logoImage} alt={`Logo ${job.company}`} fill sizes="48px" className="object-cover" /> : job.logo}</div>
        <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="truncate text-xs font-extrabold text-pull-950">{job.company}</p>{job.verified ? <VerifiedUmkmIcon className="size-[15px] shrink-0" /> : null}</div><p className="mt-1 flex items-center gap-1 text-[9px] font-bold text-pull-500"><Star size={11} className="shrink-0 fill-[#e6a700] text-[#e6a700]" /> Trust Score: {trustScore}</p></div>
        <button type="button" onClick={onOpenDetail} className="grid size-8 place-items-center rounded-lg text-pull-500 hover:bg-pull-50" aria-label={`Buka detail cepat ${job.role}`}><MoreHorizontal size={18} /></button>
      </div>

      <Link to={`/jobs/${job.id}`} className="mt-6 font-display text-[22px] font-semibold leading-tight tracking-[-0.03em] text-pull-950 hover:text-pull-600">{job.role}</Link>
      <div className="mt-4 grid gap-2 text-[9px] font-semibold text-pull-500 sm:grid-cols-2">
        <span className="flex items-center gap-1.5"><MapPin size={13} /> {job.location}</span>
        <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {job.duration}</span>
        <span className="flex items-center gap-1.5"><Clock3 size={13} /> Mulai {job.startDate}</span>
        <span className="flex items-center gap-1.5"><Users size={13} /> {job.workersNeeded} dibutuhkan</span>
      </div>
      <p className="mt-5 text-lg font-extrabold text-[#08783f]">{job.pay}</p>
      <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg bg-pull-50 px-2.5 py-1.5 text-[8px] font-extrabold text-pull-700">{job.category}</span><span className={`rounded-lg px-2.5 py-1.5 text-[8px] font-extrabold ${nearlyFull ? 'bg-[#fff0e7] text-[#c05f2a]' : 'bg-[#eaf6ee] text-[#08783f]'}`}>{nearlyFull ? 'Hampir penuh' : job.urgent ? 'Rekrut cepat' : 'Terbuka'}</span></div>
      <div className="mt-auto flex items-center gap-4 border-t border-pull-100 pt-4 text-[9px] font-semibold text-pull-400"><span className="flex items-center gap-1"><Clock3 size={13} /> {job.posted}</span><span className="flex items-center gap-1"><Users size={13} /> {job.applicants} pelamar</span></div>
      {applied ? <Link to="/applications" className="secondary-button mt-4 w-full justify-center"><CheckCircleLabel /> Lihat lamaran</Link> : <button type="button" onClick={onApply} className="whatsapp-button mt-4 w-full text-xs"><FaWhatsapp size={18} /> Lamar via WhatsApp</button>}
    </article>
  )
}

function CheckCircleLabel() {
  return <span className="grid size-4 place-items-center rounded-full bg-pull-100 text-[9px] font-black text-pull-700">✓</span>
}

function MapJobCard({ job, onDetail, onApply }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-[500] max-w-xl rounded-[20px] border border-pull-100 bg-white/95 p-4 shadow-[0_18px_45px_rgba(12,38,28,.18)] backdrop-blur-md">
      <div className="flex items-start gap-3"><div className={`relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-black ${job.tone}`}>{job.logoImage ? <Image src={job.logoImage} alt={`Logo ${job.company}`} fill sizes="48px" className="object-cover" /> : job.logo}</div><div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 truncate text-xs font-extrabold text-pull-950"><span className="truncate">{job.company}</span>{job.verified ? <VerifiedUmkmIcon className="size-[15px] shrink-0" /> : null}</p><p className="mt-1 flex items-center gap-1 text-[9px] font-bold text-pull-500"><Star size={11} className="shrink-0 fill-[#e6a700] text-[#e6a700]" /> Trust Score: {Math.round(job.employerTrust * 20)}</p></div><button type="button" onClick={onDetail} className="icon-button size-9" aria-label={`Buka detail cepat ${job.role}`}><MoreHorizontal size={17} /></button></div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-display text-xl font-semibold text-pull-950">{job.role}</h2><p className="mt-1 text-lg font-extrabold text-[#08783f]">{job.pay}</p></div><button type="button" onClick={onApply} className="whatsapp-button size-12 self-end px-0" aria-label={`Lamar ${job.role} via WhatsApp`}><FaWhatsapp size={20} /></button></div>
    </div>
  )
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Navigasi halaman lowongan">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="icon-button disabled:cursor-not-allowed disabled:opacity-40" aria-label="Halaman sebelumnya"><ChevronLeft size={16} /></button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => onChange(number)} className={`grid size-10 place-items-center rounded-xl text-[10px] font-extrabold transition ${page === number ? 'bg-[#08783f] text-white shadow-sm' : 'border border-pull-100 bg-white text-pull-600 hover:bg-pull-50'}`} aria-current={page === number ? 'page' : undefined}>{number}</button>)}
      <button type="button" disabled={page === totalPages} onClick={() => onChange(page + 1)} className="icon-button disabled:cursor-not-allowed disabled:opacity-40" aria-label="Halaman berikutnya"><ChevronRight size={16} /></button>
      <span className="ml-2 rounded-xl border border-pull-100 bg-white px-4 py-3 text-[9px] font-extrabold text-pull-500">{pageSize} per halaman</span>
    </nav>
  )
}

function parseDistance(distance) {
  const value = Number.parseFloat(distance.replace(',', '.'))
  return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value
}
