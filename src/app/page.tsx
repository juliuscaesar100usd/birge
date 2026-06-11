"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { LanguageToggle } from "@/components/LanguageToggle";

// S1 — Splash / Welcome
export default function SplashPage() {
  const { t } = useI18n();
  const user = useBirgeStore((s) => s.user);

  const features = [
    { icon: "🛍️", title: t("feat_agg_title"), text: t("feat_agg") },
    { icon: "👥", title: t("feat_group_title"), text: t("feat_group") },
    { icon: "🪪", title: t("feat_sim_title"), text: t("feat_sim") },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto no-scrollbar">
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>
      <div className="flex flex-1 flex-col justify-center px-7 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-2 text-5xl font-extrabold tracking-tight text-primary">
            Birge<span className="text-accent">.</span>
          </div>
          <h1 className="text-2xl font-bold leading-snug">{t("tagline")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("splash_sub")}</p>
        </motion.div>

        <div className="mt-8 space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="card flex items-center gap-3.5 py-3.5"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12 }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-xl">
                {f.icon}
              </span>
              <div>
                <p className="text-sm font-bold">{f.title}</p>
                <p className="text-xs leading-snug text-muted">{f.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8">
        <Link href={user ? "/feed" : "/onboarding/phone"} className="btn-primary">
          {user ? t("continue") : t("get_started")} →
        </Link>
      </div>
    </div>
  );
}
