"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/Icon";

// "+7 (701) 123-45-67" formatting for the blue number card
function formatPretty(digits: string): string {
  const d = digits.padEnd(0, "");
  let out = "+7";
  if (d.length > 0) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ")";
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

// S2 — Phone entry with custom keypad (design §9; Spec §2.1: ^\+7\d{10}$)
export default function PhonePage() {
  const { t } = useI18n();
  const router = useRouter();
  const setPendingPhone = useBirgeStore((s) => s.setPendingPhone);
  const [digits, setDigits] = useState("7011234567"); // prefilled for the demo

  const valid = /^\d{10}$/.test(digits);

  const press = (key: string) => {
    if (key === "⌫") setDigits((d) => d.slice(0, -1));
    else if (key && digits.length < 10) setDigits((d) => d + key);
  };

  const submit = () => {
    if (!valid) return;
    setPendingPhone(`+7${digits}`);
    track("register_started", {});
    router.push("/onboarding/verify");
  };

  return (
    <div className="screen-anim flex h-full flex-col px-6">
      <div className="safe-top flex items-center pt-[62px]">
        <button
          onClick={() => router.back()}
          className="tap flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label={t("back")}
        >
          <Icon name="back" size={20} sw={2.2} />
        </button>
      </div>

      <h1 className="t-h1 mt-5">{t("phone_title")}</h1>
      <p className="t-sub mt-2">{t("phone_sub")}</p>

      {/* number card */}
      <div className="mt-6 rounded-2xl bg-blue px-5 py-5 shadow-lg shadow-blue/25">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-white/60">
          {t("phone_title")}
        </p>
        <p className="num mt-1 flex items-center text-[24px] font-extrabold text-white">
          {formatPretty(digits)}
          <span className="ml-0.5 inline-block h-7 w-0.5 animate-pulse rounded bg-white/80" />
        </p>
      </div>

      <p className="mt-3 flex items-center gap-2 text-[12.5px] font-bold text-green-700">
        <Icon name="checkCircle" size={15} sw={2.4} /> {t("phone_nopass")}
      </p>

      {/* keypad */}
      <div className="mt-auto grid grid-cols-3 gap-2 pb-2">
        {KEYS.map((key, i) => (
          <button
            key={i}
            onClick={() => press(key)}
            disabled={!key}
            className="tap num flex h-[54px] items-center justify-center rounded-2xl bg-white text-[22px] font-bold text-ink shadow-sm disabled:opacity-0"
          >
            {key}
          </button>
        ))}
      </div>

      <div className="pb-4 pt-3">
        <button onClick={submit} disabled={!valid} className="btn btn--blue">
          {t("continue")}
        </button>
        <p className="t-tiny mt-2.5 px-4 text-center">{t("phone_legal")}</p>
      </div>
    </div>
  );
}
