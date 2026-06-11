"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { securityFor } from "@/lib/engine/identity";
import { config } from "@/lib/config";
import { track } from "@/lib/analytics";

// SIM/eSIM identity architecture — the deck-ready "how the identity layer works"
// screen. Trust flows up: secure element → carrier → Open Gateway → Birge.
export default function IdentityPage() {
  const { t } = useI18n();
  const router = useRouter();
  const security = useBirgeStore((s) => s.security);
  const user = useBirgeStore((s) => s.user);
  const sec = securityFor(user?.phone ?? "", user?.carrierLabel ?? config.CARRIER_LABEL, security);
  const simLabel = sec.simType === "sim" ? t("sim_label") : t("esim_label");

  useEffect(() => {
    track("identity_panel_viewed");
  }, []);

  const layers = [
    { icon: "📱", title: t("identity_layer_device"), text: t("identity_layer_device_d") },
    { icon: "📡", title: t("identity_layer_carrier"), text: t("identity_layer_carrier_d") },
    { icon: "🌐", title: t("identity_layer_gateway"), text: t("identity_layer_gateway_d") },
    { icon: "🛍️", title: t("identity_layer_app"), text: t("identity_layer_app_d") },
  ];

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-5">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm"
          aria-label={t("back")}
        >
          ←
        </button>
        <h1 className="text-lg font-bold">{t("identity_arch_title")}</h1>
        <span className="ml-auto rounded-full bg-accent-light px-2.5 py-1 text-[10px] font-bold text-amber-700">
          {t("identity_real_now")}
        </span>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto no-scrollbar px-5 pb-6">
        <p className="text-sm leading-relaxed text-muted">
          {t("identity_arch_intro")}
        </p>

        {/* trust stack — flows upward from the secure element to the app */}
        <div className="space-y-1.5 pt-1">
          {layers.map((l, i) => (
            <div key={l.title}>
              <div className="card flex gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-xl">
                  {l.icon}
                </span>
                <div>
                  <p className="text-sm font-bold">{l.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{l.text}</p>
                </div>
              </div>
              {i < layers.length - 1 && (
                <div className="py-1 text-center text-base text-primary/50" aria-hidden>
                  ↑
                </div>
              )}
            </div>
          ))}
        </div>

        {/* live identity snapshot */}
        {user && (
          <div className="card space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">{t("security_id_label", { sim: simLabel })}</span>
              <span className="font-mono font-bold">{sec.identityId}</span>
            </div>
            <div className="flex justify-between border-t border-black/5 pt-2 text-success">
              <span>✓ {t("security_device_bound")}</span>
            </div>
            <div className="flex justify-between border-t border-black/5 pt-2 text-success">
              <span>✓ {t("security_sim_swap")}</span>
            </div>
          </div>
        )}

        {/* mock → real swap path (Level-2 vision) */}
        <div className="card border border-dashed border-primary/30 bg-primary-light/40">
          <p className="text-sm font-bold text-primary-dark">{t("identity_arch_swap_title")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{t("identity_arch_swap")}</p>
          <p className="mt-2 inline-block rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white">
            {t("identity_real_l2")}
          </p>
        </div>
      </main>
    </div>
  );
}
