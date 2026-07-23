'use client'

import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Grid2X2,
  Home,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { Brand } from './UI'

const primaryNavigation = [
  { label: 'Dashboard', description: 'Ringkasan akun pekerja', path: '/dashboard', icon: Home },
  { label: 'Papan Loker', description: 'Cari lowongan nyata', path: '/jobs', icon: BriefcaseBusiness },
  { label: 'Lamaran Saya', description: 'Status dan konfirmasi kerja', path: '/applications', icon: ClipboardList, count: 'applications' },
  { label: 'Portofolio', description: 'Profil dan verifikasi', path: '/profile', icon: UserRound },
  { label: 'Trust Score', description: 'Reputasi dan bukti kerja', path: '/trust', icon: ShieldCheck },
  { label: 'Notifikasi', description: 'Pembaruan transaksi', path: '/notifications', icon: Bell, count: 'notifications' },
]

const secondaryNavigation = [
  { label: 'Bantuan', description: 'Panduan dan pusat bantuan', path: '/help', icon: CircleHelp },
  { label: 'Pengaturan', description: 'Preferensi dan keamanan akun', path: '/settings', icon: Settings },
]

function countFor(item, workspace) {
  if (item.count === 'applications') return workspace.applications.length
  if (item.count === 'notifications') return workspace.notifications.filter((notification) => !notification.readAt).length
  return 0
}

function NavigationLink({ item, workspace, onNavigate }) {
  const Icon = item.icon
  const count = countFor(item, workspace)
  return (
    <NavLink to={item.path} onClick={onNavigate} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
      <Icon size={16} className="shrink-0" />
      <span className="whitespace-nowrap">{item.label}</span>
      {count > 0 ? <span className="nav-count">{count > 99 ? '99+' : count}</span> : null}
    </NavLink>
  )
}

function Sidebar({ workspace, onNavigate }) {
  return (
    <div className="worker-sidebar-nav flex h-full flex-col px-5 py-8">
      <div className="px-2"><Brand inverse /></div>
      <nav className="mt-7 flex-1 space-y-2 overflow-y-auto" aria-label="Navigasi utama">
        {primaryNavigation.map((item) => <NavigationLink key={item.path} item={item} workspace={workspace} onNavigate={onNavigate} />)}
      </nav>
      <nav className="mt-6 space-y-2 border-t border-white/10 pt-3" aria-label="Bantuan dan pengaturan">
        {secondaryNavigation.map((item) => <NavigationLink key={item.path} item={item} workspace={workspace} onNavigate={onNavigate} />)}
      </nav>
    </div>
  )
}

function Topbar({ workspace, onOpenMenu }) {
  const location = useLocation()
  const current = [...primaryNavigation, ...secondaryNavigation].find((item) => location.pathname.startsWith(item.path)) || primaryNavigation[0]
  const profile = workspace.profile
  const unread = countFor(primaryNavigation.at(-1), workspace)
  const initials = (profile?.displayName || 'Pekerja Pull').split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-[#e2ece6] bg-white px-4 py-3 shadow-sm shadow-emerald-950/5 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="md:hidden"><Brand /></div>
        <button type="button" className="icon-button hidden md:grid lg:hidden" onClick={onOpenMenu} aria-label="Buka navigasi"><Menu size={20} /></button>
        <div className="hidden min-w-0 md:block">
          <h1 className="truncate text-2xl font-extrabold text-[#10231d]">{current.label}</h1>
          <p className="mt-1 text-xs font-medium text-[#6b7b75]">{current.description}</p>
        </div>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <NavLink to="/notifications" aria-label={unread ? `${unread} notifikasi belum dibaca` : 'Buka notifikasi'} className="icon-button relative">
          <Bell size={18} />
          {unread > 0 ? <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#e87513] ring-2 ring-white" /> : null}
        </NavLink>
        <NavLink to="/profile" className="flex h-11 items-center gap-3 rounded-full border border-[#d8dfdc] bg-white p-1 pr-4 text-left">
          <span className="grid size-9 place-items-center rounded-full bg-[#08783d] text-xs font-extrabold text-white">{initials}</span>
          <span className="max-w-40 truncate text-xs font-extrabold text-[#111b17]">{profile?.displayName || 'Pekerja Pull'}</span>
        </NavLink>
      </div>
    </header>
  )
}

function MobileBottomNav({ workspace, onOpenMore }) {
  const location = useLocation()
  const unread = countFor(primaryNavigation.at(-1), workspace)
  const items = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Loker', path: '/jobs', icon: Search },
    { label: 'Menu', icon: Grid2X2, center: true },
    { label: 'Lamaran', path: '/applications', icon: ClipboardList, count: workspace.applications.length },
    { label: 'Notifikasi', path: '/notifications', icon: Bell, count: unread },
  ]
  const moreActive = ['/profile', '/trust', '/help', '/settings'].some((path) => location.pathname.startsWith(path))

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[72px] grid-cols-5 border-t border-pull-100 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(12,38,28,.07)] backdrop-blur-xl md:hidden" aria-label="Navigasi mobile">
      {items.map((item) => {
        const Icon = item.icon
        if (item.center) return <button key={item.label} type="button" onClick={onOpenMore} className={`relative flex flex-col items-center justify-end pb-1.5 text-[8px] font-extrabold ${moreActive ? 'text-[#08783f]' : 'text-pull-500'}`}><span className="absolute bottom-7 grid size-14 place-items-center rounded-full bg-[#08783f] text-white shadow-[0_8px_20px_rgba(8,120,63,.3)] ring-[6px] ring-[#f6f8f5]"><Icon size={24} /></span><span>Menu</span></button>
        return <NavLink key={item.path} to={item.path} className={({ isActive }) => `relative flex flex-col items-center justify-center gap-1 text-[8px] font-extrabold ${isActive ? 'text-[#08783f]' : 'text-pull-400'}`}><span className="relative"><Icon size={18} />{item.count > 0 ? <span className="absolute -right-2.5 -top-2 grid min-w-4 place-items-center rounded-full bg-[#df754b] px-1 text-[7px] leading-4 text-white">{item.count > 99 ? '99+' : item.count}</span> : null}</span><span>{item.label}</span></NavLink>
      })}
    </nav>
  )
}

