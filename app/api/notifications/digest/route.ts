import { NextResponse } from "next/server";

import { isEmailEnabled, sendEmail } from "@/lib/notifications/email";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Sends one digest per user for notifications that have not been mailed yet.
 *
 * Runs without a user session, so it authenticates with CRON_SECRET and reads
 * across users with the service role. Every guard fails closed: no secret means
 * 503, a wrong secret means 401, and no provider means nothing is marked as
 * sent so the rows stay queued for when e-mail is configured.
 */

const BATCH_SIZE = 200;
const MAX_ITEMS_PER_EMAIL = 10;

const TYPE_LABEL: Record<string, string> = {
  jobs: "Lowongan",
  pools: "Pool",
  orders: "Pesanan",
  ratings: "Penilaian",
  system: "Sistem",
};

type PendingNotification = {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  notification_type: string;
  title: string;
  body: string;
  created_at: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function authorise(request: Request): "ok" | "denied" | "unconfigured" {
  const secret = process.env.CRON_SECRET;

  if (!secret) return "unconfigured";
  return request.headers.get("authorization") === `Bearer ${secret}` ? "ok" : "denied";
}

function buildDigest(items: PendingNotification[], displayName: string | null) {
  const shown = items.slice(0, MAX_ITEMS_PER_EMAIL);
  const remaining = items.length - shown.length;
  const greeting = displayName ? `Halo ${displayName},` : "Halo,";
  const subject =
    items.length === 1
      ? `Pull: ${items[0].title}`
      : `Pull: ${items.length} pembaruan baru`;

  const text = [
    greeting,
    "",
    `Ada ${items.length} pembaruan di akun Pull Anda:`,
    "",
    ...shown.map((item) => `- [${TYPE_LABEL[item.notification_type] ?? "Info"}] ${item.title}\n  ${item.body}`),
    ...(remaining > 0 ? ["", `dan ${remaining} pembaruan lainnya.`] : []),
    "",
    "Buka kotak masuk Pull untuk melihat semuanya.",
  ].join("\n");

  const rows = shown
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e6ece8;">
            <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#507f63;">
              ${escapeHtml(TYPE_LABEL[item.notification_type] ?? "Info")}
            </div>
            <div style="margin-top:4px;font-size:15px;font-weight:700;color:#0c261c;">
              ${escapeHtml(item.title)}
            </div>
            <div style="margin-top:4px;font-size:13px;line-height:1.6;color:#6b7b75;">
              ${escapeHtml(item.body)}
            </div>
          </td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="id">
  <body style="margin:0;background:#f4f7f4;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#0c261c;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #dce7e1;border-radius:20px;padding:24px;">
        <div style="font-size:13px;font-weight:800;color:#087447;">Pull</div>
        <p style="margin:16px 0 0;font-size:14px;">${escapeHtml(greeting)}</p>
        <p style="margin:8px 0 0;font-size:14px;color:#6b7b75;">
          Ada ${items.length} pembaruan di akun Pull Anda.
        </p>
        <table role="presentation" width="100%" style="margin-top:16px;border-collapse:collapse;">
          ${rows}
        </table>
        ${
          remaining > 0
            ? `<p style="margin:16px 0 0;font-size:13px;color:#6b7b75;">dan ${remaining} pembaruan lainnya.</p>`
            : ""
        }
        <p style="margin:20px 0 0;font-size:12px;color:#8a9a94;">
          Anda menerima surel ini karena notifikasi e-mail aktif di pengaturan Pull.
        </p>
      </div>
    </div>
  </body>
</html>`;

  return { subject, html, text };
}

export async function GET(request: Request) {
  const auth = authorise(request);

  if (auth === "unconfigured") {
    return NextResponse.json(
      { skipped: "cron-secret-not-configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (auth === "denied") {
    return NextResponse.json(
      { error: "Tidak diizinkan." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!isEmailEnabled()) {
    return NextResponse.json(
      { skipped: "email-provider-not-configured" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json(
      { skipped: "service-role-key-not-configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { data, error } = await supabase.rpc("list_pending_notifications", {
    batch_size: BATCH_SIZE,
  });

  if (error) {
    return NextResponse.json(
      { error: "Gagal membaca notifikasi yang belum terkirim." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const rows = (data ?? []) as PendingNotification[];

  if (rows.length === 0) {
    return NextResponse.json(
      { pending: 0, users: 0, sent: 0, failed: 0 },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const byUser = new Map<string, PendingNotification[]>();
  for (const row of rows) {
    const bucket = byUser.get(row.user_id);
    if (bucket) bucket.push(row);
    else byUser.set(row.user_id, [row]);
  }

  const deliveredIds: string[] = [];
  let sent = 0;
  let failed = 0;

  for (const items of byUser.values()) {
    const email = items[0].email;
    if (!email) continue;

    const digest = buildDigest(items, items[0].display_name);
    const result = await sendEmail({ to: email, ...digest });

    if (result.ok) {
      sent += 1;
      deliveredIds.push(...items.map((item) => item.id));
    } else {
      failed += 1;
    }
  }

  // Stamped only after the provider accepted the message, so a provider outage
  // leaves the rows queued instead of silently dropping them.
  if (deliveredIds.length > 0) {
    await supabase.rpc("mark_notifications_emailed", { target_ids: deliveredIds });
  }

  return NextResponse.json(
    { pending: rows.length, users: byUser.size, sent, failed },
    { headers: { "Cache-Control": "no-store" } },
  );
}
