"use client";

import Link from "next/link";
import type { Group } from "@/lib/types";
import { productById } from "@/data/products";
import { formatKzt } from "@/lib/currency";
import { useI18n, localized } from "@/lib/i18n";
import { ProductImage } from "@/components/ProductImage";
import { GroupProgressBar } from "@/components/GroupProgressBar";
import { Countdown } from "@/components/Countdown";
import { Icon } from "@/components/Icon";
import { tierPriceFor } from "@/lib/engine/groups";

// S8 — the coral "hot group" card: hero group one join away from the best price
export function HotGroupCard({ group }: { group: Group }) {
  const { t, locale } = useI18n();
  const product = productById[group.productId];
  if (!product) return null;
  const title = localized(product as unknown as Record<string, unknown>, "title", locale);
  const unlockPrice = tierPriceFor(product, group.minParticipants);

  return (
    <div className="px-4">
      <Link
        href={`/group/${group.id}`}
        className="tap block rounded-2xl p-4 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg,#FF5A2C 0%,#E8410F 100%)" }}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-white/90">
            <Icon name="bolt" size={14} sw={2.4} /> {t("hot_group")} · {t("almost_there")}
          </span>
          <span className="num flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-[11.5px] font-bold">
            <Icon name="clock" size={12} sw={2.4} />
            <Countdown deadlineAt={group.deadlineAt} />
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <ProductImage product={product} className="h-14 w-14 shrink-0 rounded-xl" emojiClassName="text-2xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold">{title}</p>
            <p className="num mt-0.5">
              <span className="text-[20px] font-extrabold">{formatKzt(unlockPrice)}</span>{" "}
              <span className="text-[12.5px] font-semibold text-white/70 line-through">
                {formatKzt(product.soloPriceKzt)}
              </span>
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Icon name="chevron" size={18} sw={2.4} color="#fff" />
          </span>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex justify-between text-[12px] font-bold">
            <span>{t("joined_of", { x: group.members.length, n: group.minParticipants })}</span>
            <span className="text-white/80">{t("join_now")} →</span>
          </div>
          <GroupProgressBar count={group.members.length} min={group.minParticipants} variant="white" showLabel={false} />
        </div>
      </Link>
    </div>
  );
}
