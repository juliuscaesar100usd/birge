"use client";

import type { Product } from "@/lib/types";
import { formatKzt, pctOff } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";

// FR-5.3: price vs participants ladder; highlights the active tier when a count is given
export function TierLadder({
  product,
  currentCount,
}: {
  product: Product;
  currentCount?: number;
}) {
  const { t } = useI18n();
  const activeIdx =
    currentCount === undefined
      ? -1
      : product.priceTiers.reduce(
          (acc, tier, i) => (tier.minParticipants <= currentCount ? i : acc),
          -1
        );

  return (
    <div className="card">
      <p className="mb-3 text-sm font-bold">{t("tier_title")}</p>
      <div className="space-y-1.5">
        {product.priceTiers.map((tier, i) => {
          const discount = pctOff(product.soloPriceKzt, tier.unitPriceKzt);
          const active = i === activeIdx;
          return (
            <div
              key={tier.minParticipants}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                active ? "bg-primary-light font-bold text-primary-dark" : "bg-bg"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{"👤".repeat(Math.min(3, Math.ceil(tier.minParticipants / 4)))}</span>
                {t("tier_people", { n: tier.minParticipants })}
                {active && <span className="text-xs">✓</span>}
              </span>
              <span className="flex items-center gap-2">
                {discount > 0 && (
                  <span className="rounded bg-success-light px-1.5 py-0.5 text-[11px] font-bold text-success">
                    −{discount}%
                  </span>
                )}
                <span className="font-semibold">{formatKzt(tier.unitPriceKzt)}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
