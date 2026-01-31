import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchProductBySlug, fetchProducts } from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/image";

export async function generateStaticParams() {
  const products = await fetchProducts();
  return products
    .filter((p: { slug?: { current?: string } }) => p.slug?.current)
    .map((p: { slug: { current: string } }) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Товар не найден" };
  return {
    title: product.title,
    description: product.description ?? `Купить ${product.title} в 2G Tech Lab`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  const imageUrl =
    (product as { imageUrl?: string }).imageUrl ??
    (product.images?.[0] ? urlFor(product.images[0]).width(800).height(800).url() : null);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/catalog"
          className="mb-6 inline-flex items-center text-sm text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Назад в каталог
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.title ?? "Товар"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--muted)]">
                Нет фото
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">{product.title}</h1>
            <p className="mt-4 text-2xl font-semibold text-[var(--accent)]">
              {product.price ? `${product.price} ₽` : "Цена по запросу"}
            </p>
            {product.description && (
              <p className="mt-6 text-[var(--muted)]">{product.description}</p>
            )}
            {product.category && (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Категория: {product.category}
              </p>
            )}
            {product.material && (
              <p className="text-sm text-[var(--muted)]">
                Материал: {product.material.toUpperCase()}
              </p>
            )}
            <Link
              href="/contacts"
              className="mt-8 inline-block rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Заказать
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
