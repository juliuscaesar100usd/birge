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
import { securityFor } from "@/lib/engine/identity";
import { Avatar } from "@/components/Avatar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";

// S15 — Profile: blue header with centered identity, savings stat, orders,
// referral card, coupons, language, demo reset (design §9)
export default function ProfilePage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const user = useBirgeStore((s) => s.user);
  const security = useBirgeStore((s) => s.security);
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
    <div className="screen-anim flex h-full flex-col">
      {/* blue header with centered identity */}
      <header
        className="shrink-0 px-5 pb-5 pt-[58px] text-center text-white"
        style={{ background: "linear-gradient(180deg,#2E86F5 0%,#1668E3 100%)" }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-[17px] font-extrabold">{t("profile")}</h1>
          <LanguageToggle dark />
        </div>
        <div className="mt-2 flex flex-col items-center">
          <Avatar name={user.phone.slice(-4)} size="h-16 w-16 text-xl" />
          <p className="num mt-2.5 text-[17px] font-extrabold">{user.phone}</p>
          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/16 px-3 py-1 text-[11.5px] font-bold">
            <Icon name="shield" size={12} sw={2.6} color="#7CF2B6" /> {t("verified_identity")}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/14 px-4 py-3 backdrop-blur-sm">
          <div className="text-left">
            <p className="text-[11px] font-bold uppercase tracking-wide text-white/65">{t("total_saved")}</p>
            <p className="num text-[21px] font-extrabold">{formatKzt(totalSaved)}</p>
          </div>
          <span className="num rounded-full bg-white/16 px-3 py-1.5 text-[12px] font-bold">
            {t("orders_count", { n: orders.length })}
          </span>
        </div>
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto no-scrollbar px-4 pb-24 pt-4">
        {/* SIM/eSIM security panel */}
        {(() => {
          const sec = securityFor(user.phone, user.carrierLabel, security);
          const simLabel = sec.simType === "sim" ? t("sim_label") : t("esim_label");
          return (
            <section>
              <h2 className="t-h3 mb-2">🔐 {t("security_title")}</h2>
              <div className="card space-y-2.5 text-[13.5px]">
                <p className="flex items-center gap-2 font-semibold text-green-700">
                  <Icon name="check" size={15} sw={3} color="#0E7E45" /> {t("security_device_bound")}
                </p>
                <p className="flex items-center gap-2 border-t border-line pt-2.5 font-semibold text-green-700">
                  <Icon name="check" size={15} sw={3} color="#0E7E45" /> {t("security_sim_swap")}
                </p>
                <div className="flex items-center justify-between border-t border-line pt-2.5">
                  <span className="text-muted">{t("security_id_label", { sim: simLabel })}</span>
                  <span className="num font-mono text-[12.5px] font-bold">{sec.identityId}</span>
                </div>
                <Link
                  href="/identity"
                  className="flex items-center justify-between border-t border-line pt-2.5 text-[13px] font-bold text-blue"
                >
                  <span>{t("security_more")}</span>
                  <Icon name="chevron" size={16} sw={2.2} color="#1668E3" />
                </Link>
              </div>
            </section>
          );
        })()}

        {/* orders */}
        <section>
          <h2 className="t-h3 mb-2">📦 {t("my_orders")}</h2>
          {orders.length === 0 ? (
            <div className="card py-7 text-center">
              <p className="text-sm font-bold text-ink">{t("no_orders")}</p>
              <p className="t-sub mt-1 text-[12.5px]">{t("no_orders_sub")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => {
                const p = productById[o.productId];
                return (
                  <div key={o.id} className="card flex items-center gap-3 p-3">
                    <span className="text-2xl">{p?.emoji ?? "🛍"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold">
                        {p ? localized(p as unknown as Record<string, unknown>, "title", locale) : o.productId}
                      </p>
                      <p className="t-tiny mt-0.5">
                        <span className={`pill-badge mr-1.5 ${o.mode === "group" ? "pill-coral" : "pill-blue"}`}>
                          {o.mode === "group" ? t("mode_group") : t("mode_solo")}
                        </span>
                        {dateFmt.format(o.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="num text-[13.5px] font-extrabold">{formatKzt(o.totalKzt)}</p>
                      {o.savingsVsSoloKzt > 0 && (
                        <p className="num text-[11px] font-bold text-green-700">−{formatKzt(o.savingsVsSoloKzt)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* referral card */}
        <div
          className="tap rounded-2xl p-4 text-white shadow-md"
          style={{ background: "linear-gradient(135deg,#FF5A2C,#FF8A3C)" }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/18">
              <Icon name="gift" size={22} sw={2} color="#fff" />
            </span>
            <div>
              <p className="text-[14.5px] font-extrabold leading-tight">{t("referral_card")}</p>
              <p className="mt-0.5 text-[12px] font-medium text-white/85">{t("referral_sub")}</p>
            </div>
          </div>
        </div>

        {/* coupons */}
        <section>
          <h2 className="t-h3 mb-2">🎟 {t("my_coupons")}</h2>
          <div className="space-y-2">
            {coupons.map((c) => (
              <div
                key={c.code}
                className={`card flex items-center justify-between border border-dashed p-3 ${
                  c.used ? "opacity-50" : ""
                }`}
                style={{ borderColor: c.used ? "var(--color-line)" : "var(--color-yellow)" }}
              >
                <div>
                  <p className="font-mono text-[13px] font-extrabold">{c.code}</p>
                  <p className="t-tiny">
                    {c.used ? t("coupon_used") : t("coupon_until", { date: dateFmt.format(c.expiresAt) })}
                  </p>
                </div>
                <span className="num text-[14px] font-extrabold text-amber-600">−{formatKzt(c.valueKzt)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* referrals */}
        <section>
          <h2 className="t-h3 mb-2">🤝 {t("my_referrals")}</h2>
          {referrals.length === 0 ? (
            <div className="card py-5 text-center text-xs text-muted">{t("no_referrals")}</div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r) => (
                <div key={r.id} className="card flex items-center gap-3 p-3">
                  <Avatar name={r.inviteeName} size="h-9 w-9 text-xs" />
                  <p className="flex-1 text-[13.5px] font-bold">{r.inviteeName}</p>
                  <span className="num text-[13.5px] font-extrabold text-green-700">+{formatKzt(r.rewardKzt)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* preferences */}
        <section>
          <h2 className="t-h3 mb-2">⚙️ {t("preferences")}</h2>
          <div className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((cid) => {
                  const c = categoryById[cid];
                  return c ? (
                    <span key={cid} className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-bold">
                      {c.icon} {localized(c as unknown as Record<string, unknown>, "name", locale)}
                    </span>
                  ) : null;
                })}
              </div>
              <Link href="/onboarding/interests?edit=1" className="shrink-0 text-xs font-extrabold text-blue">
                {t("edit")}
              </Link>
            </div>
            <div className="hr" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">
                {t("budget_label")}: <b className="text-ink">{t(`budget_${user.budgetBand}`)}</b>
              </span>
              <Link href="/onboarding/budget?edit=1" className="text-xs font-extrabold text-blue">
                {t("edit")}
              </Link>
            </div>
            <div className="hr" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">
                {t("city_label")}:{" "}
                <b className="text-ink">
                  {city ? localized(city as unknown as Record<string, unknown>, "name", locale) : user.city}
                </b>
              </span>
            </div>
            <div className="hr" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">{t("language")}</span>
              <LanguageToggle />
            </div>
          </div>
        </section>

        <button onClick={resetAll} className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-bold text-coral-700/80">
          <Icon name="refresh" size={13} sw={2.4} /> {t("reset_demo")}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
