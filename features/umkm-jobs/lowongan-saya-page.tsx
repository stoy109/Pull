"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Copy,
  LockKeyhole,
  MoreVertical,
  Palette,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Shirt,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";

type JobStatus = "Terbuka" | "Hampir Penuh" | "Ditutup" | "Draf";
type ActiveTab = "semua" | "terbuka" | "hampir_penuh" | "ditutup" | "draf";
type ActiveModal = "applicants" | "post_job" | null;
type SortDirection = "asc" | "desc";

type Job = {
  id: string;
  title: string;
  category: string;
  district: string;
  wage: number;
  duration: number;
  startDate: string;
  status: JobStatus;
  filled: number;
  positions: number;
  applicantCount: number;
  description: string;
  tone: "violet" | "orange" | "green";
};

type Applicant = {
  name: string;
  initials: string;
  trustScore: number;
  trustLabel: string;
  completedJobs: number;
  phone: string;
  tone: string;
};

const INITIAL_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Buruh Cuci Kain Batik",
    category: "Produksi Batik",
    district: "Laweyan",
    wage: 120000,
    duration: 3,
    startDate: "2026-07-25",
    status: "Terbuka",
    filled: 2,
    positions: 2,
    applicantCount: 2,
    description: "Membantu proses pencucian kain batik setelah tahap pewarnaan.",
    tone: "violet",
  },
  {
    id: "job-2",
    title: "Asisten Pewarnaan Kain",
    category: "Produksi Batik",
    district: "Pasar Kliwon",
    wage: 110000,
    duration: 5,
    startDate: "2026-07-28",
    status: "Hampir Penuh",
    filled: 4,
    positions: 5,
    applicantCount: 4,
    description: "Mendampingi pengrajin pada proses pencampuran dan pewarnaan kain.",
    tone: "orange",
  },
  {
    id: "job-3",
    title: "Staf Pengemasan Produk Batik",
    category: "Pengemasan",
    district: "Laweyan",
    wage: 95000,
    duration: 4,
    startDate: "2026-07-30",
    status: "Terbuka",
    filled: 1,
    positions: 3,
    applicantCount: 3,
    description: "Menyortir, melipat, dan mengemas produk batik untuk pesanan toko dan daring.",
    tone: "green",
  },
  {
    id: "job-4",
    title: "Admin Toko Online",
    category: "Administrasi",
    district: "Banjarsari",
    wage: 135000,
    duration: 7,
    startDate: "2026-08-01",
    status: "Terbuka",
    filled: 1,
    positions: 2,
    applicantCount: 3,
    description: "Membalas chat pelanggan, mencatat pesanan, dan memperbarui stok toko online.",
    tone: "violet",
  },
  {
    id: "job-5",
    title: "Penjaga Booth Bazar",
    category: "Penjualan",
    district: "Serengan",
    wage: 125000,
    duration: 2,
    startDate: "2026-08-02",
    status: "Hampir Penuh",
    filled: 2,
    positions: 3,
    applicantCount: 5,
    description: "Melayani pengunjung dan menjaga kerapian display produk selama bazar UMKM.",
    tone: "orange",
  },
  {
    id: "job-6",
    title: "Kurir Pesanan Lokal",
    category: "Kurir",
    district: "Jebres",
    wage: 115000,
    duration: 4,
    startDate: "2026-08-03",
    status: "Terbuka",
    filled: 0,
    positions: 2,
    applicantCount: 1,
    description: "Mengantar pesanan pelanggan di area Solo menggunakan kendaraan pribadi.",
    tone: "green",
  },
  {
    id: "job-7",
    title: "Fotografer Produk Harian",
    category: "Konten Produk",
    district: "Laweyan",
    wage: 175000,
    duration: 1,
    startDate: "2026-08-05",
    status: "Ditutup",
    filled: 1,
    positions: 1,
    applicantCount: 3,
    description: "Mengambil foto katalog sederhana untuk produk batik dan aksesori usaha.",
    tone: "violet",
  },
  {
    id: "job-8",
    title: "Kasir Toko Oleh-oleh",
    category: "Penjualan",
    district: "Pasar Kliwon",
    wage: 120000,
    duration: 6,
    startDate: "2026-08-07",
    status: "Terbuka",
    filled: 2,
    positions: 3,
    applicantCount: 4,
    description: "Melayani transaksi, mencatat penjualan, dan membantu pengecekan stok harian.",
    tone: "orange",
  },
  {
    id: "job-9",
    title: "Asisten Jahit Finishing",
    category: "Produksi Batik",
    district: "Laweyan",
    wage: 105000,
    duration: 8,
    startDate: "2026-08-10",
    status: "Draf",
    filled: 0,
    positions: 4,
    applicantCount: 0,
    description: "Membantu pemotongan benang, pengecekan jahitan, dan finishing produk.",
    tone: "violet",
  },
  {
    id: "job-10",
    title: "Pekerja Gudang dan Stok",
    category: "Pergudangan",
    district: "Banjarsari",
    wage: 100000,
    duration: 5,
    startDate: "2026-08-12",
    status: "Ditutup",
    filled: 3,
    positions: 3,
    applicantCount: 5,
    description: "Menata barang masuk, mencatat stok, dan menyiapkan pesanan untuk pengiriman.",
    tone: "green",
  },
];

