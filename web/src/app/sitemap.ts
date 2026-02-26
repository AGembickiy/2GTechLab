import { MetadataRoute } from "next";
import { fetchProducts, fetchBlogPosts } from "../lib/sanity/fetch";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://2gtechlab.ru";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([fetchProducts(), fetchBlogPosts()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE_URL}/catalog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/portfolio`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/contacts`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p: { _id: string; slug?: { current?: string } }) => ({
    url: `${BASE_URL}/catalog/${p.slug?.current ?? p._id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p: { _id: string; slug?: { current?: string }; publishedAt?: string }) => ({
    url: `${BASE_URL}/blog/${p.slug?.current ?? p._id}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...blogPages];
}
