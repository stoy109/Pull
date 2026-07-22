export type PoolOrderCalculation = {
  quantity: number;
  normalUnitPrice: number;
  subtotalNormal: number;
  estimatedDiscountPercentage: number;
  estimatedDiscountAmount: number;
  estimatedTotal: number;
  contributionPercentage: number;
};

function toNonNegativeNumber(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function roundPercentage(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculatePoolContribution(quantity: number, poolTarget: number) {
  const safeQuantity = toNonNegativeNumber(quantity);
  const safeTarget = toNonNegativeNumber(poolTarget);

  if (!safeTarget) return 0;

  return roundPercentage(Math.min(100, (safeQuantity / safeTarget) * 100));
}

export function calculateEstimatedDiscountPercentage(
  quantity: number,
  poolTarget: number,
  maximumSupplierDiscount: number,
) {
  const contribution = calculatePoolContribution(quantity, poolTarget);
  const maximumDiscount = Math.min(100, toNonNegativeNumber(maximumSupplierDiscount));

  return roundPercentage((contribution / 100) * maximumDiscount);
}

export function calculatePoolOrder({
  quantity,
  normalUnitPrice,
  poolTarget,
  maximumSupplierDiscount,
}: {
  quantity: number;
  normalUnitPrice: number;
  poolTarget: number;
  maximumSupplierDiscount: number;
}): PoolOrderCalculation {
  const safeQuantity = toNonNegativeNumber(quantity);
  const normalPrice = toNonNegativeNumber(normalUnitPrice);
  const subtotalNormal = safeQuantity * normalPrice;
  const estimatedDiscountPercentage = calculateEstimatedDiscountPercentage(
    safeQuantity,
    poolTarget,
    maximumSupplierDiscount,
  );
  const estimatedDiscountAmount = Math.round(
    subtotalNormal * (estimatedDiscountPercentage / 100),
  );

  return {
    quantity: safeQuantity,
    normalUnitPrice: normalPrice,
    subtotalNormal,
    estimatedDiscountPercentage,
    estimatedDiscountAmount,
    estimatedTotal: Math.max(0, subtotalNormal - estimatedDiscountAmount),
    contributionPercentage: calculatePoolContribution(safeQuantity, poolTarget),
  };
}
