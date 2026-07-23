import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  parseImpactDashboard,
  type ImpactDashboardData,
  type ImpactFilters,
} from "@/lib/impact/dashboard";

export async function getAdminImpact(filters: ImpactFilters): Promise<ImpactDashboardData> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_impact_dashboard", {
    period_days: filters.days,
    category_filter: filters.category,
    priority_filter: filters.priority,
    page_number: filters.page,
    page_size: 15,
    app_timezone: "Asia/Jakarta",
  });

  if (error) {
    console.error("Unable to load Smart Impact Dashboard", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Smart Impact Dashboard belum dapat dimuat.");
  }

  return parseImpactDashboard(data);
}