function MobileMoreSheet({ workspace, onClose }) {
  const profile = workspace.profile
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button type="button" className="absolute inset-0 bg-pull-950/40 backdrop-blur-sm" onClick={onClose} aria-label="Tutup menu" />
      <section className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-[0_-24px_70px_rgba(12,38,28,.2)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-pull-200" />
        <div className="mb-4 flex items-center gap-3 rounded-[18px] bg-pull-50 p-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#08783f] text-xs font-extrabold text-white">{profile?.displayName?.slice(0, 1) || 'P'}</span>
          <span className="min-w-0 flex-1"><strong className="block truncate text-xs text-pull-900">{profile?.displayName || 'Pekerja Pull'}</strong><span className="mt-1 block text-[9px] font-semibold text-pull-500">Level verifikasi {profile?.verificationLevel ?? 0}/2</span></span>
          <button type="button" onClick={onClose} className="icon-button size-9" aria-label="Tutup menu"><X size={16} /></button>
        </div>
        <nav className="grid grid-cols-2 gap-2" aria-label="Menu lainnya">
          {[
            { label: 'Profil saya', path: '/profile', icon: UserRound },
            { label: 'Trust Score', path: '/trust', icon: ShieldCheck },
            ...secondaryNavigation,
          ].map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} onClick={onClose} className={({ isActive }) => `flex min-h-20 flex-col justify-between rounded-[16px] border p-3 text-[10px] font-extrabold ${isActive ? 'border-pull-300 bg-pull-50 text-pull-900' : 'border-pull-100 text-pull-600'}`}><Icon size={18} /><span className="flex items-center justify-between">{item.label}<ChevronRight size={13} /></span></NavLink> })}
        </nav>
      </section>
    </div>
  )
}

export default function AppShell({ workspace }) {
  const location = useLocation()
  const [tabletOpen, setTabletOpen] = useState(false)
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="worker-dashboard min-h-screen bg-[#f6f8f5] text-pull-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 bg-gradient-to-b from-[#00613f] via-[#005235] to-[#003f29] lg:block"><Sidebar workspace={workspace} /></aside>
      {tabletOpen ? <div className="fixed inset-0 z-50 hidden md:block lg:hidden"><button type="button" className="absolute inset-0 bg-pull-950/35 backdrop-blur-sm" onClick={() => setTabletOpen(false)} aria-label="Tutup navigasi" /><aside className="relative h-full w-56 bg-gradient-to-b from-[#00613f] via-[#005235] to-[#003f29] shadow-2xl"><button type="button" onClick={() => setTabletOpen(false)} className="icon-button absolute right-3 top-4 z-10" aria-label="Tutup navigasi"><X size={18} /></button><Sidebar workspace={workspace} onNavigate={() => setTabletOpen(false)} /></aside></div> : null}
      {mobileMoreOpen ? <MobileMoreSheet workspace={workspace} onClose={() => setMobileMoreOpen(false)} /> : null}
      <div className="lg:pl-56">
        <Topbar workspace={workspace} onOpenMenu={() => setTabletOpen(true)} />
        <main className="mx-auto max-w-[1540px] px-4 pb-28 pt-5 sm:px-6 sm:pb-16 sm:pt-7 xl:px-8"><Outlet /></main>
      </div>
      <MobileBottomNav workspace={workspace} onOpenMore={() => setMobileMoreOpen(true)} />
    </div>
  )
}