const DEMO_APPLICANTS: Applicant[] = [
  { name: "Dimas Pratama", initials: "DP", trustScore: 82, trustLabel: "Sangat Baik", completedJobs: 14, phone: "628123456781", tone: "bg-[#dfe9df] text-[#315746]" },
  { name: "Siti Nur Aini", initials: "SN", trustScore: 76, trustLabel: "Baik", completedJobs: 9, phone: "628123456782", tone: "bg-[#f5e7dc] text-[#885d43]" },
  { name: "Rizky Maulana", initials: "RM", trustScore: 88, trustLabel: "Sangat Baik", completedJobs: 21, phone: "628123456783", tone: "bg-[#e0e8f4] text-[#3f5f86]" },
  { name: "Nanda Putri", initials: "NP", trustScore: 79, trustLabel: "Baik", completedJobs: 11, phone: "628123456784", tone: "bg-[#f5e6e8] text-[#87505b]" },
  { name: "Agus Setiawan", initials: "AS", trustScore: 75, trustLabel: "Baik", completedJobs: 8, phone: "628123456785", tone: "bg-[#e6ecdc] text-[#547039]" },
  { name: "Wulan Sari", initials: "WS", trustScore: 73, trustLabel: "Baik", completedJobs: 7, phone: "628123456786", tone: "bg-[#eee4f3] text-[#735483]" },
  { name: "Bagas Nugroho", initials: "BN", trustScore: 84, trustLabel: "Sangat Baik", completedJobs: 17, phone: "628123456787", tone: "bg-[#e4ecdf] text-[#4d6f3c]" },
  { name: "Larasati Dewi", initials: "LD", trustScore: 78, trustLabel: "Baik", completedJobs: 10, phone: "628123456788", tone: "bg-[#f3e8d9] text-[#7e6039]" },
];

const APPLICANTS: Record<string, Applicant[]> = {
  "job-1": DEMO_APPLICANTS.slice(0, 2),
  "job-2": DEMO_APPLICANTS.slice(2, 6),
  "job-3": [DEMO_APPLICANTS[1], DEMO_APPLICANTS[4], DEMO_APPLICANTS[6]],
  "job-4": [DEMO_APPLICANTS[0], DEMO_APPLICANTS[3], DEMO_APPLICANTS[7]],
  "job-5": [DEMO_APPLICANTS[0], DEMO_APPLICANTS[2], DEMO_APPLICANTS[3], DEMO_APPLICANTS[4], DEMO_APPLICANTS[6]],
  "job-6": [DEMO_APPLICANTS[5]],
  "job-7": [DEMO_APPLICANTS[1], DEMO_APPLICANTS[2], DEMO_APPLICANTS[7]],
  "job-8": [DEMO_APPLICANTS[0], DEMO_APPLICANTS[1], DEMO_APPLICANTS[4], DEMO_APPLICANTS[6]],
  "job-9": [],
  "job-10": [DEMO_APPLICANTS[2], DEMO_APPLICANTS[3], DEMO_APPLICANTS[5], DEMO_APPLICANTS[6], DEMO_APPLICANTS[7]],
};

const TAB_DEFINITIONS: Array<{ key: ActiveTab; label: string }> = [
  { key: "semua", label: "Semua" },
  { key: "terbuka", label: "Terbuka" },
  { key: "hampir_penuh", label: "Hampir Penuh" },
  { key: "ditutup", label: "Ditutup" },
  { key: "draf", label: "Draf" },
];

