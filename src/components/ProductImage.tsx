import type { Product } from "@/lib/types";
import { categoryById } from "@/data/categories";

// Styled placeholder tile (design prompt §3): category tint + subtle 45°
// stripes + big product emoji — offline-safe, no real photos (NFR-1).
export function ProductImage({
  product,
  className = "",
  emojiClassName = "text-6xl",
}: {
  product: Product;
  className?: string;
  emojiClassName?: string;
}) {
  const cat = categoryById[product.categoryId];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: cat?.tint ?? "#EEF0F4" }}
    >
      <div
        className="pimg__stripes"
        style={{
          background:
            "repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,.6) 12px 21px)",
        }}
      />
      <span className={`relative drop-shadow-sm ${emojiClassName}`} aria-hidden>
        {product.emoji}
      </span>
    </div>
  );
}
