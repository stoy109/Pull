import { Award, BadgeCheck, GraduationCap, Plus, Sparkles, Target, TrendingUp } from 'lucide-react'
import { jobs, skillDemand } from '../data/mockData'
import { useWorkspace } from '../context/WorkspaceContext'
import { PageHeader, SectionHeading } from '../components/UI'

export default function SkillsPage() {
  const { skills, openDialog } = useWorkspace()
  const verifiedCount = skills.filter((skill) => skill.verified).length
  return (
    <>
      <PageHeader eyebrow="Skill growth" title="Skill & perkembangan" description="Bandingkan kemampuanmu dengan kebutuhan lowongan aktif di Solo Raya." actions={<button onClick={() => openDialog('skills')} className="primary-button"><Plus size={14} /> Kelola skill</button>} />
      <div className="grid grid-cols-12 gap-4 2xl:gap-5">
        <section className="card col-span-12 xl:col-span-7"><SectionHeading eyebrow={`${skills.length} skill · ${verifiedCount} terverifikasi`} title="Skill aktif" description="Skill terverifikasi berasal dari sertifikat atau pekerjaan terkonfirmasi." /><div className="flex flex-wrap gap-2">{skills.map((skill) => <span key={skill.name} className={`skill-chip ${skill.verified ? 'skill-verified' : ''}`}>{skill.verified ? <BadgeCheck size={13} /> : null}{skill.name}</span>)}<button onClick={() => openDialog('skills')} className="skill-chip skill-add"><Plus size={12} /> Tambah skill</button></div><div className="mt-6 rounded-[18px] bg-pull-950 p-5 text-white"><div className="flex items-center justify-between"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-white/45">Kekuatan skill</p><p className="mt-2 font-display text-3xl font-semibold">76%</p></div><Sparkles size={28} className="text-[#9dd5b7]" /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[76%] rounded-full bg-[#87caa5]" /></div><p className="mt-3 text-[10px] text-white/55">Kuat untuk retail dan pelayanan. Tambah Kasir digital untuk naik ke 84%.</p></div></section>
        <section className="card col-span-12 xl:col-span-5"><SectionHeading eyebrow="Rekomendasi" title="Skill berikutnya" description="Dihitung dari lowongan dengan match di atas 70%." /><div className="rounded-[18px] border border-[#e6dec9] bg-[#fffaf0] p-4"><div className="grid size-10 place-items-center rounded-xl bg-white text-[#966e2e] shadow-sm"><GraduationCap size={19} /></div><p className="mt-4 text-sm font-extrabold text-[#594727]">Kasir digital & POS</p><p className="mt-1.5 text-[10px] leading-5 text-[#7a6848]">Muncul di 14 lowongan cocok. Modul dasar membutuhkan sekitar 25 menit.</p><button onClick={() => openDialog('learning')} className="warm-button mt-4 w-full justify-center">Mulai modul</button></div></section>
        <section className="card col-span-12 xl:col-span-7"><SectionHeading eyebrow="Permintaan lokal" title="Tren skill Solo Raya" description="Frekuensi skill pada 48 lowongan aktif." /><div className="space-y-4">{skillDemand.map((item) => <div key={item.label}><div className="mb-1.5 flex items-center justify-between"><div><p className="text-[10px] font-extrabold text-pull-800">{item.label}</p><p className="mt-0.5 text-[8px] text-pull-400">{item.jobs} lowongan</p></div><span className="text-[9px] font-extrabold text-pull-500">{item.status}</span></div><div className="h-2 overflow-hidden rounded-full bg-pull-50"><div className="h-full rounded-full bg-pull-600" style={{ width: `${item.value}%` }} /></div></div>)}</div></section>
        <section className="card col-span-12 xl:col-span-5"><SectionHeading eyebrow="Dampak" title="Peluang setelah belajar" /><div className="grid grid-cols-2 gap-3"><Impact icon={Target} value="+14" label="Loker cocok" /><Impact icon={TrendingUp} value="+8%" label="Estimasi interview" /><Impact icon={Award} value="1" label="Badge skill" /><Impact icon={Sparkles} value="84%" label="Kekuatan skill" /></div><p className="mt-4 text-[10px] leading-5 text-pull-500">Contoh peluang: {jobs.filter((job) => job.role.toLowerCase().includes('admin') || job.role.toLowerCase().includes('pramuniaga')).map((job) => job.role).slice(0, 2).join(' dan ')}.</p></section>
      </div>
    </>
  )
}

function Impact({ icon: Icon, value, label }) {
  return <div className="rounded-xl border border-pull-100 p-3"><Icon size={15} className="text-pull-500" /><strong className="mt-2 block font-display text-xl font-semibold text-pull-900">{value}</strong><span className="text-[8px] font-bold text-pull-400">{label}</span></div>
}
