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
import { Icon } from "@/components/Icon";
import { emitToast } from "@/lib/events";

// S14 — Confirmation: success, green savings hero, delivery ETA (design §9)
export default function OrderPage() {
  const { t, locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const order = useBirgeStore((s) => s.orders.find((o) => o.id === id));
  const fired = useRef(false);

  useEffect(() => {
    if (order && !fired.current) {
      fired.current = true;
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.45 } });
    }
  }, [order]);

  if (!order) return null;
  const product = productById[order.productId];
  const title = product
    ? localized(product as unknown as Record<string, unknown>, "title", locale)
    : "";

  const shareDeal = async () => {
    if (!product) return;
    const text = t("share_text", {
      title,
      price: formatKzt(order.unitPriceKzt),
      solo: formatKzt(product.soloPriceKzt),
    });
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard may be unavailable — toast still confirms the action
    }
    emitToast("success", "copied");
  };

  return (
    <div className="screen-anim flex h-full flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-green text-white shadow-xl shadow-green/30"
      >
        <Icon name="check" size={42} sw={3} color="#fff" />
      </motion.div>
      <h1 className="t-h1 mt-5">{t("order_done")}</h1>
      <p className="t-sub mt-1">{t("order_sub")}</p>
      <p className="num t-tiny mt-1">{t("order_no", { id: order.id.slice(-6).toUpperCase() })}</p>

      {order.savingsVsSoloKzt > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-5 w-full rounded-2xl bg-green-50 px-5 py-4"
          style={{ boxShadow: "inset 0 0 0 2px var(--color-green)" }}
        >
          <p className="num text-[19px] font-extrabold text-green-700">
            🎉 {t("you_saved", { amount: formatKzt(order.savingsVsSoloKzt) })}
          </p>
          <p className="mt-0.5 text-[12px] font-semibold text-green-700/75">{t("vs_solo")}</p>
        </motion.div>
      )}

      {product && (
        <div className="card mt-3 flex w-full items-center gap-3 text-left">
          <ProductImage product={product} className="h-12 w-12 shrink-0 rounded-xl" emojiClassName="text-2xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-bold">{title}</p>
            <p className="t-tiny mt-0.5 flex items-center gap-1">
              <Icon name="truck" size={13} sw={2.2} />
              {t("delivery_short", { n: product.deliveryDays })} · ×{order.qty}
            </p>
          </div>
          <p className="num text-[14.5px] font-extrabold">{formatKzt(order.totalKzt)}</p>
        </div>
      )}

      <div className="mt-7 w-full space-y-2">
        <button onClick={shareDeal} className="btn btn--blue">
          <Icon name="share" size={17} sw={2.2} /> {t("share_deal")}
        </button>
        <div className="flex gap-2">
          <Link href="/profile" className="btn btn--outline btn--sm flex-1">
            {t("my_orders")}
          </Link>
          <Link href="/feed" className="btn btn--ghost btn--sm flex-1">
            {t("to_feed")}
          </Link>
        </div>
      </div>
    </div>
  );
}
