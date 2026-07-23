"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KYC_BUCKET = "kyc-documents";
const MAX_KYC_FILE_BYTES = 850_000;
const KYC_FILE_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function field(formData: FormData, key: string, max: number) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function positiveNumber(formData: FormData, key: string, allowZero = false) {
  const value = Number(field(formData, key, 30));
  return Number.isFinite(value) && (allowZero ? value >= 0 : value > 0) ? value : null;
}

function checked(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

function finish(path: string, result: "saved" | "validation" | "verification" | "error" | "setup"): never {
  if (result === "saved") revalidatePath("/supplier", "layout");
  redirect(`${path}?result=${result}`);
}

function rpcFailure(error: { code?: string; message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  if (error?.code === "PGRST202" || error?.code === "42883" || error?.code === "42P01" ||
    message.includes("does not exist")) return "setup" as const;
  if (message.includes("verified supplier")) return "verification" as const;
  return "error" as const;
}

export async function upsertSupplierProductAction(formData: FormData) {
  await requireRole(["supplier"]);
  const id = field(formData, "id", 36);
  const itemName = field(formData, "itemName", 100);
  const unit = field(formData, "unit", 30);
  const category = field(formData, "category", 80);
  const description = field(formData, "description", 1000);
  const unitPrice = positiveNumber(formData, "unitPrice");
  const stockQuantity = positiveNumber(formData, "stockQuantity", true);
  const minOrderQuantity = positiveNumber(formData, "minOrderQuantity");
  const status = field(formData, "status", 10);

  if ((id && !UUID_PATTERN.test(id)) || itemName.length < 3 || !unit || category.length < 2 ||
    unitPrice === null || stockQuantity === null || minOrderQuantity === null ||
    (status !== "active" && status !== "inactive")) {
    finish("/supplier/products", "validation");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("upsert_supplier_product", {
    offer_item_name: itemName,
    offer_unit: unit,
    offer_unit_price: unitPrice,
    offer_stock_quantity: stockQuantity,
    offer_min_order_quantity: minOrderQuantity,
    offer_category: category,
    offer_description: description || null,
    offer_status: status,
    target_offer_id: id || null,
  });
  finish("/supplier/products", error ? rpcFailure(error) : "saved");
}

export async function submitSupplierOfferAgainstPoolAction(formData: FormData) {
  await requireRole(["supplier"]);
  const poolId = field(formData, "poolId", 36);
  const unitPrice = positiveNumber(formData, "unitPrice");
  const stockQuantity = positiveNumber(formData, "stockQuantity");
  const minOrderQuantity = positiveNumber(formData, "minOrderQuantity");
  const description = field(formData, "description", 1000);
  if (!UUID_PATTERN.test(poolId) || unitPrice === null || stockQuantity === null ||
    minOrderQuantity === null || minOrderQuantity > stockQuantity) {
    finish("/supplier/demands", "validation");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_supplier_offer_against_pool", {
    target_pool_id: poolId,
    offer_unit_price: unitPrice,
    offer_stock_quantity: stockQuantity,
    offer_min_order_quantity: minOrderQuantity,
    offer_description: description || null,
  });
  finish("/supplier/demands", error ? rpcFailure(error) : "saved");
}

export async function setSupplierOrderStatusAction(formData: FormData) {
  await requireRole(["supplier"]);
  const orderId = field(formData, "orderId", 36);
  const status = field(formData, "status", 20);
  if (!UUID_PATTERN.test(orderId) || !["accepted", "rejected", "processing", "shipped"].includes(status)) {
    finish("/supplier/transactions", "validation");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_supplier_order_status", {
    target_order_id: orderId,
    requested_status: status,
  });
  finish("/supplier/transactions", error ? rpcFailure(error) : "saved");
}

export async function submitTransactionRatingAction(formData: FormData) {
  await requireRole(["supplier"]);
  const orderId = field(formData, "orderId", 36);
  const score = Number(field(formData, "score", 1));
  const review = field(formData, "review", 1000);
  if (!UUID_PATTERN.test(orderId) || !Number.isInteger(score) || score < 1 || score > 5 ||
    (review.length > 0 && review.length < 3)) {
    finish("/supplier/transactions", "validation");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_transaction_rating", {
    transaction_type: "supplier_order",
    transaction_id: orderId,
    rating_score: score,
    rating_review: review || null,
  });
  finish("/supplier/transactions", error ? rpcFailure(error) : "saved");
}

export async function markNotificationReadAction(formData: FormData) {
  await requireRole(["supplier"]);
  const notificationId = field(formData, "notificationId", 36);
  if (!UUID_PATTERN.test(notificationId)) finish("/supplier/notifications", "validation");
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_notification_read", {
    target_notification_id: notificationId,
  });
  finish("/supplier/notifications", error ? rpcFailure(error) : "saved");
}

export async function setNotificationPreferencesAction(formData: FormData) {
  await requireRole(["supplier"]);
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_notification_preferences", {
    enable_in_app: checked(formData, "inApp"),
    enable_jobs: checked(formData, "jobs"),
    enable_pools: checked(formData, "pools"),
    enable_orders: checked(formData, "orders"),
    enable_ratings: checked(formData, "ratings"),
  });
  finish("/supplier/settings", error ? rpcFailure(error) : "saved");
}

export async function submitKycRecordAction(formData: FormData) {
  const { user } = await requireRole(["supplier"]);
  const documentType = field(formData, "documentType", 80).toUpperCase();
  const document = formData.get("document");
  if (!["NIB", "SIUP"].includes(documentType) || !(document instanceof File) ||
    document.size < 1 || document.size > MAX_KYC_FILE_BYTES) {
    finish("/supplier/store", "validation");
  }

  const extension = KYC_FILE_TYPES[document.type];
  if (!extension) finish("/supplier/store", "validation");

  const supabase = await createClient();
  const { data: pending, error: pendingError } = await supabase
    .from("kyc_submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("document_type", documentType)
    .eq("status", "pending")
    .maybeSingle();
  if (pendingError) finish("/supplier/store", rpcFailure(pendingError));
  if (pending) finish("/supplier/store", "validation");

  const storagePath = `${user.id}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(KYC_BUCKET).upload(storagePath, document, {
    cacheControl: "3600",
    contentType: document.type,
    upsert: false,
  });
  if (uploadError) finish("/supplier/store", rpcFailure(uploadError));

  const safeName = document.name.replace(/[^a-zA-Z0-9._ -]/g, "").slice(0, 120);
  const { error } = await supabase.rpc("submit_kyc_record", {
    kyc_document_type: documentType,
    kyc_storage_path: storagePath,
    kyc_metadata: {
      content_type: document.type,
      original_name: safeName,
      size: document.size,
    },
  });
  if (error) await supabase.storage.from(KYC_BUCKET).remove([storagePath]);
  finish("/supplier/store", error ? rpcFailure(error) : "saved");
}
