import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { submitJobApplicationAction } from "@/features/collaboration/actions";
import { requireRole } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

export default async function WorkerApplyPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  await requireRole(["pekerja"]);
  const params = await searchParams;
  const supabase = await createClient();
  const { data: jobs } = await supabase.from("job_postings").select("id,title,description,profiles!job_postings_owner_id_fkey(business_name,display_name)").eq("status", "published").order("created_at", { ascending: false }).limit(20);
  return <main className="min-h-screen bg-[#f6f8f5] px-5 py-8 text-[#10231d]"><div className="mx-auto max-w-5xl"><Link href="/worker/jobs" className="inline-flex items-center gap-2 text-xs font-extrabold text-[#087447]"><ArrowLeft className="h-4 w-4" /> Kembali ke dashboard</Link><h1 className="mt-6 text-3xl font-extrabold">Lowongan database Pull</h1><p className="mt-2 text-sm text-[#6b7b75]">Lamaran pada halaman ini tersimpan dan muncul di monitoring Administrator.</p>{params.success ? <p className="mt-5 rounded-xl bg-[#e9f7ef] p-3 text-xs font-bold text-[#087447]">Lamaran berhasil dikirim.</p> : null}{params.error ? <p className="mt-5 rounded-xl bg-[#fff0f0] p-3 text-xs font-bold text-[#b43e48]">{params.error === "duplicate" ? "Anda sudah melamar lowongan ini." : "Lamaran belum dapat dikirim."}</p> : null}<section className="mt-6 grid gap-4 md:grid-cols-2">{jobs?.length ? jobs.map((job) => <form key={job.id} action={submitJobApplicationAction} className="rounded-[20px] border border-[#dce7e1] bg-white p-5"><BriefcaseBusiness className="h-5 w-5 text-[#087447]" /><h2 className="mt-3 text-lg font-extrabold">{job.title}</h2><p className="mt-2 min-h-12 text-xs leading-5 text-[#6b7b75]">{job.description}</p><input type="hidden" name="jobId" value={job.id} /><textarea name="message" required minLength={5} maxLength={300} defaultValue="Saya tertarik dan siap mengikuti jadwal pekerjaan." className="mt-4 min-h-20 w-full rounded-xl border border-[#d8e4dd] p-3 text-xs" /><button className="mt-3 h-10 w-full rounded-xl bg-[#087447] text-xs font-extrabold text-white">Kirim lamaran</button></form>) : <div className="col-span-full rounded-[20px] border border-[#dce7e1] bg-white py-16 text-center text-sm text-[#718079]">Belum ada lowongan UMKM yang diterbitkan.</div>}</section></div></main>;
}
