"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "@/components/Icon";

// S4 — "Zigle ID" identity explainer (FR-1.4), skippable
export default function ExplainerPage() {
  const { t } = useI18n();

  const points = [
    { icon: "lock", title: t("explainer_1_title"), text: t("explainer_1") },
    { icon: "shield", title: t("explainer_2_title"), text: t("explainer_2") },
    { icon: "sim", title: t("explainer_3_title"), text: t("explainer_3") },
  ];

  return (
    <div className="screen-anim flex h-full flex-col px-6">
      <div className="safe-top flex items-center justify-between pt-[62px]">
        <span className="pill-badge pill-blue h-7 px-3 text-[12px]">{t("zigle_id")}</span>
        <Link href="/onboarding/interests" className="text-sm font-bold text-muted">
          {t("skip")}
        </Link>
      </div>

      <h1 className="t-h1 mt-5">{t("explainer_title")}</h1>
      <p className="t-sub mt-2">{t("explainer_sub")}</p>

      <div className="mt-6 space-y-3">
        {points.map((p) => (
          <div key={p.title} className="card flex gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue">
              <Icon name={p.icon} size={21} sw={2} />
            </span>
            <div>
              <p className="text-[15px] font-bold text-ink">{p.title}</p>
              <p className="t-sub mt-0.5 text-[13px] leading-relaxed">{p.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Link href="/identity" className="mt-4 block text-center text-[12.5px] font-bold text-blue">
        GSMA Open Gateway · Number Verification · SNA →
      </Link>

      <div className="mt-auto pb-8 pt-5">
        <Link href="/onboarding/interests" className="btn btn--blue">
          {t("explainer_cta")}
        </Link>
      </div>
    </div>
  );
}
