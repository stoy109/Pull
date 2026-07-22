import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ShieldCheck, Star, TrendingUp } from 'lucide-react'
import { reviews, trustFactors } from '../data/mockData'
import { useWorkspace } from '../context/WorkspaceContext'
import { PageHeader, SectionHeading } from '../components/UI'

export default function TrustPage() {
  const { applications, openDialog } = useWorkspace()
  const engagement = applications.Selesai.find((item) => item.id === 'app-7')
  const guideOpened = useRef(false)

  useEffect(() => {
    if (guideOpened.current) return
    guideOpened.current = true
    openDialog('trust-guide')
  }, [openDialog])

  return (
    <>
      <PageHeader icon={ShieldCheck} eyebrow="Reputasi terverifikasi" title="Trust Score" description="Skor hanya dihitung dari pekerjaan yang dikonfirmasi kedua pihak. KYC dan kelengkapan profil ditampilkan terpisah." actions={<button onClick={() => openDialog('trust-guide')} className="secondary-button"><ShieldCheck size={14} /> Cara kerja skor</button>} />
      <div className="grid grid-cols-12 gap-4 2xl:gap-5">
        <section className="trust-score-panel col-span-12 min-h-64 xl:col-span-4"><div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/55">Skor saat ini</span><span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[9px] font-extrabold text-[#a9d8bd]"><TrendingUp size={11} /> +0,2</span></div><div className="mt-8 flex items-end gap-2"><strong className="font-display text-7xl font-semibold leading-none tracking-[-0.06em] text-white">4,8</strong><span className="mb-2 text-xs font-bold text-white/42">/ 5</span></div><p className="mt-3 text-sm font-extrabold text-[#afe0c3]">Sangat dipercaya · 12 ulasan</p><svg className="mt-6 h-20 w-full" viewBox="0 0 300 80"><path d="M2 68 C35 64 48 52 72 54 S112 43 138 46 S178 30 206 34 S248 19 298 10" fill="none" stroke="#8ed0aa" strokeWidth="3" strokeLinecap="round" /><circle cx="298" cy="10" r="5" fill="#b8e5ca" /></svg></section>
        <section className="card col-span-12 xl:col-span-8"><SectionHeading eyebrow="Transparansi" title="Penyusun skor" description="Rincian performa dari pekerjaan terverifikasi." /><div className="space-y-4">{trustFactors.map((factor) => <div key={factor.label}><div className="mb-1.5 flex items-center justify-between gap-3 text-[10px]"><span className="font-bold text-pull-700">{factor.label}</span><span className="font-extrabold text-pull-500">{String(factor.value).replace('.', ',')}/{factor.max} · {factor.status}</span></div><div className="h-2 overflow-hidden rounded-full bg-pull-50"><div className="h-full rounded-full bg-pull-600" style={{ width: `${(factor.value / factor.max) * 100}%` }} /></div></div>)}</div></section>
        {!engagement?.rated ? <section className="card col-span-12 border-[#e6dec9] bg-[#fffaf0] xl:col-span-5"><SectionHeading eyebrow="Perlu tindakan" title={engagement?.workerConfirmed ? 'Rating sudah terbuka' : 'Konfirmasi pekerjaan selesai'} description={engagement?.workerConfirmed ? 'Kedua pihak sudah mengonfirmasi. Beri rating untuk menutup alur.' : 'Sambal Mbokde sudah mengonfirmasi dari sisi employer.'} /><Link to="/applications/app-7" className="warm-button">Buka Confirmation Loop <ArrowRight size={14} /></Link></section> : null}
        <section className={`card col-span-12 ${engagement?.rated ? 'xl:col-span-12' : 'xl:col-span-7'}`}><SectionHeading eyebrow="Ulasan" title="Apa kata employer" description="Semua ulasan terikat pada pekerjaan yang selesai." /><div className="grid gap-3 md:grid-cols-3">{reviews.map((review) => <article key={review.id} className="rounded-[16px] border border-pull-100 p-4"><div className="flex items-center gap-1 text-[#d79b38]"><Star size={14} fill="currentColor" /><span className="text-[10px] font-extrabold">{String(review.score).replace('.', ',')}</span></div><p className="mt-3 text-[10px] leading-5 text-pull-600">“{review.text}”</p><p className="mt-4 text-[9px] font-extrabold text-pull-800">{review.company}</p><p className="mt-0.5 text-[8px] text-pull-400">{review.date}</p></article>)}</div></section>
        <section className="card col-span-12"><SectionHeading eyebrow="Aturan" title="Integritas reputasi" /><div className="grid gap-3 md:grid-cols-3"><Rule icon={CheckCircle2} title="Konfirmasi dua arah" text="Rating terkunci sampai pekerja dan UMKM sama-sama menyatakan pekerjaan selesai." /><Rule icon={Star} title="Rata-rata tertimbang" text="Ulasan baru memperbarui skor berdasarkan riwayat nyata, bukan angka buatan." /><Rule icon={ShieldCheck} title="KYC tetap terpisah" text="Badge identitas membantu cold start tanpa memalsukan Trust Score." /></div></section>
      </div>
    </>
  )
}

function Rule({ icon: Icon, title, text }) {
  return <div className="rounded-[16px] border border-pull-100 p-4"><div className="grid size-9 place-items-center rounded-xl bg-pull-50 text-pull-700"><Icon size={16} /></div><p className="mt-3 text-xs font-extrabold text-pull-900">{title}</p><p className="mt-1 text-[10px] leading-5 text-pull-500">{text}</p></div>
}
