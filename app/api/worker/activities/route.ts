import { applyJobAction } from "@/features/activity/actions";
import { getRecentActivities } from "@/lib/activity/queries";
import { createClient } from "@/lib/supabase/server";

const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

export const dynamic = "force-dynamic";

async function getWorkerUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, status: 401 };
  if (user.user_metadata?.role !== "pekerja") {
    return { user: null, status: 403 };
  }
  return { user, status: 200 };
}

export async function GET() {
  const auth = await getWorkerUser();
  if (!auth.user) {
    return Response.json(
      { error: auth.status === 401 ? "Autentikasi diperlukan." : "Akses ditolak." },
      { status: auth.status, headers: noStoreHeaders },
    );
  }

  try {
    const activities = await getRecentActivities({
      userIdFilter: auth.user.id,
      limit: 50,
    });
    return Response.json(activities, { headers: noStoreHeaders });
  } catch {
    return Response.json(
      { error: "Gagal memuat aktivitas." },
      { status: 500, headers: noStoreHeaders },
    );
  }
}

export async function POST(request: Request) {
  const auth = await getWorkerUser();
  if (!auth.user) {
    return Response.json(
      { error: auth.status === 401 ? "Autentikasi diperlukan." : "Akses ditolak." },
      { status: auth.status, headers: noStoreHeaders },
    );
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (
    !body ||
    typeof body.jobReference !== "string" ||
    typeof body.jobTitle !== "string" ||
    typeof body.employerName !== "string"
  ) {
    return Response.json(
      { error: "Data lamaran tidak valid." },
      { status: 400, headers: noStoreHeaders },
    );
  }

  try {
    const result = await applyJobAction({
      applicationId: typeof body.applicationId === "string" ? body.applicationId : undefined,
      jobReference: body.jobReference,
      jobTitle: body.jobTitle,
      employerName: body.employerName,
    });
    return Response.json(result, { status: 201, headers: noStoreHeaders });
  } catch {
    return Response.json(
      { error: "Gagal mencatat lamaran." },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
