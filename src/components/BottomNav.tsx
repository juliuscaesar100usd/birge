"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export function BottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();

  const tabs = [
    { href: "/feed", icon: "🏠", label: t("nav_home") },
    { href: "/assistant", icon: "✨", label: t("nav_assistant") },
    { href: "/profile", icon: "👤", label: t("nav_profile") },
  ];

  return (
    <nav className="shrink-0 border-t border-black/5 bg-white/95 px-6 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-6 py-1 text-[11px] font-semibold ${
                active ? "text-primary-dark" : "text-muted"
              }`}
            >
              <span className={`text-xl ${active ? "" : "grayscale opacity-60"}`}>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
