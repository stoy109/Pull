// Creates throwaway QA accounts in the linked project and assigns their roles.
// Usage: SUPABASE_URL=... SERVICE_ROLE=... PGPASSWORD=... node scripts/qa/qa-users.mjs create|delete
import { readFile } from "node:fs/promises";
import { Client } from "pg";
import { projectDir, PASSWORD } from "./config.mjs";

const mode = process.argv.slice(2).find((arg) => arg === "create" || arg === "delete") ?? "create";
const base = process.env.SUPABASE_URL;
const serviceRole = process.env.SERVICE_ROLE;
if (!projectDir || !base || !serviceRole) throw new Error("SUPABASE_URL and SERVICE_ROLE are required");

const accounts = [
  { email: "qa.admin@pull-qa.test", role: "admin", displayName: "QA Admin", businessName: null, headline: "Administrator platform", phone: "6281234500004" },
  { email: "qa.umkm@pull-qa.test", role: "umkm", displayName: "QA UMKM", businessName: "QA Warung", headline: "Kuliner rumahan", phone: "6281234500001" },
  { email: "qa.pekerja@pull-qa.test", role: "pekerja", displayName: "QA Pekerja", businessName: null, headline: "Pekerja operasional", phone: "6281234500002" },
  { email: "qa.supplier@pull-qa.test", role: "supplier", displayName: "QA Supplier", businessName: "QA Bahan Baku", headline: "Supplier bahan", phone: "6281234500003" },
];

const headers = {
  apikey: serviceRole,
  Authorization: `Bearer ${serviceRole}`,
  "Content-Type": "application/json",
};

const url = new URL((await readFile(`${projectDir}/supabase/.temp/pooler-url`, "utf8")).trim());
url.password = encodeURIComponent(process.env.PGPASSWORD);
const client = new Client({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });
await client.connect();

if (mode === "create") {
  for (const account of accounts) {
    const response = await fetch(`${base}/auth/v1/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: account.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: {
          role: account.role,
          pending_role: null,
          onboarding_step: "complete",
          display_name: account.displayName,
          business_name: account.businessName,
          headline: account.headline,
          phone: account.phone,
          skills: account.role === "pekerja" ? ["packing", "kurir"] : [],
        },
      }),
    });
    const body = await response.json();
    if (!response.ok && !String(body.msg ?? "").includes("already")) {
      console.log(`GAGAL ${account.email}: ${response.status} ${body.msg ?? body.message ?? ""}`);
      continue;
    }
    const id = body.id ?? body.user?.id;
    await client.query(
      `update public.profiles
          set role = $2::public.app_role, account_status = 'active', display_name = $3,
              business_name = $4, headline = $5, phone = $6, updated_at = now()
        where id = $1`,
      [id, account.role, account.displayName, account.businessName, account.headline, account.phone],
    );
    console.log(`OK ${account.role.padEnd(8)} ${account.email} id=${id}`);
  }
} else {
  for (const account of accounts) {
    const list = await fetch(`${base}/auth/v1/admin/users?email=${encodeURIComponent(account.email)}`, { headers });
    const data = await list.json();
    for (const user of data.users ?? []) {
      if (user.email !== account.email) continue;
      const del = await fetch(`${base}/auth/v1/admin/users/${user.id}`, { method: "DELETE", headers });
      console.log(`${del.ok ? "DIHAPUS" : "GAGAL HAPUS"} ${account.email} (${user.id})`);
    }
  }
}

await client.end();
