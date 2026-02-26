"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { urlFor } from "../lib/sanity/image";

type PortfolioItem = {
  _id: string;
  title?: string;
  description?: string;
  image?: { asset?: { _ref?: string } } | null;
  imageUrl?: string;
};

const OFFSETS = [
  { x: 0, y: 0, rotate: -3 },
  { x: 40, y: -20, rotate: 5 },
  { x: -30, y: 30, rotate: -8 },
  { x: 60, y: 20, rotate: 2 },
  { x: -50, y: -10, rotate: 6 },
  { x: 20, y: 50, rotate: -4 },
  { x: -40, y: 40, rotate: 3 },
  { x: 70, y: -30, rotate: -6 },
  { x: -60, y: 10, rotate: 4 },
  { x: 30, y: -40, rotate: -2 },
];

export default function PortfolioPile({ items }: { items: PortfolioItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((i) => i._id === selectedId);

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleBackdropClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-[var(--muted)]">
        Пока нет работ в портфолио
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px] py-12">
      <div
        className="relative mx-auto aspect-[4/3] max-w-4xl"
        style={{ perspective: "1000px" }}
      >
        {items.slice(0, 10).map((item, i) => {
          const offset = OFFSETS[i % OFFSETS.length];
          const isSelected = selectedId === item._id;
          const imageSrc = item.imageUrl ?? (item.image ? urlFor(item.image).width(800).height(600).url() : null);
          const isExternal = typeof imageSrc === "string" && imageSrc.startsWith("http");

          return (
            <motion.button
              key={item._id}
              type="button"
              className="absolute left-1/2 top-1/2 w-[45%] min-w-[140px] max-w-[280px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg border-2 border-[var(--border)] bg-[var(--card-bg)] shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              initial={false}
              animate={{
                x: isSelected ? 0 : offset.x,
                y: isSelected ? 0 : offset.y,
                rotate: isSelected ? 0 : offset.rotate,
                scale: isSelected ? 1.15 : 1,
                zIndex: isSelected ? 50 : 10 + i,
                opacity: selectedId && !isSelected ? 0.4 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={() => handleSelect(item._id)}
            >
              <div className="overflow-hidden rounded-md">
                <div className="relative aspect-[4/3] bg-[var(--border)]">
                  {imageSrc ? (
                    isExternal ? (
                      <img
                        src={imageSrc}
                        alt={item.title ?? "Работа"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={imageSrc}
                        alt={item.title ?? "Работа"}
                        fill
                        className="object-cover"
                        sizes="280px"
                      />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--muted)] text-sm">
                      Нет фото
                    </div>
                  )}
                </div>
                <div className="p-3 text-left">
                  <span className="font-medium text-[var(--foreground)] text-sm">{item.title}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-4 z-50 flex items-center justify-center md:inset-8"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-h-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video overflow-hidden rounded-lg bg-[var(--border)]">
                {(selected.imageUrl || selected.image) ? (
                  typeof (selected.imageUrl ??
                    (selected.image ? urlFor(selected.image).width(1200).height(675).url() : "")) === "string" &&
                  (selected.imageUrl ?? "").startsWith("http") ? (
                    <img
                      src={
                        selected.imageUrl ??
                        (selected.image ? urlFor(selected.image).width(1200).height(675).url() : "")
                      }
                      alt={selected.title ?? "Работа"}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Image
                      src={
                        selected.imageUrl ??
                        (selected.image ? urlFor(selected.image).width(1200).height(675).url() : "")
                      }
                      alt={selected.title ?? "Работа"}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 672px"
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--muted)]">Нет фото</div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-[var(--foreground)]">{selected.title}</h3>
                {selected.description && (
                  <p className="mt-2 text-[var(--muted)]">{selected.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleBackdropClick}
                className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                aria-label="Закрыть"
              >
                <span className="text-xl">×</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
