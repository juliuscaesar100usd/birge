import type { Marketplace } from "@/lib/types";

export const marketplaces: Marketplace[] = [
  { id: "aliexpress", name: "AliExpress", badgeColor: "#E62E04", baseCurrency: "USD", fxToKzt: 525, foreign: true },
  { id: "temu", name: "Temu", badgeColor: "#F77B00", baseCurrency: "USD", fxToKzt: 525, foreign: true },
  { id: "wildberries", name: "Wildberries", badgeColor: "#7B2FBE", baseCurrency: "RUB", fxToKzt: 5.8, foreign: false },
  { id: "ozon", name: "Ozon", badgeColor: "#005BFF", baseCurrency: "RUB", fxToKzt: 5.8, foreign: false },
];

export const marketplaceById = Object.fromEntries(marketplaces.map((m) => [m.id, m]));
