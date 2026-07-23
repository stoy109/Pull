import { BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";
import { createJobPostingAction } from "@/features/collaboration/actions";
import { requireRole } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

export default async function PublishJobPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [{ user }, params] = await Promise.all([requireRole(["umkm"]), searchParams]);
  const supabase = await createClient();
  const { data: jobs } = await supabase.from("job_postings").select("id,title,description,status,created_at").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(10);
  const metadata = user.user_metadata ?? {};
  const ownerName = typeof metadata.display_name === "string" ? metadata.display_name : "Pemilik UMKM";
  const businessName = typeof metadata.business_name === "string" ? metadata.business_name : "UMKM Pull";
  return <UmkmDashboardShell ownerName={ownerName} businessName={businessName} profileCompletion={84}>
    <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <form action={createJobPostingAction} className="rounded-[22px] border border-[#dce7e1] bg-white p-6 shadow-sm">
        <BriefcaseBusiness className="h-6 w-6 text-[#087447]" />
        <h2 className="mt-4 text-xl font-extrabold">Terbitkan lowongan nyata</h2>
        <p className="mt-2 text-xs leading-5 text-[#6b7b75]">Data tersimpan di Supabase dan otomatis masuk monitoring admin.</p>
        {params.success ? <p className="mt-4 rounded-xl bg-[#e9f7ef] p-3 text-xs font-bold text-[#087447]">Lowongan berhasil diterbitkan.</p> : null}
        {params.error ? <p className="mt-4 rounded-xl bg-[#fff0f0] p-3 text-xs font-bold text-[#b43e48]">Periksa isian lalu coba lagi.</p> : null}
        <input name="title" required minLength={3} maxLength={100} placeholder="Contoh: Kru Packing Harian" className="mt-5 h-11 w-full rounded-xl border border-[#d8e4dd] px-4 text-xs outline-none" />
        <textarea name="description" required minLength={10} maxLength={500} placeholder="Jelaskan pekerjaan dan jadwal..." className="mt-3 min-h-28 w-full rounded-xl border border-[#d8e4dd] p-4 text-xs outline-none" />
        <button className="mt-4 h-11 w-full rounded-xl bg-[#087447] text-xs font-extrabold text-white">Terbitkan lowongan</button>
      </form>
      <div className="rounded-[22px] border border-[#dce7e1] bg-white p-6">
        <h2 className="text-lg font-extrabold">Lowongan tersimpan ({jobs?.length ?? 0})</h2>
        <div className="mt-4 space-y-3">{jobs?.length ? jobs.map((job) => <article key={job.id} className="rounded-xl border border-[#e1e9e4] p-4"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#087447]" /><h3 className="text-sm font-extrabold">{job.title}</h3></div><p className="mt-2 text-xs leading-5 text-[#6b7b75]">{job.description}</p></article>) : <p className="py-10 text-center text-xs text-[#7a8a83]">Belum ada lowongan database.</p>}</div>
      </div>
    </section>
  </UmkmDashboardShell>;
}
