"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { onToast, type Toast } from "@/lib/events";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n/dictionaries";

// Design §2: dark pill toast, bottom-center (above the bottom nav)
export function ToastHost() {
  const { t } = useI18n();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return onToast((toast) => {
      setToasts((prev) => [...prev.slice(-1), toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== toast.id));
      }, 3200);
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[96px] z-[120] flex flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            className="max-w-[88%] truncate rounded-full bg-ink px-[18px] py-[11px] text-[13.5px] font-semibold text-white shadow-lg"
          >
            {toast.kind === "gold" ? "🎉 " : toast.kind === "success" ? "✓ " : ""}
            {t(toast.msgKey as DictKey, toast.params)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
