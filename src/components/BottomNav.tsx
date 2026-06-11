"use client";

import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { Icon } from "@/components/Icon";

export function BottomNav() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const user = useBirgeStore((s) => s.user);
  const groups = useBirgeStore((s) => s.groups);

  const activeGroups = Object.values(groups).filter(
    (g) =>
      (g.status === "open" || g.status === "locked") &&
      (g.id.startsWith("grp_seed") || (user && g.members.some((m) => m.id === user.id)))
  ).length;

  const tabs = [
    { href: "/feed", icon: "home", label: t("nav_home") },
    { href: "/catalog", icon: "catalog", label: t("nav_catalog") },
    { href: "/groups", icon: "groups", label: t("nav_groups"), badge: activeGroups },
    { href: "/assistant", icon: "sparkle", label: t("nav_assistant") },
    { href: "/profile", icon: "profile", label: t("nav_profile") },
  ];

  return (
    <div className="bnav-wrap shrink-0">
      <nav className="bnav">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`bnav__item ${active ? "bnav__item--on" : ""}`}
            >
              {tab.badge ? <span className="bnav__badge">{tab.badge}</span> : null}
              <Icon name={tab.icon} size={23} sw={active ? 2.2 : 1.9} />
              <span className="bnav__lbl">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
