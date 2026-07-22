import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpDown,
  Award,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,

  Search,
  Sparkles,
  Star,
  Tag,
  XCircle,
} from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'

const pageSize = 3
const emptyCertificates = []

const digitalCertificates = [
  { id: 'work-1', company: 'Batik Laweyan Bu Sari', role: 'Buruh Cuci Kain Batik', category: 'Tekstil & Batik', duration: '3 hari', durationDays: 3, completed: '27 Juli 2026', completedAt: '2026-07-27', rating: 5, review: 'Rajin dan tepat waktu', initials: 'BL', tone: 'green' },
  { id: 'work-2', company: 'Warung Makan Pak Joko', role: 'Asisten Dapur', category: 'Kuliner & Masak', duration: '7 hari', durationDays: 7, completed: '10 Juli 2026', completedAt: '2026-07-10', rating: 4.5, review: 'Cekatan dan sopan', initials: 'WJ', tone: 'orange' },
  { id: 'work-3', company: 'Tani Makmur Solo', role: 'Tenaga Panen Padi', category: 'Pertanian', duration: '2 hari', durationDays: 2, completed: '1 Juli 2026', completedAt: '2026-07-01', rating: 5, review: 'Kerja keras, hasil rapi', initials: 'TM', tone: 'green' },
  { id: 'work-4', company: 'Sekar Laweyan', role: 'Helper Packing Batik', category: 'Tekstil & Batik', duration: '14 hari', durationDays: 14, completed: '22 Juni 2026', completedAt: '2026-06-22', rating: 4.8, review: 'Teliti menjaga kualitas produk', initials: 'SL', tone: 'green' },
  { id: 'work-5', company: 'Rasa Solo Catering', role: 'Crew Produksi Harian', category: 'Kuliner & Masak', duration: '5 hari', durationDays: 5, completed: '12 Juni 2026', completedAt: '2026-06-12', rating: 4.7, review: 'Cepat belajar dan kompak', initials: 'RS', tone: 'orange' },
  { id: 'work-6', company: 'Kembang Solo', role: 'Pramuniaga Toko Oleh-oleh', category: 'Retail & Pelayanan', duration: '30 hari', durationDays: 30, completed: '30 Mei 2026', completedAt: '2026-05-30', rating: 4.9, review: 'Ramah melayani pelanggan', initials: 'KS', tone: 'blue' },
  { id: 'work-7', company: 'Konveksi Maju Jaya', role: 'Tenaga Jahit Harian', category: 'Tekstil & Batik', duration: '8 hari', durationDays: 8, completed: '18 Mei 2026', completedAt: '2026-05-18', rating: 4.8, review: 'Jahitan rapi dan konsisten', initials: 'KM', tone: 'green' },
  { id: 'work-8', company: 'Lurik Kita', role: 'Admin Chat Paruh Waktu', category: 'Administrasi', duration: '21 hari', durationDays: 21, completed: '3 Mei 2026', completedAt: '2026-05-03', rating: 4.6, review: 'Responsif dan komunikatif', initials: 'LK', tone: 'violet' },
  { id: 'work-9', company: 'Pasar Segar Nusukan', role: 'Staf Toko', category: 'Retail & Pelayanan', duration: '12 hari', durationDays: 12, completed: '24 April 2026', completedAt: '2026-04-24', rating: 5, review: 'Bisa diandalkan saat toko ramai', initials: 'PS', tone: 'blue' },
  { id: 'work-10', company: 'Batik Ndalem Laweyan', role: 'Admin Marketplace UMKM', category: 'Tekstil & Batik', duration: '18 hari', durationDays: 18, completed: '9 April 2026', completedAt: '2026-04-09', rating: 4.7, review: 'Teliti mengelola pesanan', initials: 'BN', tone: 'green' },
  { id: 'work-11', company: 'Dapur Mami Solo', role: 'Asisten Dapur', category: 'Kuliner & Masak', duration: '6 hari', durationDays: 6, completed: '29 Maret 2026', completedAt: '2026-03-29', rating: 4.9, review: 'Menjaga kebersihan dengan baik', initials: 'DM', tone: 'orange' },
  { id: 'work-12', company: 'Akar Studio', role: 'Admin Konten', category: 'Administrasi', duration: '10 hari', durationDays: 10, completed: '15 Maret 2026', completedAt: '2026-03-15', rating: 4.8, review: 'Ide konten segar dan tepat waktu', initials: 'AS', tone: 'violet' },
]

