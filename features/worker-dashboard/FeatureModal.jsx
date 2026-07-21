import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Plus,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  UploadCloud,
  UserRound,
  Wallet,
  X,
} from 'lucide-react'
import { signOutAction } from '@/features/auth/actions'

function ModalShell({ title, eyebrow, description, onClose, children, wide = false }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .fromTo(rootRef.current.querySelector('[data-modal-scrim]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24 })
        .fromTo(rootRef.current.querySelector('.modal-panel'), { autoAlpha: 0, y: 22, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.38, clearProps: 'opacity,visibility,transform' }, '<')
    })
    return () => media.revert()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div ref={rootRef} className="modal-backdrop" role="presentation">
      <button data-modal-scrim className="absolute inset-0 cursor-default bg-pull-950/45 backdrop-blur-sm" onClick={onClose} aria-label="Tutup dialog" />
      <section className={`modal-panel ${wide ? 'modal-panel-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <div className="min-w-0">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2 id="modal-title" className="font-display text-xl font-semibold tracking-[-0.03em] text-pull-950 sm:text-2xl">{title}</h2>
            {description ? <p className="mt-1.5 text-[11px] leading-relaxed text-pull-500">{description}</p> : null}
          </div>
          <button onClick={onClose} className="icon-button size-9" aria-label="Tutup dialog"><X size={17} /></button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  )
}

function InterviewForm({ application, onClose, onEvent }) {
  const [schedule, setSchedule] = useState(application?.time || 'Hari ini · 14.00 WIB')
  const [note, setNote] = useState('Terima kasih. Saya siap hadir sesuai jadwal.')

  return (
    <ModalShell title="Konfirmasi interview" eyebrow="Tindakan diperlukan" description={`${application?.company || 'Warung Mapan'} menunggu konfirmasimu sebelum 11.30 WIB.`} onClose={onClose}>
      <div className="rounded-[18px] border border-pull-100 bg-pull-50/70 p-4">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-white text-pull-700 shadow-sm"><CalendarIcon /></div>
          <div>
            <p className="text-sm font-extrabold text-pull-950">{application?.role || 'Kasir & Pelayan'}</p>
            <p className="mt-1 text-[11px] font-bold text-pull-500">{application?.company || 'Warung Mapan'}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-semibold text-pull-600">
              <span className="flex items-center gap-1"><MapPin size={12} /> Banjarsari, Solo</span>
              <span className="flex items-center gap-1"><Clock3 size={12} /> 30 menit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <label className="form-label" htmlFor="interview-schedule">Pilih jadwal</label>
        <select id="interview-schedule" className="form-input" value={schedule} onChange={(event) => setSchedule(event.target.value)}>
          <option>Hari ini · 14.00 WIB</option>
          <option>Hari ini · 16.30 WIB</option>
          <option>Senin · 09.00 WIB</option>
        </select>
      </div>
      <div className="mt-4">
        <label className="form-label" htmlFor="interview-note">Pesan untuk employer</label>
        <textarea id="interview-note" className="form-textarea" value={note} onChange={(event) => setNote(event.target.value)} maxLength={180} />
        <p className="mt-1 text-right text-[9px] font-bold text-pull-400">{note.length}/180</p>
      </div>

      <div className="info-note mt-4"><MessageCircle size={16} /><p>Konfirmasi tercatat di Pull. Percakapan lanjutan dibuka melalui redirect WhatsApp tanpa menampilkan nomor employer.</p></div>
      <div className="modal-footer">
        <button onClick={() => onEvent('reschedule-interview', { id: application?.id, schedule, note })} className="secondary-button">Minta jadwal lain</button>
        <button onClick={() => onEvent('confirm-interview', { id: application?.id, schedule, note })} className="primary-button">Konfirmasi hadir <Check size={15} /></button>
      </div>
    </ModalShell>
  )
}

function CalendarIcon() {
  return <BriefcaseBusiness size={19} />
}

function KycForm({ profile, onClose, onEvent }) {
  const [identityNumber, setIdentityNumber] = useState('')
  const [fileName, setFileName] = useState('')
  const [consent, setConsent] = useState(false)
  const canSubmit = identityNumber.replace(/\D/g, '').length === 16 && fileName && consent

  return (
    <ModalShell title="Ajukan verifikasi KTP" eyebrow="KYC opsional" description="Level 2 memberi badge Verified Member dan boost visibilitas. Semua loker tetap dapat diakses tanpa Level 2." onClose={onClose}>
      {profile.ktpStatus === 'pending' ? (
        <StatusPanel icon={Clock3} title="Dokumen sedang diperiksa" detail="Admin Pull biasanya menyelesaikan pemeriksaan visual dalam 1×24 jam. Dokumen tetap privat." />
      ) : profile.ktpStatus === 'verified' ? (
        <StatusPanel icon={BadgeCheck} title="Identitas sudah terverifikasi" detail="Badge Verified Member aktif di profil publikmu." success />
      ) : (
        <>
          <div className="info-note"><LockKeyhole size={16} /><p>Nomor dan foto KTP disimpan sebagai data privat. Employer hanya melihat status Verified Member, bukan dokumenmu.</p></div>
          <div className="mt-5">
            <label className="form-label" htmlFor="identity-number">NIK · 16 digit</label>
            <input id="identity-number" className="form-input" inputMode="numeric" maxLength={16} value={identityNumber} onChange={(event) => setIdentityNumber(event.target.value.replace(/\D/g, ''))} placeholder="Masukkan NIK" />
          </div>
          <div className="mt-4">
            <span className="form-label">Foto KTP</span>
            <label className="upload-zone">
              <UploadCloud size={23} />
              <span className="font-extrabold text-pull-800">{fileName || 'Pilih foto yang jelas'}</span>
              <span className="text-[9px] font-semibold text-pull-400">JPG, PNG, atau PDF · maks. 5 MB</span>
              <input type="file" className="sr-only" accept="image/png,image/jpeg,application/pdf" onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} />
            </label>
          </div>
          <label className="mt-4 flex items-start gap-2.5 text-[10px] leading-5 text-pull-600">
            <input type="checkbox" className="mt-1 accent-pull-800" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            Data benar milik saya dan boleh dipakai Pull hanya untuk pemeriksaan identitas.
          </label>
          <div className="modal-footer">
            <button onClick={onClose} className="secondary-button">Nanti saja</button>
            <button disabled={!canSubmit} onClick={() => onEvent('submit-kyc', { identityNumber, fileName })} className="primary-button">Kirim untuk diperiksa <ArrowRight size={14} /></button>
          </div>
        </>
      )}
    </ModalShell>
  )
}

function CertificateForm({ onClose, onEvent }) {
  const [name, setName] = useState('Kasir Digital & POS Dasar')
  const [issuer, setIssuer] = useState('Balai Latihan Kerja Surakarta')
  const [date, setDate] = useState('2026-07-12')
  const [fileName, setFileName] = useState('')

  return (
    <ModalShell title="Upload sertifikat" eyebrow="Bukti skill" description="Sertifikat ditinjau sebelum badge bukti aktif di profil." onClose={onClose}>
      <form onSubmit={(event) => { event.preventDefault(); onEvent('add-certificate', { name, issuer, date, fileName: fileName || 'sertifikat-kasir-digital.pdf' }) }}>
        <div className="form-grid">
          <label><span className="form-label">Nama sertifikat</span><input required className="form-input" value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label><span className="form-label">Penerbit</span><input required className="form-input" value={issuer} onChange={(event) => setIssuer(event.target.value)} /></label>
        </div>
        <label className="mt-4 block"><span className="form-label">Tanggal terbit</span><input required type="date" className="form-input" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label className="upload-zone mt-4">
          <Award size={23} />
          <span className="font-extrabold text-pull-800">{fileName || 'Pilih file sertifikat'}</span>
          <span className="text-[9px] font-semibold text-pull-400">PDF, JPG, atau PNG · maks. 8 MB</span>
          <input type="file" className="sr-only" accept="image/png,image/jpeg,application/pdf" onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} />
        </label>
        <div className="modal-footer"><button type="button" onClick={onClose} className="secondary-button">Batal</button><button type="submit" className="primary-button">Upload sertifikat <UploadCloud size={14} /></button></div>
      </form>
    </ModalShell>
  )
}

function ProfileForm({ profile, onClose, onEvent }) {
  const [form, setForm] = useState(profile)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <ModalShell title="Lengkapi profil" eyebrow={`Kekuatan profil ${profile.completion}%`} description="Data ini membantu employer menilai kecocokan sebelum menghubungimu." onClose={onClose} wide>
      <form onSubmit={(event) => { event.preventDefault(); onEvent('update-profile', form) }}>
        <div className="form-grid">
          <label><span className="form-label">Nama lengkap</span><input required className="form-input" value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
          <label><span className="form-label">Kecamatan domisili</span><select className="form-input" value={form.district} onChange={(event) => update('district', event.target.value)}><option>Banjarsari</option><option>Laweyan</option><option>Jebres</option><option>Serengan</option><option>Pasar Kliwon</option><option>Sukoharjo</option></select></label>
          <label><span className="form-label">Judul profesional</span><input required className="form-input" value={form.title} onChange={(event) => update('title', event.target.value)} /></label>
          <label><span className="form-label">Pengalaman</span><select className="form-input" value={form.experienceLevel} onChange={(event) => update('experienceLevel', event.target.value)}><option>Belum ada pengalaman</option><option>Kurang dari 1 tahun</option><option>1–3 tahun</option><option>Lebih dari 3 tahun</option></select></label>
        </div>
        <label className="mt-4 block"><span className="form-label">Tentang saya</span><textarea required className="form-textarea" value={form.bio} onChange={(event) => update('bio', event.target.value)} maxLength={320} /></label>
        <div className="form-grid mt-4">
          <label><span className="form-label">Preferensi kerja</span><select className="form-input" value={form.workPreference} onChange={(event) => update('workPreference', event.target.value)}><option>Harian / paruh waktu</option><option>Bulanan</option><option>Proyek / borongan</option><option>Semua tipe kerja</option></select></label>
          <label><span className="form-label">Radius kerja</span><select className="form-input" value={form.radius} onChange={(event) => update('radius', event.target.value)}><option>5 km</option><option>10 km</option><option>20 km</option><option>Seluruh Solo Raya</option></select></label>
        </div>
        <div className="modal-footer"><button type="button" onClick={onClose} className="secondary-button">Batal</button><button type="submit" className="primary-button">Simpan profil <Save size={14} /></button></div>
      </form>
    </ModalShell>
  )
}

function PortfolioForm({ onClose, onEvent }) {
  const [title, setTitle] = useState('Display promo akhir pekan')
  const [client, setClient] = useState('Pasar Segar Nusukan')
  const [description, setDescription] = useState('Menata produk, label harga, dan area promo agar lebih mudah dilihat pelanggan.')
  const [fileName, setFileName] = useState('')

  return (
    <ModalShell title="Tambah portofolio" eyebrow="Bukti kerja" description="Gunakan foto pekerjaan sendiri dan jelaskan kontribusimu." onClose={onClose}>
      <form onSubmit={(event) => { event.preventDefault(); onEvent('add-portfolio', { title, client, description, fileName: fileName || 'display-promo.jpg' }) }}>
        <label><span className="form-label">Judul pekerjaan</span><input required className="form-input" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="mt-4 block"><span className="form-label">Tempat / pemberi kerja</span><input required className="form-input" value={client} onChange={(event) => setClient(event.target.value)} /></label>
        <label className="mt-4 block"><span className="form-label">Apa yang kamu kerjakan?</span><textarea required className="form-textarea" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label className="upload-zone mt-4"><Camera size={23} /><span className="font-extrabold text-pull-800">{fileName || 'Tambah foto bukti'}</span><span className="text-[9px] font-semibold text-pull-400">JPG atau PNG · maks. 8 MB</span><input type="file" className="sr-only" accept="image/png,image/jpeg" onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} /></label>
        <div className="modal-footer"><button type="button" onClick={onClose} className="secondary-button">Batal</button><button type="submit" className="primary-button">Simpan portofolio <Plus size={14} /></button></div>
      </form>
    </ModalShell>
  )
}

function ExperienceForm({ onClose, onEvent }) {
  const [role, setRole] = useState('Staf Toko')
  const [company, setCompany] = useState('Pasar Segar Nusukan')
  const [start, setStart] = useState('2025-08')
  const [end, setEnd] = useState('2026-06')
  const [description, setDescription] = useState('Melayani pelanggan, mengoperasikan kasir, menata rak, dan memeriksa stok harian.')
  return (
    <ModalShell title="Tambah pengalaman kerja" eyebrow="Riwayat profesional" description="Pengalaman tampil sebagai ringkasan di profil publik dan CV." onClose={onClose}>
      <form onSubmit={(event) => { event.preventDefault(); onEvent('add-experience', { role, company, start, end, description }) }}>
        <div className="form-grid"><label><span className="form-label">Posisi</span><input required className="form-input" value={role} onChange={(event) => setRole(event.target.value)} /></label><label><span className="form-label">Tempat kerja</span><input required className="form-input" value={company} onChange={(event) => setCompany(event.target.value)} /></label><label><span className="form-label">Mulai</span><input required type="month" className="form-input" value={start} onChange={(event) => setStart(event.target.value)} /></label><label><span className="form-label">Selesai</span><input required type="month" className="form-input" value={end} onChange={(event) => setEnd(event.target.value)} /></label></div>
        <label className="mt-4 block"><span className="form-label">Tanggung jawab</span><textarea required className="form-textarea" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <div className="modal-footer"><button type="button" onClick={onClose} className="secondary-button">Batal</button><button type="submit" className="primary-button">Simpan pengalaman <Save size={14} /></button></div>
      </form>
    </ModalShell>
  )
}

function JobApplyForm({ job, onClose, onEvent }) {
  const [message, setMessage] = useState(`Halo ${job.company}, saya Dimas tertarik melamar posisi ${job.role}. Profil dan riwayat saya tersedia di Pull.`)

  return (
    <ModalShell title="Lamar via WhatsApp" eyebrow={`${job.match}% cocok`} description="Pull mencatat lamaran, lalu mengarahkanmu ke WhatsApp employer melalui tautan privat." onClose={onClose}>
      <div className="rounded-[18px] border border-pull-100 p-4">
        <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-extrabold text-pull-950">{job.role}</p><p className="mt-1 text-[11px] font-bold text-pull-500">{job.company}</p></div><span className="match-score"><Sparkles size={12} /> {job.match}%</span></div>
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold text-pull-500"><span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span><span className="flex items-center gap-1"><Wallet size={12} /> {job.pay}</span></div>
      </div>
      <label className="mt-5 block"><span className="form-label">Pesan pembuka</span><textarea className="form-textarea min-h-28" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={320} /></label>
      <div className="info-note mt-4"><ShieldCheck size={16} /><p>Nomor asli employer tidak ditampilkan di Pull. Klik kontak dicatat untuk keamanan, bukan isi percakapan.</p></div>
      <div className="modal-footer"><button onClick={onClose} className="secondary-button">Batal</button><button onClick={() => onEvent('contact-job', { job, message })} className="whatsapp-button">Catat & buka WhatsApp <ExternalLink size={14} /></button></div>
    </ModalShell>
  )
}

function ApplicationDetail({ application, stage, onClose, onEvent }) {
  const [rating, setRating] = useState(application.rating || 0)
  const [review, setReview] = useState(application.review || '')
  if (!application) return null
  if (stage === 'Interview') return <InterviewForm application={application} onClose={onClose} onEvent={onEvent} />

  const bothConfirmed = application.employerConfirmed && application.workerConfirmed
  return (
    <ModalShell title="Detail lamaran" eyebrow={stage} description={`${application.role} · ${application.company}`} onClose={onClose}>
      <div className="rounded-[18px] border border-pull-100 bg-pull-50/60 p-4">
        <div className="flex items-start gap-3"><div className="grid size-11 place-items-center rounded-xl bg-white text-xs font-black text-pull-700 shadow-sm">{application.company.split(' ').slice(0, 2).map((word) => word[0]).join('')}</div><div><p className="text-sm font-extrabold text-pull-950">{application.role}</p><p className="mt-1 text-[11px] font-bold text-pull-500">{application.company}</p><p className="mt-2 text-[10px] font-extrabold text-pull-700">{application.status}</p></div></div>
      </div>

      {stage === 'Selesai' && application.confirmable ? (
        <div className="mt-5">
          <p className="form-label">Confirmation Loop</p>
          <div className="mt-2 space-y-2">
            <ConfirmationRow label="Konfirmasi employer" done={application.employerConfirmed} />
            <ConfirmationRow label="Konfirmasi kamu" done={application.workerConfirmed} />
          </div>
          {!application.workerConfirmed ? (
            <div className="mt-4"><div className="info-note"><CircleAlert size={16} /><p>Konfirmasi hanya jika pekerjaan benar-benar selesai. Rating baru terbuka setelah kedua pihak mengonfirmasi.</p></div><button onClick={() => onEvent('confirm-work', { id: application.id, stage })} className="primary-button mt-4 w-full">Konfirmasi selesai kerja <CheckCircle2 size={15} /></button></div>
          ) : null}
          {bothConfirmed && !application.rated ? (
            <div className="mt-5 rounded-[18px] border border-[#e7dfcd] bg-[#fffaf0] p-4">
              <p className="text-xs font-extrabold text-[#594727]">Rating sudah terbuka</p>
              <p className="mt-1 text-[10px] leading-relaxed text-[#796747]">Nilai pengalaman kerja yang benar-benar selesai.</p>
              <div className="mt-3 flex gap-1" aria-label="Pilih rating">
                {[1, 2, 3, 4, 5].map((value) => <button key={value} onClick={() => setRating(value)} className="p-1 text-[#d79b38]" aria-label={`${value} bintang`}><Star size={24} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}
              </div>
              <textarea className="form-textarea mt-3 bg-white" placeholder="Tulis ulasan singkat (opsional)" value={review} onChange={(event) => setReview(event.target.value)} />
              <button disabled={!rating} onClick={() => onEvent('submit-rating', { id: application.id, stage, rating, review })} className="warm-button mt-3">Kirim rating</button>
            </div>
          ) : null}
          {application.rated ? <StatusPanel icon={Star} title={`Rating ${application.rating}/5 terkirim`} detail={application.review || 'Terima kasih. Ulasan terikat pada pekerjaan terverifikasi ini.'} success /> : null}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <TimelineRow title="Lamaran dicatat di Pull" detail={application.time} done />
          <TimelineRow title={stage === 'Dilamar' ? 'Menunggu employer meninjau' : 'Employer sedang memproses'} detail="Update berikutnya akan masuk ke notifikasi." />
          <div className="modal-footer">
            {stage === 'Dilamar' ? <button onClick={() => onEvent('withdraw-application', { id: application.id, stage })} className="secondary-button text-[#a6533a]">Tarik lamaran</button> : null}
            <button onClick={() => onEvent('contact-employer', { application })} className="whatsapp-button">Hubungi via WhatsApp <ExternalLink size={14} /></button>
          </div>
        </div>
      )}
    </ModalShell>
  )
}

function ConfirmationRow({ label, done }) {
  return <div className="flex items-center gap-3 rounded-xl border border-pull-100 px-3 py-2.5"><span className={`grid size-7 place-items-center rounded-full ${done ? 'bg-pull-100 text-pull-700' : 'bg-[#f1f1ec] text-pull-400'}`}>{done ? <Check size={14} strokeWidth={3} /> : <Clock3 size={13} />}</span><span className="flex-1 text-[11px] font-bold text-pull-800">{label}</span><span className="text-[9px] font-extrabold text-pull-400">{done ? 'Selesai' : 'Menunggu'}</span></div>
}

function TimelineRow({ title, detail, done }) {
  return <div className="flex gap-3"><span className={`mt-0.5 grid size-7 place-items-center rounded-full ${done ? 'bg-pull-100 text-pull-700' : 'bg-pull-50 text-pull-400'}`}>{done ? <Check size={13} /> : <Clock3 size={12} />}</span><div><p className="text-[11px] font-extrabold text-pull-800">{title}</p><p className="mt-0.5 text-[9px] text-pull-400">{detail}</p></div></div>
}

function MessagesPanel({ applications, onClose, onEvent }) {
  const contacts = applications.Interview.concat(applications.Ditinjau).slice(0, 3)
  return (
    <ModalShell title="Kontak employer" eyebrow="WhatsApp privat" description="Pull tidak menyimpan isi chat. Setiap tombol memakai redirect privat dan mencatat klik untuk anti-spam." onClose={onClose}>
      <div className="space-y-2.5">
        {contacts.map((application) => <div key={application.id} className="flex items-center gap-3 rounded-[16px] border border-pull-100 p-3"><div className="grid size-10 place-items-center rounded-xl bg-pull-50 text-[10px] font-black text-pull-700">{application.company.split(' ').slice(0, 2).map((word) => word[0]).join('')}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-pull-900">{application.company}</p><p className="mt-0.5 truncate text-[9px] text-pull-400">{application.role} · {application.status}</p></div><button onClick={() => onEvent('contact-employer', { application })} className="whatsapp-button size-9 px-0" aria-label={`Hubungi ${application.company}`}><MessageCircle size={15} /></button></div>)}
      </div>
    </ModalShell>
  )
}

function FiltersForm({ filters, onClose, onEvent }) {
  const [form, setForm] = useState(filters)
  return (
    <ModalShell title="Filter loker" eyebrow="Pencarian rinci" description="Atur hasil tanpa mengubah preferensi smart matching permanen." onClose={onClose}>
      <div className="form-grid">
        <label><span className="form-label">Kategori</span><select className="form-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Semua kategori</option><option>F&B</option><option>Administrasi</option><option>Produksi</option><option>Retail</option><option>Logistik</option></select></label>
        <label><span className="form-label">Jarak maksimum</span><select className="form-input" value={form.distance} onChange={(event) => setForm({ ...form, distance: event.target.value })}><option>Semua jarak</option><option>5 km</option><option>10 km</option><option>20 km</option></select></label>
        <label><span className="form-label">Tipe kerja</span><select className="form-input" value={form.workType} onChange={(event) => setForm({ ...form, workType: event.target.value })}><option>Semua tipe</option><option>Harian lepas</option><option>Paruh waktu</option><option>Kontrak</option><option>Proyek</option></select></label>
        <label><span className="form-label">Minimal kecocokan</span><select className="form-input" value={form.minMatch} onChange={(event) => setForm({ ...form, minMatch: Number(event.target.value) })}><option value={0}>Semua</option><option value={70}>70%</option><option value={80}>80%</option><option value={90}>90%</option></select></label>
      </div>
      <label className="mt-4 flex items-center justify-between rounded-xl border border-pull-100 p-3"><span><span className="block text-[11px] font-extrabold text-pull-800">Hanya rekrut cepat</span><span className="mt-0.5 block text-[9px] text-pull-400">Employer butuh pekerja segera</span></span><input type="checkbox" className="size-4 accent-pull-800" checked={form.urgentOnly} onChange={(event) => setForm({ ...form, urgentOnly: event.target.checked })} /></label>
      <div className="modal-footer"><button onClick={() => setForm({ category: 'Semua kategori', distance: 'Semua jarak', workType: 'Semua tipe', minMatch: 0, urgentOnly: false })} className="secondary-button">Atur ulang</button><button onClick={() => onEvent('save-filters', form)} className="primary-button">Terapkan filter <Check size={14} /></button></div>
    </ModalShell>
  )
}

function SkillManager({ skills, onClose, onEvent }) {
  const [skill, setSkill] = useState('')
  return (
    <ModalShell title="Kelola skill" eyebrow={`${skills.length} skill aktif`} description="Gunakan label yang spesifik agar smart matching bekerja lebih akurat." onClose={onClose}>
      <div className="flex gap-2"><input className="form-input" value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="Contoh: Kasir digital" onKeyDown={(event) => { if (event.key === 'Enter' && skill.trim()) { event.preventDefault(); onEvent('add-skill', { name: skill.trim() }); setSkill('') } }} /><button disabled={!skill.trim()} onClick={() => { onEvent('add-skill', { name: skill.trim() }); setSkill('') }} className="primary-button shrink-0"><Plus size={14} /> Tambah</button></div>
      <div className="mt-5 flex flex-wrap gap-2">{skills.map((item) => <span key={item.name} className={`skill-chip ${item.verified ? 'skill-verified' : ''}`}>{item.verified ? <BadgeCheck size={13} /> : null}{item.name}<button onClick={() => onEvent('remove-skill', item)} className="ml-1 text-pull-400 hover:text-[#a6533a]" aria-label={`Hapus ${item.name}`}><X size={12} /></button></span>)}</div>
      <div className="info-note mt-5"><BadgeCheck size={16} /><p>Skill terverifikasi berasal dari sertifikat yang disetujui atau riwayat kerja terkonfirmasi.</p></div>
    </ModalShell>
  )
}

function LearningModule({ onClose, onEvent }) {
  const lessons = ['Mengenal alur transaksi POS', 'Input produk dan pembayaran', 'Tutup kas dan cek selisih']
  const [done, setDone] = useState(new Set())
  return (
    <ModalShell title="Dasar Kasir Digital" eyebrow="Modul 25 menit" description="Selesaikan tiga materi singkat untuk menambah skill Kasir digital." onClose={onClose}>
      <div className="rounded-[18px] bg-pull-950 p-4 text-white"><GraduationCap size={24} className="text-[#acd9bd]" /><p className="mt-4 text-sm font-extrabold">Progres belajar</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#91cdaa] transition-all" style={{ width: `${(done.size / lessons.length) * 100}%` }} /></div><p className="mt-2 text-[9px] font-bold text-white/50">{done.size} dari {lessons.length} materi</p></div>
      <div className="mt-4 space-y-2">{lessons.map((lesson, index) => { const complete = done.has(index); return <button key={lesson} onClick={() => setDone((current) => { const next = new Set(current); if (complete) next.delete(index); else next.add(index); return next })} className="flex w-full items-center gap-3 rounded-xl border border-pull-100 p-3 text-left"><span className={`grid size-8 place-items-center rounded-full ${complete ? 'bg-pull-100 text-pull-700' : 'bg-pull-50 text-pull-400'}`}>{complete ? <Check size={14} /> : index + 1}</span><span className="flex-1 text-[11px] font-extrabold text-pull-800">{lesson}</span><ChevronRight size={14} className="text-pull-300" /></button> })}</div>
      <div className="modal-footer"><button onClick={onClose} className="secondary-button">Simpan progres</button><button disabled={done.size !== lessons.length} onClick={() => onEvent('complete-learning')} className="primary-button">Selesaikan modul <Award size={14} /></button></div>
    </ModalShell>
  )
}

function PublicProfile({ profile, portfolio, certificates, skills, onClose, onEvent }) {
  return (
    <ModalShell title="Profil publik" eyebrow="Pratinjau employer" description="Dokumen KYC dan nomor WhatsApp tidak pernah tampil di halaman ini." onClose={onClose} wide>
      <div className="profile-preview">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid size-16 place-items-center rounded-[20px] bg-pull-900 text-lg font-black text-white">DP</div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-pull-950">{profile.name}</h3>{profile.ktpStatus === 'verified' ? <span className="match-score"><BadgeCheck size={12} /> Verified Member</span> : null}</div><p className="mt-1 text-sm font-bold text-pull-600">{profile.title}</p><p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-pull-400"><MapPin size={12} /> {profile.district}, Surakarta</p></div><button onClick={() => onEvent('share-profile')} className="secondary-button"><Share2 size={14} /> Bagikan</button></div>
        <p className="mt-5 text-xs leading-6 text-pull-600">{profile.bio}</p>
        <div className="mt-5 grid grid-cols-3 gap-2"><ProfileMini value={portfolio.length} label="Portofolio" /><ProfileMini value={certificates.length} label="Sertifikat" /><ProfileMini value="4,8" label="Trust" /></div>
        <div className="mt-5"><p className="form-label">Skill</p><div className="mt-2 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill.name} className="skill-chip">{skill.verified ? <BadgeCheck size={12} /> : null}{skill.name}</span>)}</div></div>
      </div>
    </ModalShell>
  )
}

function ProfileMini({ value, label }) {
  return <div className="rounded-xl bg-pull-50 p-3 text-center"><strong className="block text-base font-black text-pull-900">{value}</strong><span className="text-[9px] font-bold text-pull-400">{label}</span></div>
}

function SettingsForm({ profile, onClose, onEvent }) {
  const [form, setForm] = useState({ district: profile.district, radius: profile.radius, minimumPay: profile.minimumPay, pushEnabled: profile.pushEnabled, whatsappUpdates: profile.whatsappUpdates })
  return (
    <ModalShell title="Pengaturan akun" eyebrow="Preferensi pekerja" description="Atur matching dan jenis pembaruan yang ingin diterima." onClose={onClose}>
      <div className="form-grid"><label><span className="form-label">Kecamatan utama</span><select className="form-input" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })}><option>Banjarsari</option><option>Laweyan</option><option>Jebres</option><option>Serengan</option><option>Pasar Kliwon</option></select></label><label><span className="form-label">Radius matching</span><select className="form-input" value={form.radius} onChange={(event) => setForm({ ...form, radius: event.target.value })}><option>5 km</option><option>10 km</option><option>20 km</option><option>Seluruh Solo Raya</option></select></label></div>
      <label className="mt-4 block"><span className="form-label">Upah minimum</span><input className="form-input" value={form.minimumPay} onChange={(event) => setForm({ ...form, minimumPay: event.target.value })} /></label>
      <div className="mt-5 space-y-2"><SettingToggle label="Push lowongan cocok" detail="Notifikasi saat loker baru sesuai preferensi" checked={form.pushEnabled} onChange={(checked) => setForm({ ...form, pushEnabled: checked })} /><SettingToggle label="Ringkasan WhatsApp" detail="Maksimal satu ringkasan penting per hari" checked={form.whatsappUpdates} onChange={(checked) => setForm({ ...form, whatsappUpdates: checked })} /></div>
      <div className="modal-footer"><button onClick={onClose} className="secondary-button">Batal</button><button onClick={() => onEvent('save-settings', form)} className="primary-button">Simpan pengaturan <Save size={14} /></button></div>
    </ModalShell>
  )
}

function SettingToggle({ label, detail, checked, onChange }) {
  return <label className="flex items-center gap-3 rounded-xl border border-pull-100 p-3"><span className="flex-1"><span className="block text-[11px] font-extrabold text-pull-800">{label}</span><span className="mt-0.5 block text-[9px] text-pull-400">{detail}</span></span><input type="checkbox" className="size-4 accent-pull-800" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>
}



function TrustGuide({ onClose }) {
  return <ModalShell title="Cara kerja Trust Score" eyebrow="Reputasi terverifikasi" description="Skor tidak dibuat dari kelengkapan profil atau badge KYC. Keduanya ditampilkan terpisah." onClose={onClose}>
    <div className="rounded-[18px] bg-pull-950 p-5 text-white"><div className="flex items-end gap-2"><strong className="font-display text-5xl font-semibold">4,8</strong><span className="mb-1 text-xs font-bold text-white/45">/ 5 · 12 ulasan</span></div><p className="mt-2 text-[10px] leading-relaxed text-white/60">Rata-rata tertimbang dari pekerjaan yang benar-benar terkonfirmasi.</p></div>
    <div className="mt-5 space-y-3"><GuideRow icon={CheckCircle2} title="Pekerjaan harus selesai" detail="Pekerja dan UMKM wajib mengonfirmasi selesai di Pull." /><GuideRow icon={Star} title="Rating baru terbuka" detail="Tidak ada rating untuk lamaran, interview, atau pekerjaan yang belum terjadi." /><GuideRow icon={ShieldCheck} title="Riwayat tidak dipalsukan" detail="Akun baru memakai badge verifikasi untuk kredibilitas awal, bukan skor buatan." /></div>
  </ModalShell>
}

function GuideRow({ icon: Icon, title, detail }) {
  return <div className="flex gap-3 rounded-xl border border-pull-100 p-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pull-50 text-pull-700"><Icon size={16} /></span><div><p className="text-[11px] font-extrabold text-pull-800">{title}</p><p className="mt-1 text-[9px] leading-relaxed text-pull-400">{detail}</p></div></div>
}



function CvPreview({ profile, skills, certificates, portfolio, experiences, onClose, onEvent }) {
  return <ModalShell title="CV siap dibuat" eyebrow="Pratinjau" description="Pull menyusun CV dari profil, bukti kerja, dan skill aktifmu." onClose={onClose} wide>
    <div className="cv-preview"><div className="border-b border-pull-100 pb-4"><h3 className="font-display text-2xl font-semibold text-pull-950">{profile.name}</h3><p className="mt-1 text-sm font-bold text-pull-600">{profile.title}</p><p className="mt-2 text-[10px] text-pull-400">{profile.district}, Surakarta · WhatsApp terverifikasi · Profil Pull</p></div><div className="mt-4"><p className="form-label">Ringkasan</p><p className="text-[11px] leading-6 text-pull-600">{profile.bio}</p></div><div className="mt-4"><p className="form-label">Skill</p><p className="text-[11px] font-bold text-pull-700">{skills.map((skill) => skill.name).join(' · ')}</p></div><div className="mt-4"><p className="form-label">Pengalaman</p>{experiences.slice(0, 3).map((item) => <p key={item.id} className="mt-2 text-[10px] font-bold text-pull-700">{item.role} · {item.company}<span className="block font-medium text-pull-400">{item.start} — {item.end}</span></p>)}</div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="form-label">Sertifikat</p>{certificates.slice(0, 3).map((item) => <p key={item.id} className="mt-2 text-[10px] font-bold text-pull-700">{item.name}<span className="block font-medium text-pull-400">{item.issuer}</span></p>)}</div><div><p className="form-label">Portofolio</p>{portfolio.slice(0, 3).map((item) => <p key={item.id} className="mt-2 text-[10px] font-bold text-pull-700">{item.title}<span className="block font-medium text-pull-400">{item.client}</span></p>)}</div></div></div>
    <div className="modal-footer"><button onClick={onClose} className="secondary-button">Tutup</button><button onClick={() => onEvent('download-cv')} className="primary-button">Download CV <Download size={14} /></button></div>
  </ModalShell>
}



function LogoutPanel({ profile, onClose }) {
  return <ModalShell title="Keluar dari Pull?" eyebrow="Akun pekerja" description="Sesi akunmu akan diakhiri dan kamu akan kembali ke halaman masuk." onClose={onClose}><div className="rounded-[18px] border border-pull-100 bg-pull-50/70 p-4"><UserRound size={24} className="text-pull-700" /><p className="mt-3 text-sm font-extrabold text-pull-900">{profile.name}</p><p className="mt-1 text-[10px] text-pull-400">Data dashboard lokal tetap tersimpan di perangkat ini.</p></div><div className="modal-footer"><button onClick={onClose} className="secondary-button">Tetap masuk</button><form action={signOutAction}><button type="submit" className="primary-button bg-[#9a4d38] hover:bg-[#813f2f]">Keluar</button></form></div></ModalShell>
}

function AssetDetail({ type, item, onClose }) {
  const isCertificate = type === 'certificate-detail'
  return <ModalShell title={item?.name || item?.title || 'Bukti kerja'} eyebrow={isCertificate ? 'Sertifikat' : 'Portofolio'} description={isCertificate ? item?.issuer : item?.client} onClose={onClose}>
    <div className={`grid min-h-48 place-items-center rounded-[20px] ${isCertificate ? 'bg-[#eee2cb] text-[#795e31]' : 'bg-pull-900 text-white'}`}>{isCertificate ? <Award size={42} /> : <Camera size={42} />}</div>
    <div className="mt-4 rounded-xl border border-pull-100 p-3"><p className="text-[11px] font-extrabold text-pull-800">Status</p><p className="mt-1 text-[9px] leading-relaxed text-pull-400">{isCertificate ? item?.status || 'Disetujui Pull' : item?.description || 'Bukti kerja tampil di profil publik.'}</p></div>
  </ModalShell>
}

function HelpPanel({ onClose, onEvent }) {
  return <ModalShell title="Pusat bantuan" eyebrow="Bantuan Pull" description="Jawaban singkat untuk alur pekerja yang paling sering ditanyakan." onClose={onClose}>
    <div className="space-y-2">{[
      ['Kenapa lamaran dibuka lewat WhatsApp?', 'Negosiasi informal lebih mudah di kanal yang sudah dikenal. Pull tetap mencatat klik, status lamaran, dan konfirmasi selesai kerja.'],
      ['Apakah KTP wajib?', 'Tidak untuk pekerja. KTP opsional dan hanya memberi badge serta boost visibilitas.'],
      ['Kapan rating bisa diberikan?', 'Setelah pekerja dan employer sama-sama menekan Konfirmasi Selesai Kerja.'],
    ].map(([question, answer]) => <details key={question} className="rounded-xl border border-pull-100 p-3"><summary className="cursor-pointer text-[11px] font-extrabold text-pull-800">{question}</summary><p className="mt-2 text-[9px] leading-relaxed text-pull-400">{answer}</p></details>)}</div>
    <button onClick={() => onEvent('contact-support')} className="secondary-button mt-4 w-full justify-center"><HelpCircle size={14} /> Hubungi tim Pull</button>
  </ModalShell>
}

function StatusPanel({ icon: Icon, title, detail, success = false }) {
  return <div className={`mt-4 rounded-[18px] border p-4 ${success ? 'border-pull-100 bg-pull-50' : 'border-[#e8dfcc] bg-[#fffaf0]'}`}><Icon size={24} className={success ? 'text-pull-700' : 'text-[#99723a]'} /><p className="mt-3 text-sm font-extrabold text-pull-900">{title}</p><p className="mt-1 text-[10px] leading-relaxed text-pull-500">{detail}</p></div>
}

export default function FeatureModal({ dialog, onClose, onEvent, profile, applications, skills, certificates, portfolio, experiences, filters }) {
  const application = useMemo(() => dialog?.appId ? applications[dialog.stage]?.find((item) => item.id === dialog.appId) : null, [dialog, applications])
  if (!dialog) return null

  switch (dialog.type) {
    case 'interview':
      return <InterviewForm application={applications.Interview.find((item) => item.id === dialog.appId) || applications.Interview[0]} onClose={onClose} onEvent={onEvent} />
    case 'kyc':
      return <KycForm profile={profile} onClose={onClose} onEvent={onEvent} />
    case 'certificate':
      return <CertificateForm onClose={onClose} onEvent={onEvent} />
    case 'profile':
      return <ProfileForm profile={profile} onClose={onClose} onEvent={onEvent} />
    case 'portfolio':
      return <PortfolioForm onClose={onClose} onEvent={onEvent} />
    case 'experience':
      return <ExperienceForm onClose={onClose} onEvent={onEvent} />
    case 'job-apply':
      return <JobApplyForm job={dialog.job} onClose={onClose} onEvent={onEvent} />
    case 'application':
      return <ApplicationDetail application={application} stage={dialog.stage} onClose={onClose} onEvent={onEvent} />
    case 'messages':
      return <MessagesPanel applications={applications} onClose={onClose} onEvent={onEvent} />
    case 'filters':
      return <FiltersForm filters={filters} onClose={onClose} onEvent={onEvent} />
    case 'skills':
      return <SkillManager skills={skills} onClose={onClose} onEvent={onEvent} />
    case 'learning':
      return <LearningModule onClose={onClose} onEvent={onEvent} />
    case 'public-profile':
      return <PublicProfile profile={profile} portfolio={portfolio} certificates={certificates} skills={skills} onClose={onClose} onEvent={onEvent} />
    case 'settings':
      return <SettingsForm profile={profile} onClose={onClose} onEvent={onEvent} />

    case 'trust-guide':
      return <TrustGuide onClose={onClose} />
    case 'cv':
      return <CvPreview profile={profile} skills={skills} certificates={certificates} portfolio={portfolio} experiences={experiences} onClose={onClose} onEvent={onEvent} />
    case 'certificate-detail':
    case 'portfolio-detail':
      return <AssetDetail type={dialog.type} item={dialog.item} onClose={onClose} />
    case 'help':
      return <HelpPanel onClose={onClose} onEvent={onEvent} />
    case 'logout':
      return <LogoutPanel profile={profile} onClose={onClose} />
    default:
      return null
  }
}
