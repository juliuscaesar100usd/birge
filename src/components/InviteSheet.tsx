"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { emitToast } from "@/lib/events";

// S11 — Invite sheet (FR-6.5): Telegram / WhatsApp / copy link / QR
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
  const [showQr, setShowQr] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/group/${groupId}` : "";
  const fullText = `${shareText}\n${url}`;

  const share = (channel: string, href?: string) => {
    markInviteShared(groupId, channel);
    if (href) window.open(href, "_blank", "noopener");
  };

  const copy = async () => {
    share("copy_link");
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
            className="absolute inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label={t("cancel")}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/15" />
            <h2 className="text-lg font-bold">{t("invite_title")}</h2>
            <p className="mt-1 text-sm text-muted">{t("invite_sub")}</p>
            <p className="mt-2 rounded-xl bg-accent-light px-3 py-2 text-xs font-semibold text-ink">
              🎁 {t("invite_reward")}
            </p>

            {showQr ? (
              <div className="mt-5 flex flex-col items-center gap-3">
                <div className="rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
                  <QRCodeSVG value={url || `birge://group/${groupId}`} size={168} />
                </div>
                <button onClick={() => setShowQr(false)} className="text-sm font-semibold text-primary-dark">
                  {t("back")}
                </button>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-4 gap-3 text-center text-[11px] font-semibold">
                <button
                  onClick={() =>
                    share(
                      "telegram",
                      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
                    )
                  }
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#29A9EB] text-2xl text-white shadow">
                    ✈️
                  </span>
                  Telegram
                </button>
                <button
                  onClick={() =>
                    share("whatsapp", `https://wa.me/?text=${encodeURIComponent(fullText)}`)
                  }
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-2xl text-white shadow">
                    💬
                  </span>
                  WhatsApp
                </button>
                <button onClick={copy} className="flex flex-col items-center gap-1.5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-2xl text-white shadow">
                    🔗
                  </span>
                  {t("copy_link")}
                </button>
                <button
                  onClick={() => {
                    setShowQr(true);
                    markInviteShared(groupId, "qr");
                  }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl text-white shadow">
                    ▦
                  </span>
                  QR
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
