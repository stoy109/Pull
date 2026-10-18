// Shared configuration for the QA suites.
//
// Every value can be overridden with an environment variable, and the defaults
// let `node scripts/qa/<suite>.mjs` run from a clean checkout.
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

/**
 * Linked Supabase project directory. `supabase/.temp/pooler-url` is read from
 * here, so it must be the directory that has been through `supabase link`.
 * A path passed as the first argument wins, which keeps the old calling style
 * (`node qa-full.mjs /path/to/project`) working.
 */
const argvProjectDir = process.argv[2];
export const projectDir =
  process.env.QA_PROJECT_DIR ??
  (typeof argvProjectDir === "string" && /[\\/]/.test(argvProjectDir) ? argvProjectDir : repoRoot);

export const BASE = process.env.QA_BASE_URL ?? "http://localhost:3000";

/**
 * Left undefined so playwright-core resolves its own Chromium build. Point
 * QA_CHROME_PATH at a specific binary when the browser lives elsewhere.
 */
export const EXE = process.env.QA_CHROME_PATH;

export const PASSWORD = process.env.QA_PASSWORD;

/** Screenshots are written here and ignored by git. */
export const SHOTS = process.env.QA_SHOTS_DIR ?? fileURLToPath(new URL("./shots/", import.meta.url));
mkdirSync(SHOTS, { recursive: true });
