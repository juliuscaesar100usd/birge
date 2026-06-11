"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatKzt, pctOff } from "@/lib/currency";
import { localized, useI18n } from "@/lib/i18n";
import { ProductImage } from "@/components/ProductImage";
import { MarketplaceBadge } from "@/components/MarketplaceBadge";
import { Stars } from "@/components/Stars";
import { useBirgeStore } from "@/lib/store";
import { Icon } from "@/components/Icon";

// Feed/catalog card (design §6): deepest-tier group price in coral,
// struck solo price, −% badge, rating, blue "reason" chip.
export function ProductCard({ product, reason }: { product: Product; reason?: string }) {
  const { locale } = useI18n();
  const user = useBirgeStore((s) => s.user);
  const toggleLike = useBirgeStore((s) => s.toggleLike);
  const liked = !!user?.likedProducts.includes(product.id);
  const best = product.priceTiers[product.priceTiers.length - 1].unitPriceKzt;
  const discount = pctOff(product.soloPriceKzt, best);
  const title = localized(product as unknown as Record<string, unknown>, "title", locale);

  return (
    <Link href={`/product/${product.id}`} className="pcard shadow-sm">
      <div className="pimg">
        <ProductImage product={product} className="absolute inset-0" emojiClassName="text-5xl" />
        <span className="pimg__mk">
          <MarketplaceBadge marketplaceId={product.marketplaceId} />
        </span>
        <button
          className="pimg__heart"
          onClick={(e) => {
            e.preventDefault();
            toggleLike(product.id);
          }}
          aria-pressed={liked}
        >
          <Icon name="heart" size={16} sw={2} fill={liked} color={liked ? "#FF5A2C" : "#3A414B"} />
        </button>
      </div>
      <div className="p-2.5 pb-3">
        <p className="line-clamp-2 min-h-[34px] text-[13px] font-semibold leading-[1.3] text-ink">
          {title}
        </p>
        <div className="mt-1">
          <Stars value={product.rating} reviews={product.reviews} size={12} />
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="num text-[16.5px] font-extrabold text-coral">{formatKzt(best)}</span>
          <span className="pill-badge pill-coral">−{discount}%</span>
        </div>
        <p className="num text-[11.5px] font-medium text-muted2 line-through">
          {formatKzt(product.soloPriceKzt)}
        </p>
        {reason && (
          <span className="mt-1.5 inline-flex max-w-full items-center gap-1 truncate rounded-md bg-blue-50 px-1.5 py-1 text-[10.5px] font-bold text-blue">
            ✦ <span className="truncate">{reason}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
