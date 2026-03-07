/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;

