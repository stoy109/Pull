import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Star,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import {
  confirmJobCompletionAction,
  rateCompletedWorkerAction,
  setApplicationStatusAction,
} from "../actions";
import {
  applicationStatusLabel,
  formatCurrency,
  formatDate,
  formatNumber,
  jobStatusLabel,
} from "../format";
import type { JobsWorkspace, OwnedJob, OwnedJobApplication } from "../types";
import {
  ActionNotice,
  DashboardFrame,
  DataErrorPanel,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "./dashboard-frame";

function ApplicationStatus({ status }: { status: string }) {
  const positive = ["accepted", "completed"].includes(status);
  const negative = ["rejected", "withdrawn"].includes(status);
  return (
    <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${positive ? "bg-[#e7f5eb] text-[#17683a]" : negative ? "bg-[#fdebed] text-[#a72e43]" : "bg-[#eef3fb] text-[#426394]"}`}>
      {applicationStatusLabel(status)}
    </span>
  );
}

function RatingForm({ application }: { application: OwnedJobApplication }) {
  return (
    <details className="mt-3 rounded-xl border border-[#eadfbf] bg-[#fffaf0]">
      <summary className="cursor-pointer list-none px-3 py-2.5 text-[10px] font-extrabold text-[#805d18]">
        Beri rating pekerja
      </summary>
      <form action={rateCompletedWorkerAction} className="border-t border-[#eee0ba] p-3">
        <input type="hidden" name="applicationId" value={application.id} />
        <label className="block text-[10px] font-extrabold text-[#59491f]">
          Rating
          <select className="mt-1 h-10 w-full rounded-xl border border-[#decf9e] bg-white px-3 text-xs" name="score" required defaultValue="5">
            {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} bintang</option>)}
          </select>
        </label>
        <label className="mt-3 block text-[10px] font-extrabold text-[#59491f]">
          Ulasan opsional
          <textarea className={`${textareaClass} mt-1 min-h-20`} maxLength={1000} minLength={3} name="review" placeholder="Ceritakan pengalaman kerja yang terverifikasi." />
        </label>
        <button className={`${primaryButtonClass} mt-3 w-full`}><Star className="mr-2 h-4 w-4" />Kirim rating</button>
      </form>
    </details>
  );
}

function ApplicationCard({ application }: { application: OwnedJobApplication }) {
  const canDecide = application.status === "submitted";
  const canConfirm = application.status === "accepted" && !application.ownerConfirmedAt;
  return (
    <article className="rounded-2xl border border-[#dfe8e2] bg-[#fbfcfb] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e4f2e8] text-[#087447]"><UserRoundCheck className="h-4 w-4" /></span>
          <div><h4 className="text-xs font-extrabold text-[#26372f]">{application.label}</h4><p className="mt-0.5 text-[9px] font-semibold text-[#7b8982]">Melamar {formatDate(application.createdAt)}</p></div>
        </div>
        <ApplicationStatus status={application.status} />
      </div>
      <p className="mt-3 rounded-xl bg-white px-3 py-2.5 text-[11px] font-medium leading-5 text-[#52645b]">{application.message}</p>

      {canDecide ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <form action={setApplicationStatusAction}>
            <input type="hidden" name="applicationId" value={application.id} />
            <input type="hidden" name="status" value="rejected" />
            <button className={`${secondaryButtonClass} w-full border-[#e3a8b2] text-[#a72e43] hover:bg-[#fff3f5]`}>Tolak</button>
          </form>
          <form action={setApplicationStatusAction}>
            <input type="hidden" name="applicationId" value={application.id} />
            <input type="hidden" name="status" value="accepted" />
            <button className={`${primaryButtonClass} w-full`}>Terima</button>
          </form>
        </div>
      ) : null}

      {canConfirm ? (
        <form action={confirmJobCompletionAction} className="mt-3">
          <input type="hidden" name="applicationId" value={application.id} />
          <button className={`${primaryButtonClass} w-full`}><CheckCircle2 className="mr-2 h-4 w-4" />Konfirmasi pekerjaan selesai</button>
        </form>
      ) : null}

      {application.status === "accepted" && application.ownerConfirmedAt ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#fff7e8] px-3 py-2.5 text-[10px] font-bold leading-4 text-[#76581c]">
          <Clock3 className="h-4 w-4 shrink-0" />Konfirmasi UMKM tercatat. {application.workerConfirmedAt ? "Konfirmasi pekerja juga sudah tercatat." : "Menunggu konfirmasi pekerja."}
        </p>
      ) : null}

      {application.status === "completed" ? (
        application.rated ? (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#eef8f1] px-3 py-2.5 text-[10px] font-bold text-[#17683a]"><Star className="h-4 w-4 fill-current" />Rating telah dikirim</p>
        ) : (
          <RatingForm application={application} />
        )
      ) : null}
    </article>
  );
}

