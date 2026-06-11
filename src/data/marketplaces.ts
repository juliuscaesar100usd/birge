import type { Marketplace, Product } from "@/lib/types";

export const marketplaces: Marketplace[] = [
  { id: "aliexpress", name: "AliExpress", badgeColor: "#E62E04", baseCurrency: "USD", fxToKzt: 525, foreign: true },
  { id: "kaspi", name: "Kaspi.kz", badgeColor: "#F14635", baseCurrency: "KZT", fxToKzt: 1, foreign: false },
  { id: "wildberries", name: "Wildberries", badgeColor: "#CB11AB", baseCurrency: "RUB", fxToKzt: 5.8, foreign: false },
  { id: "ozon", name: "Ozon", badgeColor: "#006AFF", baseCurrency: "RUB", fxToKzt: 5.8, foreign: false },
];

export const marketplaceById = Object.fromEntries(marketplaces.map((m) => [m.id, m]));

// Invented demo brands confuse strict marketplace search — strip them so the
// fallback search link lands on exact matches. (Products usually carry an exact
// externalUrl from the scraper; this is only used when that's missing.)
const FAKE_BRANDS = ["Pro ANC", "Fit S8", "BoomBox", "AirRun", "Aurora", "SmartClean"];

function searchQuery(title: string): string {
  let q = title;
  for (const brand of FAKE_BRANDS) q = q.replace(brand, "");
  return encodeURIComponent(q.replace(/\s+/g, " ").trim());
}

// Deep link to the live marketplace listing. Prefer the product's exact
// externalUrl (scraped); fall back to a marketplace search for the title.
export function marketplaceProductUrl(p: Product): string {
  if (p.externalUrl) return p.externalUrl;
  const ru = searchQuery(p.titleRu);
  switch (p.marketplaceId) {
    case "kaspi":
      return `https://kaspi.kz/shop/search/?text=${ru}`;
    case "wildberries":
      return `https://www.wildberries.ru/catalog/0/search.aspx?search=${ru}`;
    case "ozon":
      return `https://www.ozon.ru/search/?text=${ru}`;
    case "aliexpress":
      return `https://www.aliexpress.com/wholesale?SearchText=${searchQuery(p.titleEn)}`;
    default:
      return "";
  }
}
