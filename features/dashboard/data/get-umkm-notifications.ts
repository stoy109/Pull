import "server-only";

import { cache } from "react";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type UmkmNotificationType = "jobs" | "pools" | "orders" | "ratings" | "system";

export type UmkmNotification = {
  id: string;
  type: UmkmNotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type UmkmNotificationStatus = "ready" | "setup-required" | "unavailable";

export type UmkmNotificationResult = {
  status: UmkmNotificationStatus;
  notifications: UmkmNotification[];
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function parseType(value: string): UmkmNotificationType {
  return value === "jobs" || value === "pools" || value === "orders" || value === "ratings"
    ? value
    : "system";
}

/**
 * Reads the caller's own notifications through `get_my_notifications`, which is
 * scoped to `auth.uid()` inside the database. Mirrors the supplier workspace so
 * both roles see the same feed.
 */
export const getUmkmNotifications = cache(async (limit = 100): Promise<UmkmNotificationResult> => {
  await requireRole("umkm");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_notifications", {
    notification_limit: Math.min(100, Math.max(1, Math.round(limit))),
    before_created_at: null,
  });

  if (error) {
    // PGRST202 / 42883 mean the RPC is missing, i.e. migrations are behind.
    const missing = error.code === "PGRST202" || error.code === "42883";
    return { status: missing ? "setup-required" : "unavailable", notifications: [] };
  }

  const notifications = (Array.isArray(data) ? data : [])
    .map((value) => {
      const row = record(value);
      const readAt = text(row.read_at);
      return {
        id: text(row.id),
        type: parseType(text(row.notification_type)),
        title: text(row.title),
        body: text(row.body),
        readAt: readAt || null,
        createdAt: text(row.created_at),
      };
    })
    .filter((item) => item.id);

  return { status: "ready", notifications };
});
