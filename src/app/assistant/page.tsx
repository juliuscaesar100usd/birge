"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { motion } from "framer-motion";
import { useI18n, localized } from "@/lib/i18n";
import { useBirgeStore } from "@/lib/store";
import { productById } from "@/data/products";
import { cityById } from "@/data/cities";
import { formatKzt, pctOff } from "@/lib/currency";
import { mockAssistantReply } from "@/lib/assistant/mock";
import type { AssistantContext } from "@/lib/assistant/context";
import { ProductImage } from "@/components/ProductImage";
import { BottomNav } from "@/components/BottomNav";
import { track } from "@/lib/analytics";

type Mode = "gemini" | "free" | "demo";

let msgCounter = 0;
const nextId = () => `local-${Date.now().toString(36)}-${++msgCounter}`;

function textOf(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// Snapshot of app state sent with every request (see AssistantContext)
function buildClientContext(): AssistantContext {
  const s = useBirgeStore.getState();
  const user = s.user;
  return {
    locale: s.locale,
    interests: user?.interests ?? [],
    budgetBand: user?.budgetBand ?? "mid",
    city: cityById[user?.city ?? "almaty"]?.nameEn ?? "Almaty",
    orders: s.orders.slice(0, 5).map((o) => ({
      title: productById[o.productId]?.titleRu ?? o.productId,
      mode: o.mode,
      totalKzt: o.totalKzt,
    })),
    openGroups: Object.values(s.groups)
      .filter((g) => g.status === "open" && user && g.members.some((m) => m.id === user.id))
      .map((g) => ({
        productTitle: productById[g.productId]?.titleRu ?? g.productId,
        count: g.members.length,
        min: g.minParticipants,
        priceKzt: g.currentTierPriceKzt,
      })),
  };
}

// [[prd_xx]] tokens in assistant replies become tappable product cards
function AssistantProductCard({ productId }: { productId: string }) {
  const { t, locale } = useI18n();
  const product = productById[productId];
  if (!product) return null;
  const best = product.priceTiers[product.priceTiers.length - 1].unitPriceKzt;
  return (
    <Link
      href={`/product/${product.id}`}
      className="my-1.5 flex items-center gap-2.5 rounded-xl border border-primary/15 bg-primary-light/40 p-2 transition active:scale-[0.98]"
    >
      <ProductImage product={product} className="h-11 w-11 shrink-0 rounded-lg" emojiClassName="text-xl" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">
          {localized(product as unknown as Record<string, unknown>, "title", locale)}
        </p>
        <p className="text-[11px] text-muted">
          <b className="text-primary-dark">{formatKzt(best)}</b> {t("group_short")} ·{" "}
          <span className="line-through">{formatKzt(product.soloPriceKzt)}</span>{" "}
          <span className="font-bold text-danger">−{pctOff(product.soloPriceKzt, best)}%</span>
        </p>
      </div>
      <span className="pr-1 text-muted">→</span>
    </Link>
  );
}

function AssistantText({ text }: { text: string }) {
  const segments = text.split(/(\[\[prd_\d+\]\])/g);
  return (
    <>
      {segments.map((seg, i) => {
        const token = seg.match(/^\[\[(prd_\d+)\]\]$/);
        if (token) return <AssistantProductCard key={i} productId={token[1]} />;
        if (!seg.trim()) return null;
        return (
          <span key={i} className="whitespace-pre-wrap">
            {seg}
          </span>
        );
      })}
    </>
  );
}

// S16 — AI assistant: free-model chain Gemini → keyless free API → offline mock
export default function AssistantPage() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useBirgeStore((s) => s.user);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode | null>(null);
  const mockMode = mode === "demo";
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant",
        body: () => ({ context: buildClientContext() }),
      }),
    []
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onError: () => {
      // free providers can rate-limit or the venue can be offline —
      // continue seamlessly with the deterministic local assistant (NFR-1)
      setMode("demo");
      setMessages((prev) => {
        const trimmed =
          prev.length > 0 && prev[prev.length - 1].role === "assistant" ? prev.slice(0, -1) : prev;
        const lastUser = [...trimmed].reverse().find((m) => m.role === "user");
        const state = useBirgeStore.getState();
        const reply = mockAssistantReply(
          lastUser ? textOf(lastUser) : "",
          state.locale,
          state.user,
          state.orders
        );
        return [
          ...trimmed,
          { id: nextId(), role: "assistant" as const, parts: [{ type: "text" as const, text: reply }] },
        ];
      });
    },
  });

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  useEffect(() => {
    track("assistant_opened", {});
    fetch("/api/assistant")
      .then((r) => r.json())
      .then((d: { mode: Mode }) => setMode((m) => m ?? d.mode))
      .catch(() => setMode("demo"));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  if (!user) return null;

  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    track("assistant_message", { mode: mode ?? "unknown" });
    if (mockMode) {
      const state = useBirgeStore.getState();
      const reply = mockAssistantReply(trimmed, state.locale, state.user, state.orders);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user" as const, parts: [{ type: "text" as const, text: trimmed }] },
        { id: nextId(), role: "assistant" as const, parts: [{ type: "text" as const, text: reply }] },
      ]);
      return;
    }
    void sendMessage({ text: trimmed });
  };

  const quickPrompts = [t("qp_recommend"), t("qp_group"), t("qp_delivery"), t("qp_order")];

  const modeChip =
    mode === "gemini" ? "Gemini ✨" : mode === "free" ? `✨ ${t("assistant_mode_free")}` : mode === "demo" ? `🤖 ${t("assistant_mode_demo")}` : "…";

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-5">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-lg text-white">
            ✨
          </span>
          {t("assistant_title")}
        </h1>
        <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-bold text-primary-dark">
          {modeChip}
        </span>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto no-scrollbar px-4 pb-3">
        {/* static welcome bubble */}
        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white p-3.5 text-sm shadow-sm">
          {t("assistant_welcome")}
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {quickPrompts.map((qp) => (
              <button key={qp} onClick={() => send(qp)} className="chip text-xs">
                {qp}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-primary p-3.5 text-sm text-white shadow-sm">
                {textOf(m)}
              </div>
            </div>
          ) : (
            <div key={m.id} className="max-w-[88%] rounded-2xl rounded-tl-md bg-white p-3.5 text-sm shadow-sm">
              <AssistantText text={textOf(m)} />
            </div>
          )
        )}

        {busy && (!messages.length || messages[messages.length - 1].role === "user" || !textOf(messages[messages.length - 1])) && (
          <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-md bg-white p-3.5 shadow-sm">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <div className="shrink-0 border-t border-black/5 bg-white px-4 pb-2 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("assistant_placeholder")}
            className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none placeholder:text-black/30 focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg text-white shadow transition active:scale-95 disabled:opacity-40"
            aria-label="Send"
          >
            ➤
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
