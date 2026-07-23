import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function parseEnv(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

async function readEnvFile(fileName) {
  try {
    return parseEnv(await readFile(resolve(process.cwd(), fileName), "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

async function findUserByEmail(supabase, email) {
  const perPage = 1000;

  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email,
    );
    if (user) return user;
    if (data.users.length < perPage) return null;
  }

  throw new Error("Batas pencarian pengguna terlampaui.");
}

const [appEnv, adminEnv] = await Promise.all([
  readEnvFile(".env.local"),
  readEnvFile(".env.admin.local"),
]);

const supabaseUrl =
  adminEnv.SUPABASE_URL || appEnv.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = appEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey =
  process.env.SUPABASE_SECRET_KEY || adminEnv.SUPABASE_SECRET_KEY;
const adminEmail = adminEnv.ADMIN_EMAIL?.trim().toLowerCase();
const temporaryPassword = adminEnv.ADMIN_TEMP_PASSWORD;

if (!supabaseUrl || !secretKey || !adminEmail) {
  throw new Error(
    "SUPABASE_SECRET_KEY dan ADMIN_EMAIL wajib tersedia di .env.admin.local.",
  );
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

let user = await findUserByEmail(supabase, adminEmail);
let action = "promoted";

if (!user) {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(
    adminEmail,
    {
      data: { display_name: "Administrator Pull" },
    },
  );

  if (!error) {
    user = data.user;
    action = "invited";
  } else if (error.code === "over_email_send_rate_limit") {
    if (!temporaryPassword || temporaryPassword.length < 12) {
      throw new Error(
        "Email invite terkena rate limit. Tambahkan ADMIN_TEMP_PASSWORD minimal 12 karakter ke .env.admin.local.",
      );
    }

    const { data: createdUserData, error: createUserError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: temporaryPassword,
        email_confirm: true,
        app_metadata: { role: "admin" },
        user_metadata: { display_name: "Administrator Pull" },
      });

    if (createUserError) throw createUserError;
    user = createdUserData.user;
    action = "created";
  } else {
    throw error;
  }
}

const { data: updatedUserData, error: updateUserError } =
  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      role: "admin",
    },
  });

if (updateUserError) throw updateUserError;

const displayName =
  updatedUserData.user.user_metadata?.display_name || "Administrator Pull";

const { error: profileError } = await supabase.from("profiles").upsert(
  {
    id: user.id,
    email: adminEmail,
    display_name: displayName,
    role: "admin",
    account_status: "active",
    updated_at: new Date().toISOString(),
  },
  { onConflict: "id" },
);

if (profileError) throw profileError;

const [{ data: verifiedUser, error: verifyUserError }, profileResult] =
  await Promise.all([
    supabase.auth.admin.getUserById(user.id),
    supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", user.id)
      .single(),
  ]);

if (verifyUserError) throw verifyUserError;
if (profileResult.error) throw profileResult.error;

const verified =
  verifiedUser.user.app_metadata?.role === "admin" &&
  profileResult.data.role === "admin" &&
  profileResult.data.account_status === "active";

if (!verified) {
  throw new Error("Verifikasi akhir role Administrator gagal.");
}

let credentialLoginVerified = false;

if (temporaryPassword && publishableKey) {
  const loginClient = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  const { data: loginData, error: loginError } =
    await loginClient.auth.signInWithPassword({
      email: adminEmail,
      password: temporaryPassword,
    });

  if (loginError) throw loginError;

  credentialLoginVerified = loginData.user.app_metadata?.role === "admin";
  if (!credentialLoginVerified) {
    throw new Error("Login berhasil tetapi token tidak membawa role Administrator.");
  }

  await loginClient.auth.signOut({ scope: "local" });
}

console.log(
  JSON.stringify({
    action,
    appMetadataRole: "admin",
    profileRole: "admin",
    status: "active",
    verified: true,
    credentialLoginVerified,
  }),
);