const TAB_STYLES: Record<ActiveTab, { active: string; inactive: string }> = {
  semua: {
    active: "bg-[#145c46] text-white shadow-sm",
    inactive: "text-[#315b4c] hover:bg-[#eef5f1]",
  },
  terbuka: {
    active: "bg-[#08783f] text-white shadow-sm",
    inactive: "text-[#08783f] hover:bg-[#e9f5ed]",
  },
  hampir_penuh: {
    active: "bg-[#e87918] text-white shadow-sm",
    inactive: "text-[#d8670d] hover:bg-[#fff2e5]",
  },
  ditutup: {
    active: "bg-[#b61f3e] text-white shadow-sm",
    inactive: "text-[#a9233e] hover:bg-[#fae9ed]",
  },
  draf: {
    active: "bg-[#647079] text-white shadow-sm",
    inactive: "text-[#647079] hover:bg-[#eef0f2]",
  },
};

const CATEGORY_OPTIONS = ["Semua kategori", "Produksi Batik", "Pengemasan", "Administrasi", "Penjualan", "Kurir", "Konten Produk", "Pergudangan"];
const DISTRICT_OPTIONS = ["Semua kecamatan", "Laweyan", "Pasar Kliwon", "Banjarsari", "Serengan", "Jebres"];

const rupiah = new Intl.NumberFormat("id-ID");
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function tabMatches(job: Job, tab: ActiveTab) {
  if (tab === "semua") return true;
  if (tab === "terbuka") return job.status === "Terbuka" || job.status === "Hampir Penuh";
  if (tab === "hampir_penuh") return job.status === "Hampir Penuh";
  if (tab === "ditutup") return job.status === "Ditutup";
  return job.status === "Draf";
}

