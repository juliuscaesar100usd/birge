import type { BudgetBand, Locale, Product, UserProfile } from "@/lib/types";
import { categoryById } from "@/data/categories";
import { cityById } from "@/data/cities";
import { marketplaceById } from "@/data/marketplaces";
import { translate } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n/dictionaries";

// Spec §5 reference implementation — transparent, content-based rules.
const W = { category: 0.4, budget: 0.25, location: 0.15, popularity: 0.15, taste: 0.05 };

const BANDS: Record<BudgetBand, { min: number; max: number }> = {
  low: { min: 0, max: 10_000 },
  mid: { min: 10_001, max: 50_000 },
  high: { min: 50_001, max: Number.POSITIVE_INFINITY },
};

// 1 inside the band, decaying toward 0 the further the price is outside it
export function budgetFit(priceKzt: number, band: BudgetBand): number {
  const { min, max } = BANDS[band];
  if (priceKzt >= min && priceKzt <= max) return 1;
  const edge = priceKzt < min ? min : max;
  const dist = Math.abs(priceKzt - edge);
  return Math.max(0, 1 - dist / Math.max(edge, 10_000));
}

function tasteSimilarity(product: Product, user: UserProfile, all: Record<string, Product>): number {
  if (user.likedProducts.length === 0) return 0;
  const likedCategories = new Set(
    user.likedProducts.map((id) => all[id]?.categoryId).filter(Boolean)
  );
  return likedCategories.has(product.categoryId) ? 1 : 0;
}

export interface ScoredProduct {
  product: Product;
  score: number;
  reason: string;
}

export function scoreProducts(
  productList: Product[],
  user: UserProfile,
  locale: Locale
): ScoredProduct[] {
  const byId = Object.fromEntries(productList.map((p) => [p.id, p]));
  const budgetLabelKey = `budget_${user.budgetBand}` as DictKey;

  const scored = productList.map((product) => {
    const factors = {
      category: user.interests.includes(product.categoryId) ? 1 : 0,
      budget: budgetFit(product.soloPriceKzt, user.budgetBand),
      location: product.popularCities?.includes(user.city) ? 1 : 0,
      popularity: product.popularityScore,
      taste: tasteSimilarity(product, user, byId),
    };
    const score =
      W.category * factors.category +
      W.budget * factors.budget +
      W.location * factors.location +
      W.popularity * factors.popularity +
      W.taste * factors.taste;

    // Explainability (FR-4.2): top weighted contributor → localized reason
    const contributions: [keyof typeof factors, number][] = (
      Object.keys(factors) as (keyof typeof factors)[]
    ).map((k) => [k, W[k] * factors[k]]);
    contributions.sort((a, b) => b[1] - a[1]);
    const top = contributions[0][0];

    const cat = categoryById[product.categoryId];
    const city = cityById[user.city];
    const mp = marketplaceById[product.marketplaceId];
    const catName = locale === "kk" ? cat.nameKk : locale === "en" ? cat.nameEn : cat.nameRu;
    const cityName = city
      ? locale === "kk"
        ? city.nameKk
        : locale === "en"
          ? city.nameEn
          : city.nameRu
      : "";

    const reason =
      top === "category"
        ? translate(locale, "rec_reason_category", { category: catName })
        : top === "budget"
          ? translate(locale, "rec_reason_budget", {
              budget: translate(locale, budgetLabelKey),
            })
          : top === "location"
            ? translate(locale, "rec_reason_location", { city: cityName })
            : top === "taste"
              ? translate(locale, "rec_reason_taste")
              : translate(locale, "rec_reason_popular", { marketplace: mp.name });

    return { product, score, reason };
  });

  // Deterministic ranking; ties broken by popularity (Spec §5)
  return scored.sort(
    (a, b) => b.score - a.score || b.product.popularityScore - a.product.popularityScore
  );
}
