"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

function field(formData: FormData, key: string, max: number) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function createJobPostingAction(formData: FormData) {
  await requireRole(["umkm"]);
  const title = field(formData, "title", 100);
  const description = field(formData, "description", 500);
  if (title.length < 3 || description.length < 10) redirect("/dashboard/publish?error=validation");
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_job_posting", { job_title: title, job_description: description });
  if (error) redirect("/dashboard/publish?error=save");
  revalidatePath("/dashboard/publish");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/activity");
  revalidatePath("/admin");
  revalidatePath("/admin/impact");
  redirect("/dashboard/publish?success=1");
}

export async function submitJobApplicationAction(formData: FormData) {
  await requireRole(["pekerja"]);
  const jobId = field(formData, "jobId", 36);
  const message = field(formData, "message", 300);
  if (!jobId || message.length < 5) redirect("/worker/apply?error=validation");
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_job_application", { target_job_id: jobId, application_message: message });
  if (error) redirect(`/worker/apply?error=${error.code === "23505" ? "duplicate" : "save"}`);
  revalidatePath("/worker/apply");
  revalidatePath("/worker/dashboard");
  revalidatePath("/worker/activity");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/impact");
  redirect("/worker/apply?success=1");
}

export async function createSupplierOfferAction(formData: FormData) {
  await requireRole(["supplier"]);
  const itemName = field(formData, "itemName", 100);
  const unit = field(formData, "unit", 30);
  const unitPrice = Number(field(formData, "unitPrice", 20));
  if (itemName.length < 3 || !unit || !Number.isFinite(unitPrice) || unitPrice <= 0) redirect("/supplier?error=validation");
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_supplier_offer", { offer_item_name: itemName, offer_unit: unit, offer_unit_price: unitPrice });
  if (error) redirect("/supplier?error=save");
  revalidatePath("/supplier");
  revalidatePath("/admin");
  revalidatePath("/admin/impact");
  redirect("/supplier?success=1");
}
