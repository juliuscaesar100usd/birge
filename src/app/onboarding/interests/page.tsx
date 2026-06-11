"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { categories } from "@/data/categories";
import { track } from "@/lib/analytics";

// S5 — Interest selection (FR-2.1: 1–8 categories required)
function InterestsInner() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const isEdit = useSearchParams().get("edit") === "1";
  const user = useBirgeStore((s) => s.user);
  const updatePreferences = useBirgeStore((s) => s.updatePreferences);
  const [selected, setSelected] = useState<string[]>(user?.interests ?? []);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 8 ? [...prev, id] : prev
    );

  const submit = () => {
    if (selected.length === 0) return;
    updatePreferences({ interests: selected });
    track("interests_selected", { interests: selected });
    router.push(isEdit ? "/profile" : "/onboarding/budget");
  };

  return (
    <div className="flex h-full flex-col px-6 pt-10">
      <h1 className="text-2xl font-bold">{t("interests_title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("interests_sub")}</p>

      <div className="mt-7 flex flex-wrap gap-2.5">
        {categories.map((c) => {
          const active = selected.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`chip px-4 py-2.5 text-sm ${active ? "chip-active" : ""}`}
              aria-pressed={active}
            >
              <span>{c.icon}</span>
              {localized(c as unknown as Record<string, unknown>, "name", locale)}
              {active && <span className="font-bold">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pb-8 pt-6">
        <button onClick={submit} disabled={selected.length === 0} className="btn-primary">
          {t("continue")} ({selected.length}) →
        </button>
      </div>
    </div>
  );
}

export default function InterestsPage() {
  return (
    <Suspense>
      <InterestsInner />
    </Suspense>
  );
}
