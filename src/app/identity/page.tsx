"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { securityFor } from "@/lib/engine/identity";
import { config } from "@/lib/config";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/Icon";

// SIM/eSIM identity architecture — the deck-ready "how the identity layer works"
// screen. Trust flows up: secure element → carrier → Open Gateway → Zigle.
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
    { icon: "sim", title: t("identity_layer_device"), text: t("identity_layer_device_d") },
    { icon: "globe", title: t("identity_layer_carrier"), text: t("identity_layer_carrier_d") },
    { icon: "shield", title: t("identity_layer_gateway"), text: t("identity_layer_gateway_d") },
    { icon: "cart", title: t("identity_layer_app"), text: t("identity_layer_app_d") },
  ];

  return (
    <div className="screen-anim flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 px-4 pb-3 pt-[58px]">
        <button
          onClick={() => router.back()}
          className="tap flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label={t("back")}
        >
          <Icon name="back" size={20} sw={2.2} />
        </button>
        <h1 className="t-h3 flex-1">{t("identity_arch_title")}</h1>
        <span className="pill-badge pill-yellow">{t("identity_real_now")}</span>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto no-scrollbar px-4 pb-6">
        <p className="t-sub leading-relaxed">{t("identity_arch_intro")}</p>

        {/* trust stack — flows upward from the secure element to the app */}
        <div className="space-y-1.5 pt-1">
          {layers.map((l, i) => (
            <div key={l.title}>
              <div className="card flex gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue">
                  <Icon name={l.icon} size={21} sw={2} />
                </span>
                <div>
                  <p className="text-[15px] font-bold text-ink">{l.title}</p>
                  <p className="t-sub mt-0.5 text-[13px] leading-relaxed">{l.text}</p>
                </div>
              </div>
              {i < layers.length - 1 && (
                <div className="py-1 text-center text-[15px] text-blue/50" aria-hidden>
                  ↑
                </div>
              )}
            </div>
          ))}
        </div>

        {/* live identity snapshot */}
        {user && (
          <div className="card space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-muted">{t("security_id_label", { sim: simLabel })}</span>
              <span className="num font-mono font-bold">{sec.identityId}</span>
            </div>
            <p className="flex items-center gap-2 border-t border-line pt-2 font-semibold text-green-700">
              <Icon name="check" size={14} sw={3} color="#0E7E45" /> {t("security_device_bound")}
            </p>
            <p className="flex items-center gap-2 border-t border-line pt-2 font-semibold text-green-700">
              <Icon name="check" size={14} sw={3} color="#0E7E45" /> {t("security_sim_swap")}
            </p>
          </div>
        )}

        {/* mock → real swap path */}
        <div className="card bg-blue-50">
          <p className="text-[14.5px] font-extrabold text-blue">{t("identity_arch_swap_title")}</p>
          <p className="t-sub mt-1 text-[12.5px] leading-relaxed">{t("identity_arch_swap")}</p>
          <span className="pill-badge pill-blue mt-2 bg-blue text-white">{t("identity_real_l2")}</span>
        </div>
      </main>
    </div>
  );
}
