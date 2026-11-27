import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { requireDemoTarget } from "./demo-target.mjs";

function parseEnv(content) {
  return Object.fromEntries(content.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => {
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
requireDemoTarget(url, { allowRemote: process.argv.slice(2).includes("--allow-remote") });
const key = appEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const password = adminEnv.ADMIN_TEMP_PASSWORD;
if (!url || !key || !password) throw new Error("Konfigurasi seed demo belum lengkap.");

const options = { auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false } };
async function login(email) {
  const client = createClient(url, key, options);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client, user: data.user };
}

const umkm = await login("demo.umkm@pull.example.com");
const jobTitle = "Kru Packing Demo Pull";
const jobDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
const { data: job, error: jobReadError } = await umkm.client.from("job_postings").select("id").eq("owner_id", umkm.user.id).eq("title", jobTitle).eq("status", "published").gte("end_date", jobDate).order("end_date", { ascending: false }).limit(1).maybeSingle();
if (jobReadError) throw jobReadError;
let jobId = job?.id;
let jobState = "reused";
if (!jobId) {
  const { data, error } = await umkm.client.rpc("create_full_job_posting", {
    job_title: jobTitle,
    job_description: "Membantu pengemasan produk UMKM untuk demonstrasi alur kolaborasi Pull.",
    job_category: "Produksi",
    job_district: "Bantul",
    job_wage: 150000,
    job_wage_unit: "per hari",
    job_duration_days: 1,
    job_start_date: jobDate,
    job_end_date: jobDate,
    job_quota: 2,
    job_hours_per_day: 8,
    job_status: "published",
  });
  if (error) throw error;
  jobId = data;
  jobState = "created";
}
await umkm.client.auth.signOut({ scope: "local" });

const worker = await login("demo.pekerja@pull.example.com");
const { data: existingApplication, error: applicationReadError } = await worker.client.from("job_applications").select("id").eq("job_id", jobId).eq("worker_id", worker.user.id).maybeSingle();
if (applicationReadError) throw applicationReadError;
let applicationState = "reused";
if (!existingApplication) {
  const { error } = await worker.client.rpc("submit_job_application", { target_job_id: jobId, application_message: "Saya siap membantu proses packing sesuai jadwal demo Pull." });
  if (error) throw error;
  applicationState = "created";
}
await worker.client.auth.signOut({ scope: "local" });

const supplier = await login("demo.supplier@pull.example.com");
const { data: existingOffer, error: offerReadError } = await supplier.client.from("supplier_offers").select("id").eq("supplier_id", supplier.user.id).is("pool_id", null).eq("status", "active").limit(1).maybeSingle();
if (offerReadError) throw offerReadError;
let offerState = "reused";
if (!existingOffer) {
  const { error } = await supplier.client.rpc("upsert_supplier_product", {
    offer_item_name: "Kardus Kemasan Demo",
    offer_unit: "pak",
    offer_unit_price: 75000,
    offer_stock_quantity: 100,
    offer_min_order_quantity: 10,
    offer_category: "Kemasan",
  });
  if (error) throw error;
  offerState = "created";
}
await supplier.client.auth.signOut({ scope: "local" });

console.log(JSON.stringify({ job: jobState, application: applicationState, supplierOffer: offerState }));
