const requiredSupabaseEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

export function getSupabaseEnv() {
  const missingKeys = requiredSupabaseEnvKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Supabase environment variable(s): ${missingKeys.join(", ")}`,
    );
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  };
}

export function getSupabaseServiceRoleEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missingKeys = [
    !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Supabase environment variable(s): ${missingKeys.join(", ")}`,
    );
  }

  return {
    supabaseUrl: supabaseUrl as string,
    serviceRoleKey: serviceRoleKey as string,
  };
}
