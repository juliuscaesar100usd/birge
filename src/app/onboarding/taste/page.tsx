"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { products } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";
import { Icon } from "@/components/Icon";

// S7 — Taste seeding: 3-col tap-to-like grid, interest-first (design §9)
export default function TastePage() {
  const { t, locale } = useI18n();
  const user = useBirgeStore((s) => s.user);
  const toggleLike = useBirgeStore((s) => s.toggleLike);

  const samples = useMemo(() => {
    const interests = new Set(user?.interests ?? []);
    return [...products]
      .sort(
        (a, b) =>
          Number(interests.has(b.categoryId)) - Number(interests.has(a.categoryId)) ||
          b.popularityScore - a.popularityScore
      )
      .slice(0, 9);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liked = user?.likedProducts ?? [];

  return (
    <div className="screen-anim flex h-full flex-col px-6">
      <div className="safe-top flex items-start justify-between pt-[62px]">
        <h1 className="t-h1">{t("taste_title")}</h1>
        <Link href="/feed" className="mt-1.5 shrink-0 text-sm font-bold text-muted">
          {t("skip")}
        </Link>
      </div>
      <p className="t-sub mt-2">{t("taste_sub")}</p>

      <div className="mt-5 grid flex-1 grid-cols-3 content-start gap-2.5 overflow-y-auto no-scrollbar pb-3">
        {samples.map((p) => {
          const isLiked = liked.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggleLike(p.id)}
              className="tap relative overflow-hidden rounded-2xl bg-white text-left shadow-sm"
              style={{ boxShadow: isLiked ? "inset 0 0 0 2.5px var(--color-blue), var(--shadow-sm)" : undefined }}
              aria-pressed={isLiked}
            >
              <ProductImage product={p} className="aspect-square w-full" emojiClassName="text-3xl" />
              <span
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full shadow-sm"
                style={{ background: isLiked ? "var(--color-coral)" : "rgba(255,255,255,.92)" }}
              >
                <Icon name="heart" size={14} sw={2.2} fill={isLiked} color={isLiked ? "#fff" : "#3A414B"} />
              </span>
              <p className="truncate px-2 py-2 text-[11px] font-bold text-ink">
                {localized(p as unknown as Record<string, unknown>, "title", locale)}
              </p>
            </button>
          );
        })}
      </div>

      <div className="pb-8 pt-3">
        <p className="t-tiny mb-2 text-center">{t("taste_likes", { n: liked.length })}</p>
        <Link href="/feed" className="btn btn--blue">
          {t("finish_setup")}
        </Link>
      </div>
    </div>
  );
}
