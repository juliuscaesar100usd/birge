import type { Group, GroupEvent, GroupMember, JoinError, Product } from "@/lib/types";
import { config } from "@/lib/config";

// Spec §2.4: price of the highest tier whose minParticipants <= count
export function tierPriceFor(product: Product, count: number): number {
  let price = product.soloPriceKzt;
  for (const tier of product.priceTiers) {
    if (tier.minParticipants <= count) price = tier.unitPriceKzt;
  }
  return price;
}

export function nextTier(product: Product, count: number) {
  return product.priceTiers.find((t) => t.minParticipants > count) ?? null;
}

let groupCounter = 0;
export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${(++groupCounter).toString(36)}`;
}

export function createGroup(product: Product, creator: GroupMember): Group {
  return {
    id: newId("grp"),
    productId: product.id,
    creatorId: creator.id,
    status: "open",
    minParticipants: config.NEW_GROUP_MIN,
    targetParticipants: config.NEW_GROUP_TARGET,
    members: [creator],
    currentTierPriceKzt: tierPriceFor(product, 1),
    deadlineAt: Date.now() + config.GROUP_WINDOW_MS,
    createdAt: Date.now(),
  };
}

export type JoinOutcome =
  | { ok: true; group: Group; events: GroupEvent[] }
  | { ok: false; error: JoinError };

// Spec §4 transition table for the `join` event
export function applyJoin(group: Group, product: Product, member: GroupMember): JoinOutcome {
  if (group.status !== "open") return { ok: false, error: "GROUP_CLOSED" };
  if (Date.now() > group.deadlineAt) return { ok: false, error: "GROUP_EXPIRED" };
  if (group.members.some((m) => m.id === member.id)) return { ok: false, error: "ALREADY_MEMBER" };

  const members = [...group.members, member];
  const count = members.length;
  const newPrice = tierPriceFor(product, count);
  const events: GroupEvent[] = [
    { type: "member_joined", groupId: group.id, memberName: member.name },
  ];
  if (newPrice < group.currentTierPriceKzt) {
    events.push({ type: "tier_unlocked", groupId: group.id, priceKzt: newPrice });
  }
  let status: Group["status"] = group.status;
  if (count >= group.minParticipants) {
    status = "locked";
    events.push({ type: "group_locked", groupId: group.id, priceKzt: newPrice });
  }
  return {
    ok: true,
    group: { ...group, members, currentTierPriceKzt: newPrice, status },
    events,
  };
}

// Spec §4: deadline event below min participants → FAILED or auto-extend
export function applyDeadline(group: Group): { group: Group; events: GroupEvent[] } {
  if (group.status !== "open" || Date.now() <= group.deadlineAt) {
    return { group, events: [] };
  }
  if (config.GROUP_FAIL_POLICY === "auto_extend") {
    return {
      group: { ...group, deadlineAt: Date.now() + config.EXTEND_MS },
      events: [{ type: "deadline_extended", groupId: group.id }],
    };
  }
  return {
    group: { ...group, status: "failed" },
    events: [{ type: "group_failed", groupId: group.id }],
  };
}
