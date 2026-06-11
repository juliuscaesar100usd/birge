"use client";

import { useEffect } from "react";
import { I18nProvider } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { listenSync } from "@/lib/sync";
import { emitToast, type ToastKind } from "@/lib/events";
import type { DictKey } from "@/lib/i18n/dictionaries";
import { ToastHost } from "@/components/ToastHost";

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh sm:flex sm:items-center sm:justify-center sm:py-6">
      <div className="relative mx-auto flex h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-bg sm:h-[850px] sm:max-h-[94dvh] sm:rounded-[2.6rem] sm:border-[10px] sm:border-slate-900 sm:shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function SplashShimmer() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="text-4xl font-extrabold tracking-tight text-primary">Birge</div>
      <div className="h-1.5 w-24 animate-pulse rounded-full bg-primary/30" />
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrated = useBirgeStore((s) => s._hasHydrated);
  const ensureSeeds = useBirgeStore((s) => s.ensureSeeds);
  const tickDeadlines = useBirgeStore((s) => s.tickDeadlines);

  // Seed demo groups + run the deadline state machine (Spec §4)
  useEffect(() => {
    if (!hydrated) return;
    ensureSeeds();
    tickDeadlines();
    const id = setInterval(tickDeadlines, 5000);
    return () => clearInterval(id);
  }, [hydrated, ensureSeeds, tickDeadlines]);

  // Cross-tab "realtime": rehydrate from localStorage + replay toasts
  useEffect(() => {
    return listenSync((msg) => {
      void useBirgeStore.persist.rehydrate();
      msg.toasts?.forEach((t) =>
        emitToast(t.kind as ToastKind, t.msgKey as DictKey, t.params)
      );
    });
  }, []);

  return (
    <I18nProvider>
      <PhoneFrame>
        {hydrated ? children : <SplashShimmer />}
        <ToastHost />
      </PhoneFrame>
    </I18nProvider>
  );
}
