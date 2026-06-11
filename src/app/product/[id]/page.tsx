"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { productById } from "@/data/products";
import { marketplaceById } from "@/data/marketplaces";
import { formatKzt, pctOff } from "@/lib/currency";
import { ProductImage } from "@/components/ProductImage";
import { MarketplaceBadge } from "@/components/MarketplaceBadge";
import { TierLadder } from "@/components/TierLadder";
import { Avatar } from "@/components/Avatar";
import { track } from "@/lib/analytics";

// S9 — Product detail (FR-5.x): solo vs group price, tier ladder, localized notes
export default function ProductPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const product = productById[id];
  const user = useBirgeStore((s) => s.user);
  const groups = useBirgeStore((s) => s.groups);
  const joinGroup = useBirgeStore((s) => s.joinGroup);
  const startGroup = useBirgeStore((s) => s.startGroup);

  useEffect(() => {
    if (product) track("product_viewed", { productId: product.id });
  }, [product]);

  // expired-open groups are reaped by the global tickDeadlines interval
  const openGroups = useMemo(
    () =>
      Object.values(groups)
        .filter((g) => g.productId === id && g.status === "open")
        .sort((a, b) => b.members.length - a.members.length),
    [groups, id]
  );

  if (!product) return null;
  const mp = marketplaceById[product.marketplaceId];
  const bestTier = product.priceTiers[product.priceTiers.length - 1];
  const lockTier =
    product.priceTiers.find((tier) => tier.minParticipants >= 5) ?? bestTier;
  const soldOut = product.stockStatus === "out";
  const title = localized(product as unknown as Record<string, unknown>, "title", locale);
  const description = localized(product as unknown as Record<string, unknown>, "description", locale);

  // FR-6.1: join the fullest open group, or start a new one
  const buyInGroup = () => {
    if (soldOut || !user) return;
    const target = openGroups[0];
    if (target) {
      const result = joinGroup(target.id);
      if (result.ok || result.error === "ALREADY_MEMBER") {
        router.push(`/group/${target.id}`);
        return;
      }
    }
    const newId = startGroup(product.id);
    if (newId) router.push(`/group/${newId}`);
  };

  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-4">
        <div className="relative">
          <ProductImage product={product} className="h-60 w-full" emojiClassName="text-8xl" />
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow"
            aria-label={t("back")}
          >
            ←
          </button>
          <MarketplaceBadge marketplaceId={product.marketplaceId} className="absolute bottom-3 left-4 text-xs" />
        </div>

        <div className="space-y-4 px-5 pt-4">
          <div>
            <h1 className="text-xl font-bold leading-snug">{title}</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
          </div>

          {/* FR-5.2: solo vs group with explicit delta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card border-2 border-transparent">
              <p className="text-xs font-semibold text-muted">{t("price_solo")}</p>
              <p className="mt-1 text-xl font-extrabold">{formatKzt(product.soloPriceKzt)}</p>
              <p className="mt-0.5 text-[11px] text-muted">👤 1</p>
            </div>
            <div className="card relative border-2 border-primary bg-primary-light">
              <span className="absolute -top-2.5 right-3 rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-white">
                −{pctOff(product.soloPriceKzt, bestTier.unitPriceKzt)}%
              </span>
              <p className="text-xs font-semibold text-primary-dark">{t("price_group")}</p>
              <p className="mt-1 text-xl font-extrabold text-primary-dark">
                {formatKzt(bestTier.unitPriceKzt)}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-primary-dark/70">
                {t("tier_people", { n: bestTier.minParticipants })}
              </p>
            </div>
          </div>

          <TierLadder product={product} />

          {/* FR-6.1: existing open groups */}
          {openGroups.length > 0 && (
            <div className="card">
              <p className="mb-2.5 text-sm font-bold">🔥 {t("open_groups")}</p>
              <div className="space-y-2">
                {openGroups.map((g) => (
                  <Link
                    key={g.id}
                    href={`/group/${g.id}`}
                    className="flex items-center justify-between rounded-xl bg-bg px-3 py-2.5"
                  >
                    <span className="flex items-center">
                      <span className="flex -space-x-2">
                        {g.members.slice(0, 3).map((m) => (
                          <Avatar key={m.id} name={m.name} size="h-7 w-7 text-[11px]" />
                        ))}
                      </span>
                      <span className="ml-2.5 text-sm font-semibold">
                        {t("joined_of", { x: g.members.length, n: g.minParticipants })}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-primary-dark">{t("join")} →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FR-5.4 + localization context (FR-3.4) */}
          <div className="card space-y-2 text-xs text-muted">
            <p>🚚 {t("delivery_note", { n: product.deliveryDays, price: product.deliveryKzt === 0 ? "0 ₸" : formatKzt(product.deliveryKzt) })}</p>
            {product.vatApplicable && <p>🧾 {t("vat_note")}</p>}
            {mp.foreign && <p>🛃 {t("customs_note")}</p>}
            <p>↩️ {t("return_note")}</p>
          </div>
        </div>
      </main>

      {/* FR-5.5 CTAs */}
      <div className="shrink-0 space-y-2 border-t border-black/5 bg-white px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
        {soldOut ? (
          <button disabled className="btn-primary">
            {t("out_of_stock")}
          </button>
        ) : (
          <>
            <button onClick={buyInGroup} className="btn-primary">
              👥 {t("buy_group")} · {formatKzt(lockTier.unitPriceKzt)}
            </button>
            <Link
              href={`/checkout?product=${product.id}&mode=solo`}
              className="btn-secondary py-3"
            >
              {t("buy_solo")} · {formatKzt(product.soloPriceKzt)}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
