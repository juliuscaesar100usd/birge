"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { identityProvider } from "@/lib/engine/identity";
import { config } from "@/lib/config";
import { Icon } from "@/components/Icon";

// S3 — SIM verification on a blue gradient: pulsing rings, three checks,
// success pop + carrier badge, auto-advance (design §9, FR-1.2/1.3)
export default function VerifyPage() {
  const { t } = useI18n();
  const router = useRouter();
  const pendingPhone = useBirgeStore((s) => s.pendingPhone);
  const completeVerification = useBirgeStore((s) => s.completeVerification);
  const [step, setStep] = useState(0); // 1..3 progress, 4 = success

  // each effect run owns its verification; the stale run is cancelled on cleanup
  useEffect(() => {
    let cancelled = false;
    let redirect: ReturnType<typeof setTimeout> | undefined;
    identityProvider
      .verify(pendingPhone ?? "+77011234567", (s) => !cancelled && setStep(s))
      .then((result) => {
        if (cancelled || !result.verified) return;
        completeVerification(result);
        setStep(4);
        redirect = setTimeout(() => router.push("/onboarding/explainer"), 1500);
      });
    return () => {
      cancelled = true;
      if (redirect) clearTimeout(redirect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [t("verify_step_1"), t("verify_step_2"), t("verify_step_3")];
  const success = step >= 4;

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-[#2E86F5] to-[#0E52C0] px-8 text-center text-white">
      <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
        {!success && (
          <>
            <span
              className="absolute inset-0 rounded-full border-4 border-white/30"
              style={{ animation: "pulseRing 1.7s ease-out infinite" }}
            />
            <span
              className="absolute inset-2 rounded-full border-4 border-white/40"
              style={{ animation: "pulseRing 1.7s ease-out infinite .4s" }}
            />
          </>
        )}
        <motion.div
          className="flex h-24 w-24 items-center justify-center rounded-full shadow-xl"
          style={{ background: success ? "#15A05A" : "rgba(255,255,255,.16)", backdropFilter: "blur(6px)" }}
          animate={success ? { scale: [0.6, 1.15, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Icon name={success ? "check" : "sim"} size={42} sw={2.4} color="#fff" />
        </motion.div>
      </div>

      <h1 className="text-[22px] font-extrabold">
        {success ? t("verify_success") : t("verify_title")}
      </h1>
      <p className="mt-1.5 text-sm font-medium text-white/75">
        {success ? pendingPhone : t("verify_sub")}
      </p>

      {!success && (
        <div className="mt-8 w-full max-w-xs space-y-2.5 text-left">
          {steps.map((label, i) => {
            const stepNo = i + 1;
            const isDone = step > stepNo || (step === 3 && stepNo === 3);
            const active = step === stepNo && !isDone;
            return (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
                style={{
                  background: isDone ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.1)",
                  color: isDone || active ? "#fff" : "rgba(255,255,255,.55)",
                }}
              >
                {isDone ? (
                  <Icon name="check" size={16} sw={3} color="#7CF2B6" />
                ) : active ? (
                  <span
                    className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                    style={{ animation: "spinrev .8s linear infinite" }}
                  />
                ) : (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30" />
                )}
                {label}
              </div>
            );
          })}
        </div>
      )}

      {success && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-2 text-sm font-bold"
        >
          <Icon name="shield" size={15} sw={2.4} /> {t("verified_by", { carrier: config.CARRIER_LABEL })}
        </motion.span>
      )}
    </div>
  );
}
