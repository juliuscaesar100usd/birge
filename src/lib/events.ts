// Tiny in-app toast bus: store actions publish, ToastHost subscribes.
export type ToastKind = "info" | "success" | "gold";

export interface Toast {
  id: string;
  kind: ToastKind;
  msgKey: string;
  params?: Record<string, string | number>;
}

type Listener = (toast: Toast) => void;
const listeners = new Set<Listener>();
let counter = 0;

export function onToast(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitToast(
  kind: ToastKind,
  msgKey: string,
  params?: Record<string, string | number>
) {
  const toast: Toast = { id: `t${++counter}-${Date.now()}`, kind, msgKey, params };
  listeners.forEach((fn) => fn(toast));
}
