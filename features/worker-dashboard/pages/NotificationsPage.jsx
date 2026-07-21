import { useState } from 'react'
import { CheckCheck, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { ActivityIcon, EmptyState, PageHeader } from '../components/UI'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { activities, unreadCount, markActivityRead, markAllActivitiesRead } = useWorkspace()
  const [showUnread, setShowUnread] = useState(false)
  const visible = showUnread ? activities.filter((activity) => !activity.read) : activities

  const openNotification = (activity) => {
    markActivityRead(activity.id)
    if (activity.title.includes('Interview')) navigate('/applications/app-4')
    else if (activity.title.includes('Sertifikat')) navigate('/certificates')
    else if (activity.title.includes('Trust') || activity.title.includes('Ulasan')) navigate('/trust')
    else if (activity.title.includes('Profil')) navigate('/profile')
    else navigate('/activity')
  }

  return (
    <>
      <PageHeader eyebrow={`${unreadCount} belum dibaca`} title="Notifikasi" description="Pembaruan realtime dari employer, lamaran, verifikasi, dan smart matching." actions={<><button onClick={() => navigate('/settings')} className="secondary-button"><Settings size={14} /> Preferensi</button><button disabled={!unreadCount} onClick={markAllActivitiesRead} className="primary-button"><CheckCheck size={14} /> Tandai semua dibaca</button></>} />
      <section className="card"><div className="flex gap-2 border-b border-pull-100 pb-4"><button onClick={() => setShowUnread(false)} className={`filter-chip ${!showUnread ? 'filter-chip-active' : ''}`}>Semua</button><button onClick={() => setShowUnread(true)} className={`filter-chip ${showUnread ? 'filter-chip-active' : ''}`}>Belum dibaca · {unreadCount}</button></div><div className="mt-2">{visible.length ? visible.map((activity) => <button key={activity.id} onClick={() => openNotification(activity)} className={`flex w-full gap-4 border-b border-pull-100 px-2 py-4 text-left transition last:border-0 hover:bg-pull-50/60 ${activity.read ? 'opacity-70' : ''}`}><ActivityIcon name={activity.icon} tone={activity.tone} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="text-xs font-extrabold text-pull-900">{activity.title}</h2><span className="shrink-0 text-[9px] font-bold text-pull-400">{activity.time}</span></div><p className="mt-1 text-[10px] leading-5 text-pull-500">{activity.detail}</p></div>{!activity.read ? <span className="mt-1 size-2 shrink-0 rounded-full bg-[#df754b]" /> : null}</button>) : <EmptyState title="Semua sudah dibaca" description="Pembaruan baru akan muncul di sini secara realtime." />}</div></section>
    </>
  )
}
