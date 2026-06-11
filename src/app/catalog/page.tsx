"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { scoreProducts } from "@/lib/engine/recommendations";
import { ProductCard } from "@/components/ProductCard";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";

// Catalog tab — white header + category chip row + filtered 2-col grid (design §9)
function CatalogInner() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const initialCat = useSearchParams().get("cat");
  const user = useBirgeStore((s) => s.user);
  const [category, setCategory] = useState<string | null>(initialCat);

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  const ranked = useMemo(
    () => (user ? scoreProducts(products, user, locale) : []),
    [user, locale]
  );

  if (!user) return null;

  const visible = category
    ? ranked.filter(({ product }) => product.categoryId === category)
    : ranked;

  return (
    <div className="screen-anim flex h-full flex-col">
      <header className="shrink-0 bg-white px-4 pb-3 pt-[58px] shadow-sm">
        <h1 className="t-h2">{t("nav_catalog")}</h1>
        <div className="-mx-4 mt-3">
          <div className="hscroll">
            <button onClick={() => setCategory(null)} className={`chip ${category === null ? "chip--on" : ""}`}>
              {t("all_categories")}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(category === c.id ? null : c.id)}
                className={`chip ${category === c.id ? "chip--on" : ""}`}
              >
                <Icon name={c.iconName} size={15} sw={2.2} />
                {localized(c as unknown as Record<string, unknown>, "name", locale)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 pt-4">
        {visible.length === 0 ? (
          <div className="card py-10 text-center text-sm text-muted">{t("feed_empty")}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
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

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogInner />
    </Suspense>
  );
}
