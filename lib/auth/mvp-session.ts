import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { Role } from "@/lib/auth/roles";

const COOKIE_NAME = "pull_mvp_session";

export type MvpSession = {
  id: string;
  email: string;
  role: Role | null;
  userMetadata: Record<string, unknown>;
};

export function isMvpAuthEnabled() {
  return (
    process.env.MVP_AUTH_MODE !== "false" ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function encodeSession(session: MvpSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string): MvpSession | null {
  try {
    const session = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as MvpSession;
    return session.id && session.email && session.userMetadata ? session : null;
  } catch {
    return null;
  }
}

export async function getMvpSession() {
  if (!isMvpAuthEnabled()) return null;
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return value ? decodeSession(value) : null;
}

export async function setMvpSession(session: MvpSession) {
  (await cookies()).set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function createMvpSession(email: string, fullName: string) {
  const session: MvpSession = {
    id: randomUUID(),
    email,
    role: null,
    userMetadata: { full_name: fullName, onboarding_step: "role" },
  };
  await setMvpSession(session);
  return session;
}

export async function clearMvpSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export function mvpSessionToUser(session: MvpSession) {
  return {
    id: session.id,
    email: session.email,
    user_metadata: {
      ...session.userMetadata,
      ...(session.role ? { role: session.role } : {}),
    },
  };
}
