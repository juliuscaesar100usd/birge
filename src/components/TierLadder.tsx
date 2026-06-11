"use client";

import type { Product } from "@/lib/types";
import { formatKzt, pctOff } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";

// FR-5.3 / design §9: tier ladder, deepest tier highlighted coral; the active
// tier (when a live count is given) is marked "вы здесь".
export function TierLadder({
  product,
  currentCount,
}: {
  product: Product;
  currentCount?: number;
}) {
  const { t } = useI18n();
  const tiers = product.priceTiers;
  const activeIdx =
    currentCount === undefined
      ? -1
      : tiers.reduce((acc, tier, i) => (tier.minParticipants <= currentCount ? i : acc), -1);

  return (
    <div className="card">
      <p className="t-h3 mb-3">{t("tier_title")}</p>
      <div className="space-y-1.5">
        {tiers.map((tier, i) => {
          const discount = pctOff(product.soloPriceKzt, tier.unitPriceKzt);
          const deepest = i === tiers.length - 1;
          const active = i === activeIdx;
          return (
            <div
              key={tier.minParticipants}
              className="flex items-center justify-between rounded-xl px-3 py-2.5"
              style={{
                background: deepest ? "var(--color-coral-50)" : active ? "var(--color-blue-50)" : "var(--color-line2)",
                boxShadow: active ? "inset 0 0 0 1.5px var(--color-blue)" : undefined,
              }}
            >
              <span className="flex items-center gap-2 text-[13.5px] font-bold text-ink2">
                <span
                  className="num inline-flex h-6 min-w-9 items-center justify-center rounded-full px-2 text-[12px] font-extrabold"
                  style={{
                    background: deepest ? "var(--color-coral)" : "#fff",
                    color: deepest ? "#fff" : "var(--color-ink2)",
                    boxShadow: deepest ? undefined : "inset 0 0 0 1px var(--color-line)",
                  }}
                >
                  {tier.minParticipants}+
                </span>
                {t("tier_people", { n: tier.minParticipants })}
                {active && (
                  <span className="pill-badge pill-blue">{t("tier_you_here")}</span>
                )}
              </span>
              <span className="flex items-center gap-2">
                {discount > 0 && <span className="pill-badge pill-green">−{discount}%</span>}
                <span
                  className="num text-[15px] font-extrabold"
                  style={{ color: deepest ? "var(--color-coral-700)" : "var(--color-ink)" }}
                >
                  {formatKzt(tier.unitPriceKzt)}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
