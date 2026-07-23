import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  Award,

  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Grid2X2,
  Home,
  History,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react'
import FeatureModal from '../FeatureModal'
import { useWorkspace } from '../context/WorkspaceContext'
import { Brand, Toast, VerifiedUmkmIcon } from './UI'

const primaryNavigation = [
  { label: 'Dashboard', description: 'Ringkasan aktivitas', path: '/dashboard', icon: Home },
  { label: 'Papan Loker', description: 'Cari & lamar loker', path: '/jobs', icon: BriefcaseBusiness },
  { label: 'Lamaran Saya', description: 'Status semua lamaran', path: '/applications', icon: ClipboardList, count: 'applications' },
  { label: 'Portofolio', description: 'Sertifikat kerja digital', path: '/profile', icon: Award },
  { label: 'Trust Score', description: 'Reputasi & PullPoints', path: '/trust', icon: ShieldCheck },
]

const profileNavigation = [
  { label: 'Aktivitas', path: '/activity', icon: History },
]

const mobileMoreNavigation = [
  { label: 'Aktivitas', path: '/activity', icon: History },
  { label: 'Trust Score', path: '/trust', icon: ShieldCheck },
  { label: 'Pengaturan', path: '/settings', icon: Settings },
]

function runMotion(animate) {
  const media = gsap.matchMedia()
  media.add('(prefers-reduced-motion: no-preference)', animate)
  return () => media.revert()
}

function SidebarNav({ onNavigate }) {
  const { allApplicationCount, openDialog } = useWorkspace()

  return (
    <div className="worker-sidebar-nav flex h-full flex-col px-5 py-8">
      <div className="px-2"><Brand inverse /></div>
      <nav className="mt-7 flex-1 space-y-2 overflow-y-auto" aria-label="Navigasi utama">
        {primaryNavigation.map((item) => <SidebarLink key={item.path} item={item} count={item.count ? allApplicationCount : null} onNavigate={onNavigate} />)}
        <Link href="/worker/apply" className="nav-item"><BriefcaseBusiness size={16} className="shrink-0" /><span className="whitespace-nowrap">Lamaran Database</span></Link>
      </nav>
      <div className="mt-6 border-t border-white/10 pt-3">
        <nav className="flex flex-col gap-2" aria-label="Bantuan dan pengaturan">
          <button onClick={() => openDialog('help')} className="nav-item"><CircleHelp size={16} className="shrink-0" /><span className="whitespace-nowrap">Bantuan</span></button>
          <NavLink to="/settings" onClick={onNavigate} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><Settings size={16} className="shrink-0" /><span className="whitespace-nowrap">Pengaturan</span></NavLink>
        </nav>
      </div>
    </div>
  )
}

function SidebarLink({ item, count, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink to={item.path} onClick={onNavigate} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
      <><Icon size={16} className="shrink-0" /><span className="whitespace-nowrap">{item.label}</span>{count ? <span className="nav-count">{count}</span> : null}</>
    </NavLink>
  )
}

