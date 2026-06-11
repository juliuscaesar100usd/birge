"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { cities } from "@/data/cities";
import type { BudgetBand } from "@/lib/types";

// S6 — Budget band + city (FR-2.2, FR-2.3)
function BudgetInner() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const isEdit = useSearchParams().get("edit") === "1";
  const user = useBirgeStore((s) => s.user);
  const updatePreferences = useBirgeStore((s) => s.updatePreferences);
  const [band, setBand] = useState<BudgetBand>(user?.budgetBand ?? "mid");
  const [city, setCity] = useState(user?.city ?? "almaty");

  const bands: { id: BudgetBand; icon: string }[] = [
    { id: "low", icon: "🪙" },
    { id: "mid", icon: "💸" },
    { id: "high", icon: "💎" },
  ];

  const submit = () => {
    updatePreferences({ budgetBand: band, city });
    router.push(isEdit ? "/profile" : "/onboarding/taste");
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto no-scrollbar px-6 pt-10">
      <h1 className="text-2xl font-bold">{t("budget_title")}</h1>
      <div className="mt-5 space-y-2.5">
        {bands.map((b) => (
          <button
            key={b.id}
            onClick={() => setBand(b.id)}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left text-sm font-semibold transition active:scale-[0.99] ${
              band === b.id ? "border-primary bg-primary-light" : "border-transparent"
            }`}
            aria-pressed={band === b.id}
          >
            <span className="text-xl">{b.icon}</span>
            {t(`budget_${b.id}`)}
            {band === b.id && <span className="ml-auto font-bold text-primary-dark">✓</span>}
          </button>
        ))}
      </div>

      <h2 className="mt-8 text-xl font-bold">{t("city_title")}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {cities.map((c) => (
          <button
            key={c.id}
            onClick={() => setCity(c.id)}
            className={`chip ${city === c.id ? "chip-active" : ""}`}
            aria-pressed={city === c.id}
          >
            📍 {localized(c as unknown as Record<string, unknown>, "name", locale)}
          </button>
        ))}
      </div>

      <div className="mt-auto pb-8 pt-6">
        <button onClick={submit} className="btn-primary">
          {t("continue")} →
        </button>
      </div>
    </div>
  );
}

export default function BudgetPage() {
  return (
    <Suspense>
      <BudgetInner />
    </Suspense>
  );
}
