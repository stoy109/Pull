import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Link } from 'react-router-dom'
import {
  Award,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  GraduationCap,
  IdCard,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react'

export function Brand({ inverse = false }) {
  if (inverse) {
    return (
      <Link to="/dashboard" className="flex items-center gap-3" aria-label="Pull dashboard">
        <Image
          src="/Logo(Pull).svg"
          alt="Pull"
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-lg"
          priority
        />
        <span className="text-2xl font-extrabold tracking-normal text-white">Pull</span>
      </Link>
    )
  }

  return (
    <Link to="/dashboard" className="flex items-center gap-2.5" aria-label="Pull dashboard">
      <Image src="/pull-icon.svg" alt="" width={52} height={40} className="h-10 w-[52px] shrink-0 object-contain" aria-hidden="true" />
      <div>
        <p className="font-display text-[22px] font-bold leading-none tracking-[-0.04em] text-pull-950">Pull</p>
        <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.2em] text-pull-500">Worker space</p>
      </div>
    </Link>
  )
}

export function VerifiedUmkmIcon({ className = 'size-4', label = 'UMKM terverifikasi' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label={label}>
      <path fill="#087a41" d="M12 2.15 20 5.3v6.25c0 5.05-3.28 8.45-8 10.3-4.72-1.85-8-5.25-8-10.3V5.3l8-3.15Z" />
      <path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="m8.25 11.8 2.45 2.35 5.1-5.05" />
    </svg>
  )
}

export function PageHeader({ eyebrow, title, description, actions, icon: Icon }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-pull-500">{eyebrow}</p> : null}
        <h1 className="flex items-center gap-2 font-display text-[29px] font-semibold leading-tight tracking-[-0.04em] text-pull-950 sm:text-[34px]">{Icon ? <Icon size={22} className="fill-[#087a41] text-white" strokeWidth={2.2} /> : null}{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-xs font-medium leading-6 text-pull-500 sm:text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}

export function SectionHeading({ eyebrow, title, description, action, actionLabel }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="section-title">{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {action ? <div>{actionLabel ? <span className="sr-only">{actionLabel}</span> : null}{action}</div> : null}
    </div>
  )
}

const activityIcons = {
  briefcase: BriefcaseBusiness,
  badge: BadgeCheck,
  shield: ShieldCheck,
  award: Award,
  user: UserRound,
  camera: Camera,
  identity: IdCard,
  calendar: CalendarDays,
  check: CheckCircle2,
  star: Star,
  graduation: GraduationCap,
  bell: Bell,
}

export function ActivityIcon({ name, tone = 'brand' }) {
  const Icon = activityIcons[name] || Bell
  return <span className={`activity-icon activity-${tone}`}><Icon size={15} /></span>
}

export function StageBadge({ stage }) {
  const tone = stage === 'Interview'
    ? 'bg-[#fff1e8] text-[#a9593a]'
    : stage === 'Diterima'
      ? 'bg-pull-100 text-pull-700'
      : stage === 'Ditolak'
        ? 'bg-[#fae5da] text-[#a6533a]'
        : stage === 'Selesai'
          ? 'bg-[#edf0f3] text-[#5d6b76]'
          : 'bg-pull-50 text-pull-600'
  return <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${tone}`}>{stage}</span>
}

export function EmptyState({ title, description, action, illustration, illustrationAlt = '' }) {
  return (
    <div className="rounded-[20px] border border-dashed border-pull-200 px-5 py-8 text-center">
      {illustration ? <Image src={illustration} alt={illustrationAlt} width={320} height={160} className="mx-auto h-40 w-auto max-w-full object-contain" /> : <Search className="mx-auto text-pull-300" size={26} />}
      <p className={`${illustration ? 'mt-1' : 'mt-3'} text-sm font-extrabold text-pull-900`}>{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-pull-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function MetricCard({ label, value, detail, icon: Icon = Sparkles, tone = 'brand' }) {
  const tones = {
    brand: 'bg-pull-50 text-pull-700',
    warm: 'bg-[#fff4e8] text-[#9b6536]',
    blue: 'bg-[#edf2f6] text-[#536f83]',
  }
  return (
    <div className="rounded-[18px] border border-pull-100 bg-white p-4">
      <div className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`}><Icon size={16} /></div>
      <strong className="mt-4 block font-display text-2xl font-semibold tracking-[-0.04em] text-pull-950">{value}</strong>
      <p className="mt-1 text-[10px] font-extrabold text-pull-700">{label}</p>
      {detail ? <p className="mt-1 text-[9px] leading-relaxed text-pull-400">{detail}</p> : null}
    </div>
  )
}

export function Toast({ message, onClose }) {
  const toastRef = useRef(null)

  useLayoutEffect(() => {
    if (!message || !toastRef.current) return undefined
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(toastRef.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out', clearProps: 'opacity,visibility,transform' })
    })
    return () => media.revert()
  }, [message])

  if (!message) return null
  if (typeof message === 'object') {
    return (
      <div ref={toastRef} className="fixed right-4 top-4 z-[100] flex min-h-[88px] w-[calc(100%-2rem)] max-w-[420px] items-center gap-3 rounded-2xl bg-[#087b3d] px-4 py-4 text-white shadow-[0_18px_45px_rgba(4,73,35,.3)] sm:right-6 sm:top-6 sm:gap-4 sm:px-5" role="status" aria-live="polite">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-[#07843f] shadow-[0_2px_8px_rgba(0,0,0,.08)] sm:size-[52px]"><Check size={28} strokeWidth={3} className="sm:size-[31px]" /></span>
        <span className="min-w-0 flex-1"><strong className="block text-sm font-extrabold leading-tight sm:text-base">{message.title}</strong><span className="mt-2 block text-xs font-medium leading-tight text-white/90 sm:text-[13px]">{message.detail}</span></span>
        <button type="button" onClick={onClose} className="grid size-8 shrink-0 place-items-center text-white transition hover:text-white/75 sm:size-9" aria-label="Tutup notifikasi"><X size={24} strokeWidth={2} className="sm:size-7" /></button>
      </div>
    )
  }
  return <div ref={toastRef} className="toast" role="status" aria-live="polite"><CheckCircle2 size={17} /><span>{message}</span></div>
}
