"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { cityById } from "@/data/cities";
import { scoreProducts } from "@/lib/engine/recommendations";
import { ProductCard } from "@/components/ProductCard";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BottomNav } from "@/components/BottomNav";
import { ZigleLogo } from "@/components/ZigleLogo";
import { Icon } from "@/components/Icon";
import { BannerCarousel } from "@/components/BannerCarousel";
import { HotGroupCard } from "@/components/HotGroupCard";
import { track } from "@/lib/analytics";

// S8 — Home feed: blue Zigle header, search, categories, banners, hot group,
// personalized 2-col grid (design §9, FR-3.x/4.x)
export default function FeedPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const user = useBirgeStore((s) => s.user);
  const groups = useBirgeStore((s) => s.groups);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  useEffect(() => {
    track("feed_viewed", {});
  }, []);

  const ranked = useMemo(
    () => (user ? scoreProducts(products, user, locale) : []),
    [user, locale]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ranked;
    return ranked.filter(
      ({ product }) =>
        product.titleRu.toLowerCase().includes(q) ||
        product.titleKk.toLowerCase().includes(q) ||
        product.titleEn.toLowerCase().includes(q)
    );
  }, [ranked, query]);

  // hottest open group for the coral card (the seeded 4/5 hero when alive)
  const hotGroup = useMemo(() => {
    const open = Object.values(groups).filter((g) => g.status === "open");
    open.sort(
      (a, b) =>
        b.members.length / b.minParticipants - a.members.length / a.minParticipants ||
        a.createdAt - b.createdAt
    );
    return open[0];
  }, [groups]);

  if (!user) return null;
  const city = cityById[user.city];

  return (
    <div className="screen-anim flex h-full flex-col">
      {/* blue header */}
      <header
        className="shrink-0 px-4 pb-3.5 pt-[58px] text-white"
        style={{ background: "linear-gradient(180deg,#2E86F5 0%,#1668E3 100%)" }}
      >
        <div className="flex items-center justify-between">
          <ZigleLogo size={21} inverse color="#fff" />
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1.5 text-[11.5px] font-bold">
              <Icon name="location" size={12} sw={2.4} />
              {city ? localized(city as unknown as Record<string, unknown>, "name", locale) : ""}
            </span>
            <LanguageToggle dark />
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15" title={t("verified_identity")}>
              <Icon name="shield" size={14} sw={2.4} color="#7CF2B6" />
            </span>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-white px-3.5 shadow-sm">
            <Icon name="search" size={17} sw={2.2} color="#9AA2AD" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search_placeholder")}
              className="w-full bg-transparent text-[13.5px] font-medium text-ink outline-none placeholder:text-muted2"
            />
            {query ? (
              <button onClick={() => setQuery("")} className="text-muted">
                <Icon name="close" size={15} sw={2.4} />
              </button>
            ) : (
              <Icon name="camera" size={17} sw={2} color="#9AA2AD" />
            )}
          </div>
          <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow shadow-sm" aria-label={t("search_placeholder")}>
            <Icon name="search" size={19} sw={2.4} color="#1A1408" />
          </button>
        </div>
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-24 pt-4">
        {/* category strip → catalog */}
        <div className="hscroll">
          {categories.map((c) => (
            <Link key={c.id} href={`/catalog?cat=${c.id}`} className="tap flex w-[64px] flex-col items-center gap-1.5">
              <span
                className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl"
                style={{ background: c.tint, color: c.ink }}
              >
                <Icon name={c.iconName} size={23} sw={2} />
              </span>
              <span className="w-full truncate text-center text-[10.5px] font-bold text-ink2">
                {localized(c as unknown as Record<string, unknown>, "name", locale)}
              </span>
            </Link>
          ))}
        </div>

        {!query && <BannerCarousel />}
        {!query && hotGroup && <HotGroupCard group={hotGroup} />}

        <section className="px-4">
          <h2 className="t-h3 mb-2.5">✨ {t("for_you")}</h2>
          {visible.length === 0 ? (
            <div className="card py-10 text-center text-sm text-muted">{t("feed_empty")}</div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {visible.map(({ product, reason }) => (
                <ProductCard key={product.id} product={product} reason={reason} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