const toneStyles = {
  green: { avatar: 'bg-gradient-to-br from-[#087a41] to-[#004b2d]', badge: 'bg-[#edf8f1] text-[#087a41]', icon: Tag },
  orange: { avatar: 'bg-gradient-to-br from-[#ff9900] to-[#ee6f00]', badge: 'bg-[#fff5df] text-[#df7200]', icon: Sparkles },
  blue: { avatar: 'bg-gradient-to-br from-[#457f95] to-[#285769]', badge: 'bg-[#edf5f8] text-[#356b7d]', icon: Tag },
  violet: { avatar: 'bg-gradient-to-br from-[#8068a6] to-[#584477]', badge: 'bg-[#f3eff8] text-[#6e5791]', icon: Tag },
}

export default function ProfilePage() {
  const { applications, certificates, openDialog } = useWorkspace()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Semua kategori')
  const [sort, setSort] = useState('Terbaru')
  const [currentPage, setCurrentPage] = useState(1)
  const records = applications.Selesai.length ? digitalCertificates : emptyCertificates
  const categories = ['Semua kategori', ...new Set(records.map((item) => item.category))]

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return records
      .filter((item) => category === 'Semua kategori' || item.category === category)
      .filter((item) => !normalizedQuery || `${item.company} ${item.role} ${item.category}`.toLowerCase().includes(normalizedQuery))
      .sort((first, second) => {
        if (sort === 'Rating tertinggi') return second.rating - first.rating
        if (sort === 'Durasi terlama') return second.durationDays - first.durationDays
        return second.completedAt.localeCompare(first.completedAt)
      })
  }, [category, query, records, sort])

  const averageRating = records.length ? (records.reduce((total, item) => total + item.rating, 0) / records.length).toFixed(1) : '0.0'
  const topCategory = records.length ? Object.entries(records.reduce((totals, item) => ({ ...totals, [item.category]: (totals[item.category] || 0) + 1 }), {})).sort((first, second) => second[1] - first[1])[0][0] : '—'
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const visibleRecords = filteredRecords.slice((safePage - 1) * pageSize, safePage * pageSize)

  const updateCategory = (value) => {
    setCategory(value)
    setCurrentPage(1)
  }

  const updateSort = (value) => {
    setSort(value)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setQuery('')
    setCategory('Semua kategori')
    setCurrentPage(1)
  }

  return (
    <>


      {!records.length ? <PortfolioEmptyState /> : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Ringkasan portofolio">
            <SummaryCard icon={Award} label="Total Sertifikat" value={String(records.length + certificates.length)} />
            <SummaryCard icon={Star} label="Rating Rata-rata" value={averageRating} suffix={<Star size={24} className="fill-[#ffc400] text-[#eca900]" />} tone="gold" />
            <SummaryCard icon={Folder} label="Kategori Terbanyak" value={topCategory} />
          </section>

          <section className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_210px_210px]" aria-label="Cari dan filter portofolio">
            <label className="flex h-14 items-center gap-3 rounded-[15px] border border-[#dce5e0] bg-white px-5 transition focus-within:border-[#69a982] focus-within:ring-4 focus-within:ring-[#dff0e5]">
              <Search size={22} className="shrink-0 text-[#70837b]" />
              <span className="sr-only">Cari portofolio</span>
              <input value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1) }} type="search" placeholder="Cari jenis pekerjaan atau UMKM..." className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#17251f] outline-none placeholder:text-[#82918b]" />
            </label>
            <PortfolioSelect icon={Tag} label="Kategori" value={category} options={categories} onChange={updateCategory} />
            <PortfolioSelect icon={ArrowUpDown} label="Urutkan" value={sort} options={['Terbaru', 'Rating tertinggi', 'Durasi terlama']} onChange={updateSort} />
          </section>

          {visibleRecords.length ? (
            <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Daftar sertifikat kerja">
              {visibleRecords.map((item) => <CertificateCard key={item.id} item={item} onOpen={() => openDialog('certificate-detail', { item: { ...item, name: item.role, issuer: item.company, status: 'Sertifikat kerja terverifikasi' } })} />)}
            </section>
          ) : (
            <section className="mt-5 rounded-[18px] border border-dashed border-[#bcd2c4] bg-white px-6 py-12 text-center">
              <Search size={28} className="mx-auto text-[#78a48a]" />
              <h2 className="mt-4 text-base font-extrabold text-[#17251f]">Portofolio tidak ditemukan</h2>
              <p className="mt-1 text-xs text-[#6b7c74]">Ubah kata kunci atau pilih kategori lain.</p>
              <button type="button" onClick={resetFilters} className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-[#69a982] px-4 text-xs font-extrabold text-[#08783f] hover:bg-[#f0f8f3]">Atur ulang pencarian</button>
            </section>
          )}

          {filteredRecords.length ? <Pagination page={safePage} totalPages={totalPages} onChange={setCurrentPage} /> : null}
        </>
      )}
    </>
  )
}