function tabForStatus(status: JobStatus): ActiveTab {
  if (status === "Hampir Penuh") return "hampir_penuh";
  if (status === "Ditutup") return "ditutup";
  if (status === "Draf") return "draf";
  return "terbuka";
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatShortDate(value: string) {
  return shortDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function JobIcon({ job, compact = false }: { job: Job; compact?: boolean }) {
  const Icon = job.tone === "orange" ? Palette : job.tone === "green" ? BriefcaseBusiness : Shirt;
  const tone = job.tone === "orange"
    ? "bg-[#fff0df] text-[#ee7615]"
    : job.tone === "green"
      ? "bg-[#e4f2e7] text-[#21834a]"
      : "bg-[#ece7ff] text-[#7461df]";

  return <span className={`grid shrink-0 place-items-center rounded-full ${compact ? "h-9 w-9" : "h-11 w-11"} ${tone}`}><Icon className={compact ? "h-4 w-4" : "h-5 w-5"} /></span>;
}

function StatusBadge({ status }: { status: JobStatus }) {
  const styles: Record<JobStatus, string> = {
    Terbuka: "bg-[#e8f4e9] text-[#26723c] before:bg-[#299a45]",
    "Hampir Penuh": "bg-[#fff1e4] text-[#db690d] before:bg-[#ec8e3b]",
    Ditutup: "bg-[#fae9ed] text-[#a9233e] before:bg-[#b61f3e]",
    Draf: "bg-[#eef0f2] text-[#647079] before:bg-[#8a959d]",
  };

  return <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-extrabold before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${styles[status]}`}>{status}</span>;
}

function EmptyJobs({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="grid min-h-[430px] place-items-center rounded-xl border border-[#e1e7e3] bg-white px-6 py-12 text-center shadow-[0_8px_28px_rgba(18,59,48,.025)]">
      <div>
        <div className="relative mx-auto grid h-28 w-36 place-items-center rounded-[46%] bg-[#f0f5ef] text-[#4f5b61]">
          <BriefcaseBusiness className="h-[76px] w-[76px]" strokeWidth={1.45} />
          <span className="absolute bottom-2 right-3 grid h-10 w-10 place-items-center rounded-full border-4 border-white bg-[#777f89] text-white"><X className="h-5 w-5" /></span>
          <span className="absolute left-0 top-4 text-xl text-[#a7cda8]">✦</span>
          <span className="absolute right-0 top-2 text-2xl text-[#8fbd88]">✦</span>
        </div>
        <h2 className="mt-7 text-lg font-extrabold text-[#111827]">Anda belum memposting lowongan</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-[#6b7280]">Posting lowongan pertama untuk mencari tenaga kerja harian di sekitar Anda.</p>
        <button type="button" onClick={onCreate} className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#08783f] px-7 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(8,120,63,.18)] transition hover:bg-[#066b36]">Posting Lowongan <Plus className="h-4 w-4" /></button>
      </div>
    </section>
  );
}

function ModalFrame({ title, titleId, onClose, children, width = "max-w-[720px]" }: {
  title: string;
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#071d15]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="presentation" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()} className={`max-h-[92vh] w-full overflow-y-auto rounded-t-[22px] border border-[#dfe5e1] bg-white shadow-[0_30px_90px_rgba(7,29,21,.28)] sm:rounded-[18px] ${width}`}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-5 py-4 sm:px-6">
          <h2 id={titleId} className="text-base font-extrabold text-[#111827]">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-[#25342e] transition hover:bg-[#f0f4f1]" aria-label="Tutup modal"><X className="h-5 w-5" /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

function ApplicantsModal({ job, onClose, onContact }: {
  job: Job;
  onClose: () => void;
  onContact: (applicant: Applicant) => void;
}) {
  const applicants = APPLICANTS[job.id] ?? [];

  return (
    <ModalFrame title={`Pelamar — ${job.title}`} titleId="applicants-modal-title" onClose={onClose} width="max-w-[560px]">
      <div className="p-5 sm:p-6">
        <p className="mb-4 text-xs font-extrabold text-[#35443d]">{applicants.length} pelamar</p>
        <div className="space-y-3">
          {applicants.map((applicant) => (
            <article key={applicant.name} className="flex flex-col gap-4 rounded-xl border border-[#e1e7e3] p-4 sm:flex-row sm:items-center">
              <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-sm font-black ${applicant.tone}`}>{applicant.initials}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-extrabold text-[#17201c]">{applicant.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-[11px] font-extrabold text-[#16804b]"><ShieldCheck className="h-4 w-4 fill-[#16804b] text-white" /> {applicant.trustScore} · {applicant.trustLabel}</p>
                <p className="mt-2 text-[11px] font-medium text-[#66736d]">{applicant.completedJobs} pekerjaan selesai</p>
              </div>
              <button type="button" onClick={() => onContact(applicant)} className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#08783f] px-4 text-[10px] font-extrabold leading-tight text-white transition hover:bg-[#066b36]"><FaWhatsapp className="h-4 w-4" /> Hubungi via<br />WhatsApp</button>
            </article>
          ))}
          {!applicants.length ? <p className="rounded-xl bg-[#f6f8f6] p-5 text-center text-xs font-semibold text-[#68756f]">Belum ada pelamar untuk lowongan ini.</p> : null}
        </div>
        <p className="mt-8 flex items-center gap-2 rounded-lg bg-[#f5f7f6] px-4 py-3 text-[9px] font-medium text-[#69756f]"><LockKeyhole className="h-4 w-4" /> Kontak ditampilkan dengan nomor masking untuk perlindungan data.</p>
      </div>
    </ModalFrame>
  );
}

function FormField({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={full ? "sm:col-span-2" : ""}><span className="mb-2 block text-[11px] font-extrabold text-[#27372f]">{label}</span>{children}</label>;
}

function PostJobModal({ job, onClose, onSubmit }: { job: Job | null; onClose: () => void; onSubmit: (job: Job) => void }) {
  const [description, setDescription] = useState(job?.description ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title")).trim();
    const positions = Number(form.get("positions"));
    onSubmit({
      id: job?.id ?? `job-${Date.now()}`,
      title,
      category: String(form.get("category")),
      district: job?.district ?? "Laweyan",
      wage: Number(form.get("wage")),
      duration: Number(form.get("duration")),
      startDate: String(form.get("startDate")),
      status: job?.status === "Draf" ? "Terbuka" : job?.status ?? "Terbuka",
      filled: job?.filled ?? 0,
      positions,
      applicantCount: job?.applicantCount ?? 0,
      description,
      tone: job?.tone ?? "green",
    });
  }

  const inputClass = "h-11 w-full rounded-lg border border-[#dce3df] bg-white px-3 text-xs font-semibold text-[#26372f] outline-none transition placeholder:text-[#98a29d] focus:border-[#71a987] focus:ring-4 focus:ring-[#e7f3eb]";

  return (
    <ModalFrame title={job ? "Edit Lowongan" : "Posting Lowongan Baru"} titleId="post-job-modal-title" onClose={onClose} width="max-w-[720px]">
      <form onSubmit={submit}>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <FormField label="Judul Pekerjaan *"><input name="title" defaultValue={job?.title} required placeholder="Contoh: Buruh Cuci Kain Batik" className={inputClass} /></FormField>
          <FormField label="Kategori *"><select name="category" defaultValue={job?.category ?? ""} required className={inputClass}><option value="" disabled>Pilih kategori</option>{CATEGORY_OPTIONS.slice(1).map((category) => <option key={category}>{category}</option>)}</select></FormField>
          <FormField label="Upah Harian *"><div className="flex"><span className="grid h-11 place-items-center rounded-l-lg border border-r-0 border-[#dce3df] bg-[#f8faf8] px-3 text-xs font-bold text-[#66736d]">Rp</span><input name="wage" defaultValue={job?.wage} type="number" min="1" required placeholder="Contoh: 120000" className={`${inputClass} rounded-l-none`} /></div></FormField>
          <FormField label="Durasi (hari) *"><input name="duration" defaultValue={job?.duration} type="number" min="1" required placeholder="Contoh: 3" className={inputClass} /></FormField>
          <FormField label="Tanggal Mulai *"><input name="startDate" defaultValue={job?.startDate} type="date" required className={inputClass} /></FormField>
          <FormField label="Jumlah Pekerja Dibutuhkan *"><input name="positions" defaultValue={job?.positions} type="number" min="1" required placeholder="Contoh: 2" className={inputClass} /></FormField>
          <FormField label="Deskripsi Pekerjaan (opsional)" full><div className="relative"><textarea name="description" value={description} onChange={(event) => setDescription(event.target.value.slice(0, 300))} placeholder="Jelaskan detail pekerjaan, kualifikasi, atau catatan lainnya..." className={`${inputClass} min-h-28 resize-none py-3 pr-12`} /><span className="absolute bottom-3 right-3 text-[9px] font-semibold text-[#7b8781]">{description.length}/300</span></div></FormField>
        </div>
        <footer className="flex items-center justify-between border-t border-[#e5e7eb] px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="h-11 rounded-lg border border-[#b6c0bb] px-6 text-xs font-extrabold text-[#35443d] transition hover:bg-[#f5f7f6]">Batal</button>
          <button type="submit" className="h-11 rounded-lg bg-[#08783f] px-7 text-xs font-extrabold text-white transition hover:bg-[#066b36]">{job ? "Simpan Perubahan" : "Posting Sekarang"}</button>
        </footer>
      </form>
    </ModalFrame>
  );
}

export function LowonganSayaPage({ ownerName, businessName, profileCompletion }: {
  ownerName: string;
  businessName: string;
  profileCompletion: number;
}) {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [activeTab, setActiveTab] = useState<ActiveTab>("semua");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("Semua kategori");
  const [districtFilter, setDistrictFilter] = useState("Semua kecamatan");
  const [toast, setToast] = useState<string | null>(null);

  const counts = useMemo(() => ({
    semua: jobs.length,
    terbuka: jobs.filter((job) => tabMatches(job, "terbuka")).length,
    hampir_penuh: jobs.filter((job) => tabMatches(job, "hampir_penuh")).length,
    ditutup: jobs.filter((job) => tabMatches(job, "ditutup")).length,
    draf: jobs.filter((job) => tabMatches(job, "draf")).length,
  }), [jobs]);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("id-ID");
    return jobs
      .filter((job) => tabMatches(job, activeTab))
      .filter((job) => !query || `${job.title} ${job.category} ${job.district}`.toLocaleLowerCase("id-ID").includes(query))
      .filter((job) => categoryFilter === "Semua kategori" || job.category === categoryFilter)
      .filter((job) => districtFilter === "Semua kecamatan" || job.district === districtFilter)
      .sort((first, second) => {
        const comparison = first.title.localeCompare(second.title, "id-ID");
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [activeTab, categoryFilter, districtFilter, jobs, searchQuery, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / rowsPerPage));
  const safePage = Math.min(currentPage, pageCount);
  const firstIndex = (safePage - 1) * rowsPerPage;
  const visibleJobs = filteredJobs.slice(firstIndex, firstIndex + rowsPerPage);
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;

  useEffect(() => {
    if (!activeModal) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveModal(null);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeModal]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function switchTab(tab: ActiveTab) {
    setActiveTab(tab);
    setCurrentPage(1);
    setOpenMenuId(null);
  }

  function openPostModal(jobId: string | null = null) {
    setSelectedJobId(jobId);
    setActiveModal("post_job");
    setOpenMenuId(null);
  }

  function saveJob(job: Job) {
    const exists = jobs.some((item) => item.id === job.id);
    setJobs((current) => exists ? current.map((item) => item.id === job.id ? job : item) : [job, ...current]);
    setActiveTab(tabForStatus(job.status));
    setSearchQuery("");
    setCategoryFilter("Semua kategori");
    setDistrictFilter("Semua kecamatan");
    setCurrentPage(1);
    setActiveModal(null);
    setToast(exists ? "Perubahan lowongan berhasil disimpan." : "Lowongan baru berhasil diposting.");
  }

  function duplicateJob(job: Job) {
    const duplicate = { ...job, id: `job-${Date.now()}`, title: `${job.title} (Salinan)`, filled: 0, applicantCount: 0, status: "Draf" as const };
    setJobs((current) => [duplicate, ...current]);
    setOpenMenuId(null);
    setActiveTab("draf");
    setCurrentPage(1);
    setToast("Lowongan berhasil diduplikat sebagai draf.");
  }

  function closeJob(job: Job) {
    setJobs((current) => current.map((item) => item.id === job.id ? { ...item, status: "Ditutup" } : item));
    setOpenMenuId(null);
    setToast("Lowongan telah ditutup.");
  }

  function deleteJob(job: Job) {
    setJobs((current) => current.filter((item) => item.id !== job.id));
    setOpenMenuId(null);
    setToast(`Lowongan ${job.title} dihapus.`);
  }

  function contactApplicant(applicant: Applicant) {
    const message = encodeURIComponent(`Halo ${applicant.name}, saya ${ownerName} dari ${businessName}. Kami ingin menindaklanjuti lamaran Anda melalui Pull.`);
    window.open(`https://wa.me/${applicant.phone}?text=${message}`, "_blank", "noopener,noreferrer");
  }

  function renderJobActions(job: Job, mobile = false, dropdownUp = false) {
    return (
      <div className={`relative flex items-center ${mobile ? "w-full gap-2" : "gap-1.5"}`}>
        <button
          type="button"
          onClick={() => {
            setSelectedJobId(job.id);
            setActiveModal("applicants");
            setOpenMenuId(null);
          }}
          className={`flex items-center justify-center whitespace-nowrap rounded-lg border border-[#cfd8d3] font-extrabold text-[#26372f] transition hover:bg-[#f5f8f6] ${mobile ? "h-10 flex-1 gap-2 px-3 text-[11px]" : "h-9 gap-1.5 px-2 text-[9px] xl:px-2.5 xl:text-[10px]"}`}
        >
          <UsersRound className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} /> {mobile ? "Lihat Pelamar" : <><span className="hidden xl:inline">Lihat</span> Pelamar</>}
        </button>
        <button
          type="button"
          onClick={() => setOpenMenuId((current) => current === job.id ? null : job.id)}
          aria-label={`Menu ${job.title}`}
          aria-expanded={openMenuId === job.id}
          className={`grid shrink-0 place-items-center rounded-lg border border-[#dfe5e1] text-[#26372f] transition hover:bg-[#f5f8f6] ${mobile ? "h-10 w-10" : "h-9 w-8 xl:w-9"}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {openMenuId === job.id ? (
          <div className={`absolute right-0 z-30 w-48 rounded-xl border border-[#dfe5e1] bg-white p-1.5 shadow-[0_16px_42px_rgba(18,59,48,.16)] ${dropdownUp ? "bottom-12" : "top-12"}`}>
            <button type="button" onClick={() => openPostModal(job.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-bold text-[#34443d] hover:bg-[#f3f7f4]"><Pencil className="h-4 w-4" /> Edit</button>
            <button type="button" onClick={() => duplicateJob(job)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-bold text-[#34443d] hover:bg-[#f3f7f4]"><Copy className="h-4 w-4" /> Duplikat</button>
            <button type="button" onClick={() => closeJob(job)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-bold text-[#8a631d] hover:bg-[#fff8e9]"><CircleX className="h-4 w-4" /> Tutup Lowongan</button>
            <button type="button" onClick={() => deleteJob(job)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-bold text-[#a52a43] hover:bg-[#fff1f3]"><Trash2 className="h-4 w-4" /> Hapus</button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <UmkmDashboardShell ownerName={ownerName} businessName={businessName} profileCompletion={profileCompletion}>
        <section className="rounded-[24px] border border-[#dfe8e1] bg-white p-4 shadow-[0_10px_35px_rgba(18,59,48,.035)] sm:p-5">
          <label className="flex h-14 items-center gap-3 rounded-[16px] border border-[#dfe5e1] bg-white px-4 text-[#5c8f70] transition focus-within:border-[#71a987] focus-within:ring-4 focus-within:ring-[#e7f3eb]">
            <Search className="h-5 w-5 shrink-0" />
            <input type="search" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }} placeholder="Cari pekerjaan, kategori, atau lokasi..." className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#31423b] outline-none placeholder:text-[#6d9b7e]" />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex h-[52px] min-w-0 flex-col justify-center rounded-[15px] border border-[#dfe5e1] bg-white px-3.5 py-1.5 transition hover:border-[#b9cfc1] focus-within:border-[#71a987]">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5c8f70]">Kategori</span>
              <span className="relative mt-0.5 flex items-center"><select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setCurrentPage(1); }} className="w-full appearance-none bg-transparent pr-7 text-sm font-medium text-[#17392c] outline-none">{CATEGORY_OPTIONS.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#38694e]" /></span>
            </label>
            <label className="flex h-[52px] min-w-0 flex-col justify-center rounded-[15px] border border-[#dfe5e1] bg-white px-3.5 py-1.5 transition hover:border-[#b9cfc1] focus-within:border-[#71a987]">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5c8f70]">Kecamatan</span>
              <span className="relative mt-0.5 flex items-center"><select value={districtFilter} onChange={(event) => { setDistrictFilter(event.target.value); setCurrentPage(1); }} className="w-full appearance-none bg-transparent pr-7 text-sm font-medium text-[#17392c] outline-none">{DISTRICT_OPTIONS.map((district) => <option key={district}>{district}</option>)}</select><ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#38694e]" /></span>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="overflow-x-auto rounded-[15px] border border-[#dfe5e1] bg-white p-1">
              <div className="flex min-w-max">
                {TAB_DEFINITIONS.map((tab) => (
                  <button key={tab.key} type="button" onClick={() => switchTab(tab.key)} className={`min-h-10 rounded-xl px-4 text-[10px] font-extrabold transition ${activeTab === tab.key ? TAB_STYLES[tab.key].active : TAB_STYLES[tab.key].inactive}`}>{tab.label} ({counts[tab.key]})</button>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => openPostModal()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-6 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(8,120,63,.16)] transition hover:bg-[#066b36]">Posting Lowongan <Plus className="h-4 w-4" /></button>
          </div>
        </section>

        <p className="mt-5 text-[11px] font-bold text-[#507f63]">Menampilkan <strong className="text-[#17392c]">{filteredJobs.length}</strong> lowongan di Solo Raya</p>

        <div className="mt-4">
          {filteredJobs.length ? (
            <section className="overflow-visible rounded-xl border border-[#dfe5e1] bg-white shadow-[0_8px_28px_rgba(18,59,48,.025)]">
              <div className="space-y-3 p-3 md:hidden">
                {visibleJobs.map((job, index) => (
                  <article key={job.id} className="rounded-xl border border-[#e1e7e3] bg-white p-4 shadow-[0_5px_18px_rgba(18,59,48,.035)]">
                    <div className="flex items-start gap-3">
                      <JobIcon job={job} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[13px] font-extrabold leading-5 text-[#17201c]">{job.title}</h3>
                        <p className="mt-1 text-[10px] font-semibold text-[#68756f]">{job.category}</p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-[#f7f9f7] p-3">
                      <div><p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Upah</p><p className="mt-1 text-[11px] font-extrabold text-[#26372f]">Rp {rupiah.format(job.wage)}/hari</p></div>
                      <div><p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Durasi</p><p className="mt-1 text-[11px] font-extrabold text-[#26372f]">{job.duration} hari</p></div>
                      <div><p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Mulai</p><p className="mt-1 text-[11px] font-extrabold text-[#26372f]">{formatDate(job.startDate)}</p></div>
                      <div><p className="text-[9px] font-bold uppercase tracking-wider text-[#809087]">Pelamar / Posisi</p><p className="mt-1 text-[11px] font-extrabold text-[#26372f]">{job.applicantCount} pelamar · {job.filled}/{job.positions}</p></div>
                    </div>
                    <div className="mt-4">{renderJobActions(job, true, index >= visibleJobs.length - 2)}</div>
                  </article>
                ))}
              </div>

              <div className="hidden md:block">
                <table className="w-full table-fixed border-collapse text-left">
                  <colgroup>
                    <col className="w-[25%] xl:w-[23%]" />
                    <col className="w-[13%]" />
                    <col className="hidden w-[7%] xl:table-column" />
                    <col className="w-[14%] xl:w-[12%]" />
                    <col className="w-[13%] xl:w-[12%]" />
                    <col className="w-[13%] xl:w-[11%]" />
                    <col className="w-[22%]" />
                  </colgroup>
                  <thead><tr className="border-b border-[#e5e7eb] text-[11px] font-extrabold text-[#1f2937]">
                    <th className="px-3 py-3.5"><button type="button" onClick={() => setSortDirection((current) => current === "asc" ? "desc" : "asc")} className="flex items-center gap-1.5 text-[10px]">Judul Pekerjaan {sortDirection === "asc" ? <ArrowDownAZ className="h-3.5 w-3.5 text-[#68756f]" /> : <ArrowUpAZ className="h-3.5 w-3.5 text-[#68756f]" />}</button></th>
                    <th className="px-2 py-3.5 text-[10px]">Upah/hari</th><th className="hidden px-2 py-3.5 text-[10px] xl:table-cell">Durasi</th><th className="px-2 py-3.5 text-[10px]">Mulai</th><th className="px-2 py-3.5 text-[10px]">Status</th><th className="px-2 py-3.5 text-[10px]">Pelamar / Posisi</th><th className="px-2 py-3.5 text-[10px]">Aksi</th>
                  </tr></thead>
                  <tbody>
                    {visibleJobs.map((job, index) => (
                      <tr key={job.id} className="border-b border-[#edf0ee] last:border-b-0">
                        <td className="px-3 py-3.5"><div className="flex items-center gap-2.5"><JobIcon job={job} compact /><div className="min-w-0"><p className="line-clamp-2 text-[11px] font-extrabold leading-4 text-[#17201c]">{job.title}</p><p className="mt-1 truncate text-[9px] font-medium text-[#68756f]">{job.category} · {job.district}</p></div></div></td>
                        <td className="whitespace-nowrap px-2 py-3.5 text-[10px] font-semibold text-[#334155]">Rp {rupiah.format(job.wage)}<span className="block text-[8px] text-[#718078]">per hari</span></td>
                        <td className="hidden whitespace-nowrap px-2 py-3.5 text-[10px] font-semibold text-[#334155] xl:table-cell">{job.duration} hari</td>
                        <td className="px-2 py-3.5 text-[10px] font-semibold leading-4 text-[#334155]">{formatShortDate(job.startDate)}<span className="block text-[8px] text-[#718078] xl:hidden">{job.duration} hari</span></td>
                        <td className="px-2 py-3.5"><StatusBadge status={job.status} /></td>
                        <td className="px-2 py-3.5"><p className="text-[10px] font-extrabold text-[#17201c]">{job.filled}/{job.positions}</p><p className="mt-1 text-[8px] font-medium text-[#68756f]">{job.applicantCount} pelamar</p></td>
                        <td className="px-2 py-3.5">{renderJobActions(job, false, index >= visibleJobs.length - 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <footer className="flex flex-col gap-4 border-t border-[#e5e7eb] px-5 py-4 text-[11px] font-medium text-[#65736c] sm:flex-row sm:items-center sm:justify-between">
                <p>Menampilkan {filteredJobs.length ? firstIndex + 1 : 0}–{Math.min(firstIndex + rowsPerPage, filteredJobs.length)} dari {filteredJobs.length} lowongan</p>
                <div className="flex items-center gap-2"><button type="button" disabled={safePage === 1} onClick={() => setCurrentPage((current) => Math.max(1, current - 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-[#dfe5e1] text-[#527063] disabled:opacity-35"><ChevronLeft className="h-4 w-4" /></button><span className="grid h-9 min-w-9 place-items-center rounded-lg bg-[#08783f] px-3 font-extrabold text-white">{safePage}</span><button type="button" disabled={safePage === pageCount} onClick={() => setCurrentPage((current) => Math.min(pageCount, current + 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-[#dfe5e1] text-[#527063] disabled:opacity-35"><ChevronRight className="h-4 w-4" /></button></div>
                <label className="flex items-center gap-3">Rows per page<select value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="h-9 rounded-lg border border-[#dfe5e1] bg-white px-3 font-semibold text-[#35443d]"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select></label>
              </footer>
            </section>
          ) : <EmptyJobs onCreate={() => openPostModal()} />}
        </div>
      </UmkmDashboardShell>

      {activeModal === "applicants" && selectedJob ? <ApplicantsModal job={selectedJob} onClose={() => setActiveModal(null)} onContact={contactApplicant} /> : null}
      {activeModal === "post_job" ? <PostJobModal job={selectedJob} onClose={() => setActiveModal(null)} onSubmit={saveJob} /> : null}
      {toast ? <div role="status" className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-xl bg-[#0c261c] px-4 py-3 text-xs font-bold text-white shadow-[0_16px_45px_rgba(7,29,21,.28)]">{toast}</div> : null}
    </>
  );
}
