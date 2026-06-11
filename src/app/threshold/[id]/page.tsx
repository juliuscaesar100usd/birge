"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { productById } from "@/data/products";
import { formatKzt, pctOff } from "@/lib/currency";
import { ProductImage } from "@/components/ProductImage";
import { Icon } from "@/components/Icon";

// S12 — Threshold reached: green gradient, confetti, Было/Стало, CTA (design §9)
export default function ThresholdPage() {
  const { t, locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const group = useBirgeStore((s) => s.groups[id]);
  const fired = useRef(false);

  useEffect(() => {
    if (group && !fired.current) {
      fired.current = true;
      confetti({ particleCount: 130, spread: 80, origin: { y: 0.55 } });
      setTimeout(
        () => confetti({ particleCount: 70, spread: 110, origin: { y: 0.35 }, scalar: 0.8 }),
        300
      );
    }
  }, [group]);

  if (!group) return null;
  const product = productById[group.productId];
  if (!product) return null;
  const title = localized(product as unknown as Record<string, unknown>, "title", locale);
  const savings = product.soloPriceKzt - group.currentTierPriceKzt;
  const pct = pctOff(product.soloPriceKzt, group.currentTierPriceKzt);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-[#1DBE6E] to-[#0E7E45] px-6 text-center text-white">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl"
      >
        <Icon name="check" size={46} sw={3} color="#15A05A" />
      </motion.div>

      <h1 className="mt-6 text-[26px] font-extrabold leading-tight">{t("congrats_title")}</h1>
      <p className="mt-1.5 text-[14px] font-medium text-white/85">{t("congrats_sub")}</p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 w-full rounded-3xl bg-white p-5 text-ink shadow-xl"
      >
        <div className="flex items-center gap-3">
          <ProductImage product={product} className="h-12 w-12 shrink-0 rounded-xl" emojiClassName="text-2xl" />
          <p className="min-w-0 flex-1 truncate text-left text-[13.5px] font-bold">{title}</p>
        </div>
        <div className="hr my-4" />
        <div className="flex items-center justify-around">
          <div>
            <p className="t-tiny">{t("price_was")}</p>
            <p className="num mt-0.5 text-[18px] font-bold text-muted line-through">
              {formatKzt(product.soloPriceKzt)}
            </p>
          </div>
          <Icon name="chevron" size={22} sw={2.4} color="#9AA2AD" />
          <div>
            <p className="t-tiny">{t("price_now")}</p>
            <p className="num mt-0.5 text-[24px] font-extrabold text-green-700">
              {formatKzt(group.currentTierPriceKzt)}
            </p>
          </div>
        </div>
        <span className="pill-badge pill-green mx-auto mt-4 h-7 px-3.5 text-[13px]">
          {t("thr_saved")} {formatKzt(savings)} · −{pct}%
        </span>
      </motion.div>

      <div className="mt-7 w-full space-y-2.5">
        <Link
          href={`/checkout?product=${product.id}&group=${group.id}&mode=group`}
          className="btn btn--white text-green-700"
        >
          {t("go_checkout")}
        </Link>
        <Link
          href="/feed"
          className="flex h-10 items-center justify-center text-[14px] font-bold text-white/85"
        >
          {t("to_feed")}
        </Link>
      </div>
    </div>
  );
}
