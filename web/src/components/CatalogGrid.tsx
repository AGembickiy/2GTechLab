"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "../lib/sanity/image";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    <div className="mt-12 relative" onClick={() => setSelectedId(null)}>
      {/* Backdrop for selected card */}
      {selectedId && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedId(null)}
        />
      )}

      <div 
        className="mb-8 flex flex-wrap gap-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4"
        onClick={(e) => e.stopPropagation()}
      >
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
            const isSelected = selectedId === product._id;

            return (
              <div
                key={product._id}
                className={`relative transition-all duration-300 ${
                  isSelected ? "z-50 scale-110" : "z-0"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(isSelected ? null : product._id);
                }}
              >
                <div
                  className={`group overflow-hidden rounded-xl border bg-[var(--card-bg)] transition-all ${
                    isSelected 
                      ? "border-[var(--accent)] shadow-2xl" 
                      : "border-[var(--border)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-[var(--border)]">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.title ?? "Товар"}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
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
                    
                    {isSelected && (
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/catalog/${slug}`}
                          className="flex-1 rounded-lg bg-[var(--accent)] py-2 text-center text-sm font-medium text-white hover:bg-[var(--accent)]/90"
                        >
                          Подробнее
                        </Link>
                        <button
                          onClick={() => setSelectedId(null)}
                          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]/10"
                        >
                          Закрыть
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
