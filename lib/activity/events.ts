import type { AppRole } from "@/lib/auth/roles";

export const ACTIVITY_EVENT_TYPES = [
  "auth.login_succeeded",
  "auth.logout",
  "profile.updated",
  "account.suspended",
  "account.reactivated",
  "role.changed",
  "access.denied",
  "job.created",
  "job.published",
  "job.updated",
  "application.accepted",
  "application.rejected",
  "assignment.completed",
  "application.submitted",
  "application.withdrawn",
  "work.confirmed",
  "rating.submitted",
  "pool.created",
  "pool.joined",
  "pool.status_changed",
  "supplier.offer_created",
  "supplier.order_status_changed",
] as const;

export const ACTIVITY_STATUSES = ["success", "failed", "denied"] as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

type ActivityPresentation = {
  label: string;
  roleFallback: AppRole | null;
};

const ACTIVITY_PRESENTATION: Record<ActivityEventType, ActivityPresentation> = {
  "auth.login_succeeded": { label: "Berhasil masuk", roleFallback: null },
  "auth.logout": { label: "Keluar dari akun", roleFallback: null },
  "profile.updated": { label: "Memperbarui profil", roleFallback: null },
  "account.suspended": { label: "Menangguhkan akun", roleFallback: "admin" },
  "account.reactivated": { label: "Mengaktifkan kembali akun", roleFallback: "admin" },
  "role.changed": { label: "Menetapkan peran akun", roleFallback: null },
  "access.denied": { label: "Akses ditolak", roleFallback: null },
  "job.created": { label: "Membuat lowongan", roleFallback: "umkm" },
  "job.published": { label: "Menerbitkan lowongan", roleFallback: "umkm" },
  "job.updated": { label: "Memperbarui lowongan", roleFallback: "umkm" },
  "application.accepted": { label: "Menerima pelamar", roleFallback: "umkm" },
  "application.rejected": { label: "Menolak pelamar", roleFallback: "umkm" },
  "assignment.completed": { label: "Menyelesaikan penugasan", roleFallback: "umkm" },
  "application.submitted": { label: "Mengirim lamaran", roleFallback: "pekerja" },
  "application.withdrawn": { label: "Menarik lamaran", roleFallback: "pekerja" },
  "work.confirmed": { label: "Mengonfirmasi pekerjaan", roleFallback: "pekerja" },
  "rating.submitted": { label: "Memberikan rating", roleFallback: "pekerja" },
  "pool.created": { label: "Membuat pool", roleFallback: "umkm" },
  "pool.joined": { label: "Bergabung ke pool", roleFallback: "umkm" },
  "pool.status_changed": { label: "Memperbarui status pool", roleFallback: "umkm" },
  "supplier.offer_created": { label: "Membuat penawaran", roleFallback: "supplier" },
  "supplier.order_status_changed": { label: "Memperbarui pesanan", roleFallback: "supplier" },
};

export function parseActivityEventType(value: unknown): ActivityEventType | null {
  return typeof value === "string" && ACTIVITY_EVENT_TYPES.includes(value as ActivityEventType)
    ? (value as ActivityEventType)
    : null;
}

export function parseActivityStatus(value: unknown): ActivityStatus {
  return ACTIVITY_STATUSES.includes(value as ActivityStatus)
    ? (value as ActivityStatus)
    : "failed";
}

export function activityEventLabel(value: unknown) {
  const eventType = parseActivityEventType(value);
  return eventType ? ACTIVITY_PRESENTATION[eventType].label : "Aktivitas sistem";
}

export function expectedRoleForActivity(value: unknown) {
  const eventType = parseActivityEventType(value);
  return eventType ? ACTIVITY_PRESENTATION[eventType].roleFallback : null;
}

