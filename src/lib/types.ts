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
  icon: string;
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
  image?: string; // local photo under /public; emoji+gradient is the fallback
  soloPriceKzt: number;
  priceTiers: PriceTier[]; // strictly decreasing price as minParticipants grows
  deliveryDays: number;
  deliveryKzt: number;
  vatApplicable: boolean;
  popularityScore: number; // 0..1
  popularCities?: string[];
  stockStatus: "in_stock" | "out";
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
