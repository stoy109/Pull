import assert from "node:assert/strict";
import test from "node:test";
import {
  acceptJobApplication,
  buildApplicantWhatsAppUrl,
  cancelAcceptedJobApplication,
  canCancelAcceptedApplication,
  confirmAssignmentByEmployer,
  confirmAssignmentByWorker,
  deriveAssignmentStatus,
  deriveJobStatusFromAssignments,
  deriveOpenJobStatus,
  getApplicantSummary,
  submitAssignmentRating,
  updateApplicationStatus,
  validateJobForm,
} from "./recruitment-logic.ts";

const completeForm = {
  title: "Buruh Cuci Kain Batik",
  category: "Produksi Batik",
  district: "Laweyan",
  wage: "120000",
  duration: "3",
  startDate: "2026-07-25",
  endDate: "2026-07-27",
  workerQuota: "2",
  workHours: "08.00–17.00",
  description: "Membantu proses pencucian kain batik.",
  requirements: "Teliti dan cekatan.",
  whatsappContact: "081234567890",
};

test("draft hanya mewajibkan judul", () => {
  const errors = validateJobForm({ ...completeForm, category: "", district: "" }, "draft");
  assert.deepEqual(errors, {});
  assert.equal(validateJobForm({ ...completeForm, title: "" }, "draft").title, "Judul pekerjaan wajib diisi.");
});

test("posting memvalidasi field wajib dan rentang tanggal", () => {
  assert.deepEqual(validateJobForm(completeForm, "publish"), {});
  const errors = validateJobForm({ ...completeForm, category: "", endDate: "2026-07-20" }, "publish");
  assert.equal(errors.category, "Kategori pekerjaan wajib diisi.");
  assert.equal(errors.endDate, "Tanggal selesai tidak boleh sebelum tanggal mulai.");
});

test("URL WhatsApp tidak memutasi status lamaran", () => {
  const applications = [{ id: "app-1", status: "Menunggu Respons" }];
  const before = structuredClone(applications);
  const url = buildApplicantWhatsAppUrl({
    phone: "081234567890",
    applicantName: "Dimas Pratama",
    ownerName: "Bu Sari",
    businessName: "Batik Laweyan",
    jobTitle: "Buruh Cuci Kain Batik",
  });
  assert.match(url, /^https:\/\/wa\.me\/6281234567890\?text=/);
  assert.deepEqual(applications, before);
});

test("menolak pelamar menghasilkan state baru tanpa mengubah data awal", () => {
  const applications = [{ id: "app-1", status: "Menunggu Respons", applicant: { name: "Dimas" } }];
  const updated = updateApplicationStatus(applications, "app-1", "Ditolak");
  assert.equal(updated[0].status, "Ditolak");
  assert.equal(applications[0].status, "Menunggu Respons");
});

test("ringkasan pelamar memisahkan total, diterima, dan progress posisi", () => {
  const applications = [
    { id: "app-1", status: "Diterima" },
    { id: "app-2", status: "Menunggu Respons" },
    { id: "app-3", status: "Ditolak" },
  ];
  assert.deepEqual(getApplicantSummary(applications, 2), {
    total: 3,
    accepted: 1,
    remaining: 1,
    progress: 50,
  });
});

test("menerima pekerja memperbarui status aplikasi, posisi terisi, dan status lowongan", () => {
  const applications = [
    { id: "app-1", status: "Diterima", applicant: { name: "Siti" } },
    { id: "app-2", status: "Menunggu Respons", applicant: { name: "Dimas" } },
  ];
  const result = acceptJobApplication(applications, "app-2", 2, "2026-07-23");

  assert.equal(result.changed, true);
  assert.equal(result.acceptedCount, 2);
  assert.equal(result.applications[1].status, "Diterima");
  assert.equal(result.applications[1].acceptedAt, "2026-07-23");
  assert.equal(deriveOpenJobStatus("Terbuka", result.acceptedCount, 2), "Kuota Penuh");
  assert.equal(applications[1].status, "Menunggu Respons");
});

test("kuota penuh mencegah penerimaan tambahan dan tidak memutasi data", () => {
  const applications = [
    { id: "app-1", status: "Diterima" },
    { id: "app-2", status: "Menunggu Respons" },
  ];
  const result = acceptJobApplication(applications, "app-2", 1, "2026-07-23");

  assert.equal(result.changed, false);
  assert.equal(result.reason, "quota-full");
  assert.strictEqual(result.applications, applications);
  assert.equal(applications[1].status, "Menunggu Respons");
});

test("penerimaan idempotent dan tidak dapat dilakukan dua kali", () => {
  const applications = [{ id: "app-1", status: "Menunggu Respons" }];
  const first = acceptJobApplication(applications, "app-1", 2, "2026-07-23");
  const second = acceptJobApplication(first.applications, "app-1", 2, "2026-07-23");

  assert.equal(first.changed, true);
  assert.equal(second.changed, false);
  assert.equal(second.reason, "invalid-status");
  assert.equal(second.acceptedCount, 1);
});

