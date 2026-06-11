// PRD §8 instrumentation plan. Demo sink: console + localStorage ring buffer.
export type AnalyticsEvent =
  | "register_started"
  | "identity_verified"
  | "interests_selected"
  | "feed_viewed"
  | "product_viewed"
  | "group_started"
  | "group_joined"
  | "invite_sent"
  | "threshold_reached"
  | "order_confirmed"
  | "coupon_used"
  | "assistant_opened"
  | "assistant_message"
  | "marketplace_link_opened"
  | "identity_step_up"
  | "identity_panel_viewed";

const KEY = "birge-analytics";
const MAX_EVENTS = 200;

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const entry = { event, props, ts: new Date().toISOString() };
  console.log("[birge:analytics]", entry);
  try {
    const buf = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as unknown[];
    buf.push(entry);
    window.localStorage.setItem(KEY, JSON.stringify(buf.slice(-MAX_EVENTS)));
  } catch {
    // analytics must never break the demo
  }
}
