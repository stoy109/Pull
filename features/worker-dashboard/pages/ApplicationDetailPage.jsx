import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, CheckCircle2, Clock3, ExternalLink, MapPin, ShieldCheck, Star, Wallet } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { EmptyState, PageHeader, SectionHeading, StageBadge } from '../components/UI'

const stages = ['Dilamar', 'Ditinjau', 'Interview', 'Diterima', 'Selesai']

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const { findApplication, openDialog, handleModalEvent } = useWorkspace()
  const found = findApplication(id)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')

  if (!found) return <EmptyState title="Lamaran tidak ditemukan" description="Lamaran mungkin sudah ditarik atau datanya berubah." action={<Link to="/applications" className="primary-button">Kembali ke lamaran</Link>} />
  const { application, stage } = found
  const bothConfirmed = application.employerConfirmed && application.workerConfirmed

  return (
    <>
      <Link to={`/applications?stage=${stage}`} className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-pull-600"><ArrowLeft size={14} /> Kembali ke Lamaran Saya</Link>
      <PageHeader eyebrow={stage} title={application.role} description={`${application.company} · ${application.location || 'Solo Raya'}`} actions={<StageBadge stage={stage} />} />
      <div className="grid grid-cols-12 gap-4 2xl:gap-5">
        <div className="col-span-12 space-y-4 xl:col-span-8">
          <section className="card"><div className="flex items-start gap-4"><div className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-pull-50 text-sm font-black text-pull-700">{application.company.split(' ').slice(0, 2).map((word) => word[0]).join('')}</div><div><h2 className="text-base font-extrabold text-pull-950">{application.company}</h2><p className="mt-1 text-[11px] font-bold text-pull-500">{application.role}</p><div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold text-pull-500"><span className="flex items-center gap-1"><MapPin size={12} /> {application.location || 'Solo Raya'}</span><span className="flex items-center gap-1"><Wallet size={12} /> {application.pay || 'Upah sesuai loker'}</span></div></div></div><div className="mt-5 rounded-xl border border-pull-100 bg-pull-50/60 p-3"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-pull-400">Status saat ini</p><p className={`mt-1 text-xs font-extrabold ${application.urgent ? 'text-[#b85c3c]' : 'text-pull-800'}`}>{application.status}</p><p className="mt-1 flex items-center gap-1 text-[9px] text-pull-400"><Clock3 size={11} /> {application.time}</p></div></section>
          <section className="card"><SectionHeading eyebrow="Progress" title="Jejak lamaran" /><div className="space-y-4">{stages.map((item, index) => { const currentIndex = stages.indexOf(stage); const done = index <= currentIndex; const current = item === stage; return <div key={item} className="flex gap-3"><span className={`grid size-8 shrink-0 place-items-center rounded-full ${done ? 'bg-pull-100 text-pull-700' : 'bg-pull-50 text-pull-300'}`}>{done ? <Check size={14} /> : index + 1}</span><div><p className={`text-[11px] font-extrabold ${current ? 'text-pull-900' : 'text-pull-500'}`}>{item}</p><p className="mt-0.5 text-[9px] text-pull-400">{current ? application.status : done ? 'Tahap selesai' : 'Belum dimulai'}</p></div></div> })}</div></section>
          {stage === 'Selesai' && application.confirmable ? <section className="card"><SectionHeading eyebrow="Wajib" title="Confirmation Loop" description="Rating hanya terbuka setelah pekerja dan UMKM mengonfirmasi pekerjaan selesai." /><div className="space-y-2"><ConfirmationRow label="Konfirmasi employer" done={application.employerConfirmed} /><ConfirmationRow label="Konfirmasi kamu" done={application.workerConfirmed} /></div>{!application.workerConfirmed ? <button onClick={() => handleModalEvent('confirm-work', { id: application.id })} className="primary-button mt-4 w-full">Konfirmasi selesai kerja <CheckCircle2 size={15} /></button> : null}{bothConfirmed && !application.rated ? <div className="mt-5 rounded-[18px] border border-[#e7dfcd] bg-[#fffaf0] p-4"><p className="text-xs font-extrabold text-[#594727]">Rating sudah terbuka</p><p className="mt-1 text-[10px] text-[#796747]">Nilai pengalaman yang benar-benar selesai.</p><div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} onClick={() => setRating(value)} className="p-1 text-[#d79b38]" aria-label={`${value} bintang`}><Star size={25} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}</div><textarea className="form-textarea mt-3 bg-white" placeholder="Ulasan singkat" value={review} onChange={(event) => setReview(event.target.value)} /><button disabled={!rating} onClick={() => handleModalEvent('submit-rating', { id: application.id, rating, review })} className="warm-button mt-3">Kirim rating</button></div> : null}{application.rated ? <div className="mt-4 rounded-xl bg-pull-50 p-4"><p className="flex items-center gap-2 text-xs font-extrabold text-pull-800"><Star size={16} fill="currentColor" /> Rating {application.rating}/5 terkirim</p><p className="mt-1 text-[10px] text-pull-500">{application.review || 'Ulasan tersimpan.'}</p></div> : null}</section> : null}
        </div>
        <aside className="col-span-12 xl:col-span-4"><div className="card sticky top-24"><SectionHeading title="Tindakan" description="Aksi yang tersedia mengikuti tahap lamaran." />{stage === 'Interview' ? <button onClick={() => openDialog('interview', { appId: application.id })} className="primary-button w-full">Atur jadwal interview</button> : null}<button onClick={() => handleModalEvent('contact-employer', { application })} className="whatsapp-button mt-2 w-full">Hubungi via WhatsApp <ExternalLink size={14} /></button>{stage === 'Dilamar' ? <button onClick={() => openDialog('application', { appId: application.id, stage })} className="secondary-button mt-2 w-full justify-center text-[#a6533a]">Kelola / tarik lamaran</button> : null}<div className="info-note mt-4"><ShieldCheck size={16} /><p>Isi percakapan WhatsApp tidak disimpan Pull. Klik kontak dicatat untuk keamanan.</p></div></div></aside>
      </div>
    </>
  )
}

function ConfirmationRow({ label, done }) {
  return <div className="flex items-center gap-3 rounded-xl border border-pull-100 p-3"><span className={`grid size-7 place-items-center rounded-full ${done ? 'bg-pull-100 text-pull-700' : 'bg-pull-50 text-pull-400'}`}>{done ? <Check size={13} /> : <Clock3 size={12} />}</span><span className="flex-1 text-[11px] font-extrabold text-pull-800">{label}</span><span className="text-[9px] font-bold text-pull-400">{done ? 'Selesai' : 'Menunggu'}</span></div>
}