function SummaryCard({ icon: Icon, label, value, suffix, tone = 'green' }) {
  return (
    <article className="flex min-h-[126px] items-center gap-5 rounded-[18px] border border-[#dce5e0] bg-white px-5 py-4 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:px-6">
      <span className={`grid size-[70px] shrink-0 place-items-center rounded-full ${tone === 'gold' ? 'bg-[#fff6d9] text-[#e1a400]' : 'bg-[#edf6f0] text-[#08783f]'}`}><Icon size={31} fill={tone === 'gold' ? 'currentColor' : 'none'} /></span>
      <span className="min-w-0">
        <span className="block text-xs font-extrabold text-[#26352f]">{label}</span>
        <strong className="mt-2 flex items-center gap-3 font-display text-[28px] font-semibold leading-none tracking-[-0.035em] text-[#07843f] sm:text-[32px]"><span className="truncate">{value}</span>{suffix}</strong>
      </span>
    </article>
  )
}

function PortfolioSelect({ icon: Icon, label, value, options, onChange }) {
  return (
    <label className="flex h-14 min-w-0 items-center gap-3 rounded-[15px] border border-[#bcd2c4] bg-white px-4 text-[#08783f] transition focus-within:border-[#69a982] focus-within:ring-4 focus-within:ring-[#dff0e5]">
      <Icon size={19} className="shrink-0" />
      <span className="sr-only">{label}</span>
      <span className="relative min-w-0 flex-1">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full cursor-pointer appearance-none truncate bg-transparent pr-7 text-xs font-extrabold text-[#26352f] outline-none">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown size={17} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#26352f]" />
      </span>
    </label>
  )
}

function CertificateCard({ item, onOpen }) {
  const style = toneStyles[item.tone]
  const CategoryIcon = style.icon
  return (
    <article className="flex min-h-[340px] flex-col rounded-[18px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_26px_rgba(16,66,45,.025)] transition duration-200 hover:-translate-y-1 hover:border-[#b7d0c1] hover:shadow-[0_18px_38px_rgba(16,66,45,.08)]">
      <div className="flex items-center gap-4">
        <span className={`grid size-14 shrink-0 place-items-center rounded-full text-base font-extrabold text-white shadow-[0_5px_14px_rgba(3,83,47,.18)] ${style.avatar}`}>{item.initials}</span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-extrabold text-[#17251f]">{item.company}</h2>
          <p className="mt-1 truncate text-sm font-semibold text-[#26352f]">{item.role}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold ${style.badge}`}><CategoryIcon size={13} /> Kategori: {item.category}</span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#edf8f1] px-2.5 py-1.5 text-[10px] font-extrabold text-[#08783f]"><BadgeCheck size={14} fill="currentColor" className="text-[#08783f]" /> Terverifikasi</span>
      </div>

      <p className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#667870]"><CalendarDays size={15} className="text-[#71857c]" /><span>{item.duration}</span><span aria-hidden="true">·</span><span>selesai {item.completed}</span></p>

      <p className="mt-5 text-xs font-semibold leading-6 text-[#26352f]"><span className="mr-2 inline-flex items-center gap-1 font-extrabold text-[#17251f]"><Star size={18} className="fill-[#ffc400] text-[#eca900]" /> {item.rating.toFixed(1)}</span><span className="mr-2 text-[#72837b]">·</span>“{item.review}”</p>

      <button type="button" onClick={onOpen} className="mt-auto flex h-11 w-full items-center justify-center rounded-xl border-2 border-[#159052] text-xs font-extrabold text-[#08783f] transition hover:bg-[#08783f] hover:text-white">Lihat Sertifikat</button>
    </article>
  )
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Navigasi halaman portofolio">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className="grid size-10 place-items-center rounded-xl border border-[#dce5e0] bg-white text-[#40534a] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Halaman sebelumnya"><ChevronLeft size={18} /></button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => onChange(number)} className={`grid size-10 place-items-center rounded-xl text-xs font-extrabold transition ${page === number ? 'bg-[#08783f] text-white shadow-[0_5px_14px_rgba(8,120,63,.2)]' : 'border border-[#dce5e0] bg-white text-[#40534a] hover:bg-[#f0f7f3]'}`} aria-current={page === number ? 'page' : undefined}>{number}</button>)}
      <button type="button" disabled={page === totalPages} onClick={() => onChange(page + 1)} className="grid size-10 place-items-center rounded-xl border border-[#dce5e0] bg-white text-[#40534a] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Halaman berikutnya"><ChevronRight size={18} /></button>
    </nav>
  )
}

function PortfolioEmptyState() {
  return (
    <section className="grid items-center gap-7 overflow-hidden rounded-[20px] border border-[#dce5e0] bg-white px-6 py-8 shadow-[0_8px_26px_rgba(16,66,45,.025)] sm:px-9 lg:grid-cols-[260px_minmax(0,1fr)_auto] lg:px-12">
      <div className="relative mx-auto h-32 w-56" aria-hidden="true">
        <span className="absolute inset-x-2 bottom-0 h-24 rounded-[50%] bg-[#edf5ef]" />
        <span className="absolute left-1/2 top-2 grid h-24 w-[78px] -translate-x-1/2 place-items-center rounded-[14px] border-4 border-[#173c4d] bg-white shadow-[0_10px_24px_rgba(23,60,77,.12)]"><span className="space-y-2"><i className="block h-1 w-10 rounded-full bg-[#173c4d]" /><i className="block h-1 w-10 rounded-full bg-[#173c4d]" /><i className="block h-1 w-7 rounded-full bg-[#173c4d]" /></span><Award size={25} className="absolute -bottom-4 left-1/2 -translate-x-1/2 fill-[#7bc58c] text-[#287c4b]" /></span>
        <XCircle size={44} className="absolute bottom-2 right-7 fill-[#7b8290] text-[#444b58]" />
        <Sparkles size={22} className="absolute left-3 top-2 fill-[#b9dfc7] text-[#b9dfc7]" />
        <Sparkles size={26} className="absolute right-2 top-1 fill-[#a8d6b8] text-[#a8d6b8]" />
      </div>
      <div className="text-center lg:text-left">
        <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-[#111b17] sm:text-2xl">Portofolio Anda masih kosong</h2>
        <p className="mt-2 max-w-xl text-sm font-medium leading-7 text-[#697a73]">Selesaikan pekerjaan pertama Anda melalui Papan Loker untuk mendapatkan Sertifikat Kerja Digital pertama.</p>
      </div>
      <Link to="/jobs" className="inline-flex h-14 items-center justify-center gap-3 whitespace-nowrap rounded-xl bg-gradient-to-b from-[#0b9148] to-[#007438] px-7 text-sm font-extrabold text-white shadow-[0_9px_20px_rgba(4,112,54,.2)] transition hover:-translate-y-0.5 hover:shadow-[0_13px_25px_rgba(4,112,54,.25)]"><Search size={22} /> Cari Lowongan di Papan Loker</Link>
    </section>
  )
}
