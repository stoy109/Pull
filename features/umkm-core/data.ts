import "server-only";

import type { User } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { isCoreSetupError, queryErrorMessage } from "./errors";
import type {
  BusinessProduct,
  BuyerOrder,
  DashboardIdentity,
  JobsWorkspace,
  OwnedJob,
  OwnedJobApplication,
  PointsEntry,
  Pool,
  PoolsWorkspace,
  ProfileWorkspace,
  ProtectedLoadResult,
  PublicProduct,
  PublicProfileResult,
  PublicReview,
  PublicUmkmProfile,
  PublishWorkspace,
  ReceivedRating,
  SupplierOffer,
  TrustWorkspace,
} from "./types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type BasicProfileRow = {
  business_name: string | null;
  display_name: string | null;
  headline: string | null;
  phone: string | null;
};

type ProtectedContext = {
  client: SupabaseClient;
  identity: DashboardIdentity;
  identityError: string | null;
  userId: string;
};

function metadataString(user: User, key: string) {
  const value = user.user_metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeHttpUrl(value: unknown) {
  const text = optionalString(value);
  if (!text) return null;
  try {
    const url = new URL(text);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

async function getProtectedContext(): Promise<ProtectedContext> {
  const { user } = await requireRole(["umkm"]);
  const client = await createClient();
  const profileResult = await client
    .from("profiles")
    .select("display_name,business_name,headline,phone")
    .eq("id", user.id)
    .maybeSingle<BasicProfileRow>();
  const profile = profileResult.data;
  const persistedFields = [
    profile?.display_name,
    profile?.business_name,
    profile?.headline,
    profile?.phone,
  ];

  return {
    client,
    identity: {
      businessName:
        optionalString(profile?.business_name) ??
        metadataString(user, "business_name") ??
        "Usaha Anda",
      ownerName:
        optionalString(profile?.display_name) ??
        metadataString(user, "display_name") ??
        metadataString(user, "full_name") ??
        "Pemilik UMKM",
      profileCompletion: persistedFields.filter((field) => optionalString(field)).length * 25,
    },
    identityError: profileResult.error
      ? queryErrorMessage(profileResult.error, "Identitas dashboard")
      : null,
    userId: user.id,
  };
}

function protectedResult(
  identity: DashboardIdentity,
  data: null,
  error: string,
): ProtectedLoadResult<never>;
function protectedResult<T>(
  identity: DashboardIdentity,
  data: T,
  error: null,
): ProtectedLoadResult<T>;
function protectedResult<T>(
  identity: DashboardIdentity,
  data: T | null,
  error: string | null,
): ProtectedLoadResult<T> {
  return { data, error, identity };
}

type PoolRow = {
  category: string;
  created_at: string;
  current_quantity: number | string;
  deadline: string;
  description: string;
  district: string;
  hub: string | null;
  id: string;
  item_name: string;
  latitude: number | string | null;
  longitude: number | string | null;
  market_price: number | string | null;
  min_threshold: number | string;
  owner_id: string;
  status: string;
  target_quantity: number | string;
  tier1_price: number | string | null;
  tier2_price: number | string | null;
  unit: string;
};

type PoolMemberRow = {
  pool_id: string;
  quantity: number | string;
};

type OfferRow = {
  description: string | null;
  id: string;
  min_order_quantity: number | string;
  pool_id: string | null;
  stock_quantity: number | string;
  unit_price: number | string;
};

type OrderRow = {
  created_at: string;
  id: string;
  pool_id: string;
  quantity: number | string;
  status: string;
  total: number | string;
  unit: string;
  unit_price: number | string;
};

export async function getPoolsWorkspace(): Promise<ProtectedLoadResult<PoolsWorkspace>> {
  const context = await getProtectedContext();
  if (context.identityError) {
    return protectedResult(context.identity, null, context.identityError);
  }

  const poolsResult = await context.client
    .from("pools")
    .select(
      "id,owner_id,item_name,category,description,unit,target_quantity,current_quantity,min_threshold,tier1_price,tier2_price,market_price,district,latitude,longitude,deadline,status,hub,created_at",
    )
    .order("created_at", { ascending: false });

  if (poolsResult.error) {
    return protectedResult(
      context.identity,
      null,
      queryErrorMessage(poolsResult.error, "Data pool"),
    );
  }

  const poolRows = (poolsResult.data ?? []) as PoolRow[];
  const readyOwnedIds = poolRows
    .filter(
      (pool) =>
        pool.owner_id === context.userId &&
        ["threshold_met", "ready"].includes(pool.status) &&
        asNumber(pool.current_quantity) >= asNumber(pool.min_threshold),
    )
    .map((pool) => pool.id);

  const [membersResult, ordersResult, offersResult] = await Promise.all([
    context.client
      .from("pool_members")
      .select("pool_id,quantity")
      .eq("member_id", context.userId),
    context.client
      .from("supplier_orders")
      .select("id,pool_id,quantity,unit,unit_price,total,status,created_at")
      .eq("buyer_id", context.userId)
      .order("created_at", { ascending: false }),
    readyOwnedIds.length
      ? context.client
          .from("supplier_offers")
          .select("id,pool_id,unit_price,stock_quantity,min_order_quantity,description")
          .in("pool_id", readyOwnedIds)
          .eq("status", "active")
          .order("unit_price", { ascending: true })
      : Promise.resolve({ data: [] as OfferRow[], error: null }),
  ]);

  const firstError = membersResult.error ?? ordersResult.error ?? offersResult.error;
  if (firstError) {
    return protectedResult(
      context.identity,
      null,
      queryErrorMessage(firstError, "Rincian pool dan pesanan"),
    );
  }

  const joinedByPool = new Map(
    ((membersResult.data ?? []) as PoolMemberRow[]).map((member) => [
      member.pool_id,
      asNumber(member.quantity),
    ]),
  );
  const offersByPool = new Map<string, SupplierOffer[]>();
  for (const offer of (offersResult.data ?? []) as OfferRow[]) {
    if (!offer.pool_id) continue;
    const item: SupplierOffer = {
      description: optionalString(offer.description),
      id: offer.id,
      minOrderQuantity: asNumber(offer.min_order_quantity),
      stockQuantity: asNumber(offer.stock_quantity),
      unitPrice: asNumber(offer.unit_price),
    };
    offersByPool.set(offer.pool_id, [...(offersByPool.get(offer.pool_id) ?? []), item]);
  }

  const now = Date.now();
  const pools: Pool[] = poolRows.map((pool) => {
    const currentQuantity = asNumber(pool.current_quantity);
    const targetQuantity = asNumber(pool.target_quantity);
    return {
      category: pool.category,
      createdAt: pool.created_at,
      currentQuantity,
      deadline: pool.deadline,
      description: pool.description,
      district: pool.district,
      hub: optionalString(pool.hub),
      id: pool.id,
      isOwner: pool.owner_id === context.userId,
      itemName: pool.item_name,
      joinable:
        ["open", "threshold_met"].includes(pool.status) &&
        currentQuantity < targetQuantity &&
        new Date(pool.deadline).getTime() > now,
      joinedQuantity: joinedByPool.get(pool.id) ?? null,
      latitude: pool.latitude === null ? null : asNumber(pool.latitude),
      longitude: pool.longitude === null ? null : asNumber(pool.longitude),
      marketPrice: pool.market_price === null ? null : asNumber(pool.market_price),
      minThreshold: asNumber(pool.min_threshold),
      offers: offersByPool.get(pool.id) ?? [],
      progress: targetQuantity > 0 ? Math.min(100, (currentQuantity / targetQuantity) * 100) : 0,
      status: pool.status,
      targetQuantity,
      tier1Price: pool.tier1_price === null ? null : asNumber(pool.tier1_price),
      tier2Price: pool.tier2_price === null ? null : asNumber(pool.tier2_price),
      unit: pool.unit,
    };
  });
  const poolById = new Map(pools.map((pool) => [pool.id, pool]));
  const orders: BuyerOrder[] = ((ordersResult.data ?? []) as OrderRow[]).map((order) => ({
    createdAt: order.created_at,
    id: order.id,
    itemName: poolById.get(order.pool_id)?.itemName ?? "Pesanan bahan baku",
    quantity: asNumber(order.quantity),
    status: order.status,
    total: asNumber(order.total),
    unit: order.unit,
    unitPrice: asNumber(order.unit_price),
  }));

  return protectedResult(
    context.identity,
    {
      joinedPools: pools.filter((pool) => pool.joinedQuantity !== null),
      openPools: pools.filter((pool) => pool.joinable),
      orders,
      ownedPools: pools.filter((pool) => pool.isOwner),
    },
    null,
  );
}

type JobRow = {
  category: string | null;
  created_at: string;
  description: string;
  district: string | null;
  duration_days: number | null;
  end_date: string | null;
  hours_per_day: number | string | null;
  id: string;
  quota: number;
  requirements: string | null;
  start_date: string | null;
  status: string;
  title: string;
  wage_amount: number | string | null;
  wage_unit: string | null;
};

type ApplicationRow = {
  completed_at: string | null;
  created_at: string;
  id: string;
  job_id: string;
  message: string;
  owner_confirmed_at: string | null;
  status: string;
  worker_confirmed_at: string | null;
};

type JobRatingRow = {
  job_application_id: string | null;
};

const JOB_SELECT =
  "id,title,description,status,category,district,wage_amount,wage_unit,duration_days,start_date,end_date,quota,hours_per_day,requirements,created_at";

export async function getJobsWorkspace(): Promise<ProtectedLoadResult<JobsWorkspace>> {
  const context = await getProtectedContext();
  if (context.identityError) {
    return protectedResult(context.identity, null, context.identityError);
  }

  const jobsResult = await context.client
    .from("job_postings")
    .select(JOB_SELECT)
    .eq("owner_id", context.userId)
    .order("created_at", { ascending: false });
  if (jobsResult.error) {
    return protectedResult(
      context.identity,
      null,
      queryErrorMessage(jobsResult.error, "Lowongan"),
    );
  }

  const jobRows = (jobsResult.data ?? []) as JobRow[];
  const jobIds = jobRows.map((job) => job.id);
  let applicationRows: ApplicationRow[] = [];
  if (jobIds.length) {
    const applicationsResult = await context.client
      .from("job_applications")
      .select(
        "id,job_id,message,status,owner_confirmed_at,worker_confirmed_at,completed_at,created_at",
      )
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });
    if (applicationsResult.error) {
      return protectedResult(
        context.identity,
        null,
        queryErrorMessage(applicationsResult.error, "Lamaran"),
      );
    }
    applicationRows = (applicationsResult.data ?? []) as ApplicationRow[];
  }

  const completedApplicationIds = applicationRows
    .filter((application) => application.status === "completed")
    .map((application) => application.id);
  let ratedApplicationIds = new Set<string>();
  if (completedApplicationIds.length) {
    const ratingsResult = await context.client
      .from("ratings")
      .select("job_application_id")
      .eq("rater_id", context.userId)
      .in("job_application_id", completedApplicationIds);
    if (ratingsResult.error) {
      return protectedResult(
        context.identity,
        null,
        queryErrorMessage(ratingsResult.error, "Status rating"),
      );
    }
    ratedApplicationIds = new Set(
      ((ratingsResult.data ?? []) as JobRatingRow[])
        .map((rating) => rating.job_application_id)
        .filter((id): id is string => Boolean(id)),
    );
  }

  const applicationsByJob = new Map<string, OwnedJobApplication[]>();
  for (const application of applicationRows) {
    const item: OwnedJobApplication = {
      completedAt: application.completed_at,
      createdAt: application.created_at,
      id: application.id,
      label: `Pelamar ${application.id.slice(0, 6).toUpperCase()}`,
      message: application.message,
      ownerConfirmedAt: application.owner_confirmed_at,
      rated: ratedApplicationIds.has(application.id),
      status: application.status,
      workerConfirmedAt: application.worker_confirmed_at,
    };
    applicationsByJob.set(application.job_id, [
      ...(applicationsByJob.get(application.job_id) ?? []),
      item,
    ]);
  }

  const jobs: OwnedJob[] = jobRows.map((job) => ({
    applications: applicationsByJob.get(job.id) ?? [],
    category: optionalString(job.category),
    createdAt: job.created_at,
    description: job.description,
    district: optionalString(job.district),
    durationDays: job.duration_days,
    endDate: job.end_date,
    hoursPerDay: job.hours_per_day === null ? null : asNumber(job.hours_per_day),
    id: job.id,
    quota: asNumber(job.quota, 1),
    requirements: optionalString(job.requirements),
    startDate: job.start_date,
    status: job.status,
    title: job.title,
    wageAmount: job.wage_amount === null ? null : asNumber(job.wage_amount),
    wageUnit: optionalString(job.wage_unit),
  }));

  return protectedResult(context.identity, { jobs }, null);
}

export async function getPublishWorkspace(): Promise<ProtectedLoadResult<PublishWorkspace>> {
  const context = await getProtectedContext();
  if (context.identityError) {
    return protectedResult(context.identity, null, context.identityError);
  }

  const jobsResult = await context.client
    .from("job_postings")
    .select("id,title,status,category,district,created_at")
    .eq("owner_id", context.userId)
    .order("created_at", { ascending: false })
    .limit(8);
  if (jobsResult.error) {
    return protectedResult(
      context.identity,
      null,
      queryErrorMessage(jobsResult.error, "Lowongan terbaru"),
    );
  }

  const rows = (jobsResult.data ?? []) as Array<{
    category: string | null;
    created_at: string;
    district: string | null;
    id: string;
    status: string;
    title: string;
  }>;
  return protectedResult(
    context.identity,
    {
      recentJobs: rows.map((job) => ({
        category: optionalString(job.category),
        createdAt: job.created_at,
        district: optionalString(job.district),
        id: job.id,
        status: job.status,
        title: job.title,
      })),
    },
    null,
  );
}

type FullProfileRow = {
  business_address: string | null;
  business_category: string | null;
  business_description: string | null;
  business_name: string | null;
  cover_url: string | null;
  district: string | null;
  latitude: number | string | null;
  logo_url: string | null;
  longitude: number | string | null;
  phone: string | null;
  public_slug: string;
  storefront_enabled: boolean;
  website_url: string | null;
  whatsapp_verified_at: string | null;
};

type ProductRow = {
  category: string;
  description: string | null;
  id: string;
  image_url: string | null;
  is_active: boolean;
  name: string;
  price: number | string;
  unit: string;
  updated_at: string;
};

export async function getProfileWorkspace(): Promise<ProtectedLoadResult<ProfileWorkspace>> {
  const context = await getProtectedContext();
  if (context.identityError) {
    return protectedResult(context.identity, null, context.identityError);
  }

  const [profileResult, productsResult] = await Promise.all([
    context.client
      .from("profiles")
      .select(
        "public_slug,business_name,business_description,business_category,business_address,district,latitude,longitude,phone,logo_url,cover_url,website_url,storefront_enabled,whatsapp_verified_at",
      )
      .eq("id", context.userId)
      .maybeSingle<FullProfileRow>(),
    context.client
      .from("business_products")
      .select("id,name,category,description,unit,price,image_url,is_active,updated_at")
      .eq("owner_id", context.userId)
      .order("updated_at", { ascending: false }),
  ]);
  const firstError = profileResult.error ?? productsResult.error;
  if (firstError) {
    return protectedResult(
      context.identity,
      null,
      queryErrorMessage(firstError, "Profil bisnis"),
    );
  }
  if (!profileResult.data) {
    return protectedResult(
      context.identity,
      null,
      "Profil bisnis tidak ditemukan untuk akun ini.",
    );
  }

  const row = profileResult.data;
  const products: BusinessProduct[] = ((productsResult.data ?? []) as ProductRow[]).map(
    (product) => ({
      category: product.category,
      description: optionalString(product.description),
      id: product.id,
      imageUrl: safeHttpUrl(product.image_url),
      isActive: product.is_active,
      name: product.name,
      price: asNumber(product.price),
      unit: product.unit,
      updatedAt: product.updated_at,
    }),
  );

  return protectedResult(
    context.identity,
    {
      products,
      profile: {
        address: optionalString(row.business_address),
        businessName: optionalString(row.business_name) ?? context.identity.businessName,
        category: optionalString(row.business_category),
        coverUrl: safeHttpUrl(row.cover_url),
        description: optionalString(row.business_description),
        district: optionalString(row.district),
        latitude: row.latitude === null ? null : asNumber(row.latitude),
        logoUrl: safeHttpUrl(row.logo_url),
        longitude: row.longitude === null ? null : asNumber(row.longitude),
        publicSlug: row.public_slug,
        storefrontEnabled: row.storefront_enabled,
        websiteUrl: safeHttpUrl(row.website_url),
        whatsapp: optionalString(row.phone),
        whatsappVerified: Boolean(row.whatsapp_verified_at),
      },
    },
    null,
  );
}

type TrustProfileRow = {
  rating_count: number;
  trust_score: number | string;
};

type ReceivedRatingRow = {
  created_at: string;
  id: string;
  job_application_id: string | null;
  review: string | null;
  score: number;
  supplier_order_id: string | null;
};

type PointsRow = {
  created_at: string;
  id: string;
  job_application_id: string | null;
  points: number;
  reason: string;
  supplier_order_id: string | null;
};

export async function getTrustWorkspace(): Promise<ProtectedLoadResult<TrustWorkspace>> {
  const context = await getProtectedContext();
  if (context.identityError) {
    return protectedResult(context.identity, null, context.identityError);
  }

  const [profileResult, ratingsResult, pointsResult, ordersResult, jobsResult] =
    await Promise.all([
      context.client
        .from("profiles")
        .select("trust_score,rating_count")
        .eq("id", context.userId)
        .maybeSingle<TrustProfileRow>(),
      context.client
        .from("ratings")
        .select("id,score,review,job_application_id,supplier_order_id,created_at")
        .eq("rated_profile_id", context.userId)
        .order("created_at", { ascending: false }),
      context.client
        .from("points_ledger")
        .select("id,points,reason,job_application_id,supplier_order_id,created_at")
        .eq("profile_id", context.userId)
        .order("created_at", { ascending: false }),
      context.client
        .from("supplier_orders")
        .select("status,total")
        .eq("buyer_id", context.userId),
      context.client.from("job_postings").select("id").eq("owner_id", context.userId),
    ]);
  const firstError =
    profileResult.error ??
    ratingsResult.error ??
    pointsResult.error ??
    ordersResult.error ??
    jobsResult.error;
  if (firstError) {
    return protectedResult(
      context.identity,
      null,
      queryErrorMessage(firstError, "Data reputasi"),
    );
  }
  if (!profileResult.data) {
    return protectedResult(context.identity, null, "Profil reputasi tidak ditemukan.");
  }

  const jobIds = ((jobsResult.data ?? []) as Array<{ id: string }>).map((job) => job.id);
  let completedJobs = 0;
  if (jobIds.length) {
    const applicationsResult = await context.client
      .from("job_applications")
      .select("id", { count: "exact", head: true })
      .in("job_id", jobIds)
      .eq("status", "completed");
    if (applicationsResult.error) {
      return protectedResult(
        context.identity,
        null,
        queryErrorMessage(applicationsResult.error, "Statistik pekerjaan selesai"),
      );
    }
    completedJobs = applicationsResult.count ?? 0;
  }

  const ratingRows = (ratingsResult.data ?? []) as ReceivedRatingRow[];
  const ratings: ReceivedRating[] = ratingRows.map((rating) => ({
    createdAt: rating.created_at,
    id: rating.id,
    review: optionalString(rating.review),
    score: asNumber(rating.score),
    transactionType: rating.job_application_id ? "job" : "order",
  }));
  const points: PointsEntry[] = ((pointsResult.data ?? []) as PointsRow[]).map(
    (entry) => ({
      createdAt: entry.created_at,
      id: entry.id,
      points: asNumber(entry.points),
      reason: entry.reason,
      transactionType: entry.job_application_id
        ? "job"
        : entry.supplier_order_id
          ? "order"
          : "other",
    }),
  );
  const completedOrders = ((ordersResult.data ?? []) as Array<{
    status: string;
    total: number | string;
  }>).filter((order) => order.status === "completed");
  const averageRating = ratingRows.length
    ? ratingRows.reduce((total, rating) => total + asNumber(rating.score), 0) /
      ratingRows.length
    : null;

  return protectedResult(
    context.identity,
    {
      averageRating,
      completedJobs,
      completedOrders: completedOrders.length,
      completedOrderValue: completedOrders.reduce(
        (total, order) => total + asNumber(order.total),
        0,
      ),
      points,
      ratingCount: asNumber(profileResult.data.rating_count),
      ratings,
      totalPoints: points.reduce((total, entry) => total + entry.points, 0),
      trustScore: asNumber(profileResult.data.trust_score),
    },
    null,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function publicProduct(value: unknown): PublicProduct | null {
  if (!isRecord(value)) return null;
  const id = optionalString(value.id);
  const name = optionalString(value.name);
  const category = optionalString(value.category);
  const unit = optionalString(value.unit);
  const price = asNumber(value.price, Number.NaN);
  if (!id || !name || !category || !unit || !Number.isFinite(price)) return null;
  return {
    category,
    description: optionalString(value.description),
    id,
    imageUrl: safeHttpUrl(value.image_url),
    name,
    price,
    unit,
  };
}

function publicReview(value: unknown): PublicReview | null {
  if (!isRecord(value)) return null;
  const review = optionalString(value.review);
  const createdAt = optionalString(value.created_at);
  const score = asNumber(value.score, Number.NaN);
  if (!review || !createdAt || !Number.isInteger(score) || score < 1 || score > 5) {
    return null;
  }
  return { createdAt, review, score };
}

function parsePublicProfile(value: unknown): PublicUmkmProfile | null {
  if (!isRecord(value)) return null;
  const slug = optionalString(value.slug);
  const businessName = optionalString(value.business_name);
  const productsRaw = Array.isArray(value.products) ? value.products : null;
  const reviewsRaw = Array.isArray(value.reviews) ? value.reviews : null;
  if (!slug || !businessName || !productsRaw || !reviewsRaw) return null;
  const products = productsRaw.map(publicProduct);
  const reviews = reviewsRaw.map(publicReview);
  if (products.some((product) => !product) || reviews.some((review) => !review)) return null;

  return {
    address: optionalString(value.address),
    businessName,
    category: optionalString(value.category),
    coverUrl: safeHttpUrl(value.cover_url),
    description: optionalString(value.description),
    district: optionalString(value.district),
    headline: optionalString(value.headline),
    latitude: value.latitude === null ? null : asNumber(value.latitude, Number.NaN),
    logoUrl: safeHttpUrl(value.logo_url),
    longitude: value.longitude === null ? null : asNumber(value.longitude, Number.NaN),
    products: products as PublicProduct[],
    profileViews: Math.max(0, asNumber(value.profile_views)),
    ratingCount: Math.max(0, asNumber(value.rating_count)),
    reviews: reviews as PublicReview[],
    slug,
    trustScore: Math.min(100, Math.max(0, asNumber(value.trust_score))),
    verificationLevel: Math.min(2, Math.max(0, asNumber(value.verification_level))),
    websiteAvailable: value.website_available === true,
    whatsappAvailable: value.whatsapp_available === true,
  };
}

const PUBLIC_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function getPublicUmkmProfile(slug: string): Promise<PublicProfileResult> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (
    normalizedSlug.length < 3 ||
    normalizedSlug.length > 80 ||
    !PUBLIC_SLUG_PATTERN.test(normalizedSlug)
  ) {
    return { kind: "not-found" };
  }

  const client = await createClient();
  const profileResult = await client.rpc("get_public_umkm_profile", {
    profile_slug: normalizedSlug,
  });
  if (profileResult.error) {
    if (
      profileResult.error.message
        ?.toLowerCase()
        .includes("public profile is not available")
    ) {
      return { kind: "not-found" };
    }
    return {
      kind: "error",
      message: queryErrorMessage(profileResult.error, "Profil publik"),
    };
  }

  const profile = parsePublicProfile(profileResult.data);
  if (!profile) {
    return {
      kind: "error",
      message: "Profil publik mengembalikan data yang tidak valid.",
    };
  }

  const viewResult = await client.rpc("record_public_profile_view", {
    profile_slug: normalizedSlug,
  });
  if (viewResult.error && isCoreSetupError(viewResult.error)) {
    return {
      kind: "error",
      message: queryErrorMessage(viewResult.error, "Pencatatan kunjungan profil"),
    };
  }

  return { kind: "ok", profile };
}
