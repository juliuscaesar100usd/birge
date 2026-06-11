"use client";

import { useI18n } from "@/lib/i18n";

// FR-1.3: persistent "Verified by [carrier]" badge
export function VerifiedBadge({ carrier, className = "" }: { carrier: string; className?: string }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs font-bold text-success ${className}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 1.5 3.5 4.2v4.6c0 4.3 2.8 8.3 6.5 9.7 3.7-1.4 6.5-5.4 6.5-9.7V4.2L10 1.5Zm3.1 6.9-3.7 3.7a.75.75 0 0 1-1.06 0L6.9 10.66a.75.75 0 1 1 1.06-1.06l.91.9 3.17-3.16a.75.75 0 0 1 1.06 1.06Z"
          clipRule="evenodd"
        />
      </svg>
      {t("verified_by", { carrier })}
    </span>
  );
}
