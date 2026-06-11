"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { categories } from "@/data/categories";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/Icon";

// S5 — Interests: 2-col category tile grid, multi-select 1–8 (design §9)
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
    <div className="screen-anim flex h-full flex-col px-6">
      <div className="safe-top pt-[62px]">
        <h1 className="t-h1">{t("interests_title")}</h1>
        <p className="t-sub mt-2">{t("interests_sub")}</p>
      </div>

      <div className="mt-5 grid flex-1 grid-cols-2 content-start gap-2.5 overflow-y-auto no-scrollbar pb-3">
        {categories.map((c) => {
          const active = selected.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className="tap relative flex flex-col items-start gap-2.5 rounded-2xl p-3.5 text-left"
              style={{
                background: active ? "var(--color-blue)" : "#fff",
                boxShadow: active ? "0 8px 20px rgba(22,104,227,.28)" : "var(--shadow-sm)",
              }}
              aria-pressed={active}
            >
              {active && (
                <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
                  <Icon name="check" size={12} sw={3} color="#fff" />
                </span>
              )}
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: active ? "rgba(255,255,255,.18)" : c.tint, color: active ? "#fff" : c.ink }}
              >
                <Icon name={c.iconName} size={20} sw={2} />
              </span>
              <span
                className="text-[13.5px] font-bold leading-tight"
                style={{ color: active ? "#fff" : "var(--color-ink)" }}
              >
                {localized(c as unknown as Record<string, unknown>, "name", locale)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pb-8 pt-3">
        <p className="t-tiny mb-2 text-center">{t("selected_n", { n: selected.length })}</p>
        <button onClick={submit} disabled={selected.length === 0} className="btn btn--blue">
          {t("continue")}
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
