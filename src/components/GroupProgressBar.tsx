"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function GroupProgressBar({ count, min }: { count: number; min: number }) {
  const { t } = useI18n();
  const pct = Math.min(100, Math.round((count / min) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-bold">{t("joined_of", { x: count, n: min })}</span>
        <span className="text-xs font-semibold text-muted">{pct}%</span>
      </div>
      <div className="h-3.5 overflow-hidden rounded-full bg-black/8">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-success"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
