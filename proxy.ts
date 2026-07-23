import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
