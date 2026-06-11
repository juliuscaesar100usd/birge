import { Icon } from "@/components/Icon";

export function Stars({
  value,
  reviews,
  size = 13,
}: {
  value: number;
  reviews?: number;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon name="star" size={size} fill color="#FFB800" />
      <span className="num" style={{ fontSize: size, fontWeight: 700, color: "var(--color-ink)" }}>
        {value.toFixed(1)}
      </span>
      {reviews !== undefined && (
        <span className="num" style={{ fontSize: size - 1, fontWeight: 500, color: "var(--color-muted)" }}>
          ({reviews})
        </span>
      )}
    </span>
  );
}
