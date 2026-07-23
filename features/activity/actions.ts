"use server";

import { randomUUID } from "node:crypto";
import { logActivity } from "@/lib/activity/log-activity";
import { requireRole } from "@/lib/auth/require-role";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function entityId(value?: string) {
  return value && UUID_PATTERN.test(value) ? value : randomUUID();
}

function clean(value: string, maxLength = 160) {
  return value.trim().slice(0, maxLength);
}

export async function createPoolAction(input: {
  poolId?: string;
  productName: string;
  category: string;
  targetQuantity: number;
  unit: string;
  deadline: string;
  district: string;
  poolLeader: string;
}) {
  const { user, role } = await requireRole(["umkm"]);
  const id = entityId(input.poolId);
  const quantity = Math.max(0, Math.round(Number(input.targetQuantity) || 0));
  if (!clean(input.productName) || !quantity) throw new Error("Data pool belum lengkap.");

  await logActivity({
    userId: user.id,
    role,
    action: "pool.create",
    entityType: "pool",
    entityId: id,
    metadata: {
      pool_id: id,
      product_name: clean(input.productName),
      category: clean(input.category, 80),
      target_quantity: quantity,
      current_quantity: 0,
      unit: clean(input.unit, 20),
      deadline_at: clean(input.deadline, 40),
      district: clean(input.district, 80),
      pool_leader: clean(input.poolLeader),
      whatsapp_masked: "Nomor disembunyikan",
      status: "waiting",
      detail: `${clean(input.productName)} · target ${quantity} ${clean(input.unit, 20)}`,
    },
  });

  return { id };
}

export async function joinPoolAction(input: {
  poolId?: string;
  poolReference: string;
  productName: string;
  quantity: number;
  unit: string;
}) {
  const { user, role } = await requireRole(["umkm"]);
  const id = entityId(input.poolId);
  const quantity = Math.max(0, Math.round(Number(input.quantity) || 0));
  if (!quantity) throw new Error("Jumlah pesanan pool tidak valid.");

  await logActivity({
    userId: user.id,
    role,
    action: "pool.join",
    entityType: "pool",
    entityId: id,
    metadata: {
      pool_reference: clean(input.poolReference, 80),
      product_name: clean(input.productName),
      quantity,
      unit: clean(input.unit, 20),
      detail: `Bergabung ke ${clean(input.productName)} sebanyak ${quantity} ${clean(input.unit, 20)}`,
    },
  });

  return { id };
}

export async function postJobAction(input: {
  jobId?: string;
  title: string;
  category: string;
  district: string;
  workerQuota: number;
  status: "draft" | "published";
}) {
  const { user, role } = await requireRole(["umkm"]);
  const id = entityId(input.jobId);
  if (!clean(input.title)) throw new Error("Judul lowongan wajib diisi.");
  const action = input.status === "published" ? "job.post" : "job.draft";

  await logActivity({
    userId: user.id,
    role,
    action,
    entityType: "job",
    entityId: id,
    metadata: {
      job_id: id,
      title: clean(input.title),
      category: clean(input.category, 80),
      district: clean(input.district, 80),
      worker_quota: Math.max(1, Math.round(Number(input.workerQuota) || 1)),
      status: input.status,
      detail: `${clean(input.title)} · ${clean(input.district, 80)}`,
    },
  });

  return { id };
}

export async function applyJobAction(input: {
  applicationId?: string;
  jobReference: string;
  jobTitle: string;
  employerName: string;
  ownerId?: string;
}) {
  const { user, role } = await requireRole(["pekerja"]);
  const id = entityId(input.applicationId);

  await logActivity({
    userId: user.id,
    role,
    action: "job.apply",
    entityType: "application",
    entityId: id,
    metadata: {
      application_id: id,
      job_reference: clean(input.jobReference, 80),
      job_title: clean(input.jobTitle),
      employer_name: clean(input.employerName),
      ...(input.ownerId && UUID_PATTERN.test(input.ownerId) ? { owner_id: input.ownerId } : {}),
      status: "submitted",
      detail: `${clean(input.jobTitle)} di ${clean(input.employerName)}`,
    },
  });

  return { id };
}

export async function updateProfileAction(input: {
  profileType: "business" | "worker" | "supplier";
  displayName?: string;
  businessName?: string;
}) {
  const { user, role } = await requireRole(["umkm", "pekerja", "supplier", "admin"]);

  await logActivity({
    userId: user.id,
    role,
    action: "profile.update",
    entityType: "profile",
    entityId: user.id,
    metadata: {
      profile_type: input.profileType,
      display_name: clean(input.displayName ?? ""),
      business_name: clean(input.businessName ?? ""),
      detail: "Informasi profil berhasil diperbarui.",
    },
  });
}
