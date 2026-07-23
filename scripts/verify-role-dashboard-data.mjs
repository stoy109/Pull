import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function parseEnv(content) {
  return Object.fromEntries(content.split(/\r?\n/).map((rawLine) => rawLine.trim()).filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => {
    const separator = line.indexOf("=");
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [key, value];
  }));
}

const [appEnv, adminEnv] = await Promise.all([
  readFile(resolve(process.cwd(), ".env.local"), "utf8").then(parseEnv),
  readFile(resolve(process.cwd(), ".env.admin.local"), "utf8").then(parseEnv),
]);

const url = appEnv.NEXT_PUBLIC_SUPABASE_URL;
const secret = adminEnv.SUPABASE_SECRET_KEY;
if (!url || !secret) throw new Error("URL atau secret key Supabase belum tersedia.");

const supabase = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
const roleCounts = {};
for (const role of ["admin", "umkm", "pekerja", "supplier"]) {
  const { count, error } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", role);
  if (error) throw error;
  roleCounts[role] = count ?? 0;
}

const checks = await Promise.all([
  supabase.from("job_postings").select("id,status").limit(1),
  supabase.from("job_applications").select("id,status,created_at,job_postings(title)").limit(1),
  supabase.from("supplier_offers").select("id,status").limit(1),
  supabase.from("activity_logs").select("id,event_type,category,description,status,created_at").limit(1),
]);

for (const check of checks) if (check.error) throw check.error;

console.log(JSON.stringify({ roleCounts, dashboardQueriesValid: true, businessRows: { jobs: checks[0].data.length, applications: checks[1].data.length, offers: checks[2].data.length, activities: checks[3].data.length } }));
