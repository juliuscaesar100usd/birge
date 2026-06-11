const COLORS = ["#00a3c4", "#f5b301", "#7b2fbe", "#1fa463", "#e5484d", "#005bff", "#f77b00"];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({
  name,
  highlight = false,
  size = "h-10 w-10 text-sm",
}: {
  name: string;
  highlight?: boolean;
  size?: string;
}) {
  const initial =
    name.replace(/[^\p{L}\p{N}]/gu, "").charAt(0).toUpperCase() || "👤";
  const color = COLORS[hashCode(name) % COLORS.length];
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${size} ${
        highlight ? "ring-2 ring-accent ring-offset-2" : ""
      }`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initial}
    </div>
  );
}
