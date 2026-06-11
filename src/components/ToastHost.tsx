"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { onToast, type Toast } from "@/lib/events";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n/dictionaries";

const KIND_STYLES: Record<Toast["kind"], string> = {
  info: "bg-ink/90 text-white",
  success: "bg-success text-white",
  gold: "bg-accent text-ink",
};

export function ToastHost() {
  const { t } = useI18n();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return onToast((toast) => {
      setToasts((prev) => [...prev.slice(-2), toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== toast.id));
      }, 3500);
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`w-full max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${KIND_STYLES[toast.kind]}`}
          >
            {t(toast.msgKey as DictKey, toast.params)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
