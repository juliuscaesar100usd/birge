"use client";

import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "ru", label: "РУ" },
  { id: "kk", label: "ҚЗ" },
  { id: "en", label: "EN" },
];

export function LanguageToggle({ compact = true }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className={`inline-flex rounded-full bg-black/5 p-0.5 ${compact ? "text-[11px]" : "text-sm"}`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l.id}
          onClick={() => setLocale(l.id)}
          className={`rounded-full px-2.5 py-1 font-bold transition ${
            locale === l.id ? "bg-white text-primary-dark shadow-sm" : "text-muted"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
