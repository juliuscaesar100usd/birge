"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { productById } from "@/data/products";
import { formatKzt } from "@/lib/currency";
import { config } from "@/lib/config";
import { identityProvider, securityFor } from "@/lib/engine/identity";
import { track } from "@/lib/analytics";
import { ProductImage } from "@/components/ProductImage";
import { MarketplaceBadge } from "@/components/MarketplaceBadge";

// S13 — Simulated checkout (FR-7.x): summary with explicit savings vs solo
function CheckoutInner() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const productId = params.get("product") ?? "";
  const groupId = params.get("group") ?? undefined;
  const mode = (params.get("mode") === "group" ? "group" : "solo") as "solo" | "group";

  const product = productById[productId];
  const group = useBirgeStore((s) => (groupId ? s.groups[groupId] : undefined));
  const coupons = useBirgeStore((s) => s.coupons);
  const placeOrder = useBirgeStore((s) => s.placeOrder);
  const security = useBirgeStore((s) => s.security);
  const user = useBirgeStore((s) => s.user);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState(false);
  const [idState, setIdState] = useState<"idle" | "pending" | "done">("idle");

  const sec = securityFor(user?.phone ?? "", user?.carrierLabel ?? config.CARRIER_LABEL, security);
  const simLabel = sec.simType === "sim" ? t("sim_label") : t("esim_label");
  const stepUp = () => {
    if (idState !== "idle") return;
    setIdState("pending");
    identityProvider.confirmAction("purchase").then(() => {
      setIdState("done");
      track("identity_step_up", { productId, simType: sec.simType });
    });
  };

  if (!product) return null;
  if (mode === "group" && (!group || (group.status !== "locked" && group.status !== "completed"))) {
    // group no longer locked → bounce back to the group screen (Spec §6 S13 edge case)
    if (groupId) router.replace(`/group/${groupId}`);
    else router.replace(`/product/${productId}`);
    return null;
  }

  const unit = mode === "group" && group ? group.currentTierPriceKzt : product.soloPriceKzt;
  const savings = Math.max(0, product.soloPriceKzt - unit);
  const vat = product.vatApplicable ? Math.round(config.VAT_RATE * unit) : 0;
  // expiry is validated in applyCoupon and re-checked by placeOrder
  const appliedCoupon = appliedCode
    ? coupons.find((c) => c.code === appliedCode && !c.used)
    : undefined;
  const couponValue = appliedCoupon?.valueKzt ?? 0;
  const total = Math.max(0, unit + vat + product.deliveryKzt - couponValue);
  const title = localized(product as unknown as Record<string, unknown>, "title", locale);

  const applyCoupon = () => {
    const code = couponInput.trim();
    const found = coupons.find(
      (c) => c.code.toLowerCase() === code.toLowerCase() && !c.used && c.expiresAt > Date.now()
    );
    if (!found) {
      setCouponError(true);
      setAppliedCode(null);
      return;
    }
    setCouponError(false);
    setAppliedCode(found.code);
  };

  const pay = () => {
    const result = placeOrder({
      productId: product.id,
      groupId,
      mode,
      qty: 1,
      couponCode: appliedCoupon?.code,
    });
    if (result.ok) router.push(`/order/${result.order.id}`);
    else if (result.error === "COUPON_INVALID") setCouponError(true);
    else if (groupId) router.replace(`/group/${groupId}`);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-5">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm"
          aria-label={t("back")}
        >
          ←
        </button>
        <h1 className="text-lg font-bold">{t("checkout_title")}</h1>
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto no-scrollbar px-5 pb-4">
        <div className="card flex items-center gap-3 p-3">
          <ProductImage product={product} className="h-16 w-16 rounded-xl" emojiClassName="text-3xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{title}</p>
            <div className="mt-1 flex items-center gap-2">
              <MarketplaceBadge marketplaceId={product.marketplaceId} />
              <span
                className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                  mode === "group" ? "bg-primary-light text-primary-dark" : "bg-black/5 text-muted"
                }`}
              >
                {mode === "group" ? `👥 ${t("mode_group")}` : t("mode_solo")}
              </span>
            </div>
          </div>
          <p className="text-sm font-bold tabular-nums">{formatKzt(unit)}</p>
        </div>

        {/* FR-7.1 order summary with highlighted savings */}
        <div className="card space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">{t("unit_price")} × 1</span>
            <span className="font-semibold tabular-nums">{formatKzt(unit)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between rounded-lg bg-success-light px-2 py-1.5 font-bold text-success">
              <span>🎉 {t("savings_line")}</span>
              <span className="tabular-nums">−{formatKzt(savings)}</span>
            </div>
          )}
          {vat > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">{t("vat_line")}</span>
              <span className="font-semibold tabular-nums">{formatKzt(vat)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">{t("delivery_line")}</span>
            <span className="font-semibold tabular-nums">
              {product.deliveryKzt === 0 ? "0 ₸" : formatKzt(product.deliveryKzt)}
            </span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between font-semibold text-amber-600">
              <span>🎟 {t("coupon_applied", { value: formatKzt(couponValue) })}</span>
              <span className="tabular-nums">−{formatKzt(couponValue)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-black/5 pt-2.5 text-base font-extrabold">
            <span>{t("total")}</span>
            <span className="tabular-nums">{formatKzt(total)}</span>
          </div>
        </div>

        {/* coupon field (FR-8.x gamification hook) */}
        <div className="card">
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponError(false);
              }}
              placeholder={t("coupon_placeholder")}
              className={`w-full rounded-xl border-2 bg-bg px-3 py-2.5 text-sm font-semibold uppercase outline-none ${
                couponError ? "border-danger" : "border-transparent focus:border-primary/40"
              }`}
            />
            <button
              onClick={applyCoupon}
              className="shrink-0 rounded-xl bg-ink px-4 text-sm font-bold text-white active:scale-95"
            >
              {t("apply")}
            </button>
          </div>
          {couponError && <p className="mt-1.5 text-xs font-medium text-danger">{t("coupon_invalid")}</p>}
        </div>
      </main>

      <div className="shrink-0 space-y-2.5 border-t border-black/5 bg-white px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
        {/* SIM/eSIM step-up — identity confirmation at the trust moment */}
        {idState === "done" ? (
          <div className="flex items-center gap-2 rounded-xl bg-success-light px-3 py-2 text-xs font-bold text-success">
            <span>🔐</span>
            <span>{t("identity_step_up_done", { id: sec.identityId })}</span>
          </div>
        ) : (
          <button
            onClick={stepUp}
            disabled={idState === "pending"}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/30 bg-primary-light px-3 py-2.5 text-xs font-bold text-primary-dark disabled:opacity-70"
          >
            {idState === "pending" ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-dark border-t-transparent" />
                {t("identity_step_up_pending")}
              </>
            ) : (
              <>🔐 {t("identity_step_up_cta", { sim: simLabel })}</>
            )}
          </button>
        )}
        <button onClick={pay} className="btn-primary">
          💳 {t("pay_demo", { amount: formatKzt(total) })}
        </button>
        <p className="text-center text-[11px] text-muted">{t("pay_note")}</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutInner />
    </Suspense>
  );
}
