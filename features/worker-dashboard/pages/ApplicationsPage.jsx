import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, BriefcaseBusiness, Clock3, MoreHorizontal } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { EmptyState, PageHeader, StageBadge } from '../components/UI'

const stages = ['Dilamar', 'Ditinjau', 'Interview', 'Diterima', 'Selesai']

export default function ApplicationsPage() {
  const { applications } = useWorkspace()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedStage = stages.includes(searchParams.get('stage')) ? searchParams.get('stage') : 'Interview'
  const selectStage = (stage) => setSearchParams({ stage }, { replace: true })

  return (
    <>
      <PageHeader eyebrow="Lamaran saya" title="Perjalanan lamaran" description="Pantau perubahan, jadwal interview, dan Confirmation Loop tanpa kehilangan momentum." />
      <section className="card">
        <div className="pipeline-tabs" role="tablist" aria-label="Tahap lamaran">{stages.map((stage, index) => <button key={stage} onClick={() => selectStage(stage)} className={`pipeline-tab ${selectedStage === stage ? 'pipeline-tab-active' : ''}`} role="tab" aria-selected={selectedStage === stage}><span className="pipeline-node">{selectedStage === stage ? <span /> : index + 1}</span><span>{stage}</span><strong>{applications[stage].length}</strong></button>)}</div>
      </section>
      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {applications[selectedStage].length ? applications[selectedStage].map((application) => <Link key={application.id} to={`/applications/${application.id}`} className={`application-card bg-white ${application.urgent ? 'application-urgent' : ''}`}><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-pull-50 text-[10px] font-black text-pull-700">{application.company.split(' ').slice(0, 2).map((word) => word[0]).join('')}</div><div><h2 className="text-xs font-extrabold text-pull-950">{application.role}</h2><p className="mt-0.5 text-[10px] font-bold text-pull-500">{application.company}</p></div></div><MoreHorizontal size={17} className="text-pull-300" /></div><div className="mt-4 flex flex-wrap gap-2"><StageBadge stage={selectedStage} />{application.urgent ? <span className="urgent-label">Perlu tindakan</span> : null}</div><div className="mt-4 border-t border-pull-100 pt-3"><p className={`text-[10px] font-extrabold ${application.urgent ? 'text-[#b85c3c]' : 'text-pull-700'}`}>{application.status}</p><div className="mt-1.5 flex items-center justify-between"><p className="flex items-center gap-1 text-[9px] font-semibold text-pull-400"><Clock3 size={11} /> {application.time}</p><ArrowRight size={14} className="text-pull-400" /></div></div></Link>) : <div className="md:col-span-2 xl:col-span-3"><EmptyState illustration="/illustrations/worker-mobile.webp" illustrationAlt="Pekerja memantau kabar lamaran melalui ponsel" title={`Belum ada lamaran di tahap ${selectedStage}`} description="Lamaran akan muncul otomatis saat statusnya berubah." action={<Link to="/jobs" className="primary-button"><BriefcaseBusiness size={14} /> Cari loker</Link>} /></div>}
      </section>
    </>
  )
}