function JobCard({ job }: { job: OwnedJob }) {
  const accepted = job.applications.filter((application) => ["accepted", "completed"].includes(application.status)).length;
  return (
    <article className="rounded-[22px] border border-[#dce7e1] bg-white p-5 shadow-[0_8px_26px_rgba(18,59,48,.04)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e8f4eb] text-[#087447]"><BriefcaseBusiness className="h-5 w-5" /></span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-[#10231d]">{job.title}</h2>
              <span className="rounded-full bg-[#edf4f0] px-2.5 py-1 text-[9px] font-extrabold text-[#315b4c]">{jobStatusLabel(job.status)}</span>
            </div>
            <p className="mt-2 text-xs font-medium leading-5 text-[#63736b]">{job.description}</p>
          </div>
        </div>
        <p className="shrink-0 rounded-xl bg-[#f1f7f3] px-3 py-2 text-[10px] font-extrabold text-[#315b4c]">{job.applications.length} pelamar</p>
      </div>

      <div className="mt-4 grid gap-2 text-[10px] font-semibold text-[#64746c] sm:grid-cols-2 lg:grid-cols-4">
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.district ?? "Lokasi belum tersedia"}</span>
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(job.startDate)} – {formatDate(job.endDate)}</span>
        <span className="inline-flex items-center gap-1.5"><UsersRound className="h-3.5 w-3.5" />{accepted}/{job.quota} diterima</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{job.durationDays ? `${job.durationDays} hari` : "Durasi belum tersedia"}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
        {job.category ? <span className="rounded-lg bg-[#f2f5f3] px-2.5 py-1.5 text-[#52645b]">{job.category}</span> : null}
        {job.wageAmount !== null ? <span className="rounded-lg bg-[#eef8f1] px-2.5 py-1.5 text-[#17683a]">{formatCurrency(job.wageAmount)} / {job.wageUnit ?? "periode"}</span> : null}
        {job.hoursPerDay !== null ? <span className="rounded-lg bg-[#f2f5f3] px-2.5 py-1.5 text-[#52645b]">{formatNumber(job.hoursPerDay)} jam/hari</span> : null}
      </div>
      {job.requirements ? <p className="mt-4 text-[10px] leading-5 text-[#64746c]"><strong className="text-[#315b4c]">Persyaratan:</strong> {job.requirements}</p> : null}

      <section className="mt-5 border-t border-[#e3ebe6] pt-4">
        <h3 className="text-xs font-extrabold text-[#244b3c]">Lamaran ({job.applications.length})</h3>
        {job.applications.length ? (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">{job.applications.map((application) => <ApplicationCard application={application} key={application.id} />)}</div>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-[#cbdad2] p-5 text-center text-xs font-semibold text-[#718078]">Belum ada lamaran untuk lowongan ini.</p>
        )}
      </section>
    </article>
  );
}

export function JobsPageView({
  error,
  identity,
  notice,
  workspace,
}: {
  error: string | null;
  identity: Parameters<typeof DashboardFrame>[0]["identity"];
  notice: { error?: string; success?: string };
  workspace: JobsWorkspace | null;
}) {
  return (
    <DashboardFrame identity={identity}>
      <ActionNotice {...notice} />
      {error || !workspace ? (
        <DataErrorPanel message={error ?? "Data lowongan belum tersedia."} />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 rounded-[20px] border border-[#dce7e1] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-extrabold text-[#17362a]">{workspace.jobs.length} lowongan tersimpan</p><p className="mt-1 text-xs font-medium text-[#718078]">Keputusan lamaran dan konfirmasi selesai dicatat melalui alur transaksi Pull.</p></div>
            <Link className={primaryButtonClass} href="/dashboard/publish">Terbitkan lowongan</Link>
          </div>
          {workspace.jobs.length ? (
            <div className="space-y-5">{workspace.jobs.map((job) => <JobCard job={job} key={job.id} />)}</div>
          ) : (
            <section className="rounded-[22px] border border-dashed border-[#cbdad2] bg-white p-10 text-center">
              <BriefcaseBusiness className="mx-auto h-10 w-10 text-[#78a08d]" />
              <h2 className="mt-4 text-lg font-extrabold text-[#244b3c]">Belum ada lowongan</h2>
              <p className="mt-2 text-sm font-medium text-[#718078]">Terbitkan lowongan pertama untuk mulai menerima lamaran nyata.</p>
              <Link className={`${primaryButtonClass} mt-5`} href="/dashboard/publish">Buat lowongan</Link>
            </section>
          )}
        </>
      )}
    </DashboardFrame>
  );
}
