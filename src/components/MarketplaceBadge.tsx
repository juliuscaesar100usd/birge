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
    <span className={`mk-badge ${className}`} style={{ backgroundColor: mp.badgeColor }}>
      <span className="mk-dot" />
      {mp.name}
    </span>
  );
}
