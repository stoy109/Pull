import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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
let { data: job, error: jobReadError } = await umkm.client.from("job_postings").select("id,title").eq("owner_id", umkm.user.id).eq("title", "Kru Packing Demo Pull").maybeSingle();
if (jobReadError) throw jobReadError;
let jobState = "reused";
if (!job) {
  const { data: jobId, error } = await umkm.client.rpc("create_job_posting", { job_title: "Kru Packing Demo Pull", job_description: "Membantu pengemasan produk UMKM untuk demonstrasi alur kolaborasi Pull." });
  if (error) throw error;
  job = { id: jobId, title: "Kru Packing Demo Pull" };
  jobState = "created";
}
await umkm.client.auth.signOut({ scope: "local" });

const worker = await login("demo.pekerja@pull.example.com");
const { data: existingApplication, error: applicationReadError } = await worker.client.from("job_applications").select("id").eq("job_id", job.id).eq("worker_id", worker.user.id).maybeSingle();
if (applicationReadError) throw applicationReadError;
let applicationState = "reused";
if (!existingApplication) {
  const { error } = await worker.client.rpc("submit_job_application", { target_job_id: job.id, application_message: "Saya siap membantu proses packing sesuai jadwal demo Pull." });
  if (error) throw error;
  applicationState = "created";
}
await worker.client.auth.signOut({ scope: "local" });

const supplier = await login("demo.supplier@pull.example.com");
const { data: existingOffer, error: offerReadError } = await supplier.client.from("supplier_offers").select("id").eq("supplier_id", supplier.user.id).eq("item_name", "Kardus Kemasan Demo").maybeSingle();
if (offerReadError) throw offerReadError;
let offerState = "reused";
if (!existingOffer) {
  const { error } = await supplier.client.rpc("create_supplier_offer", { offer_item_name: "Kardus Kemasan Demo", offer_unit: "pak", offer_unit_price: 75000 });
  if (error) throw error;
  offerState = "created";
}
await supplier.client.auth.signOut({ scope: "local" });

console.log(JSON.stringify({ job: jobState, application: applicationState, supplierOffer: offerState }));
