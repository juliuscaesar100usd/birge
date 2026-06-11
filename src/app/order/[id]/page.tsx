"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { productById } from "@/data/products";
import { formatKzt } from "@/lib/currency";
import { ProductImage } from "@/components/ProductImage";

// S14 — Order confirmation: success + savings vs solo (FR-7.x)
export default function OrderPage() {
  const { t, locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const order = useBirgeStore((s) => s.orders.find((o) => o.id === id));
  const fired = useRef(false);

  useEffect(() => {
    if (order && !fired.current) {
      fired.current = true;
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
    }
  }, [order]);

  if (!order) return null;
  const product = productById[order.productId];
  const title = product
    ? localized(product as unknown as Record<string, unknown>, "title", locale)
    : "";

  return (
    <div className="flex h-full flex-col items-center justify-center px-7 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-success text-5xl text-white shadow-xl shadow-success/30"
      >
        ✓
      </motion.div>
      <h1 className="mt-6 text-2xl font-extrabold">{t("order_done")}</h1>
      <p className="mt-1 text-sm text-muted">{t("order_no", { id: order.id.slice(-6).toUpperCase() })}</p>

      {order.savingsVsSoloKzt > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-5 w-full rounded-2xl border-2 border-accent bg-accent-light px-5 py-4"
        >
          <p className="text-lg font-extrabold text-ink">
            🎉 {t("you_saved", { amount: formatKzt(order.savingsVsSoloKzt) })}
          </p>
          <p className="mt-0.5 text-xs font-medium text-ink/60">
            {t("mode_group")} {formatKzt(order.unitPriceKzt)} · {t("solo_short")}{" "}
            <span className="line-through">{formatKzt(order.unitPriceKzt + order.savingsVsSoloKzt)}</span>
          </p>
        </motion.div>
      )}

      {product && (
        <div className="card mt-4 flex w-full items-center gap-3 p-3 text-left">
          <ProductImage product={product} className="h-12 w-12 rounded-xl" emojiClassName="text-2xl" />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</p>
          <p className="text-sm font-bold tabular-nums">{formatKzt(order.totalKzt)}</p>
        </div>
      )}

      <div className="mt-8 w-full space-y-2">
        <Link href="/feed" className="btn-primary">
          {t("to_feed")}
        </Link>
        <Link href="/profile" className="btn-secondary py-3">
          {t("my_orders")}
        </Link>
      </div>
    </div>
  );
}
