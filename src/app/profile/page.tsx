"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { productById } from "@/data/products";
import { categoryById } from "@/data/categories";
import { cityById } from "@/data/cities";
import { formatKzt } from "@/lib/currency";
import { Avatar } from "@/components/Avatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BottomNav } from "@/components/BottomNav";

// S15 — Profile: verified identity, orders with savings, coupons, referrals, prefs
export default function ProfilePage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const user = useBirgeStore((s) => s.user);
  const orders = useBirgeStore((s) => s.orders);
  const coupons = useBirgeStore((s) => s.coupons);
  const referrals = useBirgeStore((s) => s.referrals);
  const resetAll = useBirgeStore((s) => s.resetAll);

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  if (!user) return null;

  const totalSaved = orders.reduce((sum, o) => sum + o.savingsVsSoloKzt, 0);
  const city = cityById[user.city];
  const dateFmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ru-RU", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 pb-2 pt-5">
        <h1 className="text-xl font-bold">{t("profile")}</h1>
        <LanguageToggle />
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto no-scrollbar px-5 pb-4 pt-1">
        {/* identity card (FR-1.3) */}
        <div className="card flex items-center gap-3.5">
          <Avatar name={user.displayName} size="h-14 w-14 text-xl" />
          <div>
            <p className="text-base font-bold tabular-nums">{user.phone}</p>
            <VerifiedBadge carrier={user.carrierLabel} className="mt-1.5" />
          </div>
        </div>

        {/* savings stat */}
        <div className="card flex items-center justify-between bg-gradient-to-r from-primary to-primary-dark text-white">
          <div>
            <p className="text-xs font-semibold text-white/75">{t("total_saved")}</p>
            <p className="mt-0.5 text-2xl font-extrabold tabular-nums">{formatKzt(totalSaved)}</p>
          </div>
          <span className="text-4xl">💰</span>
        </div>

        {/* orders (FR-7.3) */}
        <section>
          <h2 className="mb-2 text-sm font-bold text-muted">📦 {t("my_orders")}</h2>
          {orders.length === 0 ? (
            <div className="card py-6 text-center text-sm text-muted">{t("no_orders")}</div>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => {
                const p = productById[o.productId];
                return (
                  <div key={o.id} className="card flex items-center gap-3 p-3">
                    <span className="text-2xl">{p?.emoji ?? "🛍"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {p ? localized(p as unknown as Record<string, unknown>, "title", locale) : o.productId}
                      </p>
                      <p className="text-[11px] text-muted">
                        <span
                          className={`mr-1.5 rounded px-1 py-0.5 font-bold ${
                            o.mode === "group" ? "bg-primary-light text-primary-dark" : "bg-black/5"
                          }`}
                        >
                          {o.mode === "group" ? t("mode_group") : t("mode_solo")}
                        </span>
                        {dateFmt.format(o.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums">{formatKzt(o.totalKzt)}</p>
                      {o.savingsVsSoloKzt > 0 && (
                        <p className="text-[11px] font-bold text-success">
                          −{formatKzt(o.savingsVsSoloKzt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* coupons (FR-8.2) */}
        <section>
          <h2 className="mb-2 text-sm font-bold text-muted">🎟 {t("my_coupons")}</h2>
          <div className="space-y-2">
            {coupons.map((c) => (
              <div
                key={c.code}
                className={`card flex items-center justify-between border border-dashed p-3 ${
                  c.used ? "opacity-50" : "border-accent"
                }`}
              >
                <div>
                  <p className="font-mono text-sm font-bold">{c.code}</p>
                  <p className="text-[11px] text-muted">
                    {c.used ? t("coupon_used") : t("coupon_until", { date: dateFmt.format(c.expiresAt) })}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-amber-600">−{formatKzt(c.valueKzt)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* referrals (FR-8.1) */}
        <section>
          <h2 className="mb-2 text-sm font-bold text-muted">🤝 {t("my_referrals")}</h2>
          {referrals.length === 0 ? (
            <div className="card py-5 text-center text-xs text-muted">{t("no_referrals")}</div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r) => (
                <div key={r.id} className="card flex items-center gap-3 p-3">
                  <Avatar name={r.inviteeName} size="h-9 w-9 text-xs" />
                  <p className="flex-1 text-sm font-semibold">{r.inviteeName}</p>
                  <span className="text-sm font-bold text-success">+{formatKzt(r.rewardKzt)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* preferences (FR-2.5) */}
        <section>
          <h2 className="mb-2 text-sm font-bold text-muted">⚙️ {t("preferences")}</h2>
          <div className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((cid) => {
                  const c = categoryById[cid];
                  return c ? (
                    <span key={cid} className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-semibold">
                      {c.icon} {localized(c as unknown as Record<string, unknown>, "name", locale)}
                    </span>
                  ) : null;
                })}
              </div>
              <Link href="/onboarding/interests?edit=1" className="shrink-0 text-xs font-bold text-primary-dark">
                {t("edit")}
              </Link>
            </div>
            <div className="flex items-center justify-between border-t border-black/5 pt-3 text-sm">
              <span className="text-muted">
                {t("budget_label")}: <b className="text-ink">{t(`budget_${user.budgetBand}`)}</b>
              </span>
              <Link href="/onboarding/budget?edit=1" className="text-xs font-bold text-primary-dark">
                {t("edit")}
              </Link>
            </div>
            <div className="flex items-center justify-between border-t border-black/5 pt-3 text-sm">
              <span className="text-muted">
                {t("city_label")}:{" "}
                <b className="text-ink">
                  {city ? localized(city as unknown as Record<string, unknown>, "name", locale) : user.city}
                </b>
              </span>
            </div>
          </div>
        </section>

        <button
          onClick={resetAll}
          className="w-full py-2 text-center text-xs font-semibold text-danger/70"
        >
          {t("reset_demo")}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
