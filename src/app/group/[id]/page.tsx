"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { productById } from "@/data/products";
import { formatKzt } from "@/lib/currency";
import { config } from "@/lib/config";
import { nextTier } from "@/lib/engine/groups";
import { securityFor } from "@/lib/engine/identity";
import { ProductImage } from "@/components/ProductImage";
import { MarketplaceBadge } from "@/components/MarketplaceBadge";
import { GroupProgressBar } from "@/components/GroupProgressBar";
import { Countdown } from "@/components/Countdown";
import { TierLadder } from "@/components/TierLadder";
import { Avatar } from "@/components/Avatar";
import { InviteSheet } from "@/components/InviteSheet";

function fireConfetti() {
  confetti({ particleCount: 130, spread: 75, origin: { y: 0.6 } });
  setTimeout(
    () => confetti({ particleCount: 70, spread: 100, origin: { y: 0.4 }, scalar: 0.8 }),
    280
  );
}

// S10 — Group buy (FR-6.x), the demo centerpiece. S12 celebration is inline.
export default function GroupPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const group = useBirgeStore((s) => s.groups[id]);
  const user = useBirgeStore((s) => s.user);
  const security = useBirgeStore((s) => s.security);
  const joinGroup = useBirgeStore((s) => s.joinGroup);
  const simulateJoin = useBirgeStore((s) => s.simulateJoin);
  const [inviteOpen, setInviteOpen] = useState(false);
  const sec = securityFor(user?.phone ?? "", user?.carrierLabel ?? config.CARRIER_LABEL, security);
  const simLabel = sec.simType === "sim" ? t("sim_label") : t("esim_label");

  const product = group ? productById[group.productId] : undefined;
  const isMember = !!user && !!group && group.members.some((m) => m.id === user.id);
  const status = group?.status;

  // Demo determinism (TRD §7.3): simulated participants trickle in while this
  // screen is open; they never deliver the locking join — the user does.
  useEffect(() => {
    if (!config.DEMO_AUTO_JOIN || status !== "open") return;
    const timer = setInterval(() => simulateJoin(id), config.DEMO_AUTO_JOIN_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [id, status, simulateJoin]);

  // S12 — threshold reached: confetti exactly on the open→locked transition
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "open" && status === "locked") fireConfetti();
    prevStatus.current = status;
  }, [status]);

  if (!group || !product || !user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-muted">{t("feed_empty")}</p>
        <Link href="/feed" className="btn-secondary max-w-48">
          {t("to_feed")}
        </Link>
      </div>
    );
  }

  const count = group.members.length;
  const title = localized(product as unknown as Record<string, unknown>, "title", locale);
  const upcoming = nextTier(product, count);
  const locked = status === "locked" || status === "completed";
  const savings = product.soloPriceKzt - group.currentTierPriceKzt;

  const shareText = t("share_text", {
    title,
    price: formatKzt(group.currentTierPriceKzt),
    solo: formatKzt(product.soloPriceKzt),
  });

  return (
    <div className="relative flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-5">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm"
          aria-label={t("back")}
        >
          ←
        </button>
        <h1 className="text-lg font-bold">{t("group_buy")}</h1>
        {isMember && status === "open" && (
          <span className="ml-auto rounded-full bg-success-light px-2.5 py-1 text-[11px] font-bold text-success">
            ✓ {t("youre_in")}
          </span>
        )}
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto no-scrollbar px-5 pb-4">
        {/* product mini card */}
        <Link href={`/product/${product.id}`} className="card flex items-center gap-3 p-3">
          <ProductImage product={product} className="h-14 w-14 rounded-xl" emojiClassName="text-2xl" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{title}</p>
            <MarketplaceBadge marketplaceId={product.marketplaceId} className="mt-1" />
          </div>
        </Link>

        {/* S12 — celebration */}
        <AnimatePresence>
          {locked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card border-2 border-accent bg-accent-light text-center"
            >
              <div className="text-4xl">🎉</div>
              <p className="mt-1 text-lg font-extrabold">{t("group_locked_title")}</p>
              <p className="mt-0.5 text-sm font-medium text-ink/70">
                {t("group_locked_sub", { price: formatKzt(group.currentTierPriceKzt) })}
              </p>
              {status === "completed" && (
                <p className="mt-2 text-xs font-bold text-success">✓ {t("group_status_completed")}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {status === "failed" && (
          <div className="card border-2 border-danger/30 bg-danger/5 text-center text-sm font-semibold text-danger">
            {t("group_failed")}
          </div>
        )}

        {/* progress + countdown + live price */}
        <div className="card space-y-4">
          <GroupProgressBar count={count} min={group.minParticipants} />

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-muted">{t("current_price")}</p>
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={group.currentTierPriceKzt}
                  initial={{ scale: 1.25, color: "#1fa463" }}
                  animate={{ scale: 1, color: "#11242d" }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-extrabold tabular-nums"
                >
                  {formatKzt(group.currentTierPriceKzt)}
                </motion.p>
              </AnimatePresence>
              {savings > 0 && (
                <p className="text-xs font-bold text-success">
                  −{formatKzt(savings)} · {t("solo_short")} <span className="line-through">{formatKzt(product.soloPriceKzt)}</span>
                </p>
              )}
            </div>
            {status === "open" && (
              <div className="text-right">
                <p className="text-xs font-semibold text-muted">{t("time_left")}</p>
                <Countdown deadlineAt={group.deadlineAt} className="text-xl font-bold text-danger" />
              </div>
            )}
          </div>

          {status === "open" && upcoming && (
            <p className="rounded-xl bg-primary-light px-3 py-2.5 text-xs font-semibold text-primary-dark">
              ⚡ {t("need_more", {
                n: Math.max(1, upcoming.minParticipants - count),
                price: formatKzt(upcoming.unitPriceKzt),
              })}
            </p>
          )}
        </div>

        {/* SIM/eSIM trust strip — anti-fraud: 1 verified human = 1 seat */}
        <div className="card flex gap-3 border border-primary/15 bg-primary-light/50">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="text-sm font-bold text-primary-dark">{t("group_trust_title")}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {t("group_trust_sub", { sim: simLabel })}
            </p>
          </div>
        </div>

        {/* members (FR-6.9) */}
        <div className="card">
          <p className="mb-3 text-sm font-bold">
            {t("members")} · {count}
          </p>
          <div className="flex flex-wrap gap-3">
            {group.members.map((m) => {
              const isYou = m.id === user.id;
              return (
                <div key={m.id} className="flex w-14 flex-col items-center gap-1 text-center">
                  <div className="relative">
                    <Avatar name={isYou ? t("you") : m.name} highlight={isYou} />
                    {/* every participant is SIM/eSIM-verified */}
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-success text-[9px] text-white ring-2 ring-white">
                      ✓
                    </span>
                  </div>
                  <span className={`w-full truncate text-[10px] font-medium ${isYou ? "font-bold text-primary-dark" : "text-muted"}`}>
                    {isYou ? t("you") : m.name}
                  </span>
                </div>
              );
            })}
            {status === "open" &&
              Array.from({ length: Math.max(0, group.minParticipants - count) }).map((_, i) => (
                <div key={`empty-${i}`} className="flex w-14 flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-black/15 text-muted">
                    ?
                  </div>
                  <span className="text-[10px] text-transparent">·</span>
                </div>
              ))}
          </div>
        </div>

        <TierLadder product={product} currentCount={count} />

        {/* FR-6.8 policy note */}
        {status === "open" && (
          <div className="card bg-white/70 text-xs text-muted">
            <p className="mb-1 font-bold text-ink">🤔 {t("what_if_title")}</p>
            <p>{config.GROUP_FAIL_POLICY === "auto_extend" ? t("what_if_extend") : t("what_if_refund")}</p>
          </div>
        )}
      </main>

      {/* primary action */}
      <div className="shrink-0 space-y-2 border-t border-black/5 bg-white px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
        {status === "open" && !isMember && (
          <button
            onClick={() => joinGroup(id)}
            className="btn-primary"
          >
            👥 {t("join")} · {formatKzt(group.currentTierPriceKzt)}
          </button>
        )}
        {status === "open" && (
          <button
            onClick={() => setInviteOpen(true)}
            className={isMember ? "btn-primary" : "btn-secondary py-3"}
          >
            📤 {t("invite_friends")}
          </button>
        )}
        {status === "locked" && isMember && (
          <Link
            href={`/checkout?product=${product.id}&group=${group.id}&mode=group`}
            className="btn-primary"
          >
            ✓ {t("confirm_order")} · {formatKzt(group.currentTierPriceKzt)}
          </Link>
        )}
        {status === "failed" && (
          <Link href={`/product/${product.id}`} className="btn-secondary py-3">
            {t("start_group")}
          </Link>
        )}
      </div>

      <InviteSheet
        groupId={group.id}
        shareText={shareText}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}
