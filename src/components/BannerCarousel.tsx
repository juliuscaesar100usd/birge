"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/Icon";

// S8 — auto-rotating promo banner (design §9): group −45% / Zigle ID / referral
export function BannerCarousel() {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);

  const slides = [
    { icon: "users", title: t("ban1_t"), text: t("ban1_d"), bg: "linear-gradient(110deg,#FF5A2C,#FF8A3C)" },
    { icon: "sim", title: t("ban2_t"), text: t("ban2_d"), bg: "linear-gradient(110deg,#2E86F5,#0E52C0)" },
    { icon: "gift", title: t("ban3_t"), text: t("ban3_d"), bg: "linear-gradient(110deg,#15A05A,#34C77B)" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % 3), 3500);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[idx];

  return (
    <div className="px-4">
      <div className="relative h-[92px] overflow-hidden rounded-2xl shadow-md">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 flex items-center gap-3.5 px-4 text-white"
            style={{ background: slide.bg }}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/18">
              <Icon name={slide.icon} size={24} sw={2} color="#fff" />
            </span>
            <span>
              <span className="block text-[16.5px] font-extrabold leading-tight">{slide.title}</span>
              <span className="mt-0.5 block text-[12.5px] font-medium text-white/85">{slide.text}</span>
            </span>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-2 right-3 flex gap-1">
          {slides.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full bg-white transition-all"
              style={{ width: i === idx ? 14 : 6, opacity: i === idx ? 1 : 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
