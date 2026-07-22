import type { Applicant, Job, JobApplication } from "./recruitment-types";

export const CATEGORY_OPTIONS = [
  "Produksi Batik",
  "Pengemasan",
  "Administrasi",
  "Penjualan",
  "Kurir",
  "Konten Produk",
  "Pergudangan",
];

export const DISTRICT_OPTIONS = ["Laweyan", "Pasar Kliwon", "Banjarsari", "Serengan", "Jebres"];

export const INITIAL_JOBS: Job[] = [
  {
    id: "job-1", title: "Buruh Cuci Kain Batik", category: "Produksi Batik", district: "Laweyan",
    wage: 120000, duration: 3, startDate: "2026-07-25", endDate: "2026-07-27", workHours: "08.00–17.00",
    status: "Terbuka", acceptedCount: 1, workerQuota: 2, applicantCount: 5,
    description: "Membantu proses pencucian kain batik setelah tahap pewarnaan.", requirements: "Teliti, cekatan, dan siap bekerja dengan kain basah.",
    whatsappContact: "628123456790", tone: "violet",
  },
  {
    id: "job-2", title: "Asisten Pewarnaan Kain", category: "Produksi Batik", district: "Pasar Kliwon",
    wage: 110000, duration: 5, startDate: "2026-07-28", endDate: "2026-08-01", workHours: "08.00–16.00",
    status: "Hampir Penuh", acceptedCount: 4, workerQuota: 5, applicantCount: 7,
    description: "Mendampingi pengrajin pada proses pencampuran dan pewarnaan kain.", requirements: "Memahami warna dasar, teliti, dan bersedia mengikuti arahan pengrajin.",
    whatsappContact: "628123456790", tone: "orange",
  },
  {
    id: "job-3", title: "Penjahit Harian", category: "Produksi Batik", district: "Laweyan",
    wage: 130000, duration: 2, startDate: "2026-07-24", endDate: "2026-07-25", workHours: "09.00–17.00",
    status: "Draf", acceptedCount: 0, workerQuota: 2, applicantCount: 0,
    description: "Membantu proses jahit produk fashion batik.", requirements: "Mampu mengoperasikan mesin jahit dan membaca pola sederhana.",
    whatsappContact: "628123456790", tone: "green",
  },
  {
    id: "job-4", title: "Buruh Packing", category: "Pengemasan", district: "Banjarsari",
    wage: 100000, duration: 3, startDate: "2026-07-27", endDate: "2026-07-29", workHours: "08.00–16.00",
    status: "Kuota Penuh", acceptedCount: 3, workerQuota: 3, applicantCount: 6,
    description: "Menyiapkan dan mengemas pesanan produk batik untuk pengiriman.", requirements: "Rapi, cekatan, dan mampu mengangkat paket maksimal 10 kg.",
    whatsappContact: "628123456790", tone: "green",
  },
  {
    id: "job-5", title: "Admin Toko Online", category: "Administrasi", district: "Banjarsari",
    wage: 135000, duration: 7, startDate: "2026-08-01", endDate: "2026-08-07", workHours: "09.00–17.00",
    status: "Terbuka", acceptedCount: 1, workerQuota: 3, applicantCount: 4,
    description: "Membalas chat pelanggan, mencatat pesanan, dan memperbarui stok toko online.", requirements: "Terbiasa memakai marketplace dan dapat mengetik dengan cepat.",
    whatsappContact: "628123456790", tone: "violet",
  },
  {
    id: "job-6", title: "Penjaga Booth Bazar", category: "Penjualan", district: "Serengan",
    wage: 125000, duration: 2, startDate: "2026-08-02", endDate: "2026-08-03", workHours: "10.00–20.00",
    status: "Terbuka", acceptedCount: 0, workerQuota: 3, applicantCount: 3,
    description: "Melayani pengunjung dan menjaga kerapian display produk selama bazar UMKM.", requirements: "Ramah, komunikatif, dan bersedia bekerja pada akhir pekan.",
    whatsappContact: "628123456790", tone: "orange",
  },
  {
    id: "job-7", title: "Kurir Pesanan Lokal", category: "Kurir", district: "Jebres",
    wage: 115000, duration: 4, startDate: "2026-08-03", endDate: "2026-08-06", workHours: "09.00–17.00",
    status: "Dibatalkan", acceptedCount: 0, workerQuota: 2, applicantCount: 2,
    description: "Mengantar pesanan pelanggan di area Solo menggunakan kendaraan pribadi.", requirements: "Memiliki SIM C aktif dan kendaraan pribadi.",
    whatsappContact: "628123456790", tone: "green",
  },
  {
    id: "job-8", title: "Fotografer Produk Harian", category: "Konten Produk", district: "Laweyan",
    wage: 175000, duration: 1, startDate: "2026-08-05", endDate: "2026-08-05", workHours: "09.00–16.00",
    status: "Terbuka", acceptedCount: 0, workerQuota: 1, applicantCount: 3,
    description: "Mengambil foto katalog sederhana untuk produk batik dan aksesori usaha.", requirements: "Memiliki kamera atau ponsel dengan kamera baik serta portofolio foto produk.",
    whatsappContact: "628123456790", tone: "violet",
  },
  {
    id: "job-9", title: "Asisten Jahit Finishing", category: "Produksi Batik", district: "Laweyan",
    wage: 105000, duration: 8, startDate: "2026-08-10", endDate: "2026-08-17", workHours: "08.00–16.00",
    status: "Draf", acceptedCount: 0, workerQuota: 4, applicantCount: 0,
    description: "Membantu pemotongan benang, pengecekan jahitan, dan finishing produk.", requirements: "Teliti dan memahami dasar pengecekan kualitas jahitan.",
    whatsappContact: "628123456790", tone: "violet",
  },
  {
    id: "job-10", title: "Pekerja Gudang dan Stok", category: "Pergudangan", district: "Banjarsari",
    wage: 100000, duration: 5, startDate: "2026-08-12", endDate: "2026-08-16", workHours: "08.00–16.00",
    status: "Draf", acceptedCount: 0, workerQuota: 3, applicantCount: 0,
    description: "Menata barang masuk, mencatat stok, dan menyiapkan pesanan untuk pengiriman.", requirements: "Rapi, jujur, dan mampu bekerja dengan pencatatan stok sederhana.",
    whatsappContact: "628123456790", tone: "green",
  },
];

