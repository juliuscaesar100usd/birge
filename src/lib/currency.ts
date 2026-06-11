// Spec §8: `15 000 ₸` — space thousands separator, ₸ suffix, integer tenge.
export function formatKzt(amount: number): string {
  const n = Math.round(amount);
  const formatted = new Intl.NumberFormat("ru-RU")
    .format(n)
    .replace(/[  ]/g, " ");
  return `${formatted} ₸`;
}

export function pctOff(solo: number, price: number): number {
  if (solo <= 0) return 0;
  return Math.round(((solo - price) / solo) * 100);
}
