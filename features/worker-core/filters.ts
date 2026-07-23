import type { WorkerFilters, WorkerJob, WorkerPreferences, WorkerProfile } from "./types";

type SearchValue = string | string[] | undefined;

function first(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanFilter(value: SearchValue) {
  return (first(value) ?? "").trim().replace(/[%_]/g, "").slice(0, 80);
}

export function parseWorkerFilters(searchParams: Record<string, SearchValue>): WorkerFilters {
  const rawWage = first(searchParams.minWage)?.trim() ?? "";
  const parsedWage = rawWage ? Number(rawWage) : undefined;

  return {
    query: cleanFilter(searchParams.q),
    category: cleanFilter(searchParams.category),
    district: cleanFilter(searchParams.district),
    minWage:
      parsedWage !== undefined && Number.isFinite(parsedWage) && parsedWage >= 0
        ? Math.min(parsedWage, 1_000_000_000)
        : undefined,
    view: first(searchParams.view) === "map" ? "map" : "list",
  };
}

export function filterWorkerJobs(jobs: WorkerJob[], query: string) {
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  if (!normalized) return jobs;

  return jobs.filter((job) =>
    [job.title, job.description, job.category, job.district, job.ownerName]
      .filter(Boolean)
      .some((value) => value!.toLocaleLowerCase("id-ID").includes(normalized)),
  );
}

function normalized(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("id-ID") ?? "";
}

export function scoreWorkerJobMatches(
  jobs: WorkerJob[],
  preferences: WorkerPreferences,
  profile: WorkerProfile,
) {
  const preferredCategories = preferences.preferredCategories.map(normalized).filter(Boolean);
  const skills = profile.skills.map(normalized).filter(Boolean);
  const workerDistrict = normalized(profile.district || profile.deliveryArea);

  return jobs
    .map((job) => {
      const reasons: string[] = [];
      let matchScore = 0;
      const category = normalized(job.category);
      const jobText = normalized([job.title, job.category, job.description].filter(Boolean).join(" "));

      if (category && preferredCategories.some((value) => category.includes(value) || value.includes(category))) {
        matchScore += 40;
        reasons.push("Kategori sesuai preferensi");
      }
      if (skills.some((skill) => jobText.includes(skill))) {
        matchScore += 25;
        reasons.push("Keahlian sesuai lowongan");
      }
      if (
        preferences.minimumWage !== null &&
        job.wageAmount !== null &&
        job.wageAmount >= preferences.minimumWage
      ) {
        matchScore += 25;
        reasons.push("Upah memenuhi minimum");
      }
      if (workerDistrict && normalized(job.district).includes(workerDistrict)) {
        matchScore += 20;
        reasons.push("Wilayah sesuai profil");
      }
      if (job.ownerVerified) {
        matchScore += 15;
        reasons.push("UMKM terverifikasi");
      }

      return { ...job, matchScore: Math.min(matchScore, 100), matchReasons: reasons };
    })
    .sort((left, right) =>
      right.matchScore - left.matchScore || Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
}
