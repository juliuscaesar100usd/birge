"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { products } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";

// S7 — Taste seeding (FR-2.4): optional tap-to-like grid
export default function TastePage() {
  const { t, locale } = useI18n();
  const user = useBirgeStore((s) => s.user);
  const toggleLike = useBirgeStore((s) => s.toggleLike);

  // top products by popularity, biased toward the user's interests
  const samples = useMemo(() => {
    const interests = new Set(user?.interests ?? []);
    return [...products]
      .sort(
        (a, b) =>
          Number(interests.has(b.categoryId)) - Number(interests.has(a.categoryId)) ||
          b.popularityScore - a.popularityScore
      )
      .slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liked = user?.likedProducts ?? [];

  return (
    <div className="flex h-full flex-col px-6 pt-10">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold">{t("taste_title")}</h1>
        <Link href="/feed" className="mt-1 text-sm font-semibold text-muted">
          {t("skip")}
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">{t("taste_sub")}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 overflow-y-auto no-scrollbar pb-4">
        {samples.map((p) => {
          const isLiked = liked.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggleLike(p.id)}
              className="card relative overflow-hidden p-0 text-left transition active:scale-[0.98]"
              aria-pressed={isLiked}
            >
              <ProductImage product={p} className="h-24 w-full" emojiClassName="text-4xl" />
              <span
                className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-base shadow transition ${
                  isLiked ? "bg-danger text-white" : "bg-white/90"
                }`}
              >
                {isLiked ? "♥" : "♡"}
              </span>
              <p className="truncate px-3 py-2.5 text-xs font-semibold">
                {localized(p as unknown as Record<string, unknown>, "title", locale)}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pb-8 pt-3">
        <Link href="/feed" className="btn-primary">
          {t("done")} {liked.length > 0 ? `(♥ ${liked.length})` : ""} →
        </Link>
      </div>
    </div>
  );
}
