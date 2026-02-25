"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Review = {
  _id: string;
  authorName?: string;
  text?: string;
  rating?: number;
  date?: string;
};

export default function ReviewsSlider({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);
  const current = reviews[index];

  if (reviews.length === 0) return null;

  return (
    <div className="relative mx-auto mt-12 max-w-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current._id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-8"
        >
          <div className="mb-4 flex gap-1">
            {Array.from({ length: current.rating ?? 5 }).map((_, i) => (
              <span key={i} className="text-[var(--accent)]">★</span>
            ))}
          </div>
          <p className="text-lg text-[var(--foreground)]">&ldquo;{current.text}&rdquo;</p>
          <p className="mt-4 font-medium text-[var(--accent)]">{current.authorName}</p>
          {current.date && (
            <p className="text-sm text-[var(--muted)]">
              {new Date(current.date).toLocaleDateString("ru-RU")}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {reviews.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-[var(--accent)]" : "w-2 bg-[var(--border)] hover:bg-[var(--muted)]"
              }`}
              aria-label={`Отзыв ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
