"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { productById } from "@/data/products";
import { formatKzt } from "@/lib/currency";
import { config } from "@/lib/config";
import { nextTier, tierPriceFor } from "@/lib/engine/groups";
import { ProductImage } from "@/components/ProductImage";
import { MarketplaceBadge } from "@/components/MarketplaceBadge";
import { GroupProgressBar } from "@/components/GroupProgressBar";
import { Countdown } from "@/components/Countdown";
import { TierLadder } from "@/components/TierLadder";
import { Avatar } from "@/components/Avatar";
import { InviteSheet } from "@/components/InviteSheet";
import { Icon } from "@/components/Icon";

// S10 — Group buy, the centerpiece: coral header + countdown, live price,
// avatars with empty slots, reassurance, demo simulate (design §9, FR-6.x)
export default function GroupPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const group = useBirgeStore((s) => s.groups[id]);
  const user = useBirgeStore((s) => s.user);
  const joinGroup = useBirgeStore((s) => s.joinGroup);
  const simulateJoin = useBirgeStore((s) => s.simulateJoin);
  const openGroupForProduct = useBirgeStore((s) => s.openGroupForProduct);
  const [inviteOpen, setInviteOpen] = useState(false);

  const product = group ? productById[group.productId] : undefined;
  const isMember = !!user && !!group && group.members.some((m) => m.id === user.id);
  const status = group?.status;

  // Demo determinism (TRD §7.3): simulated joins trickle in while the screen is
  // open; the guard in the store never lets them deliver the locking join.
  useEffect(() => {
    if (!config.DEMO_AUTO_JOIN || status !== "open") return;
    const timer = setInterval(() => simulateJoin(id), config.DEMO_AUTO_JOIN_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [id, status, simulateJoin]);

  // S12 — threshold screen on the open→locked transition for members
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "open" && status === "locked" && isMember) {
      router.push(`/threshold/${id}`);
    }
    prevStatus.current = status;
  }, [status, isMember, id, router]);

  if (!group || !product || !user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="t-sub">{t("feed_empty")}</p>
        <Link href="/feed" className="btn btn--ghost max-w-48">
          {t("to_feed")}
        </Link>
      </div>
    );
  }

  const count = group.members.length;
  const title = localized(product as unknown as Record<string, unknown>, "title", locale);
  const upcoming = nextTier(product, count);
  const locked = status === "locked" || status === "completed";
  const joinPrice = tierPriceFor(product, group.minParticipants);
  const savings = product.soloPriceKzt - group.currentTierPriceKzt;
  const emptySlots = Math.max(0, group.minParticipants - count);

  const shareText = t("share_text", {
    title,
    price: formatKzt(joinPrice),
    solo: formatKzt(product.soloPriceKzt),
  });

  return (
    <div className="screen-anim relative flex h-full flex-col">
      {/* coral header */}
      <header
        className="shrink-0 px-4 pb-4 pt-[58px] text-white"
        style={{ background: "linear-gradient(135deg,#FF5A2C 0%,#E8410F 100%)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="tap flex h-9 w-9 items-center justify-center rounded-full bg-white/18"
            aria-label={t("back")}
          >
            <Icon name="back" size={19} sw={2.2} color="#fff" />
          </button>
          <h1 className="flex-1 text-[17px] font-extrabold">{t("group_buy")}</h1>
          {status === "open" && (
            <span className="num flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-[12px] font-bold">
              <Icon name="clock" size={13} sw={2.4} />
              <Countdown deadlineAt={group.deadlineAt} />
            </span>
          )}
          <button
            onClick={() => setInviteOpen(true)}
            className="tap flex h-9 w-9 items-center justify-center rounded-full bg-white/18"
            aria-label={t("invite_friends")}
          >
            <Icon name="share" size={17} sw={2.2} color="#fff" />
          </button>
        </div>
      </header>

      <main className="flex-1 space-y-3.5 overflow-y-auto no-scrollbar px-4 pb-4 pt-4">
        {/* product + live price */}
        <div className="card">
          <Link href={`/product/${product.id}`} className="flex items-center gap-3">
            <ProductImage product={product} className="h-14 w-14 shrink-0 rounded-xl" emojiClassName="text-2xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-ink">{title}</p>
              <MarketplaceBadge marketplaceId={product.marketplaceId} className="mt-1" />
            </div>
            <Icon name="chevron" size={18} sw={2.2} color="#9AA2AD" />
          </Link>
          <div className="hr my-3.5" />
          <p className="t-tiny">{t("current_price")}</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span key={group.currentTierPriceKzt} className="price-drop num text-[32px] font-extrabold leading-none text-coral">
              {formatKzt(group.currentTierPriceKzt)}
            </span>
            <span className="num text-[15px] font-semibold text-muted2 line-through">
              {formatKzt(product.soloPriceKzt)}
            </span>
          </div>
          {savings > 0 && (
            <span className="pill-badge pill-green mt-2">
              {t("thr_saved")} {formatKzt(savings)}
            </span>
          )}
        </div>

        {status === "failed" && (
          <div className="card border-2 border-coral/30 bg-coral-50 text-center text-sm font-bold text-coral-700">
            {t("group_failed")}
          </div>
        )}

        {locked && (
          <div className="card border-2 border-green/40 bg-green-50 text-center">
            <p className="text-[17px] font-extrabold text-green-700">🎉 {t("group_locked_title")}</p>
            <p className="t-sub mt-1">{t("group_locked_sub", { price: formatKzt(group.currentTierPriceKzt) })}</p>
            {status === "completed" && (
              <p className="mt-1.5 text-xs font-bold text-green-700">✓ {t("group_status_completed")}</p>
            )}
          </div>
        )}

        {/* progress + members */}
        <div className="card">
          <div className="flex items-baseline justify-between">
            <p className="num text-[15px] font-extrabold text-ink">
              {count} / {group.minParticipants}{" "}
              <span className="text-[12.5px] font-semibold text-muted">{t("people_joined")}</span>
            </p>
            <span className="num text-[12.5px] font-bold text-coral">
              {Math.min(100, Math.round((count / group.minParticipants) * 100))}%
            </span>
          </div>
          <div className="mt-2">
            <GroupProgressBar count={count} min={group.minParticipants} showLabel={false} />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {group.members.map((m) => {
              const isYou = m.id === user.id;
              return (
                <div key={m.id} className="flex w-12 flex-col items-center gap-1 text-center">
                  <div className="relative">
                    <Avatar name={isYou ? t("you") : m.name} highlight={isYou} />
                    {isYou && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green text-white ring-2 ring-white">
                        <Icon name="check" size={9} sw={3.4} color="#fff" />
                      </span>
                    )}
                  </div>
                  <span className={`w-full truncate text-[10px] font-semibold ${isYou ? "text-blue" : "text-muted"}`}>
                    {isYou ? t("you") : m.name}
                  </span>
                </div>
              );
            })}
            {status === "open" &&
              Array.from({ length: emptySlots }).map((_, i) => (
                <div key={`empty-${i}`} className="flex w-12 flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-[#C9CFD8] text-muted2">
                    <Icon name="plus" size={15} sw={2.2} />
                  </div>
                </div>
              ))}
          </div>

          {status === "open" && (
            <div className="mt-3.5 space-y-1.5">
              {emptySlots > 0 && (
                <p className="rounded-xl bg-coral-50 px-3 py-2.5 text-[12.5px] font-bold text-coral-700">
                  ⚡ {t("need_more", { n: emptySlots })}
                </p>
              )}
              {upcoming && (
                <p className="rounded-xl bg-blue-50 px-3 py-2.5 text-[12.5px] font-bold text-blue">
                  {t("next_tier", {
                    n: Math.max(1, upcoming.minParticipants - count),
                    price: formatKzt(upcoming.unitPriceKzt),
                  })}
                </p>
              )}
            </div>
          )}
        </div>

        <TierLadder product={product} currentCount={count} />

        {status === "open" && (
          <>
            {/* reassurance (design: money returns automatically) */}
            <div className="card flex gap-3 bg-blue-50">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue">
                <Icon name="shield" size={17} sw={2.2} />
              </span>
              <div>
                <p className="text-[13.5px] font-bold text-ink">{t("what_if_title")}</p>
                <p className="t-sub mt-0.5 text-[12.5px]">
                  {config.GROUP_FAIL_POLICY === "auto_extend" ? t("what_if_extend") : t("what_if_refund")}
                </p>
              </div>
            </div>

            {/* demo helper */}
            <button
              onClick={() => simulateJoin(id)}
              className="tap flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#C9CFD8] py-3 text-[13px] font-bold text-muted"
            >
              <Icon name="users" size={16} sw={2.2} /> {t("simulate_join")}
            </button>
          </>
        )}
      </main>

      {/* sticky action bar */}
      <div className="actionbar shrink-0">
        {status === "open" && !isMember && (
          <div className="flex gap-2.5">
            <button
              onClick={() => setInviteOpen(true)}
              className="btn btn--outline w-[52px] shrink-0 px-0"
              aria-label={t("invite_friends")}
            >
              <Icon name="share" size={19} sw={2.2} />
            </button>
            <button onClick={() => joinGroup(id)} className="btn btn--coral flex-1">
              {t("join_now")} · <span className="num">{formatKzt(joinPrice)}</span>
            </button>
          </div>
        )}
        {status === "open" && isMember && (
          <div className="flex gap-2.5">
            <span className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-2xl bg-green-50 px-4 text-[14px] font-bold text-green-700">
              <Icon name="check" size={15} sw={3} /> {t("youre_in")}
            </span>
            <button onClick={() => setInviteOpen(true)} className="btn btn--coral flex-1">
              {t("invite_friends")}
            </button>
          </div>
        )}
        {status === "locked" && isMember && (
          <Link href={`/threshold/${group.id}`} className="btn btn--coral">
            ✓ {t("confirm_order")} · <span className="num">{formatKzt(group.currentTierPriceKzt)}</span>
          </Link>
        )}
        {status === "completed" && (
          <Link href="/feed" className="btn btn--outline">
            {t("to_feed")}
          </Link>
        )}
        {status === "failed" && (
          <button
            onClick={() => {
              const newId = openGroupForProduct(product.id);
              if (newId) router.replace(`/group/${newId}`);
            }}
            className="btn btn--coral"
          >
            {t("start_group")}
          </button>
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
