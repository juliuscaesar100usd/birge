"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { productById } from "@/data/products";
import { marketplaceById, marketplaceProductUrl } from "@/data/marketplaces";
import { formatKzt } from "@/lib/currency";
import { ProductImage } from "@/components/ProductImage";
import { MarketplaceBadge } from "@/components/MarketplaceBadge";
import { TierLadder } from "@/components/TierLadder";
import { Stars } from "@/components/Stars";
import { Icon } from "@/components/Icon";
import { track } from "@/lib/analytics";

// S9 — Product detail: Solo↔Group segmented price block, tier ladder, notes,
// sticky two-CTA action bar (design §9, FR-5.x)
export default function ProductPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const product = productById[id];
  const user = useBirgeStore((s) => s.user);
  const toggleLike = useBirgeStore((s) => s.toggleLike);
  const openGroupForProduct = useBirgeStore((s) => s.openGroupForProduct);
  const [mode, setMode] = useState<"solo" | "group">("group");

  useEffect(() => {
    if (product) track("product_viewed", { productId: product.id });
  }, [product]);

  const liked = !!user?.likedProducts.includes(id);
  const deepest = useMemo(
    () => (product ? product.priceTiers[product.priceTiers.length - 1] : null),
    [product]
  );

  if (!product || !deepest) return null;
  const mp = marketplaceById[product.marketplaceId];
  const lockTier = product.priceTiers.find((tier) => tier.minParticipants >= 5) ?? deepest;
  const soldOut = product.stockStatus === "out";
  const title = localized(product as unknown as Record<string, unknown>, "title", locale);
  const description = localized(product as unknown as Record<string, unknown>, "description", locale);
  const maxSave = product.soloPriceKzt - deepest.unitPriceKzt;

  // design §7: open the group screen without joining; min−1 pre-seeded
  const buyInGroup = () => {
    if (soldOut || !user) return;
    const groupId = openGroupForProduct(product.id);
    if (groupId) router.push(`/group/${groupId}`);
  };

  return (
    <div className="screen-anim flex h-full flex-col">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-4">
        {/* full-bleed tile + floating controls */}
        <div className="relative">
          <ProductImage product={product} className="h-[290px] w-full" emojiClassName="text-8xl" />
          <div className="absolute left-4 right-4 top-[58px] flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="tap flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
              aria-label={t("back")}
            >
              <Icon name="back" size={20} sw={2.2} />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => toggleLike(product.id)}
                className="tap flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
                aria-pressed={liked}
              >
                <Icon name="heart" size={18} sw={2.2} fill={liked} color={liked ? "#FF5A2C" : "#15181D"} />
              </button>
              <button className="tap flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                <Icon name="share" size={18} sw={2.2} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 px-4 pt-4">
          <div>
            <div className="flex items-center gap-2">
              <MarketplaceBadge marketplaceId={product.marketplaceId} />
              <span className="t-tiny">
                {t("source")}: {mp.name}
              </span>
            </div>
            <h1 className="t-h2 mt-2">{title}</h1>
            <div className="mt-1.5">
              <Stars value={product.rating} size={14} />
              <span className="t-tiny ml-2">{t("reviews_n", { n: product.reviews })}</span>
            </div>
          </div>

          {/* segmented price block */}
          <div className="card">
            <div className="seg">
              <button
                className={`seg__item ${mode === "solo" ? "seg__item--on" : ""}`}
                onClick={() => setMode("solo")}
              >
                {t("seg_solo")}
              </button>
              <button
                className={`seg__item ${mode === "group" ? "seg__item--on" : ""}`}
                onClick={() => setMode("group")}
              >
                {t("seg_group")}
              </button>
            </div>
            <div key={mode} className="price-drop mt-3.5">
              {mode === "group" ? (
                <>
                  <p className="t-tiny">{t("price_group")}</p>
                  <div className="mt-0.5 flex items-baseline gap-2.5">
                    <span className="num text-[30px] font-extrabold leading-none text-coral">
                      {formatKzt(deepest.unitPriceKzt)}
                    </span>
                    <span className="num text-[15px] font-semibold text-muted2 line-through">
                      {formatKzt(product.soloPriceKzt)}
                    </span>
                  </div>
                  <span className="pill-badge pill-green mt-2">
                    {t("save_upto", { p: formatKzt(maxSave) })}
                  </span>
                </>
              ) : (
                <>
                  <p className="t-tiny">{t("price_solo")}</p>
                  <div className="mt-0.5 flex items-baseline gap-2.5">
                    <span className="num text-[30px] font-extrabold leading-none text-ink">
                      {formatKzt(product.soloPriceKzt)}
                    </span>
                  </div>
                  <span className="pill-badge pill-coral mt-2">
                    {t("group_from")} {formatKzt(deepest.unitPriceKzt)}
                  </span>
                </>
              )}
            </div>
          </div>

          <TierLadder product={product} />

          {/* delivery / VAT / cross-border / returns */}
          <div className="card space-y-2.5">
            {[
              {
                icon: "truck",
                text: t("delivery_note", {
                  n: product.deliveryDays,
                  price: product.deliveryKzt === 0 ? t("free_delivery") : formatKzt(product.deliveryKzt),
                }),
              },
              ...(product.vatApplicable ? [{ icon: "info", text: t("vat_note") }] : []),
              ...(mp.foreign ? [{ icon: "globe", text: t("customs_note") }] : []),
              { icon: "refresh", text: t("return_note") },
            ].map((row) => (
              <p key={row.text} className="flex items-center gap-2.5 text-[13px] font-medium text-ink2">
                <Icon name={row.icon} size={16} sw={2} color="#717A86" />
                {row.text}
              </p>
            ))}
          </div>

          <div className="card">
            <p className="t-h3 mb-1.5">{t("description_label")}</p>
            <p className="t-sub leading-relaxed">{description}</p>
          </div>

          {/* deep link to the exact live marketplace listing this mirrors */}
          <a
            href={marketplaceProductUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("marketplace_link_opened", { productId: product.id, marketplaceId: mp.id })}
            className="card flex items-center justify-between"
          >
            <span className="flex items-center gap-2 text-[14px] font-bold" style={{ color: mp.badgeColor }}>
              🛒 {t("view_on_marketplace", { name: mp.name })}
            </span>
            <span className="text-[15px] font-bold" style={{ color: mp.badgeColor }} aria-hidden>
              ↗
            </span>
          </a>
        </div>
      </main>

      {/* sticky CTAs */}
      <div className="actionbar shrink-0">
        {soldOut ? (
          <button disabled className="btn btn--dark">
            {t("out_of_stock")}
          </button>
        ) : (
          <div className="flex gap-2.5">
            <Link
              href={`/checkout?product=${product.id}&mode=solo`}
              className="btn btn--outline flex-1 text-[14px]"
            >
              {t("buy_solo")}
            </Link>
            <button onClick={buyInGroup} className="btn btn--coral flex-[1.4] text-[14px]">
              <Icon name="users" size={17} sw={2.2} />
              {t("buy_group")} · <span className="num">{formatKzt(lockTier.unitPriceKzt)}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
