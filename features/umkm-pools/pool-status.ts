export type PoolStatus = "waiting" | "successful" | "cancelled";

export function resolvePoolStatus({
  currentQuantity,
  targetQuantity,
  deadlineAt,
  now = Date.now(),
}: {
  currentQuantity: number;
  targetQuantity: number;
  deadlineAt: string;
  now?: number;
}): PoolStatus {
  if (targetQuantity > 0 && currentQuantity >= targetQuantity) return "successful";

  const deadlineTime = new Date(deadlineAt).getTime();
  if (Number.isFinite(deadlineTime) && deadlineTime <= now) return "cancelled";

  return "waiting";
}

export const POOL_STATUS_LABELS: Record<PoolStatus, string> = {
  waiting: "Menunggu",
  successful: "Berhasil",
  cancelled: "Dibatalkan",
};
