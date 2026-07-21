import { Award, BadgeCheck, Clock3, Plus, ShieldCheck } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { MetricCard, PageHeader, SectionHeading } from '../components/UI'

export default function CertificatesPage() {
  const { certificates, openDialog } = useWorkspace()
  const approved = certificates.filter((item) => item.status === 'Disetujui Pull').length
  const pending = certificates.length - approved
  return (
    <>
      <PageHeader eyebrow="Bukti skill" title="Sertifikat" description="Kelola bukti pelatihan agar employer bisa menilai skill secara konkret." actions={<button onClick={() => openDialog('certificate')} className="primary-button"><Plus size={14} /> Upload sertifikat</button>} />
      <div className="grid gap-3 sm:grid-cols-3"><MetricCard icon={Award} value={String(certificates.length)} label="Total sertifikat" detail="Tersimpan di profil" /><MetricCard icon={BadgeCheck} value={String(approved)} label="Disetujui" detail="Badge bukti aktif" /><MetricCard icon={Clock3} value={String(pending)} label="Dalam pemeriksaan" detail="Estimasi 1×24 jam" tone="warm" /></div>
      <section className="card mt-4"><SectionHeading eyebrow="Koleksi" title="Bukti pelatihanmu" description="Klik sertifikat untuk melihat rincian status." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{certificates.map((item, index) => <button key={item.id} onClick={() => openDialog('certificate-detail', { item })} className="overflow-hidden rounded-[18px] border border-pull-100 text-left transition hover:-translate-y-1 hover:shadow-md"><div className={`grid h-40 place-items-center ${index % 2 ? 'bg-pull-900 text-[#b9dfc8]' : 'bg-[#eee2cb] text-[#795e31]'}`}><Award size={42} /></div><div className="p-4"><div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2 py-1 text-[8px] font-extrabold ${item.status === 'Disetujui Pull' ? 'bg-pull-50 text-pull-700' : 'bg-[#fff4e8] text-[#9c6537]'}`}>{item.status}</span><span className="text-[8px] font-bold text-pull-400">{item.date}</span></div><h2 className="mt-3 text-xs font-extrabold text-pull-900">{item.name}</h2><p className="mt-1 text-[9px] text-pull-500">{item.issuer}</p></div></button>)}</div></section>
      <div className="info-note mt-4 max-w-2xl"><ShieldCheck size={16} /><p>File sertifikat disimpan privat selama pemeriksaan. Profil publik hanya menampilkan nama, penerbit, dan status persetujuan.</p></div>
    </>
  )
}
