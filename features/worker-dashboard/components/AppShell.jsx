import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Award,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Grid2X2,
  History,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react'
import FeatureModal from '../FeatureModal'
import { useWorkspace } from '../context/WorkspaceContext'
import { Brand, Toast } from './UI'

const primaryNavigation = [
  { label: 'Dashboard', description: 'Ringkasan aktivitas', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Papan Loker', description: 'Cari & lamar loker', path: '/jobs', icon: BriefcaseBusiness },
  { label: 'Lamaran Saya', description: 'Status semua lamaran', path: '/applications', icon: ClipboardList, count: 'applications' },
  { label: 'Portofolio', description: 'Sertifikat kerja digital', path: '/profile', icon: Award },
  { label: 'Trust Score', description: 'Reputasi & PullPoints', path: '/trust', icon: ShieldCheck },
]

const profileNavigation = [
  { label: 'Sertifikat', path: '/certificates', icon: Award },
  { label: 'Skill Growth', path: '/skills', icon: TrendingUp },
  { label: 'Riwayat Aktivitas', path: '/activity', icon: History },
  { label: 'Notifikasi', path: '/notifications', icon: Bell, count: 'notifications' },
]

const mobileMoreNavigation = [
  { label: 'Profil & Portofolio', path: '/profile', icon: UserRound },
  { label: 'Sertifikat', path: '/certificates', icon: Award },
  { label: 'Trust Score', path: '/trust', icon: ShieldCheck },
  { label: 'Skill Growth', path: '/skills', icon: TrendingUp },
  { label: 'Riwayat Aktivitas', path: '/activity', icon: History },
  { label: 'Pengaturan', path: '/settings', icon: Settings },
]

function runMotion(animate) {
  const media = gsap.matchMedia()
  media.add('(prefers-reduced-motion: no-preference)', animate)
  return () => media.revert()
}

function SidebarNav({ onNavigate }) {
  const { activeApplicationCount, openDialog } = useWorkspace()

  return (
    <div className="flex h-full flex-col p-4">
      <div className="px-2 py-2"><Brand inverse /></div>
      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto" aria-label="Navigasi utama">
        {primaryNavigation.map((item) => <SidebarLink key={item.path} item={item} count={item.count ? activeApplicationCount : null} onNavigate={onNavigate} />)}
      </nav>
      <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
        <button onClick={() => openDialog('help')} className="nav-item"><CircleHelp size={18} /><span>Bantuan</span></button>
        <NavLink to="/settings" onClick={onNavigate} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><Settings size={18} /><span>Pengaturan</span></NavLink>
      </div>
    </div>
  )
}

function SidebarLink({ item, count, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink to={item.path} onClick={onNavigate} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
      {({ isActive }) => <><Icon size={18} strokeWidth={isActive ? 2.3 : 1.9} /><span className="min-w-0 flex-1 truncate">{item.label}</span>{count ? <span className="nav-count">{count}</span> : null}</>}
    </NavLink>
  )
}

function Topbar({ onOpenMenu }) {
  const location = useLocation()
  const { profile, unreadCount, openDialog } = useWorkspace()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const pageTitle = [...primaryNavigation, ...profileNavigation, { label: 'Pengaturan', path: '/settings' }].find((item) => location.pathname.startsWith(item.path))?.label || 'Dashboard'

  useLayoutEffect(() => {
    if (!profileOpen || !profileMenuRef.current) return undefined
    return runMotion(() => {
      gsap.fromTo(profileMenuRef.current, { autoAlpha: 0, y: -8, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: 'power3.out', clearProps: 'opacity,visibility,transform' })
    })
  }, [profileOpen])

  return (
    <header data-worker-topbar className="sticky top-0 z-30 border-b border-pull-100/90 bg-[#f6f8f5]/90 backdrop-blur-xl">
      <div className="flex h-16 items-center px-4 sm:px-6 md:h-[74px] xl:px-8">
        <div className="md:hidden"><Brand /></div>
        <button className="icon-button hidden md:grid lg:hidden" onClick={onOpenMenu} aria-label="Buka navigasi tablet"><Menu size={20} /></button>
        <div className="ml-3 hidden md:block lg:ml-0"><p className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-pull-400">Ruang kerja pekerja</p><h1 className="mt-0.5 font-display text-xl font-semibold tracking-[-0.03em] text-pull-950">{pageTitle}</h1></div>
        <div className="relative ml-auto hidden md:block">
          <button onClick={() => setProfileOpen((current) => !current)} className="flex h-12 min-w-56 items-center gap-3 rounded-2xl border border-pull-100 bg-white px-2.5 text-left shadow-[0_8px_24px_rgba(18,59,48,0.06)] transition hover:border-pull-200" aria-expanded={profileOpen} aria-haspopup="menu"><span className="avatar">{profile.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-extrabold text-pull-950">{profile.name}</span><span className="mt-0.5 block text-[9px] font-semibold text-pull-500">{profile.completion}% profil lengkap</span></span>{unreadCount ? <span className="size-2 rounded-full bg-[#df754b]" aria-label={`${unreadCount} notifikasi baru`} /> : null}<ChevronDown size={14} className="text-pull-400" /></button>
          {profileOpen ? <div ref={profileMenuRef} className="absolute right-0 top-[calc(100%+10px)] w-72 overflow-hidden rounded-[20px] border border-pull-100 bg-white p-2 shadow-[0_22px_60px_rgba(12,38,28,0.16)]" role="menu"><div className="rounded-[14px] bg-pull-50 p-3"><p className="text-xs font-extrabold text-pull-950">{profile.name}</p><p className="mt-0.5 text-[9px] font-semibold text-pull-500">WhatsApp terverifikasi · Worker</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-pull-100"><div className="h-full rounded-full bg-pull-600" style={{ width: `${profile.completion}%` }} /></div></div><p className="px-2.5 pb-1 pt-3 text-[8px] font-extrabold uppercase tracking-[0.15em] text-pull-400">Menu lainnya</p>{profileNavigation.map((item) => { const Icon = item.icon; const count = item.count === 'notifications' ? unreadCount : null; return <NavLink key={item.path} to={item.path} onClick={() => setProfileOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-2.5 py-2 text-[10px] font-extrabold transition ${isActive ? 'bg-pull-50 text-pull-950' : 'text-pull-600 hover:bg-pull-50'}`} role="menuitem"><span className="grid size-8 place-items-center rounded-lg bg-pull-50 text-pull-600"><Icon size={15} /></span><span className="flex-1">{item.label}</span>{count ? <span className="rounded-full bg-[#fff1e8] px-2 py-0.5 text-[8px] text-[#a9593a]">{count}</span> : null}<ChevronRight size={13} className="text-pull-300" /></NavLink> })}<button onClick={() => { setProfileOpen(false); openDialog('logout') }} className="mt-1 flex w-full items-center rounded-xl border-t border-pull-100 px-2.5 py-2.5 text-[10px] font-extrabold text-[#a64f37] hover:bg-[#fff7f4]" role="menuitem">Keluar dari akun</button></div> : null}
        </div>
      </div>
    </header>
  )
}

function MobileBottomNav({ onOpenMore }) {
  const location = useLocation()
  const { unreadCount } = useWorkspace()
  const items = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Loker', path: '/jobs', icon: Search },
    { label: 'Lamaran', path: '/applications', icon: BriefcaseBusiness },
    { label: 'Notifikasi', path: '/notifications', icon: Bell, count: unreadCount },
  ]
  const moreActive = mobileMoreNavigation.some((item) => location.pathname.startsWith(item.path))
  return <nav data-worker-mobile-nav className="fixed inset-x-0 bottom-0 z-40 grid h-[68px] grid-cols-5 border-t border-pull-100 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(12,38,28,.07)] backdrop-blur-xl md:hidden" aria-label="Navigasi mobile">{items.map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} className={({ isActive }) => `relative flex flex-col items-center justify-center gap-1 text-[8px] font-extrabold ${isActive ? 'text-pull-800' : 'text-pull-400'}`}><span className="relative"><Icon size={18} />{item.count ? <span className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-[#df754b] text-[7px] text-white">{item.count}</span> : null}</span><span>{item.label}</span></NavLink> })}<button onClick={onOpenMore} className={`flex flex-col items-center justify-center gap-1 text-[8px] font-extrabold ${moreActive ? 'text-pull-800' : 'text-pull-400'}`} aria-label="Buka menu lainnya"><Grid2X2 size={18} /><span>Menu</span></button></nav>
}

function MobileMoreSheet({ onClose }) {
  const { profile, openDialog } = useWorkspace()
  const rootRef = useRef(null)

  useLayoutEffect(() => runMotion(() => {
    const root = rootRef.current
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    timeline
      .fromTo(root.querySelector('[data-mobile-scrim]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 })
      .fromTo(root.querySelector('section'), { yPercent: 100 }, { yPercent: 0, duration: 0.42, clearProps: 'transform' }, '<')
  }), [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  return <div ref={rootRef} className="fixed inset-0 z-50 md:hidden"><button data-mobile-scrim className="absolute inset-0 bg-pull-950/40 backdrop-blur-sm" onClick={onClose} aria-label="Tutup menu" /><section className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-[0_-24px_70px_rgba(12,38,28,.2)]"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-pull-200" /><div className="mb-4 flex items-center gap-3 rounded-[18px] bg-pull-50 p-3"><span className="avatar">{profile.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-extrabold text-pull-900">{profile.name}</span><span className="mt-0.5 block text-[9px] font-semibold text-pull-500">{profile.completion}% profil lengkap</span></span><button onClick={onClose} className="icon-button size-9" aria-label="Tutup menu"><X size={16} /></button></div><nav className="grid grid-cols-2 gap-2" aria-label="Menu lainnya">{mobileMoreNavigation.map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-[16px] border p-3 text-[10px] font-extrabold transition ${isActive ? 'border-pull-300 bg-pull-50 text-pull-900' : 'border-pull-100 text-pull-600'}`}><span className="grid size-8 place-items-center rounded-xl bg-pull-50 text-pull-600"><Icon size={15} /></span><span className="flex-1">{item.label}</span><ChevronRight size={13} className="text-pull-300" /></NavLink> })}</nav><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => { onClose(); openDialog('help') }} className="secondary-button justify-center">Pusat bantuan</button><button onClick={() => { onClose(); openDialog('logout') }} className="secondary-button justify-center text-[#a64f37]">Keluar</button></div></section></div>
}



export default function AppShell() {
  const location = useLocation()
  const { dialog, closeDialog, handleModalEvent, profile, applications, skills, certificates, portfolio, experiences, advancedFilters, toast } = useWorkspace()
  const [tabletNavOpen, setTabletNavOpen] = useState(false)
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const shellRef = useRef(null)

  useLayoutEffect(() => runMotion(() => {
    const sidebar = shellRef.current.querySelector('[data-worker-sidebar]')
    const topbar = shellRef.current.querySelector('[data-worker-topbar]')
    const mobileNav = shellRef.current.querySelector('[data-worker-mobile-nav]')
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

    timeline
      .fromTo(sidebar, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.58, clearProps: 'opacity,visibility,transform' })
      .fromTo(sidebar.querySelectorAll('.nav-item'), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.32, stagger: 0.045, clearProps: 'opacity,visibility,transform' }, '-=0.34')
      .fromTo(topbar, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.42, clearProps: 'opacity,visibility,transform' }, '<')
      .fromTo(mobileNav, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.38, clearProps: 'opacity,visibility,transform' }, '<')
  }), [])

  useLayoutEffect(() => {
    if (!tabletNavOpen) return undefined
    return runMotion(() => {
      const navigation = shellRef.current.querySelector('[data-tablet-navigation]')
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .fromTo(navigation.querySelector('[data-tablet-scrim]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24 })
        .fromTo(navigation.querySelector('aside'), { xPercent: -100 }, { xPercent: 0, duration: 0.42, clearProps: 'transform' }, '<')
    })
  }, [tabletNavOpen])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div ref={shellRef} className="worker-dashboard min-h-screen bg-[#f6f8f5] text-pull-950">
      <aside data-worker-sidebar className="fixed inset-y-0 left-0 z-40 hidden w-56 bg-gradient-to-b from-[#00613f] via-[#005235] to-[#003f29] lg:block"><SidebarNav /></aside>
      {tabletNavOpen ? <div data-tablet-navigation className="fixed inset-0 z-50 hidden md:block lg:hidden"><button data-tablet-scrim className="absolute inset-0 bg-pull-950/35 backdrop-blur-sm" onClick={() => setTabletNavOpen(false)} aria-label="Tutup navigasi tablet" /><aside className="relative h-full w-64 bg-gradient-to-b from-[#00613f] via-[#005235] to-[#003f29] shadow-2xl"><button onClick={() => setTabletNavOpen(false)} className="icon-button absolute right-3 top-4 z-10" aria-label="Tutup navigasi tablet"><X size={18} /></button><SidebarNav onNavigate={() => setTabletNavOpen(false)} /></aside></div> : null}
      {mobileMoreOpen ? <MobileMoreSheet onClose={() => setMobileMoreOpen(false)} /> : null}
      <div className="lg:pl-56"><Topbar onOpenMenu={() => setTabletNavOpen(true)} /><main className="mx-auto max-w-[1540px] px-4 pb-28 pt-5 sm:px-6 sm:pb-16 sm:pt-7 xl:px-8"><Outlet /><footer className="mt-8 flex flex-col gap-2 border-t border-pull-100 pt-5 text-[9px] font-semibold text-pull-400 sm:flex-row sm:items-center sm:justify-between"><p>Pull Worker Space · Membangun peluang dari Solo Raya</p><p>Data demo tersimpan di perangkat ini</p></footer></main></div>
      <MobileBottomNav onOpenMore={() => setMobileMoreOpen(true)} />
      <FeatureModal key={dialog ? `${dialog.type}-${dialog.appId || dialog.item?.id || ''}` : 'closed'} dialog={dialog} onClose={closeDialog} onEvent={handleModalEvent} profile={profile} applications={applications} skills={skills} certificates={certificates} portfolio={portfolio} experiences={experiences} filters={advancedFilters} />
      <Toast message={toast} />
    </div>
  )
}
