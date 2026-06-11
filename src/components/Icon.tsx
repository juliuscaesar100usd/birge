// 24×24 stroke icon set (design prompt §3). Stroke = currentColor unless overridden.
import type { ReactNode } from "react";

const P: Record<string, ReactNode> = {
  back: <path d="M15 18l-6-6 6-6" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  heart: (
    <path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.6 5 8.1 5c1.5 0 3 .7 3.9 2C12.9 5.7 14.4 5 15.9 5c2.5 0 4.6 2 4.6 4.6 0 3.7-3.5 6.9-8.5 10.9z" />
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="17" cy="20" r="1.6" />
      <path d="M3 4h2l2.4 11.2a1.5 1.5 0 001.5 1.2h7.6a1.5 1.5 0 001.5-1.2L20 8H6" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5A1.5 1.5 0 015.5 7H8l1.4-2h5.2L16 7h2.5A1.5 1.5 0 0120 8.5V17a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 17z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5V20h12V9.5" />
    </>
  ),
  catalog: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </>
  ),
  groups: (
    <>
      <circle cx="9" cy="9" r="3.2" />
      <circle cx="17" cy="10.5" r="2.4" />
      <path d="M3.5 19c.6-3 2.9-4.6 5.5-4.6s4.9 1.6 5.5 4.6" />
      <path d="M16 15.4c2.2.2 4 1.6 4.5 3.6" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.5 20c.9-4 4-5.8 7.5-5.8s6.6 1.8 7.5 5.8" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.8 2.8L16.5 9.5" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M5 13v6a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 19v-6" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4.5A1.5 1.5 0 013 13.5v-9A1.5 1.5 0 014.5 3h9A1.5 1.5 0 0115 4.5V5" />
    </>
  ),
  qr: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5z" />
    </>
  ),
  shield: <path d="M12 3l7.5 3v5.2c0 4.6-3.1 8.1-7.5 9.8-4.4-1.7-7.5-5.2-7.5-9.8V6z" />,
  sim: (
    <>
      <path d="M7 3h7l5 5v11.5A1.5 1.5 0 0117.5 21h-10A1.5 1.5 0 016 19.5v-15A1.5 1.5 0 017.5 3z" />
      <rect x="9" y="12" width="6" height="5" rx="1.2" />
    </>
  ),
  star: (
    <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  location: (
    <>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.7 2.5 4 5.5 4 9s-1.3 6.5-4 9c-2.7-2.5-4-5.5-4-9s1.3-6.5 4-9z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.4" />
      <path d="M3.5 20c.8-3.6 3.3-5.4 6-5.4s5.2 1.8 6 5.4" />
      <path d="M15.5 5.6a3.4 3.4 0 010 6" />
      <path d="M17.6 14.9c1.8.7 3 2.2 3.4 4.4" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" />
    </>
  ),
  sparkle: (
    <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4zM18.5 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" />
  ),
  bolt: <path d="M13 3L5 13.5h5.5L11 21l8-10.5h-5.5z" />,
  bell: (
    <>
      <path d="M6 16v-5.5a6 6 0 0112 0V16l1.5 2.5h-15z" />
      <path d="M10 19.5a2 2 0 004 0" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 11.5V5A1.5 1.5 0 015 3.5h6.5L20 12l-8 8z" />
      <circle cx="8" cy="8" r="1.4" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M12 9v11M4 13h16" />
      <path d="M12 9c-2 0-4.5-.6-4.5-2.7C7.5 4.6 9 4 10 4c1.8 0 2 2.6 2 5 0-2.4.2-5 2-5 1 0 2.5.6 2.5 2.3C16.5 8.4 14 9 12 9z" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6h11v10h-11z" />
      <path d="M13.5 9.5h4L21 13v3h-7.5" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M19.4 11A7.6 7.6 0 005.6 8.4M4.6 13a7.6 7.6 0 0013.8 2.6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5l1 2.4 2.6-.4 1 2.3 2.4 1-.4 2.6 1.9 1.6-1.9 1.6.4 2.6-2.4 1-1 2.3-2.6-.4-1 2.4-1-2.4-2.6.4-1-2.3-2.4-1 .4-2.6L3.5 12l1.9-1.6L5 7.8l2.4-1 1-2.3 2.6.4z" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.5" />
    </>
  ),
  /* category icons */
  elec: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M11 17.5h2" />
    </>
  ),
  homecat: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  appliances: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <circle cx="12" cy="13" r="4" />
      <path d="M8 6.5h3" />
    </>
  ),
  grocery: (
    <>
      <path d="M5 8h14l-1.3 11a2 2 0 01-2 1.8H8.3a2 2 0 01-2-1.8z" />
      <path d="M9 10V6.5a3 3 0 016 0V10" />
    </>
  ),
  fashion: (
    <path d="M9 4L4.5 7.5 6.5 10l1.8-1v11h7.4V9l1.8 1 2-2.5L15 4a3 3 0 01-6 0z" />
  ),
  beauty: (
    <>
      <path d="M9.5 3.5h5V8h-5z" />
      <rect x="8" y="8" width="8" height="12.5" rx="2" />
      <path d="M12 12v4" />
    </>
  ),
  kids: (
    <>
      <circle cx="12" cy="13" r="6.5" />
      <circle cx="6.7" cy="6.5" r="2.4" />
      <circle cx="17.3" cy="6.5" r="2.4" />
      <path d="M9.8 14.5c.6.9 1.3 1.3 2.2 1.3s1.6-.4 2.2-1.3" />
    </>
  ),
  sports: (
    <>
      <path d="M6.5 6.5l11 11" />
      <rect x="2.5" y="8.5" width="4" height="7" rx="1.4" transform="rotate(-45 4.5 12)" />
      <rect x="17.5" y="8.5" width="4" height="7" rx="1.4" transform="rotate(-45 19.5 12)" />
    </>
  ),
  accessories: (
    <>
      <rect x="4.5" y="8" width="15" height="12" rx="2.5" />
      <path d="M9 8V6.5A3 3 0 0112 3.5a3 3 0 013 3V8" />
    </>
  ),
};

export function Icon({
  name,
  size = 24,
  sw = 2,
  color,
  fill = false,
  className,
}: {
  name: string;
  size?: number;
  sw?: number;
  color?: string;
  fill?: boolean;
  className?: string;
}) {
  const node = P[name] ?? P.info;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? color ?? "currentColor" : "none"}
      stroke={fill ? "none" : color ?? "currentColor"}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {node}
    </svg>
  );
}
