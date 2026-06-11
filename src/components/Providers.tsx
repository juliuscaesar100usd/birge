"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { I18nProvider } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { listenSync } from "@/lib/sync";
import { emitToast, type ToastKind } from "@/lib/events";
import type { DictKey } from "@/lib/i18n/dictionaries";
import { ToastHost } from "@/components/ToastHost";
import { ZigleLogo } from "@/components/ZigleLogo";

// Per-route status bar theme (design prompt §3)
function statusThemeFor(pathname: string): "light" | "dark" {
  if (
    pathname === "/" ||
    pathname === "/onboarding/verify" ||
    pathname === "/feed" ||
    pathname === "/profile" ||
    pathname.startsWith("/group/") ||
    pathname.startsWith("/threshold/")
  ) {
    return "light";
  }
  return "dark";
}

function homeColorFor(pathname: string): string {
  if (pathname === "/" || pathname === "/onboarding/verify" || pathname.startsWith("/threshold/")) {
    return "rgba(255,255,255,.85)";
  }
  return "rgba(0,0,0,.28)";
}

function StatusBar({ theme }: { theme: "light" | "dark" }) {
  return (
    <div className={`statusbar ${theme}`}>
      <span className="sb-time">9:41</span>
      <span className="sb-right">
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
          <rect x="0" y="7" width="3" height="5" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden>
          <path d="M8.5 12a1.7 1.7 0 110-3.4 1.7 1.7 0 010 3.4zM3.6 7.4a7 7 0 019.8 0l-1.6 1.7a4.7 4.7 0 00-6.6 0zM.5 4.3a11.4 11.4 0 0116 0l-1.6 1.6a9.1 9.1 0 00-12.8 0z" />
        </svg>
        {/* battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="18" height="8" rx="2.2" fill="currentColor" />
          <path d="M23.5 4v4a2.2 2.2 0 000-4z" fill="currentColor" opacity=".4" />
        </svg>
      </span>
    </div>
  );
}

function useStageScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const compute = () =>
      setScale(Math.min((window.innerWidth - 24) / 402, (window.innerHeight - 24) / 872, 1.18));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return scale;
}

function SplashShimmer() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#2E86F5] to-[#1668E3]">
      <ZigleLogo size={30} inverse color="#fff" />
      <div className="h-1.5 w-24 animate-pulse rounded-full bg-white/40" />
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrated = useBirgeStore((s) => s._hasHydrated);
  const ensureSeeds = useBirgeStore((s) => s.ensureSeeds);
  const tickDeadlines = useBirgeStore((s) => s.tickDeadlines);
  const pathname = usePathname();
  const scale = useStageScale();

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
      msg.toasts?.forEach((t) => emitToast(t.kind as ToastKind, t.msgKey as DictKey, t.params));
    });
  }, []);

  return (
    <I18nProvider>
      <div className="stage">
        <div className="phone" style={{ transform: `scale(${scale})` }}>
          <div className="phone__screen">
            <div className="island" />
            <StatusBar theme={statusThemeFor(pathname)} />
            {hydrated ? children : <SplashShimmer />}
            <ToastHost />
            <div className="home-ind" style={{ background: homeColorFor(pathname) }} />
          </div>
        </div>
      </div>
    </I18nProvider>
  );
}
