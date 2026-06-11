"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatKzt, pctOff } from "@/lib/currency";
import { useI18n, localized } from "@/lib/i18n";
import { ProductImage } from "@/components/ProductImage";
import { MarketplaceBadge } from "@/components/MarketplaceBadge";

export function ProductCard({ product, reason }: { product: Product; reason?: string }) {
  const { t, locale } = useI18n();
  const groupPrice = product.priceTiers[product.priceTiers.length - 1].unitPriceKzt;
  const discount = pctOff(product.soloPriceKzt, groupPrice);
  const title = localized(product as unknown as Record<string, unknown>, "title", locale);

  return (
    <Link
      href={`/product/${product.id}`}
      className="card flex gap-3 p-3 transition active:scale-[0.99]"
    >
      <div className="relative shrink-0">
        <ProductImage product={product} className="h-24 w-24 rounded-xl" emojiClassName="text-4xl" />
        <MarketplaceBadge marketplaceId={product.marketplaceId} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 shadow" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-semibold">{title}</p>
        {reason && (
          <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-primary-dark">
            ✨ {reason}
          </p>
        )}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-ink">{formatKzt(groupPrice)}</span>
            <span className="rounded-md bg-danger/10 px-1.5 py-0.5 text-[11px] font-bold text-danger">
              −{discount}%
            </span>
          </div>
          <p className="text-xs text-muted">
            <span className="line-through">{formatKzt(product.soloPriceKzt)}</span>{" "}
            {t("solo_short")} · 🚚 {t("delivery_short", { n: product.deliveryDays })}
          </p>
        </div>
      </div>
    </Link>
  );
}
