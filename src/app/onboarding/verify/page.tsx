"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { identityProvider } from "@/lib/engine/identity";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { config } from "@/lib/config";

// S3 — SIM/eSIM verification (FR-1.2, FR-1.3): simulated Silent Network Authentication
export default function VerifyPage() {
  const { t } = useI18n();
  const router = useRouter();
  const pendingPhone = useBirgeStore((s) => s.pendingPhone);
  const completeVerification = useBirgeStore((s) => s.completeVerification);
  const [step, setStep] = useState(0); // 0..3 progress, 4 = success shown

  // each effect run owns its verification; the stale run is cancelled on cleanup
  // (StrictMode-safe: the second run completes the flow)
  useEffect(() => {
    let cancelled = false;
    let redirect: ReturnType<typeof setTimeout> | undefined;
    identityProvider
      .verify(pendingPhone ?? "+77010000000", (s) => !cancelled && setStep(s))
      .then((result) => {
        if (cancelled || !result.verified) return;
        completeVerification();
        setStep(4);
        redirect = setTimeout(() => router.push("/onboarding/explainer"), 1600);
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
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      {/* Carrier shield animation */}
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
        <AnimatePresence>
          {!success && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary/20"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              />
              <motion.div
                className="absolute inset-3 rounded-full border-4 border-primary/30"
                animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.3, 0.7] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: 0.25 }}
              />
            </>
          )}
        </AnimatePresence>
        <motion.div
          className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-lg ${
            success ? "bg-success text-white" : "bg-primary text-white"
          }`}
          animate={success ? { scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {success ? "✓" : "🛡️"}
        </motion.div>
      </div>

      <h1 className="text-xl font-bold">{success ? t("verify_success") : t("verify_title")}</h1>
      <p className="mt-1.5 text-sm text-muted">
        {success ? pendingPhone : t("verify_sub")}
      </p>

      {!success && (
        <div className="mt-8 w-full max-w-xs space-y-2.5 text-left">
          {steps.map((label, i) => {
            const stepNo = i + 1;
            const done = step > stepNo || step === 3 && stepNo === 3;
            const active = step === stepNo;
            return (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  done
                    ? "bg-success-light text-success"
                    : active
                      ? "bg-white shadow-sm"
                      : "bg-black/4 text-muted/60"
                }`}
              >
                {done ? (
                  <span>✓</span>
                ) : active ? (
                  <motion.span
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  />
                ) : (
                  <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-black/15" />
                )}
                {label}
              </div>
            );
          })}
        </div>
      )}

      {success && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <VerifiedBadge carrier={config.CARRIER_LABEL} />
        </motion.div>
      )}
    </div>
  );
}
