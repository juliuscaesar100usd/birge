"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Coupon,
  Group,
  GroupEvent,
  GroupMember,
  JoinError,
  Locale,
  Order,
  OrderMode,
  Referral,
  UserProfile,
} from "@/lib/types";
import { config } from "@/lib/config";
import type { SecurityProfile } from "@/lib/engine/identity";
import { applyDeadline, applyJoin, createGroup, newId, tierPriceFor } from "@/lib/engine/groups";
import { productById } from "@/data/products";
import { pickSimulatedName } from "@/data/names";
import { emitToast, type ToastKind } from "@/lib/events";
import { broadcastSync, type SyncMessage } from "@/lib/sync";
import { formatKzt } from "@/lib/currency";
import { track } from "@/lib/analytics";

type ToastPayload = NonNullable<SyncMessage["toasts"]>[number];

// Fan group events out to local toasts + other tabs (TRD §6 realtime channel, mocked)
function dispatchEvents(events: GroupEvent[]) {
  const toasts: ToastPayload[] = [];
  for (const e of events) {
    let toast: ToastPayload | null = null;
    switch (e.type) {
      case "member_joined":
        toast = { kind: "info", msgKey: "member_joined", params: { name: e.memberName ?? "" } };
        break;
      case "tier_unlocked":
        toast = { kind: "gold", msgKey: "tier_unlocked", params: { price: formatKzt(e.priceKzt ?? 0) } };
        break;
      case "group_locked":
        toast = { kind: "success", msgKey: "group_locked_title" };
        track("threshold_reached", { groupId: e.groupId, price: e.priceKzt });
        break;
      case "deadline_extended":
        toast = { kind: "info", msgKey: "deadline_extended" };
        break;
      case "group_failed":
        toast = { kind: "info", msgKey: "group_failed" };
        break;
      case "group_completed":
        toast = { kind: "success", msgKey: "group_completed_toast" };
        break;
    }
    if (toast) {
      emitToast(toast.kind as ToastKind, toast.msgKey as Parameters<typeof emitToast>[1], toast.params);
      toasts.push(toast);
    }
  }
  broadcastSync(toasts);
}

export interface PlaceOrderInput {
  productId: string;
  groupId?: string;
  mode: OrderMode;
  qty: number;
  couponCode?: string;
}

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: "COUPON_INVALID" | "GROUP_NOT_LOCKED" | "OUT_OF_STOCK" };

export type JoinResult = { ok: true } | { ok: false; error: JoinError };

interface BirgeState {
  locale: Locale;
  pendingPhone: string | null;
  user: UserProfile | null;
  security: SecurityProfile | null;
  groups: Record<string, Group>;
  orders: Order[];
  coupons: Coupon[];
  referrals: Referral[];
  pendingReferralGroupId: string | null;
  _hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
  setLocale: (l: Locale) => void;
  setPendingPhone: (phone: string) => void;
  completeVerification: (security?: SecurityProfile) => void;
  updatePreferences: (
    patch: Partial<Pick<UserProfile, "interests" | "budgetBand" | "city">>
  ) => void;
  toggleLike: (productId: string) => void;
  ensureSeeds: () => void;
  startGroup: (productId: string) => string | null;
  joinGroup: (groupId: string) => JoinResult;
  simulateJoin: (groupId: string) => void;
  tickDeadlines: () => void;
  markInviteShared: (groupId: string, channel: string) => void;
  placeOrder: (input: PlaceOrderInput) => PlaceOrderResult;
  resetAll: () => void;
}

function seedGroups(): Record<string, Group> {
  const now = Date.now();
  const heroProduct = productById["prd_01"];
  const secondProduct = productById["prd_02"];
  const mkMember = (id: string, name: string, minutesAgo: number): GroupMember => ({
    id,
    name,
    isSimulated: true,
    joinedAt: now - minutesAgo * 60_000,
  });
  // Pre-seeded at 4/5 so a single live join completes it during the pitch (TRD §15)
  const hero: Group = {
    id: "grp_seed_1",
    productId: heroProduct.id,
    creatorId: "sim_a",
    status: "open",
    minParticipants: 5,
    targetParticipants: 10,
    members: [
      mkMember("sim_a", "Айгерим", 54),
      mkMember("sim_b", "Даулет", 41),
      mkMember("sim_c", "Мадина", 26),
      mkMember("sim_d", "Алихан", 9),
    ],
    currentTierPriceKzt: tierPriceFor(heroProduct, 4),
    deadlineAt: now + 38 * 60_000,
    createdAt: now - 60 * 60_000,
  };
  const second: Group = {
    id: "grp_seed_2",
    productId: secondProduct.id,
    creatorId: "sim_e",
    status: "open",
    minParticipants: 5,
    targetParticipants: 10,
    members: [mkMember("sim_e", "Аружан", 33), mkMember("sim_f", "Тимур", 12)],
    currentTierPriceKzt: tierPriceFor(secondProduct, 2),
    deadlineAt: now + 52 * 60_000,
    createdAt: now - 40 * 60_000,
  };
  return { [hero.id]: hero, [second.id]: second };
}

