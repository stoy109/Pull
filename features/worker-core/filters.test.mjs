import assert from "node:assert/strict";
import test from "node:test";
import { filterWorkerJobs, parseWorkerFilters, scoreWorkerJobMatches } from "./filters.ts";

const jobs = [
  {
    id: "job-1",
    title: "Staf Produksi",
    description: "Membantu pengemasan makanan",
    category: "Produksi",
    district: "Banjarsari",
    ownerName: "Dapur Solo",
  },
  {
    id: "job-2",
    title: "Kasir",
    description: "Melayani pelanggan",
    category: "Retail",
    district: "Laweyan",
    ownerName: "Toko Maju",
  },
];

test("worker filters sanitize input and clamp wages", () => {
  assert.deepEqual(
    parseWorkerFilters({ q: ["  dapur%_  ", "ignored"], category: " Retail ", minWage: "2000000000" }),
    { query: "dapur", category: "Retail", district: "", minWage: 1_000_000_000 },
  );
  assert.equal(parseWorkerFilters({ minWage: "invalid" }).minWage, undefined);
});

test("job search matches real job fields case-insensitively", () => {
  assert.deepEqual(filterWorkerJobs(jobs, "DAPUR").map((job) => job.id), ["job-1"]);
  assert.deepEqual(filterWorkerJobs(jobs, "laweyan").map((job) => job.id), ["job-2"]);
  assert.equal(filterWorkerJobs(jobs, "tidak ada").length, 0);
});

test("smart matching scores persisted preferences without fabricating jobs", () => {
  const matched = scoreWorkerJobMatches(
    jobs.map((job, index) => ({
      ...job,
      wageAmount: index === 0 ? 150_000 : 90_000,
      ownerVerified: index === 0,
      createdAt: `2026-07-2${index + 1}T00:00:00Z`,
    })),
    {
      availability: "available",
      preferredCategories: ["Produksi"],
      minimumWage: 100_000,
      radiusKm: 10,
    },
    { skills: ["pengemasan"], district: "Banjarsari", deliveryArea: null },
  );

  assert.equal(matched[0].id, "job-1");
  assert.equal(matched[0].matchScore, 100);
  assert.deepEqual(matched[0].matchReasons, [
    "Kategori sesuai preferensi",
    "Keahlian sesuai lowongan",
    "Upah memenuhi minimum",
    "Wilayah sesuai profil",
    "UMKM terverifikasi",
  ]);
  assert.equal(matched[1].matchScore, 0);
});
