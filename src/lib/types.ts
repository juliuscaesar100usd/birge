export type Locale = "ru" | "kk" | "en";
export type BudgetBand = "low" | "mid" | "high";
export type GroupStatus = "open" | "locked" | "completed" | "failed";
export type OrderMode = "solo" | "group";

export interface Marketplace {
  id: string;
  name: string;
  badgeColor: string;
  baseCurrency: string;
  fxToKzt: number;
  foreign: boolean; // cross-border → VAT / customs notes
}

export interface Category {
  id: string;
  nameRu: string;
  nameKk: string;
  nameEn: string;
  icon: string; // emoji (legacy)
  iconName: string; // stroke icon id (components/Icon)
  tint: string; // soft tile background
  ink: string; // matching darker accent
}

export interface PriceTier {
  minParticipants: number;
  unitPriceKzt: number;
}

export interface Product {
  id: string;
  marketplaceId: string;
  categoryId: string;
  titleRu: string;
  titleKk: string;
  titleEn: string;
  descriptionRu: string;
  descriptionKk: string;
  descriptionEn: string;
  emoji: string;
  gradient: [string, string];
  image?: string; // local photo under /public; emoji+tint tile is the fallback
  externalUrl?: string; // exact live marketplace listing this product mirrors
  soloPriceKzt: number;
  priceTiers: PriceTier[]; // strictly decreasing price as minParticipants grows
  deliveryDays: number;
  deliveryKzt: number;
  vatApplicable: boolean;
  popularityScore: number; // 0..1
  popularCities?: string[];
  stockStatus: "in_stock" | "out";
  rating: number; // 4.5–4.9, deterministic
  reviews: number;
}

export interface GroupMember {
  id: string;
  name: string;
  isSimulated: boolean;
  joinedAt: number;
}

export interface Group {
  id: string;
  productId: string;
  creatorId: string;
  status: GroupStatus;
  minParticipants: number;
  targetParticipants: number;
  members: GroupMember[];
  currentTierPriceKzt: number;
  deadlineAt: number; // epoch ms
  createdAt: number;
}

export interface Order {
  id: string;
  productId: string;
  groupId?: string;
  mode: OrderMode;
  unitPriceKzt: number;
  qty: number;
  savingsVsSoloKzt: number;
  vatKzt: number;
  deliveryKzt: number;
  couponValue: number;
  totalKzt: number;
  status: "confirmed";
  createdAt: number;
}

export interface Coupon {
  code: string;
  valueKzt: number;
  expiresAt: number;
  used: boolean;
}

export interface Referral {
  id: string;
  inviteeName: string;
  groupId: string;
  rewardKzt: number;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  phone: string;
  displayName: string;
  name?: string; // user-chosen name; shown in profile and as your group-member name
  isVerified: boolean;
  carrierLabel: string;
  budgetBand: BudgetBand;
  city: string;
  interests: string[]; // category ids
  likedProducts: string[]; // product ids
  createdAt: number;
}

export type GroupEventType =
  | "member_joined"
  | "tier_unlocked"
  | "group_locked"
  | "group_failed"
  | "deadline_extended"
  | "group_completed";

export interface GroupEvent {
  type: GroupEventType;
  groupId: string;
  memberName?: string;
  priceKzt?: number;
}

export type JoinError = "ALREADY_MEMBER" | "GROUP_CLOSED" | "GROUP_EXPIRED" | "NOT_FOUND";
