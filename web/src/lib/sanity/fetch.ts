import { client } from "./client";
import {
  servicesQuery,
  productsQuery,
  portfolioQuery,
  portfolioPreviewQuery,
  blogPostsQuery,
  faqQuery,
  reviewsQuery,
  siteSettingsQuery,
  featuredProductsQuery,
} from "./queries";
import {
  mockServices,
  mockPortfolio,
  mockProducts,
  mockBlogPosts,
  mockFaq,
  mockReviews,
  mockSiteSettings,
} from "@/lib/mockData";

const hasSanity = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder";

export async function fetchServices() {
  if (!hasSanity) return mockServices;
  const data = await client.fetch(servicesQuery);
  return data?.length ? data : mockServices;
}

export async function fetchProducts() {
  if (!hasSanity) return mockProducts;
  const data = await client.fetch(productsQuery);
  return data?.length ? data : mockProducts;
}

export async function fetchProductBySlug(slug: string) {
  if (!hasSanity) return mockProducts.find((p) => p.slug?.current === slug) ?? null;
  return client.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug });
}

export async function fetchPortfolio(limit?: number) {
  if (!hasSanity) return limit ? mockPortfolio.slice(0, limit) : mockPortfolio;
  const query = limit ? portfolioPreviewQuery : portfolioQuery;
  const data = await client.fetch(query);
  return data?.length ? data : (limit ? mockPortfolio.slice(0, limit) : mockPortfolio);
}

export async function fetchBlogPosts() {
  if (!hasSanity) return [];
  const data = await client.fetch(blogPostsQuery);
  return data ?? [];
}

export async function fetchBlogPostBySlug(slug: string) {
  if (!hasSanity) return null;
  return client.fetch(`*[_type == "blogPost" && slug.current == $slug][0]`, { slug });
}

export async function fetchFaq() {
  if (!hasSanity) return [];
  const data = await client.fetch(faqQuery);
  return data ?? [];
}

export async function fetchReviews() {
  if (!hasSanity) return mockReviews;
  const data = await client.fetch(reviewsQuery);
  return data?.length ? data : mockReviews;
}

export async function fetchSiteSettings() {
  if (!hasSanity) return mockSiteSettings;
  const data = await client.fetch(siteSettingsQuery);
  return data ?? mockSiteSettings;
}

export async function fetchFeaturedProducts() {
  if (!hasSanity) return mockProducts.slice(0, 2);
  const data = await client.fetch(featuredProductsQuery);
  return data?.length ? data : mockProducts.slice(0, 2);
}
