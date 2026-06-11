"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { scoreProducts } from "@/lib/engine/recommendations";
import { ProductCard } from "@/components/ProductCard";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BottomNav } from "@/components/BottomNav";
import { track } from "@/lib/analytics";

// S8 — Home feed: aggregated, localized, personalized (FR-3.x, FR-4.x)
export default function FeedPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const user = useBirgeStore((s) => s.user);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  useEffect(() => {
    track("feed_viewed", {});
  }, []);

  // Recommendations re-rank live when preferences change (FR-4.4)
  const ranked = useMemo(
    () => (user ? scoreProducts(products, user, locale) : []),
    [user, locale]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ranked.filter(({ product }) => {
      if (category && product.categoryId !== category) return false;
      if (!q) return true;
      return (
        product.titleRu.toLowerCase().includes(q) ||
        product.titleKk.toLowerCase().includes(q) ||
        product.titleEn.toLowerCase().includes(q)
      );
    });
  }, [ranked, query, category]);

  if (!user) return null;

  // user's interests first in the chip row
  const orderedCategories = [...categories].sort(
    (a, b) => Number(user.interests.includes(b.id)) - Number(user.interests.includes(a.id))
  );

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 px-5 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-extrabold tracking-tight text-primary">
            Birge<span className="text-accent">.</span>
          </span>
          <LanguageToggle />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
          <span className="text-muted">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/30"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-sm text-muted">
              ✕
            </button>
          )}
        </div>
      </header>

      <div className="shrink-0 overflow-x-auto no-scrollbar px-5 pb-1">
        <div className="flex w-max gap-2">
          <button
            onClick={() => setCategory(null)}
            className={`chip ${category === null ? "chip-active" : ""}`}
          >
            {t("all")}
          </button>
          {orderedCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(category === c.id ? null : c.id)}
              className={`chip ${category === c.id ? "chip-active" : ""}`}
            >
              {c.icon} {localized(c as unknown as Record<string, unknown>, "name", locale)}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4 pt-3">
        <p className="mb-2.5 text-sm font-bold text-muted">✨ {t("for_you")}</p>
        {visible.length === 0 ? (
          <div className="card mt-4 py-10 text-center text-sm text-muted">{t("feed_empty")}</div>
        ) : (
          <div className="space-y-3">
            {visible.map(({ product, reason }) => (
              <ProductCard key={product.id} product={product} reason={reason} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