export const useBirgeStore = create<BirgeState>()(
  persist(
    (set, get) => ({
      locale: "ru",
      pendingPhone: null,
      user: null,
      security: null,
      groups: {},
      orders: [],
      coupons: [],
      referrals: [],
      pendingReferralGroupId: null,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setLocale: (locale) => set({ locale }),
      setPendingPhone: (phone) => set({ pendingPhone: phone }),

      completeVerification: (security) => {
        const { pendingPhone, user } = get();
        const phone = pendingPhone ?? user?.phone ?? "+77010000000";
        // persist the security profile from the identity provider (FR-1.3)
        if (security) set({ security });
        if (user) return; // already verified — badge + identity persist
        const newUser: UserProfile = {
          id: newId("usr"),
          phone,
          displayName: `+7 ··· ${phone.slice(-4, -2)} ${phone.slice(-2)}`,
          isVerified: true,
          carrierLabel: security?.carrier ?? config.CARRIER_LABEL,
          budgetBand: "mid",
          city: "almaty",
          interests: [],
          likedProducts: [],
          createdAt: Date.now(),
        };
        const welcome: Coupon = {
          code: "WELCOME5",
          valueKzt: config.WELCOME_COUPON_KZT,
          expiresAt: Date.now() + 48 * 60 * 60_000,
          used: false,
        };
        set({ user: newUser, coupons: [...get().coupons, welcome] });
        track("identity_verified", {
          method: security?.method ?? "sna",
          simType: security?.simType ?? "esim",
          carrier: security?.carrier ?? config.CARRIER_LABEL,
        });
      },

      updatePreferences: (patch) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, ...patch } });
      },

      toggleLike: (productId) => {
        const user = get().user;
        if (!user) return;
        const liked = user.likedProducts.includes(productId)
          ? user.likedProducts.filter((id) => id !== productId)
          : [...user.likedProducts, productId];
        set({ user: { ...user, likedProducts: liked } });
      },

      ensureSeeds: () => {
        const { groups } = get();
        if (!groups["grp_seed_1"]) {
          set({ groups: { ...seedGroups(), ...groups } });
          return;
        }
        // keep seeded open groups demo-fresh across sessions
        const now = Date.now();
        const refreshed = { ...groups };
        let changed = false;
        for (const g of Object.values(refreshed)) {
          if (g.id.startsWith("grp_seed") && g.status === "open" && g.deadlineAt < now + 5 * 60_000) {
            refreshed[g.id] = { ...g, deadlineAt: now + 38 * 60_000 };
            changed = true;
          }
        }
        if (changed) set({ groups: refreshed });
      },

      startGroup: (productId) => {
        const { user, groups } = get();
        const product = productById[productId];
        if (!user || !product || product.stockStatus === "out") return null;
        const creator: GroupMember = {
          id: user.id,
          name: user.displayName,
          isSimulated: false,
          joinedAt: Date.now(),
        };
        const group = createGroup(product, creator);
        set({ groups: { ...groups, [group.id]: group } });
        track("group_started", { groupId: group.id, productId });
        broadcastSync();
        return group.id;
      },

      joinGroup: (groupId) => {
        const { user, groups } = get();
        const group = groups[groupId];
        if (!user) return { ok: false, error: "NOT_FOUND" };
        if (!group) return { ok: false, error: "NOT_FOUND" };
        const product = productById[group.productId];
        const member: GroupMember = {
          id: user.id,
          name: user.displayName,
          isSimulated: false,
          joinedAt: Date.now(),
        };
        const outcome = applyJoin(group, product, member);
        if (!outcome.ok) return { ok: false, error: outcome.error };
        set({ groups: { ...groups, [groupId]: outcome.group } });
        track("group_joined", { groupId, count: outcome.group.members.length });
        dispatchEvents(outcome.events);
        return { ok: true };
      },

      simulateJoin: (groupId) => {
        const state = get();
        const group = state.groups[groupId];
        if (!group || group.status !== "open") return;
        const product = productById[group.productId];
        const userIsMember = !!state.user && group.members.some((m) => m.id === state.user!.id);
        // Don't let simulated joins complete a group the user hasn't joined —
        // the live join must be the one that locks it (demo determinism, TRD §7.3)
        if (!userIsMember && group.members.length + 1 >= group.minParticipants) return;
        const member: GroupMember = {
          id: newId("sim"),
          name: pickSimulatedName(group.members.map((m) => m.name)),
          isSimulated: true,
          joinedAt: Date.now(),
        };
        const outcome = applyJoin(group, product, member);
        if (!outcome.ok) return;
        let { referrals, coupons, pendingReferralGroupId } = state;
        const extraToasts: ToastPayload[] = [];
        // FR-8.1: the first simulated joiner after a share counts as the invited friend
        if (pendingReferralGroupId === groupId) {
          const referral: Referral = {
            id: newId("ref"),
            inviteeName: member.name,
            groupId,
            rewardKzt: config.REFERRAL_REWARD_KZT,
            createdAt: Date.now(),
          };
          const coupon: Coupon = {
            code: `FRIEND-${referral.id.slice(-4).toUpperCase()}`,
            valueKzt: config.REFERRAL_REWARD_KZT,
            expiresAt: Date.now() + 48 * 60 * 60_000,
            used: false,
          };
          referrals = [...referrals, referral];
          coupons = [...coupons, coupon];
          pendingReferralGroupId = null;
          extraToasts.push({
            kind: "gold",
            msgKey: "referral_joined",
            params: { name: member.name, amount: formatKzt(config.REFERRAL_REWARD_KZT) },
          });
        }
        set({
          groups: { ...state.groups, [groupId]: outcome.group },
          referrals,
          coupons,
          pendingReferralGroupId,
        });
        dispatchEvents(outcome.events);
        for (const t of extraToasts) {
          emitToast(t.kind as ToastKind, t.msgKey as Parameters<typeof emitToast>[1], t.params);
        }
      },

      tickDeadlines: () => {
        const { groups } = get();
        let changed = false;
        const next = { ...groups };
        const allEvents: GroupEvent[] = [];
        for (const g of Object.values(groups)) {
          const { group, events } = applyDeadline(g);
          if (events.length > 0) {
            next[g.id] = group;
            allEvents.push(...events);
            changed = true;
          }
        }
        if (changed) {
          set({ groups: next });
          dispatchEvents(allEvents);
        }
      },

      markInviteShared: (groupId, channel) => {
        set({ pendingReferralGroupId: groupId });
        track("invite_sent", { groupId, channel });
      },

      placeOrder: (input) => {
        const state = get();
        const product = productById[input.productId];
        if (!product || product.stockStatus === "out") {
          return { ok: false, error: "OUT_OF_STOCK" };
        }
        const group = input.groupId ? state.groups[input.groupId] : undefined;
        if (input.mode === "group") {
          // Spec §2.5: group orders require LOCKED or COMPLETED
          if (!group || (group.status !== "locked" && group.status !== "completed")) {
            return { ok: false, error: "GROUP_NOT_LOCKED" };
          }
        }
        const unit = input.mode === "group" && group ? group.currentTierPriceKzt : product.soloPriceKzt;
        const qty = Math.max(1, input.qty);

        let couponValue = 0;
        let coupons = state.coupons;
        if (input.couponCode) {
          const idx = coupons.findIndex(
            (c) =>
              c.code.toLowerCase() === input.couponCode!.trim().toLowerCase() &&
              !c.used &&
              c.expiresAt > Date.now()
          );
          if (idx === -1) return { ok: false, error: "COUPON_INVALID" };
          couponValue = coupons[idx].valueKzt;
          coupons = coupons.map((c, i) => (i === idx ? { ...c, used: true } : c));
          track("coupon_used", { code: input.couponCode });
        }

        const vatKzt = product.vatApplicable ? Math.round(config.VAT_RATE * unit * qty) : 0;
        const deliveryKzt = product.deliveryKzt;
        const savings = Math.max(0, product.soloPriceKzt - unit) * qty;
        const total = Math.max(0, unit * qty + vatKzt + deliveryKzt - couponValue);

        const order: Order = {
          id: newId("ord"),
          productId: product.id,
          groupId: input.groupId,
          mode: input.mode,
          unitPriceKzt: unit,
          qty,
          savingsVsSoloKzt: savings,
          vatKzt,
          deliveryKzt,
          couponValue,
          totalKzt: total,
          status: "confirmed",
          createdAt: Date.now(),
        };

        let groups = state.groups;
        if (input.mode === "group" && group && group.status === "locked") {
          groups = { ...groups, [group.id]: { ...group, status: "completed" } };
          dispatchEvents([{ type: "group_completed", groupId: group.id }]);
        }
        set({ orders: [order, ...state.orders], coupons, groups });
        track("order_confirmed", {
          orderId: order.id,
          mode: order.mode,
          savings: order.savingsVsSoloKzt,
        });
        broadcastSync();
        return { ok: true, order };
      },

      resetAll: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("birge-store");
          window.localStorage.removeItem("birge-analytics");
          window.location.href = "/";
        }
      },
    }),
    {
      name: "birge-store",
      partialize: (s) => ({
        locale: s.locale,
        pendingPhone: s.pendingPhone,
        user: s.user,
        security: s.security,
        groups: s.groups,
        orders: s.orders,
        coupons: s.coupons,
        referrals: s.referrals,
        pendingReferralGroupId: s.pendingReferralGroupId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
