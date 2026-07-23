export const IMPACT_PERIODS = [7, 30, 90] as const;
export const IMPACT_CATEGORIES = ["recruitment", "supplier"] as const;
export const IMPACT_PRIORITIES = ["high", "medium", "low"] as const;
export const IMPACT_ITEM_TYPES = ["job_posting", "job_application", "supplier_offer"] as const;

export type ImpactPeriod = (typeof IMPACT_PERIODS)[number];
export type ImpactCategory = (typeof IMPACT_CATEGORIES)[number];
export type ImpactPriority = (typeof IMPACT_PRIORITIES)[number];
export type ImpactItemType = (typeof IMPACT_ITEM_TYPES)[number];
export type ImpactActionType = "followed_up" | "dismissed";

export type ImpactFilters = {
  days: ImpactPeriod;
  category: ImpactCategory | null;
  priority: ImpactPriority | null;
  page: number;
};

export type ImpactItem = {
  itemType: ImpactItemType;
  itemId: string;
  itemName: string;
  category: ImpactCategory;
  status: string;
  priority: ImpactPriority;
  eventTime: string;
  ownerName: string;
  recommendation: string;
  latestAction: ImpactActionType | null;
  actionTime: string | null;
};

export type ImpactDashboardData = {
  generatedAt: string;
  periodDays: ImpactPeriod;
  categoryFilter: ImpactCategory | null;
  priorityFilter: ImpactPriority | null;
  metrics: {
    activeJobs: number;
    applications: number;
    placementRate: number;
    activeSupplierOffers: number;
  };
  prioritySummary: Record<ImpactPriority, number> & { pending: number };
  recommendations: Array<{
    itemType: ImpactItemType;
    itemId: string;
    itemName: string;
    priority: ImpactPriority;
    recommendation: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
  items: ImpactItem[];
  actionLog: Array<{
    id: string;
    actorName: string;
    itemType: ImpactItemType;
    itemId: string;
    itemName: string;
    actionType: ImpactActionType;
    note: string | null;
    previousPriority: ImpactPriority;
    createdAt: string;
  }>;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function asNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function parseCategory(value: unknown): ImpactCategory | null {
  return IMPACT_CATEGORIES.includes(value as ImpactCategory) ? value as ImpactCategory : null;
}

function parsePriority(value: unknown): ImpactPriority {
  return IMPACT_PRIORITIES.includes(value as ImpactPriority) ? value as ImpactPriority : "low";
}

function parseItemType(value: unknown): ImpactItemType {
  return IMPACT_ITEM_TYPES.includes(value as ImpactItemType) ? value as ImpactItemType : "job_posting";
}

function parseActionType(value: unknown): ImpactActionType | null {
  return value === "followed_up" || value === "dismissed" ? value : null;
}

export function normalizeImpactFilters(input: {
  range?: string | string[];
  category?: string | string[];
  priority?: string | string[];
  page?: string | string[];
}): ImpactFilters {
  const first = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;
  const range = first(input.range);
  const parsedPage = Number.parseInt(first(input.page) ?? "1", 10);

  return {
    days: range === "7" ? 7 : range === "90" ? 90 : 30,
    category: parseCategory(first(input.category)),
    priority: IMPACT_PRIORITIES.includes(first(input.priority) as ImpactPriority)
      ? first(input.priority) as ImpactPriority
      : null,
    page: Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), 999) : 1,
  };
}

export function parseImpactDashboard(value: unknown): ImpactDashboardData {
  const root = asRecord(value);
  const metrics = asRecord(root.metrics);
  const priorities = asRecord(root.priority_summary);
  const periodDays: ImpactPeriod = root.period_days === 7 ? 7 : root.period_days === 90 ? 90 : 30;

  return {
    generatedAt: asString(root.generated_at, new Date().toISOString()),
    periodDays,
    categoryFilter: parseCategory(root.category_filter),
    priorityFilter: IMPACT_PRIORITIES.includes(root.priority_filter as ImpactPriority)
      ? root.priority_filter as ImpactPriority
      : null,
    metrics: {
      activeJobs: Math.floor(asNumber(metrics.active_jobs)),
      applications: Math.floor(asNumber(metrics.applications)),
      placementRate: asNumber(metrics.placement_rate),
      activeSupplierOffers: Math.floor(asNumber(metrics.active_supplier_offers)),
    },
    prioritySummary: {
      high: Math.floor(asNumber(priorities.high)),
      medium: Math.floor(asNumber(priorities.medium)),
      low: Math.floor(asNumber(priorities.low)),
      pending: Math.floor(asNumber(priorities.pending)),
    },
    recommendations: asArray(root.recommendations).map((value) => {
      const item = asRecord(value);
      return {
        itemType: parseItemType(item.item_type),
        itemId: asString(item.item_id),
        itemName: asString(item.item_name, "Item Pull"),
        priority: parsePriority(item.priority),
        recommendation: asString(item.recommendation),
      };
    }),
    total: Math.floor(asNumber(root.total)),
    page: Math.max(1, Math.floor(asNumber(root.page))),
    pageSize: Math.max(1, Math.floor(asNumber(root.page_size))),
    items: asArray(root.items).map((value) => {
      const item = asRecord(value);
      return {
        itemType: parseItemType(item.item_type),
        itemId: asString(item.item_id),
        itemName: asString(item.item_name, "Item Pull"),
        category: parseCategory(item.category) ?? "recruitment",
        status: asString(item.status, "unknown"),
        priority: parsePriority(item.priority),
        eventTime: asString(item.event_time, new Date(0).toISOString()),
        ownerName: asString(item.owner_name, "Pengguna Pull"),
        recommendation: asString(item.recommendation),
        latestAction: parseActionType(item.latest_action),
        actionTime: asNullableString(item.action_time),
      };
    }),
    actionLog: asArray(root.action_log).map((value) => {
      const action = asRecord(value);
      return {
        id: asString(action.id),
        actorName: asString(action.actor_name, "Administrator"),
        itemType: parseItemType(action.item_type),
        itemId: asString(action.item_id),
        itemName: asString(action.item_name, "Item Pull"),
        actionType: parseActionType(action.action_type) ?? "followed_up",
        note: asNullableString(action.note),
        previousPriority: parsePriority(action.previous_priority),
        createdAt: asString(action.created_at, new Date(0).toISOString()),
      };
    }),
  };
}

