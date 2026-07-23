export type SupplierProductStatus = "active" | "inactive";
export type SupplierOrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "unknown";

export type SupplierWorkspaceProfile = {
  id: string;
  businessName: string;
  verificationLevel: number;
  kycStatus: "not_submitted" | "pending" | "verified" | "rejected";
  trustScore: number;
  ratingCount: number;
};

export type SupplierProduct = {
  id: string;
  poolId: string;
  itemName: string;
  unit: string;
  unitPrice: number;
  stockQuantity: number;
  targetDiscount: number;
  minOrderQuantity: number;
  category: string;
  description: string;
  status: SupplierProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type SupplierOrder = {
  id: string;
  poolId: string;
  offerId: string;
  buyerId: string;
  supplierId: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  total: number;
  status: SupplierOrderStatus;
  acceptedAt: string;
  shippedAt: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type SupplierDemand = {
  id: string;
  requesterKey: string;
  itemName: string;
  category: string;
  targetQuantity: number;
  currentQuantity: number;
  minThreshold: number;
  unit: string;
  district: string;
  status: string;
  deadline: string;
  poolLeader: string;
  tier1Price: number | null;
  tier2Price: number | null;
  marketPrice: number | null;
  hub: string;
  createdAt: string;
};

export type SupplierWorkspace = {
  profile: SupplierWorkspaceProfile;
  products: SupplierProduct[];
  poolOffers: SupplierProduct[];
  orders: SupplierOrder[];
  demands: SupplierDemand[];
};

const DEFAULT_PROFILE: SupplierWorkspaceProfile = {
  id: "",
  businessName: "",
  verificationLevel: 0,
  kycStatus: "not_submitted",
  trustScore: 0,
  ratingCount: 0,
};

export function emptySupplierWorkspace(): SupplierWorkspace {
  return {
    profile: { ...DEFAULT_PROFILE },
    products: [],
    poolOffers: [],
    orders: [],
    demands: [],
  };
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = number(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function list(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function parseKycStatus(value: unknown): SupplierWorkspaceProfile["kycStatus"] {
  return value === "pending" || value === "verified" || value === "rejected"
    ? value
    : "not_submitted";
}

function parseProductStatus(value: unknown): SupplierProductStatus {
  return value === "active" ? "active" : "inactive";
}

const TARGET_DISCOUNT_PATTERN = /^supplier_target_discount=(\d+(?:\.\d+)?)$/;

export function supplierTargetDiscountDescription(value: number) {
  return `supplier_target_discount=${value}`;
}

function parseTargetDiscount(value: unknown) {
  const match = TARGET_DISCOUNT_PATTERN.exec(text(value));
  return match ? Math.min(100, Math.max(0, number(match[1]))) : 0;
}

function parseOrderStatus(value: unknown): SupplierOrderStatus {
  return value === "pending" || value === "accepted" || value === "rejected" ||
    value === "processing" || value === "shipped" || value === "completed" ||
    value === "cancelled"
    ? value
    : "unknown";
}

function parseProduct(value: unknown): SupplierProduct {
  const row = record(value);
  return {
    id: text(row.id),
    poolId: text(row.pool_id),
    itemName: text(row.item_name),
    unit: text(row.unit),
    unitPrice: Math.max(0, number(row.unit_price)),
    stockQuantity: Math.max(0, number(row.stock_quantity)),
    targetDiscount: parseTargetDiscount(row.description),
    minOrderQuantity: Math.max(0, number(row.min_order_quantity)),
    category: text(row.category),
    description: text(row.description),
    status: parseProductStatus(row.status),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
  };
}

function parseOrder(value: unknown): SupplierOrder {
  const row = record(value);
  return {
    id: text(row.id),
    poolId: text(row.pool_id),
    offerId: text(row.offer_id),
    buyerId: text(row.buyer_id),
    supplierId: text(row.supplier_id),
    quantity: Math.max(0, number(row.quantity)),
    unit: text(row.unit),
    unitPrice: Math.max(0, number(row.unit_price)),
    subtotal: Math.max(0, number(row.subtotal)),
    total: Math.max(0, number(row.total)),
    status: parseOrderStatus(row.status),
    acceptedAt: text(row.accepted_at),
    shippedAt: text(row.shipped_at),
    completedAt: text(row.completed_at),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
  };
}

function parseDemand(value: unknown): SupplierDemand {
  const row = record(value);
  const metadata = record(row.metadata);
  return {
    id: text(row.id) || text(metadata.pool_id),
    requesterKey: text(row.requester_key),
    itemName: text(metadata.item_name) || text(metadata.product_name) || text(metadata.commodity),
    category: text(metadata.category),
    targetQuantity: Math.max(0, number(metadata.target_quantity ?? metadata.quantity ?? metadata.volume)),
    currentQuantity: Math.max(0, number(metadata.current_quantity)),
    minThreshold: Math.max(0, number(metadata.min_threshold)),
    unit: text(metadata.unit),
    district: text(metadata.district) || text(metadata.location),
    status: text(metadata.status),
    deadline: text(metadata.deadline_at) || text(metadata.deadline),
    poolLeader: text(metadata.pool_leader),
    tier1Price: optionalNumber(metadata.tier1_price),
    tier2Price: optionalNumber(metadata.tier2_price),
    marketPrice: optionalNumber(metadata.market_price),
    hub: text(metadata.hub),
    createdAt: text(row.created_at),
  };
}

export function parseSupplierWorkspaceValue(value: unknown): SupplierWorkspace {
  const root = record(value);
  const profile = record(root.profile);
  const products = list(root.products)
    .map(parseProduct)
    .filter((item) => item.id)
    .sort((left, right) =>
      Number(right.status === "active") - Number(left.status === "active") ||
      right.updatedAt.localeCompare(left.updatedAt),
    );
  return {
    profile: {
      id: text(profile.id),
      businessName: text(profile.business_name),
      verificationLevel: Math.min(2, Math.max(0, Math.round(number(profile.verification_level)))),
      kycStatus: parseKycStatus(profile.kyc_status),
      trustScore: Math.min(100, Math.max(0, number(profile.trust_score))),
      ratingCount: Math.max(0, Math.round(number(profile.rating_count))),
    },
    products: products.slice(0, 1),
    poolOffers: list(root.pool_offers).map(parseProduct).filter((item) => item.id),
    orders: list(root.orders).map(parseOrder).filter((item) => item.id),
    demands: list(root.demands).map(parseDemand).filter((item) => item.id),
  };
}

export function supplierOrderItemName(workspace: SupplierWorkspace, order: SupplierOrder) {
  return workspace.poolOffers.find((offer) => offer.id === order.offerId)?.itemName
    || workspace.products.find((product) => product.id === order.offerId)?.itemName
    || "Pesanan supplier";
}

export function isWithinDays(value: string, days: number, now = Date.now()) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp >= now - days * 86_400_000 && timestamp <= now;
}
