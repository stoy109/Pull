import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  GraduationCap,
  IdCard,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'

export function Brand({ inverse = false }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5" aria-label="Pull dashboard">
      <Image src="/pull-icon.svg" alt="" width={52} height={40} className={`h-10 w-[52px] shrink-0 object-contain ${inverse ? 'brightness-0 invert' : ''}`} aria-hidden="true" />
      <div>
        <p className={`font-display text-[22px] font-bold leading-none tracking-[-0.04em] ${inverse ? 'text-white' : 'text-pull-950'}`}>Pull</p>
        <p className={`mt-1 text-[9px] font-extrabold uppercase tracking-[0.2em] ${inverse ? 'text-white/50' : 'text-pull-500'}`}>Worker space</p>
      </div>
    </Link>
  )
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-pull-500">{eyebrow}</p> : null}
        <h1 className="font-display text-[29px] font-semibold leading-tight tracking-[-0.04em] text-pull-950 sm:text-[34px]">{title}</h1>
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
      {action ? <div className="shrink-0">{action}</div> : actionLabel ? <span className="text-button">{actionLabel}</span> : null}
    </div>
  )
}

export function JobCard({ job, compact = false }) {
  const { savedJobIds, appliedJobIds, toggleSavedJob, openDialog } = useWorkspace()
  const saved = savedJobIds.includes(job.id)
  const applied = appliedJobIds.includes(job.id)

  return (
    <article className={`job-card group ${compact ? 'h-full' : ''}`}>
      <div className="flex min-w-0 flex-1 gap-3.5">
        <div className={`grid size-11 shrink-0 place-items-center rounded-[14px] text-xs font-black ${job.tone}`}>{job.logo}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/jobs/${job.id}`} className="text-sm font-extrabold tracking-[-0.01em] text-pull-950 hover:text-pull-600">{job.role}</Link>
                {job.urgent ? <span className="urgent-label">Rekrut cepat</span> : null}
              </div>
              <p className="mt-1 text-[11px] font-bold text-pull-600">{job.company} · <span className="font-semibold text-pull-400">{job.category}</span></p>
            </div>
            <div className="match-score"><Sparkles size={12} /> {job.match}% cocok</div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-semibold text-pull-500">
            <span className="flex items-center gap-1.5"><MapPin size={13} /> {job.location} · {job.distance}</span>
            <span className="flex items-center gap-1.5"><Clock3 size={13} /> {job.type}</span>
            <span className="flex items-center gap-1.5 font-extrabold text-pull-700"><Wallet size={13} /> {job.pay}</span>
          </div>

          {!compact ? <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-pull-600"><Sparkles size={13} className="mt-0.5 shrink-0 text-pull-600" /><span><strong className="font-extrabold text-pull-800">Kenapa cocok:</strong> {job.reason}</span></p> : null}
        </div>
      </div>

      <div className="job-actions">
        <button onClick={() => toggleSavedJob(job.id)} className={`icon-button size-9 ${saved ? 'border-pull-200 bg-pull-50 text-pull-800' : ''}`} aria-label={saved ? `Hapus ${job.role} dari tersimpan` : `Simpan ${job.role}`}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /></button>
        {applied ? <Link to="/applications" className="secondary-button min-w-22"><Check size={14} /> Dilamar</Link> : <button onClick={() => openDialog('job-apply', { job })} className="primary-button min-w-22"><Phone size={14} /> Lamar</button>}
        <Link to={`/jobs/${job.id}`} className="icon-button size-9" aria-label={`Lihat detail ${job.role}`}><ArrowRight size={15} /></Link>
      </div>
    </article>
  )
}

const activityIcons = {
  eye: Eye,
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

export function Toast({ message }) {
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
  return <div ref={toastRef} className="toast" role="status" aria-live="polite"><CheckCircle2 size={17} /><span>{message}</span></div>
}
