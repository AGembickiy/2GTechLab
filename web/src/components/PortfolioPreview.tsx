import Link from "next/link";
import Image from "next/image";
import { urlFor } from "../lib/sanity/image";

type PortfolioItem = {
  _id: string;
  title?: string;
  image?: { asset?: { _ref?: string } } | null;
  imageUrl?: string;
};

export default function PortfolioPreview({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) {
    return (
      <div className="mt-12 rounded-xl border border-dashed border-[var(--border)] py-16 text-center text-[var(--muted)]">
        Скоро здесь появятся наши работы
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const imageSrc = item.imageUrl ?? (item.image ? urlFor(item.image).width(600).height(400).url() : null);
        const isExternal = typeof imageSrc === "string" && imageSrc.startsWith("http");

        return (
          <Link
            key={item._id}
            href="/portfolio"
            className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)] transition-colors hover:border-[var(--accent)]/50"
          >
            <div className="relative aspect-[3/2] overflow-hidden bg-[var(--border)]">
              {imageSrc ? (
                isExternal ? (
                  <img
                    src={imageSrc}
                    alt={item.title ?? "Работа"}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <Image
                    src={imageSrc}
                    alt={item.title ?? "Работа"}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                )
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--muted)]">Нет фото</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">{item.title}</h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
