export type SupabaseErrorLike = {
  code?: string | null;
  message?: string | null;
};

const SETUP_ERROR_CODES = new Set([
  "42P01",
  "42703",
  "42883",
  "PGRST202",
  "PGRST204",
  "PGRST205",
]);

export const CORE_SETUP_MESSAGE =
  "Fitur inti UMKM belum siap. Terapkan migrations 202607230009, 202607230015, 202607230017, 202607230018, 202607230019, dan 202607230020 di Supabase, lalu muat ulang halaman ini.";

export function isCoreSetupError(error: SupabaseErrorLike | null | undefined) {
  if (!error) return false;
  if (error.code && SETUP_ERROR_CODES.has(error.code)) return true;
  const message = error.message?.toLowerCase() ?? "";
  return message.includes("schema cache") || message.includes("does not exist");
}

export function queryErrorMessage(
  error: SupabaseErrorLike | null | undefined,
  subject: string,
) {
  if (isCoreSetupError(error)) return CORE_SETUP_MESSAGE;
  return `${subject} belum dapat dimuat dari Supabase${error?.code ? ` (${error.code})` : ""}. Muat ulang halaman untuk mencoba lagi.`;
}
