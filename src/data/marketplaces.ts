import type { Marketplace } from "@/lib/types";

export const marketplaces: Marketplace[] = [
  { id: "aliexpress", name: "AliExpress", badgeColor: "#E62E04", baseCurrency: "USD", fxToKzt: 525, foreign: true },
  { id: "temu", name: "Temu", badgeColor: "#FB7701", baseCurrency: "USD", fxToKzt: 525, foreign: true },
  { id: "wildberries", name: "Wildberries", badgeColor: "#CB11AB", baseCurrency: "RUB", fxToKzt: 5.8, foreign: false },
  { id: "ozon", name: "Ozon", badgeColor: "#006AFF", baseCurrency: "RUB", fxToKzt: 5.8, foreign: false },
];

export const marketplaceById = Object.fromEntries(marketplaces.map((m) => [m.id, m]));
