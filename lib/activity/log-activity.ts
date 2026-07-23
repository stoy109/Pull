import "server-only";

import { after } from "next/server";
import type { ActivityEventType } from "@/lib/activity/events";
import type { AppRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

const MAX_SAFE_METADATA_BYTES = 1024;

type ActivityMetadata = Record<string, unknown>;
const EVENT_BY_ACTION: Record<string, ActivityEventType> = {
  "auth.login": "auth.login_succeeded",
  "auth.logout": "auth.logout",
  "profile.update": "profile.updated",
  "role.set": "role.changed",
  "job.draft": "job.created",
  "job.post": "job.published",
  "job.apply": "application.submitted",
  "pool.create": "pool.created",
  "pool.join": "pool.joined",
  "supplier.offer": "supplier.offer_created",
};

export type LogActivityInput = {
  userId: string;
  role: AppRole;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: ActivityMetadata;
};

function sanitizeMetadata(metadata: ActivityMetadata): ActivityMetadata {
  const seen = new WeakSet<object>();
  const serialized = JSON.stringify(metadata, (_key, value: unknown) => {
    if (typeof value === "bigint") return value.toString();
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  });

  if (!serialized) return {};
  const normalized = JSON.parse(serialized) as ActivityMetadata;
  if (Buffer.byteLength(serialized, "utf8") <= MAX_SAFE_METADATA_BYTES) return normalized;

  const truncated: ActivityMetadata = { _truncated: true };
  for (const [key, value] of Object.entries(normalized)) {
    const candidate = { ...truncated, [key]: value };
    if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= MAX_SAFE_METADATA_BYTES) {
      truncated[key] = value;
    }
  }
  return truncated;
}

export async function logActivity({
  action,
  entityType,
  entityId,
  metadata = {},
}: LogActivityInput): Promise<void> {
  const eventType = EVENT_BY_ACTION[action];
  if (!eventType) {
    console.error(`Unsupported activity action: ${action}`);
    return;
  }

  const safeMetadata = sanitizeMetadata(metadata);
  const detail = typeof safeMetadata.detail === "string" && safeMetadata.detail.trim()
    ? safeMetadata.detail.trim()
    : action.replaceAll(".", " ");

  after(async () => {
    try {
      const supabase = await createClient();
      const { error } = await supabase.rpc("record_current_activity", {
        activity_event_type: eventType,
        activity_target_type: entityType ?? null,
        activity_target_id: entityId ?? null,
        activity_description: detail.slice(0, 500),
        activity_metadata: safeMetadata,
      });

      if (error) console.error("Failed to write activity log", error);
    } catch (error) {
      console.error("Failed to write activity log", error);
    }
  });
}
