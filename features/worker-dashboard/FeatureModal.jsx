import Image from 'next/image'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { FaWhatsapp } from 'react-icons/fa'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Plus,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Star,
  Store,
  UploadCloud,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { signOutAction } from '@/features/auth/actions'
import { VerifiedUmkmIcon } from './components/UI'

function ModalShell({ title, eyebrow, description, onClose, children, wide = false, bare = false, panelClassName = '' }) {
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
    const previouslyFocused = document.activeElement
    const panel = rootRef.current?.querySelector('.modal-panel')
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !panel) return
      const focusable = [...panel.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      if (!focusable.length) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = focusable[0]
      const last = focusable.at(-1)
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === panel || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || active === panel || !panel.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }
    panel?.focus()
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <div ref={rootRef} className="modal-backdrop" role="presentation">
      <button data-modal-scrim className="absolute inset-0 cursor-default bg-pull-950/45 backdrop-blur-sm" onClick={onClose} aria-label="Tutup dialog" />
      <section className={`modal-panel ${wide ? 'modal-panel-wide' : ''} ${bare ? 'modal-panel-job-detail' : ''} ${panelClassName}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1}>
        {bare ? children : <>
          <header className="modal-header">
            <div className="min-w-0">
              {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
              <h2 id="modal-title" className="font-display text-xl font-semibold tracking-[-0.03em] text-pull-950 sm:text-2xl">{title}</h2>
              {description ? <p className="mt-1.5 text-[11px] leading-relaxed text-pull-500">{description}</p> : null}
            </div>
            <button onClick={onClose} className="icon-button size-9" aria-label="Tutup dialog"><X size={17} /></button>
          </header>
          <div className="modal-body">{children}</div>
        </>}
      </section>
    </div>
  )
}

function InterviewForm({ application, onClose, onEvent }) {
  const [schedule, setSchedule] = useState(application?.time || 'Hari ini · 14.00 WIB')
  const [note, setNote] = useState('Terima kasih. Saya siap hadir sesuai jadwal.')
  const scheduleOptions = [...new Set([application?.time, 'Hari ini · 14.00 WIB', 'Hari ini · 16.30 WIB', 'Senin · 09.00 WIB'].filter(Boolean))]

  return (
    <ModalShell title="Konfirmasi Interview" onClose={onClose} wide bare panelClassName="sm:max-w-[720px]">
      <div className="relative min-h-0 overflow-y-auto px-5 pb-6 pt-7 sm:px-9 sm:pb-8 sm:pt-9">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-[#14211c] transition hover:bg-pull-50 sm:right-6 sm:top-6" aria-label="Tutup dialog"><X size={25} /></button>

        <header className="grid gap-4 pr-8 text-center sm:grid-cols-[76px_1fr] sm:items-center sm:text-left">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#fff0df] text-[#df6d00] sm:size-[70px]"><CalendarDays size={34} strokeWidth={2.2} /></span>
          <div><h2 id="modal-title" className="text-2xl font-extrabold text-[#07130e] sm:text-[28px]">Konfirmasi Interview</h2><p className="mt-2 text-[11px] font-medium leading-5 text-[#52625b] sm:text-xs">Periksa pekerjaan dan pilih jadwal yang benar sebelum mengonfirmasi.</p></div>
        </header>

        <section className="mt-8 rounded-xl bg-[#f1f4f2] p-5 sm:px-6">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#728078]">Ringkasan Lamaran</p>
          <div className="mt-3 flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-[#08783f] shadow-sm">{(application?.company || 'Warung Mapan').split(' ').slice(0, 2).map((word) => word[0]).join('')}</span><div className="min-w-0"><p className="text-sm font-extrabold text-[#101d17]">{application?.role || 'Kasir & Pelayan'}</p><p className="mt-1 text-[11px] font-semibold text-[#65746e]">{application?.company || 'Warung Mapan'}</p><div className="mt-2 flex flex-wrap gap-3 text-[9px] font-semibold text-[#53645c]"><span className="flex items-center gap-1"><MapPin size={12} /> {application?.location || 'Banjarsari, Solo'}</span><span className="flex items-center gap-1"><Clock3 size={12} /> Sekitar 30 menit</span></div></div></div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label><span className="form-label">Pilih jadwal</span><select className="form-input" value={schedule} onChange={(event) => setSchedule(event.target.value)}>{scheduleOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label><span className="form-label">Pesan untuk employer</span><span className="relative block"><textarea className="form-textarea min-h-28" value={note} onChange={(event) => setNote(event.target.value)} maxLength={180} /><span className="pointer-events-none absolute bottom-3 right-3 text-[8px] font-bold text-[#89958f]">{note.length}/180</span></span></label>
        </div>

        <div className="info-note mt-5"><MessageCircle size={16} /><p>Konfirmasi tercatat di Pull. Koordinasi lanjutan tetap dilakukan melalui WhatsApp privat.</p></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]"><button type="button" onClick={() => onEvent('reschedule-interview', { id: application?.id, schedule, note })} className="h-11 rounded-lg border border-[#596760] bg-white text-xs font-extrabold text-[#17231e] transition hover:bg-pull-50">Minta Jadwal Lain</button><button type="button" onClick={() => onEvent('confirm-interview', { id: application?.id, schedule, note })} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#07843f] px-4 text-xs font-extrabold text-white transition hover:bg-[#066f36]"><CheckCircle2 size={17} /> Konfirmasi Kehadiran</button></div>
      </div>
    </ModalShell>
  )
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
    <ModalShell title="Lengkapi profil" eyebrow={`Kekuatan profil ${profile.completion}%`} description="Data ini membantu employer menilai profilmu sebelum menghubungimu." onClose={onClose} wide>
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

function JobQuickDetail({ job, applied, profile, onClose, onEvent }) {
  const trustScore = Math.round(job.employerTrust * 20)
  const workerName = profile?.name || 'pekerja Pull'
  const message = `Halo, saya ${workerName} dari Pull. Saya tertarik melamar posisi "${job.role}" yang Anda posting di Pull. Apakah masih tersedia?`
  const [payAmount, ...payUnitParts] = job.pay.split(' / ')
  const payUnit = payUnitParts.length ? `/ ${payUnitParts.join(' / ')}` : ''

  return (
    <ModalShell title={job.company} onClose={onClose} bare>
      <div className="overflow-y-auto px-5 pb-5 pt-5 sm:px-8 sm:pb-7 sm:pt-6">
        <header className="relative flex items-center gap-5 border-b border-[#dfe8e2] pb-4 pr-10">
          <div className={`relative grid size-[74px] shrink-0 place-items-center overflow-hidden rounded-full text-base font-black sm:size-[80px] ${job.tone}`}>
            {job.logoImage ? <Image src={job.logoImage} alt={`Logo ${job.company}`} fill sizes="80px" className="object-cover" /> : job.logo}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 id="modal-title" className="truncate text-base font-extrabold text-pull-950 sm:text-lg">{job.company}</h2>
              {job.verified ? <VerifiedUmkmIcon className="size-[18px] shrink-0" /> : null}
            </div>
            <p className="mt-1 flex items-center gap-2 text-xs font-extrabold text-[#087a41]"><Star size={18} className="fill-[#e6a700] text-[#e6a700]" /> <span className="text-pull-950">{trustScore}</span> — Sangat Baik</p>
            {job.verified ? <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-[#e6f5e9] px-2 py-1 text-[9px] font-extrabold text-[#087a41]"><Check size={11} strokeWidth={3} /> Terverifikasi Pull</span> : null}
          </div>
          <button type="button" onClick={onClose} className="absolute right-0 top-0 grid size-9 place-items-center rounded-xl text-pull-800 transition hover:bg-pull-50" aria-label="Tutup detail pekerjaan"><X size={23} /></button>
        </header>

        <section className="border-b border-[#dfe8e2] py-4">
          <h3 className="text-lg font-extrabold text-pull-950 sm:text-xl">{job.role}</h3>
          <p className="mt-1 text-xl font-extrabold text-[#087a41]">{payAmount} <span className="text-xs font-extrabold">{payUnit}</span></p>
          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
            <JobDetailItem icon={CalendarDays} label="Durasi" value={job.duration} />
            <JobDetailItem icon={MapPin} label="Lokasi" value={job.location} />
            <JobDetailItem icon={Users} label="Dibutuhkan" value={`${job.workersNeeded} orang`} />
            <JobDetailItem icon={BriefcaseBusiness} label="Sudah melamar" value={`${job.applicants} pelamar`} />
          </div>
        </section>

        <section className="border-b border-[#dfe8e2] py-4">
          <h3 className="text-xs font-extrabold text-pull-950">Deskripsi Pekerjaan</h3>
          <p className="mt-2 text-[11px] font-medium leading-5 text-pull-700">{job.description}</p>
        </section>

        <section className="border-b border-[#dfe8e2] py-4">
          <h3 className="text-xs font-extrabold text-pull-950">Tentang UMKM</h3>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4">
            <JobDetailItem icon={Store} label="Kategori" value={job.category} />
            <JobDetailItem icon={Star} label="Trust Score" value={`${trustScore} — Sangat Baik`} accent />
            <JobDetailItem icon={MapPin} label="Lokasi" value={job.location} />
            <JobDetailItem icon={CalendarDays} label="Total Lowongan" value={`${job.employerJobs} lowongan diterbitkan`} />
          </div>
        </section>

        <section className="mt-4 rounded-xl bg-[#f3f6f4] p-3">
          <div className="flex items-center gap-3">
            <span className={`grid size-12 shrink-0 place-items-center rounded-lg ${applied ? 'bg-[#e7f5fb] text-[#32a8de]' : 'bg-[#087a41] text-white'}`}>
              {applied ? <CheckCircle2 size={27} /> : <FaWhatsapp size={29} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-pull-950">{applied ? 'Sudah Dilamar' : 'Lamar via WhatsApp'}</p>
              <p className="mt-1 text-[9px] font-medium leading-4 text-pull-600">{applied ? 'Lamaran Anda telah dikirim ke UMKM ini melalui Pull.' : 'Kami akan membuka WhatsApp dengan pesan siap kirim ke UMKM (nomor dilindungi).'}</p>
            </div>
            <div className="shrink-0 rounded-lg bg-[#e4f1e7] px-3 py-2 text-right">
              <p className="text-[8px] font-semibold text-pull-500">Nomor dilindungi</p>
              <p className="mt-1 text-[10px] font-extrabold text-pull-800">+62 8XX-XXXX-XXXX</p>
            </div>
          </div>

          <div className="mt-3 flex gap-2.5 rounded-lg border border-[#efd18c] bg-[#fffaf0] px-3 py-2.5">
            {applied ? <CircleAlert size={15} className="mt-0.5 shrink-0 text-[#db9500]" /> : <Lightbulb size={15} className="mt-0.5 shrink-0 text-[#db9500]" />}
            <p className="text-[9px] font-medium leading-4 text-pull-700">{applied ? <>Tunggu konfirmasi dari UMKM melalui WhatsApp.<br /><strong>Pastikan Anda merespons dengan sopan dan tepat waktu.</strong></> : <><strong>Pesan yang akan dikirim:</strong><br />{message}</>}</p>
          </div>
        </section>

        {applied ? (
          <button type="button" disabled className="mt-3 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#dfe4e8] text-sm font-extrabold text-[#657180]"><CheckCircle2 size={18} /> Sudah Dilamar <Check size={17} /></button>
        ) : (
          <button type="button" onClick={() => onEvent('contact-job', { job, message })} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(90deg,#087a41,#006c38)] text-sm font-extrabold text-white transition-colors hover:brightness-95"><FaWhatsapp size={20} /> Lamar via WhatsApp</button>
        )}
      </div>
    </ModalShell>
  )
}

function JobDetailItem({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#edf6ef] text-[#087a41]"><Icon size={18} className={accent ? 'fill-[#087a41] text-white' : undefined} /></span>
      <div className="min-w-0"><p className="text-[9px] font-medium text-pull-600">{label}</p><p className={`mt-0.5 text-[10px] font-bold leading-4 ${accent ? 'text-[#087a41]' : 'text-pull-950'}`}>{value}</p></div>
    </div>
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

const ratingTags = ['Pembayaran tepat waktu', 'Lingkungan kerja nyaman', 'Instruksi jelas', 'Ramah dan sopan', 'Pekerjaan sesuai deskripsi', 'Akan bekerja lagi']

function FinishWorkFlow({ application, onClose, onEvent }) {
  if (!application) return null

  return (
    <ModalShell title="Tandai Pekerjaan Selesai" onClose={onClose} wide bare panelClassName="sm:max-w-[720px]">
      <div className="relative min-h-0 overflow-y-auto px-5 pb-6 pt-7 sm:px-9 sm:pb-8 sm:pt-9">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-[#14211c] transition hover:bg-pull-50 sm:right-6 sm:top-6" aria-label="Tutup dialog"><X size={25} /></button>

        <header className="grid gap-4 pr-8 text-center sm:grid-cols-[76px_1fr] sm:items-center sm:text-left">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#fff0df] text-[#df6d00] sm:size-[70px]"><CircleAlert size={36} strokeWidth={2.2} /></span>
          <div><h2 id="modal-title" className="text-2xl font-extrabold text-[#07130e] sm:text-[28px]">Tandai Pekerjaan Selesai</h2><p className="mt-2 text-[11px] font-medium leading-5 text-[#52625b] sm:text-xs">Lanjutkan hanya jika seluruh pekerjaan dan serah terima sudah selesai.</p></div>
        </header>

        <section className="mt-8">
          <h3 className="text-base font-extrabold text-[#101d17]">Ringkasan Pekerjaan</h3>
          <dl className="mt-3 grid grid-cols-[105px_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-xl bg-[#f1f4f2] px-5 py-5 text-[11px] sm:grid-cols-[170px_minmax(0,1fr)] sm:px-6 sm:text-xs"><SummaryValue label="Pekerjaan" value={application.role} /><SummaryValue label="UMKM" value={application.company} /><SummaryValue label="Jadwal" value={application.workSchedule?.date || application.time} /><SummaryValue label="Upah" value={application.pay || 'Sesuai kesepakatan'} /></dl>
        </section>

        <section className="mt-6 rounded-xl border border-[#f0c48f] bg-[#fff8ee] px-5 py-4"><div className="flex items-start gap-3"><Clock3 size={20} className="mt-0.5 shrink-0 text-[#df6d00]" /><div><p className="text-xs font-extrabold text-[#6c410f]">Konfirmasi UMKM tetap diperlukan</p><p className="mt-1.5 text-[10px] font-medium leading-5 text-[#765b3d]">Setelah ini, status berpindah ke menunggu konfirmasi UMKM. Rating dan sertifikat baru terbuka setelah kedua pihak mengonfirmasi.</p></div></div></section>

        <div className="mt-7 grid gap-3 sm:grid-cols-[0.75fr_1.25fr]"><button type="button" onClick={onClose} className="h-11 rounded-lg border border-[#596760] bg-white text-xs font-extrabold text-[#17231e] transition hover:bg-pull-50">Batal</button><button type="button" onClick={() => onEvent('finish-work', { id: application.id, company: application.company })} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#07843f] px-4 text-xs font-extrabold text-white transition hover:bg-[#066f36]"><CheckCircle2 size={17} /> Ya, Pekerjaan Sudah Selesai</button></div>
      </div>
    </ModalShell>
  )
}

function WorkConfirmationFlow({ application, profile, onClose, onEvent }) {
  const [step, setStep] = useState('confirm')
  if (!application) return null
  const ratingReady = application.employerConfirmed === true
  if (step === 'rating') return <WorkRatingForm application={application} onClose={onClose} onEvent={onEvent} />

  if (step === 'success') {
    return (
      <ModalShell title="Konfirmasi Berhasil" onClose={onClose} wide bare panelClassName="sm:max-w-[800px]">
        <div className="relative min-h-0 overflow-y-auto px-5 pb-6 pt-7 sm:px-12 sm:pb-8 sm:pt-9">
          <button type="button" onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-[#14211c] transition hover:bg-pull-50 sm:right-6 sm:top-6" aria-label="Tutup dialog"><X size={25} /></button>

          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <SuccessMark />
            <h2 id="modal-title" className="mt-5 text-2xl font-extrabold text-[#07130e] sm:text-[30px]">{ratingReady ? 'Konfirmasi Berhasil!' : 'Konfirmasi Tersimpan!'}</h2>
            <p className="mt-3 max-w-lg text-[11px] font-medium leading-6 text-[#53635c] sm:text-sm">{ratingReady ? 'Kedua pihak sudah mengonfirmasi. Sertifikat kerja sedang diterbitkan.' : `Konfirmasimu tercatat. Sekarang menunggu konfirmasi dari ${application.company}.`}</p>

            <div className="mt-6 w-full max-w-md rounded-xl bg-[linear-gradient(110deg,#edf8f0,#e3f3e8)] px-6 py-4 text-left">
              {(ratingReady ? ['Konfirmasi kedua pihak tercatat', 'Sertifikat sedang diterbitkan', '+1 PullPoints ditambahkan', 'Trust Score diperbarui'] : ['Konfirmasimu tercatat', 'Menunggu konfirmasi UMKM', 'Rating dan sertifikat belum terbuka']).map((item) => <div key={item} className="flex items-center gap-3 py-1.5 text-[11px] font-semibold text-[#1b2a24] sm:text-xs"><span className={`grid size-5 shrink-0 place-items-center rounded-full text-white ${ratingReady ? 'bg-[#0b8d43]' : 'bg-[#df6d00]'}`}>{ratingReady ? <Check size={12} strokeWidth={3} /> : <Clock3 size={12} strokeWidth={2.5} />}</span>{item}</div>)}
            </div>
          </div>

          <div className="mx-auto mt-7 flex max-w-2xl items-center gap-4 rounded-xl bg-[linear-gradient(110deg,#edf8f0,#e3f3e8)] p-4 sm:px-7 sm:py-5"><span className={`grid size-14 shrink-0 place-items-center rounded-full sm:size-16 ${ratingReady ? 'bg-[#fff3c8] text-[#f4b400]' : 'bg-[#fff0df] text-[#df6d00]'}`}>{ratingReady ? <Star size={31} fill="currentColor" /> : <Clock3 size={31} />}</span><div className="min-w-0"><p className="text-sm font-extrabold text-[#101d17] sm:text-base">{ratingReady ? `Beri Rating untuk ${application.company}` : 'Menunggu konfirmasi UMKM'}</p><p className="mt-1.5 text-[10px] font-medium leading-5 text-[#4e6058] sm:text-xs">{ratingReady ? 'Rating Anda membantu pekerja lain menilai UMKM ini.' : 'Rating otomatis terbuka setelah UMKM mengonfirmasi pekerjaan selesai.'}</p></div></div>

          <div className="mx-auto mt-7 max-w-2xl">
            {ratingReady ? <button type="button" onClick={() => setStep('rating')} className="flex h-12 w-full items-center justify-center rounded-lg bg-[#07843f] px-5 text-sm font-extrabold text-white transition hover:bg-[#066f36]">Beri Rating Sekarang</button> : <button type="button" onClick={onClose} className="flex h-12 w-full items-center justify-center rounded-lg bg-[#07843f] px-5 text-sm font-extrabold text-white transition hover:bg-[#066f36]">Selesai</button>}
            {ratingReady ? <button type="button" onClick={onClose} className="mt-3 h-9 w-full text-xs font-extrabold text-[#77837e] transition hover:text-pull-800">Nanti Saja</button> : null}
          </div>
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell title="Konfirmasi Selesai Kerja" onClose={onClose} wide bare panelClassName="sm:max-w-[800px]">
      <div className="relative min-h-0 overflow-y-auto px-5 pb-6 pt-7 sm:px-10 sm:pb-8 sm:pt-10">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-[#14211c] transition hover:bg-pull-50 sm:right-6 sm:top-6" aria-label="Tutup dialog"><X size={25} /></button>

        <header className="grid gap-4 pr-8 text-center sm:grid-cols-[76px_1fr] sm:items-center sm:text-left">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#fff0df] text-[#df6d00] sm:size-[70px]"><CircleAlert size={36} strokeWidth={2.2} /></span>
          <div>
            <h2 id="modal-title" className="text-2xl font-extrabold text-[#07130e] sm:text-[28px]">Konfirmasi Selesai Kerja</h2>
            <p className="mt-2 text-[11px] font-medium leading-5 text-[#52625b] sm:text-xs">Pastikan pekerjaan sudah benar-benar selesai sebelum konfirmasi.</p>
          </div>
        </header>

        <section className="mt-8">
          <h3 className="text-base font-extrabold text-[#101d17]">Ringkasan Pekerjaan</h3>
          <dl className="mt-3 grid grid-cols-[105px_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-xl bg-[#f1f4f2] px-5 py-5 text-[11px] sm:grid-cols-[170px_minmax(0,1fr)] sm:px-6 sm:text-xs">
            <SummaryValue label="Pekerjaan" value={application.role} />
            <SummaryValue label="UMKM" value={application.company} />
            <SummaryValue label="Tanggal" value={application.workPeriod || application.time} />
            <SummaryValue label="Durasi" value={application.duration || '1 hari'} />
            <SummaryValue label="Upah Total" value={application.totalPay || application.pay || 'Sesuai kesepakatan'} />
          </dl>
        </section>

        <section className="mt-6">
          <h3 className="text-base font-extrabold text-[#101d17]">Status Konfirmasi</h3>
          <div className="relative mt-3 grid gap-3 sm:grid-cols-2 sm:gap-12">
            <span className="absolute left-1/2 top-1/2 hidden h-px w-12 -translate-x-1/2 bg-[#cbd8d1] sm:block"><span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#08783f]" /></span>
            <ConfirmationParty icon={Store} label={application.company} status={application.employerConfirmed ? 'Sudah konfirmasi' : 'Belum konfirmasi'} done={application.employerConfirmed} />
            <ConfirmationParty icon={UserRound} label={`Anda (${profile?.name || 'Pekerja Pull'})`} status={application.workerConfirmed ? 'Sudah konfirmasi' : 'Belum konfirmasi'} done={application.workerConfirmed} />
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[9px] font-medium text-[#66766f]"><CircleAlert size={13} /> Kedua pihak harus konfirmasi agar sertifikat terbit</p>
        </section>

        <section className="mt-7 rounded-xl bg-[linear-gradient(110deg,#edf8f0,#e3f3e8)] px-5 py-4">
          <p className="text-[11px] font-extrabold text-[#08783f]">Yang akan Anda dapatkan setelah konfirmasi:</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 sm:divide-x sm:divide-[#d4e7da]"><Benefit icon={Award} label="Sertifikat Kerja Digital auto-terbit" /><Benefit icon={ShieldCheck} label="Trust Score Anda diperbarui" /><Benefit icon={Star} label="+1 PullPoints" /></div>
        </section>

        <div className="mt-7 grid gap-3 sm:grid-cols-[0.75fr_1.25fr]"><button type="button" onClick={onClose} className="h-11 rounded-lg border border-[#596760] bg-white text-xs font-extrabold text-[#17231e] transition hover:bg-pull-50">Batal</button><button type="button" onClick={() => { onEvent('confirm-work', { id: application.id }); setStep('success') }} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#07843f] px-4 text-xs font-extrabold text-white transition hover:bg-[#066f36]"><CheckCircle2 size={17} /> Ya, Pekerjaan Sudah Selesai</button></div>
      </div>
    </ModalShell>
  )
}

function WorkRatingForm({ application, onEvent }) {
  const [rating, setRating] = useState(application.ratingDraft || application.rating || 0)
  const [selectedTags, setSelectedTags] = useState(application.ratingTagsDraft || application.ratingTags || [])
  const [review, setReview] = useState(application.reviewDraft || application.review || '')
  const ratingLabel = ['', 'Sangat Kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik'][rating]

  const toggleTag = (tag) => setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])
  const saveAndClose = () => onEvent('save-rating-draft', { id: application.id, rating, review, tags: selectedTags })

  return (
    <ModalShell title="Beri Rating" onClose={saveAndClose} wide bare panelClassName="sm:max-w-[620px]">
      <div className="relative min-h-0 overflow-y-auto px-5 pb-6 pt-7 sm:px-7 sm:pb-8 sm:pt-8">
        <button type="button" onClick={saveAndClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-[#14211c] transition hover:bg-pull-50 sm:right-6 sm:top-6" aria-label="Tutup dialog"><X size={25} /></button>

        <header className="pr-10">
          <h2 id="modal-title" className="text-2xl font-extrabold text-[#07130e]">Beri Rating</h2>
          <p className="mt-2 text-[11px] font-medium text-[#52625b] sm:text-xs">Bagaimana pengalaman kerja Anda bersama UMKM ini?</p>
        </header>

        <section className="mt-6 flex items-center gap-4 rounded-xl border border-[#dfe6e2] bg-white p-4">
          <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-pull-100 text-xs font-black text-pull-700">{application.logoImage ? <Image src={application.logoImage} alt={`Logo ${application.company}`} fill sizes="64px" className="object-cover" /> : application.company.split(' ').slice(0, 2).map((word) => word[0]).join('')}</div>
          <div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-extrabold text-[#101d17]">{application.company}</p><VerifiedUmkmIcon className="size-4 shrink-0" /></div><p className="mt-1.5 text-[10px] font-semibold text-[#65746e]">{application.role}</p><p className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-semibold text-[#53645c]"><CalendarDays size={13} /><span>{application.workPeriod || application.time}</span><span aria-hidden="true">•</span><span>{application.duration || '1 hari'}</span></p></div>
        </section>

        <section className="mt-6">
          <h3 className="text-xs font-extrabold text-[#17231e]">Rating Keseluruhan</h3>
          <div className="mt-4 flex items-center justify-center gap-1.5 sm:gap-3" aria-label="Pilih rating">
            {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className={`grid size-11 place-items-center transition hover:scale-110 sm:size-12 ${value <= rating ? 'text-[#ffb400]' : 'text-[#bcc3c8]'}`} aria-label={`${value} bintang`} aria-pressed={value <= rating}><Star size={40} strokeWidth={1.7} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}
          </div>
          <p className={`mt-2 text-center text-[10px] font-extrabold ${rating ? 'text-[#08783f]' : 'text-[#66766f]'}`}>{rating ? ratingLabel : 'Pilih bintang untuk memberikan rating'}</p>
        </section>

        <section className="mt-6">
          <h3 className="text-xs font-extrabold text-[#17231e]">Apa yang paling berkesan? <span className="font-medium text-[#6d7a75]">(opsional)</span></h3>
          <div className="mt-3 grid grid-cols-2 items-stretch gap-2 sm:grid-cols-[1.15fr_1.15fr_0.9fr]">{ratingTags.map((tag) => { const selected = selectedTags.includes(tag); return <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`rating-tag-button flex min-h-10 min-w-0 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-center font-bold leading-4 transition ${selected ? 'border-[#3f9b65] bg-[#eff9f2] text-[#08783f]' : 'border-[#d9e1dd] bg-white text-[#53635c] hover:border-pull-300'}`} aria-pressed={selected}><span className="break-words">{tag}</span>{selected ? <Check size={10} className="shrink-0" strokeWidth={3} /> : null}</button> })}</div>
        </section>

        <label className="mt-6 block"><span className="text-xs font-extrabold text-[#17231e]">Ulasan <span className="font-medium text-[#6d7a75]">(opsional)</span></span><span className="relative mt-3 block"><textarea maxLength={200} className="min-h-32 w-full resize-none rounded-xl border border-[#d9e1dd] bg-white px-4 pb-8 pt-3 text-[10px] font-medium leading-5 text-[#25342d] outline-none transition placeholder:text-[#8b9892] focus:border-pull-300 focus:ring-4 focus:ring-pull-100/50" value={review} onChange={(event) => setReview(event.target.value)} placeholder="Ceritakan pengalaman kerja Anda..." /><span className="pointer-events-none absolute bottom-3 right-3 text-[8px] font-bold text-[#89958f]">{review.length} / 200</span></span></label>

        <p className="mt-4 flex items-center gap-2 text-[9px] font-medium text-[#687770]"><CircleAlert size={14} className="shrink-0" /> Rating Anda ditampilkan publik di profil UMKM.</p>

        <div className="mt-7 grid grid-cols-[0.7fr_1.3fr] items-center gap-3"><button type="button" onClick={saveAndClose} className="h-11 rounded-lg text-xs font-extrabold text-[#596860] transition hover:bg-pull-50">Lewati</button><button type="button" disabled={!rating} onClick={() => onEvent('submit-rating', { id: application.id, company: application.company, rating, review, tags: selectedTags })} className="h-11 rounded-lg bg-[#07843f] px-4 text-xs font-extrabold text-white transition hover:bg-[#066f36] disabled:cursor-not-allowed disabled:bg-[#e1e4e6] disabled:text-[#9ba3a8]">Kirim Rating</button></div>
      </div>
    </ModalShell>
  )
}

function SuccessMark() {
  return <Image src="/Profile(Selesai).png" alt="Profil berhasil disiapkan" width={260} height={190} className="h-36 w-auto max-w-full object-contain sm:h-44" priority />
}

function SummaryValue({ label, value }) {
  return <><dt className="font-medium text-[#52625b]">{label}</dt><dd className="min-w-0 break-words font-bold text-[#17231e]">: {value}</dd></>
}

function ConfirmationParty({ icon: Icon, label, status, done }) {
  return <div className="relative z-10 flex min-w-0 items-center gap-3 rounded-xl border border-[#d8e1dc] bg-white p-3.5"><span className={`grid size-11 shrink-0 place-items-center rounded-full ${done ? 'bg-[#e8f5ec] text-[#08783f]' : 'bg-[#fff0df] text-[#d96800]'}`}><Icon size={21} /></span><div className="min-w-0"><p className="truncate text-[11px] font-extrabold text-[#1a2822]">{label}</p><span className={`mt-1.5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-extrabold ${done ? 'bg-[#dbf6df] text-[#0a913f]' : 'bg-[#fff0df] text-[#dc6d00]'}`}>{status}{done ? <Check size={11} strokeWidth={3} /> : null}</span></div></div>
}

function Benefit({ icon: Icon, label }) {
  return <div className="flex min-w-0 items-center gap-3 sm:px-3 sm:first:pl-0 sm:last:pr-0"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#08783f]"><Icon size={19} /></span><span className="text-[9px] font-semibold leading-4 text-[#365247]">{label}</span></div>
}

function ApplicationDetail({ application, stage, onClose, onEvent }) {
  if (!application) return null
  if (stage === 'Interview') return <InterviewForm application={application} onClose={onClose} onEvent={onEvent} />

  return (
    <ModalShell title="Kelola Lamaran" onClose={onClose} wide bare panelClassName="sm:max-w-[680px]">
      <div className="relative min-h-0 overflow-y-auto px-5 pb-6 pt-7 sm:px-9 sm:pb-8 sm:pt-9">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-[#14211c] transition hover:bg-pull-50 sm:right-6 sm:top-6" aria-label="Tutup dialog"><X size={25} /></button>

        <header className="grid gap-4 pr-8 text-center sm:grid-cols-[76px_1fr] sm:items-center sm:text-left">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e8f5ec] text-[#08783f] sm:size-[70px]"><BriefcaseBusiness size={34} strokeWidth={2.2} /></span>
          <div><h2 id="modal-title" className="text-2xl font-extrabold text-[#07130e] sm:text-[28px]">Kelola Lamaran</h2><p className="mt-2 text-[11px] font-medium leading-5 text-[#52625b] sm:text-xs">Periksa status atau tarik lamaran jika Anda tidak ingin melanjutkan proses.</p></div>
        </header>

        <section className="mt-8 rounded-xl bg-[#f1f4f2] p-5 sm:px-6"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-[#08783f] shadow-sm">{application.company.split(' ').slice(0, 2).map((word) => word[0]).join('')}</span><div className="min-w-0"><p className="text-sm font-extrabold text-[#101d17]">{application.role}</p><p className="mt-1 text-[11px] font-semibold text-[#65746e]">{application.company}</p><span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#fff0df] px-2 py-1 text-[9px] font-extrabold text-[#d96800]"><Clock3 size={12} /> {application.status}</span></div></div></section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2"><div className="flex items-center gap-3 rounded-xl border border-[#d8e1dc] p-3.5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8f5ec] text-[#08783f]"><Check size={16} /></span><div><p className="text-[10px] font-extrabold text-[#1a2822]">Lamaran tercatat</p><p className="mt-1 text-[9px] font-medium text-[#66766f]">{application.time}</p></div></div><div className="flex items-center gap-3 rounded-xl border border-[#d8e1dc] p-3.5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#fff0df] text-[#d96800]"><Clock3 size={16} /></span><div><p className="text-[10px] font-extrabold text-[#1a2822]">Menunggu UMKM</p><p className="mt-1 text-[9px] font-medium text-[#66766f]">Perubahan tercatat di Aktivitas</p></div></div></section>

        {stage === 'Dilamar' ? <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#edc9bd] bg-[#fff7f4] px-5 py-4"><CircleAlert size={19} className="mt-0.5 shrink-0 text-[#b85c3c]" /><p className="text-[10px] font-medium leading-5 text-[#744d40]">Lamaran yang ditarik akan dihapus dari proses aktif. Anda tetap dapat melamar loker lain.</p></div> : null}

        <div className={`mt-7 grid gap-3 ${stage === 'Dilamar' ? 'sm:grid-cols-2' : ''}`}><button type="button" onClick={() => onEvent('contact-employer', { application })} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#4da171] bg-white px-4 text-xs font-extrabold text-[#08783f] transition hover:bg-[#f2faf5]">Hubungi via WhatsApp <ExternalLink size={14} /></button>{stage === 'Dilamar' ? <button type="button" onClick={() => onEvent('withdraw-application', { id: application.id, stage })} className="h-11 rounded-lg bg-[#a6533a] px-4 text-xs font-extrabold text-white transition hover:bg-[#8e4632]">Tarik Lamaran</button> : null}</div>
      </div>
    </ModalShell>
  )
}

function MessagesPanel({ applications, onClose, onEvent }) {
  const contacts = applications.Diterima.concat(applications.Interview, applications.Ditinjau).slice(0, 4)
  return (
    <ModalShell title="Kontak employer" eyebrow="WhatsApp privat" description="Semua percakapan dibuka melalui WhatsApp. Pull hanya mencatat status dan akses kontak untuk keamanan." onClose={onClose}>
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
        <label><span className="form-label">Minimal skor</span><select className="form-input" value={form.minMatch} onChange={(event) => setForm({ ...form, minMatch: Number(event.target.value) })}><option value={0}>Semua</option><option value={70}>70%</option><option value={80}>80%</option><option value={90}>90%</option></select></label>
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





function TrustGuide({ onClose }) {
  const steps = [
    { number: 1, image: '/illustrations/trust-score/step-1-complete-work.png', title: 'Selesaikan Pekerjaan', detail: 'Kerjakan tugas dari UMKM sampai tuntas.' },
    { number: 2, image: '/illustrations/trust-score/step-2-mutual-confirmation.png', title: 'Konfirmasi Kedua Pihak', detail: "Kamu dan UMKM sama-sama menekan tombol 'Selesai' di Pull." },
    { number: 3, image: '/illustrations/trust-score/step-3-score-updated.png', title: 'Skor Diperbarui', detail: 'Sistem otomatis menghitung ulang Trust Score dari rata-rata ulasan terbaru.' },
  ]
  const tips = [
    { icon: CalendarDays, label: 'Selesaikan pekerjaan tepat waktu' },
    { icon: CheckCircle2, label: 'Selalu kembali ke Pull untuk konfirmasi selesai' },
    { icon: MessageCircle, label: 'Jaga komunikasi baik dengan pemberi kerja' },
    { icon: ShieldCheck, label: 'Lengkapi verifikasi Level 2 untuk kredibilitas tambahan' },
  ]

  return <ModalShell title="Apa itu Trust Score?" onClose={onClose} wide bare panelClassName="sm:max-w-[808px]">
    <div className="relative min-h-0 overflow-y-auto px-5 pb-5 pt-6 sm:px-9 sm:pb-8 sm:pt-8">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-[#d9e2dd] bg-white text-[#14211c] transition hover:bg-[#f4f8f5] sm:right-6 sm:top-6" aria-label="Tutup dialog"><X size={22} /></button>

      <header className="grid grid-cols-[58px_minmax(0,1fr)] items-center gap-x-3 pr-11 sm:grid-cols-[76px_minmax(0,1fr)] sm:items-start sm:gap-x-5 sm:pr-12">
        <span className="relative grid size-14 place-items-center sm:size-16">
          <ShieldCheck size={52} fill="#07843f" className="text-[#07843f] sm:size-[60px]" strokeWidth={1.8} />
          <Check size={25} className="absolute text-white sm:size-7" strokeWidth={3.5} />
          <Sparkles size={12} className="absolute -left-1 top-1 text-[#a6d9ad]" fill="currentColor" />
          <Sparkles size={10} className="absolute right-0 top-0 text-[#a6d9ad]" fill="currentColor" />
        </span>
        <h2 id="modal-title" className="text-[22px] font-extrabold leading-tight text-[#07130e] sm:pt-1 sm:text-[30px]">Apa itu Trust Score?</h2>
        <p className="col-span-2 mt-4 text-center text-[11px] font-medium leading-[1.65] text-[#26362f] sm:col-span-1 sm:col-start-2 sm:mt-3 sm:max-w-[590px] sm:text-left sm:text-[12px]">Trust Score adalah skor kepercayaan yang terbentuk dari rating dan ulasan nyata setiap kali kamu menyelesaikan pekerjaan lewat Pull.<br /><strong className="font-extrabold text-[#101d17]">Semakin banyak transaksi terkonfirmasi dengan rating baik, semakin tinggi skormu.</strong></p>
      </header>

      <section className="mt-5 border-t border-[#dfe7e2] pt-5 sm:mt-6 sm:pt-5">
        <h3 className="text-[15px] font-extrabold text-[#101d17] sm:text-lg">3 Langkah Cara Kerja</h3>
        <div className="mt-3 grid items-stretch gap-1.5 md:mt-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-2">
          {steps.map((step, index) => <div key={step.number} className="contents"><TrustGuideStep {...step} />{index < steps.length - 1 ? <span className="grid h-5 place-items-center text-[#07843f] md:h-auto"><ArrowRight size={21} className="rotate-90 md:rotate-0" /></span> : null}</div>)}
        </div>
      </section>

      <section className="mt-5 sm:mt-6">
        <h3 className="text-[15px] font-extrabold text-[#101d17] sm:text-lg">Tips Meningkatkan Trust Score</h3>
        <div className="mt-3 hidden min-h-[140px] rounded-xl border border-[#d9e4dd] bg-[#f7fbf8] px-4 py-4 md:grid md:grid-cols-4 md:divide-x md:divide-[#d9e4dd]">{tips.map((tip) => <TrustTip key={tip.label} {...tip} />)}</div>
        <div className="mt-3 space-y-2 rounded-lg border border-[#d9e4dd] bg-[#f7fbf8] p-3 md:hidden">{tips.map((tip) => <div key={tip.label} className="flex items-start gap-2 text-[10px] font-semibold leading-4 text-[#283a32]"><span className="mt-px grid size-[18px] shrink-0 place-items-center rounded-full bg-[#07843f] text-white"><Check size={11} strokeWidth={3} /></span>{tip.label}</div>)}</div>
      </section>

      <section className="mt-5 flex items-center gap-4 rounded-xl border border-[#dce3df] bg-[#f7f8f8] p-4 sm:px-5"><span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-dashed border-[#9aa8a1] text-[#17231e]"><LockKeyhole size={22} /></span><div><h3 className="text-xs font-extrabold text-[#17231e]">Catatan Transparansi</h3><p className="mt-1 text-[10px] font-medium leading-5 text-[#43564d]">Trust Score dihitung otomatis oleh sistem dan tidak bisa dibeli atau dimanipulasi secara sepihak.</p></div></section>

      <button type="button" onClick={onClose} className="mt-5 h-12 w-full rounded-lg bg-[#07843f] text-sm font-extrabold text-white transition hover:bg-[#066f36] sm:mt-6">Mengerti</button>
    </div>
  </ModalShell>
}

function TrustGuideStep({ number, image, title, detail }) {
  return <article className="relative grid min-h-[88px] min-w-0 grid-cols-[92px_minmax(0,1fr)] items-center gap-2 rounded-lg border border-[#d9e4dd] bg-[#fbfdfb] px-3 py-2.5 md:block md:min-h-[240px] md:rounded-xl md:p-4 md:text-center"><span className="absolute left-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-[#076c35] text-xs font-extrabold text-white">{number}</span><div className="relative h-16 overflow-hidden md:h-28"><Image src={image} alt="" fill sizes="(min-width: 768px) 210px, 92px" className="object-contain" /></div><div><h4 className="text-xs font-extrabold text-[#101d17]">{title}</h4><p className="mt-1 text-[10px] font-medium leading-[1.55] text-[#263a31] md:mt-1.5">{detail}</p></div></article>
}

function TrustTip({ icon: Icon, label }) {
  return <div className="flex min-w-0 flex-col items-center px-3 text-center"><span className="grid size-12 place-items-center rounded-full bg-[#e4f4e8] text-[#07843f]"><Icon size={22} /></span><p className="mt-3 text-[10px] font-semibold leading-4 text-[#263a31]">{label}</p></div>
}



function CvPreview({ profile, skills, certificates, portfolio, experiences, onClose, onEvent }) {
  return <ModalShell title="CV siap dibuat" eyebrow="Pratinjau" description="Pull menyusun CV dari profil, bukti kerja, dan skill aktifmu." onClose={onClose} wide>
    <div className="cv-preview"><div className="border-b border-pull-100 pb-4"><h3 className="font-display text-2xl font-semibold text-pull-950">{profile.name}</h3><p className="mt-1 text-sm font-bold text-pull-600">{profile.title}</p><p className="mt-2 text-[10px] text-pull-400">{profile.district}, Surakarta · WhatsApp terverifikasi · Profil Pull</p></div><div className="mt-4"><p className="form-label">Ringkasan</p><p className="text-[11px] leading-6 text-pull-600">{profile.bio}</p></div><div className="mt-4"><p className="form-label">Skill</p><p className="text-[11px] font-bold text-pull-700">{skills.map((skill) => skill.name).join(' · ')}</p></div><div className="mt-4"><p className="form-label">Pengalaman</p>{experiences.slice(0, 3).map((item) => <p key={item.id} className="mt-2 text-[10px] font-bold text-pull-700">{item.role} · {item.company}<span className="block font-medium text-pull-400">{item.start} — {item.end}</span></p>)}</div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="form-label">Sertifikat</p>{certificates.slice(0, 3).map((item) => <p key={item.id} className="mt-2 text-[10px] font-bold text-pull-700">{item.name}<span className="block font-medium text-pull-400">{item.issuer}</span></p>)}</div><div><p className="form-label">Portofolio</p>{portfolio.slice(0, 3).map((item) => <p key={item.id} className="mt-2 text-[10px] font-bold text-pull-700">{item.title}<span className="block font-medium text-pull-400">{item.client}</span></p>)}</div></div></div>
    <div className="modal-footer"><button onClick={onClose} className="secondary-button">Tutup</button><button onClick={() => onEvent('download-cv')} className="primary-button">Download CV <Download size={14} /></button></div>
  </ModalShell>
}



function PhoneVerificationForm({ profile, onClose, onEvent }) {
  const [code, setCode] = useState('')
  const valid = code === '123456'
  return <ModalShell title="Verifikasi nomor WhatsApp" eyebrow="OTP diperlukan" description={`Masukkan kode 6 digit yang dikirim ke ${profile.phone}.`} onClose={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); if (valid) onEvent('verify-phone') }}>
      <div className="grid size-14 place-items-center rounded-full bg-[#e8f5eb] text-[#08783f]"><Smartphone size={27} /></div>
      <label className="mt-5 block"><span className="form-label">Kode OTP</span><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="form-input text-center text-lg tracking-[0.35em]" placeholder="000000" /></label>
      <p className="mt-3 rounded-xl bg-[#fff7df] px-3 py-2 text-[9px] font-semibold text-[#80631f]">Demo: gunakan kode <strong>123456</strong>.</p>
      {code.length === 6 && !valid ? <p className="mt-2 text-[10px] font-semibold text-[#bd4d3f]">Kode OTP tidak valid.</p> : null}
      <div className="modal-footer"><button type="button" onClick={onClose} className="secondary-button">Nanti</button><button type="submit" disabled={!valid} className="primary-button">Verifikasi Nomor <CheckCircle2 size={14} /></button></div>
    </form>
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
      ['Kenapa chat dibuka lewat WhatsApp?', 'Koordinasi informal lebih mudah di kanal yang sudah dikenal. Pull tetap mencatat status lamaran dan konfirmasi selesai kerja.'],
      ['Apakah KTP wajib?', 'Tidak untuk pekerja. KTP opsional dan hanya memberi badge serta boost visibilitas.'],
      ['Kapan rating bisa diberikan?', 'Setelah pekerja dan employer sama-sama menekan Konfirmasi Selesai Kerja.'],
    ].map(([question, answer]) => <details key={question} className="rounded-xl border border-pull-100 p-3"><summary className="cursor-pointer text-[11px] font-extrabold text-pull-800">{question}</summary><p className="mt-2 text-[9px] leading-relaxed text-pull-400">{answer}</p></details>)}</div>
    <button onClick={() => onEvent('contact-support')} className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-[14px] bg-[#07843f] px-4 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(7,132,63,.18)] transition hover:bg-[#066f36]"><FaWhatsapp size={27} /> Hubungi CS via WhatsApp</button>
    <p className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-[#7b8490]"><Clock3 size={18} /> Respon biasanya dalam 1×24 jam</p>
  </ModalShell>
}

function StatusPanel({ icon: Icon, title, detail, success = false }) {
  return <div className={`mt-4 rounded-[18px] border p-4 ${success ? 'border-pull-100 bg-pull-50' : 'border-[#e8dfcc] bg-[#fffaf0]'}`}><Icon size={24} className={success ? 'text-pull-700' : 'text-[#99723a]'} /><p className="mt-3 text-sm font-extrabold text-pull-900">{title}</p><p className="mt-1 text-[10px] leading-relaxed text-pull-500">{detail}</p></div>
}

export default function FeatureModal({ dialog, onClose, onEvent, profile, applications, appliedJobIds, skills, certificates, portfolio, experiences, filters }) {
  const application = useMemo(() => dialog?.appId ? applications[dialog.stage]?.find((item) => item.id === dialog.appId) : null, [dialog, applications])
  if (!dialog) return null

  switch (dialog.type) {
    case 'interview':
      return <InterviewForm application={applications.Interview.find((item) => item.id === dialog.appId) || applications.Interview[0]} onClose={onClose} onEvent={onEvent} />
    case 'kyc':
      return <KycForm profile={profile} onClose={onClose} onEvent={onEvent} />
    case 'phone-verification':
      return <PhoneVerificationForm profile={profile} onClose={onClose} onEvent={onEvent} />
    case 'certificate':
      return <CertificateForm onClose={onClose} onEvent={onEvent} />
    case 'profile':
      return <ProfileForm profile={profile} onClose={onClose} onEvent={onEvent} />
    case 'portfolio':
      return <PortfolioForm onClose={onClose} onEvent={onEvent} />
    case 'experience':
      return <ExperienceForm onClose={onClose} onEvent={onEvent} />
    case 'job-detail':
      return <JobQuickDetail job={dialog.job} applied={appliedJobIds.includes(dialog.job.id)} profile={profile} onClose={onClose} onEvent={onEvent} />
    case 'job-apply':
      return <JobApplyForm job={dialog.job} onClose={onClose} onEvent={onEvent} />
    case 'finish-work':
      return <FinishWorkFlow application={dialog.application || application} onClose={onClose} onEvent={onEvent} />
    case 'work-confirmation':
      return <WorkConfirmationFlow application={dialog.application || application} profile={profile} onClose={onClose} onEvent={onEvent} />
    case 'work-rating':
      return <WorkRatingForm application={dialog.application || application} onClose={onClose} onEvent={onEvent} />
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
