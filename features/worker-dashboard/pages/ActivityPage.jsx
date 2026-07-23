import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, Filter, UserRound } from 'lucide-react'
import { ActivityIcon, EmptyState, PageHeader } from '../components/UI'
import { fetchWorkerActivities, syncWorkerApplications } from '../data/activityApi'

const filters = ['Semua', 'Lamaran', 'Profil', 'Bukti']
const proofKinds = ['verification', 'certificate', 'proof', 'kyc']

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function readText(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim()
}

function activityCategory(activity) {
  const entityType = normalize(activity.entity_type ?? activity.entityType)
  const action = normalize(activity.action)

  if (entityType === 'application' || action === 'job.apply' || action.startsWith('application.')) return 'Lamaran'
  if (entityType === 'profile' || action.startsWith('profile.')) return 'Profil'
  if (proofKinds.some((kind) => entityType === kind || action === kind || action.startsWith(`${kind}.`))) return 'Bukti'
  return 'Lainnya'
}

function applicationPresentation(action) {
  if (/(rejected|declined)/.test(action)) return { title: 'Lamaran tidak dilanjutkan', detail: 'Perekrut memutuskan untuk tidak melanjutkan lamaran ini.', icon: 'briefcase', tone: 'warm' }
  if (/(accepted|hired)/.test(action)) return { title: 'Lamaran diterima', detail: 'Selamat, lamaranmu diterima oleh perekrut.', icon: 'check', tone: 'brand' }
  if (/(interview|schedule)/.test(action)) return { title: 'Jadwal interview diperbarui', detail: 'Ada pembaruan jadwal interview untuk lamaranmu.', icon: 'calendar', tone: 'warm' }
  if (/(reviewed|review|viewed)/.test(action)) return { title: 'Lamaran sedang ditinjau', detail: 'Perekrut telah membuka dan meninjau lamaranmu.', icon: 'briefcase', tone: 'blue' }
  if (/(completed|finished)/.test(action)) return { title: 'Pekerjaan selesai', detail: 'Pekerjaan dari lamaran ini telah ditandai selesai.', icon: 'award', tone: 'brand' }
  return { title: 'Lamaran terkirim', detail: 'Lamaranmu berhasil dikirim dan sedang menunggu peninjauan.', icon: 'briefcase', tone: 'brand' }
}

function profilePresentation(action) {
  if (/(viewed|opened)/.test(action)) return { title: 'Profilmu dilihat', detail: 'Profil pekerjamu baru saja dilihat.', icon: 'user', tone: 'blue' }
  if (/(completed|complete)/.test(action)) return { title: 'Profil berhasil dilengkapi', detail: 'Informasi profil pekerjamu sudah lengkap.', icon: 'check', tone: 'brand' }
  return { title: 'Profil diperbarui', detail: 'Perubahan pada profil pekerjamu berhasil disimpan.', icon: 'user', tone: 'brand' }
}

function proofPresentation(entityType, action) {
  const kind = proofKinds.find((item) => entityType === item || action === item || action.startsWith(`${item}.`)) || 'verification'
  const approved = /(approved|verified|accepted|completed)/.test(action)
  const rejected = /(rejected|declined|failed)/.test(action)

  if (kind === 'certificate') {
    if (approved) return { title: 'Sertifikat disetujui', detail: 'Sertifikatmu sudah terverifikasi dan dapat tampil di profil.', icon: 'badge', tone: 'brand' }
    if (rejected) return { title: 'Sertifikat perlu diperbaiki', detail: 'Sertifikat belum dapat diverifikasi. Periksa kembali dokumenmu.', icon: 'graduation', tone: 'warm' }
    return { title: 'Sertifikat dikirim', detail: 'Sertifikatmu sudah dikirim dan sedang diperiksa.', icon: 'graduation', tone: 'blue' }
  }

  if (kind === 'proof') {
    if (approved) return { title: 'Bukti kerja disetujui', detail: 'Bukti kerja sudah diverifikasi dan tersimpan di profilmu.', icon: 'award', tone: 'brand' }
    if (rejected) return { title: 'Bukti kerja perlu diperbaiki', detail: 'Bukti kerja belum dapat diverifikasi. Periksa kembali unggahanmu.', icon: 'camera', tone: 'warm' }
    return { title: 'Bukti kerja dikirim', detail: 'Bukti kerja sudah dikirim dan sedang diperiksa.', icon: 'camera', tone: 'blue' }
  }

  if (approved) return { title: 'Verifikasi identitas disetujui', detail: 'Identitasmu sudah berhasil diverifikasi.', icon: 'shield', tone: 'brand' }
  if (rejected) return { title: 'Verifikasi identitas perlu diperbaiki', detail: 'Verifikasi belum berhasil. Periksa kembali data dan dokumenmu.', icon: 'identity', tone: 'warm' }
  return { title: 'Verifikasi identitas diproses', detail: 'Data verifikasimu sudah dikirim dan sedang diperiksa.', icon: 'identity', tone: 'blue' }
}

