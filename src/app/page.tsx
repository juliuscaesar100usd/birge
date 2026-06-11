"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ZigleLogo } from "@/components/ZigleLogo";
import { Icon } from "@/components/Icon";

// S1 — Splash: blue gradient, floating price tags, feature rows (design §9)
export default function SplashPage() {
  const { t } = useI18n();
  const user = useBirgeStore((s) => s.user);

  const features = [
    { icon: "catalog", text: t("feat_agg") },
    { icon: "users", text: t("feat_group") },
    { icon: "sim", text: t("feat_sim") },
  ];

  const tags = [
    { label: "−15%", x: "8%", delay: 0 },
    { label: "−30%", x: "44%", delay: 0.7 },
    { label: "−45%", x: "74%", delay: 1.3 },
  ];

  return (
    <div className="screen-anim flex h-full flex-col overflow-y-auto no-scrollbar bg-gradient-to-b from-[#2E86F5] to-[#0E52C0] text-white">
      <div className="safe-top flex items-center justify-between px-6 pt-[64px]">
        <ZigleLogo size={24} inverse color="#fff" />
        <LanguageToggle dark />
      </div>

      {/* floating price-tag trio */}
      <div className="relative mx-6 mt-5 h-[86px]">
        {tags.map((tag) => (
          <motion.div
            key={tag.label}
            className="num absolute flex h-[58px] w-[68px] flex-col items-center justify-center rounded-2xl bg-white/14 text-[17px] font-extrabold backdrop-blur-sm"
            style={{ left: tag.x, top: tag.delay * 8, boxShadow: "0 10px 26px rgba(0,0,0,.16)" }}
            animate={{ y: [0, -7, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: tag.delay, ease: "easeInOut" }}
          >
            <span className="text-[10px] font-bold text-white/70">{t("group_short")}</span>
            {tag.label}
          </motion.div>
        ))}
      </div>

      <div className="px-6 pt-2">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[30px] font-extrabold leading-[1.1] tracking-[-0.5px]"
        >
          {t("tagline")}
        </motion.h1>
        <p className="mt-2.5 text-[14.5px] font-medium leading-relaxed text-white/80">
          {t("splash_sub")}
        </p>
      </div>

      <div className="mt-6 space-y-2.5 px-6">
        {features.map((f, i) => (
          <motion.div
            key={f.icon}
            className="flex items-center gap-3.5 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.1 }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/16">
              <Icon name={f.icon} size={20} sw={2} color="#fff" />
            </span>
            <p className="text-[13.5px] font-semibold leading-snug text-white/95">{f.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-auto space-y-2.5 px-6 pb-9 pt-6">
        <Link href={user ? "/feed" : "/onboarding/phone"} className="btn btn--white">
          {user ? t("continue") : t("get_started")}
        </Link>
        {!user && (
          <Link
            href="/onboarding/phone"
            className="flex h-11 items-center justify-center text-[14.5px] font-bold text-white/85"
          >
            {t("have_account")}
          </Link>
        )}
      </div>
    </div>
  );
}
