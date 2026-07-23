import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const { error } = await supabase.rpc("touch_current_user_presence");

  if (error) {
    return Response.json({ ok: false }, { status: 503 });
  }

  return Response.json({ ok: true });
}
