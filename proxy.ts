import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  if (
    process.env.MVP_AUTH_MODE !== "false" ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.next({ request });
  }

  const { supabase, supabaseResponse } = createClient(request);

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
