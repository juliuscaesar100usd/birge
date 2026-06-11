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
import { Icon } from "@/components/Icon";

// S13 — Checkout: qty stepper, promo chips (BIRGE500 / coupons), pay method,
// savings highlighted green (design §9, FR-7.x)
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

  const [qty, setQty] = useState(1);
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
    if (groupId) router.replace(`/group/${groupId}`);
    else router.replace(`/product/${productId}`);
    return null;
  }

  const unit = mode === "group" && group ? group.currentTierPriceKzt : product.soloPriceKzt;
  const savings = Math.max(0, product.soloPriceKzt - unit) * qty;
  const vat = product.vatApplicable ? Math.round(config.VAT_RATE * unit * qty) : 0;
  const couponValue = appliedCode
    ? appliedCode === "BIRGE500"
      ? 500
      : (coupons.find((c) => c.code === appliedCode && !c.used)?.valueKzt ?? 0)
    : 0;
  const total = Math.max(0, unit * qty + vat + product.deliveryKzt - couponValue);
  const title = localized(product as unknown as Record<string, unknown>, "title", locale);

  // suggestion chips: demo promo + the user's unused coupons
  // (expiry is enforced in applyCode/placeOrder, not during render)
  const suggestions = ["BIRGE500", ...coupons.filter((c) => !c.used).map((c) => c.code)];

  const applyCode = (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) return;
    const valid =
      code === "BIRGE500" ||
      coupons.some((c) => c.code.toUpperCase() === code && !c.used && c.expiresAt > Date.now());
    setCouponInput(code);
    if (!valid) {
      setCouponError(true);
      setAppliedCode(null);
      return;
    }
    setCouponError(false);
    setAppliedCode(code);
  };

  const pay = () => {
    const result = placeOrder({
      productId: product.id,
      groupId,
      mode,
      qty,
      couponCode: appliedCode ?? undefined,
    });
    if (result.ok) router.push(`/order/${result.order.id}`);
    else if (result.error === "COUPON_INVALID") setCouponError(true);
    else if (groupId) router.replace(`/group/${groupId}`);
  };

  return (
    <div className="screen-anim flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 px-4 pb-3 pt-[58px]">
        <button
          onClick={() => router.back()}
          className="tap flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label={t("back")}
        >
          <Icon name="back" size={20} sw={2.2} />
        </button>
        <h1 className="t-h3">{t("checkout_title")}</h1>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto no-scrollbar px-4 pb-4">
        {/* summary + qty stepper */}
        <div className="card">
          <p className="t-h3 mb-3">{t("order_summary")}</p>
          <div className="flex items-center gap-3">
            <ProductImage product={product} className="h-14 w-14 shrink-0 rounded-xl" emojiClassName="text-2xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold text-ink">{title}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <MarketplaceBadge marketplaceId={product.marketplaceId} />
                <span className={`pill-badge ${mode === "group" ? "pill-coral" : "pill-blue"}`}>
                  {mode === "group" ? `👥 ${t("mode_group")}` : t("mode_solo")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="tap flex h-8 w-8 items-center justify-center rounded-full bg-line2"
                aria-label="−"
              >
                <Icon name="minus" size={14} sw={2.6} />
              </button>
              <span className="num w-4 text-center text-[15px] font-extrabold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(9, q + 1))}
                className="tap flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue"
                aria-label="+"
              >
                <Icon name="plus" size={14} sw={2.6} />
              </button>
            </div>
          </div>
        </div>

        {/* promo */}
        <div className="card">
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponError(false);
              }}
              placeholder={t("coupon_placeholder")}
              className="h-11 w-full rounded-xl bg-bg px-3.5 text-sm font-bold uppercase text-ink outline-none placeholder:font-medium placeholder:normal-case focus:ring-2 focus:ring-blue/30"
              style={couponError ? { boxShadow: "inset 0 0 0 2px var(--color-coral)" } : undefined}
            />
            <button
              onClick={() => applyCode(couponInput)}
              className="btn btn--dark btn--sm h-11 w-auto shrink-0 px-4"
            >
              {t("apply")}
            </button>
          </div>
          {couponError && <p className="mt-1.5 text-xs font-bold text-coral-700">{t("coupon_invalid")}</p>}
          {appliedCode && !couponError && (
            <p className="mt-1.5 text-xs font-bold text-green-700">
              ✓ {t("coupon_applied", { value: formatKzt(couponValue) })}
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {suggestions.map((code) => (
              <button
                key={code}
                onClick={() => applyCode(code)}
                className={`pill-badge h-7 px-3 font-mono text-[11px] ${appliedCode === code ? "pill-green" : "pill-yellow"}`}
              >
                🎟 {code}
              </button>
            ))}
          </div>
        </div>

        {/* breakdown */}
        <div className="card space-y-2.5 text-[14px]">
          <div className="flex justify-between">
            <span className="text-muted">
              {mode === "group" ? t("group_price_label") : t("unit_price")} × {qty}
            </span>
            <span className="num font-bold">{formatKzt(unit * qty)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between rounded-lg bg-green-50 px-2.5 py-2 font-extrabold text-green-700">
              <span>🎉 {t("savings_line")}</span>
              <span className="num">−{formatKzt(savings)}</span>
            </div>
          )}
          {vat > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">{t("vat_line")}</span>
              <span className="num font-bold">{formatKzt(vat)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">{t("delivery_line")}</span>
            <span className="num font-bold">
              {product.deliveryKzt === 0 ? t("free_delivery") : formatKzt(product.deliveryKzt)}
            </span>
          </div>
          {couponValue > 0 && (
            <div className="flex justify-between font-bold text-amber-600">
              <span>🎟 {appliedCode}</span>
              <span className="num">−{formatKzt(couponValue)}</span>
            </div>
          )}
          <div className="hr" />
          <div className="flex justify-between pt-0.5 text-[16px] font-extrabold">
            <span>{t("total")}</span>
            <span className="num">{formatKzt(total)}</span>
          </div>
        </div>

        {/* pay method */}
        <div className="card flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral">
            <Icon name="cart" size={19} sw={2} />
          </span>
          <div className="flex-1">
            <p className="t-tiny">{t("pay_method")}</p>
            <p className="text-[14px] font-bold text-ink">{t("pay_card")}</p>
          </div>
          <Icon name="chevron" size={18} sw={2.2} color="#9AA2AD" />
        </div>
      </main>

      <div className="actionbar shrink-0">
        {/* SIM/eSIM step-up — identity confirmation at the trust moment */}
        {idState === "done" ? (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-[12.5px] font-bold text-green-700">
            <Icon name="shield" size={14} sw={2.4} color="#0E7E45" />
            {t("identity_step_up_done", { id: sec.identityId })}
          </div>
        ) : (
          <button
            onClick={stepUp}
            disabled={idState === "pending"}
            className="btn btn--ghost btn--sm mb-2 w-full gap-2"
          >
            {idState === "pending" ? (
              <>
                <span
                  className="inline-block h-3.5 w-3.5 rounded-full border-2 border-blue border-t-transparent"
                  style={{ animation: "spinrev .8s linear infinite" }}
                />
                {t("identity_step_up_pending")}
              </>
            ) : (
              <>
                <Icon name="lock" size={15} sw={2.2} color="#1668E3" />
                {t("identity_step_up_cta", { sim: simLabel })}
              </>
            )}
          </button>
        )}
        <button onClick={pay} className="btn btn--blue">
          {t("pay_demo", { amount: formatKzt(total) })}
        </button>
        <p className="t-tiny mt-2 text-center">{t("pay_note")}</p>
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
