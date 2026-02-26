export const servicesQuery = `*[_type == "service"] | order(order asc)`;
export const productsQuery = `*[_type == "product"] | order(_createdAt desc)`;
export const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0]`;
export const portfolioQuery = `*[_type == "portfolioItem"] | order(order asc)`;
export const portfolioPreviewQuery = `*[_type == "portfolioItem"] | order(order asc)[0...4]`;
export const blogPostsQuery = `*[_type == "blogPost"] | order(publishedAt desc)`;
export const blogPostBySlugQuery = `*[_type == "blogPost" && slug.current == $slug][0]`;
export const faqQuery = `*[_type == "faq"] | order(order asc)`;
export const reviewsQuery = `*[_type == "review" && approved == true] | order(date desc)`;
export const siteSettingsQuery = `*[_type == "siteSettings"][0]`;
export const featuredProductsQuery = `*[_type == "product" && featured == true][0...4]`;
export const heroSliderQuery = `*[_type == "heroSlider"][0]{
  items | order(order asc){
    image,
    "alt": alt,
    "order": order
  }
}`;
