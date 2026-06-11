"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { cities } from "@/data/cities";
import type { BudgetBand } from "@/lib/types";
import { Icon } from "@/components/Icon";

// S6 — Budget band cards (radio style) + city chips (design §9)
function BudgetInner() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const isEdit = useSearchParams().get("edit") === "1";
  const user = useBirgeStore((s) => s.user);
  const updatePreferences = useBirgeStore((s) => s.updatePreferences);
  const [band, setBand] = useState<BudgetBand>(user?.budgetBand ?? "mid");
  const [city, setCity] = useState(user?.city ?? "almaty");

  const bands: { id: BudgetBand; icon: string }[] = [
    { id: "low", icon: "tag" },
    { id: "mid", icon: "star" },
    { id: "high", icon: "sparkle" },
  ];

  const submit = () => {
    updatePreferences({ budgetBand: band, city });
    router.push(isEdit ? "/profile" : "/onboarding/taste");
  };

  return (
    <div className="screen-anim flex h-full flex-col overflow-y-auto no-scrollbar px-6">
      <div className="safe-top pt-[62px]">
        <h1 className="t-h1">{t("budget_title")}</h1>
        <p className="t-sub mt-2">{t("budget_sub")}</p>
      </div>

      <div className="mt-5 space-y-2.5">
        {bands.map((b) => {
          const active = band === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setBand(b.id)}
              className="tap flex w-full items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 text-left"
              style={{
                boxShadow: active
                  ? "inset 0 0 0 2px var(--color-blue), var(--shadow-sm)"
                  : "var(--shadow-sm)",
              }}
              aria-pressed={active}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: active ? "var(--color-blue-50)" : "var(--color-line2)",
                  color: active ? "var(--color-blue)" : "var(--color-muted)",
                }}
              >
                <Icon name={b.icon} size={19} sw={2} />
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-bold text-ink">{t(`budget_${b.id}_name`)}</span>
                <span className="t-sub num text-[12.5px]">{t(`budget_${b.id}`)}</span>
              </span>
              <span
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full"
                style={{
                  border: active ? "none" : "2px solid var(--color-line)",
                  background: active ? "var(--color-blue)" : "#fff",
                }}
              >
                {active && <Icon name="check" size={13} sw={3} color="#fff" />}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="t-h2 mt-7">{t("city_title")}</h2>
      <div className="mt-3.5 flex flex-wrap gap-2">
        {cities.map((c) => (
          <button
            key={c.id}
            onClick={() => setCity(c.id)}
            className={`chip ${city === c.id ? "chip--on" : ""}`}
            aria-pressed={city === c.id}
          >
            <Icon name="location" size={14} sw={2.2} />
            {localized(c as unknown as Record<string, unknown>, "name", locale)}
          </button>
        ))}
      </div>

      <div className="mt-auto pb-8 pt-6">
        <button onClick={submit} className="btn btn--blue">
          {t("continue")}
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
