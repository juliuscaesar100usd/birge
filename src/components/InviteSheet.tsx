"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { emitToast } from "@/lib/events";
import { Icon } from "@/components/Icon";

// S11 — Invite sheet (FR-6.5 / design §9): Telegram & WhatsApp open a real share
// AND schedule a simulated friend join shortly after — the demo always pays off.
export function InviteSheet({
  groupId,
  shareText,
  open,
  onClose,
}: {
  groupId: string;
  shareText: string;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const markInviteShared = useBirgeStore((s) => s.markInviteShared);
  const simulateJoin = useBirgeStore((s) => s.simulateJoin);
  const [showQr, setShowQr] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/group/${groupId}` : "";
  const fullText = `${shareText}\n${url}`;

  const shareVia = (channel: "telegram" | "whatsapp", href: string) => {
    markInviteShared(groupId, channel);
    window.open(href, "_blank", "noopener");
    setTimeout(() => simulateJoin(groupId), 1200);
    onClose();
  };

  const copy = async () => {
    markInviteShared(groupId, "copy_link");
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      // clipboard can be unavailable in insecure contexts — the toast still demos the flow
    }
    emitToast("success", "copied");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            className="absolute inset-0 z-[100] bg-[rgba(15,18,24,.42)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label={t("cancel")}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-[110] rounded-t-[26px] bg-white px-[18px] pb-6 pt-2"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="sheet__grip" />
            <h2 className="t-h2">{t("invite_title")}</h2>
            <p className="t-sub mt-1">{t("invite_sub")}</p>
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-[12.5px] font-bold text-green-700">
              <Icon name="gift" size={16} sw={2} /> {t("invite_reward")}
            </p>

            {showQr ? (
              <div className="mt-5 flex flex-col items-center gap-3 pb-2">
                <div className="rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
                  <QRCodeSVG value={url || `zigle://group/${groupId}`} size={168} />
                </div>
                <button
                  onClick={() => setShowQr(false)}
                  className="text-sm font-bold text-blue"
                >
                  {t("back")}
                </button>
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() =>
                      shareVia(
                        "telegram",
                        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
                      )
                    }
                    className="tap flex items-center gap-3 rounded-2xl bg-[#EAF6FE] px-4 py-3.5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#29A9EB] text-lg text-white">
                      ✈️
                    </span>
                    <span className="text-[14.5px] font-bold text-ink">Telegram</span>
                  </button>
                  <button
                    onClick={() =>
                      shareVia("whatsapp", `https://wa.me/?text=${encodeURIComponent(fullText)}`)
                    }
                    className="tap flex items-center gap-3 rounded-2xl bg-[#E9F9EF] px-4 py-3.5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-lg text-white">
                      💬
                    </span>
                    <span className="text-[14.5px] font-bold text-ink">WhatsApp</span>
                  </button>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                  <button onClick={copy} className="btn btn--outline btn--sm">
                    <Icon name="copy" size={16} sw={2} /> {t("copy_link")}
                  </button>
                  <button
                    onClick={() => {
                      setShowQr(true);
                      markInviteShared(groupId, "qr");
                    }}
                    className="btn btn--ghost btn--sm"
                  >
                    <Icon name="qr" size={16} sw={2} /> {t("show_qr")}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
