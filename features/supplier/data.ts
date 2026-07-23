import "server-only";

import { cache } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import {
  emptySupplierWorkspace,
  parseSupplierWorkspaceValue,
  type SupplierWorkspace,
} from "@/features/supplier/workspace";

export type SupplierDataStatus = "ready" | "setup-required" | "unavailable";

export function parseSupplierWorkspace(value: unknown) {
  return parseSupplierWorkspaceValue(value);
}

export type SupplierWorkspaceResult = {
  status: SupplierDataStatus;
  workspace: SupplierWorkspace;
  loadedAt: number;
};

export type SupplierNotification = {
  id: string;
  type: "jobs" | "pools" | "orders" | "ratings" | "system";
  title: string;
  body: string;
  readAt: string;
  createdAt: string;
};

export type SupplierNotificationPreferences = {
  inApp: boolean;
  jobs: boolean;
  pools: boolean;
  orders: boolean;
  ratings: boolean;
};

export type SupplierKycSubmission = {
  id: string;
  documentType: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_PREFERENCES: SupplierNotificationPreferences = {
  inApp: true,
  jobs: true,
  pools: true,
  orders: true,
  ratings: true,
};

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function bool(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

function setupStatus(error: { code?: string; message?: string } | null): SupplierDataStatus {
  if (!error) return "ready";
  const message = error.message?.toLowerCase() ?? "";
  return error.code === "PGRST202" || error.code === "42883" || error.code === "42P01" ||
    message.includes("get_supplier_workspace") || message.includes("does not exist")
    ? "setup-required"
    : "unavailable";
}

export const getSupplierWorkspace = cache(async (): Promise<SupplierWorkspaceResult> => {
  await requireRole(["supplier"]);
  const loadedAt = Date.now();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_supplier_workspace");
  if (error) return { status: setupStatus(error), workspace: emptySupplierWorkspace(), loadedAt };
  return { status: "ready", workspace: parseSupplierWorkspace(data), loadedAt };
});

export const getSupplierNotifications = cache(async (limit = 50): Promise<{
  status: SupplierDataStatus;
  notifications: SupplierNotification[];
}> => {
  await requireRole(["supplier"]);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_notifications", {
    notification_limit: Math.min(100, Math.max(1, Math.round(limit))),
    before_created_at: null,
  });
  if (error) return { status: setupStatus(error), notifications: [] };

  const notifications = (Array.isArray(data) ? data : []).map((value) => {
    const row = record(value);
    const rawType = text(row.notification_type);
    const type: SupplierNotification["type"] = rawType === "jobs" || rawType === "pools" ||
      rawType === "orders" || rawType === "ratings" ? rawType : "system";
    return {
      id: text(row.id),
      type,
      title: text(row.title),
      body: text(row.body),
      readAt: text(row.read_at),
      createdAt: text(row.created_at),
    };
  }).filter((item) => item.id);

  return { status: "ready", notifications };
});

export const getSupplierNotificationPreferences = cache(async (): Promise<{
  status: SupplierDataStatus;
  preferences: SupplierNotificationPreferences;
}> => {
  const { user } = await requireRole(["supplier"]);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("in_app_enabled,jobs_enabled,pools_enabled,orders_enabled,ratings_enabled")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return { status: setupStatus(error), preferences: { ...DEFAULT_PREFERENCES } };
  const row = record(data);
  return {
    status: "ready",
    preferences: {
      inApp: bool(row.in_app_enabled),
      jobs: bool(row.jobs_enabled),
      pools: bool(row.pools_enabled),
      orders: bool(row.orders_enabled),
      ratings: bool(row.ratings_enabled),
    },
  };
});

export const getSupplierKycSubmissions = cache(async (): Promise<{
  status: SupplierDataStatus;
  submissions: SupplierKycSubmission[];
}> => {
  const { user } = await requireRole(["supplier"]);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kyc_submissions")
    .select("id,document_type,status,rejection_reason,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return { status: setupStatus(error), submissions: [] };

  const submissions = (Array.isArray(data) ? data : []).map((value) => {
    const row = record(value);
    const rawStatus = text(row.status);
    const status: SupplierKycSubmission["status"] = rawStatus === "approved" || rawStatus === "rejected"
      ? rawStatus
      : "pending";
    return {
      id: text(row.id),
      documentType: text(row.document_type),
      status,
      rejectionReason: text(row.rejection_reason),
      createdAt: text(row.created_at),
      updatedAt: text(row.updated_at),
    };
  }).filter((item) => item.id);
  return { status: "ready", submissions };
});

export const getSupplierRatedOrderIds = cache(async (): Promise<Set<string>> => {
  const { user } = await requireRole(["supplier"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("ratings")
    .select("supplier_order_id")
    .eq("rater_id", user.id)
    .not("supplier_order_id", "is", null);
  return new Set((Array.isArray(data) ? data : []).map((value) => text(record(value).supplier_order_id)).filter(Boolean));
});
