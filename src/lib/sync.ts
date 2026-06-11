// Cross-tab "realtime": tab A mutates the persisted store and broadcasts;
// tab B rehydrates from localStorage and replays the toasts. A second browser
// tab thus acts as the "second device" from TRD §7.3.
export interface SyncMessage {
  t: "sync";
  toasts?: { kind: "info" | "success" | "gold"; msgKey: string; params?: Record<string, string | number> }[];
}

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) channel = new BroadcastChannel("birge-sync");
  return channel;
}

export function broadcastSync(toasts?: SyncMessage["toasts"]) {
  getChannel()?.postMessage({ t: "sync", toasts } satisfies SyncMessage);
}

export function listenSync(fn: (msg: SyncMessage) => void): () => void {
  const ch = getChannel();
  if (!ch) return () => {};
  const handler = (e: MessageEvent<SyncMessage>) => fn(e.data);
  ch.addEventListener("message", handler);
  return () => ch.removeEventListener("message", handler);
}
