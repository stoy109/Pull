import "server-only";

import { isIP } from "node:net";
import { headers } from "next/headers";
import { after } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { isMvpAuthEnabled } from "@/lib/auth/mvp-session";

const MAX_SAFE_METADATA_BYTES = 1024;

type ActivityMetadata = Record<string, unknown>;

export type LogActivityInput = {
  userId: string;
  role: string;
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
  if (Buffer.byteLength(serialized, "utf8") <= MAX_SAFE_METADATA_BYTES) {
    return normalized;
  }

  const truncated: ActivityMetadata = { _truncated: true };
  for (const [key, value] of Object.entries(normalized)) {
    const candidate = { ...truncated, [key]: value };
    if (
      Buffer.byteLength(JSON.stringify(candidate), "utf8") <=
      MAX_SAFE_METADATA_BYTES
    ) {
      truncated[key] = value;
    }
  }

  return truncated;
}

function readClientIp(requestHeaders: Headers) {
  const candidates = [
    requestHeaders.get("cf-connecting-ip"),
    requestHeaders.get("x-real-ip"),
    requestHeaders.get("x-forwarded-for")?.split(",", 1)[0],
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && isIP(value)) return value;
  }

  return null;
}

export async function logActivity({
  userId,
  role,
  action,
  entityType,
  entityId,
  metadata = {},
}: LogActivityInput): Promise<void> {
  if (isMvpAuthEnabled()) return;

  let ipAddress: string | null = null;
  let userAgent: string | null = null;

  try {
    const requestHeaders = await headers();
    ipAddress = readClientIp(requestHeaders);
    userAgent = requestHeaders.get("user-agent")?.slice(0, 1024) ?? null;
  } catch {
    // Request headers tidak selalu tersedia di luar request lifecycle.
  }

  try {
    const safeMetadata = sanitizeMetadata(metadata);
    after(async () => {
      try {
        const supabase = createServiceRoleClient();
        const { error } = await supabase.from("activity_logs").insert({
          user_id: userId,
          role,
          action: action.slice(0, 200),
          entity_type: entityType ?? null,
          entity_id: entityId ?? null,
          metadata: safeMetadata,
          ip: ipAddress,
          user_agent: userAgent,
        });

        if (error) console.error("Failed to write activity log", error);
      } catch (error) {
        console.error("Failed to write activity log", error);
      }
    });
  } catch (error) {
    console.error("Failed to schedule activity log", error);
  }
}
