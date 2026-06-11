"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

// S4 — eSIM identity explainer (FR-1.4), skippable
export default function ExplainerPage() {
  const { t } = useI18n();

  const points = [
    { icon: "📡", title: t("explainer_1_title"), text: t("explainer_1") },
    { icon: "🔐", title: t("explainer_2_title"), text: t("explainer_2") },
    { icon: "🌐", title: t("explainer_3_title"), text: t("explainer_3") },
  ];

  return (
    <div className="flex h-full flex-col px-6 pt-10">
      <div className="flex items-center justify-between">
        <div className="text-3xl">🪪</div>
        <Link href="/onboarding/interests" className="text-sm font-semibold text-muted">
          {t("skip")}
        </Link>
      </div>
      <h1 className="mt-4 text-2xl font-bold leading-snug">{t("explainer_title")}</h1>

      <div className="mt-7 space-y-3.5">
        {points.map((p) => (
          <div key={p.title} className="card flex gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-xl">
              {p.icon}
            </span>
            <div>
              <p className="text-sm font-bold">{p.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{p.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-3 pb-8 pt-6">
        <Link href="/identity" className="block text-center text-xs font-semibold text-primary-dark">
          {t("security_more")} →
        </Link>
        <Link href="/onboarding/interests" className="btn-primary">
          {t("continue")} →
        </Link>
      </div>
    </div>
  );
}
