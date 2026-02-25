"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FaqItem = {
  _id: string;
  question?: string;
  answer?: string;
};

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.question?.toLowerCase().includes(q) ||
        item.answer?.toLowerCase().includes(q)
    );
  }, [items, search]);

  if (items.length === 0) {
    return (
      <div className="mt-12 rounded-xl border border-dashed border-[var(--border)] py-16 text-center text-[var(--muted)]">
        Пока нет вопросов в FAQ
      </div>
    );
  }

  return (
    <div className="mt-12">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по вопросам..."
        className="mb-8 w-full rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
        aria-label="Поиск"
      />

      {filtered.length === 0 ? (
        <p className="text-center text-[var(--muted)]">Ничего не найдено</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const isOpen = openId === item._id;
            return (
              <div
                key={item._id}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item._id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[var(--background)]/50"
                >
                  <span className="font-medium text-[var(--foreground)]">
                    {item.question}
                  </span>
                  <span
                    className={`ml-4 shrink-0 text-xl transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t border-[var(--border)] px-6 py-4 text-[var(--muted)]">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
