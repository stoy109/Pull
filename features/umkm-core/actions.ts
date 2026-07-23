"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { isCoreSetupError, type SupabaseErrorLike } from "./errors";

type Revalidation = string | readonly [string, "layout" | "page"];

type ParsedNumber = {
  valid: boolean;
  value: number | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function hasLength(value: string, min: number, max: number) {
  return value.length >= min && value.length <= max;
}

function optionalLength(value: string, max: number, min = 0) {
  return !value || hasLength(value, min, max);
}

function numberField(formData: FormData, key: string, optional = false): ParsedNumber {
  const raw = text(formData, key);
  if (!raw && optional) return { valid: true, value: null };
  const value = Number(raw);
  return { valid: raw.length > 0 && Number.isFinite(value), value };
}

function dateField(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function uuidField(formData: FormData, key: string) {
  const value = text(formData, key);
  return UUID_PATTERN.test(value) ? value : null;
}

function urlField(
  value: string,
  allowedProtocols: readonly string[],
  maxLength = 1000,
) {
  if (!value) return { valid: true, value: null as string | null };
  if (value.length > maxLength) return { valid: false, value: null as string | null };
  try {
    const url = new URL(value);
    const valid =
      allowedProtocols.includes(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password;
    return { valid, value: valid ? value : null };
  } catch {
    return { valid: false, value: null as string | null };
  }
}

function fail(path: string, code: string): never {
  redirect(`${path}?error=${encodeURIComponent(code)}`);
}

function errorCode(error: SupabaseErrorLike) {
  if (isCoreSetupError(error)) return "setup";
  if (error.code === "23505") return "duplicate";
  return "save";
}

async function runRpc(
  path: string,
  rpc: string,
  args: Record<string, unknown>,
  revalidations: readonly Revalidation[],
  success: string,
): Promise<never> {
  const client = await createClient();
  const { error } = await client.rpc(rpc, args);
  if (error) fail(path, errorCode(error));

  for (const revalidation of revalidations) {
    if (typeof revalidation === "string") revalidatePath(revalidation);
    else revalidatePath(revalidation[0], revalidation[1]);
  }
  redirect(`${path}?success=${encodeURIComponent(success)}`);
}

const POOL_REVALIDATIONS = [
  "/dashboard/pools",
  "/dashboard",
  "/dashboard/activity",
  ["/supplier", "layout"],
  "/admin",
] as const;

export async function createPoolAction(formData: FormData) {
  await requireRole(["umkm"]);
  const itemName = text(formData, "itemName");
  const category = text(formData, "category");
  const description = text(formData, "description");
  const unit = text(formData, "unit");
  const district = text(formData, "district");
  const hub = text(formData, "hub");
  const target = numberField(formData, "targetQuantity");
  const threshold = numberField(formData, "minThreshold");
  const tier1 = numberField(formData, "tier1Price");
  const tier2 = numberField(formData, "tier2Price");
  const market = numberField(formData, "marketPrice");
  const latitude = numberField(formData, "latitude", true);
  const longitude = numberField(formData, "longitude", true);
  const deadlineDate = dateField(formData, "deadline");
  const deadline = deadlineDate ? `${deadlineDate}T23:59:59+07:00` : null;
  const coordinatesValid =
    latitude.valid &&
    longitude.valid &&
    ((latitude.value === null && longitude.value === null) ||
      (latitude.value !== null &&
        longitude.value !== null &&
        latitude.value >= -90 &&
        latitude.value <= 90 &&
        longitude.value >= -180 &&
        longitude.value <= 180));

  if (
    !hasLength(itemName, 2, 120) ||
    !hasLength(category, 2, 80) ||
    !hasLength(description, 5, 1000) ||
    !hasLength(unit, 1, 30) ||
    !hasLength(district, 2, 120) ||
    !optionalLength(hub, 200) ||
    !target.valid ||
    target.value === null ||
    target.value <= 0 ||
    !threshold.valid ||
    threshold.value === null ||
    threshold.value <= 0 ||
    threshold.value > target.value ||
    !tier1.valid ||
    tier1.value === null ||
    tier1.value <= 0 ||
    !tier2.valid ||
    tier2.value === null ||
    tier2.value <= 0 ||
    !market.valid ||
    market.value === null ||
    market.value <= 0 ||
    !deadline ||
    Date.parse(deadline) <= Date.now() ||
    !coordinatesValid
  ) {
    fail("/dashboard/pools", "validation");
  }

  return runRpc(
    "/dashboard/pools",
    "create_pool",
    {
      pool_category: category,
      pool_deadline: deadline,
      pool_description: description,
      pool_district: district,
      pool_hub: hub || null,
      pool_item_name: itemName,
      pool_latitude: latitude.value,
      pool_longitude: longitude.value,
      pool_market_price: market.value,
      pool_min_threshold: threshold.value,
      pool_target_quantity: target.value,
      pool_tier1_price: tier1.value,
      pool_tier2_price: tier2.value,
      pool_unit: unit,
    },
    POOL_REVALIDATIONS,
    "pool-created",
  );
}

export async function joinPoolAction(formData: FormData) {
  await requireRole(["umkm"]);
  const poolId = uuidField(formData, "poolId");
  const quantity = numberField(formData, "quantity");
  if (!poolId || !quantity.valid || quantity.value === null || quantity.value <= 0) {
    fail("/dashboard/pools", "validation");
  }
  return runRpc(
    "/dashboard/pools",
    "join_pool",
    { member_quantity: quantity.value, target_pool_id: poolId },
    POOL_REVALIDATIONS,
    "pool-joined",
  );
}

export async function createSupplierOrderAction(formData: FormData) {
  await requireRole(["umkm"]);
  const poolId = uuidField(formData, "poolId");
  const offerId = uuidField(formData, "offerId");
  const quantity = numberField(formData, "quantity");
  if (
    !poolId ||
    !offerId ||
    !quantity.valid ||
    quantity.value === null ||
    quantity.value <= 0
  ) {
    fail("/dashboard/pools", "validation");
  }
  return runRpc(
    "/dashboard/pools",
    "create_supplier_order",
    {
      order_quantity: quantity.value,
      target_offer_id: offerId,
      target_pool_id: poolId,
    },
    POOL_REVALIDATIONS,
    "order-created",
  );
}

export async function setBuyerOrderStatusAction(formData: FormData) {
  await requireRole(["umkm"]);
  const orderId = uuidField(formData, "orderId");
  const status = text(formData, "status");
  if (!orderId || !["cancelled", "completed"].includes(status)) {
    fail("/dashboard/pools", "validation");
  }
  return runRpc(
    "/dashboard/pools",
    "set_supplier_order_status",
    { requested_status: status, target_order_id: orderId },
    [...POOL_REVALIDATIONS, "/dashboard/trust"],
    "order-updated",
  );
}

const JOB_REVALIDATIONS = [
  "/dashboard/publish",
  "/dashboard/jobs",
  "/dashboard",
  "/dashboard/activity",
  "/worker/apply",
  ["/worker", "layout"],
  "/admin",
] as const;

export async function createFullJobAction(formData: FormData) {
  await requireRole(["umkm"]);
  const title = text(formData, "title");
  const description = text(formData, "description");
  const category = text(formData, "category");
  const district = text(formData, "district");
  const wageUnit = text(formData, "wageUnit");
  const requirements = text(formData, "requirements");
  const status = text(formData, "jobStatus");
  const wage = numberField(formData, "wageAmount");
  const duration = numberField(formData, "durationDays");
  const quota = numberField(formData, "quota");
  const hours = numberField(formData, "hoursPerDay");
  const startDate = dateField(formData, "startDate");
  const endDate = dateField(formData, "endDate");

  if (
    !hasLength(title, 3, 100) ||
    !hasLength(description, 10, 500) ||
    !hasLength(category, 2, 80) ||
    !hasLength(district, 2, 120) ||
    !hasLength(wageUnit, 1, 40) ||
    !optionalLength(requirements, 1500) ||
    !["draft", "published"].includes(status) ||
    !wage.valid ||
    wage.value === null ||
    wage.value <= 0 ||
    !duration.valid ||
    duration.value === null ||
    !Number.isInteger(duration.value) ||
    duration.value <= 0 ||
    !quota.valid ||
    quota.value === null ||
    !Number.isInteger(quota.value) ||
    quota.value <= 0 ||
    !hours.valid ||
    hours.value === null ||
    hours.value <= 0 ||
    hours.value > 24 ||
    !startDate ||
    !endDate ||
    endDate < startDate
  ) {
    fail("/dashboard/publish", "validation");
  }

  return runRpc(
    "/dashboard/publish",
    "create_full_job_posting",
    {
      job_category: category,
      job_description: description,
      job_district: district,
      job_duration_days: duration.value,
      job_end_date: endDate,
      job_hours_per_day: hours.value,
      job_quota: quota.value,
      job_requirements: requirements || null,
      job_start_date: startDate,
      job_status: status,
      job_title: title,
      job_wage: wage.value,
      job_wage_unit: wageUnit,
    },
    JOB_REVALIDATIONS,
    "job-created",
  );
}

export async function setApplicationStatusAction(formData: FormData) {
  await requireRole(["umkm"]);
  const applicationId = uuidField(formData, "applicationId");
  const status = text(formData, "status");
  if (!applicationId || !["accepted", "rejected"].includes(status)) {
    fail("/dashboard/jobs", "validation");
  }
  return runRpc(
    "/dashboard/jobs",
    "set_application_status",
    { requested_status: status, target_application_id: applicationId },
    JOB_REVALIDATIONS,
    status === "accepted" ? "application-accepted" : "application-rejected",
  );
}

export async function confirmJobCompletionAction(formData: FormData) {
  await requireRole(["umkm"]);
  const applicationId = uuidField(formData, "applicationId");
  if (!applicationId) fail("/dashboard/jobs", "validation");
  return runRpc(
    "/dashboard/jobs",
    "confirm_job_completion",
    { target_application_id: applicationId },
    [...JOB_REVALIDATIONS, "/dashboard/trust"],
    "completion-recorded",
  );
}

export async function rateCompletedWorkerAction(formData: FormData) {
  await requireRole(["umkm"]);
  const applicationId = uuidField(formData, "applicationId");
  const score = numberField(formData, "score");
  const review = text(formData, "review");
  if (
    !applicationId ||
    !score.valid ||
    score.value === null ||
    !Number.isInteger(score.value) ||
    score.value < 1 ||
    score.value > 5 ||
    !optionalLength(review, 1000, 3)
  ) {
    fail("/dashboard/jobs", "validation");
  }
  return runRpc(
    "/dashboard/jobs",
    "submit_transaction_rating",
    {
      rating_review: review || null,
      rating_score: score.value,
      transaction_id: applicationId,
      transaction_type: "job_application",
    },
    [...JOB_REVALIDATIONS, "/dashboard/trust"],
    "rating-saved",
  );
}

const PROFILE_REVALIDATIONS = [
  "/dashboard/profile",
  "/dashboard",
  "/dashboard/activity",
  ["/umkm/[slug]", "page"],
  "/admin",
] as const;

export async function upsertBusinessProfileAction(formData: FormData) {
  await requireRole(["umkm"]);
  const slug = text(formData, "slug").toLowerCase();
  const businessName = text(formData, "businessName");
  const description = text(formData, "description");
  const category = text(formData, "category");
  const address = text(formData, "address");
  const district = text(formData, "district");
  const whatsapp = text(formData, "whatsapp");
  const logo = urlField(text(formData, "logoUrl"), ["http:", "https:"]);
  const cover = urlField(text(formData, "coverUrl"), ["http:", "https:"]);
  const website = urlField(text(formData, "websiteUrl"), ["https:"]);
  const latitude = numberField(formData, "latitude", true);
  const longitude = numberField(formData, "longitude", true);
  const digits = whatsapp.replace(/\D/g, "");
  const coordinatesValid =
    latitude.valid &&
    longitude.valid &&
    ((latitude.value === null && longitude.value === null) ||
      (latitude.value !== null &&
        longitude.value !== null &&
        latitude.value >= -90 &&
        latitude.value <= 90 &&
        longitude.value >= -180 &&
        longitude.value <= 180));

  if (
    !hasLength(slug, 3, 80) ||
    !SLUG_PATTERN.test(slug) ||
    !hasLength(businessName, 2, 120) ||
    !optionalLength(description, 1500) ||
    !optionalLength(category, 80) ||
    !optionalLength(address, 300) ||
    !optionalLength(district, 120) ||
    (whatsapp.length > 0 && (digits.length < 8 || digits.length > 15)) ||
    !logo.valid ||
    !cover.valid ||
    !website.valid ||
    !coordinatesValid
  ) {
    fail("/dashboard/profile", "validation");
  }

  return runRpc(
    "/dashboard/profile",
    "upsert_business_profile",
    {
      profile_address: address || null,
      profile_business_name: businessName,
      profile_category: category || null,
      profile_cover_url: cover.value,
      profile_description: description || null,
      profile_district: district || null,
      profile_latitude: latitude.value,
      profile_logo_url: logo.value,
      profile_longitude: longitude.value,
      profile_slug: slug,
      profile_storefront_enabled: formData.get("storefrontEnabled") === "on",
      profile_website_url: website.value,
      profile_whatsapp: whatsapp || null,
    },
    PROFILE_REVALIDATIONS,
    "profile-saved",
  );
}

export async function upsertBusinessProductAction(formData: FormData) {
  await requireRole(["umkm"]);
  const targetProductRaw = text(formData, "productId");
  const targetProductId = targetProductRaw
    ? UUID_PATTERN.test(targetProductRaw)
      ? targetProductRaw
      : null
    : null;
  const name = text(formData, "name");
  const category = text(formData, "category");
  const unit = text(formData, "unit");
  const description = text(formData, "description");
  const price = numberField(formData, "price");
  const image = urlField(text(formData, "imageUrl"), ["http:", "https:"]);

  if (
    (targetProductRaw.length > 0 && !targetProductId) ||
    !hasLength(name, 2, 120) ||
    !hasLength(category, 2, 80) ||
    !hasLength(unit, 1, 30) ||
    !optionalLength(description, 1000) ||
    !price.valid ||
    price.value === null ||
    price.value < 0 ||
    !image.valid
  ) {
    fail("/dashboard/profile", "validation");
  }

  return runRpc(
    "/dashboard/profile",
    "upsert_business_product",
    {
      product_category: category,
      product_description: description || null,
      product_image_url: image.value,
      product_is_active: formData.get("isActive") === "on",
      product_name: name,
      product_price: price.value,
      product_unit: unit,
      target_product_id: targetProductId,
    },
    PROFILE_REVALIDATIONS,
    "product-saved",
  );
}
