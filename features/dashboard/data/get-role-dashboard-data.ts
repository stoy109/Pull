import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { activityEventLabel, parseActivityStatus } from "@/lib/activity/events";
import { createClient } from "@/lib/supabase/server";

export type RoleActivityItem = {
  id: string;
  category: "Akun" | "Keamanan" | "Lamaran" | "Lowongan" | "Penawaran" | "Profil";
  title: string;
  detail: string;
  time: string;
  createdAt: string;
  icon: "badge" | "briefcase" | "check" | "shield" | "user";
  tone: "brand" | "muted" | "warm";
  read: true;
};

export type UmkmDashboardData = {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  activities: RoleActivityItem[];
};

export type WorkerApplicationItem = {
  id: string;
  company: string;
  role: string;
  time: string;
  appliedDate: string;
  status: string;
  location: string;
};

export type WorkerDashboardData = {
  totalApplications: number;
  activeApplicationCount: number;
  waitingApplicationCount: number;
  acceptedApplicationCount: number;
  applications: Record<"Dilamar" | "Ditinjau" | "Interview" | "Diterima" | "Selesai" | "Ditolak", WorkerApplicationItem[]>;
  activities: RoleActivityItem[];
};

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Waktu tidak tersedia" : `${dateTimeFormatter.format(date)} WIB`;
}

function activityPresentation(eventType: string, category: string) {
  if (eventType === "access.denied") {
    return { category: "Keamanan" as const, icon: "shield" as const, tone: "warm" as const };
  }
  if (eventType === "profile.updated") {
    return { category: "Profil" as const, icon: "user" as const, tone: "brand" as const };
  }
  if (eventType.startsWith("job.") || eventType === "application.accepted" || eventType === "application.rejected") {
    return { category: "Lowongan" as const, icon: "briefcase" as const, tone: "brand" as const };
  }
  if (eventType.startsWith("application.") || eventType === "work.confirmed" || eventType === "rating.submitted") {
    return { category: "Lamaran" as const, icon: "briefcase" as const, tone: "brand" as const };
  }
  if (eventType.startsWith("supplier.")) {
    return { category: "Penawaran" as const, icon: "badge" as const, tone: "brand" as const };
  }
  if (category === "security") {
    return { category: "Keamanan" as const, icon: "shield" as const, tone: "warm" as const };
  }
  return { category: "Akun" as const, icon: "check" as const, tone: "muted" as const };
}

async function getActivities(client: SupabaseClient, userId: string, limit = 12) {
  const { data, error } = await client
    .from("activity_logs")
    .select("id,event_type,category,description,status,created_at")
    .eq("actor_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Aktivitas role belum dapat dimuat (${error.code}).`);

  return (data ?? []).map((row) => {
    const presentation = activityPresentation(row.event_type, row.category);
    const status = parseActivityStatus(row.status);
    return {
      id: row.id,
      ...presentation,
      title: activityEventLabel(row.event_type),
      detail: row.description,
      time: formatTime(row.created_at),
      createdAt: row.created_at,
      read: true as const,
      ...(status === "success" ? {} : { tone: "warm" as const }),
    };
  });
}

export async function getUmkmDashboardData(userId: string): Promise<UmkmDashboardData> {
  const client = await createClient();
  const [{ data: jobs, error: jobsError }, activities] = await Promise.all([
    client
      .from("job_postings")
      .select("id,status")
      .eq("owner_id", userId),
    getActivities(client, userId),
  ]);

  if (jobsError) throw new Error(`Ringkasan lowongan belum dapat dimuat (${jobsError.code}).`);

  const jobRows = jobs ?? [];
  const jobIds = jobRows.map((job) => job.id);
  let applications: Array<{ status: string }> = [];

  if (jobIds.length) {
    const { data, error } = await client
      .from("job_applications")
      .select("status")
      .in("job_id", jobIds);
    if (error) throw new Error(`Ringkasan pelamar belum dapat dimuat (${error.code}).`);
    applications = data ?? [];
  }

  return {
    totalJobs: jobRows.length,
    activeJobs: jobRows.filter((job) => job.status === "published").length,
    totalApplications: applications.length,
    pendingApplications: applications.filter((application) => application.status === "submitted").length,
    activities,
  };
}

function applicationStage(status: string) {
  if (status === "accepted") return "Diterima" as const;
  if (status === "rejected" || status === "withdrawn") return "Ditolak" as const;
  return "Dilamar" as const;
}

function emptyApplicationGroups(): WorkerDashboardData["applications"] {
  return { Dilamar: [], Ditinjau: [], Interview: [], Diterima: [], Selesai: [], Ditolak: [] };
}

export async function getWorkerDashboardData(userId: string): Promise<WorkerDashboardData> {
  const client = await createClient();
  const [{ data, error }, activities] = await Promise.all([
    client
      .from("job_applications")
      .select("id,status,created_at,job_postings(title)")
      .eq("worker_id", userId)
      .order("created_at", { ascending: false }),
    getActivities(client, userId),
  ]);

  if (error) throw new Error(`Ringkasan lamaran belum dapat dimuat (${error.code}).`);

  const rows = data ?? [];
  const grouped = emptyApplicationGroups();

  for (const row of rows) {
    const relation = Array.isArray(row.job_postings) ? row.job_postings[0] : row.job_postings;
    const stage = applicationStage(row.status);
    grouped[stage].push({
      id: row.id,
      company: "UMKM Pull",
      role: relation?.title ?? "Lowongan Pull",
      time: formatTime(row.created_at),
      appliedDate: formatTime(row.created_at),
      status: row.status === "accepted" ? "Diterima" : row.status === "rejected" ? "Ditolak" : row.status === "withdrawn" ? "Ditarik" : "Lamaran terkirim",
      location: "Lokasi sesuai lowongan",
    });
  }

  return {
    totalApplications: rows.length,
    activeApplicationCount: rows.filter((row) => row.status === "submitted" || row.status === "accepted").length,
    waitingApplicationCount: rows.filter((row) => row.status === "submitted").length,
    acceptedApplicationCount: rows.filter((row) => row.status === "accepted").length,
    applications: grouped,
    activities,
  };
}

export async function getSupplierActivities(userId: string) {
  const client = await createClient();
  return getActivities(client, userId, 8);
}
