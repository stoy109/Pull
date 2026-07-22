import assert from "node:assert/strict";
import test from "node:test";
import {
  buildApplicantWhatsAppUrl,
  getApplicantSummary,
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
