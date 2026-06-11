import type { Locale, Order, UserProfile } from "@/lib/types";
import { products, productById } from "@/data/products";
import { scoreProducts } from "@/lib/engine/recommendations";
import { translate, localized } from "@/lib/i18n";
import { formatKzt } from "@/lib/currency";

// Level-3 fallback of the free-model chain: deterministic, offline, localized
// (NFR-1 — the demo answers even with no network and no API key).

const DEFAULT_PROFILE: UserProfile = {
  id: "guest",
  phone: "",
  displayName: "guest",
  isVerified: false,
  carrierLabel: "",
  budgetBand: "mid",
  city: "almaty",
  interests: [],
  likedProducts: [],
  createdAt: 0,
};

function parseMaxPrice(text: string): number | undefined {
  const m = text.replace(/[\s  ]/g, "").match(/(\d{4,7})/);
  if (!m) return undefined;
  const n = parseInt(m[1], 10);
  return n >= 1000 ? n : undefined;
}

function recommend(text: string, locale: Locale, user: UserProfile | null): string {
  const profile = user ?? DEFAULT_PROFILE;
  const maxPrice = parseMaxPrice(text);
  const ranked = scoreProducts(products, profile, locale)
    .filter(({ product }) => product.stockStatus !== "out")
    .filter(({ product }) => {
      if (!maxPrice) return true;
      const best = product.priceTiers[product.priceTiers.length - 1].unitPriceKzt;
      return best <= maxPrice;
    })
    .slice(0, 3);
  if (ranked.length === 0) {
    return translate(locale, "mock_default");
  }
  const tokens = ranked.map(({ product }) => `[[${product.id}]]`).join("\n");
  return `${translate(locale, "mock_recommend")}\n${tokens}`;
}

function lastOrder(locale: Locale, orders: Order[]): string {
  const order = orders[0];
  if (!order) return translate(locale, "mock_order_none");
  const product = productById[order.productId];
  const title = product
    ? localized(product as unknown as Record<string, unknown>, "title", locale)
    : order.productId;
  return translate(locale, "mock_order_last", {
    title,
    status: translate(locale, "order_confirmed_word"),
    total: formatKzt(order.totalKzt),
  });
}

export function mockAssistantReply(
  text: string,
  locale: Locale,
  user: UserProfile | null,
  orders: Order[]
): string {
  const q = text.toLowerCase();
  // intent priority matters: "топтық сатып алу" must hit "group", not "buy"
  if (/групп|топтық|топқа|group/.test(q)) {
    return translate(locale, "mock_group");
  }
  if (/доставк|ндс|жеткізу|ққс|тамож|баж|deliver|shipping|vat|customs|tax|возврат|қайтару|return/.test(q)) {
    return translate(locale, "mock_delivery");
  }
  if (/заказ|тапсырыс|order/.test(q)) {
    return lastOrder(locale, orders);
  }
  if (
    /купи|подбер|рекоменд|посовет|выгодн|дешев|дешёв|что взять|подар|сатып|таңда|ұсын|арзан|сыйлық|recommend|buy|cheap|under|deal|suggest|gift|best/.test(
      q
    )
  ) {
    return recommend(text, locale, user);
  }
  return translate(locale, "mock_default");
}
