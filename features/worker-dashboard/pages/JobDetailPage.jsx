import Image from 'next/image'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Bookmark, BriefcaseBusiness, Check, Clock3, ExternalLink, MapPin, Phone, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { jobs } from '../data/mockData'
import { useWorkspace } from '../context/WorkspaceContext'
import { EmptyState, SectionHeading, VerifiedUmkmIcon } from '../components/UI'

export default function JobDetailPage() {
  const { id } = useParams()
  const job = jobs.find((item) => item.id === Number(id))
  const { savedJobIds, appliedJobIds, toggleSavedJob, handleModalEvent } = useWorkspace()

  if (!job) return <EmptyState illustration="/illustrations/store-profile.webp" illustrationAlt="Ilustrasi profil UMKM lokal" title="Loker tidak ditemukan" description="Lowongan mungkin sudah ditutup atau tautannya berubah." action={<Link to="/jobs" className="primary-button">Kembali ke Cari Loker</Link>} />

  const saved = savedJobIds.includes(job.id)
  const applied = appliedJobIds.includes(job.id)
  return (
    <>
      <Link to="/jobs" className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-pull-600"><ArrowLeft size={14} /> Kembali ke Cari Loker</Link>
      <header className="relative mb-7 overflow-hidden"><div className="relative z-10 py-3 sm:min-h-60 sm:max-w-[58%] sm:py-6 lg:max-w-[54%] lg:py-8"><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-pull-500">{job.category} · {job.posted}</p><h1 className="mt-3 max-w-2xl font-display text-[29px] font-semibold leading-[1.08] tracking-[-0.04em] text-pull-950 sm:text-[38px]">{job.role}</h1><p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-pull-600 sm:text-sm">{job.verified ? <VerifiedUmkmIcon className="size-[15px] shrink-0" /> : null} {job.company} · {job.location}</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => toggleSavedJob(job.id)} className="secondary-button"><Bookmark size={15} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Tersimpan' : 'Simpan'}</button>{applied ? <Link to="/applications" className="primary-button"><Check size={15} /> Lihat lamaran</Link> : <button onClick={() => handleModalEvent('contact-job', { job })} className="whatsapp-button"><Phone size={15} /> Lamar via WhatsApp</button>}</div></div><div className="relative h-44 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[48%]"><Image src="/illustrations/umkm-owner.webp" alt="" fill priority sizes="(min-width: 640px) 48vw, 100vw" className="object-contain object-bottom sm:object-right-bottom" /></div></header>
      <div className="grid grid-cols-12 gap-4 2xl:gap-5">
        <div className="col-span-12 space-y-4 xl:col-span-8">
          <section className="card">
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-4"><div className={`grid size-14 place-items-center rounded-[18px] text-sm font-black ${job.tone}`}>{job.logo}</div><div><p className="flex items-center gap-1.5 text-sm font-extrabold text-pull-950">{job.company}{job.verified ? <VerifiedUmkmIcon className="size-[15px] shrink-0" /> : null}</p><p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-pull-400"><MapPin size={12} /> {job.location} · {job.distance}</p><p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-pull-400"><ShieldCheck size={12} className="fill-[#087a41] text-white" strokeWidth={2.2} /> Trust {job.employerTrust} · {job.employerReviews} ulasan</p></div></div><span className="match-score"><Sparkles size={13} /> {job.match}% cocok</span></div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3"><InfoBox icon={Wallet} label="Upah" value={job.pay} /><InfoBox icon={Clock3} label="Jadwal" value={job.schedule} /><InfoBox icon={BriefcaseBusiness} label="Durasi" value={job.duration} /></div>
          </section>
          <section className="card"><SectionHeading title="Tentang pekerjaan" /><p className="text-xs leading-7 text-pull-600">{job.description}</p></section>
          <section className="card"><SectionHeading title="Kebutuhan pekerja" /><div className="grid gap-2 sm:grid-cols-2">{job.requirements.map((requirement) => <div key={requirement} className="flex items-start gap-2 rounded-xl bg-pull-50/70 p-3 text-[10px] font-semibold leading-5 text-pull-700"><Check size={14} className="mt-0.5 shrink-0" /> {requirement}</div>)}</div></section>
          <section className="card"><SectionHeading title="Benefit" /><div className="flex flex-wrap gap-2">{job.benefits.map((benefit) => <span key={benefit} className="skill-chip"><BadgeCheck size={13} /> {benefit}</span>)}</div></section>
        </div>
        <aside className="col-span-12 xl:col-span-4">
          <div className="card sticky top-24"><SectionHeading eyebrow="Kenapa cocok" title={`${job.match}% match`} description={job.reason} /><div className="space-y-2">{job.tags.map((tag) => <div key={tag} className="flex items-center gap-2 rounded-xl border border-pull-100 p-3 text-[10px] font-extrabold text-pull-700"><Check size={13} /> {tag}</div>)}</div><div className="info-note mt-4"><ShieldCheck size={16} /><p>Nomor employer disembunyikan. Pull mencatat lamaran, lalu membuka WhatsApp melalui redirect privat.</p></div>{applied ? <Link to="/applications" className="primary-button mt-5 w-full">Lihat status lamaran</Link> : <button onClick={() => handleModalEvent('contact-job', { job })} className="whatsapp-button mt-5 w-full">Lamar & buka WhatsApp <ExternalLink size={14} /></button>}</div>
        </aside>
      </div>
    </>
  )
}

function InfoBox({ icon: Icon, label, value }) {
  return <div className="rounded-xl border border-pull-100 p-3"><Icon size={15} className="text-pull-500" /><p className="mt-2 text-[9px] font-extrabold uppercase tracking-[0.1em] text-pull-400">{label}</p><p className="mt-1 text-[10px] font-extrabold leading-5 text-pull-800">{value}</p></div>
}
