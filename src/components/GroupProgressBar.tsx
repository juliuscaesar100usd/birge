"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function GroupProgressBar({
  count,
  min,
  variant = "coral",
  showLabel = true,
}: {
  count: number;
  min: number;
  variant?: "coral" | "green" | "white";
  showLabel?: boolean;
}) {
  const { t } = useI18n();
  const pct = Math.min(100, Math.round((count / min) * 100));
  const fillClass =
    variant === "coral" ? "pbar--fill-coral" : variant === "green" ? "pbar--fill-green" : "";
  return (
    <div>
      {showLabel && (
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className={`num text-sm font-extrabold ${variant === "white" ? "text-white" : "text-ink"}`}>
            {t("joined_of", { x: count, n: min })}
          </span>
          <span className={`num text-xs font-bold ${variant === "white" ? "text-white/80" : "text-muted"}`}>
            {pct}%
          </span>
        </div>
      )}
      <div className={`pbar ${variant !== "white" ? "pbar--track-light" : ""}`}>
        <motion.div
          className={`pbar__fill ${fillClass}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
