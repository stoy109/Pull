export function requireDemoTarget(value, { allowRemote = false } = {}) {
  const url = URL.parse(value ?? "");
  if (!url || !["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL harus berupa URL HTTP(S) Supabase tanpa kredensial.");
  }

  if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return;
  if (allowRemote && url.protocol === "https:") return;

  throw new Error("Script demo hanya berjalan pada Supabase lokal secara default. Untuk project dev remote, periksa target lalu gunakan --allow-remote dengan URL HTTPS.");
}
