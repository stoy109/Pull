import { BriefcaseBusiness, CalendarDays, MapPin } from "lucide-react";
import { createFullJobAction } from "../actions";
import { formatDate, jobStatusLabel } from "../format";
import type { PublishWorkspace } from "../types";
import {
  ActionNotice,
  DashboardFrame,
  DataErrorPanel,
  Field,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "./dashboard-frame";

export function PublishPageView({
  error,
  identity,
  notice,
  workspace,
}: {
  error: string | null;
  identity: Parameters<typeof DashboardFrame>[0]["identity"];
  notice: { error?: string; success?: string };
  workspace: PublishWorkspace | null;
}) {
  return (
    <DashboardFrame identity={identity}>
      <ActionNotice {...notice} />
      {error || !workspace ? (
        <DataErrorPanel message={error ?? "Form lowongan belum tersedia."} />
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
          <form action={createFullJobAction} className="rounded-[22px] border border-[#dce7e1] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e8f4eb] text-[#087447]"><BriefcaseBusiness className="h-5 w-5" /></span>
              <div><h2 className="text-xl font-extrabold text-[#10231d]">Detail lowongan</h2><p className="mt-1 text-xs font-medium leading-5 text-[#718078]">Semua detail disimpan sebagai satu lowongan dan divalidasi kembali oleh database.</p></div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Judul pekerjaan *"><input className={inputClass} maxLength={100} minLength={3} name="title" placeholder="Kru packing harian" required /></Field>
              <Field label="Kategori *"><input className={inputClass} maxLength={80} minLength={2} name="category" placeholder="Produksi, logistik, penjualan" required /></Field>
              <Field label="Kecamatan *"><input className={inputClass} maxLength={120} minLength={2} name="district" required /></Field>
              <Field label="Upah *"><input className={inputClass} min="0.01" name="wageAmount" required step="0.01" type="number" /></Field>
              <Field label="Satuan upah *"><input className={inputClass} defaultValue="hari" maxLength={40} name="wageUnit" required /></Field>
              <Field label="Durasi (hari) *"><input className={inputClass} min="1" name="durationDays" required step="1" type="number" /></Field>
              <Field label="Tanggal mulai *"><input className={inputClass} name="startDate" required type="date" /></Field>
              <Field label="Tanggal selesai *"><input className={inputClass} name="endDate" required type="date" /></Field>
              <Field label="Kuota pekerja *"><input className={inputClass} min="1" name="quota" required step="1" type="number" /></Field>
              <Field label="Jam kerja per hari *"><input className={inputClass} max="24" min="0.25" name="hoursPerDay" required step="0.25" type="number" /></Field>
              <Field className="sm:col-span-2" label="Deskripsi pekerjaan *"><textarea className={textareaClass} maxLength={500} minLength={10} name="description" required /></Field>
              <Field className="sm:col-span-2" label="Persyaratan"><textarea className={textareaClass} maxLength={1500} name="requirements" placeholder="Keahlian, alat, atau ketentuan kerja yang perlu diketahui pelamar." /></Field>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button className={secondaryButtonClass} name="jobStatus" value="draft">Simpan draf</button>
              <button className={primaryButtonClass} name="jobStatus" value="published">Terbitkan lowongan</button>
            </div>
          </form>

          <aside className="rounded-[22px] border border-[#dce7e1] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-extrabold text-[#10231d]">Lowongan terbaru</h2>
            <p className="mt-1 text-xs font-medium text-[#718078]">{workspace.recentJobs.length} data terakhir milik usaha Anda.</p>
            {workspace.recentJobs.length ? (
              <div className="mt-5 space-y-3">
                {workspace.recentJobs.map((job) => (
                  <article className="rounded-2xl border border-[#e0e9e3] p-4" key={job.id}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-extrabold text-[#26372f]">{job.title}</h3>
                      <span className="shrink-0 rounded-full bg-[#edf4f0] px-2.5 py-1 text-[9px] font-extrabold text-[#315b4c]">{jobStatusLabel(job.status)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-semibold text-[#718078]">
                      {job.district ? <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{job.district}</span> : null}
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(job.createdAt)}</span>
                      {job.category ? <span>{job.category}</span> : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-[#cbdad2] p-8 text-center text-xs font-semibold text-[#718078]">Belum ada lowongan tersimpan.</p>
            )}
          </aside>
        </section>
      )}
    </DashboardFrame>
  );
}
