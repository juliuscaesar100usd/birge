"use client";

import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const LOCALES: { id: Locale; label: string }[] = [
  { id: "ru", label: "Рус" },
  { id: "kk", label: "Қаз" },
  { id: "en", label: "Eng" },
];

export function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className="inline-flex rounded-full p-0.5"
      style={{ background: dark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.06)" }}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => {
        const on = locale === l.id;
        return (
          <button
            key={l.id}
            onClick={() => setLocale(l.id)}
            className="rounded-full px-2.5 py-1 text-[11px] font-bold transition"
            style={
              on
                ? { background: "#fff", color: "var(--color-blue-700)", boxShadow: "var(--shadow-sm)" }
                : { color: dark ? "rgba(255,255,255,.8)" : "var(--color-muted)" }
            }
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
