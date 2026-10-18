const requiredSupabaseEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

/**
 * Phone verification depends on an SMS provider configured in Supabase.
 * While no provider is set up, every code request fails, so the banner and the
 * verification form are hidden instead of sending users into a dead end.
 * Flip NEXT_PUBLIC_PHONE_VERIFICATION_ENABLED to "true" once a provider exists.
 */
export function isPhoneVerificationEnabled() {
  return process.env.NEXT_PUBLIC_PHONE_VERIFICATION_ENABLED === "true";
}

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
