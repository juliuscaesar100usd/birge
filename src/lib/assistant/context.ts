import type { Locale } from "@/lib/types";
import { products } from "@/data/products";
import { categoryById } from "@/data/categories";
import { marketplaceById } from "@/data/marketplaces";

// Context the client sends with every assistant request (no PII beyond prefs)
export interface AssistantContext {
  locale: Locale;
  interests: string[];
  budgetBand: "low" | "mid" | "high";
  city: string;
  orders: { title: string; mode: string; totalKzt: number }[];
  openGroups: { productTitle: string; count: number; min: number; priceKzt: number }[];
}

const LANGUAGE: Record<Locale, string> = {
  ru: "Russian",
  kk: "Kazakh",
  en: "English",
};

const BUDGET: Record<AssistantContext["budgetBand"], string> = {
  low: "up to 10 000 ₸",
  mid: "10 000 – 50 000 ₸",
  high: "over 50 000 ₸",
};

function catalogLines(): string {
  return products
    .map((p) => {
      const cat = categoryById[p.categoryId]?.nameEn ?? p.categoryId;
      const mp = marketplaceById[p.marketplaceId]?.name ?? p.marketplaceId;
      const best = p.priceTiers[p.priceTiers.length - 1];
      const lock = p.priceTiers.find((t) => t.minParticipants >= 5) ?? best;
      const stock = p.stockStatus === "out" ? " | OUT OF STOCK" : "";
      return `${p.id} | ${p.titleRu} / ${p.titleEn} | ${cat} | ${mp} | solo ${p.soloPriceKzt} ₸ | group(5+) ${lock.unitPriceKzt} ₸ | best(10+) ${best.unitPriceKzt} ₸ | delivery ${p.deliveryDays}d${stock}`;
    })
    .join("\n");
}

export function buildSystemPrompt(ctx: AssistantContext): string {
  const ordersBlock =
    ctx.orders.length > 0
      ? ctx.orders
          .slice(0, 5)
          .map((o) => `- ${o.title} (${o.mode}), total ${o.totalKzt} ₸, confirmed`)
          .join("\n")
      : "(none yet)";
  const groupsBlock =
    ctx.openGroups.length > 0
      ? ctx.openGroups
          .slice(0, 5)
          .map((g) => `- ${g.productTitle}: ${g.count}/${g.min} joined, current price ${g.priceKzt} ₸`)
          .join("\n")
      : "(none)";

  return `You are the in-app AI assistant of Birge, a Kazakhstani mobile app that aggregates
products from AliExpress, Temu, Wildberries and Ozon into one feed (prices in tenge, ₸) and lets
people BUY TOGETHER IN GROUPS to unlock wholesale prices.

How Birge works (answer questions about any of this):
- Group buying: join an open group or start your own, then share the link (Telegram/WhatsApp/QR).
  When 5 participants join, the group locks and everyone gets the discounted tier price
  (−27%…−35% vs solo). If the group does not fill before the deadline, it is auto-extended and
  nobody is charged. After the group locks, the user confirms the order at checkout.
- Solo buying is always available instantly at the higher solo price.
- Prices include 12% VAT for foreign platforms (AliExpress, Temu). EAEU duty-free import limit:
  €200 / 31 kg per shipment. Returns within 14 days. Delivery: 3–15 days depending on marketplace.
- Sign-in is passwordless via carrier SIM verification (no SMS codes). Coupons: WELCOME5 gives
  500 ₸ off; inviting a friend who joins your group earns a 500 ₸ referral coupon.

PRODUCT CATALOG (id | title RU/EN | category | marketplace | prices | delivery):
${catalogLines()}

USER PROFILE:
- Interests: ${ctx.interests.map((i) => categoryById[i]?.nameEn ?? i).join(", ") || "(not set)"}
- Budget: ${BUDGET[ctx.budgetBand]}
- City: ${ctx.city}
- Recent orders:
${ordersBlock}
- User's open groups:
${groupsBlock}

RULES:
- Reply in ${LANGUAGE[ctx.locale]} only.
- Be concise and friendly: 1–4 short sentences for a phone screen. Plain text only — no markdown,
  no asterisks, no headers, no bullet lists.
- When you recommend specific products, append their tokens at the END of the reply, each on its
  own line, in the exact form [[prd_xx]] (the app renders them as product cards). Recommend at
  most 3 products and only ids that exist in the catalog. Never recommend out-of-stock items.
- Format prices like "12 900 ₸".
- You can help with anything: choosing products, comparing prices, explaining group buying,
  delivery, VAT, coupons, orders, or general shopping advice.`;
}
