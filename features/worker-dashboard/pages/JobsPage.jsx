import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Bookmark, Search, SlidersHorizontal, Sparkles, Zap } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { jobs } from '../data/mockData'
import { useWorkspace } from '../context/WorkspaceContext'
import { EmptyState, JobCard, PageHeader } from '../components/UI'

const filters = ['Untukmu', 'Terdekat', 'Remote', 'Upah harian', 'Mendesak', 'Tersimpan']

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { savedJobIds, advancedFilters, openDialog } = useWorkspace()
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'Untukmu')
  const query = searchParams.get('q') || ''

  const setQuery = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const normalized = query.trim().toLowerCase()
    const matchesSearch = !normalized || `${job.role} ${job.company} ${job.location} ${job.category}`.toLowerCase().includes(normalized)
    const matchesQuick = activeFilter === 'Untukmu' || (activeFilter === 'Terdekat' && job.nearby) || (activeFilter === 'Remote' && job.remote) || (activeFilter === 'Upah harian' && job.daily) || (activeFilter === 'Mendesak' && job.urgent) || (activeFilter === 'Tersimpan' && savedJobIds.includes(job.id))
    const distanceNumber = Number.parseFloat(job.distance.replace(',', '.'))
    const distanceLimit = Number.parseInt(advancedFilters.distance, 10)
    const matchesAdvanced = (advancedFilters.category === 'Semua kategori' || job.category === advancedFilters.category) && (advancedFilters.distance === 'Semua jarak' || (!Number.isNaN(distanceNumber) && distanceNumber <= distanceLimit)) && (advancedFilters.workType === 'Semua tipe' || job.type.includes(advancedFilters.workType)) && job.match >= advancedFilters.minMatch && (!advancedFilters.urgentOnly || job.urgent)
    return matchesSearch && matchesQuick && matchesAdvanced
  }), [query, activeFilter, savedJobIds, advancedFilters])

  const advancedCount = Object.entries(advancedFilters).filter(([key, value]) => key === 'category' ? value !== 'Semua kategori' : key === 'distance' ? value !== 'Semua jarak' : key === 'workType' ? value !== 'Semua tipe' : key === 'minMatch' ? value > 0 : value).length
  const partnerCount = new Set(jobs.map((job) => job.company)).size

  return (
    <>
      <PageHeader eyebrow="Smart matching" title="Cari peluang kerja" description="Lowongan informal dan semi-formal dari UMKM terverifikasi di Solo Raya." actions={<><span className="availability-pill"><Sparkles size={14} /> {filteredJobs.length} cocok</span><button onClick={() => openDialog('filters')} className="secondary-button"><SlidersHorizontal size={14} /> Filter rinci {advancedCount ? `(${advancedCount})` : ''}</button></>} />
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="search-box max-w-none flex-1 lg:max-w-[480px]"><Search size={16} className="text-pull-400" /><input id="job-search" value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Cari posisi, UMKM, kecamatan, atau kategori" /></label>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">{filters.map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`filter-chip ${activeFilter === filter ? 'filter-chip-active' : ''}`}>{filter === 'Mendesak' ? <Zap size={12} /> : filter === 'Tersimpan' ? <Bookmark size={12} /> : null}{filter}</button>)}</div>
        </div>
        <div className="mt-4 flex min-h-24 items-center overflow-hidden rounded-[18px] bg-pull-50 px-4 sm:pr-0"><div className="relative z-10 min-w-0 flex-1"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-pull-500">Jejaring lokal terverifikasi</p><p className="mt-1 text-xs font-extrabold text-pull-900">{partnerCount} UMKM membuka {jobs.length} peluang di Solo Raya</p><p className="mt-1 text-[9px] font-semibold text-pull-500">Data lowongan dan status diperbarui langsung oleh mitra.</p></div><Image src="/illustrations/storefront-wide.webp" alt="" width={240} height={96} className="hidden h-24 w-60 shrink-0 object-contain object-bottom sm:block" /></div>
      </section>
      <div className="mt-4 grid gap-4 2xl:grid-cols-2">
        {filteredJobs.length ? filteredJobs.map((job) => <JobCard key={job.id} job={job} />) : <div className="2xl:col-span-2"><EmptyState illustration="/illustrations/store-profile.webp" illustrationAlt="Ilustrasi profil UMKM lokal" title="Belum ada loker yang cocok" description="Ubah kata kunci atau longgarkan filter jarak dan kecocokan." action={<button onClick={() => { setQuery(''); setActiveFilter('Untukmu') }} className="secondary-button">Atur ulang pencarian</button>} /></div>}
      </div>
    </>
  )
}
