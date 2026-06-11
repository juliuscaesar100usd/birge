// Zigle brand mark (design prompt §8): rounded tile, Z stroke, coral underline —
// the "price drops as you group" idea.
export function ZigleMark({ size = 40, inverse = false }: { size?: number; inverse?: boolean }) {
  const tile = inverse ? "#FFFFFF" : "url(#zigleTile)";
  const z = inverse ? "#1668E3" : "#FFFFFF";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="zigleTile" x1="24" y1="0" x2="24" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2E86F5" />
          <stop offset="1" stopColor="#1668E3" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13.5" fill={tile} />
      <path
        d="M15 16 H33 L15 32 H33"
        stroke={z}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 32 H33" stroke="#FF5A2C" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function ZigleLogo({
  size = 24,
  color = "#15181D",
  inverse = false,
}: {
  size?: number;
  color?: string;
  inverse?: boolean;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.38 }}>
      <ZigleMark size={size * 1.16} inverse={inverse} />
      <span
        style={{
          fontWeight: 800,
          fontSize: size,
          letterSpacing: "-1px",
          color,
          lineHeight: 1,
        }}
      >
        Zigle
      </span>
    </span>
  );
}
