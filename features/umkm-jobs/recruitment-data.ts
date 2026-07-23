import type { Applicant, Job, JobApplication, JobAssignment } from "./recruitment-types";

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
    wage: 130000, duration: 2, startDate: "2026-07-18", endDate: "2026-07-19", workHours: "09.00–17.00",
    status: "Perlu Konfirmasi", acceptedCount: 2, workerQuota: 2, applicantCount: 3,
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

function createApplicant(base: Omit<Applicant, "bio" | "joinedAt" | "completionRate" | "cancellationRate" | "languages" | "workHistory" | "reviews" | "certificates" | "portfolio"> & { bio: string }): Applicant {
  const primarySkill = base.skills[0];
  return {
    ...base,
    joinedAt: "2024-06-12",
    completionRate: Math.min(99, 88 + Math.round(base.trustScore / 10)),
    cancellationRate: base.trustScore >= 80 ? 0 : 2,
    languages: ["Indonesia", "Jawa"],
    workHistory: [
      { id: `${base.id}-work-1`, title: primarySkill, businessName: "Batik Laweyan Bu Sari", completedAt: "2026-07-08", rating: base.rating >= 4.8 ? 5 : base.rating },
      { id: `${base.id}-work-2`, title: base.skills[1] ?? primarySkill, businessName: "Batik Makmur", completedAt: "2026-06-22", rating: Math.max(4.2, base.rating - 0.2) },
      { id: `${base.id}-work-3`, title: base.skills[2] ?? primarySkill, businessName: "UMKM Solo Raya", completedAt: "2026-05-18", rating: Math.max(4.3, base.rating - 0.1) },
    ],
    reviews: [
      { id: `${base.id}-review-1`, businessName: "Batik Makmur", comment: "Pekerjaan rapi, teliti, dan tepat waktu. Komunikasi juga baik.", rating: 5, createdAt: "2026-07-08" },
      { id: `${base.id}-review-2`, businessName: "UMKM Solo Raya", comment: "Cepat beradaptasi dengan arahan dan bertanggung jawab selama pekerjaan.", rating: Math.max(4, Math.round(base.rating)), createdAt: "2026-06-22" },
    ],
    certificates: [
      { id: `${base.id}-certificate-1`, title: `Sertifikat Kerja Digital - ${primarySkill}`, issuedAt: "2026-07-08" },
      { id: `${base.id}-certificate-2`, title: "Sertifikat Pekerja Tepercaya Pull", issuedAt: "2026-05-18" },
    ],
    portfolio: [
      { id: `${base.id}-portfolio-1`, title: `Hasil kerja ${primarySkill.toLocaleLowerCase("id-ID")}`, category: primarySkill },
      { id: `${base.id}-portfolio-2`, title: `Dokumentasi ${base.skills[1]?.toLocaleLowerCase("id-ID") ?? "pekerjaan harian"}`, category: base.skills[1] ?? "Pekerjaan Harian" },
    ],
  };
}

