import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/utils/env";

export const createClient = () => {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseKey);
};