const WORKERS: Applicant[] = [
  { id: "worker-1", name: "Dimas Pratama", initials: "DP", trustScore: 82, trustLabel: "Sangat Baik", rating: 4.7, reviewCount: 18, completedJobs: 14, location: "Laweyan, Solo", skills: ["Mencuci Kain", "Teliti", "Cepat"], phone: "628123456781", tone: "bg-[#dfe9df] text-[#315746]" },
  { id: "worker-2", name: "Siti Nur Aini", initials: "SN", trustScore: 76, trustLabel: "Baik", rating: 4.5, reviewCount: 12, completedJobs: 9, location: "Serengan, Solo", skills: ["Pewarnaan", "Teliti", "Rajin"], phone: "628123456782", tone: "bg-[#f5e7dc] text-[#885d43]" },
  { id: "worker-3", name: "Rizky Maulana", initials: "RM", trustScore: 88, trustLabel: "Sangat Baik", rating: 4.9, reviewCount: 27, completedJobs: 21, location: "Banjarsari, Solo", skills: ["Packing", "Gudang", "Cekatan"], phone: "628123456783", tone: "bg-[#e0e8f4] text-[#3f5f86]" },
  { id: "worker-4", name: "Nanda Putri", initials: "NP", trustScore: 79, trustLabel: "Baik", rating: 4.6, reviewCount: 15, completedJobs: 11, location: "Jebres, Solo", skills: ["Admin", "Marketplace", "Komunikasi"], phone: "628123456784", tone: "bg-[#f5e6e8] text-[#87505b]" },
  { id: "worker-5", name: "Agus Setiawan", initials: "AS", trustScore: 75, trustLabel: "Baik", rating: 4.4, reviewCount: 10, completedJobs: 8, location: "Pasar Kliwon, Solo", skills: ["Jahit", "Finishing", "Teliti"], phone: "628123456785", tone: "bg-[#e6ecdc] text-[#547039]" },
  { id: "worker-6", name: "Wulan Sari", initials: "WS", trustScore: 73, trustLabel: "Baik", rating: 4.3, reviewCount: 9, completedJobs: 7, location: "Laweyan, Solo", skills: ["Penjualan", "Kasir", "Ramah"], phone: "628123456786", tone: "bg-[#eee4f3] text-[#735483]" },
  { id: "worker-7", name: "Bagas Nugroho", initials: "BN", trustScore: 84, trustLabel: "Sangat Baik", rating: 4.8, reviewCount: 21, completedJobs: 17, location: "Jebres, Solo", skills: ["Kurir", "Navigasi", "Tepat Waktu"], phone: "628123456787", tone: "bg-[#e4ecdf] text-[#4d6f3c]" },
  { id: "worker-8", name: "Larasati Dewi", initials: "LD", trustScore: 78, trustLabel: "Baik", rating: 4.6, reviewCount: 13, completedJobs: 10, location: "Serengan, Solo", skills: ["Foto Produk", "Konten", "Kreatif"], phone: "628123456788", tone: "bg-[#f3e8d9] text-[#7e6039]" },
];

function createApplications(job: Job): JobApplication[] {
  return WORKERS.slice(0, Math.min(job.applicantCount, WORKERS.length)).map((applicant, index) => ({
    id: `${job.id}-application-${applicant.id}`,
    jobId: job.id,
    applicant,
    appliedAt: `2026-07-${String(21 - index).padStart(2, "0")}`,
    status: index < job.acceptedCount ? "Diterima" : "Menunggu Respons",
  }));
}

export const INITIAL_APPLICATIONS: Record<string, JobApplication[]> = Object.fromEntries(
  INITIAL_JOBS.map((job) => [job.id, createApplications(job)]),
);