const WORKERS: Applicant[] = [
  createApplicant({ id: "worker-1", name: "Dimas Pratama", initials: "DP", trustScore: 82, trustLabel: "Sangat Baik", rating: 4.7, reviewCount: 18, completedJobs: 14, location: "Laweyan, Solo", skills: ["Mencuci Kain", "Teliti", "Cepat"], phone: "628123456781", tone: "bg-[#dfe9df] text-[#315746]", bio: "Berpengalaman dalam pekerjaan cuci kain dan penanganan batik. Teliti, disiplin, serta terbiasa mengikuti standar kerja produksi." }),
  createApplicant({ id: "worker-2", name: "Siti Nur Aini", initials: "SN", trustScore: 76, trustLabel: "Baik", rating: 4.5, reviewCount: 12, completedJobs: 9, location: "Serengan, Solo", skills: ["Pewarnaan", "Teliti", "Rajin"], phone: "628123456782", tone: "bg-[#f5e7dc] text-[#885d43]", bio: "Terbiasa membantu proses pewarnaan kain serta menjaga kerapian area kerja. Rajin dan mudah mengikuti arahan." }),
  createApplicant({ id: "worker-3", name: "Rizky Maulana", initials: "RM", trustScore: 88, trustLabel: "Sangat Baik", rating: 4.9, reviewCount: 27, completedJobs: 21, location: "Banjarsari, Solo", skills: ["Packing", "Gudang", "Cekatan"], phone: "628123456783", tone: "bg-[#e0e8f4] text-[#3f5f86]", bio: "Pekerja gudang berpengalaman yang cekatan dalam pengecekan stok, pengemasan, dan persiapan pengiriman." }),
  createApplicant({ id: "worker-4", name: "Nanda Putri", initials: "NP", trustScore: 79, trustLabel: "Baik", rating: 4.6, reviewCount: 15, completedJobs: 11, location: "Jebres, Solo", skills: ["Admin", "Marketplace", "Komunikasi"], phone: "628123456784", tone: "bg-[#f5e6e8] text-[#87505b]", bio: "Terampil mengelola pesanan marketplace, membalas pelanggan, dan membuat pencatatan administrasi sederhana." }),
  createApplicant({ id: "worker-5", name: "Agus Setiawan", initials: "AS", trustScore: 75, trustLabel: "Baik", rating: 4.4, reviewCount: 10, completedJobs: 8, location: "Pasar Kliwon, Solo", skills: ["Jahit", "Finishing", "Teliti"], phone: "628123456785", tone: "bg-[#e6ecdc] text-[#547039]", bio: "Menguasai jahit dasar dan finishing produk tekstil. Teliti saat memeriksa pola, benang, dan kualitas hasil jahitan." }),
  createApplicant({ id: "worker-6", name: "Wulan Sari", initials: "WS", trustScore: 73, trustLabel: "Baik", rating: 4.3, reviewCount: 9, completedJobs: 7, location: "Laweyan, Solo", skills: ["Penjualan", "Kasir", "Ramah"], phone: "628123456786", tone: "bg-[#eee4f3] text-[#735483]", bio: "Komunikatif dan ramah dalam melayani pelanggan. Terbiasa menjaga booth, kasir, dan display produk UMKM." }),
  createApplicant({ id: "worker-7", name: "Bagas Nugroho", initials: "BN", trustScore: 84, trustLabel: "Sangat Baik", rating: 4.8, reviewCount: 21, completedJobs: 17, location: "Jebres, Solo", skills: ["Kurir", "Navigasi", "Tepat Waktu"], phone: "628123456787", tone: "bg-[#e4ecdf] text-[#4d6f3c]", bio: "Kurir lokal yang memahami area Solo Raya, disiplin terhadap jadwal, dan berpengalaman menangani barang UMKM." }),
  createApplicant({ id: "worker-8", name: "Larasati Dewi", initials: "LD", trustScore: 78, trustLabel: "Baik", rating: 4.6, reviewCount: 13, completedJobs: 10, location: "Serengan, Solo", skills: ["Foto Produk", "Konten", "Kreatif"], phone: "628123456788", tone: "bg-[#f3e8d9] text-[#7e6039]", bio: "Kreator konten produk yang berpengalaman membuat foto katalog sederhana dan materi media sosial untuk UMKM." }),
];

function createApplications(job: Job): JobApplication[] {
  return WORKERS.slice(0, Math.min(job.applicantCount, WORKERS.length)).map((applicant, index) => ({
    id: `${job.id}-application-${applicant.id}`,
    jobId: job.id,
    applicant,
    appliedAt: `2026-07-${String(21 - index).padStart(2, "0")}`,
    status: index < job.acceptedCount ? "Diterima" : "Menunggu Respons",
    acceptedAt: index < job.acceptedCount ? (job.id === "job-3" ? "2026-07-16" : "2026-07-20") : undefined,
  }));
}

export const INITIAL_APPLICATIONS: Record<string, JobApplication[]> = Object.fromEntries(
  INITIAL_JOBS.map((job) => [job.id, createApplications(job)]),
);

function createAssignments(job: Job, applications: JobApplication[]): JobAssignment[] {
  return applications
    .filter((application) => application.status === "Diterima")
    .map((application, index) => {
      const isConfirmationDemo = job.id === "job-3";
      const bothConfirmed = isConfirmationDemo && index === 1;
      return {
        id: `${job.id}-assignment-${application.applicant.id}`,
        jobId: job.id,
        applicationId: application.id,
        workerId: application.applicant.id,
        acceptedAt: application.acceptedAt ?? "2026-07-20",
        employerConfirmedAt: bothConfirmed ? "2026-07-21" : undefined,
        workerConfirmedAt: isConfirmationDemo ? "2026-07-21" : undefined,
        completedAt: bothConfirmed ? "2026-07-21" : undefined,
        certificateIssuedAt: bothConfirmed ? "2026-07-21" : undefined,
        rewardsProcessedAt: bothConfirmed ? "2026-07-21" : undefined,
      };
    });
}

export const INITIAL_ASSIGNMENTS: Record<string, JobAssignment[]> = Object.fromEntries(
  INITIAL_JOBS.map((job) => [job.id, createAssignments(job, INITIAL_APPLICATIONS[job.id] ?? [])]),
);
