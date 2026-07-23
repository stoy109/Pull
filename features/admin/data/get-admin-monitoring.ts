import "server-only";

import {
  parseMonitoringData,
  type MonitoringData,
  type MonitoringFilters,
} from "@/lib/activity/monitoring";
import { createClient } from "@/lib/supabase/server";

export async function getAdminMonitoring(
  filters: MonitoringFilters,
): Promise<MonitoringData> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_monitoring", {
    period_days: filters.days,
    role_filter: filters.role,
    app_timezone: "Asia/Jakarta",
  });

  if (error) {
    console.error("Unable to load administrator monitoring data", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Data monitoring belum dapat dimuat.");
  }

  return parseMonitoringData(data);
}
