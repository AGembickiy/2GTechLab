import Link from "next/link";
import Image from "next/image";
import { fetchBlogPosts } from "../../lib/sanity/fetch";
import { urlFor } from "../../lib/sanity/image";

export const metadata = {
  title: "Блог",
  description: "Статьи о 3D-печати, материалах, технологиях и кейсах наших проектов.",
};

export default async function BlogPage() {
  const posts = await fetchBlogPosts();

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">Блог</h1>
        <p className="mt-4 text-[var(--muted)]">
          Полезные статьи и кейсы о 3D-печати
        </p>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-[var(--border)] py-16 text-center text-[var(--muted)]">
            Скоро здесь появятся статьи
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: { _id: string; slug?: { current?: string }; title?: string; excerpt?: string; publishedAt?: string; coverImage?: unknown; coverImageUrl?: string }) => {
              const slug = post.slug?.current ?? post._id;
              const imageUrl = (post as { coverImageUrl?: string }).coverImageUrl ?? (post.coverImage ? urlFor(post.coverImage).width(600).height(400).url() : null);
              return (
                <Link
                  key={post._id}
                  href={`/blog/${slug}`}
                  className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)] transition-colors hover:border-[var(--accent)]/50"
                >
                  {imageUrl && (
                    <div className="relative aspect-video overflow-hidden bg-[var(--border)]">
                      <Image
                        src={imageUrl}
                        alt={post.title ?? "Статья"}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                        {post.excerpt}
                      </p>
                    )}
                    {post.publishedAt && (
                      <p className="mt-4 text-xs text-[var(--muted)]">
                        {new Date(post.publishedAt).toLocaleDateString("ru-RU")}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
