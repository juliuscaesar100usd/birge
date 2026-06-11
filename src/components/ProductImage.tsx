"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

// Real local photo when available (scraped to /public/products at dev time),
// gradient + emoji as the offline-safe fallback (NFR-1). A photo that fails
// to load flips back to the fallback — the demo never shows a broken image.
export function ProductImage({
  product,
  className = "",
  emojiClassName = "text-6xl",
}: {
  product: Product;
  className?: string;
  emojiClassName?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(product.image) && !broken;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${product.gradient[0]}, ${product.gradient[1]})`,
      }}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt=""
          className="absolute inset-0 h-full w-full bg-white object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <>
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-black/10" />
          <span className={`drop-shadow-lg ${emojiClassName}`} aria-hidden>
            {product.emoji}
          </span>
        </>
      )}
    </div>
  );
}
