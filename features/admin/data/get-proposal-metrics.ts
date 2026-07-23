import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ProposalMetricsPeriod = 7 | 30 | 90;

export type ProposalMetrics = {
  periodDays: ProposalMetricsPeriod;
  periodStart: string;
  generatedAt: string;
  poolCompletionCount: number;
  poolTotalCount: number;
  poolCompletionRate: number;
  averageSavingsPercent: number;
  savingsSampleCount: number;
  jobFillCount: number;
  averageJobFillHours: number;
  confirmedWorkerWage: number;
  supplierCompletedTurnover: number;
  confirmationCompletedCount: number;
  confirmationEligibleCount: number;
  confirmationCompletionRate: number;
  qrProfileViews: number;
  qrContactCount: number;
  retention30dRate: number;
  retentionBaseCount: number;
  retentionReturningCount: number;
  kycPending: number;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value ? value : fallback;
}

export function normalizeProposalMetricsPeriod(value?: string | string[]): ProposalMetricsPeriod {
  const requested = Array.isArray(value) ? value[0] : value;
  return requested === "7" ? 7 : requested === "90" ? 90 : 30;
}

export async function getProposalMetrics(periodDays: ProposalMetricsPeriod): Promise<ProposalMetrics> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_proposal_metrics", {
    period_days: periodDays,
  });

  if (error) {
    console.error("Unable to load proposal metrics", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Metrik proposal belum dapat dimuat.");
  }

  const root = asRecord(data);
  const epoch = new Date(0).toISOString();

  return {
    periodDays,
    periodStart: asString(root.period_start, epoch),
    generatedAt: asString(root.generated_at, epoch),
    poolCompletionCount: asNumber(root.pool_completion_count),
    poolTotalCount: asNumber(root.pool_total_count),
    poolCompletionRate: asNumber(root.pool_completion_rate),
    averageSavingsPercent: Number(root.average_savings_percent) || 0,
    savingsSampleCount: asNumber(root.savings_sample_count),
    jobFillCount: asNumber(root.job_fill_count),
    averageJobFillHours: asNumber(root.average_job_fill_hours),
    confirmedWorkerWage: asNumber(root.confirmed_worker_wage),
    supplierCompletedTurnover: asNumber(root.supplier_completed_turnover),
    confirmationCompletedCount: asNumber(root.confirmation_completed_count),
    confirmationEligibleCount: asNumber(root.confirmation_eligible_count),
    confirmationCompletionRate: asNumber(root.confirmation_completion_rate),
    qrProfileViews: asNumber(root.qr_profile_views),
    qrContactCount: asNumber(root.qr_contact_count),
    retention30dRate: asNumber(root.retention_30d_rate),
    retentionBaseCount: asNumber(root.retention_base_count),
    retentionReturningCount: asNumber(root.retention_returning_count),
    kycPending: asNumber(root.kyc_pending),
  };
}
