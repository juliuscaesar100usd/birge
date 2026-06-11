"use client";

import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/Icon";

// FR-1.3: persistent "Verified · <carrier>" badge
export function VerifiedBadge({
  carrier,
  className = "",
  variant = "green",
}: {
  carrier: string;
  className?: string;
  variant?: "green" | "white";
}) {
  const { t } = useI18n();
  const styles =
    variant === "white"
      ? { background: "rgba(255,255,255,.18)", color: "#fff" }
      : { background: "var(--color-green-50)", color: "var(--color-green-700)" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${className}`}
      style={styles}
    >
      <Icon name="shield" size={13} sw={2.4} />
      {t("verified_by", { carrier })}
    </span>
  );
}
