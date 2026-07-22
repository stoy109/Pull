
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Star,
  Wallet,
  XCircle,
} from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { EmptyState, PageHeader, SectionHeading, StageBadge } from '../components/UI'

const standardStages = ['Dilamar', 'Ditinjau', 'Interview', 'Diterima', 'Selesai']

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const { findApplication, openDialog, handleModalEvent } = useWorkspace()
  const found = findApplication(id)


  if (!found) {
    return (
      <EmptyState
        title="Lamaran tidak ditemukan"
        description="Lamaran mungkin sudah ditarik atau datanya berubah."
        action={<Link to="/applications" className="primary-button">Kembali ke lamaran</Link>}
      />
    )
  }

  const { application, stage } = found
  const bothConfirmed = application.employerConfirmed && application.workerConfirmed
  const progressStages = stage === 'Ditolak' ? ['Dilamar', 'Ditinjau', 'Ditolak'] : standardStages

  const finishWork = () => openDialog('finish-work', { application })

  return (
    <>
      <Link to={`/applications?stage=${stage}`} className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-pull-600">
        <ArrowLeft size={14} /> Kembali ke Lamaran Saya
      </Link>
      <PageHeader
        eyebrow={stage}
        title={application.role}
        description={`${application.company} · ${application.location || 'Solo Raya'}`}
        actions={<StageBadge stage={stage} />}
      />

      <div className="grid grid-cols-12 gap-4 2xl:gap-5">
        <div className="col-span-12 space-y-4 xl:col-span-8">
          <section className="card">
            <div className="flex items-start gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-pull-50 text-sm font-black text-pull-700">
                {application.company.split(' ').slice(0, 2).map((word) => word[0]).join('')}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-pull-950">{application.company}</h2>
                <p className="mt-1 text-[11px] font-bold text-pull-500">{application.role}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold text-pull-500">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {application.location || 'Solo Raya'}</span>
                  <span className="flex items-center gap-1"><Wallet size={12} /> {application.pay || 'Upah sesuai loker'}</span>
                </div>
              </div>
            </div>
            <div className={`mt-5 rounded-xl border p-3 ${stage === 'Ditolak' ? 'border-[#ecd8d1] bg-[#fff7f4]' : 'border-pull-100 bg-pull-50/60'}`}>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-pull-400">Status saat ini</p>
              <p className={`mt-1 text-xs font-extrabold ${application.urgent || stage === 'Ditolak' ? 'text-[#b85c3c]' : 'text-pull-800'}`}>{application.status}</p>
              <p className="mt-1 flex items-center gap-1 text-[9px] text-pull-400"><Clock3 size={11} /> {application.time}</p>
            </div>
          </section>

          <section className="card">
            <SectionHeading eyebrow="Progress" title="Jejak lamaran" />
            <div className="space-y-4">
              {progressStages.map((item, index) => {
                const currentIndex = progressStages.indexOf(stage)
                const done = index <= currentIndex
                const current = item === stage
                const rejected = item === 'Ditolak'
                return (
                  <div key={item} className="flex gap-3">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full ${rejected && current ? 'bg-[#fae5da] text-[#af5b3d]' : done ? 'bg-pull-100 text-pull-700' : 'bg-pull-50 text-pull-300'}`}>
                      {rejected ? <XCircle size={14} /> : done ? <Check size={14} /> : index + 1}
                    </span>
                    <div>
                      <p className={`text-[11px] font-extrabold ${rejected && current ? 'text-[#a6533a]' : current ? 'text-pull-900' : 'text-pull-500'}`}>{item}</p>
                      <p className="mt-0.5 text-[9px] text-pull-400">{current ? application.status : done ? 'Tahap selesai' : 'Belum dimulai'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {stage === 'Diterima' && application.workSchedule ? (
            <section id="jadwal-kerja" className="card scroll-mt-24">
              <SectionHeading eyebrow="Pekerjaan diterima" title="Jadwal & titik temu" description="Periksa detail sebelum mengonfirmasi kehadiran hari pertama." />
              <div className="grid gap-2 sm:grid-cols-2">
                <ScheduleDetail icon={CalendarDays} label="Tanggal mulai" value={application.workSchedule.date} />
                <ScheduleDetail icon={Clock3} label="Jam kerja" value={application.workSchedule.time} />
                <ScheduleDetail icon={MapPin} label="Lokasi" value={application.workSchedule.address} />
                <ScheduleDetail icon={Navigation} label="Titik temu" value={application.workSchedule.meetingPoint} />
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-pull-100 bg-pull-50/70 p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-pull-600"><MessageCircle size={16} /></span>
                <div><p className="text-[9px] font-bold text-pull-400">Kontak lapangan</p><p className="mt-0.5 text-[10px] font-extrabold text-pull-800">{application.workSchedule.contact}</p></div>
              </div>

              {application.scheduleChangeRequested ? (
                <div className="info-note mt-4"><Clock3 size={16} /><p>Permintaan perubahan terkirim melalui WhatsApp. Employer akan mengirim pilihan jadwal baru.</p></div>
              ) : application.scheduleConfirmed ? (
                <>
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-pull-200 bg-pull-50 p-3 text-pull-700">
                    <CheckCircle2 size={17} /><p className="text-[10px] font-extrabold">Jadwal dikonfirmasi. Datang 10 menit sebelum waktu mulai.</p>
                  </div>
                  <button onClick={finishWork} className="primary-button mt-4 w-full">
                    Tandai pekerjaan selesai <Check size={15} />
                  </button>
                </>
              ) : (
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button onClick={() => handleModalEvent('request-schedule-change', { id: application.id, company: application.company })} className="secondary-button justify-center">Minta perubahan</button>
                  <button onClick={() => handleModalEvent('confirm-work-schedule', { id: application.id, company: application.company, schedule: application.workSchedule.date })} className="primary-button">
                    Konfirmasi jadwal <Check size={15} />
                  </button>
                </div>
              )}
            </section>
          ) : null}

          {stage === 'Ditolak' ? (
            <section className="card border-[#ecd8d1] bg-[#fffaf8]">
              <SectionHeading eyebrow="Lamaran ditutup" title="Belum cocok kali ini" description="Status ditolak tidak menurunkan Trust Score atau visibilitas profilmu." />
              <p className="rounded-xl bg-white p-4 text-[10px] font-semibold leading-6 text-pull-600">{application.reason || 'Employer memilih kandidat lain untuk kebutuhan saat ini.'}</p>
              <Link to="/jobs" className="primary-button mt-4">Cari peluang lain</Link>
            </section>
          ) : null}

          {stage === 'Selesai' && application.confirmable ? (
            <section className="card">
              <SectionHeading eyebrow="Wajib" title="Confirmation Loop" description="Rating hanya terbuka setelah pekerja dan UMKM mengonfirmasi pekerjaan selesai." />
              <div className="space-y-2">
                <ConfirmationRow label="Konfirmasi employer" done={application.employerConfirmed} />
                <ConfirmationRow label="Konfirmasi kamu" done={application.workerConfirmed} />
              </div>
              {!application.workerConfirmed ? (
                <button onClick={() => openDialog('work-confirmation', { appId: application.id, stage: 'Selesai' })} className="primary-button mt-4 w-full">
                  Konfirmasi selesai kerja <CheckCircle2 size={15} />
                </button>
              ) : null}
              {application.workerConfirmed && !application.employerConfirmed ? (
                <div className="info-note mt-4"><Clock3 size={16} /><p>Konfirmasimu tersimpan. Rating terbuka otomatis setelah employer mengonfirmasi.</p></div>
              ) : null}
              {bothConfirmed && !application.rated ? (
                <div className="mt-5 rounded-[18px] border border-[#e7dfcd] bg-[#fffaf0] p-4">
                  <p className="text-xs font-extrabold text-[#594727]">Rating sudah terbuka</p>
                  <p className="mt-1 text-[10px] text-[#796747]">Nilai pengalaman yang benar-benar selesai.</p>
                  <button onClick={() => openDialog('work-rating', { appId: application.id, stage: 'Selesai' })} className="warm-button mt-4">Beri rating sekarang <Star size={15} /></button>
                </div>
              ) : null}
              {application.rated ? (
                <div className="mt-4 rounded-xl bg-pull-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-extrabold text-pull-800"><Star size={16} fill="currentColor" /> Rating {application.rating}/5 terkirim</p>
                  <p className="mt-1 text-[10px] text-pull-500">{application.review || 'Ulasan tersimpan.'}</p>
                </div>
              ) : null}
            </section>
          ) : null}

        </div>

        <aside className="col-span-12 xl:col-span-4">
          <div className="card sticky top-24">
            <SectionHeading title="Tindakan" description="Aksi yang tersedia mengikuti tahap lamaran." />
            {stage === 'Interview' ? <button onClick={() => openDialog('interview', { appId: application.id })} className="primary-button w-full">Atur jadwal interview</button> : null}
            {stage === 'Diterima' ? <a href="#jadwal-kerja" className="primary-button w-full">Lihat jadwal kerja</a> : null}
            {stage !== 'Ditolak' ? <button onClick={() => handleModalEvent('contact-employer', { application })} className="whatsapp-button mt-2 w-full">Hubungi via WhatsApp <ExternalLink size={14} /></button> : null}
            {stage === 'Dilamar' ? <button onClick={() => openDialog('application', { appId: application.id, stage })} className="secondary-button mt-2 w-full justify-center text-[#a6533a]">Kelola / tarik lamaran</button> : null}
            {stage === 'Ditolak' ? <Link to="/jobs" className="primary-button w-full">Cari loker baru</Link> : null}
            <div className="info-note mt-4"><ShieldCheck size={16} /><p>{stage === 'Ditolak' ? 'Data status tersimpan sebagai riwayat privat akunmu.' : 'Percakapan dibuka melalui WhatsApp. Pull hanya menyimpan status lamaran dan konfirmasi kerja.'}</p></div>
          </div>
        </aside>
      </div>
    </>
  )
}

function ScheduleDetail({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-pull-100 p-3">
      <Icon size={15} className="text-pull-500" />
      <p className="mt-2 text-[9px] font-bold text-pull-400">{label}</p>
      <p className="mt-1 text-[10px] font-extrabold leading-5 text-pull-800">{value}</p>
    </div>
  )
}

function ConfirmationRow({ label, done }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-pull-100 p-3">
      <span className={`grid size-7 place-items-center rounded-full ${done ? 'bg-pull-100 text-pull-700' : 'bg-pull-50 text-pull-400'}`}>
        {done ? <Check size={13} /> : <Clock3 size={12} />}
      </span>
      <span className="flex-1 text-[11px] font-extrabold text-pull-800">{label}</span>
      <span className="text-[9px] font-bold text-pull-400">{done ? 'Selesai' : 'Menunggu'}</span>
    </div>
  )
}
