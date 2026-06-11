"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { track } from "@/lib/analytics";

// Formats 10 national digits as "707 123 45 67"
function formatNational(digits: string): string {
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)];
  return parts.filter(Boolean).join(" ");
}

// S2 — Phone entry (Spec §2.1: ^\+7\d{10}$)
export default function PhonePage() {
  const { t } = useI18n();
  const router = useRouter();
  const setPendingPhone = useBirgeStore((s) => s.setPendingPhone);
  const [digits, setDigits] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = /^\d{10}$/.test(digits);

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    setPendingPhone(`+7${digits}`);
    track("register_started", {});
    router.push("/onboarding/verify");
  };

  return (
    <div className="flex h-full flex-col px-6 pt-10">
      <div className="text-3xl">📲</div>
      <h1 className="mt-4 text-2xl font-bold">{t("phone_title")}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t("phone_sub")}</p>

      <div
        className={`mt-8 flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-4 text-lg font-semibold ${
          touched && !valid ? "border-danger" : "border-primary/30 focus-within:border-primary"
        }`}
      >
        <span className="flex items-center gap-1.5 text-ink">
          <span className="text-base">🇰🇿</span> +7
        </span>
        <input
          inputMode="numeric"
          autoFocus
          placeholder="707 123 45 67"
          className="w-full bg-transparent tabular-nums outline-none placeholder:text-black/25"
          value={formatNational(digits)}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(0, 10);
            setDigits(d);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          aria-label={t("phone_title")}
        />
      </div>
      {touched && !valid && <p className="mt-2 text-xs font-medium text-danger">{t("phone_invalid")}</p>}

      <div className="mt-auto pb-8 pt-6">
        <button onClick={submit} disabled={touched && !valid} className="btn-primary">
          {t("continue")} →
        </button>
      </div>
    </div>
  );
}
