"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { categoryById } from "@/data/categories";

// Real local photo when available (scraped from the marketplace listing at dev
// time), else the styled placeholder tile: category tint + 45° stripes + emoji.
// A photo that fails to load flips back to the tile — never a broken image (NFR-1).
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
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(product.image) && !broken;
  // Only add `relative` when the caller didn't pass its own position (e.g.
  // ProductCard passes `absolute inset-0`); otherwise the duplicate position
  // utilities collide and the tile collapses, hiding the photo.
  const pos = /(^|\s)(absolute|fixed|relative)(\s|$)/.test(className) ? "" : "relative";

  return (
    <div
      className={`${pos} flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: cat?.tint ?? "#EEF0F4" }}
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
        </>
      )}
    </div>
  );
}
