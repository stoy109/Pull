import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/access";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LegacyWorkerApplyPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireRole(["pekerja"]);
  const query = await searchParams;
  const destination = new URLSearchParams();

  for (const key of ["district", "category", "minWage"] as const) {
    const value = first(query[key]);
    if (value) destination.set(key, value.slice(0, 80));
  }

  if (first(query.success)) destination.set("notice", "application-sent");
  const error = first(query.error);
  if (error) {
    destination.set(
      "notice",
      error === "duplicate"
        ? "application-duplicate"
        : error === "validation"
          ? "application-validation"
          : "application-save",
    );
  }

  redirect(`/worker/jobs${destination.size ? `?${destination.toString()}` : ""}`);
}
