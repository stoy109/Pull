import { useMemo, useState } from 'react'
import { BriefcaseBusiness, Filter, UserRound } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { ActivityIcon, EmptyState, PageHeader } from '../components/UI'

const filters = ['Semua', 'Lamaran', 'Profil', 'Bukti']

export default function ActivityPage() {
  const { activities } = useWorkspace()
  const [activeFilter, setActiveFilter] = useState('Semua')
  const filtered = useMemo(() => activities.filter((activity) => {
    if (activeFilter === 'Semua') return true
    if (activeFilter === 'Lamaran') return ['briefcase', 'calendar', 'check', 'star'].includes(activity.icon)
    if (activeFilter === 'Profil') return ['eye', 'user', 'identity', 'shield'].includes(activity.icon)
    return ['award', 'badge', 'camera', 'graduation'].includes(activity.icon)
  }), [activities, activeFilter])

  return (
    <>
      <PageHeader eyebrow="Jejak akun" title="Riwayat aktivitas" description="Semua perubahan lamaran, profil, verifikasi, dan bukti profesional dalam satu kronologi." />
      <section className="card">
        <div className="flex flex-wrap gap-2">{filters.map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`filter-chip ${activeFilter === filter ? 'filter-chip-active' : ''}`}>{filter === 'Lamaran' ? <BriefcaseBusiness size={12} /> : filter === 'Profil' ? <UserRound size={12} /> : filter === 'Semua' ? <Filter size={12} /> : null}{filter}</button>)}</div>
        <div className="mt-5">{filtered.length ? filtered.map((activity, index) => <article key={activity.id} className="relative flex gap-4 border-b border-pull-100 py-4 last:border-0"><ActivityIcon name={activity.icon} tone={activity.tone} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="text-xs font-extrabold text-pull-900">{activity.title}</h2><span className="shrink-0 text-[9px] font-bold text-pull-400">{activity.time}</span></div><p className="mt-1 text-[10px] leading-5 text-pull-500">{activity.detail}</p>{!activity.read ? <span className="mt-2 inline-block rounded-full bg-[#fae5da] px-2 py-0.5 text-[8px] font-extrabold text-[#af5b3d]">Baru</span> : null}</div>{index < filtered.length - 1 ? <span className="absolute bottom-0 left-[17px] top-[52px] w-px bg-pull-100" /> : null}</article>) : <EmptyState title="Belum ada aktivitas" description="Aktivitas untuk filter ini akan muncul setelah kamu memakai Pull." />}</div>
      </section>
    </>
  )
}
