"use client";

import { Plus } from "lucide-react";
import { WishButton } from "./WishButton";
import { flyToCart } from "@/components/birds/CartFlight";
import { useCart, useToast } from "@/lib/store";
import type { Product, Variant } from "@/lib/types";

export function CardActions({ product, variant, inStock }: { product: Product; variant: Variant; inStock: boolean }) {
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.push);
  return (
    <>
      <WishButton
        className="absolute end-2 top-2 bg-lemon-50/90"
        item={{ slug: product.slug, name: product.name, art: product.art, image: product.images[0], price: variant.price, compareAt: variant.compareAt }}
      />
      {inStock && (
        <button
          type="button"
          aria-label={`افزودن ${product.name} (${variant.label}) به سبد`}
          onClick={(e) => {
            add({
              slug: product.slug,
              name: product.name,
              art: product.art,
              image: product.images[0],
              price: variant.price,
              compareAt: variant.compareAt,
              variantId: variant.id,
              variantLabel: `${product.variantLabel}: ${variant.label}`,
              stock: variant.stock,
            });
            flyToCart(e.currentTarget);
            toast(`«${product.name}» به سبد اضافه شد`);
          }}
          className="absolute end-2 bottom-2 grid size-11 place-items-center rounded-full bg-olive-700 text-lemon-50 transition-colors hover:bg-olive-800 active:scale-95"
        >
          <Plus className="size-5" aria-hidden="true" />
        </button>
      )}
    </>
  );
}
