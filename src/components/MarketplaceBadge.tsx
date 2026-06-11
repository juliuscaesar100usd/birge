import { marketplaceById } from "@/data/marketplaces";

export function MarketplaceBadge({
  marketplaceId,
  className = "",
}: {
  marketplaceId: string;
  className?: string;
}) {
  const mp = marketplaceById[marketplaceId];
  if (!mp) return null;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold text-white ${className}`}
      style={{ backgroundColor: mp.badgeColor }}
    >
      {mp.name}
    </span>
  );
}
