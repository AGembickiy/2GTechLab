import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchBlogPostBySlug, fetchBlogPosts } from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/image";
import PortableText from "@/components/PortableText";

export async function generateStaticParams() {
  const posts = await fetchBlogPosts();
  return posts
    .filter((p: { slug?: { current?: string } }) => p.slug?.current)
    .map((p: { slug: { current: string } }) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  if (!post) return { title: "Статья не найдена" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) notFound();

  const imageUrl =
    (post as { coverImageUrl?: string }).coverImageUrl ??
    (post.coverImage ? urlFor(post.coverImage).width(1200).height(630).url() : null);

  return (
    <article className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center text-sm text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Назад к статьям
        </Link>

        <h1 className="text-4xl font-bold text-[var(--foreground)]">{post.title}</h1>
        {(post.publishedAt || post.author) && (
          <p className="mt-4 text-[var(--muted)]">
            {post.author && <span>{post.author}</span>}
            {post.author && post.publishedAt && " · "}
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("ru-RU")}
              </time>
            )}
          </p>
        )}

        {imageUrl && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-xl">
            <Image
              src={imageUrl}
              alt={post.title ?? "Обложка"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
        )}

        <div className="mt-8">
          {post.content ? (
            <PortableText value={post.content} />
          ) : (
            post.excerpt && <p className="text-lg text-[var(--muted)]">{post.excerpt}</p>
          )}
        </div>
      </div>
    </article>
  );
}