function Topbar({ onOpenMenu }) {
  const location = useLocation()
  const { profile, openDialog } = useWorkspace()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const currentPage = [...primaryNavigation, ...profileNavigation, { label: 'Pengaturan', path: '/settings', description: 'Kelola preferensi akun pekerja' }].find((item) => location.pathname.startsWith(item.path))
  const pageTitle = location.pathname === '/dashboard' ? 'Dashboard Overview' : currentPage?.label || 'Dashboard'
  const pageDescription = location.pathname === '/dashboard'
    ? 'Ringkasan utama profil Anda, aktivitas terbaru, dan tindakan penting.'
    : currentPage?.description
  const profileComplete = profile.completion >= 100
  const identityStatus = profile.ktpStatus === 'verified' ? 'KTP terverifikasi' : profile.ktpStatus === 'pending' ? 'KTP sedang diperiksa' : 'KTP belum diverifikasi'

  useLayoutEffect(() => {
    if (!profileOpen || !profileMenuRef.current) return undefined
    return runMotion(() => {
      gsap.fromTo(profileMenuRef.current, { autoAlpha: 0, y: -8, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: 'power3.out', clearProps: 'opacity,visibility,transform' })
    })
  }, [profileOpen])

  return (
    <header data-worker-topbar className="sticky top-0 z-30 flex flex-col gap-4 border-b border-[#e2ece6] bg-white px-4 py-5 shadow-sm shadow-emerald-950/5 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="md:hidden"><Brand /></div>
        <button className="icon-button hidden md:grid lg:hidden" onClick={onOpenMenu} aria-label="Buka navigasi tablet"><Menu size={20} /></button>
        <div className="hidden min-w-0 md:block">
          <h1 className="text-3xl font-extrabold leading-tight tracking-normal text-[#10231d]">{pageTitle}</h1>
          {pageDescription ? <p className="mt-2 max-w-[430px] text-sm font-medium leading-relaxed text-[#6b7b75]">{pageDescription}</p> : null}
        </div>
      </div>

      <div className="hidden w-full flex-wrap items-center gap-3 md:flex xl:w-auto xl:flex-nowrap">
        <div className="relative w-full sm:w-auto">
          <div className="flex h-16 w-full items-center rounded-full border border-[#d8dfdc] bg-white py-2 pl-2.5 pr-2 shadow-[0_3px_12px_rgba(18,59,48,0.07)] transition hover:border-[#b8c9c0] sm:w-[260px]"><NavLink to="/settings/profile" className="grid size-12 shrink-0 place-items-center rounded-full bg-[#08783d] bg-cover bg-center text-base font-medium text-white ring-offset-2 focus-visible:ring-3 focus-visible:ring-[#9fcbb0]" style={profile.photo ? { backgroundImage: `url(${profile.photo})` } : undefined} aria-label="Ubah profil">{profile.photo ? null : profile.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</NavLink><button onClick={() => setProfileOpen((current) => !current)} className="flex min-w-0 flex-1 items-center gap-3 px-3 text-left" aria-expanded={profileOpen} aria-haspopup="menu"><span className="min-w-0 flex-1"><span className="block whitespace-nowrap text-sm font-extrabold leading-tight text-[#111b17]">{profile.name}</span><span className="mt-1 block whitespace-nowrap text-xs font-medium leading-tight text-[#69756f]">{profileComplete ? 'Profil lengkap' : `${profile.completion}% profil lengkap`}</span></span><ChevronDown size={22} strokeWidth={2.5} className={`shrink-0 text-[#050b08] transition-transform ${profileOpen ? 'rotate-180' : ''}`} /></button></div>

          {profileOpen ? (
            <div ref={profileMenuRef} className="absolute right-0 top-[calc(100%+10px)] z-20 w-[312px] overflow-hidden rounded-xl border border-[#dfe6e2] bg-white px-4 py-5 shadow-[0_22px_60px_rgba(12,38,28,0.16)]" role="menu">
              <div className="flex items-center gap-3">
                <NavLink to="/settings/profile" onClick={() => setProfileOpen(false)} className="grid size-[54px] shrink-0 place-items-center rounded-full bg-[#08783d] bg-cover bg-center text-lg font-medium text-white" style={profile.photo ? { backgroundImage: `url(${profile.photo})` } : undefined} aria-label="Ubah profil">{profile.photo ? null : profile.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</NavLink>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-[#111b17]">{profile.name}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5"><span className={`inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1 text-[9px] font-semibold ${profile.whatsappVerified ? 'bg-[#f0f7f2] text-[#315c45]' : 'bg-[#fff4e8] text-[#9c6537]'}`}>{profile.whatsappVerified ? <VerifiedUmkmIcon className="size-3 shrink-0" label="WhatsApp terverifikasi" /> : <ShieldCheck size={12} />}<span className="truncate">{profile.whatsappVerified ? 'WhatsApp terverifikasi' : 'WhatsApp perlu diverifikasi'}</span></span><span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-semibold ${profile.ktpStatus === 'verified' ? 'bg-[#f0f7f2] text-[#315c45]' : 'bg-[#f3f5f4] text-[#687770]'}`}><ShieldCheck size={12} /> {identityStatus}</span></div>
                </div>
              </div>

              {!profileComplete ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-extrabold"><span className="text-[#2f3e38]">{profile.completion}% profil lengkap</span><NavLink to="/settings/profile" onClick={() => setProfileOpen(false)} className="inline-flex items-center gap-1 whitespace-nowrap text-[#16844c] transition hover:text-[#086f3a]">Lengkapi Profil <ArrowRight size={13} /></NavLink></div>
                  <div className="mt-2 flex items-center gap-3"><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#e8ebea]"><div className="h-full rounded-full bg-[#16864c]" style={{ width: `${profile.completion}%` }} /></div><span className="text-[10px] font-extrabold text-[#3e4b46]">{profile.completion}%</span></div>
                </div>
              ) : null}

              <div className="mt-5 border-t border-[#e1e7e3] pt-4">
                <p className="mb-2 text-[9px] font-extrabold uppercase text-[#65736e]">Menu lainnya</p>
                <nav className="space-y-1" aria-label="Menu profil">
                  {profileNavigation.map((item) => {
                    const Icon = item.icon
                    return <NavLink key={item.path} to={item.path} onClick={() => setProfileOpen(false)} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-0.5 py-1.5 text-[11px] font-extrabold transition ${isActive ? 'text-[#08783d]' : 'text-[#1d2924] hover:text-[#08783d]'}`} role="menuitem"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#edf7f0] text-[#247b4d]"><Icon size={17} /></span><span className="flex-1">{item.label}</span><ChevronRight size={17} className="text-[#6f7c77]" /></NavLink>
                  })}
                </nav>
              </div>

              <button onClick={() => { setProfileOpen(false); openDialog('logout') }} className="mt-4 flex min-h-12 w-full items-center gap-4 border-t border-[#e1e7e3] px-0.5 pt-4 text-left text-[11px] font-extrabold text-[#e33342] transition hover:text-[#b92331]" role="menuitem"><LogOut size={19} /><span>Keluar dari akun</span></button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function MobileBottomNav({ onOpenMore }) {
  const location = useLocation()
  const items = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Loker', path: '/jobs', icon: Search },
    { label: 'Menu', icon: Grid2X2, center: true },
    { label: 'Lamaran', path: '/applications', icon: BriefcaseBusiness },
    { label: 'Portofolio', path: '/profile', icon: Award },
  ]
  const moreActive = mobileMoreNavigation.some((item) => location.pathname.startsWith(item.path))

  return <nav data-worker-mobile-nav className="fixed inset-x-0 bottom-0 z-40 grid h-[72px] grid-cols-5 border-t border-pull-100 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(12,38,28,.07)] backdrop-blur-xl md:hidden" aria-label="Navigasi mobile">{items.map((item) => { const Icon = item.icon; return item.center ? <button key={item.label} type="button" onClick={onOpenMore} className={`relative flex flex-col items-center justify-end pb-1.5 text-[8px] font-extrabold ${moreActive ? 'text-[#08783f]' : 'text-pull-500'}`} aria-label="Buka menu lainnya"><span className="absolute bottom-7 grid size-14 place-items-center rounded-full bg-[#08783f] text-white shadow-[0_8px_20px_rgba(8,120,63,.3)] ring-[6px] ring-[#f6f8f5]"><Icon size={24} /></span><span className="relative z-10">Menu</span></button> : <NavLink key={item.path} to={item.path} className={({ isActive }) => `relative flex flex-col items-center justify-center gap-1 text-[8px] font-extrabold ${isActive ? 'text-[#08783f]' : 'text-pull-400'}`}><span className="relative"><Icon size={18} />{item.count ? <span className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-[#df754b] text-[7px] text-white">{item.count}</span> : null}</span><span>{item.label}</span></NavLink> })}</nav>
}

function MobileMoreSheet({ onClose }) {
  const { profile, openDialog } = useWorkspace()
  const rootRef = useRef(null)
  const profileComplete = profile.completion >= 100
  const identityStatus = profile.ktpStatus === 'verified' ? 'KTP terverifikasi' : profile.ktpStatus === 'pending' ? 'KTP diperiksa' : 'KTP belum diverifikasi'

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

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 md:hidden">
      <button data-mobile-scrim className="absolute inset-0 bg-pull-950/40 backdrop-blur-sm" onClick={onClose} aria-label="Tutup menu" />
      <section className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 shadow-[0_-24px_70px_rgba(12,38,28,.2)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-pull-200" />
        <div className="mb-4 flex items-start gap-3 rounded-[18px] bg-pull-50 p-3">
          <span className="avatar">{profile.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-extrabold text-pull-900">{profile.name}</span><span className="mt-0.5 block text-[9px] font-semibold text-pull-500">{profileComplete ? 'Profil lengkap' : `${profile.completion}% profil lengkap`}</span><span className="mt-1.5 flex flex-wrap gap-1"><span className={`rounded px-1.5 py-1 text-[8px] font-bold ${profile.whatsappVerified ? 'bg-[#e8f5ec] text-[#08783f]' : 'bg-[#fff0df] text-[#a35f1d]'}`}>{profile.whatsappVerified ? 'WhatsApp terverifikasi' : 'WhatsApp perlu verifikasi'}</span><span className={`rounded px-1.5 py-1 text-[8px] font-bold ${profile.ktpStatus === 'verified' ? 'bg-[#e8f5ec] text-[#08783f]' : 'bg-white text-[#687770]'}`}>{identityStatus}</span></span></span>
          <button onClick={onClose} className="icon-button size-9" aria-label="Tutup menu"><X size={16} /></button>
        </div>
        <nav className="grid grid-cols-2 gap-2" aria-label="Menu lainnya">{mobileMoreNavigation.map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-[16px] border p-3 text-[10px] font-extrabold transition ${isActive ? 'border-pull-300 bg-pull-50 text-pull-900' : 'border-pull-100 text-pull-600'}`}><span className="grid size-8 place-items-center rounded-xl bg-pull-50 text-pull-600"><Icon size={15} /></span><span className="flex-1">{item.label}</span><ChevronRight size={13} className="text-pull-300" /></NavLink> })}</nav>
        <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => { onClose(); openDialog('help') }} className="secondary-button justify-center">Pusat bantuan</button><button onClick={() => { onClose(); openDialog('logout') }} className="secondary-button justify-center text-[#a64f37]">Keluar</button></div>
      </section>
    </div>
  )
}



export default function AppShell() {
  const location = useLocation()
  const { dialog, closeDialog, handleModalEvent, profile, applications, appliedJobIds, skills, certificates, portfolio, experiences, advancedFilters, toast, dismissToast } = useWorkspace()
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
      {tabletNavOpen ? <div data-tablet-navigation className="fixed inset-0 z-50 hidden md:block lg:hidden"><button data-tablet-scrim className="absolute inset-0 bg-pull-950/35 backdrop-blur-sm" onClick={() => setTabletNavOpen(false)} aria-label="Tutup navigasi tablet" /><aside className="relative h-full w-56 bg-gradient-to-b from-[#00613f] via-[#005235] to-[#003f29] shadow-2xl"><button onClick={() => setTabletNavOpen(false)} className="icon-button absolute right-3 top-4 z-10" aria-label="Tutup navigasi tablet"><X size={18} /></button><SidebarNav onNavigate={() => setTabletNavOpen(false)} /></aside></div> : null}
      {mobileMoreOpen ? <MobileMoreSheet onClose={() => setMobileMoreOpen(false)} /> : null}
      <div className="lg:pl-56"><Topbar onOpenMenu={() => setTabletNavOpen(true)} /><main className="mx-auto max-w-[1540px] px-4 pb-28 pt-5 sm:px-6 sm:pb-16 sm:pt-7 xl:px-8"><Outlet /><footer className="mt-8 flex flex-col gap-2 border-t border-pull-100 pt-5 text-[9px] font-semibold text-pull-400 sm:flex-row sm:items-center sm:justify-between"><p>Pull Worker Space · Membangun peluang dari Solo Raya</p><p>Data demo tersimpan di perangkat ini</p></footer></main></div>
      <MobileBottomNav onOpenMore={() => setMobileMoreOpen(true)} />
      <FeatureModal key={dialog ? `${dialog.type}-${dialog.appId || dialog.item?.id || ''}` : 'closed'} dialog={dialog} onClose={closeDialog} onEvent={handleModalEvent} profile={profile} applications={applications} appliedJobIds={appliedJobIds} skills={skills} certificates={certificates} portfolio={portfolio} experiences={experiences} filters={advancedFilters} />
      <Toast message={toast} onClose={dismissToast} />
    </div>
  )
}
