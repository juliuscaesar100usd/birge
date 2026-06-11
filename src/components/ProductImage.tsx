import type { Product } from "@/lib/types";

// Offline-safe product art: gradient + emoji instead of external images (NFR-1)
export function ProductImage({
  product,
  className = "",
  emojiClassName = "text-6xl",
}: {
  product: Product;
  className?: string;
  emojiClassName?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${product.gradient[0]}, ${product.gradient[1]})`,
      }}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-black/10" />
      <span className={`drop-shadow-lg ${emojiClassName}`} aria-hidden>
        {product.emoji}
      </span>
    </div>
  );
}
