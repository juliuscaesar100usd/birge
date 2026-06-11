"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { productById } from "@/data/products";
import { formatKzt } from "@/lib/currency";
import { ProductImage } from "@/components/ProductImage";
import { GroupProgressBar } from "@/components/GroupProgressBar";
import { Countdown } from "@/components/Countdown";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";

// Groups tab — active groups list (design §9)
export default function GroupsPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const user = useBirgeStore((s) => s.user);
  const groups = useBirgeStore((s) => s.groups);

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  const active = useMemo(
    () =>
      Object.values(groups)
        .filter(
          (g) =>
            (g.status === "open" || g.status === "locked") &&
            (g.id.startsWith("grp_seed") || (user && g.members.some((m) => m.id === user.id)))
        )
        .sort((a, b) => Number(b.status === "locked") - Number(a.status === "locked") || b.createdAt - a.createdAt),
    [groups, user]
  );

  if (!user) return null;

  return (
    <div className="screen-anim flex h-full flex-col">
      <header className="shrink-0 bg-white px-4 pb-3.5 pt-[58px] shadow-sm">
        <h1 className="t-h2">{t("active_groups")}</h1>
      </header>

      <main className="flex-1 space-y-2.5 overflow-y-auto no-scrollbar px-4 pb-24 pt-4">
        {active.length === 0 ? (
          <div className="card flex flex-col items-center py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue">
              <Icon name="groups" size={26} sw={2} />
            </span>
            <p className="t-h3 mt-3">{t("groups_empty")}</p>
            <p className="t-sub mt-1">{t("groups_empty_sub")}</p>
            <Link href="/catalog" className="btn btn--ghost btn--sm mt-4 max-w-52">
              {t("nav_catalog")}
            </Link>
          </div>
        ) : (
          active.map((g) => {
            const product = productById[g.productId];
            if (!product) return null;
            const isMember = g.members.some((m) => m.id === user.id);
            return (
              <Link key={g.id} href={`/group/${g.id}`} className="card tap block">
                <div className="flex items-center gap-3">
                  <ProductImage product={product} className="h-13 w-13 h-[52px] w-[52px] shrink-0 rounded-xl" emojiClassName="text-2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-ink">
                      {localized(product as unknown as Record<string, unknown>, "title", locale)}
                    </p>
                    <p className="num mt-0.5 text-[15px] font-extrabold text-coral">
                      {formatKzt(g.currentTierPriceKzt)}
                      {g.currentTierPriceKzt < product.soloPriceKzt && (
                        <span className="ml-1.5 text-[11.5px] font-semibold text-muted2 line-through">
                          {formatKzt(product.soloPriceKzt)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {g.status === "locked" ? (
                      <span className="pill-badge pill-green">✓ {t("group_status_locked")}</span>
                    ) : (
                      <span className="num pill-badge pill-coral">
                        <Icon name="clock" size={11} sw={2.6} />
                        <Countdown deadlineAt={g.deadlineAt} />
                      </span>
                    )}
                    {isMember && <span className="pill-badge pill-blue">{t("youre_in")}</span>}
                  </div>
                </div>
                <div className="mt-3">
                  <GroupProgressBar count={g.members.length} min={g.minParticipants} variant={g.status === "locked" ? "green" : "coral"} />
                </div>
              </Link>
            );
          })
        )}
      </main>

      <BottomNav />
    </div>
  );
}
