// Removes every artifact created by the write-flow QA run, restoring the project
// to its pre-test state (11 profiles / 45 activity logs / 1 job / 1 application / 0 pools).
// Usage: PGPASSWORD=... node scripts/qa/qa-cleanup.mjs inspect|clean
import { readFile } from "node:fs/promises";
import { Client } from "pg";
import { projectDir } from "./config.mjs";

const mode = process.argv.slice(2).find((arg) => arg === "clean" || arg === "inspect") ?? "inspect";
if (!projectDir) throw new Error("projectDir is required");

const url = new URL((await readFile(`${projectDir}/supabase/.temp/pooler-url`, "utf8")).trim());
url.password = encodeURIComponent(process.env.PGPASSWORD);
const client = new Client({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });
await client.connect();

const q = async (sql, params = []) => (await client.query(sql, params)).rows;
const count = async (sql, params = []) => (await q(sql, params))[0].n;

const qaUsers = await q(`select id, email from auth.users where email like 'qa.%@pull-qa.test' order by email`);
const ids = qaUsers.map((u) => u.id);
if (!ids.length) {
  console.log("No QA accounts found — nothing to clean.");
  await client.end();
  process.exit(0);
}
console.log("QA accounts:", qaUsers.map((u) => u.email).join(", "));

// Identify owned rows up front (needed for both inspect and clean)
const qaJobs = await q(`select id, title from public.job_postings where owner_id = any($1::uuid[])`, [ids]);
const qaPools = await q(`select id, item_name, hub from public.pools where owner_id = any($1::uuid[])`, [ids]);
const qaJobIds = qaJobs.map((r) => r.id);
const qaPoolIds = qaPools.map((r) => r.id);

const targets = [
  ["job_applications (dari lowongan QA)", `worker_id = any($1::uuid[]) or job_id = any($2::uuid[])`],
  ["job_postings", `owner_id = any($1::uuid[])`],
  ["pool_members", `pool_id = any($2::uuid[]) or member_id = any($1::uuid[])`],
  ["pool_join_history", `pool_id = any($2::uuid[]) or member_id = any($1::uuid[])`],
  ["pools", `owner_id = any($1::uuid[])`],
  ["supplier_offers", `supplier_id = any($1::uuid[])`],
  ["supplier_orders", `buyer_id = any($1::uuid[]) or supplier_id = any($1::uuid[])`],
  ["business_products", `owner_id = any($1::uuid[])`],
  ["notifications", `user_id = any($1::uuid[])`],
  ["notification_preferences", `user_id = any($1::uuid[])`],
  ["points_ledger", `profile_id = any($1::uuid[])`],
  ["impact_action_logs", `actor_id = any($1::uuid[])`],
  ["contact_redirect_logs", `viewer_id = any($1::uuid[]) or profile_id = any($1::uuid[])`],
  ["kyc_submissions", `user_id = any($1::uuid[])`],
  ["ratings", `rater_id = any($1::uuid[]) or rated_profile_id = any($1::uuid[])`],
  ["worker_certificates", `worker_id = any($1::uuid[])`],
  ["worker_portfolio", `worker_id = any($1::uuid[])`],
  ["worker_preferences", `user_id = any($1::uuid[])`],
  ["payment_transactions", `payer_id = any($1::uuid[]) or payee_id = any($1::uuid[])`],
  ["activity_logs", `actor_id = any($1::uuid[])`],
  ["profiles", `id = any($1::uuid[])`],
];

console.log(`\nAkan dihapus: ${qaJobs.length} lowongan, ${qaPools.length} pool`);
const EMPTY = ["00000000-0000-0000-0000-000000000000"];
const paramsFor = (where) => {
  const out = [ids];
  if (where.includes("$2")) out.push(qaJobIds.length ? qaJobIds : EMPTY);
  if (where.includes("$3")) out.push(qaPoolIds.length ? qaPoolIds : EMPTY);
  return out;
};

if (mode === "inspect") {
  for (const [label, where] of targets) {
    const table = label.split(" ")[0];
    const n = await count(`select count(*)::int n from public.${table} where ${where}`, paramsFor(where));
    if (n) console.log(`  ${label}: ${n}`);
  }
  console.log("\nBaseline sekarang — profiles:", await count(`select count(*)::int n from public.profiles`),
    "| activity_logs:", await count(`select count(*)::int n from public.activity_logs`),
    "| job_postings:", await count(`select count(*)::int n from public.job_postings`),
    "| job_applications:", await count(`select count(*)::int n from public.job_applications`),
    "| pools:", await count(`select count(*)::int n from public.pools`),
    "| supplier_offers:", await count(`select count(*)::int n from public.supplier_offers`));
  await client.end();
  process.exit(0);
}

// ---------- clean ----------
console.log("\n-- menghapus --");
await client.query("begin");
try {
  for (const [label, where] of targets) {
    const table = label.split(" ")[0];
    const r = await client.query(`delete from public.${table} where ${where}`, paramsFor(where));
    if (r.rowCount) console.log(`  ${label}: ${r.rowCount}`);
  }
  await client.query("commit");
} catch (error) {
  await client.query("rollback");
  throw error;
}

console.log("\n-- setelah dibersihkan --");
console.log("profiles:", await count(`select count(*)::int n from public.profiles`));
console.log("activity_logs:", await count(`select count(*)::int n from public.activity_logs`));
console.log("job_postings:", JSON.stringify(await q(`select title, status from public.job_postings order by created_at`)));
console.log("job_applications:", await count(`select count(*)::int n from public.job_applications`));
console.log("pools:", await count(`select count(*)::int n from public.pools`));
console.log("supplier_offers:", JSON.stringify(await q(`select item_name, unit_price from public.supplier_offers order by created_at`)));

await client.end();