test("membatalkan pekerja diterima membuka posisi kembali", () => {
  const applications = [
    { id: "app-1", status: "Diterima", acceptedAt: "2026-07-20" },
    { id: "app-2", status: "Diterima", acceptedAt: "2026-07-21" },
  ];
  const result = cancelAcceptedJobApplication(applications, "app-2", "2026-07-23");

  assert.equal(result.changed, true);
  assert.equal(result.acceptedCount, 1);
  assert.equal(result.applications[1].status, "Dibatalkan");
  assert.equal(result.applications[1].cancelledAt, "2026-07-23");
  assert.equal(deriveOpenJobStatus("Kuota Penuh", result.acceptedCount, 2), "Terbuka");
});

test("pembatalan penerimaan hanya tersedia sebelum tanggal mulai", () => {
  assert.equal(canCancelAcceptedApplication("2026-07-25", "2026-07-23"), true);
  assert.equal(canCancelAcceptedApplication("2026-07-25", "2026-07-25"), false);
  assert.equal(canCancelAcceptedApplication("2026-07-25", "2026-07-26"), false);
});

const assignmentJob = {
  id: "job-assignment",
  status: "Kuota Penuh",
  startDate: "2026-07-25",
  endDate: "2026-07-27",
  workerQuota: 1,
};

const baseAssignment = {
  id: "assignment-1",
  jobId: "job-assignment",
  applicationId: "application-1",
  workerId: "worker-1",
  acceptedAt: "2026-07-23",
};

test("status assignment berjalan bertahap mengikuti tanggal pekerjaan", () => {
  assert.equal(deriveAssignmentStatus(baseAssignment, assignmentJob, "2026-07-24"), "Akan Dimulai");
  assert.equal(deriveAssignmentStatus(baseAssignment, assignmentJob, "2026-07-25"), "Sedang Berlangsung");
  assert.equal(deriveAssignmentStatus(baseAssignment, assignmentJob, "2026-07-27"), "Sedang Berlangsung");
  assert.equal(deriveAssignmentStatus(baseAssignment, assignmentJob, "2026-07-28"), "Perlu Konfirmasi");
});

test("konfirmasi ditolak sebelum tanggal selesai dan tidak memutasi assignment", () => {
  const result = confirmAssignmentByEmployer(baseAssignment, assignmentJob, "2026-07-27");
  assert.equal(result.changed, false);
  assert.equal(result.reason, "too-early");
  assert.strictEqual(result.assignment, baseAssignment);
});

test("konfirmasi UMKM bersifat idempotent dan menunggu pekerja", () => {
  const first = confirmAssignmentByEmployer(baseAssignment, assignmentJob, "2026-07-28");
  const second = confirmAssignmentByEmployer(first.assignment, assignmentJob, "2026-07-29");

  assert.equal(first.changed, true);
  assert.equal(first.completed, false);
  assert.equal(deriveAssignmentStatus(first.assignment, assignmentJob, "2026-07-28"), "Menunggu Konfirmasi Pekerja");
  assert.equal(second.changed, false);
  assert.equal(second.reason, "already-confirmed");
});

test("pekerjaan selesai hanya setelah konfirmasi kedua pihak", () => {
  const workerConfirmation = confirmAssignmentByWorker(baseAssignment, assignmentJob, "2026-07-28");
  assert.equal(workerConfirmation.completed, false);
  const employerConfirmation = confirmAssignmentByEmployer(workerConfirmation.assignment, assignmentJob, "2026-07-28");

  assert.equal(employerConfirmation.changed, true);
  assert.equal(employerConfirmation.completed, true);
  assert.equal(employerConfirmation.assignment.completedAt, "2026-07-28");
  assert.equal(employerConfirmation.assignment.certificateIssuedAt, "2026-07-28");
  assert.equal(employerConfirmation.assignment.rewardsProcessedAt, "2026-07-28");
  assert.equal(deriveAssignmentStatus(employerConfirmation.assignment, assignmentJob, "2026-07-28"), "Selesai");
  assert.equal(deriveJobStatusFromAssignments(assignmentJob, [employerConfirmation.assignment], "2026-07-28"), "Selesai");
});

test("rating terkunci sebelum dua pihak menyelesaikan konfirmasi", () => {
  const result = submitAssignmentRating([], baseAssignment, { stars: 5, tags: ["Tepat waktu"], review: "Baik", createdAt: "2026-07-28" });
  assert.equal(result.changed, false);
  assert.equal(result.reason, "not-completed");
});

test("rating hanya dapat dikirim satu kali untuk assignment yang sama", () => {
  const completedAssignment = {
    ...baseAssignment,
    employerConfirmedAt: "2026-07-28",
    workerConfirmedAt: "2026-07-28",
    completedAt: "2026-07-28",
  };
  const first = submitAssignmentRating([], completedAssignment, { stars: 5, tags: ["Komunikasi baik", "Komunikasi baik"], review: "Sangat membantu.", createdAt: "2026-07-29" });
  const second = submitAssignmentRating(first.ratings, completedAssignment, { stars: 4, tags: [], review: "", createdAt: "2026-07-30" });

  assert.equal(first.changed, true);
  assert.deepEqual(first.rating.tags, ["Komunikasi baik"]);
  assert.equal(second.changed, false);
  assert.equal(second.reason, "already-rated");
});
