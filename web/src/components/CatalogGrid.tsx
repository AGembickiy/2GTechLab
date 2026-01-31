"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";

type Product = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  description?: string;
  price?: number;
  category?: string;
  material?: string;
  images?: Array<{ asset?: { _ref?: string } }>;
  imageUrl?: string;
};

type CatalogGridProps = {
  products: Product[];
  categories: { value: string; label: string }[];
  materials: { value: string; label: string }[];
};

export default function CatalogGrid({ products, categories, materials }: CatalogGridProps) {
  const [category, setCategory] = useState("all");
  const [material, setMaterial] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (material !== "all" && p.material !== material) return false;
      if (maxPrice !== "" && (p.price ?? 0) > maxPrice) return false;
      return true;
    });
  }, [products, category, material, maxPrice]);

  const getImageUrl = (p: Product) => {
    if (p.imageUrl) return p.imageUrl;
    if (p.images?.[0]) return urlFor(p.images[0]).width(400).height(400).url();
    return null;
  };

  return (
    <div className="mt-12">
      <div className="mb-8 flex flex-wrap gap-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Категория</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Материал</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            {materials.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--muted)]">Макс. цена (₽)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
            placeholder="Не ограничено"
            className="w-32 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-16 text-center text-[var(--muted)]">
          Нет товаров по выбранным фильтрам
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => {
            const slug = product.slug?.current ?? product._id;
            const imageUrl = getImageUrl(product);
            return (
              <Link
                key={product._id}
                href={`/catalog/${slug}`}
                className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)] transition-colors hover:border-[var(--accent)]/50"
              >
                <div className="relative aspect-square overflow-hidden bg-[var(--border)]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.title ?? "Товар"}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--muted)]">
                      Нет фото
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-lg font-semibold text-[var(--accent)]">
                    {product.price ? `${product.price} ₽` : "Цена по запросу"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