function relativeTime(value) {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return ''

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return 'Baru saja'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`
  if (seconds < 172800) return 'Kemarin'
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`

  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}),
  }).format(date)
}

function mapActivity(rawActivity, index) {
  const activity = rawActivity && typeof rawActivity === 'object' ? rawActivity : {}
  const metadata = activity.metadata && typeof activity.metadata === 'object' && !Array.isArray(activity.metadata) ? activity.metadata : {}
  const entityType = normalize(activity.entity_type ?? activity.entityType)
  const action = normalize(activity.action)
  const status = normalize(activity.status ?? metadata.status ?? metadata.new_status ?? metadata.newStatus)
  const event = `${action}.${status}`
  const category = activityCategory(activity)
  const presentation = category === 'Lamaran'
    ? applicationPresentation(event)
    : category === 'Profil'
      ? profilePresentation(event)
      : category === 'Bukti'
        ? proofPresentation(entityType, event)
        : {
            title: readText(activity.title) || 'Aktivitas akun',
            detail: 'Ada aktivitas baru di akunmu.',
            icon: 'bell',
            tone: 'brand',
          }

  return {
    id: activity.id ?? `${action || 'activity'}-${index}`,
    action,
    entityType,
    category,
    title: presentation.title,
    detail: readText(activity.detail, activity.description, activity.message, metadata.detail, metadata.description, metadata.message) || presentation.detail,
    icon: presentation.icon,
    tone: presentation.tone,
    time: relativeTime(activity.created_at ?? activity.createdAt ?? activity.timestamp),
    read: typeof activity.read === 'boolean' ? activity.read : typeof activity.is_read === 'boolean' ? activity.is_read : true,
  }
}

export default function ActivityPage() {
  const [activities, setActivities] = useState([])
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    syncWorkerApplications()
      .catch(() => undefined)
      .then(() => fetchWorkerActivities())
      .then((data) => {
        if (active) setActivities(data)
      })
      .catch((fetchError) => {
        if (active) setError(fetchError instanceof Error ? fetchError.message : 'Gagal memuat aktivitas.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const mappedActivities = useMemo(() => activities.map(mapActivity), [activities])
  const filtered = useMemo(() => mappedActivities.filter((activity) => activeFilter === 'Semua' || activity.category === activeFilter), [mappedActivities, activeFilter])

  return (
    <>
      <PageHeader eyebrow="Jejak akun" title="Riwayat aktivitas" description="Semua perubahan lamaran, profil, verifikasi, dan bukti profesional dalam satu kronologi." />
      <section className="card">
        <div className="flex flex-wrap gap-2">{filters.map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`filter-chip ${activeFilter === filter ? 'filter-chip-active' : ''}`}>{filter === 'Lamaran' ? <BriefcaseBusiness size={12} /> : filter === 'Profil' ? <UserRound size={12} /> : filter === 'Semua' ? <Filter size={12} /> : null}{filter}</button>)}</div>
        <div className="mt-5">{loading ? <p className="py-8 text-center text-xs font-bold text-pull-500" role="status">Memuat aktivitas...</p> : error ? <EmptyState title="Aktivitas gagal dimuat" description={error} /> : filtered.length ? filtered.map((activity, index) => <article key={activity.id} className="relative flex gap-4 border-b border-pull-100 py-4 last:border-0"><ActivityIcon name={activity.icon} tone={activity.tone} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="text-xs font-extrabold text-pull-900">{activity.title}</h2><span className="shrink-0 text-[9px] font-bold text-pull-400">{activity.time}</span></div><p className="mt-1 text-[10px] leading-5 text-pull-500">{activity.detail}</p>{!activity.read ? <span className="mt-2 inline-block rounded-full bg-[#fae5da] px-2 py-0.5 text-[8px] font-extrabold text-[#af5b3d]">Baru</span> : null}</div>{index < filtered.length - 1 ? <span className="absolute bottom-0 left-[17px] top-[52px] w-px bg-pull-100" /> : null}</article>) : <EmptyState title="Belum ada aktivitas" description="Aktivitas untuk filter ini akan muncul setelah kamu memakai Pull." />}</div>
      </section>
    </>
  )
}
