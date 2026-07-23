export type DashboardIdentity = {
  businessName: string;
  ownerName: string;
  profileCompletion: number;
};

export type ProtectedLoadResult<T> = {
  data: T | null;
  error: string | null;
  identity: DashboardIdentity;
};

export type SupplierOffer = {
  description: string | null;
  id: string;
  minOrderQuantity: number;
  stockQuantity: number;
  unitPrice: number;
};

export type Pool = {
  category: string;
  createdAt: string;
  currentQuantity: number;
  deadline: string;
  description: string;
  district: string;
  hub: string | null;
  id: string;
  isOwner: boolean;
  itemName: string;
  joinable: boolean;
  latitude: number | null;
  longitude: number | null;
  joinedQuantity: number | null;
  marketPrice: number | null;
  minThreshold: number;
  offers: SupplierOffer[];
  progress: number;
  status: string;
  targetQuantity: number;
  tier1Price: number | null;
  tier2Price: number | null;
  unit: string;
};

export type BuyerOrder = {
  createdAt: string;
  id: string;
  itemName: string;
  quantity: number;
  status: string;
  total: number;
  unit: string;
  unitPrice: number;
};

export type PoolsWorkspace = {
  joinedPools: Pool[];
  openPools: Pool[];
  orders: BuyerOrder[];
  ownedPools: Pool[];
};

export type OwnedJobApplication = {
  completedAt: string | null;
  createdAt: string;
  id: string;
  label: string;
  message: string;
  ownerConfirmedAt: string | null;
  rated: boolean;
  status: string;
  workerConfirmedAt: string | null;
};

export type OwnedJob = {
  applications: OwnedJobApplication[];
  category: string | null;
  createdAt: string;
  description: string;
  district: string | null;
  durationDays: number | null;
  endDate: string | null;
  hoursPerDay: number | null;
  id: string;
  quota: number;
  requirements: string | null;
  startDate: string | null;
  status: string;
  title: string;
  wageAmount: number | null;
  wageUnit: string | null;
};

export type JobsWorkspace = {
  jobs: OwnedJob[];
};

export type PublishWorkspace = {
  recentJobs: Array<{
    category: string | null;
    createdAt: string;
    district: string | null;
    id: string;
    status: string;
    title: string;
  }>;
};

export type BusinessProfile = {
  address: string | null;
  businessName: string;
  category: string | null;
  coverUrl: string | null;
  description: string | null;
  district: string | null;
  latitude: number | null;
  logoUrl: string | null;
  longitude: number | null;
  publicSlug: string;
  storefrontEnabled: boolean;
  websiteUrl: string | null;
  whatsapp: string | null;
  whatsappVerified: boolean;
};

export type BusinessProduct = {
  category: string;
  description: string | null;
  id: string;
  imageUrl: string | null;
  isActive: boolean;
  name: string;
  price: number;
  unit: string;
  updatedAt: string;
};

export type ProfileWorkspace = {
  products: BusinessProduct[];
  profile: BusinessProfile;
};

export type ReceivedRating = {
  createdAt: string;
  id: string;
  review: string | null;
  score: number;
  transactionType: "job" | "order";
};

export type PointsEntry = {
  createdAt: string;
  id: string;
  points: number;
  reason: string;
  transactionType: "job" | "order" | "other";
};

export type TrustWorkspace = {
  averageRating: number | null;
  completedJobs: number;
  completedOrders: number;
  completedOrderValue: number;
  points: PointsEntry[];
  ratingCount: number;
  ratings: ReceivedRating[];
  totalPoints: number;
  trustScore: number;
};

export type PublicProduct = {
  category: string;
  description: string | null;
  id: string;
  imageUrl: string | null;
  name: string;
  price: number;
  unit: string;
};

export type PublicReview = {
  createdAt: string;
  review: string;
  score: number;
};

export type PublicUmkmProfile = {
  address: string | null;
  businessName: string;
  category: string | null;
  coverUrl: string | null;
  description: string | null;
  district: string | null;
  headline: string | null;
  latitude: number | null;
  logoUrl: string | null;
  longitude: number | null;
  products: PublicProduct[];
  profileViews: number;
  ratingCount: number;
  reviews: PublicReview[];
  slug: string;
  trustScore: number;
  verificationLevel: number;
  websiteAvailable: boolean;
  whatsappAvailable: boolean;
};

export type PublicProfileResult =
  | { kind: "ok"; profile: PublicUmkmProfile }
  | { kind: "not-found" }
  | { kind: "error"; message: string };
